/* BackstageHQ mockup shell. Not product code: it only draws the navigation, the state switcher
   and a few click-through demos so the mockups work from the file system with no server. */
(function () {
  var b = document.body;
  var d = b.dataset;
  // Line icons (24x24, drawn here so no icon font is needed)
  var ICON = {
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>',
    leads: '<path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9z"/>',
    invoices: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    money: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z"/><circle cx="16.5" cy="14.5" r="1"/>',
    payments: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    tax: '<path d="M19 5L5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    approvals: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    capture: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
    activity: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    more: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    'set-profile': '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    'set-auto': '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    'set-rate': '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    'set-notif': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    'set-conn': '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    'set-data': '<path d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5z"/>',
    'set-plan': '<path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6"/>'
  };
  function ic(k) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + ICON[k] + '</svg>'; }
  // [label, file, key, icon key, section]
  var NAV = [
    ['Today', 's05-home.html', 'home', 'home', 'Workspace'], ['Inbox', 's06-inbox.html', 'inbox', 'inbox', 'Workspace'],
    ['Leads', 's08-leads.html', 'leads', 'leads', 'Workspace'], ['Invoices', 's12-invoices.html', 'invoices', 'invoices', 'Money'],
    ['Money', 's14-money.html', 'money', 'money', 'Money'], ['Payments', 's15-payments.html', 'payments', 'payments', 'Money'],
    ['Tax', 's16-tax.html', 'tax', 'tax', 'Money'], ['Approvals', 's17-approvals.html', 'approvals', 'approvals', 'Review'],
    ['Add a file or photo', 's28-capture.html', 'capture', 'capture', 'Workspace'], ['Activity log', 's20-activity.html', 'activity', 'activity', 'Review']
  ];
  var SECTIONS = ['Workspace', 'Money', 'Review'];
  // Sample inbox rows for the left pane of message detail (same stories as S-06)
  var CONV = [
    ['Aarav Shah &middot; Velvet Bloom Cosmetics', '8:52 am', 'Collab for our winter range', 'Why: asks for 2 Reels and 3 Stories with a budget.', 'Gmail', [['brand', 'Brand pitch'], ['ok', 'Looks real']], 's07-message.html#ready', 'ready error'],
    ['Strideline Collabs Team', '7:31 am', 'Paid campaign brief, please download', 'Why flagged: domain does not match the brand; asks you to download a file.', 'Gmail', [['bad', '&#9888; Likely scam']], 's07-message.html#scam', 'scam'],
    ['Tulsi Organics', 'Yesterday', 'Barter collab: product kit for review', 'Why: small brand writing from a Gmail address; no website link.', 'Gmail', [['brand', 'Brand pitch'], ['warn', 'Check this']], 's07-message.html', ''],
    ['@drift.sneakers', 'Yesterday', '"Hey! Love your reels. Budget 30 to 40k for 1 reel."', 'Why: asks for one Reel with a budget range.', 'Instagram DM', [['brand', 'Brand pitch'], ['warn', 'Check this']], 's07-message.html', ''],
    ['HDFC Bank Alert', '', 'Rs 87,500.00 credited to A/c XX7890', 'Why: bank credit alert. Matched as a proposed payment.', '', [['ok', 'Invoice or payment']], 's07-message.html', ''],
    ['Nuvora Audio &middot; Priya (Marketing)', '', 'Re: Go-live date for your integration', 'Why: reply in an existing deal thread. Attached to the Nuvora deal, no new lead.', '', [['', 'Ongoing deal']], 's07-message.html', '']
  ];
  document.querySelectorAll('[data-convlist]').forEach(function (el) {
    var h = '<h2 class="ctxh">Inbox</h2>';
    CONV.forEach(function (c) {
      h += '<a class="cv" href="' + c[6] + '" data-cur-in="' + c[7] + '"><div class="top"><b>' + c[0] + '</b><span>' + c[1] + '</span></div><div class="subj">' + c[2] + '</div><div class="pv">' + c[3] + '</div><div class="meta">' +
        (c[4] ? '<span class="dot' + (c[4] === 'Gmail' ? '' : ' ig') + '" aria-hidden="true"></span><span>' + c[4] + '</span>' : '') +
        c[5].map(function (x) { return '<span class="chip ' + x[0] + '">' + x[1] + '</span>'; }).join('') + '</div></a>';
    });
    el.innerHTML = h;
  });
  // favicon
  var fav = document.createElement('link'); fav.rel = 'icon'; fav.type = 'image/svg+xml'; fav.href = '../assets/favicon.svg'; document.head.appendChild(fav);
  var SET = [
    ['Profile and bank', 's21-settings-profile.html', 'set-profile'], ['Automation', 's22-settings-automation.html', 'set-auto'],
    ['Rate card and terms', 's23-settings-rate-card.html', 'set-rate'], ['Notifications', 's24-settings-notifications.html', 'set-notif'],
    ['Connections', 's25-settings-connections.html', 'set-conn'], ['My data', 's26-settings-data.html', 'set-data'],
    ['Plan and billing', 's27-billing.html', 'set-plan']
  ];
  function esc(s) { return String(s).replace(/</g, '&lt;'); }

  // ---------- mockup bar + states ----------
  var states = (d.states || '').split(',').filter(Boolean);
  var labels = { results: 'Results', amount: 'Amount', brand: 'Brand', hindi: 'Hindi', none: 'No results', nogmail: 'No Gmail', hint: 'Before typing', ready: 'Normal', loading: 'Loading', empty: 'Empty', error: 'Error', upgrade: 'Free plan', partial: 'Partial', paused: 'Paused', locked: 'Locked', wrong: 'Wrong code' };
  var bar = document.createElement('div');
  bar.className = 'mockbar';
  bar.innerHTML = '<a href="../index.html">&larr; All screens</a><span><b>' + esc(d.id || '') + '</b> ' + esc(d.title || '') + (d.fr ? ' &middot; ' + esc(d.fr) : '') + ' &middot; MVP mockup, sample data</span>';
  if (states.length) {
    var w = document.createElement('div'); w.className = 'states'; w.setAttribute('role', 'group'); w.setAttribute('aria-label', 'Show screen state');
    states.forEach(function (s) {
      var x = document.createElement('button'); x.type = 'button'; x.textContent = labels[s] || s; x.dataset.s = s; w.appendChild(x);
    });
    bar.appendChild(w);
  }
  b.insertBefore(bar, b.firstChild);
  var skip = document.createElement('a'); skip.className = 'skip'; skip.href = '#main'; skip.textContent = 'Skip to content'; b.insertBefore(skip, b.firstChild);

  // Search (S-43): the box shows the sample words of the state on screen. The words are never put in the
  // page address (NFR-048); only the state name is, and only so the mockup bar can switch states.
  function syncQuery() {
    if (d.nav !== 'search') return;
    var q = document.querySelector('[data-q]:not([hidden])');
    document.querySelectorAll('#srchIn,#srchpIn').forEach(function (i) { i.value = q ? q.dataset.q : ''; });
  }
  function setState(s, typing) {
    document.querySelectorAll('[data-state]').forEach(function (el) {
      el.hidden = (el.dataset.state.split(' ').indexOf(s) === -1);
    });
    bar.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.s === s ? 'true' : 'false'); });
    b.dataset.cur = s;
    document.querySelectorAll('[data-cur-in]').forEach(function (el) {
      var on = el.dataset.curIn.split(' ').indexOf(s) > -1;
      el.classList.toggle('sel', on);
      if (on) el.setAttribute('aria-current', 'true'); else el.removeAttribute('aria-current');
    });
    if (history.replaceState) history.replaceState(null, '', '#' + s);
    syncWaiting(s);
    if (!typing) syncQuery();
  }
  // Header pill and sidebar badge: a screen whose state means "nothing is waiting"
  // (data-zero-in="empty" on S-05 and S-17) shows no count. Other screens' Empty states
  // (e.g. an empty Inbox) do not change what is waiting, so they keep the count.
  var curState = '';
  function syncWaiting(s) {
    curState = s;
    var zero = (d.zeroIn || '').split(',').indexOf(s) > -1;
    var pill = document.getElementById('waitPill');
    if (pill) {
      var c = document.getElementById('waitCount'); if (c) c.hidden = zero;
      pill.setAttribute('aria-label', zero ? 'Nothing waiting for you' : '6 items waiting for you: 4 to send, 2 to confirm');
    }
    document.querySelectorAll('.waitbadge').forEach(function (x) { x.hidden = zero; });
    // the Inbox count is not shown on an empty Inbox
    document.querySelectorAll('.inbcnt').forEach(function (x) { x.hidden = (d.nav === 'inbox' && s === 'empty'); });
  }
  if (states.length) {
    bar.addEventListener('click', function (e) { var t = e.target.closest('button[data-s]'); if (t) setState(t.dataset.s); });
    var h = location.hash.replace('#', '');
    setState(states.indexOf(h) > -1 ? h : states[0]);
    window.addEventListener('hashchange', function () { var k = location.hash.replace('#', ''); if (states.indexOf(k) > -1) setState(k); });
  }

  // ---------- shell ----------
  var main = document.querySelector('main');
  main.id = 'main';
  if (d.shell !== 'none') {
    var cur = d.nav || '';
    // desktop top bar: logo, search with "/" hint, workspace name, avatar
    var gbar = '<div class="gbar"><a href="s05-home.html" aria-label="BackstageHQ, go to Today"><img class="logo" src="../assets/logo.svg" alt="BackstageHQ"></a>' +
      '<form class="srch" role="search" id="srch"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
      '<input type="search" id="srchIn" aria-label="Search messages, brands and invoices" placeholder="Search messages, brands or invoices"><kbd aria-hidden="true">/</kbd></form>' +
      '<span class="ws">Arjun Creates</span><span class="av" role="img" aria-label="Signed in as Arjun Mehta">AM</span></div>';
    function navLink(n) {
      return '<a class="nav" href="' + n[1] + '"' + (cur === n[2] ? ' aria-current="page"' : '') + '>' + ic(n[3]) + n[0] +
        (n[2] === 'approvals' ? '<span class="cnt waitbadge">6</span>' : '') + (n[2] === 'inbox' ? '<span class="cnt inbcnt">9</span>' : '') + '</a>';
    }
    var side = '<nav class="side" aria-label="Main">';
    SECTIONS.forEach(function (sec) {
      side += '<div class="grp">' + sec + '</div>';
      NAV.forEach(function (n) { if (n[4] === sec) side += navLink(n); });
    });
    side += '<div class="grp">Settings</div>';
    SET.forEach(function (n) { side += '<a class="nav" href="' + n[1] + '"' + (cur === n[2] ? ' aria-current="page"' : '') + '>' + ic(n[2]) + n[0] + '</a>'; });
    side += '<div class="foot"><b>Arjun Mehta</b><p>Creator workspace &middot; sample data</p><p>9 Nov 2026<br>All actions simulated</p></div></nav>';
    var bn = [['Today', 's05-home.html', 'home', 'home'], ['Inbox', 's06-inbox.html', 'inbox', 'inbox'], ['Leads', 's08-leads.html', 'leads', 'leads'], ['Money', 's14-money.html', 'money', 'money']];
    var bot = '<nav class="bnav" aria-label="Main">';
    bn.forEach(function (n) { bot += '<a href="' + n[1] + '"' + (cur === n[2] ? ' aria-current="page"' : '') + '>' + ic(n[3]) + n[0] + '</a>'; });
    bot += '<a href="#" id="moreBtn"' + (/^(set-|approvals|invoices|payments|tax|capture|activity)/.test(cur) ? ' aria-current="page"' : '') + '>' + ic('more') + 'More</a></nav>';
    var top = '<header class="topbar">' + (d.back ? '<a class="btn btn-ghost" href="' + d.back + '" aria-label="Back">&larr; Back</a>' : '<img class="mark" src="../assets/logo-mark.svg" alt="BackstageHQ">') + '<h1>' + esc(d.title || '') + '</h1>' +
      (d.nav === 'search' ? '' : '<a class="mag" href="s43-search.html#hint" aria-label="Search"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></a>') +
      '<a class="btn btn-secondary btn-sm" id="waitPill" href="s17-approvals.html" aria-label="6 items waiting for you: 4 to send, 2 to confirm">Waiting <span class="badge" id="waitCount">6</span></a>' +
      '<span class="av av-phone" role="img" aria-label="Signed in as Arjun Mehta">AM</span></header>';
    var wrap = document.createElement('div'); wrap.className = 'shell';
    wrap.innerHTML = gbar + '<div class="shell-body">' + side + '<div class="col">' + top + '<div class="page' + (d.wide ? ' wide' : '') + '" id="slot"></div></div></div>';
    main.parentNode.insertBefore(wrap, main);
    wrap.querySelector('#slot').appendChild(main);
    b.insertAdjacentHTML('beforeend', bot);
    syncWaiting(curState);
    // Global search (FR-205). Typing + Enter, or a click in the field, opens S-43; "/" focuses the field.
    // Mockup only: which sample state to show is guessed from the words; the real search runs on the server.
    function guess(q) {
      q = q.trim();
      if (q.length < 2) return 'hint';
      if (/[ऀ-ॿ]/.test(q)) return 'hindi';
      if (/^[₹\d][\d,.\s]*(k|l|lakh)?$/i.test(q)) return 'amount';
      if (/^nuv/i.test(q)) return 'results';
      return 'none';
    }
    var sIn = document.getElementById('srchIn'), pIn = document.getElementById('srchpIn');
    function resultLinks() { return Array.prototype.filter.call(document.querySelectorAll('main a.sr'), function (a) { return a.offsetParent !== null; }); }
    if (d.nav === 'search') {
      syncQuery();
      [sIn, pIn].forEach(function (i) {
        if (!i) return;
        i.addEventListener('input', function () {
          [sIn, pIn].forEach(function (o) { if (o && o !== i) o.value = i.value; });
          setState(guess(i.value), true);
        });
        i.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') { var was = i.value; [sIn, pIn].forEach(function (o) { if (o) o.value = ''; }); setState('hint', true); if (!was) location.href = 's05-home.html'; }
          if (e.key === 'ArrowDown') { var r = resultLinks(); if (r[0]) { e.preventDefault(); r[0].focus(); } }
        });
      });
      document.addEventListener('keydown', function (e) {
        var a = document.activeElement; if (!a || !a.classList.contains('sr')) return;
        var r = resultLinks(), n = r.indexOf(a);
        if (e.key === 'ArrowDown' && r[n + 1]) { e.preventDefault(); r[n + 1].focus(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); if (n > 0) r[n - 1].focus(); else { var f = (sIn && sIn.offsetParent !== null) ? sIn : pIn; if (f) f.focus(); } }
      });
      if (location.hash === '#hint') { var f0 = (sIn && sIn.offsetParent !== null) ? sIn : pIn; if (f0) f0.focus(); }
    } else {
      sIn.addEventListener('click', function () { location.href = 's43-search.html#hint'; });
    }
    document.getElementById('srch').addEventListener('submit', function (e) {
      e.preventDefault();
      if (d.nav === 'search') { var r = resultLinks(); if (r[0]) r[0].focus(); return; }
      location.href = 's43-search.html#' + guess(sIn.value);
    });
    document.addEventListener('keydown', function (e) {
      var t = e.target, typing = t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { var i = document.getElementById('srchIn'); if (i && i.offsetParent !== null) { e.preventDefault(); i.focus(); } }
    });

    // More sheet
    var more = '<div class="modal-bg" id="moreSheet" hidden role="dialog" aria-modal="true" aria-label="More"><div class="modal"><h2 class="h2">More</h2>';
    NAV.slice(3).concat(SET.map(function (s) { return [s[0], s[1]]; })).forEach(function (n) {
      more += '<a class="row" style="text-decoration:none;color:inherit;min-height:48px" href="' + n[1] + '">' + n[0] + '</a>';
    });
    more += '<button class="btn btn-secondary btn-block" style="margin-top:12px" data-close="moreSheet">Close</button></div></div>';
    b.insertAdjacentHTML('beforeend', more);
    document.getElementById('moreBtn').addEventListener('click', function (e) { e.preventDefault(); document.getElementById('moreSheet').hidden = false; });

    // Assistant FAB + short panel (full version is S-18)
    if (d.assistant !== 'off') {
      b.insertAdjacentHTML('beforeend',
        '<button class="fab" id="fab" aria-haspopup="dialog">&#10022; Ask assistant</button>' +
        '<section class="apanel" id="apanel" hidden role="dialog" aria-label="Assistant"><div style="padding:12px 16px;border-bottom:1px solid #DDD6FE;display:flex;align-items:center;gap:8px"><b style="flex:1;color:#6D28D9">Assistant</b><span class="chip ai">Knows: ' + esc(d.title || 'this screen') + '</span><button class="btn btn-ghost" data-close="apanel" aria-label="Close assistant">Close</button></div>' +
        '<div style="flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:10px">' +
        '<div class="bubble me">Who owes me money?</div>' +
        '<div class="bubble bot">You are owed <b>₹2,40,000</b> across 4 invoices (a further ₹40,000 is disputed). Largest: Nuvora Audio ₹1,00,000.<br><a class="src" href="s14-money.html">Source: Money screen</a><div class="muted" style="margin-top:6px">Sample answer. Tap the number to see the invoices.</div></div>' +
        '<div class="bubble bot">Want me to draft reminders for the overdue ones? They will wait in your approval queue. I never send on my own.</div></div>' +
        '<div style="padding:12px;border-top:1px solid #DDD6FE"><a class="btn btn-secondary btn-block" href="s18-assistant.html" style="margin-bottom:8px">Open full assistant screen (S-18)</a><div style="display:flex;gap:8px"><input class="input" aria-label="Message the assistant" placeholder="Ask in English, Hindi or Hinglish"><button class="btn btn-ai">Send</button></div></div></section>');
      document.getElementById('fab').addEventListener('click', function () { document.getElementById('apanel').hidden = false; });
    }
  }

  // ---------- click-through demos ----------
  function toast(msg, undo) {
    var t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status');
    t.innerHTML = '<span>' + esc(msg) + '</span>' + (undo ? '<button type="button">Undo</button>' : '');
    b.appendChild(t);
    if (undo) t.querySelector('button').addEventListener('click', function () { t.remove(); });
    setTimeout(function () { t.remove(); }, 4500);
  }
  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-close]');
    if (c) { var el = document.getElementById(c.dataset.close); if (el) el.hidden = true; e.preventDefault(); }
    var sh = e.target.closest('[data-show]');
    if (sh) { var s = document.querySelector(sh.dataset.show); if (s) s.hidden = false; }
    var hd = e.target.closest('[data-hide]');
    if (hd) { var h2 = document.querySelector(hd.dataset.hide); if (h2) h2.hidden = true; }
    var tg = e.target.closest('[data-toggle]');
    if (tg) { var t2 = document.querySelector(tg.dataset.toggle); if (t2) { t2.hidden = !t2.hidden; tg.setAttribute('aria-expanded', String(!t2.hidden)); } }
    var ts = e.target.closest('[data-toast]');
    if (ts) { toast(ts.dataset.toast, ts.hasAttribute('data-undo')); if (ts.tagName === 'BUTTON' && ts.dataset.disable !== undefined) { ts.disabled = true; } e.preventDefault(); }
    var pr = e.target.closest('[data-pressed]');
    if (pr) { var grp = pr.parentNode.querySelectorAll('[data-pressed]'); grp.forEach(function (g) { g.removeAttribute('aria-current'); g.removeAttribute('aria-selected'); g.setAttribute('aria-selected', g === pr ? 'true' : 'false'); }); }
  });
})();
