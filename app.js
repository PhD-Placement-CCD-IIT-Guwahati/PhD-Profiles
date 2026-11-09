(function () {
  "use strict";
  var cfg = window.SITE_CONFIG || {};
  var els = {
    q: document.getElementById("q"),
    discipline: document.getElementById("discipline"),
    reset: document.getElementById("reset"),
    list: document.getElementById("profiles"),
    count: document.getElementById("count"),
    empty: document.getElementById("empty"),
    stats: document.getElementById("stats"),
    coords: document.getElementById("coordinators")
  };
  var people = [];

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // Accept http(s) links and relative paths inside the repository (e.g. photos/name.jpg); reject anything else.
  function safeUrl(u) {
    u = String(u || "").trim();
    if (/^https?:\/\//i.test(u)) return u;
    if (u && !/^[a-z][a-z0-9+.-]*:/i.test(u) && !/^\/\//.test(u)) return u;
    return "";
  }
  // Turn a Google Drive share link into a direct image link.
  function photoUrl(u) {
    u = safeUrl(u);
    var m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);
    return m ? "https://drive.google.com/thumbnail?id=" + m[1] + "&sz=w600" : u;
  }
  function initials(name) {
    return String(name || "").split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0].toUpperCase(); }).join("");
  }
  function digits(s) { return String(s || "").replace(/\D/g, ""); }
  function norm(s) { return String(s || "").toLowerCase(); }

  // CSV parser: handles quoted fields, commas and line breaks inside quotes, and "" escapes.
  function parseCSV(text) {
    text = text.replace(/^\uFEFF/, "");
    var rows = [], row = [], field = "", i = 0, inQ = false;
    while (i < text.length) {
      var c = text[i];
      if (inQ) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
          inQ = false; i++; continue;
        }
        field += c; i++; continue;
      }
      if (c === '"') { inQ = true; i++; continue; }
      if (c === ",") { row.push(field); field = ""; i++; continue; }
      if (c === "\r") { i++; continue; }
      if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
      field += c; i++;
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }
    if (!rows.length) return [];
    var head = rows[0].map(function (h) { return h.trim().toLowerCase().replace(/\s+/g, "_"); });
    return rows.slice(1)
      .filter(function (r) { return r.some(function (v) { return String(v).trim() !== ""; }); })
      .map(function (r) {
        var o = {};
        head.forEach(function (h, k) { o[h] = (r[k] || "").trim(); });
        return o;
      });
  }

  function toPerson(o) {
    var kw = (o.keywords || "").split(/[;|]/).map(function (k) { return k.trim(); }).filter(Boolean);
    var p = {
      name: o.name || "",
      discipline: o.discipline || "Other",
      thesis: o.thesis_title || "",
      abstract: o.abstract || "",
      keywords: kw,
      email: o.email || "",
      phone: o.phone || "",
      resume: safeUrl(o.resume_url),
      photo: photoUrl(o.photo_url)
    };
    p.hay = norm([p.name, p.discipline, p.thesis, p.abstract, kw.join(" "), p.email, cfg.showPhone === false ? "" : p.phone].join(" "));
    p.phoneDigits = cfg.showPhone === false ? "" : digits(p.phone);
    return p;
  }

  /* ---------- rendering ---------- */
  var ICON = {
    mail: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    phone: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    doc: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>'
  };

  function highlight(text, terms) {
    var out = esc(text);
    terms.forEach(function (t) {
      if (t.length < 2) return;
      var re = new RegExp("(" + esc(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
      out = out.replace(re, "<mark>$1</mark>");
    });
    return out;
  }

  function card(p, terms) {
    var kws = p.keywords.map(function (k) {
      return '<li><button type="button" data-kw="' + esc(k) + '">' + highlight(k, terms) + "</button></li>";
    }).join("");
    var photo = p.photo
      ? '<img src="' + esc(p.photo) + '" alt="Photo of ' + esc(p.name) + '" loading="lazy" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'initials\',textContent:this.dataset.i}))" data-i="' + esc(initials(p.name)) + '">'
      : '<span class="initials" aria-hidden="true">' + esc(initials(p.name)) + "</span>";
    var contact = [];
    if (p.email) contact.push('<a href="mailto:' + esc(p.email) + '">' + ICON.mail + '<span><small>Email ID</small>' + highlight(p.email, terms) + "</span></a>");
    if (p.phone && cfg.showPhone !== false) contact.push('<a href="tel:' + esc(p.phone.replace(/\s+/g, "")) + '">' + ICON.phone + '<span><small>Contact</small>' + highlight(p.phone, terms) + "</span></a>");
    var resume = p.resume ? '<a class="resume" href="' + esc(p.resume) + '" target="_blank" rel="noopener">' + ICON.doc + "View résumé</a>" : "";
    return '<li class="profile">' +
      '<div class="top">' +
        '<div class="photo">' + photo + "</div>" +
        '<div class="head">' +
          '<span class="disc">' + esc(p.discipline) + "</span>" +
          "<h2>" + highlight(p.name, terms) + "</h2>" +
          (p.thesis ? '<p class="thesis"><small>PhD thesis title</small>' + highlight(p.thesis, terms) + "</p>" : "") +
        "</div>" +
      "</div>" +
      (p.abstract ? '<div class="abstract"><h3>Abstract</h3><p>' + highlight(p.abstract, terms) + "</p></div>" : "") +
      (kws ? '<div class="kw"><h3>Keywords</h3><ul class="keywords">' + kws + "</ul></div>" : "") +
      '<div class="reach">' + contact.join("") + resume + "</div>" +
    "</li>";
  }

  function render() {
    var q = els.q.value.trim();
    var terms = norm(q).split(/\s+/).filter(Boolean);
    var d = els.discipline.value;
    var res = people.filter(function (p) {
      if (d && p.discipline !== d) return false;
      return terms.every(function (t) {
        if (p.hay.indexOf(t) !== -1) return true;
        var td = digits(t);
        return td.length >= 4 && p.phoneDigits.indexOf(td) !== -1;
      });
    });
    els.list.innerHTML = res.map(function (p) { return card(p, terms); }).join("");
    els.count.textContent = res.length === people.length
      ? "Showing all " + people.length + " scholars"
      : "Showing " + res.length + " of " + people.length + " scholars";
    if (!res.length) {
      els.empty.hidden = false;
      els.empty.innerHTML = "<strong>No scholars match this search.</strong>Try a broader keyword, check the spelling, or choose All disciplines.";
    } else {
      els.empty.hidden = true;
    }
    var params = new URLSearchParams();
    if (q) params.set("q", q);
    if (d) params.set("discipline", d);
    var qs = params.toString();
    history.replaceState(null, "", qs ? "?" + qs : location.pathname);
  }

  function fillDisciplines() {
    var counts = {};
    people.forEach(function (p) { counts[p.discipline] = (counts[p.discipline] || 0) + 1; });
    Object.keys(counts).sort().forEach(function (name) {
      var o = document.createElement("option");
      o.value = name;
      o.textContent = name + " (" + counts[name] + ")";
      els.discipline.appendChild(o);
    });
    var n = Object.keys(counts).length;
    els.stats.textContent = people.length + (people.length === 1 ? " profile" : " profiles") + " listed below across " + n + (n === 1 ? " discipline" : " disciplines") + ".";
  }

  function fillContacts() {
    var c = cfg.centre || {};
    var mail = document.getElementById("centre-email");
    var web = document.getElementById("centre-web");
    if (c.email) { mail.href = "mailto:" + c.email; mail.textContent = c.email; }
    if (c.website) { web.href = c.website; web.textContent = c.websiteLabel || c.website; }
    var coordHtml = (cfg.coordinators || []).map(function (p) {
      return "<li><strong>" + esc(p.name) + "</strong><span>" + esc(p.role || "") + "</span>" +
        (p.phone ? '<a href="tel:' + esc(p.phone.replace(/\s+/g, "")) + '">' + esc(p.phone) + "</a>" : "") +
        (p.email ? '<a href="mailto:' + esc(p.email) + '">' + esc(p.email) + "</a>" : "") + "</li>";
    }).join("");
    els.coords.innerHTML = coordHtml;
    var top = document.getElementById("coordinators-top");
    if (top) top.innerHTML = coordHtml;
    var em = document.getElementById("partner-emails");
    if (em) em.innerHTML = (cfg.partnershipEmails || [{ email: c.email }]).map(function (e) {
      return '<li><a href="mailto:' + esc(e.email) + '">' + ICON.mail + "<span>" + (e.label ? "<small>" + esc(e.label) + "</small>" : "") + esc(e.email) + "</span></a></li>";
    }).join("");
    var webTop = document.getElementById("centre-web-top");
    if (webTop && c.website) { webTop.href = c.website; webTop.textContent = c.websiteLabel || c.website; }
    var h = cfg.highlight || {};
    if (h.scholars) document.getElementById("fig-scholars").textContent = h.scholars;
    if (h.disciplines) document.getElementById("fig-disciplines").textContent = h.disciplines;
  }

  /* ---------- events ---------- */
  var t;
  els.q.addEventListener("input", function () { clearTimeout(t); t = setTimeout(render, 120); });
  els.discipline.addEventListener("change", render);
  els.reset.addEventListener("click", function () { els.q.value = ""; els.discipline.value = ""; render(); els.q.focus(); });
  els.list.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-kw]");
    if (!b) return;
    els.q.value = b.getAttribute("data-kw");
    render();
    els.q.scrollIntoView({ block: "nearest" });
  });

  /* ---------- start ---------- */
  fillContacts();
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }
  function rowsFromXlsx(buf) {
    var wb = XLSX.read(buf, { type: "array" });
    var name = wb.SheetNames.indexOf("Candidates") !== -1 ? "Candidates" : wb.SheetNames[0];
    var rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: "", raw: false });
    return rows.map(function (r) {
      var o = {};
      Object.keys(r).forEach(function (k) { o[k.trim().toLowerCase().replace(/\s+/g, "_")] = String(r[k]).trim(); });
      return o;
    });
  }
  var url = cfg.dataUrl || "candidates.xlsx";
  var isXlsx = /\.xlsx?(\?|#|$)/i.test(url);
  (isXlsx
    ? loadScript("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js")
        .then(function () { return fetch(url, { cache: "no-store" }); })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
        .then(rowsFromXlsx)
    : fetch(url, { cache: "no-store" })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(parseCSV))
    .then(function (rows) {
      people = rows.map(toPerson).filter(function (p) { return p.name; })
        .sort(function (a, b) { return a.name.localeCompare(b.name); });
      fillDisciplines();
      var params = new URLSearchParams(location.search);
      if (params.get("q")) els.q.value = params.get("q");
      if (params.get("discipline")) els.discipline.value = params.get("discipline");
      render();
    })
    .catch(function () {
      els.stats.textContent = "";
      els.empty.hidden = false;
      els.empty.innerHTML = "<strong>The scholar list couldn’t be loaded.</strong>Check that the data file named in config.js exists. If you opened index.html directly from your computer, view it on GitHub Pages instead, because browsers block local files.";
    });
})();
