<?php

function admin_jwt_secret(): string
{
    return admin_config()['jwt_secret'];
}

function admin_sign_session(string $email, array $opts = []): string
{
    $now = time();
    $payload = [
        'sub' => strtolower(trim($email)),
        'email' => strtolower(trim($email)),
        'provider' => 'password',
        'iat' => $now,
        'exp' => $now + ($opts['expires_in'] ?? 43200),
    ];
    if (!empty($opts['mfa'])) {
        $payload['mfa'] = true;
    }
    if (!empty($opts['company_code'])) {
        $payload['companyCode'] = $opts['company_code'];
    }
    return admin_jwt_encode($payload);
}

function admin_verify_session(string $token): ?array
{
    $payload = admin_jwt_decode($token);
    if (!$payload || empty($payload['email'])) {
        return null;
    }
    if (!empty($payload['purpose'])) {
        return null;
    }
    return $payload;
}

function admin_jwt_encode(array $payload): string
{
    $header = admin_b64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $body = admin_b64url(json_encode($payload));
    $sig = admin_b64url(hash_hmac('sha256', $header . '.' . $body, admin_jwt_secret(), true));
    return $header . '.' . $body . '.' . $sig;
}

function admin_jwt_decode(string $token): ?array
{
    $parts = explode('.', trim($token));
    if (count($parts) !== 3) {
        return null;
    }
    [$header, $body, $sig] = $parts;
    $expected = admin_b64url(hash_hmac('sha256', $header . '.' . $body, admin_jwt_secret(), true));
    if (!hash_equals($expected, $sig)) {
        return null;
    }
    $payload = json_decode(admin_b64url_decode($body), true);
    if (!is_array($payload) || empty($payload['exp']) || time() > (int) $payload['exp']) {
        return null;
    }
    return $payload;
}

function admin_b64url(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function admin_b64url_decode(string $data): string
{
    $pad = 4 - (strlen($data) % 4);
    if ($pad < 4) {
        $data .= str_repeat('=', $pad);
    }
    return base64_decode(strtr($data, '-_', '+/')) ?: '';
}
