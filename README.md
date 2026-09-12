# Rail Intel landing page

Static landing site for **railintel.co.uk**. Links to the app at **cms.railintel.co.uk**.

## Self-serve CMS signup

Visitors apply at **[/get-started.html](get-started.html)** (or **Get started** in the nav). Applications are sent to **cms.railintel.co.uk** for system-admin approval. Once approved, the customer receives the CMS welcome email and completes onboarding in the app.

Configure the CMS API URL via `<meta name="cms-api" content="https://cms.railintel.co.uk/api" />` (set in `scripts/build-pages.mjs`).

## Site admin (`/5473`)

A PHP admin for editing content, managing media, and sending newsletters. It deploys **with this repo** on Hostinger — no separate app to run.

Login: **https://railintel.co.uk/5473** (company code **5473**). See **[5473/README.md](5473/README.md)** for setup.

## Homepage gallery (Dashboard / Compliance / Reporting / Analytics)

Copy, screenshots and chip text for the homepage command-centre tabs live in **`content/home-gallery.mjs`**.

After editing that file, regenerate the site and commit the output:

```bash
node scripts/build-pages.mjs
```

The build rewrites the `<!-- home-gallery:start -->` … `<!-- home-gallery:end -->` block in `index.html` and bumps the shared asset version (`ASSET_VERSION` in `scripts/build-pages.mjs`). You can confirm a deploy reached production by viewing page source and checking for `<!-- site-asset-version:91 -->` (version number increases when assets change).

## Local preview

Open `index.html` in a browser, or:

```bash
npx serve .
```

Then open the URL shown (e.g. http://localhost:3000).

## Publish to railintel.co.uk (GitHub Pages)

The repo is set up to publish via **GitHub Pages** with the custom domain **railintel.co.uk**. Every push to `main` will update the live site.

### One-time setup

1. **Enable GitHub Pages**  
   On GitHub: **Settings → Pages**. Under “Build and deployment”:
   - **Source**: Deploy from a branch  
   - **Branch**: `main` / `/ (root)`  
   - Save.

2. **Set the custom domain**  
   In the same Pages section, under “Custom domain”, enter **railintel.co.uk** and Save.  
   If GitHub shows “DNS check pending”, continue to step 3.

3. **Point your domain at GitHub**  
   Where you manage DNS for railintel.co.uk (e.g. Hostinger, Cloudflare, your registrar):
   - **Option A (recommended):** Add an **A** record for `@` (or `railintel.co.uk`) with value **185.199.108.153**, and three more A records with **185.199.109.153**, **185.199.110.153**, **185.199.111.153** (GitHub’s Pages IPs).  
   - **Option B:** Add a **CNAME** record: name `www`, value **andyuk38-gif.github.io** (so `www.railintel.co.uk` works; then in GitHub Pages you can redirect the apex to www if needed).

   After DNS propagates (a few minutes to a few hours), GitHub will show a green “DNS check successful” and serve the site over HTTPS at **https://railintel.co.uk**.

   If you see **“Domain does not resolve to the GitHub Pages server”** or **NotServedByPagesError**, your DNS is still pointing elsewhere. See **[docs/GITHUB-PAGES-DNS.md](docs/GITHUB-PAGES-DNS.md)** for exact record values and step-by-step fixes.

### After setup

- Push to `main` → the site at railintel.co.uk updates automatically.  
- All app links on the landing page go to **https://cms.railintel.co.uk**.

---

## Deploy to Hostinger (production)

**railintel.co.uk** is deployed from this repo via Hostinger **Advanced → Git** (auto-deploy on push to `main`).

After changing content, always run `node scripts/build-pages.mjs` before committing.

If deploy fails with **“divergent branches”**, the server checkout has drifted from GitHub. See **[docs/HOSTINGER-DEPLOY.md](docs/HOSTINGER-DEPLOY.md)** — you will need to SSH in once and run `scripts/hostinger-sync.sh` in the Git project directory, then redeploy.

Confirm a successful deploy: view page source and look for `<!-- site-asset-version:… -->` (version should match `ASSET_VERSION` in `scripts/build-pages.mjs`).

**Site admin:** after deploy, SSH once to create `5473/config.local.php` and run `php 5473/bin/create-admin.php` (see [5473/README.md](5473/README.md)).
