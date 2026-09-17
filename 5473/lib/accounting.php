<?php

require_once __DIR__ . '/cms-client.php';

function admin_accounting_migrate(PDO $db): void
{
    $db->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS accounting_income (
  id TEXT PRIMARY KEY,
  transaction_date TEXT NOT NULL,
  description TEXT NOT NULL,
  customer_name TEXT,
  product TEXT,
  category TEXT NOT NULL DEFAULT 'sales',
  amount_net REAL NOT NULL DEFAULT 0,
  vat_rate REAL NOT NULL DEFAULT 20,
  vat_amount REAL NOT NULL DEFAULT 0,
  amount_gross REAL NOT NULL DEFAULT 0,
  payment_method TEXT,
  reference TEXT,
  invoice_id TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (invoice_id) REFERENCES accounting_invoices(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS accounting_invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  issue_date TEXT NOT NULL,
  due_date TEXT,
  product TEXT,
  description TEXT,
  amount_net REAL NOT NULL DEFAULT 0,
  vat_rate REAL NOT NULL DEFAULT 20,
  vat_amount REAL NOT NULL DEFAULT 0,
  amount_gross REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  paid_date TEXT,
  income_id TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (income_id) REFERENCES accounting_income(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS accounting_expenses (
  id TEXT PRIMARY KEY,
  transaction_date TEXT NOT NULL,
  description TEXT NOT NULL,
  supplier TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  amount_net REAL NOT NULL DEFAULT 0,
  vat_rate REAL NOT NULL DEFAULT 20,
  vat_amount REAL NOT NULL DEFAULT 0,
  amount_gross REAL NOT NULL DEFAULT 0,
  vat_reclaimable INTEGER NOT NULL DEFAULT 1,
  reference TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS accounting_receipts (
  id TEXT PRIMARY KEY,
  expense_id TEXT,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  capture_method TEXT NOT NULL DEFAULT 'upload',
  uploaded_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (expense_id) REFERENCES accounting_expenses(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_income_date ON accounting_income(transaction_date);
CREATE INDEX IF NOT EXISTS idx_expense_date ON accounting_expenses(transaction_date);
CREATE INDEX IF NOT EXISTS idx_invoice_status ON accounting_invoices(status);
CREATE TABLE IF NOT EXISTS accounting_bank_batches (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  bank_name TEXT,
  row_count INTEGER NOT NULL DEFAULT 0,
  imported_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS accounting_bank_transactions (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  transaction_date TEXT NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  balance REAL,
  reference TEXT,
  matched_type TEXT,
  matched_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (batch_id) REFERENCES accounting_bank_batches(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_bank_tx_date ON accounting_bank_transactions(transaction_date);
SQL);

    $cols = $db->query("PRAGMA table_info(admins)")->fetchAll();
    $hasSystemAdmin = false;
    foreach ($cols as $col) {
        if (($col['name'] ?? '') === 'is_system_admin') {
            $hasSystemAdmin = true;
            break;
        }
    }
    if (!$hasSystemAdmin) {
        $db->exec('ALTER TABLE admins ADD COLUMN is_system_admin INTEGER NOT NULL DEFAULT 0');
        $db->exec('UPDATE admins SET is_system_admin = 1');
    }

    $invoiceCols = $db->query("PRAGMA table_info(accounting_invoices)")->fetchAll();
    $hasCmsId = false;
    foreach ($invoiceCols as $col) {
        if (($col['name'] ?? '') === 'cms_invoice_id') {
            $hasCmsId = true;
            break;
        }
    }
    if (!$hasCmsId) {
        $db->exec('ALTER TABLE accounting_invoices ADD COLUMN cms_invoice_id TEXT');
        $db->exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_invoice_cms_id ON accounting_invoices(cms_invoice_id) WHERE cms_invoice_id IS NOT NULL');
    }
}

function admin_is_system_admin(PDO $db, string $email): bool
{
    $stmt = $db->prepare('SELECT is_system_admin FROM admins WHERE email = ?');
    $stmt->execute([$email]);
    $row = $stmt->fetch();
    return $row && (int) $row['is_system_admin'] === 1;
}

function admin_require_system_admin(PDO $db, ?string $email): void
{
    if (!$email || !admin_is_system_admin($db, $email)) {
        admin_error('Accounts access requires system administrator privileges.', 403);
    }
}

function admin_accounting_amounts(float $net, float $vatRate): array
{
    $net = round(max(0, $net), 2);
    $rate = max(0, $vatRate);
    $vat = round($net * ($rate / 100), 2);
    $gross = round($net + $vat, 2);
    return ['amount_net' => $net, 'vat_amount' => $vat, 'amount_gross' => $gross];
}

function admin_accounting_row(array $row): array
{
    foreach (['amount_net', 'vat_rate', 'vat_amount', 'amount_gross'] as $key) {
        if (array_key_exists($key, $row)) {
            $row[$key] = (float) $row[$key];
        }
    }
    if (array_key_exists('vat_reclaimable', $row)) {
        $row['vat_reclaimable'] = (bool) $row['vat_reclaimable'];
    }
    return $row;
}

function admin_accounting_date_filter(string $from, string $to): array
{
    $fromDate = $from !== '' ? $from : date('Y-01-01');
    $toDate = $to !== '' ? $to : date('Y-m-d');
    return [$fromDate, $toDate];
}

function admin_accounting_overview(PDO $db, string $from, string $to): array
{
    [$fromDate, $toDate] = admin_accounting_date_filter($from, $to);

    $incomeStmt = $db->prepare('SELECT COALESCE(SUM(amount_net),0), COALESCE(SUM(vat_amount),0), COALESCE(SUM(amount_gross),0), COUNT(*) FROM accounting_income WHERE transaction_date BETWEEN ? AND ?');
    $incomeStmt->execute([$fromDate, $toDate]);
    [$incomeNet, $incomeVat, $incomeGross, $incomeCount] = $incomeStmt->fetch(PDO::FETCH_NUM);

    $expenseStmt = $db->prepare('SELECT COALESCE(SUM(amount_net),0), COALESCE(SUM(vat_amount),0), COALESCE(SUM(amount_gross),0), COUNT(*) FROM accounting_expenses WHERE transaction_date BETWEEN ? AND ?');
    $expenseStmt->execute([$fromDate, $toDate]);
    [$expenseNet, $expenseVat, $expenseGross, $expenseCount] = $expenseStmt->fetch(PDO::FETCH_NUM);

    $reclaimStmt = $db->prepare('SELECT COALESCE(SUM(vat_amount),0) FROM accounting_expenses WHERE transaction_date BETWEEN ? AND ? AND vat_reclaimable = 1');
    $reclaimStmt->execute([$fromDate, $toDate]);
    $vatReclaimable = (float) $reclaimStmt->fetchColumn();

    $pendingStmt = $db->prepare("SELECT COALESCE(SUM(amount_gross),0), COUNT(*) FROM accounting_invoices WHERE status IN ('draft','sent','overdue') AND issue_date BETWEEN ? AND ?");
    $pendingStmt->execute([$fromDate, $toDate]);
    [$outstandingGross, $outstandingCount] = $pendingStmt->fetch(PDO::FETCH_NUM);

    $monthlyStmt = $db->prepare(<<<'SQL'
SELECT month, SUM(income_gross) AS income_gross, SUM(expense_gross) AS expense_gross FROM (
  SELECT substr(transaction_date, 1, 7) AS month, amount_gross AS income_gross, 0 AS expense_gross FROM accounting_income WHERE transaction_date BETWEEN ? AND ?
  UNION ALL
  SELECT substr(transaction_date, 1, 7) AS month, 0 AS income_gross, amount_gross AS expense_gross FROM accounting_expenses WHERE transaction_date BETWEEN ? AND ?
) GROUP BY month ORDER BY month
SQL);
    $monthlyStmt->execute([$fromDate, $toDate, $fromDate, $toDate]);
    $monthly = array_map(function ($row) {
        return [
            'month' => $row['month'],
            'income' => (float) $row['income_gross'],
            'expenses' => (float) $row['expense_gross'],
        ];
    }, $monthlyStmt->fetchAll());

    $productStmt = $db->prepare(<<<'SQL'
SELECT COALESCE(NULLIF(product, ''), 'Unspecified') AS product, SUM(amount_gross) AS revenue, COUNT(*) AS count
FROM accounting_income WHERE transaction_date BETWEEN ? AND ?
GROUP BY COALESCE(NULLIF(product, ''), 'Unspecified')
ORDER BY revenue DESC
SQL);
    $productStmt->execute([$fromDate, $toDate]);
    $products = array_map(function ($row) {
        return [
            'product' => $row['product'],
            'revenue' => (float) $row['revenue'],
            'count' => (int) $row['count'],
        ];
    }, $productStmt->fetchAll());

    $vatByRateStmt = $db->prepare(<<<'SQL'
SELECT vat_rate, SUM(vat_amount) AS output_vat FROM accounting_income WHERE transaction_date BETWEEN ? AND ? GROUP BY vat_rate
SQL);
    $vatByRateStmt->execute([$fromDate, $toDate]);
    $outputVatByRate = array_map(fn($r) => ['rate' => (float) $r['vat_rate'], 'amount' => (float) $r['output_vat']], $vatByRateStmt->fetchAll());

    return [
        'period' => ['from' => $fromDate, 'to' => $toDate],
        'summary' => [
            'incomeNet' => (float) $incomeNet,
            'incomeVat' => (float) $incomeVat,
            'incomeGross' => (float) $incomeGross,
            'incomeCount' => (int) $incomeCount,
            'expenseNet' => (float) $expenseNet,
            'expenseVat' => (float) $expenseVat,
            'expenseGross' => (float) $expenseGross,
            'expenseCount' => (int) $expenseCount,
            'netProfit' => round((float) $incomeNet - (float) $expenseNet, 2),
            'vatOutput' => (float) $incomeVat,
            'vatInput' => $vatReclaimable,
            'vatDue' => round((float) $incomeVat - $vatReclaimable, 2),
            'outstandingInvoices' => (float) $outstandingGross,
            'outstandingCount' => (int) $outstandingCount,
        ],
        'monthly' => $monthly,
        'productRevenue' => $products,
        'vatOutputByRate' => $outputVatByRate,
    ];
}

function admin_accounting_mark_invoice_paid(PDO $db, string $invoiceId, string $email, ?string $paidDate = null): array
{
    $stmt = $db->prepare('SELECT * FROM accounting_invoices WHERE id = ?');
    $stmt->execute([$invoiceId]);
    $invoice = $stmt->fetch();
    if (!$invoice) {
        admin_error('Invoice not found.', 404);
    }
    if ($invoice['status'] === 'paid' && $invoice['income_id']) {
        admin_error('Invoice is already paid and recorded as income.', 409);
    }

    $paidOn = $paidDate ?: date('Y-m-d');
    $incomeId = admin_uuid();
    $description = 'Invoice ' . $invoice['invoice_number'] . ($invoice['description'] ? ' — ' . $invoice['description'] : '');

    $db->beginTransaction();
    try {
        $db->prepare('INSERT INTO accounting_income (id, transaction_date, description, customer_name, product, category, amount_net, vat_rate, vat_amount, amount_gross, payment_method, reference, invoice_id, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
            ->execute([
                $incomeId,
                $paidOn,
                $description,
                $invoice['customer_name'],
                $invoice['product'],
                'invoice',
                $invoice['amount_net'],
                $invoice['vat_rate'],
                $invoice['vat_amount'],
                $invoice['amount_gross'],
                'invoice',
                $invoice['invoice_number'],
                $invoiceId,
                $invoice['notes'],
                $email,
            ]);
        $db->prepare("UPDATE accounting_invoices SET status = 'paid', paid_date = ?, income_id = ?, updated_at = datetime('now') WHERE id = ?")
            ->execute([$paidOn, $incomeId, $invoiceId]);
        $db->commit();
    } catch (Throwable $e) {
        $db->rollBack();
        throw $e;
    }

    admin_audit($email, 'invoice_paid', 'accounting_invoice', $invoiceId, ['incomeId' => $incomeId]);
    return ['ok' => true, 'incomeId' => $incomeId];
}

function admin_accounting_export_csv(PDO $db, string $type, string $from, string $to): void
{
    [$fromDate, $toDate] = admin_accounting_date_filter($from, $to);
    $filename = 'rail-intel-accounts-' . $type . '-' . $fromDate . '-to-' . $toDate . '.csv';

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');

    $out = fopen('php://output', 'w');
    fprintf($out, chr(0xEF) . chr(0xBB) . chr(0xBF));

    if ($type === 'income' || $type === 'all') {
        fputcsv($out, ['Type', 'Date', 'Description', 'Customer', 'Product', 'Category', 'Net', 'VAT rate %', 'VAT', 'Gross', 'Payment method', 'Reference', 'Notes']);
        $stmt = $db->prepare('SELECT * FROM accounting_income WHERE transaction_date BETWEEN ? AND ? ORDER BY transaction_date');
        $stmt->execute([$fromDate, $toDate]);
        foreach ($stmt->fetchAll() as $row) {
            fputcsv($out, ['Income', $row['transaction_date'], $row['description'], $row['customer_name'], $row['product'], $row['category'], $row['amount_net'], $row['vat_rate'], $row['vat_amount'], $row['amount_gross'], $row['payment_method'], $row['reference'], $row['notes']]);
        }
    }

    if ($type === 'expenses' || $type === 'all') {
        if ($type === 'all') {
            fputcsv($out, []);
        }
        fputcsv($out, ['Type', 'Date', 'Description', 'Supplier', 'Category', 'Net', 'VAT rate %', 'VAT', 'Gross', 'VAT reclaimable', 'Reference', 'Notes']);
        $stmt = $db->prepare('SELECT * FROM accounting_expenses WHERE transaction_date BETWEEN ? AND ? ORDER BY transaction_date');
        $stmt->execute([$fromDate, $toDate]);
        foreach ($stmt->fetchAll() as $row) {
            fputcsv($out, ['Expense', $row['transaction_date'], $row['description'], $row['supplier'], $row['category'], $row['amount_net'], $row['vat_rate'], $row['vat_amount'], $row['amount_gross'], $row['vat_reclaimable'] ? 'Yes' : 'No', $row['reference'], $row['notes']]);
        }
    }

    if ($type === 'vat') {
        fputcsv($out, ['VAT summary', $fromDate, 'to', $toDate]);
        fputcsv($out, ['Output VAT (sales)', '', '', '', '', '', '', '', '']);
        $overview = admin_accounting_overview($db, $fromDate, $toDate);
        fputcsv($out, ['Total output VAT', $overview['summary']['vatOutput']]);
        fputcsv($out, ['Total input VAT (reclaimable)', $overview['summary']['vatInput']]);
        fputcsv($out, ['Net VAT due', $overview['summary']['vatDue']]);
        fputcsv($out, []);
        fputcsv($out, ['Output VAT by rate']);
        foreach ($overview['vatOutputByRate'] as $row) {
            fputcsv($out, ['Rate ' . $row['rate'] . '%', $row['amount']]);
        }
    }

    if ($type === 'invoices') {
        fputcsv($out, ['Invoice #', 'Customer', 'Email', 'Issue date', 'Due date', 'Product', 'Net', 'VAT', 'Gross', 'Status', 'Paid date', 'Notes']);
        $stmt = $db->prepare('SELECT * FROM accounting_invoices WHERE issue_date BETWEEN ? AND ? ORDER BY issue_date');
        $stmt->execute([$fromDate, $toDate]);
        foreach ($stmt->fetchAll() as $row) {
            fputcsv($out, [$row['invoice_number'], $row['customer_name'], $row['customer_email'], $row['issue_date'], $row['due_date'], $row['product'], $row['amount_net'], $row['vat_amount'], $row['amount_gross'], $row['status'], $row['paid_date'], $row['notes']]);
        }
    }

    fclose($out);
    exit;
}

function admin_accounting_upsert_cms_invoice(PDO $db, array $inv, string $email): array
{
    $result = ['action' => 'skipped', 'invoiceNumber' => $inv['invoiceNumber']];

    $stmt = $db->prepare('SELECT * FROM accounting_invoices WHERE cms_invoice_id = ? OR invoice_number = ?');
    $stmt->execute([$inv['cmsInvoiceId'], $inv['invoiceNumber']]);
    $existing = $stmt->fetch();

    $status = $inv['status'] === 'paid' ? 'paid' : ($inv['status'] === 'overdue' ? 'overdue' : 'sent');
    $issueDate = substr($inv['issueDate'], 0, 10) ?: date('Y-m-d');

    if ($existing) {
        $db->prepare('UPDATE accounting_invoices SET customer_name = ?, customer_email = ?, issue_date = ?, due_date = ?, product = ?, description = ?, amount_net = ?, vat_rate = ?, vat_amount = ?, amount_gross = ?, status = ?, cms_invoice_id = ?, notes = ?, updated_at = datetime(\'now\') WHERE id = ?')
            ->execute([
                $inv['customerName'],
                $inv['customerEmail'],
                $issueDate,
                $inv['dueDate'] ?: null,
                $inv['product'],
                $inv['description'],
                $inv['amountNet'],
                $inv['vatRate'],
                $inv['vatAmount'],
                $inv['amountGross'],
                $existing['status'] === 'paid' ? 'paid' : $status,
                $inv['cmsInvoiceId'],
                'Synced from CMS',
                $existing['id'],
            ]);
        $invoiceId = $existing['id'];
        $result['action'] = 'updated';
    } else {
        $invoiceId = admin_uuid();
        $db->prepare('INSERT INTO accounting_invoices (id, invoice_number, customer_name, customer_email, issue_date, due_date, product, description, amount_net, vat_rate, vat_amount, amount_gross, status, cms_invoice_id, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
            ->execute([
                $invoiceId,
                $inv['invoiceNumber'],
                $inv['customerName'],
                $inv['customerEmail'],
                $issueDate,
                $inv['dueDate'] ?: null,
                $inv['product'],
                $inv['description'],
                $inv['amountNet'],
                $inv['vatRate'],
                $inv['vatAmount'],
                $inv['amountGross'],
                $status,
                $inv['cmsInvoiceId'],
                'Synced from CMS',
                $email,
            ]);
        $result['action'] = 'created';
    }

    if ($inv['status'] === 'paid') {
        $check = $db->prepare('SELECT status, income_id FROM accounting_invoices WHERE id = ?');
        $check->execute([$invoiceId]);
        $row = $check->fetch();
        if ($row && $row['status'] !== 'paid') {
            admin_accounting_mark_invoice_paid($db, $invoiceId, $email, $inv['paidDate'] ?: null);
            $result['action'] = 'paid';
        } elseif ($row && $row['status'] === 'paid' && !$row['income_id']) {
            admin_accounting_mark_invoice_paid($db, $invoiceId, $email, $inv['paidDate'] ?: null);
            $result['action'] = 'paid';
        }
    }

    return $result;
}

function admin_accounting_sync_cms(PDO $db, string $email, string $from, string $to): array
{
    [$fromDate, $toDate] = admin_accounting_date_filter($from, $to);
    $invoices = admin_cms_fetch_invoices($fromDate, $toDate);
    $summary = ['fetched' => count($invoices), 'created' => 0, 'updated' => 0, 'paid' => 0, 'skipped' => 0, 'errors' => []];

    foreach ($invoices as $inv) {
        try {
            $result = admin_accounting_upsert_cms_invoice($db, $inv, $email);
            if ($result['action'] === 'created') {
                $summary['created']++;
            } elseif ($result['action'] === 'updated') {
                $summary['updated']++;
            } elseif ($result['action'] === 'paid') {
                $summary['paid']++;
            } else {
                $summary['skipped']++;
            }
        } catch (Throwable $e) {
            $summary['errors'][] = ($inv['invoiceNumber'] ?? 'unknown') . ': ' . $e->getMessage();
        }
    }

    admin_audit($email, 'cms_invoice_sync', 'accounting', null, $summary);
    return $summary;
}

function admin_accounting_parse_csv_line(string $line): array
{
    return str_getcsv($line);
}

function admin_accounting_detect_bank_columns(array $headers): array
{
    $map = ['date' => null, 'description' => null, 'amount' => null, 'credit' => null, 'debit' => null, 'balance' => null];
    foreach ($headers as $i => $header) {
        $h = strtolower(trim((string) $header));
        if ($h === '') {
            continue;
        }
        if ($map['date'] === null && preg_match('/date|posted|completed/', $h)) {
            $map['date'] = $i;
        }
        if ($map['description'] === null && preg_match('/description|details|narrative|memo|particulars|transaction/', $h)) {
            $map['description'] = $i;
        }
        if ($map['amount'] === null && preg_match('/^amount$|value|transaction amount/', $h)) {
            $map['amount'] = $i;
        }
        if ($map['credit'] === null && preg_match('/money in|credit|paid in|deposit/', $h)) {
            $map['credit'] = $i;
        }
        if ($map['debit'] === null && preg_match('/money out|debit|paid out|withdrawn|spend/', $h)) {
            $map['debit'] = $i;
        }
        if ($map['balance'] === null && preg_match('/balance|running balance/', $h)) {
            $map['balance'] = $i;
        }
    }
    return $map;
}

function admin_accounting_parse_money(?string $value): ?float
{
    if ($value === null || trim($value) === '') {
        return null;
    }
    $clean = str_replace(["\xc2\xa3", '£', ',', ' '], '', trim($value));
    if ($clean === '' || $clean === '-') {
        return null;
    }
    return (float) $clean;
}

function admin_accounting_parse_bank_date(string $value): ?string
{
    $value = trim($value);
    if ($value === '') {
        return null;
    }
    if (preg_match('/^(\d{4})-(\d{2})-(\d{2})/', $value, $m)) {
        return $m[1] . '-' . $m[2] . '-' . $m[3];
    }
    if (preg_match('#^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})#', $value, $m)) {
        $year = (int) $m[3];
        if ($year < 100) {
            $year += 2000;
        }
        return sprintf('%04d-%02d-%02d', $year, (int) $m[2], (int) $m[1]);
    }
    $ts = strtotime($value);
    return $ts ? date('Y-m-d', $ts) : null;
}

function admin_accounting_import_bank_csv(PDO $db, string $csv, string $filename, string $email, ?string $bankName = null): array
{
    $lines = preg_split('/\r\n|\r|\n/', trim($csv)) ?: [];
    if (count($lines) < 2) {
        admin_error('CSV must include a header row and at least one transaction.');
    }

    $headers = admin_accounting_parse_csv_line($lines[0]);
    $columns = admin_accounting_detect_bank_columns($headers);
    if ($columns['date'] === null || $columns['description'] === null || ($columns['amount'] === null && $columns['credit'] === null && $columns['debit'] === null)) {
        admin_error('Could not detect date, description and amount columns. Expected headers like Date, Description, Amount (or Money in / Money out).');
    }

    $batchId = admin_uuid();
    $db->prepare('INSERT INTO accounting_bank_batches (id, filename, bank_name, row_count, imported_by) VALUES (?, ?, ?, ?, ?)')
        ->execute([$batchId, $filename, $bankName, 0, $email]);

    $insert = $db->prepare('INSERT INTO accounting_bank_transactions (id, batch_id, transaction_date, description, amount, balance, reference) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $imported = 0;
    $skipped = 0;

    for ($i = 1, $n = count($lines); $i < $n; $i++) {
        if (trim($lines[$i]) === '') {
            continue;
        }
        $cols = admin_accounting_parse_csv_line($lines[$i]);
        $date = admin_accounting_parse_bank_date((string) ($cols[$columns['date']] ?? ''));
        $description = trim((string) ($cols[$columns['description']] ?? ''));
        if (!$date || $description === '') {
            $skipped++;
            continue;
        }

        $amount = null;
        if ($columns['amount'] !== null) {
            $amount = admin_accounting_parse_money((string) ($cols[$columns['amount']] ?? ''));
        } else {
            $credit = admin_accounting_parse_money((string) ($cols[$columns['credit']] ?? ''));
            $debit = admin_accounting_parse_money((string) ($cols[$columns['debit']] ?? ''));
            if ($credit !== null && $credit != 0) {
                $amount = abs($credit);
            } elseif ($debit !== null && $debit != 0) {
                $amount = -abs($debit);
            }
        }
        if ($amount === null || $amount == 0) {
            $skipped++;
            continue;
        }

        $balance = $columns['balance'] !== null ? admin_accounting_parse_money((string) ($cols[$columns['balance']] ?? '')) : null;
        $insert->execute([admin_uuid(), $batchId, $date, $description, $amount, $balance, '']);
        $imported++;
    }

    $db->prepare('UPDATE accounting_bank_batches SET row_count = ? WHERE id = ?')->execute([$imported, $batchId]);
    admin_audit($email, 'bank_csv_import', 'accounting_bank_batch', $batchId, ['imported' => $imported, 'skipped' => $skipped]);

    return ['batchId' => $batchId, 'imported' => $imported, 'skipped' => $skipped];
}

function admin_accounting_reconciliation(PDO $db, string $from, string $to): array
{
    [$fromDate, $toDate] = admin_accounting_date_filter($from, $to);

    $bankStmt = $db->prepare('SELECT * FROM accounting_bank_transactions WHERE transaction_date BETWEEN ? AND ? ORDER BY transaction_date DESC, created_at DESC');
    $bankStmt->execute([$fromDate, $toDate]);
    $bankRows = $bankStmt->fetchAll();

    $incomeStmt = $db->prepare('SELECT id, transaction_date, description, amount_gross, reference FROM accounting_income WHERE transaction_date BETWEEN ? AND ?');
    $incomeStmt->execute([$fromDate, $toDate]);
    $incomeRows = $incomeStmt->fetchAll();

    $expenseStmt = $db->prepare('SELECT id, transaction_date, description, amount_gross, reference FROM accounting_expenses WHERE transaction_date BETWEEN ? AND ?');
    $expenseStmt->execute([$fromDate, $toDate]);
    $expenseRows = $expenseStmt->fetchAll();

    $matchedIncomeIds = [];
    $matchedExpenseIds = [];
    $bank = [];

    foreach ($bankRows as $row) {
        $entry = admin_accounting_row($row);
        $entry['matchedLabel'] = null;

        if ($row['matched_type'] && $row['matched_id']) {
            $entry['matchedLabel'] = ucfirst($row['matched_type']) . ' linked';
            if ($row['matched_type'] === 'income') {
                $matchedIncomeIds[$row['matched_id']] = true;
            }
            if ($row['matched_type'] === 'expense') {
                $matchedExpenseIds[$row['matched_id']] = true;
            }
            $bank[] = $entry;
            continue;
        }

        $targetAmount = abs((float) $row['amount']);
        $isCredit = (float) $row['amount'] > 0;
        $candidates = $isCredit ? $incomeRows : $expenseRows;
        $match = null;

        foreach ($candidates as $candidate) {
            $idKey = $candidate['id'];
            if ($isCredit && isset($matchedIncomeIds[$idKey])) {
                continue;
            }
            if (!$isCredit && isset($matchedExpenseIds[$idKey])) {
                continue;
            }
            if (abs((float) $candidate['amount_gross'] - $targetAmount) > 0.01) {
                continue;
            }
            $dayDiff = abs(strtotime($candidate['transaction_date']) - strtotime($row['transaction_date'])) / 86400;
            if ($dayDiff > 5) {
                continue;
            }
            $match = $candidate;
            break;
        }

        if ($match) {
            $entry['suggestedMatch'] = [
                'type' => $isCredit ? 'income' : 'expense',
                'id' => $match['id'],
                'label' => $match['description'],
                'date' => $match['transaction_date'],
                'amount' => (float) $match['amount_gross'],
            ];
            if ($isCredit) {
                $matchedIncomeIds[$match['id']] = true;
            } else {
                $matchedExpenseIds[$match['id']] = true;
            }
        }

        $bank[] = $entry;
    }

    $unmatchedIncome = array_values(array_filter($incomeRows, fn($r) => !isset($matchedIncomeIds[$r['id']])));
    $unmatchedExpenses = array_values(array_filter($expenseRows, fn($r) => !isset($matchedExpenseIds[$r['id']])));

    return [
        'period' => ['from' => $fromDate, 'to' => $toDate],
        'bank' => $bank,
        'unmatchedIncome' => array_map(function ($r) {
            return ['id' => $r['id'], 'date' => $r['transaction_date'], 'description' => $r['description'], 'amount' => (float) $r['amount_gross']];
        }, $unmatchedIncome),
        'unmatchedExpenses' => array_map(function ($r) {
            return ['id' => $r['id'], 'date' => $r['transaction_date'], 'description' => $r['description'], 'amount' => (float) $r['amount_gross']];
        }, $unmatchedExpenses),
        'stats' => [
            'bankCount' => count($bank),
            'suggestedMatches' => count(array_filter($bank, fn($b) => !empty($b['suggestedMatch']))),
            'unmatchedIncome' => count($unmatchedIncome),
            'unmatchedExpenses' => count($unmatchedExpenses),
        ],
    ];
}

function admin_accounting_match_bank(PDO $db, string $bankTxId, string $type, string $matchedId): void
{
    if (!in_array($type, ['income', 'expense'], true)) {
        admin_error('Match type must be income or expense.');
    }
    $table = $type === 'income' ? 'accounting_income' : 'accounting_expenses';
    $check = $db->prepare("SELECT id FROM {$table} WHERE id = ?");
    $check->execute([$matchedId]);
    if (!$check->fetch()) {
        admin_error('Matched record not found.', 404);
    }
    $db->prepare('UPDATE accounting_bank_transactions SET matched_type = ?, matched_id = ? WHERE id = ?')
        ->execute([$type, $matchedId, $bankTxId]);
}

function admin_handle_accounting(string $method, string $path, PDO $db, ?string $email, array $cfg): bool
{
    if (!str_starts_with($path, '/accounts')) {
        return false;
    }

    admin_require_system_admin($db, $email);

    $from = trim($_GET['from'] ?? '');
    $to = trim($_GET['to'] ?? '');

    if ($method === 'GET' && $path === '/accounts/overview') {
        admin_json(admin_accounting_overview($db, $from, $to));
    }

    if ($method === 'GET' && $path === '/accounts/income') {
        [$fromDate, $toDate] = admin_accounting_date_filter($from, $to);
        $stmt = $db->prepare('SELECT * FROM accounting_income WHERE transaction_date BETWEEN ? AND ? ORDER BY transaction_date DESC, created_at DESC');
        $stmt->execute([$fromDate, $toDate]);
        admin_json(['items' => array_map('admin_accounting_row', $stmt->fetchAll()), 'period' => ['from' => $fromDate, 'to' => $toDate]]);
    }

    if ($method === 'POST' && $path === '/accounts/income') {
        $body = admin_body();
        $amounts = admin_accounting_amounts((float) ($body['amountNet'] ?? 0), (float) ($body['vatRate'] ?? 20));
        $id = admin_uuid();
        $date = trim($body['transactionDate'] ?? '') ?: date('Y-m-d');
        $db->prepare('INSERT INTO accounting_income (id, transaction_date, description, customer_name, product, category, amount_net, vat_rate, vat_amount, amount_gross, payment_method, reference, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
            ->execute([
                $id,
                $date,
                trim($body['description'] ?? '') ?: 'Income',
                trim($body['customerName'] ?? ''),
                trim($body['product'] ?? ''),
                trim($body['category'] ?? '') ?: 'sales',
                $amounts['amount_net'],
                (float) ($body['vatRate'] ?? 20),
                $amounts['vat_amount'],
                $amounts['amount_gross'],
                trim($body['paymentMethod'] ?? ''),
                trim($body['reference'] ?? ''),
                trim($body['notes'] ?? ''),
                $email,
            ]);
        admin_audit($email, 'income_created', 'accounting_income', $id);
        admin_json(['id' => $id], 201);
    }

    if ($method === 'PATCH' && preg_match('#^/accounts/income/([^/]+)$#', $path, $m)) {
        $body = admin_body();
        $stmt = $db->prepare('SELECT * FROM accounting_income WHERE id = ?');
        $stmt->execute([$m[1]]);
        $row = $stmt->fetch();
        if (!$row) {
            admin_error('Income record not found.', 404);
        }
        $net = array_key_exists('amountNet', $body) ? (float) $body['amountNet'] : (float) $row['amount_net'];
        $rate = array_key_exists('vatRate', $body) ? (float) $body['vatRate'] : (float) $row['vat_rate'];
        $amounts = admin_accounting_amounts($net, $rate);
        $db->prepare('UPDATE accounting_income SET transaction_date = ?, description = ?, customer_name = ?, product = ?, category = ?, amount_net = ?, vat_rate = ?, vat_amount = ?, amount_gross = ?, payment_method = ?, reference = ?, notes = ?, updated_at = datetime(\'now\') WHERE id = ?')
            ->execute([
                trim($body['transactionDate'] ?? '') ?: $row['transaction_date'],
                trim($body['description'] ?? '') ?: $row['description'],
                array_key_exists('customerName', $body) ? trim($body['customerName']) : $row['customer_name'],
                array_key_exists('product', $body) ? trim($body['product']) : $row['product'],
                trim($body['category'] ?? '') ?: $row['category'],
                $amounts['amount_net'],
                $rate,
                $amounts['vat_amount'],
                $amounts['amount_gross'],
                array_key_exists('paymentMethod', $body) ? trim($body['paymentMethod']) : $row['payment_method'],
                array_key_exists('reference', $body) ? trim($body['reference']) : $row['reference'],
                array_key_exists('notes', $body) ? trim($body['notes']) : $row['notes'],
                $m[1],
            ]);
        admin_json(['ok' => true]);
    }

    if ($method === 'DELETE' && preg_match('#^/accounts/income/([^/]+)$#', $path, $m)) {
        $db->prepare('DELETE FROM accounting_income WHERE id = ?')->execute([$m[1]]);
        admin_json(['ok' => true]);
    }

    if ($method === 'GET' && $path === '/accounts/expenses') {
        [$fromDate, $toDate] = admin_accounting_date_filter($from, $to);
        $stmt = $db->prepare(<<<'SQL'
SELECT e.*, r.id AS receipt_id, r.filename AS receipt_filename
FROM accounting_expenses e
LEFT JOIN accounting_receipts r ON r.id = (
  SELECT id FROM accounting_receipts WHERE expense_id = e.id ORDER BY created_at DESC LIMIT 1
)
WHERE e.transaction_date BETWEEN ? AND ?
ORDER BY e.transaction_date DESC, e.created_at DESC
SQL);
        $stmt->execute([$fromDate, $toDate]);
        $items = array_map(function ($row) use ($cfg) {
            $mapped = admin_accounting_row($row);
            if ($row['receipt_filename']) {
                $mapped['receiptUrl'] = $cfg['base_path'] . '/uploads/' . $row['receipt_filename'];
            }
            return $mapped;
        }, $stmt->fetchAll());
        admin_json(['items' => $items, 'period' => ['from' => $fromDate, 'to' => $toDate]]);
    }

    if ($method === 'POST' && $path === '/accounts/expenses') {
        $body = admin_body();
        $amounts = admin_accounting_amounts((float) ($body['amountNet'] ?? 0), (float) ($body['vatRate'] ?? 20));
        $id = admin_uuid();
        $date = trim($body['transactionDate'] ?? '') ?: date('Y-m-d');
        $db->prepare('INSERT INTO accounting_expenses (id, transaction_date, description, supplier, category, amount_net, vat_rate, vat_amount, amount_gross, vat_reclaimable, reference, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
            ->execute([
                $id,
                $date,
                trim($body['description'] ?? '') ?: 'Expense',
                trim($body['supplier'] ?? ''),
                trim($body['category'] ?? '') ?: 'general',
                $amounts['amount_net'],
                (float) ($body['vatRate'] ?? 20),
                $amounts['vat_amount'],
                $amounts['amount_gross'],
                !empty($body['vatReclaimable']) ? 1 : 0,
                trim($body['reference'] ?? ''),
                trim($body['notes'] ?? ''),
                $email,
            ]);
        admin_audit($email, 'expense_created', 'accounting_expense', $id);
        admin_json(['id' => $id], 201);
    }

    if ($method === 'PATCH' && preg_match('#^/accounts/expenses/([^/]+)$#', $path, $m)) {
        $body = admin_body();
        $stmt = $db->prepare('SELECT * FROM accounting_expenses WHERE id = ?');
        $stmt->execute([$m[1]]);
        $row = $stmt->fetch();
        if (!$row) {
            admin_error('Expense record not found.', 404);
        }
        $net = array_key_exists('amountNet', $body) ? (float) $body['amountNet'] : (float) $row['amount_net'];
        $rate = array_key_exists('vatRate', $body) ? (float) $body['vatRate'] : (float) $row['vat_rate'];
        $amounts = admin_accounting_amounts($net, $rate);
        $db->prepare('UPDATE accounting_expenses SET transaction_date = ?, description = ?, supplier = ?, category = ?, amount_net = ?, vat_rate = ?, vat_amount = ?, amount_gross = ?, vat_reclaimable = ?, reference = ?, notes = ?, updated_at = datetime(\'now\') WHERE id = ?')
            ->execute([
                trim($body['transactionDate'] ?? '') ?: $row['transaction_date'],
                trim($body['description'] ?? '') ?: $row['description'],
                array_key_exists('supplier', $body) ? trim($body['supplier']) : $row['supplier'],
                trim($body['category'] ?? '') ?: $row['category'],
                $amounts['amount_net'],
                $rate,
                $amounts['vat_amount'],
                $amounts['amount_gross'],
                array_key_exists('vatReclaimable', $body) ? (!empty($body['vatReclaimable']) ? 1 : 0) : (int) $row['vat_reclaimable'],
                array_key_exists('reference', $body) ? trim($body['reference']) : $row['reference'],
                array_key_exists('notes', $body) ? trim($body['notes']) : $row['notes'],
                $m[1],
            ]);
        admin_json(['ok' => true]);
    }

    if ($method === 'DELETE' && preg_match('#^/accounts/expenses/([^/]+)$#', $path, $m)) {
        $db->prepare('DELETE FROM accounting_expenses WHERE id = ?')->execute([$m[1]]);
        admin_json(['ok' => true]);
    }

    if ($method === 'GET' && $path === '/accounts/invoices') {
        [$fromDate, $toDate] = admin_accounting_date_filter($from, $to);
        $stmt = $db->prepare('SELECT * FROM accounting_invoices WHERE issue_date BETWEEN ? AND ? ORDER BY issue_date DESC, created_at DESC');
        $stmt->execute([$fromDate, $toDate]);
        admin_json(['items' => array_map('admin_accounting_row', $stmt->fetchAll()), 'period' => ['from' => $fromDate, 'to' => $toDate]]);
    }

    if ($method === 'POST' && $path === '/accounts/invoices') {
        $body = admin_body();
        $invoiceNumber = trim($body['invoiceNumber'] ?? '');
        if ($invoiceNumber === '') {
            admin_error('Invoice number is required.');
        }
        $amounts = admin_accounting_amounts((float) ($body['amountNet'] ?? 0), (float) ($body['vatRate'] ?? 20));
        $id = admin_uuid();
        $issueDate = trim($body['issueDate'] ?? '') ?: date('Y-m-d');
        $status = trim($body['status'] ?? '') ?: 'draft';
        try {
            $db->prepare('INSERT INTO accounting_invoices (id, invoice_number, customer_name, customer_email, issue_date, due_date, product, description, amount_net, vat_rate, vat_amount, amount_gross, status, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
                ->execute([
                    $id,
                    $invoiceNumber,
                    trim($body['customerName'] ?? '') ?: 'Customer',
                    trim($body['customerEmail'] ?? ''),
                    $issueDate,
                    trim($body['dueDate'] ?? ''),
                    trim($body['product'] ?? ''),
                    trim($body['description'] ?? ''),
                    $amounts['amount_net'],
                    (float) ($body['vatRate'] ?? 20),
                    $amounts['vat_amount'],
                    $amounts['amount_gross'],
                    $status,
                    trim($body['notes'] ?? ''),
                    $email,
                ]);
        } catch (PDOException $e) {
            if (str_contains($e->getMessage(), 'UNIQUE')) {
                admin_error('An invoice with this number already exists.');
            }
            throw $e;
        }
        admin_audit($email, 'invoice_created', 'accounting_invoice', $id);
        admin_json(['id' => $id], 201);
    }

    if ($method === 'PATCH' && preg_match('#^/accounts/invoices/([^/]+)$#', $path, $m)) {
        $body = admin_body();
        $stmt = $db->prepare('SELECT * FROM accounting_invoices WHERE id = ?');
        $stmt->execute([$m[1]]);
        $row = $stmt->fetch();
        if (!$row) {
            admin_error('Invoice not found.', 404);
        }
        $net = array_key_exists('amountNet', $body) ? (float) $body['amountNet'] : (float) $row['amount_net'];
        $rate = array_key_exists('vatRate', $body) ? (float) $body['vatRate'] : (float) $row['vat_rate'];
        $amounts = admin_accounting_amounts($net, $rate);
        $newStatus = trim($body['status'] ?? '') ?: $row['status'];
        $db->prepare('UPDATE accounting_invoices SET invoice_number = ?, customer_name = ?, customer_email = ?, issue_date = ?, due_date = ?, product = ?, description = ?, amount_net = ?, vat_rate = ?, vat_amount = ?, amount_gross = ?, status = ?, notes = ?, updated_at = datetime(\'now\') WHERE id = ?')
            ->execute([
                trim($body['invoiceNumber'] ?? '') ?: $row['invoice_number'],
                trim($body['customerName'] ?? '') ?: $row['customer_name'],
                array_key_exists('customerEmail', $body) ? trim($body['customerEmail']) : $row['customer_email'],
                trim($body['issueDate'] ?? '') ?: $row['issue_date'],
                array_key_exists('dueDate', $body) ? trim($body['dueDate']) : $row['due_date'],
                array_key_exists('product', $body) ? trim($body['product']) : $row['product'],
                array_key_exists('description', $body) ? trim($body['description']) : $row['description'],
                $amounts['amount_net'],
                $rate,
                $amounts['vat_amount'],
                $amounts['amount_gross'],
                $newStatus,
                array_key_exists('notes', $body) ? trim($body['notes']) : $row['notes'],
                $m[1],
            ]);
        admin_json(['ok' => true]);
    }

    if ($method === 'POST' && preg_match('#^/accounts/invoices/([^/]+)/pay$#', $path, $m)) {
        $body = admin_body();
        admin_json(admin_accounting_mark_invoice_paid($db, $m[1], $email, trim($body['paidDate'] ?? '') ?: null));
    }

    if ($method === 'DELETE' && preg_match('#^/accounts/invoices/([^/]+)$#', $path, $m)) {
        $stmt = $db->prepare('SELECT status, income_id FROM accounting_invoices WHERE id = ?');
        $stmt->execute([$m[1]]);
        $row = $stmt->fetch();
        if (!$row) {
            admin_error('Invoice not found.', 404);
        }
        if ($row['status'] === 'paid') {
            admin_error('Cannot delete a paid invoice. Remove the linked income record first.', 409);
        }
        $db->prepare('DELETE FROM accounting_invoices WHERE id = ?')->execute([$m[1]]);
        admin_json(['ok' => true]);
    }

    if ($method === 'GET' && $path === '/accounts/receipts') {
        $rows = $db->query('SELECT r.*, e.description AS expense_description FROM accounting_receipts r LEFT JOIN accounting_expenses e ON e.id = r.expense_id ORDER BY r.created_at DESC LIMIT 100')->fetchAll();
        foreach ($rows as &$row) {
            $row['url'] = $cfg['base_path'] . '/uploads/' . $row['filename'];
        }
        admin_json(['items' => $rows]);
    }

    if ($method === 'POST' && $path === '/accounts/receipts') {
        if (empty($_FILES['file'])) {
            admin_error('No file uploaded.');
        }
        $file = $_FILES['file'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            admin_error('Upload failed.');
        }
        $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'];
        $mime = mime_content_type($file['tmp_name']) ?: $file['type'];
        if (!in_array($mime, $allowed, true)) {
            admin_error('Only images and PDF receipts are allowed.');
        }
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'receipt-' . admin_uuid() . ($ext ? '.' . strtolower($ext) : '');
        if (!move_uploaded_file($file['tmp_name'], $cfg['uploads_dir'] . '/' . $filename)) {
            admin_error('Could not save upload.');
        }
        $id = admin_uuid();
        $expenseId = trim($_POST['expenseId'] ?? '') ?: null;
        $captureMethod = trim($_POST['captureMethod'] ?? '') ?: 'upload';
        $db->prepare('INSERT INTO accounting_receipts (id, expense_id, filename, original_name, mime_type, size_bytes, capture_method, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
            ->execute([$id, $expenseId, $filename, $file['name'], $mime, (int) $file['size'], $captureMethod, $email]);
        admin_json([
            'id' => $id,
            'url' => $cfg['base_path'] . '/uploads/' . $filename,
            'expenseId' => $expenseId,
        ], 201);
    }

    if ($method === 'GET' && preg_match('#^/accounts/export/([^/]+)$#', $path, $m)) {
        $type = $m[1];
        if (!in_array($type, ['income', 'expenses', 'invoices', 'vat', 'all'], true)) {
            admin_error('Invalid export type.');
        }
        admin_accounting_export_csv($db, $type, $from, $to);
    }

    if ($method === 'GET' && $path === '/accounts/categories') {
        admin_json([
            'income' => ['sales', 'subscription', 'consulting', 'training', 'support', 'other'],
            'expense' => ['software', 'hosting', 'travel', 'office', 'marketing', 'professional', 'insurance', 'general'],
            'products' => ['Rail Intel CMS', 'Competency module', 'QA module', 'Training', 'Support retainer', 'Custom development'],
            'vatRates' => [20, 5, 0],
            'paymentMethods' => ['bank_transfer', 'card', 'stripe', 'cash', 'direct_debit', 'other'],
            'cmsConfigured' => admin_cms_configured(),
        ]);
    }

    if ($method === 'POST' && $path === '/accounts/cms/sync') {
        try {
            admin_json(admin_accounting_sync_cms($db, $email, $from, $to));
        } catch (Throwable $e) {
            admin_error($e->getMessage(), 502);
        }
    }

    if ($method === 'POST' && $path === '/accounts/bank/import') {
        if (empty($_FILES['file'])) {
            admin_error('No CSV file uploaded.');
        }
        $file = $_FILES['file'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            admin_error('Upload failed.');
        }
        $csv = file_get_contents($file['tmp_name']) ?: '';
        $bankName = trim($_POST['bankName'] ?? '');
        admin_json(admin_accounting_import_bank_csv($db, $csv, $file['name'], $email, $bankName !== '' ? $bankName : null));
    }

    if ($method === 'GET' && $path === '/accounts/reconciliation') {
        admin_json(admin_accounting_reconciliation($db, $from, $to));
    }

    if ($method === 'POST' && $path === '/accounts/reconciliation/match') {
        $body = admin_body();
        $bankTxId = trim($body['bankTransactionId'] ?? '');
        $type = trim($body['matchType'] ?? '');
        $matchedId = trim($body['matchedId'] ?? '');
        if ($bankTxId === '' || $matchedId === '') {
            admin_error('bankTransactionId and matchedId are required.');
        }
        admin_accounting_match_bank($db, $bankTxId, $type, $matchedId);
        admin_json(['ok' => true]);
    }

    if ($method === 'GET' && $path === '/accounts/bank/batches') {
        admin_json(['items' => $db->query('SELECT id, filename, bank_name, row_count, created_at FROM accounting_bank_batches ORDER BY created_at DESC LIMIT 20')->fetchAll()]);
    }

    admin_error('Not found.', 404);
    return true;
}
