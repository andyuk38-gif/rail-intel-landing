<?php

function admin_cms_configured(): bool
{
    return admin_config()['cms_mail_secret'] !== '';
}

function admin_cms_request(string $method, string $path, ?array $body = null, array $query = []): array
{
    $cfg = admin_config();
    $secret = $cfg['cms_mail_secret'];
    if ($secret === '') {
        throw new RuntimeException('CMS integration is not configured. Set cms_mail_secret in config.local.php (same value as SITE_ADMIN_MAIL_SECRET on CMS).');
    }

    $apiBase = rtrim((string) $cfg['cms_api_url'], '/');
    $url = $apiBase . $path;
    if ($query) {
        $url .= '?' . http_build_query($query);
    }

    $headers = [
        'Accept: application/json',
        'Authorization: Bearer ' . $secret,
    ];
    $payload = null;
    if ($body !== null) {
        $payload = json_encode($body, JSON_UNESCAPED_UNICODE);
        if ($payload === false) {
            throw new RuntimeException('Failed to encode CMS request payload.');
        }
        $headers[] = 'Content-Type: application/json';
    }

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST => strtoupper($method),
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 60,
            CURLOPT_POSTFIELDS => $payload,
        ]);
        $response = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        if ($response === false) {
            throw new RuntimeException('CMS request failed: ' . $curlError);
        }
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => strtoupper($method),
                'header' => implode("\r\n", $headers),
                'content' => $payload ?? '',
                'timeout' => 60,
                'ignore_errors' => true,
            ],
        ]);
        $response = file_get_contents($url, false, $context);
        $status = 0;
        if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) {
            $status = (int) $m[1];
        }
        if ($response === false) {
            throw new RuntimeException('CMS request failed.');
        }
    }

    $data = json_decode($response, true);
    if (!is_array($data)) {
        $data = [];
    }
    if ($status < 200 || $status >= 300) {
        $message = isset($data['error']) ? (string) $data['error'] : 'CMS request failed (HTTP ' . $status . ')';
        throw new RuntimeException($message);
    }

    return $data;
}

function admin_cms_normalize_invoice(array $row): array
{
    $pick = static function (array $keys, $default = '') use ($row) {
        foreach ($keys as $key) {
            if (array_key_exists($key, $row) && $row[$key] !== null && $row[$key] !== '') {
                return $row[$key];
            }
        }
        return $default;
    };

    $net = (float) $pick(['amountNet', 'amount_net', 'net', 'subtotal']);
    $vat = (float) $pick(['vatAmount', 'vat_amount', 'vat']);
    $gross = (float) $pick(['amountGross', 'amount_gross', 'gross', 'total']);
    $rate = (float) $pick(['vatRate', 'vat_rate'], 20);

    if ($gross <= 0 && $net > 0) {
        $rate = max(0, $rate);
        $vat = round($net * ($rate / 100), 2);
        $gross = round($net + $vat, 2);
    } elseif ($net <= 0 && $gross > 0) {
        if ($vat > 0) {
            $net = round($gross - $vat, 2);
        } else {
            $derivedNet = round($gross / (1 + ($rate / 100)), 2);
            $vat = round($gross - $derivedNet, 2);
            $net = $derivedNet;
        }
    }

    $status = strtolower((string) $pick(['status'], 'sent'));
    if (!empty($row['paid']) || !empty($row['isPaid']) || !empty($row['is_paid'])) {
        $status = 'paid';
    }

    return [
        'cmsInvoiceId' => (string) $pick(['id', 'cmsInvoiceId', 'cms_invoice_id']),
        'invoiceNumber' => (string) $pick(['invoiceNumber', 'invoice_number', 'number']),
        'customerName' => (string) $pick(['customerName', 'customer_name', 'clientName'], 'Customer'),
        'customerEmail' => (string) $pick(['customerEmail', 'customer_email', 'email']),
        'issueDate' => (string) $pick(['issueDate', 'issue_date', 'issuedAt', 'createdAt'], date('Y-m-d')),
        'dueDate' => (string) $pick(['dueDate', 'due_date']),
        'product' => (string) $pick(['product', 'productName', 'lineItem']),
        'description' => (string) $pick(['description', 'summary']),
        'amountNet' => $net,
        'vatRate' => $rate,
        'vatAmount' => $vat,
        'amountGross' => $gross,
        'status' => $status,
        'paidDate' => (string) $pick(['paidDate', 'paid_date', 'paidAt']),
        'paymentMethod' => (string) $pick(['paymentMethod', 'payment_method'], 'stripe'),
        'reference' => (string) $pick(['stripeSessionId', 'paymentReference', 'reference']),
    ];
}

function admin_cms_fetch_invoices(string $from, string $to): array
{
    $data = admin_cms_request('GET', '/internal/site-admin/accounting/invoices', null, [
        'from' => $from,
        'to' => $to,
    ]);

    $rows = $data['invoices'] ?? $data['items'] ?? $data;
    if (!is_array($rows)) {
        return [];
    }
    if (isset($rows['invoices']) && is_array($rows['invoices'])) {
        $rows = $rows['invoices'];
    }

    $invoices = [];
    foreach ($rows as $row) {
        if (!is_array($row)) {
            continue;
        }
        $normalized = admin_cms_normalize_invoice($row);
        if ($normalized['cmsInvoiceId'] === '' || $normalized['invoiceNumber'] === '') {
            continue;
        }
        $invoices[] = $normalized;
    }
    return $invoices;
}
