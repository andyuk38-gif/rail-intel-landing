# Rail Intel landing page

Static landing site for **railintel.co.uk**. Links to the app at **cms.railintel.co.uk**.

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

## Alternative: Deploy to Hostinger

If you prefer to host the landing page on Hostinger instead of GitHub Pages:

1. Ensure **railintel.co.uk** points at your Hostinger hosting (not the Node.js app).
2. Upload this folder’s contents to the domain’s document root (e.g. `public_html`): `index.html`, `css/`, `js/`, `images/`.
3. You can remove the `CNAME` file from the repo if you are not using GitHub Pages for this domain.
