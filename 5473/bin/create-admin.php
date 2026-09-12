<?php

if (php_sapi_name() !== 'cli') {
    exit('Run from command line: php bin/create-admin.php');
}

require_once dirname(__DIR__) . '/lib/config.php';
require_once dirname(__DIR__) . '/lib/db.php';
require_once dirname(__DIR__) . '/lib/password.php';

$email = strtolower(trim($argv[1] ?? getenv('ADMIN_EMAIL') ?: ''));
$password = (string) ($argv[2] ?? getenv('ADMIN_PASSWORD') ?: '');
$name = trim(getenv('ADMIN_NAME') ?: 'Site Administrator');
$company = admin_config()['company_code'];

if ($email === '' || $password === '') {
    fwrite(STDERR, "Usage: php bin/create-admin.php email@example.com 'your-password'\n");
    exit(1);
}

$db = admin_db();
$stmt = $db->prepare('SELECT id FROM admins WHERE email = ?');
$stmt->execute([$email]);
$existing = $stmt->fetch();

if ($existing) {
    $db->prepare('UPDATE admins SET password_hash = ?, full_name = ?, company_code = ?, updated_at = datetime(\'now\') WHERE id = ?')
        ->execute([admin_hash_password($password), $name, $company, $existing['id']]);
    echo "Updated admin: {$email}\n";
} else {
    $db->prepare('INSERT INTO admins (id, email, full_name, company_code, password_hash) VALUES (?, ?, ?, ?, ?)')
        ->execute([admin_uuid(), $email, $name, $company, admin_hash_password($password)]);
    echo "Created admin: {$email} (company code {$company})\n";
}
