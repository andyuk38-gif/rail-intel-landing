<?php

if (php_sapi_name() !== 'cli') {
    exit('Run from command line: php bin/create-admin.php');
}

require_once dirname(__DIR__) . '/lib/config.php';
require_once dirname(__DIR__) . '/lib/db.php';
require_once dirname(__DIR__) . '/lib/password.php';

$args = array_values(array_filter($argv, fn($a, $i) => $i > 0 && !str_starts_with($a, '--'), ARRAY_FILTER_USE_BOTH));
$flags = array_values(array_filter($argv, fn($a) => str_starts_with($a, '--')));
$email = strtolower(trim($args[0] ?? getenv('ADMIN_EMAIL') ?: ''));
$password = (string) ($args[1] ?? getenv('ADMIN_PASSWORD') ?: '');
$name = trim(getenv('ADMIN_NAME') ?: 'Site Administrator');
$company = admin_config()['company_code'];
$isSystemAdmin = in_array('--system-admin', $flags, true) ? 1 : 0;

if ($email === '' || $password === '') {
    fwrite(STDERR, "Usage: php bin/create-admin.php email@example.com 'your-password' [--system-admin]\n");
    exit(1);
}

$db = admin_db();
$stmt = $db->prepare('SELECT id FROM admins WHERE email = ?');
$stmt->execute([$email]);
$existing = $stmt->fetch();

if ($existing) {
    $db->prepare('UPDATE admins SET password_hash = ?, full_name = ?, company_code = ?, is_system_admin = ?, updated_at = datetime(\'now\') WHERE id = ?')
        ->execute([admin_hash_password($password), $name, $company, $isSystemAdmin, $existing['id']]);
    echo "Updated admin: {$email}" . ($isSystemAdmin ? " (system admin)" : "") . "\n";
} else {
    $db->prepare('INSERT INTO admins (id, email, full_name, company_code, password_hash, is_system_admin) VALUES (?, ?, ?, ?, ?, ?)')
        ->execute([admin_uuid(), $email, $name, $company, admin_hash_password($password), $isSystemAdmin]);
    echo "Created admin: {$email} (company code {$company})" . ($isSystemAdmin ? " (system admin)" : "") . "\n";
}
