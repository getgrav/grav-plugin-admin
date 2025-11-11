<?php

declare(strict_types=1);

$scriptRoot = isset($_SERVER['SCRIPT_FILENAME']) ? dirname($_SERVER['SCRIPT_FILENAME']) : null;
$root = \defined('GRAV_ROOT') ? GRAV_ROOT : ($scriptRoot ?: dirname(__DIR__, 3));
$jobsDir = $root . '/user/data/upgrades/jobs';
$fallbackProgress = $root . '/user/data/upgrades/safe-upgrade-progress.json';

if (!\defined('GRAV_ROOT')) {
    \define('GRAV_ROOT', $root);
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

$jobId = isset($_GET['job']) ? (string)$_GET['job'] : '';

if ($jobId !== '' && !preg_match('/^job-[A-Za-z0-9\\-]+$/', $jobId)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid job identifier.',
    ]);
    exit;
}

$readJson = static function (string $path): ?array {
    if (!is_file($path)) {
        return null;
    }

    $decoded = json_decode((string)file_get_contents($path), true);

    return is_array($decoded) ? $decoded : null;
};

$progress = null;
$manifest = null;
$manifestPath = null;
$progressPath = null;

$normalizeDir = static function (string $path): string {
    $normalized = str_replace('\\', '/', $path);

    return rtrim($normalized, '/');
};

$jobsDirNormalized = $normalizeDir(realpath($jobsDir) ?: $jobsDir);
$userDataDirNormalized = $normalizeDir(realpath(dirname($jobsDir)) ?: dirname($jobsDir));
$toRelative = static function (string $path): string {
    $normalized = str_replace('\\', '/', $path);
    $root = str_replace('\\', '/', GRAV_ROOT);

    if (strpos($normalized, $root) === 0) {
        $relative = substr($normalized, strlen($root));

        return ltrim($relative, '/');
    }

    return $normalized;
};

$contextParam = $_GET['context'] ?? '';
if ($contextParam !== '') {
    $decodedRaw = base64_decode(strtr($contextParam, ' ', '+'), true);
    if ($decodedRaw !== false) {
        $decoded = json_decode($decodedRaw, true);
        if (is_array($decoded)) {
            $validatePath = static function (string $candidate) use ($normalizeDir, $jobsDirNormalized, $userDataDirNormalized) {
                if ($candidate === '') {
                    return null;
                }

                $candidate = str_replace('\\', '/', $candidate);

                if ($candidate[0] !== '/' && !preg_match('/^[A-Za-z]:[\\\\\/]/', $candidate)) {
                    $candidate = GRAV_ROOT . '/' . ltrim($candidate, '/');
                    $candidate = str_replace('\\', '/', $candidate);
                }

                $real = realpath($candidate);
                if ($real === false) {
                    return null;
                }

                $real = $normalizeDir($real);
                if (strpos($real, $jobsDirNormalized) !== 0 && strpos($real, $userDataDirNormalized) !== 0) {
                    return null;
                }

                return $real;
            };

            if (!empty($decoded['manifest'])) {
                $candidate = $validatePath((string)$decoded['manifest']);
                if ($candidate) {
                    $manifestPath = $candidate;
                    if (is_file($candidate)) {
                        $manifest = $readJson($candidate);
                    }
                }
            }

            if (!empty($decoded['progress'])) {
                $candidate = $validatePath((string)$decoded['progress']);
                if ($candidate) {
                    $progressPath = $candidate;
                    if (is_file($candidate)) {
                        $progress = $readJson($candidate);
                    }
                }
            }
        }
    }
}

if ($jobId !== '') {
    $jobPath = $jobsDir . '/' . $jobId;
    $progressPath = $progressPath ?: ($jobPath . '/progress.json');
    $manifestPath = $manifestPath ?: ($jobPath . '/manifest.json');
    if (is_file($progressPath)) {
        $progress = $readJson($progressPath);
    }
    if (is_file($manifestPath)) {
        $manifest = $readJson($manifestPath);
    }

    if (!$progress && !$manifest && !is_dir($jobPath)) {
        $progress = $readJson($fallbackProgress) ?: [
            'stage' => 'idle',
            'message' => '',
            'percent' => null,
            'timestamp' => time(),
        ];
    }
}

if ($progress === null) {
    if ($progressPath && is_file($progressPath)) {
        $progress = $readJson($progressPath);
    }

    if ($progress === null) {
        $progress = $readJson($fallbackProgress) ?: [
            'stage' => 'idle',
            'message' => '',
            'percent' => null,
            'timestamp' => time(),
        ];
        $progressPath = $fallbackProgress;
    }
}

if ($jobId !== '' && is_array($progress) && !isset($progress['job_id'])) {
    $progress['job_id'] = $jobId;
}

$contextPayload = [];
if ($manifestPath) {
    $contextPayload['manifest'] = $toRelative($manifestPath);
}
if ($progressPath) {
    $contextPayload['progress'] = $toRelative($progressPath);
}

$contextToken = $contextPayload ? base64_encode(json_encode($contextPayload)) : null;

echo json_encode([
    'status' => 'success',
    'data' => [
        'job' => $manifest ?: null,
        'progress' => $progress,
        'context' => $contextToken,
    ],
]);

exit;
