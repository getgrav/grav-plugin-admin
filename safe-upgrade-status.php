<?php

declare(strict_types=1);

$root = dirname(__DIR__, 3);
$jobsDir = $root . '/user/data/upgrades/jobs';
$fallbackProgress = $root . '/user/data/upgrades/safe-upgrade-progress.json';

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

$jobsDirNormalized = $normalizeDir($jobsDir);
$userDataDirNormalized = $normalizeDir(dirname($jobsDir));

$contextParam = $_GET['context'] ?? '';
if ($contextParam !== '') {
    $decodedRaw = base64_decode(strtr($contextParam, ' ', '+'), true);
    if ($decodedRaw !== false) {
        $decoded = json_decode($decodedRaw, true);
        if (is_array($decoded)) {
            $validatePath = static function (string $candidate) use ($normalizeDir, $jobsDirNormalized, $userDataDirNormalized) {
                $candidate = str_replace('\\', '/', $candidate);
                $directory = dirname($candidate);
                $real = realpath($directory);
                if ($real === false) {
                    return null;
                }

                $real = $normalizeDir($real);
                if (strpos($real, $jobsDirNormalized) !== 0 && strpos($real, $userDataDirNormalized) !== 0) {
                    return null;
                }

                return $candidate;
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
    $contextPayload['manifest'] = $manifestPath;
}
if ($progressPath) {
    $contextPayload['progress'] = $progressPath;
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
