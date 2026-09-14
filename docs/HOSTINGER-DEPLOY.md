# Hostinger Git deploy

Rail Intel’s live site (`railintel.co.uk`) is deployed from this GitHub repo via Hostinger **Advanced → Git**.

## If deploy fails with “divergent branches”

```
fatal: Need to specify how to reconcile divergent branches.
```

This means the copy of the repo **on the Hostinger server** has commits that are not on GitHub (or vice versa). Common causes:

- Files edited in Hostinger File Manager
- A previous deploy left merge commits on the server
- An interrupted deploy

GitHub `main` is the source of truth. The server should mirror it exactly.

### Fix (recommended): reset the server checkout once

1. In Hostinger hPanel, open **Advanced → SSH Access** and note your SSH details (or use the browser terminal if available).
2. SSH into the account and go to the **Git project directory** shown in **Advanced → Git** (often something like `domains/railintel.co.uk/public_html` or a sibling `repositories/` path).
3. Run:

```bash
cd /path/to/your/git/project   # use the path from hPanel Git settings

git fetch origin
git reset --hard origin/main
git clean -fd
```

4. In hPanel, open **Advanced → Git** and click **Deploy** (or push a new commit to `main` to trigger auto-deploy).

After a successful deploy, view source on https://railintel.co.uk and confirm:

```html
<!-- site-asset-version:… -->
```

The version number is derived automatically from CSS/JS file contents when `node scripts/build-pages.mjs` runs (see `computeAssetVersion()` in that script).

**Stale layout after deploy:** Hostinger’s CDN caches `css/` and `js/` by path for up to a week and ignores `?v=` query strings. The root `.htaccess` sets `Cache-Control: max-age=0, must-revalidate` on those files so HTML and CSS stay in sync. If layout still looks broken once, hard-refresh or purge hCDN cache in hPanel.

### Alternative: reconnect Git in hPanel

If you cannot use SSH:

1. **Advanced → Git** → note the repository URL and branch (`main`).
2. **Disconnect** or remove the existing Git deployment for the site.
3. Reconnect the same GitHub repository and branch.
4. Deploy again.

Use this if the server directory is badly out of sync. You may need to ensure the deployment target is the site document root (`public_html`).

## Day-to-day workflow

1. Edit content (homepage gallery: `content/home-gallery.mjs`; other pages: `content/site.mjs`).
2. Run `node scripts/build-pages.mjs` locally.
3. Commit and push to `main`.
4. Hostinger auto-deploys. Check deploy output in **Advanced → Git**.

Do **not** edit tracked site files directly in Hostinger File Manager. Changes made only on the server cause the next `git pull` to fail or be overwritten.

## Site admin (`/5473`)

The PHP admin in `5473/` deploys with the site. After the first deploy, SSH in once:

```bash
cd /path/to/your/git/project
cp 5473/config.example.php 5473/config.local.php
# edit jwt_secret in config.local.php
php 5473/bin/create-admin.php you@railintel.co.uk 'your-password'
```

Then open **https://railintel.co.uk/5473**. See [5473/README.md](../5473/README.md).

## Homepage gallery only

See the “Homepage gallery” section in [README.md](../README.md).
