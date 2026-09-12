<?php

function admin_render_newsletter_html(array $campaign): string
{
    $blocks = json_decode($campaign['blocks_json'] ?? '[]', true) ?: [];
    $body = implode("\n", array_map('admin_render_newsletter_block', $blocks));
    $preheader = trim($campaign['preheader'] ?? '');
    $pre = $preheader !== ''
        ? '<span style="display:none!important">' . admin_h($preheader) . '</span>'
        : '';

    return <<<HTML
<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>{$campaign['subject']}</title></head>
<body style="margin:0;background:#0c0f14;font-family:system-ui,sans-serif;color:#e6e9ef;">
{$pre}
<table width="100%" cellspacing="0" cellpadding="0" style="background:#0c0f14;"><tr><td align="center" style="padding:32px 16px;">
<table width="600" style="max-width:600px;background:#141922;border-radius:12px;border:1px solid rgba(255,255,255,.08);">
<tr><td style="padding:28px 32px 8px;"><p style="margin:0;color:#f59e0b;font-weight:600;text-transform:uppercase;font-size:13px;">Rail Intel</p></td></tr>
<tr><td style="padding:8px 32px 32px;">{$body}</td></tr>
</table></td></tr></table></body></html>
HTML;
}

function admin_render_newsletter_block(array $block): string
{
    switch ($block['type'] ?? '') {
        case 'heading':
            return '<h1 style="margin:0 0 16px;font-size:28px;color:#fff;">' . admin_h($block['text'] ?? '') . '</h1>';
        case 'text':
            return '<p style="margin:0 0 16px;line-height:1.65;">' . nl2br(admin_h($block['text'] ?? '')) . '</p>';
        case 'button':
            $href = admin_h($block['href'] ?? 'https://railintel.co.uk');
            return '<p><a href="' . $href . '" style="display:inline-block;padding:12px 22px;background:#f59e0b;color:#0c0f14;text-decoration:none;border-radius:8px;font-weight:600;">' . admin_h($block['label'] ?? 'Learn more') . '</a></p>';
        case 'image':
            $src = admin_h($block['src'] ?? '');
            return $src ? '<p><img src="' . $src . '" alt="' . admin_h($block['alt'] ?? '') . '" style="max-width:100%;border-radius:8px;"></p>' : '';
        case 'divider':
            return '<hr style="border:none;border-top:1px solid rgba(255,255,255,.08);margin:24px 0;">';
        case 'quote':
            return '<blockquote style="margin:0 0 20px;padding:16px 20px;border-left:3px solid #f59e0b;background:rgba(245,158,11,.08);">' . nl2br(admin_h($block['text'] ?? '')) . '</blockquote>';
        default:
            return '';
    }
}

function admin_h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
