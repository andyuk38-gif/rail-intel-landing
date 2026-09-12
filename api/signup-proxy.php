<?php
/**
 * Same-origin proxy for public CMS signup / quotation APIs (avoids browser CORS).
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$cmsApi = 'https://cms.railintel.co.uk/api';

$path = isset($_GET['path']) ? trim((string) $_GET['path'], '/') : '';
if ($path === '') {
    http_response_code(400);
    echo json_encode(['error' => 'path required']);
    exit;
}

$allowed = [
    'public/signup-config',
    'public/onboarding-addons',
    'public/signup-request',
];

$ok = false;
foreach ($allowed as $prefix) {
    if ($path === $prefix || str_starts_with($path, $prefix . '/')) {
        $ok = true;
        break;
    }
}
if (str_starts_with($path, 'public/quotation/')) {
    $ok = true;
}
if (str_starts_with($path, 'public/invoice/')) {
    $ok = true;
}
if (!$ok) {
    http_response_code(403);
    echo json_encode(['error' => 'path not allowed']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (!in_array($method, ['GET', 'POST', 'OPTIONS'], true)) {
    http_response_code(405);
    echo json_encode(['error' => 'method not allowed']);
    exit;
}

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$url = $cmsApi . '/' . $path;
$body = file_get_contents('php://input');
$headers = ['Accept: application/json'];
$contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
if ($method === 'POST' && $body !== false && $body !== '') {
    $headers[] = 'Content-Type: ' . ($contentType !== '' ? $contentType : 'application/json');
}

$response = false;
$status = 0;

if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 60,
        CURLOPT_FOLLOWLOCATION => false,
    ]);
    if ($method === 'POST' && $body !== false && $body !== '') {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    $response = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
} else {
    $opts = [
        'method' => $method,
        'header' => implode("\r\n", $headers),
        'timeout' => 60,
        'ignore_errors' => true,
    ];
    if ($method === 'POST' && $body !== false && $body !== '') {
        $opts['content'] = $body;
    }
    $context = stream_context_create(['http' => $opts]);
    $response = @file_get_contents($url, false, $context);
    if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) {
        $status = (int) $m[1];
    }
}

if ($response === false) {
    http_response_code(502);
    echo json_encode([
        'error' => 'Could not reach the application server. Please try again in a moment.',
        'retry' => true,
    ]);
    exit;
}

if ($status > 0) {
    http_response_code($status);
}
echo $response;
