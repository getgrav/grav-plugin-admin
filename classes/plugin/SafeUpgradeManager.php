<?php

/**
 * @package    Grav\Plugin\Admin
 *
 * Handles Safe Upgrade orchestration for the Admin plugin.
 *
 * This class mirrors the behaviour offered by the CLI `bin/gpm self-upgrade`
 * command while exposing a task-oriented API suitable for AJAX interactions.
 *
 * IMPORTANT: Keep this implementation aligned with
 * `Grav\Console\Gpm\SelfupgradeCommand` whenever logic changes there.
 */

namespace Grav\Plugin\Admin;

use Grav\Common\Config\Config;
use Grav\Common\Filesystem\Folder;
use Grav\Common\GPM\Installer;
use Grav\Common\GPM\GPM;
use Grav\Common\GPM\Upgrader;
use Grav\Common\Grav;
use Grav\Common\HTTP\Response;
use Grav\Common\Recovery\RecoveryManager;
use Grav\Common\Upgrade\SafeUpgradeService;
use Grav\Common\Utils;
use Grav\Installer\Install;
use Grav\Common\Yaml;
use Symfony\Component\Process\PhpExecutableFinder;
use Symfony\Component\Process\Process;
use RuntimeException;
use Throwable;
use ZipArchive;
use function class_exists;
use function dirname;
use function file_exists;
use function file_get_contents;
use function file_put_contents;
use function array_key_exists;
use function glob;
use function iterator_to_array;
use function is_array;
use function is_dir;
use function is_file;
use function is_link;
use function json_decode;
use function json_encode;
use function max;
use function preg_match;
use function rsort;
use function sprintf;
use function strftime;
use function strtotime;
use function time;
use function uniqid;
use function strtolower;
use function strpos;
use const GRAV_ROOT;
use const GRAV_SCHEMA;

class SafeUpgradeManager
{
    private const PROGRESS_FILENAME = 'safe-upgrade-progress.json';
    private const JOB_MANIFEST = 'manifest.json';
    private const JOB_PROGRESS = 'progress.json';

    /** @var Grav */
    private $grav;
    /** @var Upgrader|null */
    private $upgrader;
    /** @var SafeUpgradeService|null */
    private $safeUpgrade;
    /** @var RecoveryManager */
    private $recovery;
    /** @var string */
    private $progressDir;
    /** @var string */
    private $jobsDir;
    /** @var \Psr\Log\LoggerInterface|null */
    private $logger;
    /** @var string|null */
    private $jobId;
    /** @var string|null */
    private $jobManifestPath;
    /** @var string */
    private $progressPath;
    /** @var string|null */
    private $tmp;
    /** @var array */
    private $preflightDecisions = [];

    /**
     * SafeUpgradeManager constructor.
     *
     * @param Grav|null $grav
     */
    public function __construct(?Grav $grav = null)
    {
        $this->grav = $grav ?? Grav::instance();
        $this->recovery = $this->grav['recovery'];
        $this->logger = $this->grav['log'] ?? null;

        $locator = $this->grav['locator'];
        $this->progressDir = $locator->findResource('user://data/upgrades', true, true);
        $this->jobsDir = $this->progressDir . '/jobs';

        Folder::create($this->jobsDir);

        $this->setJobId(null);
    }

    protected function setJobId(?string $jobId): void
    {
        $this->jobId = $jobId ?: null;

        if ($this->jobId) {
            $jobDir = $this->getJobDir($this->jobId);
            Folder::create($jobDir);
            $this->jobManifestPath = $jobDir . '/' . self::JOB_MANIFEST;
            $this->progressPath = $jobDir . '/' . self::JOB_PROGRESS;
            $this->log(sprintf('Safe upgrade job %s activated', $this->jobId), 'debug');
        } else {
            $this->jobManifestPath = null;
            $this->progressPath = $this->progressDir . '/' . self::PROGRESS_FILENAME;
            $this->log('Safe upgrade job context cleared', 'debug');
        }
    }

    public function clearJobContext(): void
    {
        $this->setJobId(null);
    }

    /**
     * @return array<int, array{id: string, label:?string, source_version:?string, target_version:?string, created_at:int, created_at_iso:?string, backup_path:?string, package_path:?string}>
     */
    public function listSnapshots(): array
    {
        $manifestDir = GRAV_ROOT . '/user/data/upgrades';
        if (!is_dir($manifestDir)) {
            return [];
        }

        $files = glob($manifestDir . '/*.json') ?: [];
        rsort($files);

        $snapshots = [];
        foreach ($files as $file) {
            $decoded = json_decode(file_get_contents($file) ?: '', true);
            if (!is_array($decoded) || empty($decoded['id'])) {
                continue;
            }

            $createdAt = isset($decoded['created_at']) ? (int)$decoded['created_at'] : 0;

            $snapshots[] = [
                'id' => (string)$decoded['id'],
                'label' => isset($decoded['label']) && $decoded['label'] !== '' ? (string)$decoded['label'] : null,
                'source_version' => $decoded['source_version'] ?? null,
                'target_version' => $decoded['target_version'] ?? null,
                'created_at' => $createdAt,
                'created_at_iso' => $createdAt > 0 ? date('c', $createdAt) : null,
                'backup_path' => $decoded['backup_path'] ?? null,
                'package_path' => $decoded['package_path'] ?? null,
            ];
        }

        return $snapshots;
    }

    public function hasSnapshots(): bool
    {
        return !empty($this->listSnapshots());
    }

    /**
     * @param string $snapshotId
     * @return array{status:string,message:?string,manifest:array|null}
     */
    public function restoreSnapshot(string $snapshotId): array
    {
        if (!$this->isSafeUpgradeEnabled()) {
            return [
                'status' => 'error',
                'message' => 'Safe upgrade is disabled in configuration.',
                'manifest' => null,
            ];
        }

        try {
            $safeUpgrade = $this->getSafeUpgradeService();
            $manifest = $safeUpgrade->rollback($snapshotId);
        } catch (RuntimeException $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'manifest' => null,
            ];
        } catch (Throwable $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'manifest' => null,
            ];
        }

        if (!$manifest) {
            return [
                'status' => 'error',
                'message' => sprintf('Snapshot %s not found.', $snapshotId),
                'manifest' => null,
            ];
        }

        return [
            'status' => 'success',
            'message' => null,
            'manifest' => $manifest,
        ];
    }

    public function queueRestore(string $snapshotId): array
    {
        $snapshotId = trim($snapshotId);
        if ($snapshotId === '') {
            return [
                'status' => 'error',
                'message' => 'Snapshot identifier is required.',
            ];
        }

        $manifestPath = GRAV_ROOT . '/user/data/upgrades/' . $snapshotId . '.json';
        if (!is_file($manifestPath)) {
            return [
                'status' => 'error',
                'message' => sprintf('Snapshot %s not found.', $snapshotId),
            ];
        }

        return $this->queue([
            'operation' => 'restore',
            'snapshot_id' => $snapshotId,
        ]);
    }

    public function queueSnapshot(?string $label = null): array
    {
        $options = [
            'operation' => 'snapshot',
        ];

        if (null !== $label) {
            $label = trim((string)$label);
            if ($label !== '') {
                $options['label'] = $label;
            }
        }

        return $this->queue($options);
    }

    /**
     * @param array<int, string> $snapshotIds
     * @return array<int, array{id:string,status:string,message:?string}>
     */
    public function deleteSnapshots(array $snapshotIds): array
    {
        $ids = array_values(array_unique(array_filter(array_map('strval', $snapshotIds))));
        $results = [];

        foreach ($ids as $id) {
            $results[] = $this->deleteSnapshot($id);
        }

        return $results;
    }

    /**
     * @param string $snapshotId
     * @return array{id:string,status:string,message:?string}
     */
    protected function deleteSnapshot(string $snapshotId): array
    {
        $manifestDir = GRAV_ROOT . '/user/data/upgrades';
        $manifestPath = $manifestDir . '/' . $snapshotId . '.json';

        if (!is_file($manifestPath)) {
            return [
                'id' => $snapshotId,
                'status' => 'error',
                'message' => sprintf('Snapshot %s not found.', $snapshotId),
            ];
        }

        $manifest = json_decode(file_get_contents($manifestPath) ?: '', true);
        if (!is_array($manifest)) {
            return [
                'id' => $snapshotId,
                'status' => 'error',
                'message' => sprintf('Snapshot %s manifest is corrupted.', $snapshotId),
            ];
        }

        $errors = [];
        foreach (['package_path', 'backup_path'] as $key) {
            $path = isset($manifest[$key]) ? (string)$manifest[$key] : '';
            if ($path === '' || !file_exists($path)) {
                continue;
            }

            try {
                if (is_dir($path)) {
                    Folder::delete($path);
                } else {
                    @unlink($path);
                }
            } catch (Throwable $e) {
                $errors[] = $e->getMessage();
            }
        }

        if (!@unlink($manifestPath)) {
            $errors[] = sprintf('Unable to delete manifest file %s.', $manifestPath);
        }

        if ($errors) {
            return [
                'id' => $snapshotId,
                'status' => 'error',
                'message' => implode(' ', $errors),
            ];
        }

        return [
            'id' => $snapshotId,
            'status' => 'success',
            'message' => sprintf('Snapshot %s removed.', $snapshotId),
        ];
    }

    protected function getJobDir(string $jobId): string
    {
        return $this->jobsDir . '/' . $jobId;
    }

    protected function generateJobId(): string
    {
        return 'job-' . gmdate('YmdHis') . '-' . substr(md5(uniqid('', true)), 0, 8);
    }

    protected function log(string $message, string $level = 'info'): void
    {
        if (!$this->logger) {
            return;
        }

        try {
            if (method_exists($this->logger, $level)) {
                $this->logger->$level('[SafeUpgrade] ' . $message);
            } else {
                $this->logger->info('[SafeUpgrade] ' . $message);
            }
        } catch (Throwable $e) {
            // ignore logging errors
        }
    }

    protected function writeManifest(array $data): void
    {
        if (!$this->jobManifestPath) {
            return;
        }

        try {
            $existing = [];
            if (is_file($this->jobManifestPath)) {
                $decoded = json_decode((string)file_get_contents($this->jobManifestPath), true);
                if (is_array($decoded)) {
                    $existing = $decoded;
                }
            }

            $payload = $existing + [
                'id' => $this->jobId,
                'created_at' => time(),
            ];

            $payload = array_merge($payload, $data, [
                'updated_at' => time(),
            ]);

            Folder::create(dirname($this->jobManifestPath));
            file_put_contents($this->jobManifestPath, json_encode($payload, JSON_PRETTY_PRINT));
            if (!empty($data['status'])) {
                $this->log(sprintf('Job %s status -> %s', $payload['id'] ?? $this->jobId ?? 'unknown', $data['status']), 'debug');
            }
        } catch (Throwable $e) {
            // ignore manifest write failures
        }
    }

    public function updateJob(array $data): void
    {
        $this->writeManifest($data);
    }

    public function ensureJobResult(array $result): void
    {
        if (!$this->jobManifestPath) {
            return;
        }

        $status = $result['status'] ?? null;
        $progress = $this->getProgress();

        if ($status === 'success') {
            $targetVersion = $result['version'] ?? ($result['manifest']['target_version'] ?? null);
            $manifest = $result['manifest'] ?? null;

            if (($progress['stage'] ?? null) !== 'complete') {
                $extras = [];
                if ($targetVersion !== null) {
                    $extras['target_version'] = $targetVersion;
                }
                if ($manifest !== null) {
                    $extras['manifest'] = $manifest;
                }

                $this->setProgress('complete', 'Upgrade complete.', 100, $extras);
                $progress = $this->getProgress();
            }

            $this->updateJob([
                'status' => 'success',
                'completed_at' => time(),
                'result' => $result,
                'progress' => $progress,
            ]);

            return;
        }

        if ($status === 'error') {
            $message = $result['message'] ?? 'Safe upgrade failed.';
            if (($progress['stage'] ?? null) !== 'error') {
                $this->setProgress('error', $message, null, ['message' => $message]);
                $progress = $this->getProgress();
            }

            $this->updateJob([
                'status' => 'error',
                'completed_at' => time(),
                'result' => $result,
                'progress' => $progress,
                'error' => $message,
            ]);

            return;
        }

        if ($status === 'noop' || $status === 'finalized') {
            if (($progress['stage'] ?? null) !== 'complete') {
                $this->setProgress('complete', $progress['message'] ?? 'Upgrade complete.', 100, [
                    'target_version' => $result['version'] ?? null,
                    'manifest' => $result['manifest'] ?? null,
                ]);
                $progress = $this->getProgress();
            }

            $this->updateJob([
                'status' => $status,
                'completed_at' => time(),
                'result' => $result,
                'progress' => $progress,
            ]);
        }
    }

    public function markJobError(string $message): void
    {
        $this->setProgress('error', $message, null, ['message' => $message]);
    }

    protected function readManifest(?string $path = null): array
    {
        $target = $path ?? $this->jobManifestPath;
        if (!$target || !is_file($target)) {
            return [];
        }

        $decoded = json_decode((string)file_get_contents($target), true);

        return is_array($decoded) ? $decoded : [];
    }

    public function loadJob(string $jobId): array
    {
        $this->setJobId($jobId);

        return $this->readManifest();
    }

    public function getJobStatus(string $jobId): array
    {
        $manifest = $this->loadJob($jobId);
        $progress = $this->getProgress();

        $result = [
            'job' => $manifest ?: null,
            'progress' => $progress,
            'context' => $this->buildStatusContext(),
        ];

        $this->clearJobContext();

        return $result;
    }

    public function queue(array $options = []): array
    {
        $operation = $options['operation'] ?? 'upgrade';
        $options['operation'] = $operation;

        $this->resetProgress();
        $jobId = $this->generateJobId();
        $this->setJobId($jobId);

        $jobDir = $this->getJobDir($jobId);
        Folder::create($jobDir);

        $logPath = $jobDir . '/worker.log';

        $timestamp = time();

        $manifest = [
            'id' => $jobId,
            'status' => 'queued',
            'options' => $options,
            'log' => $logPath,
            'created_at' => $timestamp,
            'started_at' => null,
            'completed_at' => null,
        ];
        $this->writeManifest($manifest);

        try {
            file_put_contents($logPath, '[' . gmdate('c') . "] Job {$jobId} queued\n");
        } catch (Throwable $e) {
            // ignore log write failures
        }

        $this->log(sprintf('Queued safe upgrade job %s', $jobId));

        if ($operation === 'restore') {
            $queueMessage = 'Waiting for restore worker...';
        } elseif ($operation === 'snapshot') {
            $queueMessage = 'Waiting for snapshot worker...';
        } else {
            $queueMessage = 'Waiting for upgrade worker...';
        }
        $queuedExtras = [
            'job_id' => $jobId,
            'status' => 'queued',
            'operation' => $operation,
        ];
        if ($operation === 'snapshot') {
            if (isset($options['label']) && is_string($options['label'])) {
                $queuedExtras['label'] = $options['label'];
            }
            $queuedExtras['mode'] = 'manual';
        }
        $this->setProgress('queued', $queueMessage, 0, $queuedExtras);

        if (!function_exists('proc_open')) {
            $message = 'proc_open() is disabled on this server; unable to run safe upgrade worker.';
            $this->writeManifest([
                'status' => 'error',
                'error' => $message,
            ]);
            $this->setProgress('error', $message, null, ['job_id' => $jobId, 'operation' => $operation]);
            $this->clearJobContext();

            return [
                'status' => 'error',
                'message' => $message,
                'operation' => $operation,
            ];
        }

        try {
            $finder = new PhpExecutableFinder();
            $phpPath = $finder->find(false) ?: PHP_BINARY;
            if (!$phpPath) {
                throw new RuntimeException('Unable to locate PHP CLI to start safe upgrade worker.');
            }

            $gravPath = Utils::isWindows()
                ? GRAV_ROOT . '\\bin\\grav'
                : GRAV_ROOT . '/bin/grav';

            if (!is_file($gravPath)) {
                throw new RuntimeException('Unable to locate Grav CLI binary.');
            }

            if (Utils::isWindows()) {
                $commandLine = sprintf(
                    'start /B "" %s %s safe-upgrade:run --job=%s >> %s 2>&1',
                    escapeshellarg($phpPath),
                    escapeshellarg($gravPath),
                    escapeshellarg($jobId),
                    escapeshellarg($logPath)
                );
            } else {
                $commandLine = sprintf(
                    'nohup %s %s safe-upgrade:run --job=%s >> %s 2>&1 &',
                    escapeshellarg($phpPath),
                    escapeshellarg($gravPath),
                    escapeshellarg($jobId),
                    escapeshellarg($logPath)
                );
            }

            try {
                file_put_contents($logPath, '[' . gmdate('c') . "] Command: {$commandLine}\n", FILE_APPEND);
            } catch (Throwable $e) {
                // ignore log write failures
            }

            $this->log(sprintf('Spawn command for job %s: %s', $jobId, $commandLine), 'debug');

            $process = Process::fromShellCommandline($commandLine, GRAV_ROOT, null, null, 3);
            $process->disableOutput();
            $process->run();
        } catch (Throwable $e) {
            $message = $e->getMessage();
            $this->writeManifest([
                'status' => 'error',
                'error' => $message,
            ]);
            $this->setProgress('error', $message, null, ['job_id' => $jobId, 'operation' => $operation]);
            $this->clearJobContext();

            return [
                'status' => 'error',
                'message' => $message,
                'operation' => $operation,
            ];
        }

        $this->writeManifest([
            'status' => 'running',
            'started_at' => time(),
        ]);

        $this->log(sprintf('Safe upgrade job %s worker started', $jobId));

        return [
            'status' => 'queued',
            'job_id' => $jobId,
            'log' => $logPath,
            'progress' => $this->getProgress(),
            'job' => $this->readManifest(),
            'context' => $this->buildStatusContext(),
            'operation' => $operation,
        ];
    }

    /**
     * Execute preflight checks and return upgrade readiness data.
     *
     * @param bool $force
     * @return array
     */
    public function preflight(bool $force = false): array
    {
        $this->resetProgress();

        if (!class_exists(ZipArchive::class)) {
            return [
                'status' => 'error',
                'message' => 'php-zip extension needs to be enabled.',
            ];
        }

        try {
            $this->upgrader = new Upgrader($force);
        } catch (Throwable $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }

        $local = $this->upgrader->getLocalVersion();
        $remote = $this->upgrader->getRemoteVersion();
        $releaseDate = $this->upgrader->getReleaseDate();
        $assets = $this->upgrader->getAssets();
        $package = $this->resolveAsset($assets, 'grav-update');

        $payload = [
            'status' => 'ready',
            'version' => [
                'local' => $local,
                'remote' => $remote,
                'release_date' => $releaseDate ? strftime('%c', strtotime($releaseDate)) : null,
                'package_size' => $package['size'] ?? null,
            ],
            'upgrade_available' => $this->upgrader->isUpgradable(),
            'requirements' => [
                'meets' => $this->upgrader->meetsRequirements(),
                'minimum_php' => $this->upgrader->minPHPVersion(),
            ],
            'symlinked' => false,
            'safe_upgrade' => [
                'enabled' => $this->isSafeUpgradeEnabled(),
                'staging_ready' => true,
                'error' => null,
            ],
            'preflight' => [
                'warnings' => [],
                'plugins_pending' => [],
                'psr_log_conflicts' => [],
                'monolog_conflicts' => [],
            ],
        ];

        $report = $this->collectLocalPreflightReport($remote ?? $local);
        $payload['preflight'] = $report;
        $payload['preflight']['blocking'] = $report['blocking'] ?? [];

        Installer::isValidDestination(GRAV_ROOT . '/system');
        $payload['symlinked'] = Installer::IS_LINK === Installer::lastErrorCode();

        return $payload;
    }

    /**
     * Run the safe upgrade lifecycle.
     *
     * @param array $options
     * @return array
     */
    public function run(array $options = []): array
    {
        $operation = isset($options['operation']) ? (string)$options['operation'] : 'upgrade';
        if ($operation === 'restore') {
            return $this->runRestore($options);
        }

        if ($operation === 'snapshot') {
            return $this->runSnapshot($options);
        }

        $force = (bool)($options['force'] ?? false);
        $timeout = (int)($options['timeout'] ?? 30);
        $overwrite = (bool)($options['overwrite'] ?? false);
        $decisions = is_array($options['decisions'] ?? null) ? $options['decisions'] : [];
        $this->preflightDecisions = $decisions;

        $this->setProgress('initializing', 'Preparing safe upgrade...', null);

        if (!class_exists(ZipArchive::class)) {
            return $this->errorResult('php-zip extension needs to be enabled.');
        }

        try {
            $this->upgrader = new Upgrader($force);
        } catch (Throwable $e) {
            return $this->errorResult($e->getMessage());
        }

        $safeUpgradeEnabled = $this->isSafeUpgradeEnabled();
        if (!$safeUpgradeEnabled) {
            return $this->errorResult('Safe upgrade is disabled in configuration.');
        }

        $remoteVersion = $this->upgrader->getRemoteVersion();
        $localVersion = $this->upgrader->getLocalVersion();

        if (!$this->upgrader->meetsRequirements()) {
            $minPhp = $this->upgrader->minPHPVersion();
            $message = sprintf(
                'Grav requires PHP %s, current PHP version is %s.',
                $minPhp,
                PHP_VERSION
            );

            return $this->errorResult($message, [
                'minimum_php' => $minPhp,
                'current_php' => PHP_VERSION,
            ]);
        }

        if (!$overwrite && !$this->upgrader->isUpgradable()) {
            $result = $this->runFinalizeIfNeeded($localVersion);
            if ($result) {
                return $result;
            }

            return [
                'status' => 'noop',
                'version' => $localVersion,
                'message' => 'Grav is already up to date.',
                'context' => $this->buildStatusContext(),
            ];
        }

        Installer::isValidDestination(GRAV_ROOT . '/system');
        if (Installer::IS_LINK === Installer::lastErrorCode()) {
            return $this->errorResult('Grav installation is symlinked, cannot perform upgrade.');
        }

        // NOTE: We no longer create SafeUpgradeService here because it would load the OLD class.
        // Preflight checks are now run in Install.php AFTER downloading, using the NEW code.

        if (defined('Monolog\\Logger::API') && \Monolog\Logger::API < 3) {
            class_exists(\Monolog\Logger::class);
            class_exists(\Monolog\Handler\AbstractHandler::class);
            class_exists(\Monolog\Handler\AbstractProcessingHandler::class);
            class_exists(\Monolog\Handler\StreamHandler::class);
            class_exists(\Monolog\Formatter\LineFormatter::class);
        }

        // NOTE: Preflight checks are now run in Install.php AFTER downloading the package.
        // This ensures we use the NEW SafeUpgradeService from the package, not the old one.
        // Running preflight here would load the OLD class into memory and prevent the new one from loading.

        $assets = $this->upgrader->getAssets();
        $package = $this->resolveAsset($assets, 'grav-update');
        if (!$package) {
            return $this->errorResult('Unable to locate Grav update package information.');
        }

        if ($this->recovery && method_exists($this->recovery, 'markUpgradeWindow')) {
            // Newer Grav exposes upgrade window helpers; guard for older cores.
            $this->recovery->markUpgradeWindow('core-upgrade', [
                'scope' => 'core',
                'target_version' => $remoteVersion,
            ]);
        }

        try {
            $file = $this->download($package, $timeout);
            $this->performInstall($file);
            $this->setProgress('installing', 'Preparing promotion...', null);
        } catch (Throwable $e) {
            $this->setProgress('error', $e->getMessage(), null);

            return $this->errorResult($e->getMessage());
        } finally {
            if ($this->tmp && is_dir($this->tmp)) {
                Folder::delete($this->tmp);
            }
            $this->tmp = null;
            $this->preflightDecisions = [];
        }

        $this->setProgress('finalizing', 'Finalizing upgrade...', null);
        $this->clearRecoveryFlag();

        $this->ensureExecutablePermissions();
        $this->setProgress('finalizing', 'Finalizing upgrade...', null);

        $manifest = $this->resolveLatestManifest();

        $this->setProgress('complete', 'Upgrade complete.', 100, [
            'target_version' => $remoteVersion,
            'manifest' => $manifest,
        ]);

        if ($this->jobManifestPath) {
            $this->updateJob([
                'result' => [
                    'status' => 'success',
                    'version' => $remoteVersion,
                    'previous_version' => $localVersion,
                    'manifest' => $manifest,
                ],
            ]);
        }

        return [
            'status' => 'success',
            'version' => $remoteVersion,
            'manifest' => $manifest,
            'previous_version' => $localVersion,
            'context' => $this->buildStatusContext(),
        ];
    }

    public function runRestore(array $options): array
    {
        $snapshotId = isset($options['snapshot_id']) ? (string)$options['snapshot_id'] : '';
        if ($snapshotId === '') {
            return $this->errorResult('Snapshot identifier is required.', ['operation' => 'restore']);
        }

        $this->setProgress('rollback', sprintf('Restoring snapshot %s...', $snapshotId), null, [
            'operation' => 'restore',
            'snapshot' => $snapshotId,
        ]);

        $result = $this->restoreSnapshot($snapshotId);
        if (($result['status'] ?? 'error') !== 'success') {
            $message = $result['message'] ?? 'Snapshot restore failed.';

            return $this->errorResult($message, [
                'operation' => 'restore',
                'snapshot' => $snapshotId,
            ]);
        }

        $manifest = $result['manifest'] ?? [];
        $version = $manifest['source_version'] ?? $manifest['target_version'] ?? null;

        $this->setProgress('complete', sprintf('Snapshot %s restored.', $snapshotId), 100, [
            'operation' => 'restore',
            'snapshot' => $snapshotId,
            'version' => $version,
        ]);

        if ($this->jobManifestPath) {
            $this->updateJob([
                'result' => [
                    'status' => 'success',
                    'snapshot' => $snapshotId,
                    'version' => $version,
                    'manifest' => $manifest,
                    'label' => $label,
                ],
            ]);
        }

        return [
            'status' => 'success',
            'snapshot' => $snapshotId,
            'version' => $version,
            'manifest' => $manifest,
            'label' => $label,
            'context' => $this->buildStatusContext(),
        ];
    }

    public function runSnapshot(array $options): array
    {
        if (!$this->isSafeUpgradeEnabled()) {
            return $this->errorResult('Safe upgrade is disabled in configuration.', [
                'operation' => 'snapshot'
            ]);
        }

        $label = isset($options['label']) ? (string)$options['label'] : null;
        if ($label !== null) {
            $label = trim($label);
            if ($label === '') {
                $label = null;
            }
        }

        $this->setProgress('snapshot', 'Creating manual snapshot...', null, [
            'operation' => 'snapshot',
            'label' => $label,
            'mode' => 'manual',
        ]);

        try {
            $safeUpgrade = $this->getSafeUpgradeService();
            $manifest = $safeUpgrade->createSnapshot($label);
        } catch (RuntimeException $e) {
            return $this->errorResult($e->getMessage(), [
                'operation' => 'snapshot',
            ]);
        } catch (Throwable $e) {
            return $this->errorResult($e->getMessage(), [
                'operation' => 'snapshot',
            ]);
        }

        $snapshotId = $manifest['id'] ?? null;
        $version = $manifest['source_version'] ?? $manifest['target_version'] ?? null;

        $this->setProgress('complete', sprintf('Snapshot %s created.', $snapshotId ?? '(unknown)'), 100, [
            'operation' => 'snapshot',
            'snapshot' => $snapshotId,
            'version' => $version,
            'label' => $label,
            'mode' => 'manual',
        ]);

        if ($this->jobManifestPath) {
            $this->updateJob([
                'result' => [
                    'status' => 'success',
                    'snapshot' => $snapshotId,
                    'version' => $version,
                    'manifest' => $manifest,
                    'label' => $label,
                ],
            ]);
        }

        return [
            'status' => 'success',
            'snapshot' => $snapshotId,
            'version' => $version,
            'manifest' => $manifest,
            'label' => $label,
            'context' => $this->buildStatusContext(),
        ];
    }

    /**
     * Retrieve current progress payload.
     *
     * @return array
     */
    public function getProgress(): array
    {
        if (!is_file($this->progressPath)) {
            return [
                'stage' => 'idle',
                'message' => '',
                'percent' => null,
                'timestamp' => time(),
            ];
        }

        $decoded = json_decode((string)file_get_contents($this->progressPath), true);
        if (!is_array($decoded)) {
            return [
                'stage' => 'idle',
                'message' => '',
                'percent' => null,
                'timestamp' => time(),
            ];
        }

        return $decoded;
    }

    /**
     * Reset progress file to idle state.
     *
     * @return void
     */
    public function resetProgress(): void
    {
        $this->setProgress('idle', '', null);
    }

    /**
     * @return SafeUpgradeService
     */
    protected function getSafeUpgradeService(): SafeUpgradeService
    {
        if ($this->safeUpgrade instanceof SafeUpgradeService) {
            return $this->safeUpgrade;
        }

        $config = null;
        try {
            $config = $this->grav['config'] ?? null;
        } catch (Throwable $e) {
            $config = null;
        }

        $this->safeUpgrade = new SafeUpgradeService([
            'config' => $config,
        ]);
        if (method_exists($this->safeUpgrade, 'setProgressCallback')) {
            $this->safeUpgrade->setProgressCallback(function (string $stage, string $message, ?int $percent = null, array $extra = []) {
                $this->setProgress($stage, $message, $percent);
            });
        }

        return $this->safeUpgrade;
    }

    /**
     * @return bool
     */
    protected function isSafeUpgradeEnabled(): bool
    {
        try {
            $config = $this->grav['config'] ?? null;
            return self::configAllowsSafeUpgrade($config);
        } catch (Throwable $e) {
            return false;
        }
    }

    /**
     * @param Config|null $config
     * @return bool
     */
    public static function configAllowsSafeUpgrade(?Config $config): bool
    {
        if ($config === null) {
            return false;
        }

        $value = $config->get('system.updates.safe_upgrade');
        if ($value === null) {
            return false;
        }

        if (is_string($value)) {
            $filtered = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($filtered === null) {
                return false;
            }

            return $filtered;
        }

        return (bool)$value;
    }

    /**
     * @param array $preflight
     * @param array $decisions
     * @return array|null
     */
    protected function handleConflictDecisions(array $preflight, array $decisions): ?array
    {
        $psrConflicts = $preflight['psr_log_conflicts'] ?? [];
        $monologConflicts = $preflight['monolog_conflicts'] ?? [];

        if ($psrConflicts) {
            $decision = $decisions['psr_log'] ?? null;
            $error = $this->applyConflictDecision(
                $decision,
                $psrConflicts,
                'Disabled before upgrade because of psr/log conflict'
            );
            if ($error !== null) {
                return $error;
            }
        }

        if ($monologConflicts) {
            $decision = $decisions['monolog'] ?? null;
            $error = $this->applyConflictDecision(
                $decision,
                $monologConflicts,
                'Disabled before upgrade because of Monolog API conflict'
            );
            if ($error !== null) {
                return $error;
            }
        }

        return null;
    }

    protected function enforcePreflightReport(array $preflight, array $decisions): void
    {
        if (!$preflight) {
            return;
        }

        $pending = $preflight['plugins_pending'] ?? [];
        if ($pending) {
            $decision = $decisions['pending'] ?? 'abort';
            if ($decision !== 'continue') {
                $list = [];
                foreach ($pending as $slug => $info) {
                    $current = $info['current'] ?? 'unknown';
                    $available = $info['available'] ?? 'unknown';
                    $list[] = sprintf('%s (%s → %s)', $slug, $current, $available);
                }

                throw new RuntimeException(
                    "Plugin/theme updates required before upgrading Grav:\n  - " . implode("\n  - ", $list)
                );
            }

            Install::allowPendingPackageOverride(true);
            $this->setProgress('warning', 'Proceeding despite pending plugin/theme updates.', null);
        }

        $blocking = $preflight['blocking'] ?? [];
        if ($blocking) {
            throw new RuntimeException($blocking[0]);
        }

        $error = $this->handleConflictDecisions($preflight, $decisions);
        if ($error !== null) {
            throw new RuntimeException($error['message'] ?? 'Upgrade aborted due to unresolved conflicts.');
        }
    }

    /**
     * @param string|null $decision
     * @param array $conflicts
     * @param string $disableNote
     * @return array|null
     */
    protected function applyConflictDecision(?string $decision, array $conflicts, string $disableNote): ?array
    {
        if (!$conflicts) {
            return null;
        }

        $choice = $decision ?: 'abort';
        if ($choice === 'abort') {
            return $this->errorResult('Upgrade aborted due to unresolved conflicts.', [
                'conflicts' => $conflicts,
            ]);
        }

        if ($choice === 'disable') {
            foreach (array_keys($conflicts) as $slug) {
                $this->recovery->disablePlugin($slug, ['message' => $disableNote]);
            }

            return null;
        }

        if ($choice === 'continue') {
            return null;
        }

        return $this->errorResult('Unknown conflict decision provided.', [
            'conflicts' => $conflicts,
        ]);
    }

    protected function collectLocalPreflightReport(?string $targetVersion): array
    {
        $targetVersion = $targetVersion ?: GRAV_VERSION;
        $report = [
            'warnings' => [],
            'psr_log_conflicts' => [],
            'monolog_conflicts' => [],
            'plugins_pending' => [],
            'is_major_minor_upgrade' => $this->isMajorMinorUpgradeLocal($targetVersion),
            'blocking' => [],
        ];

        $report['plugins_pending'] = $this->detectPendingPackages();
        $report['psr_log_conflicts'] = $this->detectPsrLogConflictsLocal();
        $report['monolog_conflicts'] = $this->detectMonologConflictsLocal();

        if ($report['plugins_pending'] && $report['is_major_minor_upgrade']) {
            $report['blocking'][] = 'Pending plugin/theme updates detected. Because this is a major Grav upgrade, update them before continuing.';
        }

        if ($report['psr_log_conflicts']) {
            $report['warnings'][] = 'Potential psr/log conflicts detected.';
        }

        if ($report['monolog_conflicts']) {
            $report['warnings'][] = 'Potential Monolog API conflicts detected.';
        }

        return $report;
    }

    protected function isMajorMinorUpgradeLocal(string $targetVersion): bool
    {
        [$currentMajor, $currentMinor] = array_map('intval', array_pad(explode('.', GRAV_VERSION), 2, 0));
        [$targetMajor, $targetMinor] = array_map('intval', array_pad(explode('.', $targetVersion), 2, 0));

        return $currentMajor !== $targetMajor || $currentMinor !== $targetMinor;
    }

    protected function detectPendingPackages(): array
    {
        $pending = [];

        try {
            $gpm = new GPM();
        } catch (Throwable $e) {
            $this->setProgress('warning', 'Unable to query GPM repository: ' . $e->getMessage(), null);

            return $pending;
        }

        $repoPlugins = $this->packagesToArray($gpm->getRepositoryPlugins());
        $repoThemes = $this->packagesToArray($gpm->getRepositoryThemes());

        $localPlugins = $this->scanLocalPackageVersions(GRAV_ROOT . '/user/plugins');
        foreach ($localPlugins as $slug => $version) {
            $remote = $repoPlugins[$slug] ?? null;
            if (!$this->isPackagePublished($remote)) {
                continue;
            }
            $remoteVersion = $this->resolveRemotePackageVersion($remote);
            if (!$remoteVersion || !$version) {
                continue;
            }
            if (!$this->isPluginEnabledLocally($slug)) {
                continue;
            }

            if (version_compare($remoteVersion, $version, '>')) {
                $pending[$slug] = [
                    'type' => 'plugin',
                    'current' => $version,
                    'available' => $remoteVersion,
                ];
            }
        }

        $localThemes = $this->scanLocalPackageVersions(GRAV_ROOT . '/user/themes');
        foreach ($localThemes as $slug => $version) {
            $remote = $repoThemes[$slug] ?? null;
            if (!$this->isPackagePublished($remote)) {
                continue;
            }
            $remoteVersion = $this->resolveRemotePackageVersion($remote);
            if (!$remoteVersion || !$version) {
                continue;
            }
            if (!$this->isThemeEnabledLocally($slug)) {
                continue;
            }

            if (version_compare($remoteVersion, $version, '>')) {
                $pending[$slug] = [
                    'type' => 'theme',
                    'current' => $version,
                    'available' => $remoteVersion,
                ];
            }
        }

        return $pending;
    }

    protected function scanLocalPackageVersions(string $path): array
    {
        $versions = [];
        if (!is_dir($path)) {
            return $versions;
        }

        $entries = glob($path . '/*', GLOB_ONLYDIR) ?: [];
        foreach ($entries as $dir) {
            $slug = basename($dir);
            $version = $this->readBlueprintVersion($dir) ?? $this->readComposerVersion($dir);
            if ($version !== null) {
                $versions[$slug] = $version;
            }
        }

        return $versions;
    }

    protected function readBlueprintVersion(string $dir): ?string
    {
        $file = $dir . '/blueprints.yaml';
        if (!is_file($file)) {
            return null;
        }

        try {
            $contents = @file_get_contents($file);
            if ($contents === false) {
                return null;
            }
            $data = Yaml::parse($contents);
            if (is_array($data) && isset($data['version'])) {
                return (string)$data['version'];
            }
        } catch (Throwable $e) {
            // ignore parse errors
        }

        return null;
    }

    protected function readComposerVersion(string $dir): ?string
    {
        $file = $dir . '/composer.json';
        if (!is_file($file)) {
            return null;
        }

        $data = json_decode(file_get_contents($file), true);
        if (is_array($data) && isset($data['version'])) {
            return (string)$data['version'];
        }

        return null;
    }

    protected function packagesToArray($packages): array
    {
        if (!$packages) {
            return [];
        }

        if (is_array($packages)) {
            return $packages;
        }

        if ($packages instanceof \Traversable) {
            return iterator_to_array($packages, true);
        }

        return [];
    }

    protected function resolveRemotePackageVersion($package): ?string
    {
        if (!$package) {
            return null;
        }

        if (is_array($package)) {
            return $package['version'] ?? null;
        }

        if (is_object($package)) {
            if (isset($package->version)) {
                return (string)$package->version;
            }
            if (method_exists($package, 'offsetGet')) {
                try {
                    return (string)$package->offsetGet('version');
                } catch (Throwable $e) {
                    return null;
                }
            }
        }

        return null;
    }

    protected function detectPsrLogConflictsLocal(): array
    {
        $conflicts = [];
        $pluginRoots = glob(GRAV_ROOT . '/user/plugins/*', GLOB_ONLYDIR) ?: [];
        foreach ($pluginRoots as $path) {
            $composerFile = $path . '/composer.json';
            if (!is_file($composerFile)) {
                continue;
            }

            $json = json_decode(file_get_contents($composerFile), true);
            if (!is_array($json)) {
                continue;
            }

            $slug = basename($path);
            if (!$this->isPluginEnabledLocally($slug)) {
                continue;
            }
            $rawConstraint = $json['require']['psr/log'] ?? ($json['require-dev']['psr/log'] ?? null);
            if (!$rawConstraint) {
                continue;
            }

            $constraint = strtolower((string)$rawConstraint);
            $compatible = $constraint === '*'
                || false !== strpos($constraint, '3')
                || false !== strpos($constraint, '4')
                || (false !== strpos($constraint, '>=') && preg_match('/>=\s*3/', $constraint));

            if ($compatible) {
                continue;
            }

            $conflicts[$slug] = [
                'composer' => $composerFile,
                'requires' => $rawConstraint,
            ];
        }

        return $conflicts;
    }

    protected function detectMonologConflictsLocal(): array
    {
        $conflicts = [];
        $pluginRoots = glob(GRAV_ROOT . '/user/plugins/*', GLOB_ONLYDIR) ?: [];
        $pattern = '/->add(?:Debug|Info|Notice|Warning|Error|Critical|Alert|Emergency)\s*\(/i';

        foreach ($pluginRoots as $path) {
            $slug = basename($path);
            if (!$this->isPluginEnabledLocally($slug)) {
                continue;
            }

            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($path, \FilesystemIterator::SKIP_DOTS)
            );

            foreach ($iterator as $file) {
                if (!$file->isFile() || strtolower($file->getExtension()) !== 'php') {
                    continue;
                }

                $contents = @file_get_contents($file->getPathname());
                if ($contents === false) {
                    continue;
                }

                if (preg_match($pattern, $contents, $match)) {
                    $relative = str_replace(GRAV_ROOT . '/', '', $file->getPathname());
                    $conflicts[$slug][] = [
                        'file' => $relative,
                        'method' => trim($match[0]),
                    ];
                }
            }
        }

        return $conflicts;
    }

    protected function isPluginEnabledLocally(string $slug): bool
    {
        $configPath = GRAV_ROOT . '/user/config/plugins/' . $slug . '.yaml';
        if (is_file($configPath)) {
            try {
                $contents = @file_get_contents($configPath);
                if ($contents !== false) {
                    $data = Yaml::parse($contents);
                    if (is_array($data) && array_key_exists('enabled', $data)) {
                        return (bool)$data['enabled'];
                    }
                }
            } catch (Throwable $e) {
                // ignore parse errors
            }
        }

        return true;
    }

    protected function isThemeEnabledLocally(string $slug): bool
    {
        $configPath = GRAV_ROOT . '/user/config/system.yaml';
        if (is_file($configPath)) {
            try {
                $contents = @file_get_contents($configPath);
                if ($contents !== false) {
                    $data = Yaml::parse($contents);
                    if (is_array($data)) {
                        $active = $data['pages']['theme'] ?? ($data['system']['pages']['theme'] ?? null);
                        if ($active !== null) {
                            return $active === $slug;
                        }
                    }
                }
            } catch (Throwable $e) {
                // ignore parse errors
            }
        }

        return true;
    }

    protected function isPackagePublished($package): bool
    {
        if (!$package) {
            return false;
        }

        if (is_array($package)) {
            if (array_key_exists('published', $package)) {
                return $package['published'] !== false;
            }

            return true;
        }

        if (is_object($package) && method_exists($package, 'getData')) {
            $data = $package->getData();
            if ($data instanceof \Grav\Common\Data\Data) {
                $published = $data->get('published');

                return $published !== false;
            }
        }

        if (is_object($package) && property_exists($package, 'published')) {
            return $package->published !== false;
        }

        return true;
    }


    /**
     * @param array $package
     * @param int $timeout
     * @return string
     */
    protected function download(array $package, int $timeout): string
    {
        $tmpDir = $this->grav['locator']->findResource('tmp://', true, true);
        $this->tmp = $tmpDir . '/grav-update-' . uniqid('', false);

        Folder::create($this->tmp);

        $this->setProgress('downloading', 'Downloading update...', 0, [
            'package_size' => $package['size'] ?? null,
        ]);

        $options = [
            'timeout' => max(0, $timeout),
        ];

        $progressCallback = function (array $progress): void {
            $this->setProgress('downloading', 'Downloading update...', $progress['percent'], [
                'transferred' => $progress['transferred'],
                'filesize' => $progress['filesize'],
            ]);
        };

        $output = Response::get($package['download'], $options, $progressCallback);

        $this->setProgress('downloading', 'Download complete.', 100);

        $target = $this->tmp . '/' . $package['name'];
        file_put_contents($target, $output);

        return $target;
    }

    /**
     * @param string $zip
     * @return void
     */
    protected function performInstall(string $zip): void
    {
        $this->setProgress('installing', 'Unpacking update...', null);
        $folder = Installer::unZip($zip, $this->tmp . '/zip');
        if ($folder === false) {
            throw new RuntimeException(Installer::lastErrorMsg());
        }

        $script = $folder . '/system/install.php';
        if (!file_exists($script)) {
            throw new RuntimeException('Downloaded archive is not a valid Grav package.');
        }

        $install = include $script;
        if (!is_callable($install)) {
            throw new RuntimeException('Unable to bootstrap installer from downloaded package.');
        }

        try {
            if (is_object($install) && method_exists($install, 'generatePreflightReport')) {
                $report = $install->generatePreflightReport();
                $this->setProgress('preflight', 'Preflight checks completed.', null, [
                    'preflight' => $report,
                ]);
                $this->enforcePreflightReport($report, $this->preflightDecisions);
            }
            if (is_object($install) && method_exists($install, 'setProgressCallback')) {
                $install->setProgressCallback(function (string $stage, string $message, ?int $percent = null) {
                    $this->setProgress($stage, $message, $percent);
                });
            }
            $this->setProgress('installing', 'Running installer...', null);
            $install($zip);
            $this->setProgress('installing', 'Verifying files...', null);
        } catch (Throwable $e) {
            throw new RuntimeException($e->getMessage(), 0, $e);
        }

        $errorCode = Installer::lastErrorCode();
        if ($errorCode) {
            throw new RuntimeException(Installer::lastErrorMsg());
        }
    }

    protected function clearRecoveryFlag(): void
    {
        $flag = GRAV_ROOT . '/user/data/recovery.flag';
        if (is_file($flag)) {
            @unlink($flag);
        }
    }

    /**
     * Attempt to run finalize scripts if Grav is already up to date but schema mismatched.
     *
     * @param string $localVersion
     * @return array|null
     */
    protected function runFinalizeIfNeeded(string $localVersion): ?array
    {
        $config = $this->grav['config'];
        $schema = $config->get('versions.core.grav.schema');

        if ($schema !== GRAV_SCHEMA && version_compare((string)$schema, GRAV_SCHEMA, '<')) {
            $this->setProgress('finalizing', 'Running post-install scripts...', null);
            Install::instance()->finalize();
            $this->setProgress('complete', 'Post-install scripts executed.', 100, [
                'target_version' => $localVersion,
            ]);

            return [
                'status' => 'finalized',
                'version' => $localVersion,
                'message' => 'Post-install scripts completed.',
                'context' => $this->buildStatusContext(),
            ];
        }

        return null;
    }

    /**
     * Fetch most recent safe upgrade manifest if available.
     *
     * @return array|null
     */
    protected function resolveLatestManifest(): ?array
    {
        $store = $this->grav['locator']->findResource('user://data/upgrades', false);
        if (!$store || !is_dir($store)) {
            return null;
        }

        $files = glob($store . '/*.json') ?: [];
        if (!$files) {
            return null;
        }
        rsort($files);

        $latest = $files[0];
        $decoded = json_decode(file_get_contents($latest), true);

        return is_array($decoded) ? $decoded : null;
    }

    /**
     * Persist progress payload.
     *
     * @param string $stage
     * @param string $message
     * @param int|null $percent
     * @param array $extra
     * @return void
     */
    protected function setProgress(string $stage, string $message, ?int $percent = null, array $extra = []): void
    {
        $payload = [
            'stage' => $stage,
            'message' => $message,
            'percent' => $percent,
            'timestamp' => time(),
        ] + $extra;

        if ($this->jobId) {
            $payload['job_id'] = $this->jobId;
        }

        try {
            Folder::create(dirname($this->progressPath));
            file_put_contents($this->progressPath, json_encode($payload, JSON_PRETTY_PRINT));
            if ($this->jobId) {
                $this->log(sprintf('Job %s stage -> %s (%s)', $this->jobId, $stage, $message), $stage === 'error' ? 'error' : 'debug');
            }
        } catch (Throwable $e) {
            // ignore write failures
        }

        if ($this->jobManifestPath) {
            $status = 'running';
            if ($stage === 'error') {
                $status = 'error';
            } elseif ($stage === 'complete') {
                $status = 'success';
            }

            $manifest = [
                'status' => $status,
                'progress' => $payload,
            ];

            if ($status === 'success') {
                $manifest['completed_at'] = time();
            }

            if ($status === 'error' && isset($extra['message'])) {
                $manifest['error'] = $extra['message'];
            }

            $this->writeManifest($manifest);
        }
    }

    /**
     * Helper for building an error result payload.
     *
     * @param string $message
     * @param array $extra
     * @return array
     */
    protected function errorResult(string $message, array $extra = []): array
    {
        $extraWithMessage = ['message' => $message] + $extra;
        $this->setProgress('error', $message, null, $extraWithMessage);

        if ($this->jobManifestPath) {
            $this->updateJob([
                'result' => [
                    'status' => 'error',
                    'message' => $message,
                    'details' => $extra,
                ],
                'status' => 'error',
                'completed_at' => time(),
            ]);
            $this->log(sprintf('Safe upgrade job %s failed: %s', $this->jobId ?? 'n/a', $message), 'error');
        }

        return [
            'status' => 'error',
            'message' => $message,
            'context' => $this->buildStatusContext(),
        ] + $extra;
    }

    protected function buildStatusContext(): ?string
    {
        $context = [];

        if ($this->jobManifestPath) {
            $context['manifest'] = $this->convertPathForContext($this->jobManifestPath);
        }

        if ($this->progressPath) {
            $context['progress'] = $this->convertPathForContext($this->progressPath);
        }

        if (!$context) {
            return null;
        }

        $encoded = json_encode($context);

        return $encoded === false ? null : base64_encode($encoded);
    }

    private function convertPathForContext(string $path): string
    {
        $normalized = str_replace('\\', '/', $path);
        $root = str_replace('\\', '/', GRAV_ROOT);

        if (strpos($normalized, $root) === 0) {
            $relative = substr($normalized, strlen($root));

            return ltrim($relative, '/');
        }

        return $normalized;
    }

    protected function ensureExecutablePermissions(): void
    {
        $executables = [
            'bin/grav',
            'bin/plugin',
            'bin/gpm',
            'bin/restore',
            'bin/composer.phar'
        ];

        foreach ($executables as $relative) {
            $path = GRAV_ROOT . '/' . $relative;
            if (!is_file($path) || is_link($path)) {
                continue;
            }

            $perms = @fileperms($path);
            $mode = $perms !== false ? ($perms & 0777) : null;
            if ($mode !== 0755) {
                @chmod($path, 0755);
                $this->log(sprintf('Adjusted permissions on %s to 0755', $relative), 'debug');
            }
        }
    }

    protected function resolveAsset(array $assets, string $prefix): ?array
    {
        if (isset($assets[$prefix])) {
            return $assets[$prefix];
        }

        foreach ($assets as $key => $asset) {
            $name = is_array($asset) ? ($asset['name'] ?? '') : '';
            $haystack = $key . ' ' . $name;
            if (stripos($haystack, $prefix) === 0 || stripos($haystack, '/' . $prefix) !== false) {
                return $asset;
            }
        }

        return null;
    }
}
