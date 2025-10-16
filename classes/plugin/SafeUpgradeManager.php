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

use Grav\Common\Filesystem\Folder;
use Grav\Common\GPM\Installer;
use Grav\Common\GPM\Upgrader;
use Grav\Common\Grav;
use Grav\Common\HTTP\Response;
use Grav\Common\Recovery\RecoveryManager;
use Grav\Common\Upgrade\SafeUpgradeService;
use Grav\Installer\Install;
use RuntimeException;
use Throwable;
use ZipArchive;
use function class_exists;
use function dirname;
use function file_exists;
use function file_get_contents;
use function file_put_contents;
use function glob;
use function is_array;
use function is_dir;
use function is_file;
use function json_decode;
use function json_encode;
use function max;
use function rsort;
use function sprintf;
use function strftime;
use function strtotime;
use function time;
use function uniqid;
use const GRAV_ROOT;
use const GRAV_SCHEMA;

class SafeUpgradeManager
{
    private const PROGRESS_FILENAME = 'safe-upgrade-progress.json';

    /** @var Grav */
    private $grav;
    /** @var Upgrader|null */
    private $upgrader;
    /** @var SafeUpgradeService|null */
    private $safeUpgrade;
    /** @var RecoveryManager */
    private $recovery;
    /** @var string */
    private $progressPath;
    /** @var string|null */
    private $tmp;

    /**
     * SafeUpgradeManager constructor.
     *
     * @param Grav|null $grav
     */
    public function __construct(?Grav $grav = null)
    {
        $this->grav = $grav ?? Grav::instance();
        $this->recovery = $this->grav['recovery'];

        $locator = $this->grav['locator'];
        $progressDir = $locator->findResource('user://data/upgrades', true, true);
        $this->progressPath = $progressDir . '/' . self::PROGRESS_FILENAME;
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
        $package = $assets['grav-update'] ?? null;

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

        Installer::isValidDestination(GRAV_ROOT . '/system');
        $payload['symlinked'] = Installer::IS_LINK === Installer::lastErrorCode();

        try {
            $safeUpgrade = $this->getSafeUpgradeService();
            $payload['preflight'] = $safeUpgrade->preflight();
        } catch (RuntimeException $e) {
            $payload['safe_upgrade']['staging_ready'] = false;
            $payload['safe_upgrade']['error'] = $e->getMessage();
        } catch (Throwable $e) {
            $payload['safe_upgrade']['staging_ready'] = false;
            $payload['safe_upgrade']['error'] = $e->getMessage();
        }

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
        $force = (bool)($options['force'] ?? false);
        $timeout = (int)($options['timeout'] ?? 30);
        $overwrite = (bool)($options['overwrite'] ?? false);
        $decisions = is_array($options['decisions'] ?? null) ? $options['decisions'] : [];

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
            ];
        }

        Installer::isValidDestination(GRAV_ROOT . '/system');
        if (Installer::IS_LINK === Installer::lastErrorCode()) {
            return $this->errorResult('Grav installation is symlinked, cannot perform upgrade.');
        }

        try {
            $safeUpgrade = $this->getSafeUpgradeService();
        } catch (Throwable $e) {
            return $this->errorResult($e->getMessage());
        }

        if (defined('Monolog\\Logger::API') && \Monolog\Logger::API < 3) {
            class_exists(\Monolog\Logger::class);
            class_exists(\Monolog\Handler\AbstractHandler::class);
            class_exists(\Monolog\Handler\AbstractProcessingHandler::class);
            class_exists(\Monolog\Handler\StreamHandler::class);
            class_exists(\Monolog\Formatter\LineFormatter::class);
        }

        $preflight = $safeUpgrade->preflight();
        if (!empty($preflight['plugins_pending'])) {
            return $this->errorResult('Plugins and/or themes require updates before upgrading Grav.', [
                'plugins_pending' => $preflight['plugins_pending'],
            ]);
        }

        $conflictError = $this->handleConflictDecisions($preflight, $decisions);
        if ($conflictError !== null) {
            return $conflictError;
        }

        $assets = $this->upgrader->getAssets();
        $package = $assets['grav-update'] ?? null;
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
            $this->setProgress('installing', 'Installing update...', null);
            $this->performInstall($file);
        } catch (Throwable $e) {
            $this->setProgress('error', $e->getMessage(), null);

            return $this->errorResult($e->getMessage());
        } finally {
            if ($this->tmp && is_dir($this->tmp)) {
                Folder::delete($this->tmp);
            }
            $this->tmp = null;
        }

        $this->setProgress('finalizing', 'Finalizing upgrade...', 100);
        $safeUpgrade->clearRecoveryFlag();
        if ($this->recovery && method_exists($this->recovery, 'closeUpgradeWindow')) {
            $this->recovery->closeUpgradeWindow();
        }

        $manifest = $this->resolveLatestManifest();

        $this->setProgress('complete', 'Upgrade complete.', 100, [
            'target_version' => $remoteVersion,
            'manifest' => $manifest,
        ]);

        return [
            'status' => 'success',
            'version' => $remoteVersion,
            'manifest' => $manifest,
            'previous_version' => $localVersion,
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

        $stagingRoot = $config ? $config->get('system.updates.staging_root') : null;

        $this->safeUpgrade = new SafeUpgradeService([
            'staging_root' => $stagingRoot,
        ]);

        return $this->safeUpgrade;
    }

    /**
     * @return bool
     */
    protected function isSafeUpgradeEnabled(): bool
    {
        try {
            $config = $this->grav['config'] ?? null;
            if ($config === null) {
                return true;
            }

            return (bool)$config->get('system.updates.safe_upgrade', true);
        } catch (Throwable $e) {
            return true;
        }
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
            $install($zip);
        } catch (Throwable $e) {
            throw new RuntimeException($e->getMessage(), 0, $e);
        }

        $errorCode = Installer::lastErrorCode();
        if ($errorCode) {
            throw new RuntimeException(Installer::lastErrorMsg());
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

        try {
            Folder::create(dirname($this->progressPath));
            file_put_contents($this->progressPath, json_encode($payload, JSON_PRETTY_PRINT));
        } catch (Throwable $e) {
            // ignore write failures
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
        $this->setProgress('error', $message, null, $extra);

        return [
            'status' => 'error',
            'message' => $message,
        ] + $extra;
    }
}
