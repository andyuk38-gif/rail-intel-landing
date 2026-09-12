<?php

function admin_mail_configured(): bool
{
    $cfg = admin_config();
    if ($cfg['cms_mail_secret'] !== '') {
        return true;
    }
    return $cfg['smtp_host'] !== '';
}

function admin_send_mail_via_cms(string $to, string $subject, string $html, string $text = ''): void
{
    $cfg = admin_config();
    $secret = $cfg['cms_mail_secret'];
    if ($secret === '') {
        throw new RuntimeException('CMS mail relay is not configured. Set cms_mail_secret in config.local.php.');
    }

    $apiBase = rtrim($cfg['cms_api_url'], '/');
    $url = $apiBase . '/internal/site-admin/mail';
    $payload = json_encode([
        'to' => $to,
        'subject' => $subject,
        'html' => $html,
        'text' => $text !== '' ? $text : strip_tags($html),
    ], JSON_UNESCAPED_UNICODE);

    if ($payload === false) {
        throw new RuntimeException('Failed to encode mail payload.');
    }

    $headers = [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $secret,
    ];

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 45,
        ]);
        $response = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($response === false) {
            throw new RuntimeException('CMS mail relay request failed: ' . $curlError);
        }
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => implode("\r\n", $headers),
                'content' => $payload,
                'timeout' => 45,
                'ignore_errors' => true,
            ],
        ]);
        $response = file_get_contents($url, false, $context);
        $status = 0;
        if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) {
            $status = (int) $m[1];
        }
        if ($response === false) {
            throw new RuntimeException('CMS mail relay request failed.');
        }
    }

    if ($status < 200 || $status >= 300) {
        $data = json_decode($response, true);
        $message = is_array($data) && isset($data['error']) ? (string) $data['error'] : 'CMS mail relay failed (HTTP ' . $status . ')';
        throw new RuntimeException($message);
    }
}

function admin_send_mail(string $to, string $subject, string $html, string $text = ''): void
{
    $cfg = admin_config();
    if ($cfg['cms_mail_secret'] !== '') {
        admin_send_mail_via_cms($to, $subject, $html, $text);
        return;
    }

    if ($cfg['smtp_host'] === '') {
        throw new RuntimeException('Mail is not configured. Set cms_mail_secret in config.local.php to use CMS SMTP.');
    }

    $from = $cfg['smtp_from'];
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . $from,
    ];

    if ($cfg['smtp_user'] !== '') {
        ini_set('SMTP', $cfg['smtp_host']);
        ini_set('smtp_port', (string) $cfg['smtp_port']);
    }

    $ok = mail($to, $subject, $html, implode("\r\n", $headers));
    if (!$ok) {
        throw new RuntimeException('mail() failed. Configure CMS mail relay or SMTP in config.local.php.');
    }
}
