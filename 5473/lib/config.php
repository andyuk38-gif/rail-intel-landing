<?php

function admin_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }

    $defaults = [
        'company_code' => '5473',
        'jwt_secret' => '',
        'smtp_host' => '',
        'smtp_port' => 587,
        'smtp_secure' => false,
        'smtp_user' => '',
        'smtp_pass' => '',
        'smtp_from' => 'Rail Intel <news@railintel.co.uk>',
        'cms_api_url' => 'https://cms.railintel.co.uk/api',
        'cms_mail_secret' => '',
        'base_path' => '/5473',
        'data_dir' => dirname(__DIR__) . '/data',
        'uploads_dir' => dirname(__DIR__) . '/data/uploads',
        'db_path' => dirname(__DIR__) . '/data/site-admin.sqlite',
        'plugins_dir' => dirname(__DIR__) . '/plugins',
    ];

    $local = dirname(__DIR__) . '/config.local.php';
    if (is_file($local)) {
        $defaults = array_merge($defaults, require $local);
    }

    if ($defaults['jwt_secret'] === '') {
        $defaults['jwt_secret'] = 'dev-only-change-me-in-config-local-php';
    }

    $config = $defaults;
    return $config;
}
