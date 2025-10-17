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

if ($jobId !== '') {
    $jobPath = $jobsDir . '/' . $jobId;
    $progress = $readJson($jobPath . '/progress.json');
    $manifest = $readJson($jobPath . '/manifest.json');

    if (!$progress && !$manifest && !is_dir($jobPath)) {
        $progress = $readJson($fallbackProgress) ?: [
            'stage' => 'idle',
            'message' => '',
            'percent' => null,
            'timestamp' => time(),
        ];

        echo json_encode([
            'status' => 'success',
            'message' => 'Safe upgrade job not found.',
            'data' => [
                'job' => null,
                'progress' => $progress,
            ],
        ]);
        exit;
    }
}

if ($progress === null) {
    $progress = $readJson($fallbackProgress) ?: [
        'stage' => 'idle',
        'message' => '',
        'percent' => null,
        'timestamp' => time(),
    ];
}

if ($jobId !== '' && is_array($progress) && !isset($progress['job_id'])) {
    $progress['job_id'] = $jobId;
}

echo json_encode([
    'status' => 'success',
    'data' => [
        'job' => $manifest ?: null,
        'progress' => $progress,
    ],
]);

exit;
