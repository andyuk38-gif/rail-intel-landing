<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/password.php';
require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/mailer.php';
require_once __DIR__ . '/newsletter.php';

function admin_json($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

function admin_error(string $message, int $status = 400): void
{
    admin_json(['error' => $message], $status);
}

function admin_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function admin_bearer_email(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/i', $header, $m)) {
        return null;
    }
    $claims = admin_verify_session(trim($m[1]));
    return $claims['email'] ?? null;
}

function admin_handle_api(string $method, string $path): void
{
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Authorization, Content-Type');
    if ($method === 'OPTIONS') {
        http_response_code(204);
        exit;
    }

    $public = in_array($path, ['/health', '/auth/validate-login', '/auth/login', '/public/newsletter/subscribe', '/public/content'], true)
        || str_starts_with($path, '/public/');

    $email = null;
    if (!$public) {
        $email = admin_bearer_email();
        if (!$email) {
            admin_error('Authorization required. Send session token as Bearer token.', 401);
        }
    }

    $cfg = admin_config();
    $db = admin_db();

    if ($method === 'GET' && $path === '/health') {
        admin_json(['ok' => true, 'service' => 'rail-intel-site-admin-php']);
    }

    if ($method === 'POST' && $path === '/auth/validate-login') {
        $body = admin_body();
        $company = trim($body['companyCode'] ?? '');
        $userEmail = strtolower(trim($body['email'] ?? ''));
        if ($company !== $cfg['company_code'] || $userEmail === '') {
            admin_error('Invalid company code or email.', 401);
        }
        $stmt = $db->prepare('SELECT email, mfa_enabled FROM admins WHERE email = ? AND company_code = ?');
        $stmt->execute([$userEmail, $company]);
        $admin = $stmt->fetch();
        if (!$admin) {
            admin_error('No account found for this email and company code.', 401);
        }
        admin_json(['ok' => true, 'email' => $admin['email'], 'mfaRequired' => (bool) $admin['mfa_enabled']]);
    }

    if ($method === 'POST' && $path === '/auth/login') {
        $body = admin_body();
        $company = trim($body['companyCode'] ?? '');
        $userEmail = strtolower(trim($body['email'] ?? ''));
        $password = (string) ($body['password'] ?? '');
        if ($company !== $cfg['company_code']) {
            admin_error('Invalid company code.', 401);
        }
        $stmt = $db->prepare('SELECT * FROM admins WHERE email = ? AND company_code = ?');
        $stmt->execute([$userEmail, $company]);
        $admin = $stmt->fetch();
        if (!$admin || !admin_verify_password($password, $admin['password_hash'])) {
            admin_error('Invalid email or password.', 401);
        }
        $token = admin_sign_session($userEmail, ['company_code' => $company]);
        admin_audit($userEmail, 'login', 'admin', $admin['id']);
        admin_json(['token' => $token, 'email' => $userEmail, 'companyCode' => $company, 'mfa' => false]);
    }

    if ($method === 'GET' && $path === '/auth/me') {
        $stmt = $db->prepare('SELECT id, email, full_name, company_code, mfa_enabled FROM admins WHERE email = ?');
        $stmt->execute([$email]);
        $admin = $stmt->fetch();
        if (!$admin) {
            admin_error('Account not found.', 404);
        }
        admin_json([
            'id' => $admin['id'],
            'email' => $admin['email'],
            'fullName' => $admin['full_name'],
            'companyCode' => $admin['company_code'],
            'mfaEnabled' => (bool) $admin['mfa_enabled'],
        ]);
    }

    if ($method === 'GET' && $path === '/dashboard/stats') {
        admin_json([
            'subscribers' => (int) $db->query("SELECT COUNT(*) FROM newsletter_subscribers WHERE status = 'active'")->fetchColumn(),
            'campaigns' => (int) $db->query('SELECT COUNT(*) FROM newsletter_campaigns')->fetchColumn(),
            'contentBlocks' => (int) $db->query('SELECT COUNT(*) FROM content_blocks')->fetchColumn(),
            'media' => (int) $db->query('SELECT COUNT(*) FROM media_assets')->fetchColumn(),
            'mailConfigured' => admin_mail_configured(),
            'recentAudit' => $db->query('SELECT action, actor_email, created_at FROM audit_log ORDER BY created_at DESC LIMIT 8')->fetchAll(),
        ]);
    }

    if ($method === 'GET' && $path === '/content') {
        $blocks = $db->query('SELECT id, key, label, page, field_type, value, published_value, updated_at FROM content_blocks ORDER BY page, label')->fetchAll();
        admin_json(['blocks' => $blocks]);
    }

    if ($method === 'PATCH' && preg_match('#^/content/([^/]+)$#', $path, $m)) {
        $body = admin_body();
        $stmt = $db->prepare('SELECT * FROM content_blocks WHERE id = ?');
        $stmt->execute([$m[1]]);
        $row = $stmt->fetch();
        if (!$row) {
            admin_error('Content block not found.', 404);
        }
        $value = array_key_exists('value', $body) ? (string) $body['value'] : $row['value'];
        $published = !empty($body['publish']) ? $value : $row['published_value'];
        $db->prepare('UPDATE content_blocks SET value = ?, published_value = ?, updated_at = datetime(\'now\'), updated_by = ? WHERE id = ?')
            ->execute([$value, $published, $email, $m[1]]);
        admin_json(['ok' => true]);
    }

    if ($method === 'POST' && $path === '/content/publish-all') {
        $db->prepare('UPDATE content_blocks SET published_value = value, updated_at = datetime(\'now\'), updated_by = ?')->execute([$email]);
        admin_json(['ok' => true]);
    }

    if ($method === 'GET' && $path === '/media') {
        $assets = $db->query('SELECT id, filename, original_name, mime_type, size_bytes, alt_text, created_at FROM media_assets ORDER BY created_at DESC')->fetchAll();
        foreach ($assets as &$asset) {
            $asset['url'] = $cfg['base_path'] . '/uploads/' . $asset['filename'];
        }
        admin_json(['assets' => $assets]);
    }

    if ($method === 'POST' && $path === '/media') {
        if (empty($_FILES['file'])) {
            admin_error('No file uploaded.');
        }
        $file = $_FILES['file'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            admin_error('Upload failed.');
        }
        $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $mime = mime_content_type($file['tmp_name']) ?: $file['type'];
        if (!in_array($mime, $allowed, true)) {
            admin_error('Only image uploads are allowed.');
        }
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = admin_uuid() . ($ext ? '.' . strtolower($ext) : '');
        if (!move_uploaded_file($file['tmp_name'], $cfg['uploads_dir'] . '/' . $filename)) {
            admin_error('Could not save upload.');
        }
        $id = admin_uuid();
        $db->prepare('INSERT INTO media_assets (id, filename, original_name, mime_type, size_bytes, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)')
            ->execute([$id, $filename, $file['name'], $mime, (int) $file['size'], $email]);
        admin_json(['id' => $id, 'url' => $cfg['base_path'] . '/uploads/' . $filename, 'filename' => $filename], 201);
    }

    if ($method === 'GET' && $path === '/newsletter/subscribers') {
        $status = $_GET['status'] ?? 'active';
        $stmt = $db->prepare('SELECT id, email, status, source, subscribed_at FROM newsletter_subscribers WHERE status = ? ORDER BY subscribed_at DESC');
        $stmt->execute([$status]);
        $rows = $stmt->fetchAll();
        admin_json(['subscribers' => $rows, 'total' => count($rows)]);
    }

    if ($method === 'GET' && $path === '/newsletter/campaigns') {
        admin_json(['campaigns' => $db->query('SELECT id, title, subject, preheader, status, recipient_mode, sent_at, created_at, updated_at FROM newsletter_campaigns ORDER BY updated_at DESC')->fetchAll()]);
    }

    if ($method === 'GET' && preg_match('#^/newsletter/campaigns/([^/]+)$#', $path, $m)) {
        $stmt = $db->prepare('SELECT * FROM newsletter_campaigns WHERE id = ?');
        $stmt->execute([$m[1]]);
        $row = $stmt->fetch();
        if (!$row) {
            admin_error('Campaign not found.', 404);
        }
        $row['blocks'] = json_decode($row['blocks_json'] ?? '[]', true);
        $row['recipientEmails'] = json_decode($row['recipient_emails_json'] ?? '[]', true) ?: [];
        admin_json($row);
    }

    if ($method === 'POST' && $path === '/newsletter/campaigns') {
        $body = admin_body();
        $id = admin_uuid();
        $db->prepare('INSERT INTO newsletter_campaigns (id, title, subject, preheader, blocks_json, recipient_mode, recipient_emails_json, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
            ->execute([
                $id,
                $body['title'] ?? 'Untitled',
                $body['subject'] ?? 'Newsletter',
                $body['preheader'] ?? '',
                json_encode($body['blocks'] ?? []),
                $body['recipientMode'] ?? 'all',
                isset($body['recipientEmails']) ? json_encode($body['recipientEmails']) : null,
                $email,
            ]);
        admin_json(['id' => $id], 201);
    }

    if ($method === 'PATCH' && preg_match('#^/newsletter/campaigns/([^/]+)$#', $path, $m)) {
        $body = admin_body();
        $stmt = $db->prepare('SELECT * FROM newsletter_campaigns WHERE id = ?');
        $stmt->execute([$m[1]]);
        $row = $stmt->fetch();
        if (!$row) {
            admin_error('Campaign not found.', 404);
        }
        $db->prepare('UPDATE newsletter_campaigns SET title = ?, subject = ?, preheader = ?, blocks_json = ?, recipient_mode = ?, recipient_emails_json = ?, updated_at = datetime(\'now\') WHERE id = ?')
            ->execute([
                $body['title'] ?? $row['title'],
                $body['subject'] ?? $row['subject'],
                $body['preheader'] ?? $row['preheader'],
                isset($body['blocks']) ? json_encode($body['blocks']) : $row['blocks_json'],
                $body['recipientMode'] ?? $row['recipient_mode'],
                isset($body['recipientEmails']) ? json_encode($body['recipientEmails']) : $row['recipient_emails_json'],
                $m[1],
            ]);
        admin_json(['ok' => true]);
    }

    if ($method === 'POST' && preg_match('#^/newsletter/campaigns/([^/]+)/send$#', $path, $m)) {
        $stmt = $db->prepare('SELECT * FROM newsletter_campaigns WHERE id = ?');
        $stmt->execute([$m[1]]);
        $campaign = $stmt->fetch();
        if (!$campaign) {
            admin_error('Campaign not found.', 404);
        }
        if ($campaign['status'] === 'sent') {
            admin_error('Campaign has already been sent.');
        }
        $recipients = $campaign['recipient_mode'] === 'custom'
            ? array_map(fn($e) => ['id' => null, 'email' => strtolower(trim($e))], json_decode($campaign['recipient_emails_json'] ?? '[]', true) ?: [])
            : $db->query("SELECT id, email FROM newsletter_subscribers WHERE status = 'active'")->fetchAll();
        if (!$recipients) {
            admin_error('No recipients to send to.');
        }
        $html = admin_render_newsletter_html($campaign);
        $sent = 0;
        $failed = 0;
        foreach ($recipients as $recipient) {
            try {
                admin_send_mail($recipient['email'], $campaign['subject'], $html, $campaign['subject']);
                $db->prepare('INSERT INTO newsletter_sends (id, campaign_id, subscriber_id, email, status) VALUES (?, ?, ?, ?, ?)')
                    ->execute([admin_uuid(), $campaign['id'], $recipient['id'], $recipient['email'], 'sent']);
                $sent++;
            } catch (Throwable $err) {
                $db->prepare('INSERT INTO newsletter_sends (id, campaign_id, subscriber_id, email, status, error) VALUES (?, ?, ?, ?, ?, ?)')
                    ->execute([admin_uuid(), $campaign['id'], $recipient['id'], $recipient['email'], 'failed', $err->getMessage()]);
                $failed++;
            }
        }
        $db->prepare("UPDATE newsletter_campaigns SET status = 'sent', sent_at = datetime('now') WHERE id = ?")->execute([$campaign['id']]);
        admin_json(['sent' => $sent, 'failed' => $failed]);
    }

    if ($method === 'POST' && $path === '/public/newsletter/subscribe') {
        $body = admin_body();
        $subEmail = strtolower(trim($body['email'] ?? ''));
        if ($subEmail === '' || !filter_var($subEmail, FILTER_VALIDATE_EMAIL)) {
            admin_error('Please enter a valid email address.');
        }
        $stmt = $db->prepare('SELECT id, status FROM newsletter_subscribers WHERE email = ?');
        $stmt->execute([$subEmail]);
        $existing = $stmt->fetch();
        if ($existing && $existing['status'] === 'active') {
            admin_json(['ok' => true, 'message' => 'You are already subscribed.']);
        }
        if ($existing) {
            $db->prepare("UPDATE newsletter_subscribers SET status = 'active', unsubscribed_at = NULL, subscribed_at = datetime('now') WHERE id = ?")->execute([$existing['id']]);
            admin_json(['ok' => true, 'message' => 'Welcome back — you are subscribed again.']);
        }
        $id = admin_uuid();
        $db->prepare('INSERT INTO newsletter_subscribers (id, email, status, source) VALUES (?, ?, ?, ?)')
            ->execute([$id, $subEmail, 'active', $body['source'] ?? 'website']);
        admin_json(['ok' => true, 'message' => 'Thanks — you are subscribed to Rail Intel news.'], 201);
    }

    if ($method === 'GET' && $path === '/public/content') {
        $rows = $db->query("SELECT key, published_value, field_type FROM content_blocks WHERE published_value IS NOT NULL AND published_value != ''")->fetchAll();
        $content = [];
        foreach ($rows as $row) {
            $content[$row['key']] = ['value' => $row['published_value'], 'type' => $row['field_type']];
        }
        admin_json(['content' => $content]);
    }

    if ($method === 'GET' && $path === '/plugins') {
        $rows = $db->query('SELECT slug, name, version, enabled, config_json, installed_at FROM plugins ORDER BY name')->fetchAll();
        admin_json(['plugins' => array_map(function ($row) {
            return [
                'slug' => $row['slug'],
                'name' => $row['name'],
                'version' => $row['version'],
                'enabled' => (bool) $row['enabled'],
                'config' => json_decode($row['config_json'] ?? '{}', true),
                'installedAt' => $row['installed_at'],
                'loaded' => true,
            ];
        }, $rows)]);
    }

    admin_error('Not found.', 404);
}
