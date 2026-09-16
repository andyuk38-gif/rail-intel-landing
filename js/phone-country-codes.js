/* Country dial codes for signup phone fields — flags via regional indicators */
(function () {
  "use strict";

  function flagFor(iso) {
    return iso
      .toUpperCase()
      .replace(/./g, function (char) {
        return String.fromCodePoint(127397 + char.charCodeAt(0));
      });
  }

  var COUNTRIES = [
    { iso: "GB", dial: "+44", label: "United Kingdom" },
    { iso: "IE", dial: "+353", label: "Ireland" },
    { iso: "US", dial: "+1", label: "United States" },
    { iso: "CA", dial: "+1", label: "Canada" },
    { iso: "AU", dial: "+61", label: "Australia" },
    { iso: "NZ", dial: "+64", label: "New Zealand" },
    { iso: "FR", dial: "+33", label: "France" },
    { iso: "DE", dial: "+49", label: "Germany" },
    { iso: "ES", dial: "+34", label: "Spain" },
    { iso: "IT", dial: "+39", label: "Italy" },
    { iso: "NL", dial: "+31", label: "Netherlands" },
    { iso: "BE", dial: "+32", label: "Belgium" },
    { iso: "CH", dial: "+41", label: "Switzerland" },
    { iso: "AT", dial: "+43", label: "Austria" },
    { iso: "SE", dial: "+46", label: "Sweden" },
    { iso: "NO", dial: "+47", label: "Norway" },
    { iso: "DK", dial: "+45", label: "Denmark" },
    { iso: "FI", dial: "+358", label: "Finland" },
    { iso: "PL", dial: "+48", label: "Poland" },
    { iso: "PT", dial: "+351", label: "Portugal" },
    { iso: "CZ", dial: "+420", label: "Czechia" },
    { iso: "RO", dial: "+40", label: "Romania" },
    { iso: "HU", dial: "+36", label: "Hungary" },
    { iso: "GR", dial: "+30", label: "Greece" },
    { iso: "AE", dial: "+971", label: "United Arab Emirates" },
    { iso: "SA", dial: "+966", label: "Saudi Arabia" },
    { iso: "QA", dial: "+974", label: "Qatar" },
    { iso: "IN", dial: "+91", label: "India" },
    { iso: "SG", dial: "+65", label: "Singapore" },
    { iso: "HK", dial: "+852", label: "Hong Kong" },
    { iso: "JP", dial: "+81", label: "Japan" },
    { iso: "CN", dial: "+86", label: "China" },
    { iso: "ZA", dial: "+27", label: "South Africa" },
    { iso: "BR", dial: "+55", label: "Brazil" },
    { iso: "MX", dial: "+52", label: "Mexico" },
  ].map(function (entry) {
    return {
      iso: entry.iso,
      dial: entry.dial,
      label: entry.label,
      flag: flagFor(entry.iso),
    };
  });

  function normalizeNationalNumber(dial, national) {
    var digits = String(national || "").replace(/\D/g, "");
    if (!digits) return "";
    if (dial === "+44" && digits.charAt(0) === "0") digits = digits.slice(1);
    if (dial === "+353" && digits.charAt(0) === "0") digits = digits.slice(1);
    if (dial === "+1" && digits.length === 11 && digits.charAt(0) === "1") digits = digits.slice(1);
    return digits;
  }

  function formatPhone(dial, national) {
    var digits = normalizeNationalNumber(dial, national);
    if (!digits) return "";
    return dial + " " + digits;
  }

  function populateSelect(selectEl, defaultIso) {
    if (!selectEl) return;
    selectEl.innerHTML = "";
    COUNTRIES.forEach(function (country) {
      var opt = document.createElement("option");
      opt.value = country.iso;
      opt.textContent = country.dial + " " + country.label;
      opt.dataset.dial = country.dial;
      opt.dataset.flag = country.flag;
      if (country.iso === defaultIso) opt.selected = true;
      selectEl.appendChild(opt);
    });
  }

  function getDialForIso(iso) {
    var match = COUNTRIES.find(function (c) {
      return c.iso === iso;
    });
    return match ? match.dial : "+44";
  }

  function getFlagForIso(iso) {
    var match = COUNTRIES.find(function (c) {
      return c.iso === iso;
    });
    return match ? match.flag : flagFor("GB");
  }

  window.RiPhoneCountries = {
    list: COUNTRIES,
    populateSelect: populateSelect,
    formatPhone: formatPhone,
    normalizeNationalNumber: normalizeNationalNumber,
    getDialForIso: getDialForIso,
    getFlagForIso: getFlagForIso,
  };
})();
