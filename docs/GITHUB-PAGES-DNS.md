# Fix “Domain does not resolve to the GitHub Pages server”

Your domain is currently pointing to **2.57.91.91** (likely Hostinger), not to GitHub. GitHub needs the records below so both **railintel.co.uk** and **www.railintel.co.uk** resolve to GitHub Pages.

## 1. Where to change DNS

Log in where **railintel.co.uk** is managed (e.g. Hostinger, Cloudflare, 123-reg, or your registrar’s DNS) and open the **DNS** / **DNS records** section for this domain.

## 2. Apex domain: railintel.co.uk

**Remove** any existing **A** record that points **railintel.co.uk** (or `@`) to **2.57.91.91** (or any other IP).

**Add** these four **A** records (same name, four different values):

| Type | Name / Host | Value / Points to | TTL |
|------|-------------|-------------------|-----|
| A    | `@` (or `railintel.co.uk`) | `185.199.108.153` | 3600 (or default) |
| A    | `@` (or `railintel.co.uk`) | `185.199.109.153` | 3600 |
| A    | `@` (or `railintel.co.uk`) | `185.199.110.153` | 3600 |
| A    | `@` (or `railintel.co.uk`) | `185.199.111.153` | 3600 |

Some providers only allow one A record per name; add as many as they allow (GitHub supports one or more of these IPs).

## 3. www subdomain: www.railintel.co.uk

**Remove** the **CNAME** that points **www** to **railintel.co.uk** (that chain sends www to the same non-GitHub server).

**Add** one **CNAME** record:

| Type | Name / Host | Value / Points to | TTL |
|------|-------------|-------------------|-----|
| CNAME | `www` | `andyuk38-gif.github.io` | 3600 (or default) |

Do **not** use the repo name in the target — only `andyuk38-gif.github.io`.

## 4. Save and wait

- Save the DNS changes.
- Propagation can take from a few minutes up to 24–48 hours.
- GitHub may show “DNS check pending” until propagation is complete.

## 5. Check from your machine

After a few minutes, run:

```bash
dig railintel.co.uk +short A
dig www.railintel.co.uk +short
```

You should see:

- **railintel.co.uk**: the four IPs `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (order may vary).
- **www.railintel.co.uk**: a CNAME to `andyuk38-gif.github.io` and then an A record (GitHub’s IP).

## 6. GitHub Pages settings

- **Settings → Pages → Custom domain**: use **railintel.co.uk** (apex). GitHub will then validate both the apex and the www alternate.
- Once DNS is correct, the “improperly configured” / **NotServedByPagesError** should clear and the site will be served at **https://railintel.co.uk** (and **https://www.railintel.co.uk**).

## If you prefer to keep the main site on Hostinger

If you want the live site to stay on Hostinger and only use GitHub for code:

1. In GitHub: **Settings → Pages**, remove the custom domain (and delete the **CNAME** file from the repo if you no longer want Pages on this domain).
2. Leave DNS as it is now (pointing to 2.57.91.91) and keep uploading the built site to Hostinger as in the README.

Then the “domain does not resolve to GitHub” message will go away because the repo will no longer claim the custom domain.
