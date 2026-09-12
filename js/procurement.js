/* Supplier procurement pack — loads live evidence from CMS public API */
(function () {
  "use strict";

  var root = document.querySelector("[data-procurement-page]");
  if (!root) return;

  var proxyMeta = document.querySelector('meta[name="signup-api-proxy"]');
  var cmsMeta = document.querySelector('meta[name="cms-api"]');
  var proxyBase = (proxyMeta && proxyMeta.getAttribute("content")) || "/api/signup-proxy.php";
  var cmsApi = (cmsMeta && cmsMeta.getAttribute("content")) || "https://cms.railintel.co.uk/api";

  function apiUrl(path) {
    if (proxyBase) {
      return proxyBase + "?path=" + encodeURIComponent(path);
    }
    return cmsApi.replace(/\/$/, "") + "/" + path;
  }

  function cmsPublicUrl(path) {
    return cmsApi.replace(/\/$/, "") + "/" + path;
  }

  function docUrl(slot) {
    return cmsPublicUrl("public/procurement-pack/document/" + slot);
  }

  function bankLetterUrl() {
    return cmsPublicUrl("public/procurement-pack/bank-letter");
  }

  function formatDate(value) {
    if (!value) return "—";
    var d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  function setField(container, field, value) {
    if (!container) return;
    var el = container.querySelector('[data-field="' + field + '"]');
    if (el) el.textContent = value || "—";
  }

  function renderInsurance(container, key, label, data) {
    if (!container || !data) return;
    var card = document.createElement("article");
    card.className = "procurement-card";
    var expiry = data.expiryDate ? formatDate(data.expiryDate) : "—";
    var html =
      '<h3 class="procurement-card__title">' +
      label +
      "</h3>" +
      '<dl class="procurement-facts procurement-facts--compact">' +
      "<div><dt>Provider</dt><dd>" +
      (data.provider || "—") +
      "</dd></div>" +
      "<div><dt>Policy number</dt><dd>" +
      (data.policyNumber || "—") +
      "</dd></div>" +
      "<div><dt>Cover</dt><dd>" +
      (data.coverAmount || "—") +
      "</dd></div>" +
      "<div><dt>Expiry</dt><dd>" +
      expiry +
      "</dd></div>" +
      "</dl>";
    if (data.hasDocument) {
      html +=
        '<p class="procurement-card__action"><a class="btn btn-secondary btn-sm" href="' +
        docUrl(key) +
        '" target="_blank" rel="noopener">Download certificate</a></p>';
    } else {
      html += '<p class="procurement-empty procurement-empty--inline">Certificate not yet uploaded.</p>';
    }
    card.innerHTML = html;
    container.appendChild(card);
  }

  fetch(apiUrl("public/procurement-pack"))
    .then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data.error || "Could not load procurement pack");
        return data;
      });
    })
    .then(function (data) {
      var company = root.querySelector("[data-procurement-company]");
      if (company && data.company) {
        setField(company, "legalName", data.company.legalName);
        setField(company, "companyNumber", data.company.companyNumber);
        setField(company, "vatNumber", data.company.vatNumber);
        setField(company, "registeredOffice", data.company.registeredOffice);
        setField(company, "procurementEmail", data.company.procurementEmail);
        setField(company, "dpoEmail", data.company.dpoEmail);
        var procEmail = company.querySelector('[data-field="procurementEmail"]');
        var dpoEmail = company.querySelector('[data-field="dpoEmail"]');
        if (procEmail && data.company.procurementEmail) {
          procEmail.innerHTML =
            '<a href="mailto:' +
            data.company.procurementEmail +
            '">' +
            data.company.procurementEmail +
            "</a>";
        }
        if (dpoEmail && data.company.dpoEmail) {
          dpoEmail.innerHTML =
            '<a href="mailto:' + data.company.dpoEmail + '">' + data.company.dpoEmail + "</a>";
        }
      }

      var bankWrap = root.querySelector("[data-procurement-bank-wrap]");
      var bankEmpty = root.querySelector("[data-procurement-bank-empty]");
      if (data.bankDetails) {
        if (bankWrap) bankWrap.hidden = false;
        if (bankEmpty) bankEmpty.hidden = true;
        var bank = root.querySelector("[data-procurement-bank]");
        setField(bank, "accountName", data.bankDetails.accountName);
        setField(bank, "sortCode", data.bankDetails.sortCode);
        setField(bank, "accountNumber", data.bankDetails.accountNumber);
        var letterLink = root.querySelector("[data-procurement-bank-letter]");
        if (letterLink) letterLink.href = bankLetterUrl();
      }

      var insuranceEl = root.querySelector("[data-procurement-insurance]");
      if (insuranceEl && data.insurance) {
        insuranceEl.innerHTML = "";
        renderInsurance(
          insuranceEl,
          "employers_liability",
          "Employers' liability",
          data.insurance.employersLiability
        );
        renderInsurance(
          insuranceEl,
          "public_liability",
          "Public liability",
          data.insurance.publicLiability
        );
        renderInsurance(
          insuranceEl,
          "professional_indemnity",
          "Professional indemnity",
          data.insurance.professionalIndemnity
        );
      }

      var cyberWrap = root.querySelector("[data-procurement-cyber-wrap]");
      var cyberEmpty = root.querySelector("[data-procurement-cyber-empty]");
      var cyber = data.cyberEssentials || {};
      if (cyber.certificateNumber || cyber.hasDocument) {
        if (cyberWrap) cyberWrap.hidden = false;
        if (cyberEmpty) cyberEmpty.hidden = true;
        var cyberEl = root.querySelector("[data-procurement-cyber]");
        setField(cyberEl, "certificateNumber", cyber.certificateNumber);
        setField(cyberEl, "certifyingBody", cyber.certifyingBody);
        setField(cyberEl, "issueDate", formatDate(cyber.issueDate));
        setField(cyberEl, "expiryDate", formatDate(cyber.expiryDate));
        if (cyber.hasDocument) {
          var cyberDl = root.querySelector("[data-procurement-cyber-download]");
          if (cyberDl) {
            cyberDl.hidden = false;
            var cyberLink = cyberDl.querySelector("[data-procurement-doc]");
            if (cyberLink) cyberLink.href = docUrl("cyber_essentials");
          }
        }
      }

      var dpaWrap = root.querySelector("[data-procurement-dpa-wrap]");
      var dpaEmpty = root.querySelector("[data-procurement-dpa-empty]");
      if (data.dpa && data.dpa.summary) {
        if (dpaWrap) dpaWrap.hidden = false;
        if (dpaEmpty) dpaEmpty.hidden = true;
        var summary = root.querySelector("[data-procurement-dpa-summary]");
        if (summary) summary.textContent = data.dpa.summary;
        var email = root.querySelector("[data-procurement-dpa-email]");
        if (email && data.dpa.contactEmail) {
          email.href = "mailto:" + data.dpa.contactEmail;
          email.textContent = data.dpa.contactEmail;
        }
        var terms = root.querySelector("[data-procurement-dpa-terms]");
        if (terms && data.dpa.termsReference) terms.textContent = data.dpa.termsReference;
        if (data.dpa.hasDocument) {
          var dpaDl = root.querySelector("[data-procurement-dpa-download]");
          if (dpaDl) {
            dpaDl.hidden = false;
            var dpaLink = dpaDl.querySelector("[data-procurement-doc]");
            if (dpaLink) dpaLink.href = docUrl("dpa");
          }
        }
      }

      var dpia = data.dpia;
      if (dpia) {
        var dpiaWrap = root.querySelector("[data-procurement-dpia-wrap]");
        if (dpiaWrap) dpiaWrap.hidden = false;
        var cats = root.querySelector("[data-procurement-data-categories]");
        if (cats && Array.isArray(dpia.dataCategories)) {
          cats.innerHTML = dpia.dataCategories.map(function (c) {
            return "<li>" + c + "</li>";
          }).join("");
        }
        var hosting = root.querySelector("[data-procurement-hosting]");
        if (hosting) hosting.textContent = dpia.hostingRegions || "";
        var residency = root.querySelector("[data-procurement-residency]");
        if (residency) residency.textContent = dpia.dataResidency || "";
        var retention = root.querySelector("[data-procurement-retention]");
        if (retention) retention.textContent = dpia.retentionSummary || "";
        var transfers = root.querySelector("[data-procurement-transfers]");
        if (transfers) transfers.textContent = dpia.crossBorderTransfers || "";
        var security = root.querySelector("[data-procurement-security]");
        if (security) security.textContent = dpia.securityControlsSummary || "";
        var subTable = root.querySelector("[data-procurement-subprocessors] tbody");
        if (subTable && Array.isArray(dpia.subprocessors)) {
          subTable.innerHTML = dpia.subprocessors
            .map(function (s) {
              return (
                "<tr><td>" +
                s.name +
                "</td><td>" +
                s.purpose +
                "</td><td>" +
                s.location +
                "</td><td>" +
                s.safeguards +
                "</td></tr>"
              );
            })
            .join("");
        }
      }

      if (data.saq) {
        var saqIntro = root.querySelector("[data-procurement-saq-intro]");
        if (saqIntro) saqIntro.textContent = data.saq.intro || "";
        var saq = root.querySelector("[data-procurement-saq]");
        if (saq && Array.isArray(data.saq.topics)) {
          saq.innerHTML = data.saq.topics
            .map(function (t) {
              return (
                "<div><dt>" +
                t.question +
                "</dt><dd>" +
                t.answer +
                "</dd></div>"
              );
            })
            .join("");
        }
      }

      if (data.updatedAt) {
        var updatedWrap = root.querySelector("[data-procurement-updated]");
        var updatedVal = root.querySelector("[data-procurement-updated-value]");
        if (updatedWrap && updatedVal) {
          updatedWrap.hidden = false;
          updatedVal.textContent = formatDate(data.updatedAt);
        }
      }
    })
    .catch(function () {
      var note = document.createElement("p");
      note.className = "procurement-empty procurement-empty--banner";
      note.textContent =
        "Live procurement data could not be loaded. Contact sales@railintel.co.uk for documents.";
      root.insertBefore(note, root.firstChild);
    });
})();
