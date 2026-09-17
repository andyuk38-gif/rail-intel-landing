const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const fmt = (n) => GBP.format(Number(n) || 0);

let chartJsPromise = null;
function loadChartJs() {
  if (window.Chart) return Promise.resolve();
  if (chartJsPromise) return chartJsPromise;
  chartJsPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js";
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return chartJsPromise;
}

function periodDefaults() {
  const now = new Date();
  return {
    from: `${now.getFullYear()}-01-01`,
    to: now.toISOString().slice(0, 10),
  };
}

function vatCalc(net, rate) {
  const n = Math.max(0, Number(net) || 0);
  const r = Math.max(0, Number(rate) || 0);
  const vat = Math.round(n * (r / 100) * 100) / 100;
  return { net: n, vat, gross: Math.round((n + vat) * 100) / 100 };
}

function statusBadge(status) {
  const colors = {
    paid: "var(--success)",
    sent: "var(--accent)",
    draft: "var(--text-muted)",
    overdue: "var(--danger)",
    cancelled: "var(--text-muted)",
  };
  return `<span class="badge" style="color:${colors[status] || "var(--text)"}">${status}</span>`;
}

function bindVatPreview(form, prefix = "") {
  const net = form.querySelector(`[name="${prefix}amountNet"]`);
  const rate = form.querySelector(`[name="${prefix}vatRate"]`);
  const preview = form.querySelector(`[data-vat-preview="${prefix}"]`);
  if (!net || !rate || !preview) return;
  const paint = () => {
    const { vat, gross } = vatCalc(net.value, rate.value);
    preview.textContent = `VAT ${fmt(vat)} · Gross ${fmt(gross)}`;
  };
  net.addEventListener("input", paint);
  rate.addEventListener("change", paint);
  paint();
}

function modal(title, bodyHtml, actionsHtml = "") {
  return `
    <div class="accounts-modal" role="dialog" aria-modal="true">
      <div class="accounts-modal__backdrop" data-close-modal></div>
      <div class="accounts-modal__card panel">
        <div class="accounts-modal__head">
          <h2>${title}</h2>
          <button type="button" class="btn btn--ghost btn--sm" data-close-modal aria-label="Close">×</button>
        </div>
        <div class="accounts-modal__body">${bodyHtml}</div>
        ${actionsHtml ? `<div class="accounts-modal__foot">${actionsHtml}</div>` : ""}
      </div>
    </div>`;
}

function bindModals(root) {
  root.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", () => root.querySelector(".accounts-modal")?.remove());
  });
}

function incomeForm(categories, products, paymentMethods, values = {}) {
  const v = (k, d = "") => values[k] ?? d;
  return `
    <form id="income-form" class="accounts-form">
      <div class="grid-2">
        <div class="field"><label>Date</label><input name="transactionDate" type="date" value="${v("transactionDate", new Date().toISOString().slice(0, 10))}" required /></div>
        <div class="field"><label>Category</label><select name="category">${categories.map((c) => `<option ${v("category") === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
      </div>
      <div class="field"><label>Description</label><input name="description" value="${v("description")}" required /></div>
      <div class="grid-2">
        <div class="field"><label>Customer</label><input name="customerName" value="${v("customerName")}" /></div>
        <div class="field"><label>Product</label><input name="product" list="product-list" value="${v("product")}" /><datalist id="product-list">${products.map((p) => `<option value="${p}">`).join("")}</datalist></div>
      </div>
      <div class="grid-2">
        <div class="field"><label>Net amount (£)</label><input name="amountNet" type="number" min="0" step="0.01" value="${v("amountNet", "0")}" required /></div>
        <div class="field"><label>VAT rate</label><select name="vatRate"><option value="20" ${Number(v("vatRate", 20)) === 20 ? "selected" : ""}>20% standard</option><option value="5" ${Number(v("vatRate")) === 5 ? "selected" : ""}>5% reduced</option><option value="0" ${Number(v("vatRate")) === 0 ? "selected" : ""}>0% zero-rated</option></select></div>
      </div>
      <p class="accounts-vat-preview" data-vat-preview="">VAT £0.00 · Gross £0.00</p>
      <div class="grid-2">
        <div class="field"><label>Payment method</label><select name="paymentMethod">${paymentMethods.map((m) => `<option value="${m}" ${v("paymentMethod") === m ? "selected" : ""}>${m.replace(/_/g, " ")}</option>`).join("")}</select></div>
        <div class="field"><label>Reference</label><input name="reference" value="${v("reference")}" placeholder="Bank ref, Stripe ID, etc." /></div>
      </div>
      <div class="field"><label>Notes (for your accountant)</label><textarea name="notes" rows="2">${v("notes")}</textarea></div>
    </form>`;
}

function expenseForm(categories, values = {}, expenseId = "") {
  const v = (k, d = "") => values[k] ?? d;
  return `
    <form id="expense-form" class="accounts-form">
      <div class="grid-2">
        <div class="field"><label>Date</label><input name="transactionDate" type="date" value="${v("transactionDate", new Date().toISOString().slice(0, 10))}" required /></div>
        <div class="field"><label>Category</label><select name="category">${categories.map((c) => `<option ${v("category") === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
      </div>
      <div class="field"><label>Description</label><input name="description" value="${v("description")}" required /></div>
      <div class="field"><label>Supplier</label><input name="supplier" value="${v("supplier")}" /></div>
      <div class="grid-2">
        <div class="field"><label>Net amount (£)</label><input name="amountNet" type="number" min="0" step="0.01" value="${v("amountNet", "0")}" required /></div>
        <div class="field"><label>VAT rate</label><select name="vatRate"><option value="20" ${Number(v("vatRate", 20)) === 20 ? "selected" : ""}>20%</option><option value="5" ${Number(v("vatRate")) === 5 ? "selected" : ""}>5%</option><option value="0" ${Number(v("vatRate")) === 0 ? "selected" : ""}>0%</option></select></div>
      </div>
      <p class="accounts-vat-preview" data-vat-preview="">VAT £0.00 · Gross £0.00</p>
      <label class="accounts-check"><input type="checkbox" name="vatReclaimable" ${values.vatReclaimable !== false ? "checked" : ""} /> VAT reclaimable on this expense</label>
      <div class="field"><label>Reference</label><input name="reference" value="${v("reference")}" /></div>
      <div class="field"><label>Notes</label><textarea name="notes" rows="2">${v("notes")}</textarea></div>
      <div class="accounts-receipt-box panel">
        <h3 style="margin-top:0">Receipt</h3>
        <p class="page-lead">Upload a file or use your phone camera to capture the receipt.</p>
        <div class="accounts-receipt-actions">
          <label class="btn btn--ghost"><input type="file" id="receipt-upload" accept="image/*,application/pdf" hidden />Upload file</label>
          <label class="btn btn--ghost"><input type="file" id="receipt-camera" accept="image/*" capture="environment" hidden />Take photo</label>
        </div>
        <div id="receipt-preview" class="accounts-receipt-preview"></div>
        <input type="hidden" id="linked-expense-id" value="${expenseId}" />
      </div>
    </form>`;
}

function invoiceForm(products, values = {}) {
  const v = (k, d = "") => values[k] ?? d;
  return `
    <form id="invoice-form" class="accounts-form">
      <div class="grid-2">
        <div class="field"><label>Invoice number</label><input name="invoiceNumber" value="${v("invoiceNumber")}" required /></div>
        <div class="field"><label>Status</label><select name="status"><option value="draft">Draft</option><option value="sent">Sent</option><option value="overdue">Overdue</option></select></div>
      </div>
      <div class="grid-2">
        <div class="field"><label>Customer name</label><input name="customerName" value="${v("customerName")}" required /></div>
        <div class="field"><label>Customer email</label><input name="customerEmail" type="email" value="${v("customerEmail")}" /></div>
      </div>
      <div class="grid-2">
        <div class="field"><label>Issue date</label><input name="issueDate" type="date" value="${v("issueDate", new Date().toISOString().slice(0, 10))}" required /></div>
        <div class="field"><label>Due date</label><input name="dueDate" type="date" value="${v("dueDate")}" /></div>
      </div>
      <div class="field"><label>Product / service</label><input name="product" list="product-list" value="${v("product")}" /><datalist id="product-list">${products.map((p) => `<option value="${p}">`).join("")}</datalist></div>
      <div class="field"><label>Description</label><textarea name="description" rows="2">${v("description")}</textarea></div>
      <div class="grid-2">
        <div class="field"><label>Net amount (£)</label><input name="amountNet" type="number" min="0" step="0.01" value="${v("amountNet", "0")}" required /></div>
        <div class="field"><label>VAT rate</label><select name="vatRate"><option value="20">20%</option><option value="5">5%</option><option value="0">0%</option></select></div>
      </div>
      <p class="accounts-vat-preview" data-vat-preview="">VAT £0.00 · Gross £0.00</p>
      <div class="field"><label>Notes</label><textarea name="notes" rows="2">${v("notes")}</textarea></div>
    </form>`;
}

function formDataToJson(form) {
  const fd = new FormData(form);
  const obj = Object.fromEntries(fd.entries());
  if (form.querySelector('[name="vatReclaimable"]')) {
    obj.vatReclaimable = form.querySelector('[name="vatReclaimable"]').checked;
  }
  obj.amountNet = Number(obj.amountNet);
  obj.vatRate = Number(obj.vatRate);
  return obj;
}

async function uploadReceipt(file, expenseId, captureMethod, token, API) {
  const fd = new FormData();
  fd.append("file", file);
  if (expenseId) fd.append("expenseId", expenseId);
  fd.append("captureMethod", captureMethod);
  const res = await fetch(`${API}/accounts/receipts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Receipt upload failed");
  return data;
}

function bindReceiptInputs(root, getExpenseId, token, API) {
  const preview = root.querySelector("#receipt-preview");
  const showPreview = (file) => {
    if (!preview) return;
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      preview.innerHTML = `<img src="${url}" alt="Receipt preview" />`;
    } else {
      preview.innerHTML = `<p>${file.name}</p>`;
    }
  };

  const handleFile = async (file, method) => {
    if (!file) return;
    showPreview(file);
    const expenseId = getExpenseId();
    if (expenseId) {
      try {
        await uploadReceipt(file, expenseId, method, token, API);
        preview.innerHTML += `<p class="alert alert--success" style="margin-top:0.5rem">Receipt attached.</p>`;
      } catch (err) {
        preview.innerHTML += `<p class="alert alert--error" style="margin-top:0.5rem">${err.message}</p>`;
      }
    } else {
      root._pendingReceipt = { file, method };
    }
  };

  root.querySelector("#receipt-upload")?.addEventListener("change", (e) => handleFile(e.target.files?.[0], "upload"));
  root.querySelector("#receipt-camera")?.addEventListener("change", (e) => handleFile(e.target.files?.[0], "camera"));
}

function destroyCharts(root) {
  root.querySelectorAll("canvas[data-chart]").forEach((canvas) => {
    if (canvas._chart) {
      canvas._chart.destroy();
      canvas._chart = null;
    }
  });
}

async function paintCharts(root, overview) {
  await loadChartJs();
  destroyCharts(root);
  const chartColors = {
    income: "rgba(52, 211, 153, 0.85)",
    expense: "rgba(248, 113, 113, 0.75)",
    accent: "rgba(245, 158, 11, 0.85)",
  };

  const monthlyCanvas = root.querySelector("#chart-monthly");
  if (monthlyCanvas && overview.monthly.length) {
    monthlyCanvas._chart = new Chart(monthlyCanvas, {
      type: "bar",
      data: {
        labels: overview.monthly.map((m) => m.month),
        datasets: [
          { label: "Income", data: overview.monthly.map((m) => m.income), backgroundColor: chartColors.income },
          { label: "Expenses", data: overview.monthly.map((m) => m.expenses), backgroundColor: chartColors.expense },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: "#e6e9ef" } } },
        scales: {
          x: { ticks: { color: "#8b92a0" }, grid: { color: "rgba(255,255,255,0.06)" } },
          y: { ticks: { color: "#8b92a0" }, grid: { color: "rgba(255,255,255,0.06)" } },
        },
      },
    });
  }

  const productCanvas = root.querySelector("#chart-products");
  if (productCanvas && overview.productRevenue.length) {
    productCanvas._chart = new Chart(productCanvas, {
      type: "doughnut",
      data: {
        labels: overview.productRevenue.map((p) => p.product),
        datasets: [{
          data: overview.productRevenue.map((p) => p.revenue),
          backgroundColor: ["#f59e0b", "#34d399", "#60a5fa", "#a78bfa", "#f472b6", "#94a3b8"],
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { color: "#e6e9ef", boxWidth: 12 } } },
      },
    });
  }

  const vatCanvas = root.querySelector("#chart-vat");
  if (vatCanvas) {
    const s = overview.summary;
    vatCanvas._chart = new Chart(vatCanvas, {
      type: "bar",
      data: {
        labels: ["Output VAT", "Input VAT", "Net due"],
        datasets: [{
          data: [s.vatOutput, s.vatInput, Math.max(0, s.vatDue)],
          backgroundColor: [chartColors.income, chartColors.expense, chartColors.accent],
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#8b92a0" }, grid: { display: false } },
          y: { ticks: { color: "#8b92a0" }, grid: { color: "rgba(255,255,255,0.06)" } },
        },
      },
    });
  }
}

export async function renderAccounts(ctx) {
  const { api, el, escapeHtml, shell, state, API } = ctx;
  const tab = state.accountsTab || "overview";
  const period = state.accountsPeriod || periodDefaults();

  const [meta, overview] = await Promise.all([
    api("/accounts/categories"),
    api(`/accounts/overview?from=${period.from}&to=${period.to}`),
  ]);

  const tabs = [
    ["overview", "Overview"],
    ["income", "Income"],
    ["expenses", "Expenses"],
    ["invoices", "Invoices"],
    ["reconcile", "Reconcile"],
    ["receipts", "Receipts"],
    ["reports", "Accountant"],
  ];

  const content = el(`
    <div class="accounts-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Accounts</h1>
          <p class="page-lead">Bookkeeping for income, expenses, VAT and invoices — system administrator only.</p>
        </div>
        <div class="accounts-period">
          <label>From <input type="date" id="period-from" value="${period.from}" /></label>
          <label>To <input type="date" id="period-to" value="${period.to}" /></label>
          <button class="btn btn--ghost btn--sm" id="period-apply">Apply</button>
        </div>
      </div>

      <div class="accounts-helper panel">
        <strong>Quick tips:</strong> Sync paid CMS/Stripe invoices automatically. Import bank CSVs to reconcile against income and expenses. Attach receipts for VAT reclaims.
      </div>

      <nav class="accounts-tabs">
        ${tabs.map(([id, label]) => `<button type="button" class="accounts-tab ${tab === id ? "is-active" : ""}" data-tab="${id}">${label}</button>`).join("")}
      </nav>

      <div id="accounts-panel"></div>
    </div>
  `);

  const panel = content.querySelector("#accounts-panel");

  const setTab = (nextTab) => {
    state.accountsTab = nextTab;
    ctx.setRoute("accounts");
  };

  content.querySelector("#period-apply").addEventListener("click", () => {
    state.accountsPeriod = {
      from: content.querySelector("#period-from").value,
      to: content.querySelector("#period-to").value,
    };
    ctx.setRoute("accounts");
  });

  content.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => setTab(btn.dataset.tab));
  });

  const s = overview.summary;

  if (tab === "overview") {
    panel.innerHTML = `
      <div class="grid-4 accounts-stats">
        <div class="stat"><div class="stat__label">Income (gross)</div><div class="stat__value stat__value--success">${fmt(s.incomeGross)}</div><div class="stat__sub">Net ${fmt(s.incomeNet)} · ${s.incomeCount} entries</div></div>
        <div class="stat"><div class="stat__label">Expenses (gross)</div><div class="stat__value stat__value--danger">${fmt(s.expenseGross)}</div><div class="stat__sub">Net ${fmt(s.expenseNet)} · ${s.expenseCount} entries</div></div>
        <div class="stat"><div class="stat__label">Net profit</div><div class="stat__value">${fmt(s.netProfit)}</div><div class="stat__sub">Before tax adjustments</div></div>
        <div class="stat"><div class="stat__label">VAT due</div><div class="stat__value">${fmt(s.vatDue)}</div><div class="stat__sub">Output ${fmt(s.vatOutput)} − Input ${fmt(s.vatInput)}</div></div>
      </div>
      <div class="grid-2 accounts-charts">
        <div class="panel accounts-chart-panel"><h2 style="margin-top:0">Income vs expenses</h2><div class="accounts-chart-wrap"><canvas id="chart-monthly" data-chart></canvas></div></div>
        <div class="panel accounts-chart-panel"><h2 style="margin-top:0">Revenue by product</h2><div class="accounts-chart-wrap"><canvas id="chart-products" data-chart></canvas></div></div>
      </div>
      <div class="grid-2">
        <div class="panel accounts-chart-panel"><h2 style="margin-top:0">VAT summary</h2><div class="accounts-chart-wrap accounts-chart-wrap--sm"><canvas id="chart-vat" data-chart></canvas></div></div>
        <div class="panel">
          <h2 style="margin-top:0">Outstanding invoices</h2>
          <p class="stat__value">${fmt(s.outstandingInvoices)}</p>
          <p class="page-lead">${s.outstandingCount} unpaid invoice(s) in this period</p>
          <h3>Product breakdown</h3>
          <table class="table">
            <thead><tr><th>Product</th><th>Revenue</th><th>Sales</th></tr></thead>
            <tbody>
              ${overview.productRevenue.map((p) => `<tr><td>${escapeHtml(p.product)}</td><td>${fmt(p.revenue)}</td><td>${p.count}</td></tr>`).join("") || `<tr><td colspan="3">No income recorded yet.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>`;
    paintCharts(content, overview);
  }

  if (tab === "income") {
    const { items } = await api(`/accounts/income?from=${period.from}&to=${period.to}`);
    panel.innerHTML = `
      <div class="page-header" style="margin-bottom:1rem">
        <p class="page-lead">Paid invoices and manual income entries appear here.</p>
        <button class="btn" id="add-income">Record income</button>
      </div>
      <div class="panel">
        <table class="table accounts-table">
          <thead><tr><th>Date</th><th>Description</th><th>Customer</th><th>Product</th><th>Net</th><th>VAT</th><th>Gross</th><th></th></tr></thead>
          <tbody>
            ${items.map((row) => `<tr>
              <td>${escapeHtml(row.transaction_date)}</td>
              <td>${escapeHtml(row.description)}${row.reference ? `<br /><small>${escapeHtml(row.reference)}</small>` : ""}</td>
              <td>${escapeHtml(row.customer_name || "—")}</td>
              <td>${escapeHtml(row.product || "—")}</td>
              <td>${fmt(row.amount_net)}</td>
              <td>${fmt(row.vat_amount)}</td>
              <td>${fmt(row.amount_gross)}</td>
              <td><button class="btn btn--ghost btn--sm" data-del-income="${row.id}">Delete</button></td>
            </tr>`).join("") || `<tr><td colspan="8">No income in this period.</td></tr>`}
          </tbody>
        </table>
      </div>`;

    panel.querySelector("#add-income").addEventListener("click", () => {
      const wrap = el(modal("Record income", incomeForm(meta.income, meta.products, meta.paymentMethods), `<button class="btn" id="save-income">Save income</button>`));
      content.appendChild(wrap);
      bindModals(content);
      bindVatPreview(wrap.querySelector("#income-form"));
      wrap.querySelector("#save-income").addEventListener("click", async () => {
        const form = wrap.querySelector("#income-form");
        await api("/accounts/income", { method: "POST", body: JSON.stringify(formDataToJson(form)) });
        wrap.remove();
        ctx.setRoute("accounts");
      });
    });

    panel.querySelectorAll("[data-del-income]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this income record?")) return;
        await api(`/accounts/income/${btn.dataset.delIncome}`, { method: "DELETE", body: "{}" });
        ctx.setRoute("accounts");
      });
    });
  }

  if (tab === "expenses") {
    const { items } = await api(`/accounts/expenses?from=${period.from}&to=${period.to}`);
    panel.innerHTML = `
      <div class="page-header" style="margin-bottom:1rem">
        <p class="page-lead">Track expenditure and VAT you can reclaim.</p>
        <button class="btn" id="add-expense">Add expense</button>
      </div>
      <div class="panel">
        <table class="table accounts-table">
          <thead><tr><th>Date</th><th>Description</th><th>Supplier</th><th>Net</th><th>VAT</th><th>Gross</th><th>Receipt</th><th></th></tr></thead>
          <tbody>
            ${items.map((row) => `<tr>
              <td>${escapeHtml(row.transaction_date)}</td>
              <td>${escapeHtml(row.description)}<br /><small>${escapeHtml(row.category)}</small></td>
              <td>${escapeHtml(row.supplier || "—")}</td>
              <td>${fmt(row.amount_net)}</td>
              <td>${fmt(row.vat_amount)}${row.vat_reclaimable ? "" : " <small>(no reclaim)</small>"}</td>
              <td>${fmt(row.amount_gross)}</td>
              <td>${row.receiptUrl ? `<a href="${escapeHtml(row.receiptUrl)}" target="_blank" rel="noopener">View</a>` : "—"}</td>
              <td><button class="btn btn--ghost btn--sm" data-del-expense="${row.id}">Delete</button></td>
            </tr>`).join("") || `<tr><td colspan="8">No expenses in this period.</td></tr>`}
          </tbody>
        </table>
      </div>`;

    panel.querySelector("#add-expense").addEventListener("click", () => {
      const wrap = el(modal("Add expense", expenseForm(meta.expense), `<button class="btn" id="save-expense">Save expense</button>`));
      content.appendChild(wrap);
      bindModals(content);
      bindVatPreview(wrap.querySelector("#expense-form"));
      bindReceiptInputs(wrap, () => wrap.querySelector("#linked-expense-id")?.value || "", state.token, API);

      wrap.querySelector("#save-expense").addEventListener("click", async () => {
        const form = wrap.querySelector("#expense-form");
        const payload = formDataToJson(form);
        const { id } = await api("/accounts/expenses", { method: "POST", body: JSON.stringify(payload) });
        if (wrap._pendingReceipt) {
          await uploadReceipt(wrap._pendingReceipt.file, id, wrap._pendingReceipt.method, state.token, API);
        }
        wrap.remove();
        ctx.setRoute("accounts");
      });
    });

    panel.querySelectorAll("[data-del-expense]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this expense?")) return;
        await api(`/accounts/expenses/${btn.dataset.delExpense}`, { method: "DELETE", body: "{}" });
        ctx.setRoute("accounts");
      });
    });
  }

  if (tab === "invoices") {
    const { items } = await api(`/accounts/invoices?from=${period.from}&to=${period.to}`);
    const cmsNote = meta.cmsConfigured
      ? `<button class="btn btn--ghost" id="cms-sync">Sync from CMS</button>`
      : `<span class="page-lead">Set <code>cms_mail_secret</code> in config.local.php to enable CMS invoice sync.</span>`;
    panel.innerHTML = `
      <div class="page-header" style="margin-bottom:1rem">
        <div>
          <p class="page-lead">When an invoice is paid, income is recorded automatically with VAT breakdown.</p>
          ${meta.cmsConfigured ? `<p class="page-lead">Pull paid Stripe invoices from Rail Intel CMS for the selected period.</p>` : ""}
        </div>
        <div class="accounts-receipt-actions">
          ${cmsNote}
          <button class="btn" id="add-invoice">New invoice</button>
        </div>
      </div>
      <div id="cms-sync-result"></div>
      <div class="panel">
        <table class="table accounts-table">
          <thead><tr><th>Invoice #</th><th>Customer</th><th>Product</th><th>Issued</th><th>Gross</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${items.map((row) => `<tr>
              <td><strong>${escapeHtml(row.invoice_number)}</strong>${row.cms_invoice_id ? `<br /><small>CMS</small>` : ""}</td>
              <td>${escapeHtml(row.customer_name)}</td>
              <td>${escapeHtml(row.product || "—")}</td>
              <td>${escapeHtml(row.issue_date)}${row.due_date ? `<br /><small>Due ${escapeHtml(row.due_date)}</small>` : ""}</td>
              <td>${fmt(row.amount_gross)}<br /><small>Net ${fmt(row.amount_net)} + VAT ${fmt(row.vat_amount)}</small></td>
              <td>${statusBadge(row.status)}${row.paid_date ? `<br /><small>Paid ${escapeHtml(row.paid_date)}</small>` : ""}</td>
              <td class="accounts-actions">
                ${row.status !== "paid" ? `<button class="btn btn--sm" data-pay-invoice="${row.id}">Mark paid</button>` : `<span style="color:var(--success)">On income</span>`}
                ${row.status !== "paid" ? `<button class="btn btn--ghost btn--sm" data-del-invoice="${row.id}">Delete</button>` : ""}
              </td>
            </tr>`).join("") || `<tr><td colspan="7">No invoices in this period.</td></tr>`}
          </tbody>
        </table>
      </div>`;

    panel.querySelector("#cms-sync")?.addEventListener("click", async () => {
      const btn = panel.querySelector("#cms-sync");
      const resultBox = panel.querySelector("#cms-sync-result");
      btn.disabled = true;
      resultBox.innerHTML = `<div class="alert" style="background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.25);color:#fde68a">Syncing from CMS…</div>`;
      try {
        const result = await api(`/accounts/cms/sync?from=${period.from}&to=${period.to}`, { method: "POST", body: "{}" });
        resultBox.innerHTML = `<div class="alert alert--success">Synced ${result.fetched} invoice(s): ${result.created} created, ${result.updated} updated, ${result.paid} marked paid.${result.errors?.length ? ` ${result.errors.length} error(s).` : ""}</div>`;
        ctx.setRoute("accounts");
      } catch (err) {
        resultBox.innerHTML = `<div class="alert alert--error">${escapeHtml(err.message)}</div>`;
      } finally {
        btn.disabled = false;
      }
    });

    panel.querySelector("#add-invoice").addEventListener("click", () => {
      const wrap = el(modal("New invoice", invoiceForm(meta.products), `<button class="btn" id="save-invoice">Create invoice</button>`));
      content.appendChild(wrap);
      bindModals(content);
      bindVatPreview(wrap.querySelector("#invoice-form"));
      wrap.querySelector("#save-invoice").addEventListener("click", async () => {
        const form = wrap.querySelector("#invoice-form");
        await api("/accounts/invoices", { method: "POST", body: JSON.stringify(formDataToJson(form)) });
        wrap.remove();
        ctx.setRoute("accounts");
      });
    });

    panel.querySelectorAll("[data-pay-invoice]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const paidDate = prompt("Payment date (YYYY-MM-DD)", new Date().toISOString().slice(0, 10));
        if (!paidDate) return;
        await api(`/accounts/invoices/${btn.dataset.payInvoice}/pay`, { method: "POST", body: JSON.stringify({ paidDate }) });
        ctx.setRoute("accounts");
      });
    });

    panel.querySelectorAll("[data-del-invoice]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this invoice?")) return;
        await api(`/accounts/invoices/${btn.dataset.delInvoice}`, { method: "DELETE", body: "{}" });
        ctx.setRoute("accounts");
      });
    });
  }

  if (tab === "reconcile") {
    const [recon, batches] = await Promise.all([
      api(`/accounts/reconciliation?from=${period.from}&to=${period.to}`),
      api("/accounts/bank/batches"),
    ]);
    panel.innerHTML = `
      <div class="grid-2">
        <div class="panel">
          <h2 style="margin-top:0">Import bank statement</h2>
          <p class="page-lead">Upload a CSV export from your bank. Supports Date + Description + Amount, or Money in / Money out columns (Barclays, HSBC, Starling, NatWest style).</p>
          <form id="bank-import-form" class="accounts-form">
            <div class="field"><label>Bank name (optional)</label><input name="bankName" placeholder="e.g. Barclays business" /></div>
            <label class="btn"><input type="file" name="file" accept=".csv,text/csv" required hidden />Choose CSV file</label>
            <span id="bank-file-name" class="page-lead"></span>
            <button class="btn" type="submit" style="margin-top:0.75rem">Import transactions</button>
          </form>
          <div id="bank-import-result"></div>
        </div>
        <div class="panel">
          <h2 style="margin-top:0">Reconciliation summary</h2>
          <table class="table">
            <tr><td>Bank transactions</td><td><strong>${recon.stats.bankCount}</strong></td></tr>
            <tr><td>Suggested matches</td><td><strong>${recon.stats.suggestedMatches}</strong></td></tr>
            <tr><td>Income not on bank statement</td><td><strong>${recon.stats.unmatchedIncome}</strong></td></tr>
            <tr><td>Expenses not on bank statement</td><td><strong>${recon.stats.unmatchedExpenses}</strong></td></tr>
          </table>
          <h3>Recent imports</h3>
          <ul class="accounts-list">
            ${batches.items.map((b) => `<li>${escapeHtml(b.filename)} — ${b.row_count} rows · ${escapeHtml(b.created_at)}</li>`).join("") || "<li>No bank CSVs imported yet.</li>"}
          </ul>
        </div>
      </div>
      <div class="panel" style="margin-top:1rem">
        <h2 style="margin-top:0">Bank transactions</h2>
        <table class="table accounts-table">
          <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Match</th><th></th></tr></thead>
          <tbody>
            ${recon.bank.map((row) => {
              const amt = Number(row.amount);
              const cls = amt >= 0 ? "stat__value--success" : "stat__value--danger";
              const suggested = row.suggestedMatch
                ? `<span style="color:var(--accent)">Suggested: ${escapeHtml(row.suggestedMatch.label)} (${fmt(row.suggestedMatch.amount)})</span>`
                : row.matchedLabel
                  ? escapeHtml(row.matchedLabel)
                  : "—";
              return `<tr>
                <td>${escapeHtml(row.transaction_date)}</td>
                <td>${escapeHtml(row.description)}</td>
                <td class="${cls}">${fmt(Math.abs(amt))} ${amt >= 0 ? "in" : "out"}</td>
                <td>${suggested}</td>
                <td>${row.suggestedMatch ? `<button class="btn btn--sm" data-confirm-match="${row.id}" data-match-type="${row.suggestedMatch.type}" data-match-id="${row.suggestedMatch.id}">Confirm</button>` : ""}</td>
              </tr>`;
            }).join("") || `<tr><td colspan="5">Import a bank CSV to start reconciling.</td></tr>`}
          </tbody>
        </table>
      </div>
      <div class="grid-2">
        <div class="panel">
          <h3 style="margin-top:0">Income not matched to bank</h3>
          <table class="table accounts-table">
            <thead><tr><th>Date</th><th>Description</th><th>Amount</th></tr></thead>
            <tbody>${recon.unmatchedIncome.map((r) => `<tr><td>${escapeHtml(r.date)}</td><td>${escapeHtml(r.description)}</td><td>${fmt(r.amount)}</td></tr>`).join("") || `<tr><td colspan="3">All income matched or none recorded.</td></tr>`}</tbody>
          </table>
        </div>
        <div class="panel">
          <h3 style="margin-top:0">Expenses not matched to bank</h3>
          <table class="table accounts-table">
            <thead><tr><th>Date</th><th>Description</th><th>Amount</th></tr></thead>
            <tbody>${recon.unmatchedExpenses.map((r) => `<tr><td>${escapeHtml(r.date)}</td><td>${escapeHtml(r.description)}</td><td>${fmt(r.amount)}</td></tr>`).join("") || `<tr><td colspan="3">All expenses matched or none recorded.</td></tr>`}</tbody>
          </table>
        </div>
      </div>`;

    const bankForm = panel.querySelector("#bank-import-form");
    const fileInput = bankForm.querySelector('input[type="file"]');
    fileInput.addEventListener("change", () => {
      panel.querySelector("#bank-file-name").textContent = fileInput.files?.[0]?.name || "";
    });
    bankForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const file = fileInput.files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bankName", bankForm.bankName.value);
      const res = await fetch(`${API}/accounts/bank/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${state.token}` },
        body: fd,
      });
      const data = await res.json();
      const box = panel.querySelector("#bank-import-result");
      if (!res.ok) {
        box.innerHTML = `<div class="alert alert--error">${escapeHtml(data.error || "Import failed")}</div>`;
        return;
      }
      box.innerHTML = `<div class="alert alert--success">Imported ${data.imported} transaction(s)${data.skipped ? `, skipped ${data.skipped}` : ""}.</div>`;
      ctx.setRoute("accounts");
    });

    panel.querySelectorAll("[data-confirm-match]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await api("/accounts/reconciliation/match", {
          method: "POST",
          body: JSON.stringify({
            bankTransactionId: btn.dataset.confirmMatch,
            matchType: btn.dataset.matchType,
            matchedId: btn.dataset.matchId,
          }),
        });
        ctx.setRoute("accounts");
      });
    });
  }

  if (tab === "receipts") {
    const { items } = await api("/accounts/receipts");
    panel.innerHTML = `
      <div class="page-header" style="margin-bottom:1rem">
        <p class="page-lead">Receipt archive — upload from desktop or capture with your phone camera.</p>
        <div class="accounts-receipt-actions">
          <label class="btn"><input type="file" id="standalone-receipt" accept="image/*,application/pdf" hidden />Upload receipt</label>
          <label class="btn btn--ghost"><input type="file" id="standalone-camera" accept="image/*" capture="environment" hidden />Camera capture</label>
        </div>
      </div>
      <div class="media-grid">
        ${items.map((r) => `
          <article class="media-card">
            ${r.mime_type.startsWith("image/") ? `<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener"><img src="${escapeHtml(r.url)}" alt="${escapeHtml(r.original_name)}" /></a>` : `<a class="accounts-pdf-link" href="${escapeHtml(r.url)}" target="_blank" rel="noopener">PDF receipt</a>`}
            <div class="media-card__meta">
              ${escapeHtml(r.original_name)}<br />
              ${r.expense_description ? `Linked: ${escapeHtml(r.expense_description)}` : "Unlinked"}<br />
              <small>${escapeHtml(r.created_at)} · ${escapeHtml(r.capture_method)}</small>
            </div>
          </article>`).join("") || `<p class="page-lead">No receipts uploaded yet.</p>`}
      </div>`;

    const uploadStandalone = async (file, method) => {
      if (!file) return;
      await uploadReceipt(file, null, method, state.token, API);
      ctx.setRoute("accounts");
    };
    panel.querySelector("#standalone-receipt")?.addEventListener("change", (e) => uploadStandalone(e.target.files?.[0], "upload"));
    panel.querySelector("#standalone-camera")?.addEventListener("change", (e) => uploadStandalone(e.target.files?.[0], "camera"));
  }

  if (tab === "reports") {
    const exportUrl = (type) => `${API}/accounts/export/${type}?from=${period.from}&to=${period.to}`;
    panel.innerHTML = `
      <div class="grid-2">
        <div class="panel">
          <h2 style="margin-top:0">Exports for your accountant</h2>
          <p class="page-lead">Download CSV files for the selected period. UTF-8 with BOM for Excel.</p>
          <div class="accounts-export-list">
            <a class="btn btn--ghost" href="${exportUrl("all")}" download data-export>Full ledger (income + expenses)</a>
            <a class="btn btn--ghost" href="${exportUrl("income")}" download data-export>Income only</a>
            <a class="btn btn--ghost" href="${exportUrl("expenses")}" download data-export>Expenses only</a>
            <a class="btn btn--ghost" href="${exportUrl("invoices")}" download data-export>Invoices</a>
            <a class="btn btn--ghost" href="${exportUrl("vat")}" download data-export>VAT summary</a>
          </div>
        </div>
        <div class="panel">
          <h2 style="margin-top:0">VAT return helper</h2>
          <table class="table">
            <tr><td>Output VAT (charged on sales)</td><td><strong>${fmt(s.vatOutput)}</strong></td></tr>
            <tr><td>Input VAT (reclaimable on purchases)</td><td><strong>${fmt(s.vatInput)}</strong></td></tr>
            <tr><td>Net VAT due to HMRC</td><td><strong>${fmt(s.vatDue)}</strong></td></tr>
          </table>
          <h3>Profit &amp; loss (simplified)</h3>
          <table class="table">
            <tr><td>Total income (net)</td><td>${fmt(s.incomeNet)}</td></tr>
            <tr><td>Total expenses (net)</td><td>${fmt(s.expenseNet)}</td></tr>
            <tr><td>Net profit</td><td><strong>${fmt(s.netProfit)}</strong></td></tr>
          </table>
        </div>
      </div>
      <div class="panel accounts-helper">
        <h3 style="margin-top:0">Recommendations</h3>
        <ul class="accounts-list">
          <li>Reconcile bank statements monthly against income and expenses recorded here.</li>
          <li>Keep receipts for all VAT-reclaimable purchases — attach them when adding expenses.</li>
          <li>Mark CMS/Stripe invoices as paid on the day funds clear your bank account.</li>
          <li>Share the VAT summary CSV with your accountant before each quarterly return.</li>
          <li>Use consistent product names so revenue breakdown stays meaningful.</li>
        </ul>
      </div>`;

    panel.querySelectorAll("[data-export]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        fetch(link.href, { headers: { Authorization: `Bearer ${state.token}` } })
          .then((res) => res.blob())
          .then((blob) => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = link.getAttribute("href").split("/").pop() + ".csv";
            a.click();
          })
          .catch(() => alert("Export failed — check you are still signed in."));
      });
    });
  }

  return shell(content);
}
