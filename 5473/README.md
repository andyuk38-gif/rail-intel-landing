# Site admin (`/5473`)

PHP admin that deploys **with the static site** — no separate Node app or Azure service.

Login: **https://railintel.co.uk/5473** with company code **5473**.

## One-time setup (on server or locally)

1. Copy config:
   ```bash
   cp config.example.php config.local.php
   ```
2. Edit `config.local.php` — set a strong `jwt_secret`.
3. Create your admin account:
   ```bash
   php bin/create-admin.php you@railintel.co.uk 'your-secure-password'
   ```

Hostinger runs PHP automatically — just push to `main` and the admin is live.

## Local testing

```bash
cd 5473
php -S localhost:8080
```

Open **http://localhost:8080** (no `/5473` prefix needed locally).

## Features

- Content editing with publish to live site
- Media uploads
- Newsletter subscribers and campaigns
- Plugin folder at `5473/plugins/`

## Data storage

SQLite and uploads live in `5473/data/` (gitignored). They persist across normal git deploys on Hostinger.

## Email (newsletters)

**Recommended:** use the same SMTP as Rail Intel CMS — no separate mailbox credentials on the landing site.

1. In CMS (Azure), set `SITE_ADMIN_MAIL_SECRET` to a long random string.
2. In `config.local.php`, set the same value as `cms_mail_secret` (and `cms_api_url` if needed).

Newsletter sends from `/5473` are relayed through `cms.railintel.co.uk`, which uses **Email templates → Email provider settings** in CMS.

Legacy: you can still set `smtp_*` in `config.local.php` instead, but CMS relay is preferred.
