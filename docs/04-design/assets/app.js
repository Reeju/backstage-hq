/* BackstageHQ mockup shell. Not product code: it only draws the navigation, the state switcher
   and a few click-through demos so the mockups work from the file system with no server. */
(function () {
  var b = document.body;
  var d = b.dataset;
  var NAV = [
    ['Today', 's05-home.html', 'home', '▣'], ['Inbox', 's06-inbox.html', 'inbox', '✉'],
    ['Leads', 's08-leads.html', 'leads', '☆'], ['Invoices', 's12-invoices.html', 'invoices', '₹'],
    ['Money', 's14-money.html', 'money', '◔'], ['Payments', 's15-payments.html', 'payments', '⇣'],
    ['Tax', 's16-tax.html', 'tax', '§'], ['Approvals', 's17-approvals.html', 'approvals', '✓'],
    ['Add a file or photo', 's28-capture.html', 'capture', '⬆'], ['Activity log', 's20-activity.html', 'activity', '☰']
  ];
  var SET = [
    ['Profile and bank', 's21-settings-profile.html', 'set-profile'], ['Automation', 's22-settings-automation.html', 'set-auto'],
    ['Rate card and terms', 's23-settings-rate-card.html', 'set-rate'], ['Notifications', 's24-settings-notifications.html', 'set-notif'],
    ['Connections', 's25-settings-connections.html', 'set-conn'], ['My data', 's26-settings-data.html', 'set-data'],
    ['Plan and billing', 's27-billing.html', 'set-plan']
  ];
  function esc(s) { return String(s).replace(/</g, '&lt;'); }

  // ---------- mockup bar + states ----------
  var states = (d.states || '').split(',').filter(Boolean);
  var labels = { ready: 'Normal', loading: 'Loading', empty: 'Empty', error: 'Error', upgrade: 'Free plan', partial: 'Partial', paused: 'Paused', locked: 'Locked', wrong: 'Wrong code' };
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

  function setState(s) {
    document.querySelectorAll('[data-state]').forEach(function (el) {
      el.hidden = (el.dataset.state.split(' ').indexOf(s) === -1);
    });
    bar.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.s === s ? 'true' : 'false'); });
    if (history.replaceState) history.replaceState(null, '', '#' + s);
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
    var side = '<nav class="side" aria-label="Main"><div style="font-weight:800;font-size:18px;padding:4px 12px 12px;color:#115E59">BackstageHQ</div>';
    NAV.forEach(function (n) {
      side += '<a class="nav" href="' + n[1] + '"' + (cur === n[2] ? ' aria-current="page"' : '') + '><span aria-hidden="true" style="width:20px;text-align:center">' + n[3] + '</span>' + n[0] + (n[2] === 'approvals' ? ' <span class="badge" style="margin-left:auto">4</span>' : '') + '</a>';
    });
    side += '<div class="grp">Settings</div>';
    SET.forEach(function (n) { side += '<a class="nav" href="' + n[1] + '"' + (cur === n[2] ? ' aria-current="page"' : '') + '>' + n[0] + '</a>'; });
    side += '</nav>';
    var bn = [['Today', 's05-home.html', 'home', '▣'], ['Inbox', 's06-inbox.html', 'inbox', '✉'], ['Leads', 's08-leads.html', 'leads', '☆'], ['Money', 's14-money.html', 'money', '◔']];
    var bot = '<nav class="bnav" aria-label="Main">';
    bn.forEach(function (n) { bot += '<a href="' + n[1] + '"' + (cur === n[2] ? ' aria-current="page"' : '') + '><span aria-hidden="true" style="font-size:20px">' + n[3] + '</span>' + n[0] + '</a>'; });
    bot += '<a href="#" id="moreBtn"' + (/^(set-|approvals|invoices|payments|tax|capture|activity)/.test(cur) ? ' aria-current="page"' : '') + '><span aria-hidden="true" style="font-size:20px">☰</span>More</a></nav>';
    var top = '<header class="topbar">' + (d.back ? '<a class="btn btn-ghost" href="' + d.back + '" aria-label="Back">&larr; Back</a>' : '') + '<h1>' + esc(d.title || '') + '</h1>' +
      '<a class="btn btn-secondary btn-sm" href="s17-approvals.html" aria-label="4 items waiting for your tap">Waiting <span class="badge">4</span></a>' +
      '<span aria-label="Signed in as Arjun Mehta" style="width:36px;height:36px;border-radius:50%;background:#0F766E;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700">AM</span></header>';
    var wrap = document.createElement('div'); wrap.className = 'shell';
    wrap.innerHTML = side + '<div class="col">' + top + '<div class="page" id="slot"></div></div>';
    main.parentNode.insertBefore(wrap, main);
    wrap.querySelector('#slot').appendChild(main);
    b.insertAdjacentHTML('beforeend', bot);

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
        '<button class="fab" id="fab" aria-haspopup="dialog">✨ Ask assistant</button>' +
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
