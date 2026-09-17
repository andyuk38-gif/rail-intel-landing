<?php
/**
 * Copy to config.local.php and edit. config.local.php is gitignored.
 */
return [
    'company_code' => '5473',
    'jwt_secret' => 'change-me-to-a-long-random-string',
    // Recommended: use CMS SMTP (Email templates → Email provider settings in Rail Intel CMS).
    // Generate a long random string and set the same value as SITE_ADMIN_MAIL_SECRET on CMS.
    'cms_api_url' => 'https://cms.railintel.co.uk/api',
    'cms_mail_secret' => '',
    // Legacy fallback — only needed if you do not use the CMS mail relay above.
    'smtp_host' => '',
    'smtp_port' => 587,
    'smtp_secure' => false,
    'smtp_user' => '',
    'smtp_pass' => '',
    'smtp_from' => 'Rail Intel <news@railintel.co.uk>',
];
