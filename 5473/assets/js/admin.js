const BASE = document.querySelector('meta[name="admin-base"]')?.content || "/5473";
const API = `${BASE}/api`;

const state = {
  token: localStorage.getItem("siteAdminToken") || "",
  user: null,
  route: "dashboard",
  campaignId: null,
  selectedBlockIndex: 0,
};

const api = async (path, options = {}) => {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

const el = (html) => {
  const node = document.createElement("div");
  node.innerHTML = html.trim();
  return node.firstElementChild;
};

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function setRoute(route, campaignId = null) {
  state.route = route;
  state.campaignId = campaignId;
  state.selectedBlockIndex = 0;
  render();
}

async function boot() {
  if (state.token) {
    try {
      state.user = await api("/auth/me");
    } catch {
      state.token = "";
      localStorage.removeItem("siteAdminToken");
    }
  }
  render();
}

function renderLogin() {
  const root = el(`
    <div class="login">
      <div class="login__card">
        <h1 class="login__title">Site admin</h1>
        <p class="login__lead">Sign in with your company code, email and password — same security model as Rail Intel CMS.</p>
        <div id="login-alert"></div>
        <form id="login-form">
          <div class="field"><label>Company code</label><input name="companyCode" value="5473" autocomplete="organization" required /></div>
          <div class="field"><label>Email</label><input name="email" type="email" autocomplete="username" required /></div>
          <div class="field"><label>Password</label><input name="password" type="password" autocomplete="current-password" required /></div>
          <button class="btn" type="submit" style="width:100%">Sign in</button>
        </form>
        <form id="mfa-form" hidden>
          <div class="field"><label>Email verification code</label><input name="code" inputmode="numeric" autocomplete="one-time-code" required /></div>
          <button class="btn" type="submit" style="width:100%">Verify code</button>
        </form>
      </div>
    </div>
  `);

  let challengeToken = "";
  const alertBox = root.querySelector("#login-alert");
  const loginForm = root.querySelector("#login-form");
  const mfaForm = root.querySelector("#mfa-form");

  const showError = (msg) => {
    alertBox.innerHTML = `<div class="alert alert--error">${escapeHtml(msg)}</div>`;
  };

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    alertBox.innerHTML = "";
    const fd = new FormData(loginForm);
    try {
      await api("/auth/validate-login", {
        method: "POST",
        body: JSON.stringify({ companyCode: fd.get("companyCode"), email: fd.get("email") }),
      });
      const login = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          companyCode: fd.get("companyCode"),
          email: fd.get("email"),
          password: fd.get("password"),
        }),
      });
      if (login.mfaRequired) {
        challengeToken = login.challengeToken;
        loginForm.hidden = true;
        mfaForm.hidden = false;
        alertBox.innerHTML = `<div class="alert alert--success">Enter the code sent to your email.</div>`;
        return;
      }
      state.token = login.token;
      localStorage.setItem("siteAdminToken", login.token);
      state.user = await api("/auth/me");
      render();
    } catch (err) {
      showError(err.message);
    }
  });

  mfaForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    alertBox.innerHTML = "";
    const code = new FormData(mfaForm).get("code");
    try {
      const result = await api("/auth/mfa/verify", {
        method: "POST",
        body: JSON.stringify({ challengeToken, code }),
      });
      state.token = result.token;
      localStorage.setItem("siteAdminToken", result.token);
      state.user = await api("/auth/me");
      render();
    } catch (err) {
      showError(err.message);
    }
  });

  return root;
}

function shell(contentNode) {
  const navItems = [
    ["dashboard", "Dashboard"],
    ["content", "Content"],
    ["media", "Media"],
    ["newsletter", "Newsletter"],
    ["plugins", "Plugins"],
  ];
  const root = el(`
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand__mark">RI</div>
          <div>
            <span class="brand__text">Site admin</span>
            <span class="brand__sub">railintel.co.uk</span>
          </div>
        </div>
        <nav class="nav">
          ${navItems
            .map(
              ([id, label]) =>
                `<a href="#" class="nav__link ${state.route === id ? "is-active" : ""}" data-route="${id}">${label}</a>`
            )
            .join("")}
        </nav>
        <div class="userbar">
          <div>${escapeHtml(state.user?.fullName || state.user?.email || "")}</div>
          <button class="btn btn--ghost" id="logout-btn" style="margin-top:0.5rem;width:100%">Sign out</button>
        </div>
      </aside>
      <main class="main"></main>
    </div>
  `);
  root.querySelector(".main").appendChild(contentNode);
  root.querySelectorAll("[data-route]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      setRoute(link.dataset.route);
    });
  });
  root.querySelector("#logout-btn").addEventListener("click", () => {
    state.token = "";
    state.user = null;
    localStorage.removeItem("siteAdminToken");
    render();
  });
  return root;
}

async function renderDashboard() {
  const stats = await api("/dashboard/stats");
  const content = el(`
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-lead">Manage the Rail Intel landing site, newsletter and plugins.</p>
      </div>
    </div>
    <div class="grid-4">
      <div class="stat"><div class="stat__label">Active subscribers</div><div class="stat__value">${stats.subscribers}</div></div>
      <div class="stat"><div class="stat__label">Campaigns</div><div class="stat__value">${stats.campaigns}</div></div>
      <div class="stat"><div class="stat__label">Content blocks</div><div class="stat__value">${stats.contentBlocks}</div></div>
      <div class="stat"><div class="stat__label">Media assets</div><div class="stat__value">${stats.media}</div></div>
    </div>
    <div class="panel" style="margin-top:1rem">
      <h2 style="margin-top:0">System</h2>
      <p>Email ${stats.mailConfigured ? '<span style="color:var(--success)">configured</span>' : '<span style="color:var(--danger)">not configured</span>'} — set <code>cms_mail_secret</code> in config.local.php (same as CMS <code>SITE_ADMIN_MAIL_SECRET</code>) to send newsletters via CMS SMTP.</p>
      <h3>Recent activity</h3>
      <table class="table">
        <thead><tr><th>Action</th><th>User</th><th>When</th></tr></thead>
        <tbody>
          ${stats.recentAudit
            .map((row) => `<tr><td>${escapeHtml(row.action)}</td><td>${escapeHtml(row.actor_email || "—")}</td><td>${escapeHtml(row.created_at)}</td></tr>`)
            .join("")}
        </tbody>
      </table>
    </div>
  `);
  return shell(content);
}

async function renderContent() {
  const { blocks } = await api("/content");
  const content = el(`
    <div class="page-header">
      <div><h1 class="page-title">Content</h1><p class="page-lead">Edit live text overrides for the landing site.</p></div>
      <button class="btn" id="publish-all">Publish all</button>
    </div>
    <div class="panel">
      <table class="table">
        <thead><tr><th>Label</th><th>Key</th><th>Value</th><th></th></tr></thead>
        <tbody>
          ${blocks
            .map(
              (b) => `
            <tr data-id="${b.id}">
              <td>${escapeHtml(b.label)}</td>
              <td><code>${escapeHtml(b.key)}</code></td>
              <td><textarea class="content-value" rows="${b.field_type === "textarea" ? 4 : 2}">${escapeHtml(b.value || "")}</textarea></td>
              <td><button class="btn btn--ghost save-block">Save</button></td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `);
  content.querySelector("#publish-all").addEventListener("click", async () => {
    await api("/content/publish-all", { method: "POST", body: "{}" });
    alert("All content blocks published.");
  });
  content.querySelectorAll("tr[data-id]").forEach((row) => {
    row.querySelector(".save-block").addEventListener("click", async () => {
      const value = row.querySelector(".content-value").value;
      await api(`/content/${row.dataset.id}`, { method: "PATCH", body: JSON.stringify({ value, publish: true }) });
      alert("Saved and published.");
    });
  });
  return shell(content);
}

async function renderMedia() {
  const { assets } = await api("/media");
  const content = el(`
    <div class="page-header">
      <div><h1 class="page-title">Media</h1><p class="page-lead">Upload images for newsletters and site content.</p></div>
      <label class="btn"><input type="file" id="media-upload" accept="image/*" hidden />Upload image</label>
    </div>
    <div class="media-grid">
      ${assets
        .map(
          (a) => `
        <article class="media-card">
          <img src="${escapeHtml(a.url)}" alt="${escapeHtml(a.alt_text || a.original_name)}" />
          <div class="media-card__meta">${escapeHtml(a.original_name)}<br /><code>${escapeHtml(a.url)}</code></div>
        </article>`
        )
        .join("")}
    </div>
  `);
  content.querySelector("#media-upload").addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API}/media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${state.token}` },
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) alert(data.error || "Upload failed");
    else setRoute("media");
  });
  return shell(content);
}

function blockDefaults(type) {
  switch (type) {
    case "heading": return { type, text: "Newsletter heading" };
    case "text": return { type, text: "Write your update here." };
    case "button": return { type, label: "Read more", href: "https://railintel.co.uk" };
    case "image": return { type, src: "", alt: "" };
    case "quote": return { type, text: "A short quote or highlight." };
    case "divider": return { type: "divider" };
    default: return { type: "text", text: "" };
  }
}

function renderBlockPreview(block) {
  switch (block.type) {
    case "heading": return `<h1>${escapeHtml(block.text || "")}</h1>`;
    case "text": return `<p>${escapeHtml(block.text || "").replace(/\n/g, "<br />")}</p>`;
    case "button": return `<span class="preview-btn">${escapeHtml(block.label || "Button")}</span>`;
    case "image": return block.src ? `<img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt || "")}" />` : `<p style="color:var(--text-muted)">No image selected</p>`;
    case "quote": return `<blockquote style="border-left:3px solid var(--accent);padding-left:1rem;color:#ccc">${escapeHtml(block.text || "")}</blockquote>`;
    case "divider": return `<hr />`;
    default: return "";
  }
}

function renderBlockInspector(block) {
  if (!block) return "<p>Select a block</p>";
  if (block.type === "heading" || block.type === "text" || block.type === "quote") {
    return `<div class="field"><label>Text</label><textarea id="inspector-text">${escapeHtml(block.text || "")}</textarea></div>`;
  }
  if (block.type === "button") {
    return `
      <div class="field"><label>Label</label><input id="inspector-label" value="${escapeHtml(block.label || "")}" /></div>
      <div class="field"><label>Link URL</label><input id="inspector-href" value="${escapeHtml(block.href || "")}" /></div>`;
  }
  if (block.type === "image") {
    return `
      <div class="field"><label>Image URL</label><input id="inspector-src" value="${escapeHtml(block.src || "")}" /></div>
      <div class="field"><label>Alt text</label><input id="inspector-alt" value="${escapeHtml(block.alt || "")}" /></div>`;
  }
  return `<p style="color:var(--text-muted)">No settings for this block.</p>`;
}

async function renderNewsletterEditor(campaign) {
  const blocks = [...(campaign.blocks || [])];
  state.selectedBlockIndex = Math.min(state.selectedBlockIndex, Math.max(blocks.length - 1, 0));

  const content = el(`
    <div class="page-header">
      <div>
        <h1 class="page-title">Edit campaign</h1>
        <p class="page-lead">${escapeHtml(campaign.title)}</p>
      </div>
      <div style="display:flex;gap:0.5rem">
        <button class="btn btn--ghost" id="back-campaigns">Back</button>
        <button class="btn" id="save-campaign">Save</button>
        <button class="btn" id="send-campaign">Send</button>
      </div>
    </div>
    <div class="panel grid-2" style="margin-bottom:1rem">
      <div class="field"><label>Subject</label><input id="campaign-subject" value="${escapeHtml(campaign.subject || "")}" /></div>
      <div class="field"><label>Preheader</label><input id="campaign-preheader" value="${escapeHtml(campaign.preheader || "")}" /></div>
      <div class="field"><label>Recipients</label>
        <select id="campaign-recipient-mode">
          <option value="all" ${campaign.recipient_mode === "all" ? "selected" : ""}>All active subscribers</option>
          <option value="custom" ${campaign.recipient_mode === "custom" ? "selected" : ""}>Custom list</option>
        </select>
      </div>
      <div class="field"><label>Custom emails (comma-separated)</label>
        <input id="campaign-recipient-emails" value="${escapeHtml((campaign.recipientEmails || []).join(", "))}" />
      </div>
    </div>
    <div class="toolbar">
      <button class="btn btn--ghost" data-add="heading">+ Heading</button>
      <button class="btn btn--ghost" data-add="text">+ Text</button>
      <button class="btn btn--ghost" data-add="image">+ Image</button>
      <button class="btn btn--ghost" data-add="button">+ Button</button>
      <button class="btn btn--ghost" data-add="quote">+ Quote</button>
      <button class="btn btn--ghost" data-add="divider">+ Divider</button>
    </div>
    <div class="editor-layout">
      <div class="block-list" id="block-list"></div>
      <div class="preview" id="preview"></div>
      <div class="block-inspector panel" id="inspector"></div>
    </div>
  `);

  const paint = () => {
    const list = content.querySelector("#block-list");
    list.innerHTML = blocks
      .map(
        (b, i) =>
          `<div class="block-item ${i === state.selectedBlockIndex ? "is-active" : ""}" data-index="${i}">${escapeHtml(b.type)} ${i + 1}</div>`
      )
      .join("");
    content.querySelector("#preview").innerHTML = blocks.map(renderBlockPreview).join("");
    content.querySelector("#inspector").innerHTML = renderBlockInspector(blocks[state.selectedBlockIndex]);
    bindInspector();
    list.querySelectorAll(".block-item").forEach((item) => {
      item.addEventListener("click", () => {
        state.selectedBlockIndex = Number(item.dataset.index);
        paint();
      });
    });
  };

  const bindInspector = () => {
    const block = blocks[state.selectedBlockIndex];
    const text = content.querySelector("#inspector-text");
    const label = content.querySelector("#inspector-label");
    const href = content.querySelector("#inspector-href");
    const src = content.querySelector("#inspector-src");
    const alt = content.querySelector("#inspector-alt");
    if (text) text.oninput = () => { block.text = text.value; paint(); };
    if (label) label.oninput = () => { block.label = label.value; paint(); };
    if (href) href.oninput = () => { block.href = href.value; paint(); };
    if (src) src.oninput = () => { block.src = src.value; paint(); };
    if (alt) alt.oninput = () => { block.alt = alt.value; paint(); };
  };

  content.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      blocks.push(blockDefaults(btn.dataset.add));
      state.selectedBlockIndex = blocks.length - 1;
      paint();
    });
  });

  content.querySelector("#back-campaigns").addEventListener("click", () => setRoute("newsletter"));
  content.querySelector("#save-campaign").addEventListener("click", async () => {
    const recipientMode = content.querySelector("#campaign-recipient-mode").value;
    const recipientEmails = content.querySelector("#campaign-recipient-emails").value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    await api(`/newsletter/campaigns/${campaign.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        subject: content.querySelector("#campaign-subject").value,
        preheader: content.querySelector("#campaign-preheader").value,
        blocks,
        recipientMode,
        recipientEmails,
      }),
    });
    alert("Campaign saved.");
  });
  content.querySelector("#send-campaign").addEventListener("click", async () => {
    if (!confirm("Send this campaign now?")) return;
    const result = await api(`/newsletter/campaigns/${campaign.id}/send`, { method: "POST", body: "{}" });
    alert(`Sent: ${result.sent}, failed: ${result.failed}`);
    setRoute("newsletter");
  });

  paint();
  return shell(content);
}

async function renderNewsletter() {
  if (state.campaignId) {
    const campaign = await api(`/newsletter/campaigns/${state.campaignId}`);
    return renderNewsletterEditor(campaign);
  }
  const [{ campaigns }, { subscribers }] = await Promise.all([
    api("/newsletter/campaigns"),
    api("/newsletter/subscribers"),
  ]);
  const content = el(`
    <div class="page-header">
      <div><h1 class="page-title">Newsletter</h1><p class="page-lead">${subscribers.length} active subscribers.</p></div>
      <button class="btn" id="new-campaign">New campaign</button>
    </div>
    <div class="grid-2">
      <div class="panel">
        <h2 style="margin-top:0">Campaigns</h2>
        <table class="table">
          <thead><tr><th>Title</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${campaigns
              .map(
                (c) => `<tr>
                  <td>${escapeHtml(c.title)}<br /><small>${escapeHtml(c.subject)}</small></td>
                  <td>${escapeHtml(c.status)}</td>
                  <td><button class="btn btn--ghost" data-edit="${c.id}">Edit</button></td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="panel">
        <h2 style="margin-top:0">Subscribers</h2>
        <table class="table">
          <thead><tr><th>Email</th><th>Since</th></tr></thead>
          <tbody>
            ${subscribers.slice(0, 20).map((s) => `<tr><td>${escapeHtml(s.email)}</td><td>${escapeHtml(s.subscribed_at)}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `);
  content.querySelector("#new-campaign").addEventListener("click", async () => {
    const title = prompt("Campaign title");
    if (!title) return;
    const subject = prompt("Email subject", title);
    const { id } = await api("/newsletter/campaigns", {
      method: "POST",
      body: JSON.stringify({ title, subject, blocks: [{ type: "heading", text: title }, { type: "text", text: "" }] }),
    });
    setRoute("newsletter", id);
  });
  content.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => setRoute("newsletter", btn.dataset.edit));
  });
  return shell(content);
}

async function renderPlugins() {
  const { plugins } = await api("/plugins");
  const content = el(`
    <div class="page-header">
      <div>
        <h1 class="page-title">Plugins</h1>
        <p class="page-lead">Drop plugin folders into <code>5473/plugins/</code> to extend the admin.</p>
      </div>
    </div>
    <div class="panel">
      <table class="table">
        <thead><tr><th>Name</th><th>Version</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${plugins
            .map(
              (p) => `<tr>
                <td>${escapeHtml(p.name)}<br /><code>${escapeHtml(p.slug)}</code></td>
                <td>${escapeHtml(p.version)}</td>
                <td>${p.enabled ? "Enabled" : "Disabled"} ${p.loaded ? "(loaded)" : ""}</td>
                <td><button class="btn btn--ghost" data-toggle="${p.slug}" data-enabled="${p.enabled ? "0" : "1"}">${p.enabled ? "Disable" : "Enable"}</button></td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
      ${plugins.length ? "" : "<p>No plugins installed yet. See <code>plugins/example-announcement-banner/</code> for a starter.</p>"}
    </div>
  `);
  content.querySelectorAll("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await api(`/plugins/${btn.dataset.toggle}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled: btn.dataset.enabled === "1" }),
      });
      alert("Plugin updated. Restart the server to apply.");
      setRoute("plugins");
    });
  });
  return shell(content);
}

async function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";
  if (!state.token || !state.user) {
    app.appendChild(renderLogin());
    return;
  }
  try {
    let view;
    switch (state.route) {
      case "content": view = await renderContent(); break;
      case "media": view = await renderMedia(); break;
      case "newsletter": view = await renderNewsletter(); break;
      case "plugins": view = await renderPlugins(); break;
      default: view = await renderDashboard();
    }
    app.appendChild(view);
  } catch (err) {
    app.appendChild(el(`<div class="login"><div class="alert alert--error">${escapeHtml(err.message)}</div></div>`));
  }
}

boot();
