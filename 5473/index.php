<?php

require_once __DIR__ . '/lib/api.php';

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$base = rtrim(admin_config()['base_path'], '/');

if ($base !== '' && str_starts_with($uri, $base)) {
    $relative = substr($uri, strlen($base));
} else {
    $relative = $uri;
}
$relative = '/' . ltrim($relative, '/');

if (str_starts_with($relative, '/api/')) {
    admin_handle_api($_SERVER['REQUEST_METHOD'] ?? 'GET', substr($relative, 4) ?: '/');
}

if (str_starts_with($relative, '/uploads/')) {
    $filename = basename(substr($relative, 9));
    $file = admin_config()['uploads_dir'] . '/' . $filename;
    if (is_file($file)) {
        $mime = mime_content_type($file) ?: 'application/octet-stream';
        header('Content-Type: ' . $mime);
        readfile($file);
        exit;
    }
    http_response_code(404);
    exit;
}

$asset = match ($relative) {
    '/', '/index.html' => null,
    '/assets/css/admin.css' => __DIR__ . '/assets/css/admin.css',
    '/assets/js/admin.js' => __DIR__ . '/assets/js/admin.js',
    default => __DIR__ . $relative,
};

if ($asset && is_file($asset)) {
    $ext = pathinfo($asset, PATHINFO_EXTENSION);
    $types = ['css' => 'text/css', 'js' => 'application/javascript', 'png' => 'image/png'];
    header('Content-Type: ' . ($types[$ext] ?? 'application/octet-stream'));
    readfile($asset);
    exit;
}

header('Content-Type: text/html; charset=utf-8');
readfile(__DIR__ . '/admin.html');
exit;
