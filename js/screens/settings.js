/* Settings: company profile, accounts, plan and credits, team, notifications, privacy and data.
   Sections live at #settings.<section>; #settings is the company profile.
   v4 (Attio): the page bar spans the panel ("Settings" crumbs and the section as the title). Below it a grouped
   settings nav sits beside the section, which is at most 760px wide and made of cards: a header row, then
   label and value rows or switch rows. Variants for the Screens menu end in a state word (for example
   #settings.plan.payment-failed or #settings.plan.out-of-credits), and #settings.accounts.<accountId> opens that
   account's drawer with its daily limits (.raise adds the risk dialog, .above shows a limit above the suggestion).
   Credits are the allowance's unit: 1,000 a month, 1 per new person or comment on a post (Proposed 9 Oct). */
(function () {
  'use strict';
  const OB = window.OB;
  const { esc, icon, ui, fmt } = OB;
  const D = OB.data;

  const SECTIONS = [
    { key: 'profile', label: 'Company profile', icon: 'building' },
    { key: 'team', label: 'Team', icon: 'contacts' },
    { key: 'privacy', label: 'Privacy and data', icon: 'shield' },
    { key: 'accounts', label: 'Accounts', icon: 'link' },
    { key: 'plan', label: 'Plan and credits', icon: 'card' },
    { key: 'notifications', label: 'Notifications', icon: 'bell' },
  ];
  // Shared with teammates, then what is yours alone (each teammate connects and pays for themselves)
  const GROUPS = [
    { id: 'stg-nav-ws', label: 'Workspace', keys: ['profile', 'team', 'privacy'] },
    { id: 'stg-nav-me', label: 'Personal', keys: ['accounts', 'plan', 'notifications'] },
  ];
  const overlayOpen = () => { const ov = document.getElementById('overlay'); return !!(ov && ov.innerHTML); };
  const hashNow = () => location.hash.replace(/^#/, '');
  const prePay = () => !OB.state.sim.subscribed;
  // Variant routes put the plain section back in the address once they have done their job.
  const settle = (key) => { if (hashNow() !== `settings.${key}`) OB.replaceHash(`settings.${key}`); };
  const settleOnClose = (key) => { const at = hashNow(); return () => { if (hashNow() === at) settle(key); }; };

  /* The page: the bar across the panel, the settings nav on the left (a row of links on phones), the section beside it.
     opts: sub (one grey line above the cards), actions, top (notices above everything), view (extra view keys), after */
  function frame(key, body, opts = {}) {
    const s = SECTIONS.find((x) => x.key === key);
    const sim = OB.state.sim;
    const flag = (k) => {
      if (k === 'accounts' && sim.linkedinIssue) return '<span class="dot dot-warn" aria-hidden="true"></span><span class="sr-only">, needs attention</span>';
      if (k === 'plan' && sim.paymentFailed) return '<span class="dot dot-error" aria-hidden="true"></span><span class="sr-only">, payment failed</span>';
      return '';
    };
    const item = (x) => `<li><a href="#settings.${x.key}" ${x.key === key ? 'aria-current="page"' : ''}>${icon(x.icon, 16)}<span>${esc(x.label)}</span>${flag(x.key)}</a></li>`;
    const nav = `<nav class="stg-nav" aria-label="Settings sections"><div class="stg-nav-inner">${GROUPS.map((g) => `<div class="stg-nav-group"><p class="stg-nav-label" id="${g.id}">${esc(g.label)}</p><ul role="list" aria-labelledby="${g.id}">${g.keys.map((k) => item(SECTIONS.find((x) => x.key === k))).join('')}</ul></div>`).join('')}</div></nav>`;
    return Object.assign({
      shell: 'app', nav: 'settings', title: 'Settings',
      html: `${opts.top || ''}${ui.pageHead({ icon: 'settings', crumbs: [{ label: 'Settings', href: '#settings' }], title: esc(s.label), actions: opts.actions })}
        <div class="stg-layout">${nav}<div class="stg-main">${opts.sub ? `<p class="stg-lede">${opts.sub}</p>` : ''}${body}</div></div>`,
      after: () => {
        // On phones the section links scroll sideways: keep the current one in view without moving the page
        const cur = document.querySelector('.stg-nav a[aria-current="page"]');
        const list = cur && cur.closest('.stg-nav-inner');
        if (list && list.scrollWidth > list.clientWidth) { const c = cur.getBoundingClientRect(); const l = list.getBoundingClientRect(); list.scrollLeft += (c.left + c.width / 2) - (l.left + l.width / 2); }
        if (opts.after) opts.after();
      },
    }, opts.view || {});
  }
  OB.action('stg-section', (el, e, v) => OB.go(`settings.${v}`));

  // The notices the app shell would show, drawn here when a page takes over one of them
  function shellNotices({ payment = true, linkedin = true, people = true } = {}) {
    const sim = OB.state.sim; const out = [];
    if (payment && sim.paymentFailed) out.push(ui.notice({ kind: 'error', title: 'Your card was declined, so all sending is paused', body: 'Replies still reach your Inbox. Update your card and sending starts again within a few minutes.', actions: ui.btn({ label: 'Update card', kind: 'secondary', size: 's', href: '#settings.plan' }) }));
    if (linkedin && sim.linkedinIssue) out.push(ui.notice({ kind: 'warn', title: 'LinkedIn signed you out, so LinkedIn steps are paused', body: 'Email and X carry on. Steps waiting on LinkedIn send after you reconnect, within the normal daily limits.', actions: ui.btn({ label: 'Reconnect LinkedIn', size: 's', action: 'reconnect-linkedin' }) }));
    if (people && sim.outOfPeople) out.push(ui.notice({ kind: 'warn', title: 'You have used your 1,000 credits this month', body: 'Follow-ups, replies and bookings carry on. New people and comments start again on 1 Nov, or buy credits to keep going now.', actions: ui.btn({ label: 'Buy credits', size: 's', action: 'buy-credits' }) }));
    return out;
  }

  /* ---------- Shared pieces: Attio's settings cards ---------- */
  // A card with a header row: a 16px icon, the title, and something small on the right
  const card = (id, ic, title, body, end = '', cls = '') => `<section class="card card-flush stg-card${cls ? ` ${cls}` : ''}" aria-labelledby="${id}"><div class="card-head">${icon(ic, 16)}<h2 id="${id}">${esc(title)}</h2>${end ? `<span class="stg-head-end">${end}</span>` : ''}</div>${body}</section>`;
  // Label and value rows; the third cell holds a small action
  const rows = (items) => `<dl class="stg-rows">${items.filter(Boolean).join('')}</dl>`;
  const line = (label, value, act = '', cls = '') => `<div class="stg-row${cls ? ` ${cls}` : ''}"><dt>${esc(label)}</dt><dd>${value}</dd>${act ? `<dd class="stg-row-act">${act}</dd>` : ''}</div>`;
  const swRow = (id, label, desc, control) => `<div class="stg-sw"><div class="stg-sw-text"><label class="t-medium" for="${id}">${esc(label)}</label><span id="${id}-d">${esc(desc)}</span></div>${control}</div>`;
  const pad = (html, cls = '') => `<div class="stg-pad${cls ? ` ${cls}` : ''}">${html}</div>`;
  // Attio's record view for an account: tile, name and one grey line, then an attribute list
  const recordHead = (tile, title, sub) => `<div class="drawer-head stg-head">${tile}<div class="stg-head-text"><h2>${title}</h2>${sub ? `<p class="t-small t-2">${sub}</p>` : ''}</div>${ui.iconBtn({ icon: 'x', label: 'Close', action: 'close-overlay', extra: 'autofocus' })}</div>`;
  const attrList = (items) => `<dl class="stg-attrs">${items.filter(Boolean).map(([ic, name, value]) => `<div class="stg-attr"><dt>${ic}<span>${esc(name)}</span></dt><dd>${value}</dd></div>`).join('')}</dl>`;

  /* ---------- Company profile: edits collect in a draft until "Save changes" ---------- */
  const PFIELDS = ['sell', 'industries', 'regions', 'examples', 'titles', 'never', 'reasons', 'proof', 'offer', 'voice', 'extra', 'privateNotes', 'address'];
  const copy = (o) => JSON.parse(JSON.stringify(o));
  const saved = () => copy(Object.fromEntries(PFIELDS.map((k) => [k, D.profile[k]])));
  const draft = () => (OB.state.ui.stgDraft = OB.state.ui.stgDraft || saved());
  const P = () => OB.state.ui.stgDraft || D.profile;
  const isDirty = () => !!OB.state.ui.stgDraft && JSON.stringify(OB.state.ui.stgDraft) !== JSON.stringify(saved());
  const matchCount = (d) => Math.max(120, D.profile.matches + (d.industries.length - D.profile.industries.length) * 310 + (d.regions.length - D.profile.regions.length) * 140 - (d.never.length - D.profile.never.length) * 35);
  const dateWords = (s) => (OB.d(s).getFullYear() === 2026 ? fmt.short(s) : fmt.long(s));
  const CHIPS = {
    industries: { label: 'Who you sell to', add: 'Add a kind of company', field: 'Kind of company', ph: 'For example, Neobanks' },
    regions: { label: 'Where they are', add: 'Add a region', field: 'Region', ph: 'For example, Canada' },
    examples: { label: 'Companies like these', add: 'Add a company', field: 'Company', ph: 'For example, Ledgerly' },
    titles: { label: 'Who to contact', add: 'Add a job title', field: 'Job title', ph: 'For example, VP Marketing' },
    never: { label: 'Never these kinds of companies', add: 'Add a kind of company', field: 'Kind of company', ph: 'For example, Crypto casinos' },
    reasons: { label: 'Reasons to reach out', add: 'Add a reason', field: 'Reason', ph: 'For example, Applied for a licence' },
  };

  function chipGroup(key, hint) {
    const m = CHIPS[key]; const items = P()[key];
    return `<div class="stg-chipgroup"><span class="label" id="stg-cl-${key}">${esc(m.label)}</span>${hint ? `<span class="hint">${hint}</span>` : ''}
      <ul class="stg-chips" role="list" aria-labelledby="stg-cl-${key}">
        ${items.map((t, i) => `<li class="stg-chip">${m.ordered ? `<span class="stg-chip-n num" aria-hidden="true">${i + 1}</span>` : ''}<span>${esc(t)}</span><button type="button" class="stg-chip-x" aria-label="Remove ${esc(t)}" data-action="stg-chip-remove" data-arg="${key}.${i}">${icon('x', 12)}</button></li>`).join('')}
        <li><button type="button" class="stg-chip-add" data-action="stg-chip-add" data-arg="${key}">${icon('plus', 14)}<span>${esc(m.add)}</span></button></li>
      </ul></div>`;
  }
  function textArea(key, label, hint, rowsN) {
    return `<div class="field"><label class="label" for="stg-f-${key}">${esc(label)}</label>${hint ? `<span class="hint" id="stg-f-${key}-hint">${hint}</span>` : ''}<textarea class="textarea" id="stg-f-${key}" rows="${rowsN}" ${hint ? `aria-describedby="stg-f-${key}-hint"` : ''} data-input="stg-field" data-key="${key}">${esc(P()[key])}</textarea></div>`;
  }

  function proofList() {
    const list = P().proof;
    return `<ul class="stg-proofs" role="list">${list.map((p) => {
      const check = p.stale && !p.confirmed;
      const meta = check ? `${p.segment}. From ${p.source}.` : `${p.segment}. ${p.source === 'Added by you' ? 'Added by you' : `From ${p.source}`}, ${dateWords(p.found)}.${p.confirmed ? ' Confirmed by you.' : ''}`;
      return `<li class="stg-proof">
        <div class="stg-proof-main">
          <p class="stg-proof-who"><span class="t-medium">${esc(p.client)}</span><span class="t-small t-2">${p.named ? 'Named' : 'Described'}</span>${check ? ui.tag('blue', 'Needs checking') : ''}</p>
          <p>"${esc(p.result)}"</p>
          <p class="t-small t-2">${esc(meta)}</p>
          ${check ? `<p class="t-small">${esc(`Read from your website, ${fmt.long(p.found)}. It is over a year old, so messages won't use it until you confirm it's still true.`)}</p><div class="stg-proof-confirm">${ui.btn({ label: "Confirm it's still true", size: 's', icon: 'check', action: 'stg-proof-confirm', arg: p.id })}</div>` : ''}
        </div>
        ${ui.btn({ label: 'Edit', size: 's', kind: 'ghost', action: 'stg-proof-edit', arg: p.id, ariaLabel: `Edit proof point from ${p.client}` })}
      </li>`;
    }).join('')}</ul>`;
  }

  function profileBody() {
    const d = P();
    /* The seven parts every profile has, in the same order as setup (spec section 4): what you sell, who you sell to,
       where they are, companies like these, who to contact, then proof points and your offer */
    const who = card('stg-g-who', 'target', 'Your profile', pad(`
      <p class="stg-card-lede">Decides which companies go on your lists and who Onbook contacts there.</p>
      ${textArea('sell', 'What you sell', 'One sentence. Used to find companies that need it, and in every message.', 2)}
      ${chipGroup('industries')}
      ${chipGroup('regions')}
      ${chipGroup('examples', 'Onbook looks for more companies like these.')}
      ${chipGroup('titles', 'At each company, Onbook finds the people who best match these roles.')}`, 'stg-fields')
      + '<p class="stg-card-foot">Onbook builds each list from these, best fit and freshest news first, and keeps finding more like them.</p>');
    const proof = card('stg-g-proof', 'zap', 'Proof points', `<p class="stg-card-lede stg-pad-x">Quoted word for word, with numbers and time window unchanged. Name the client or describe them.</p>${proofList()}`,
      ui.btn({ label: 'Add a proof point', icon: 'plus', size: 's', kind: 'ghost', action: 'stg-proof-edit', arg: 'new' }));
    const messages = card('stg-g-msg', 'message', 'Your offer and voice', pad(`
      ${textArea('offer', 'Your offer', 'One sentence: what you give the people Onbook contacts for saying yes. Offer something useful, like a free workshop or a podcast guest spot, not a sales call.', 2)}
      ${textArea('voice', 'How you sound', 'Every message is written and checked against this.', 2)}`, 'stg-fields'));
    const rules = card('stg-g-rules', 'filter', 'Targeting rules', pad(`
      ${chipGroup('reasons', 'The news Onbook looks for. Fresher news ranks a company higher.')}
      ${chipGroup('never', 'Left out of every list. To block one company or person, use <a href="#contacts.never">Never contact</a>.')}`, 'stg-fields'));
    const other = card('stg-g-other', 'lock', 'Other details', pad(`
      <p class="stg-card-lede">Never quoted in a message.</p>
      ${textArea('extra', 'Anything else', 'Shapes who Onbook looks for.', 3)}
      ${textArea('privateNotes', 'Private pricing notes', 'Never used in messages or targeting. Only your team sees this.', 2)}
      <div class="field"><label class="label" for="stg-f-address">Business address</label><span class="hint" id="stg-f-address-hint">Every email ends with this address and a plain opt-out line.</span><input class="input" id="stg-f-address" value="${esc(d.address)}" aria-describedby="stg-f-address-hint" data-input="stg-field" data-key="address" autocomplete="off"></div>`, 'stg-fields'));
    const bar = isDirty() ? `<div class="stg-savebar" role="region" aria-label="Unsaved changes">
        <p class="t-small"><strong class="t-medium">You have unsaved changes.</strong> <span class="t-2">They apply to messages written from tomorrow.</span></p>
        <div class="row gap-2">${ui.btn({ label: 'Discard', kind: 'ghost', size: 's', action: 'stg-discard' })}${ui.btn({ label: 'Save changes', kind: 'primary', size: 's', action: 'stg-save' })}</div>
      </div>` : '';
    return `${who}${proof}${messages}${rules}${other}${bar}`;
  }

  OB.action('stg-field', (el, e, v) => {
    draft()[el.dataset.key] = v;
    const dirty = isDirty();
    if (dirty !== !!OB.state.ui.stgShowBar) { OB.state.ui.stgShowBar = dirty; OB.render({ keepScroll: true }); }
  });
  const afterEdit = (focusSel) => {
    OB.state.ui.stgShowBar = isDirty();
    OB.render({ keepScroll: true });
    const f = focusSel && document.querySelector(focusSel);
    if (f) f.focus();
  };
  OB.action('stg-chip-remove', (el, e, arg) => {
    const [key, i] = arg.split('.');
    draft()[key].splice(Number(i), 1);
    afterEdit(`[data-action="stg-chip-remove"][data-arg="${key}.${i}"]`);
    if (!document.activeElement || document.activeElement === document.body) { const add = document.querySelector(`[data-action="stg-chip-add"][data-arg="${key}"]`); if (add) add.focus(); }
  });
  OB.action('stg-chip-add', (el, e, key) => {
    const m = CHIPS[key];
    OB.dialog(`${OB.dialogHead(m.add)}
      <form class="stack gap-5" data-submit="stg-chip-save" data-key="${key}" novalidate>
        ${ui.field({ id: 'stg-chip-v', label: m.field, placeholder: m.ph, extra: 'autocomplete="off"' })}
        <p class="field-error" id="stg-chip-err" role="alert" hidden>${icon('alert', 16)}Type something to add, or cancel.</p>
        <div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${ui.btn({ label: 'Add', kind: 'primary', type: 'submit' })}</div>
      </form>`, { label: m.add });
  });
  OB.action('stg-chip-save', (f) => {
    const key = f.dataset.key; const input = document.getElementById('stg-chip-v'); const v = input.value.trim();
    if (!v) { f.querySelector('#stg-chip-err').hidden = false; input.setAttribute('aria-invalid', 'true'); input.focus(); return; }
    const list = draft()[key];
    if (!list.some((x) => x.toLowerCase() === v.toLowerCase())) list.push(v);
    OB.closeOverlays(true);
    afterEdit(`[data-action="stg-chip-add"][data-arg="${key}"]`);
  });
  OB.action('stg-save', () => {
    const d = OB.state.ui.stgDraft; if (!d) return;
    const matches = matchCount(d);
    Object.assign(D.profile, copy(d), { matches });
    OB.state.ui.stgDraft = null; OB.state.ui.stgShowBar = false;
    OB.render({ keepScroll: true });
    OB.toast('Changes saved. Messages written from tomorrow use them.');
  });
  OB.action('stg-discard', () => {
    OB.state.ui.stgDraft = null; OB.state.ui.stgShowBar = false;
    OB.render({ keepScroll: true });
    OB.toast('Changes discarded');
  });
  OB.action('stg-proof-confirm', (el, e, id) => {
    [D.profile.proof, OB.state.ui.stgDraft && OB.state.ui.stgDraft.proof].forEach((list) => { const p = list && list.find((x) => x.id === id); if (p) { p.confirmed = true; p.stale = false; p.found = '2026-10-07'; } });
    afterEdit();
    OB.toast('Proof point confirmed. Messages can use it from tomorrow.');
  });

  function proofDialog(id, err) {
    const d = draft();
    const p = id === 'new' ? { id: 'new', client: '', named: true, result: '', segment: d.industries[0] || '' } : d.proof.find((x) => x.id === id);
    const named = OB.ui$('stgPfNamed', p.named);
    const segs = d.industries.includes(p.segment) || !p.segment ? d.industries : d.industries.concat(p.segment);
    return `${OB.dialogHead(id === 'new' ? 'Add a proof point' : 'Edit proof point', 'A real result you can quote. It is used word for word, once per person at most.')}
      <form class="stack gap-5" data-submit="stg-proof-save" data-proof="${esc(id)}" novalidate>
        <fieldset class="stg-fieldset"><legend class="label">How to show the client</legend>
          <div class="stack gap-2">
            <label class="check"><input type="radio" name="stg-named" value="1" ${named ? 'checked' : ''} data-change="stg-pf-named"><span>Name them <span class="t-2 t-small">For example, Ledgerly</span></span></label>
            <label class="check"><input type="radio" name="stg-named" value="0" ${named ? '' : 'checked'} data-change="stg-pf-named"><span>Describe them <span class="t-2 t-small">For example, a top-10 perp DEX</span></span></label>
          </div>
        </fieldset>
        ${ui.field({ id: 'stg-pf-client', label: named ? 'Client name' : 'How to describe the client', value: OB.ui$('stgPfClient', p.client), error: err && err.client, extra: 'autocomplete="off"' })}
        ${ui.field({ id: 'stg-pf-result', label: 'Result', hint: 'Include the number and the time window, such as "in 90 days".', value: OB.ui$('stgPfResult', p.result), error: err && err.result, textarea: true, rows: 2 })}
        <div class="field"><label class="label" for="stg-pf-seg">Closest segment</label><select class="select" id="stg-pf-seg">${segs.map((s) => `<option ${s === p.segment ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></div>
        <div class="dialog-actions">${id === 'new' ? '' : ui.btn({ label: 'Remove', kind: 'danger', action: 'stg-proof-remove', arg: id, cls: 'stg-push' })}${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${ui.btn({ label: 'Save proof point', kind: 'primary', type: 'submit' })}</div>
      </form>`;
  }
  OB.action('stg-proof-edit', (el, e, id) => {
    delete OB.state.ui.stgPfNamed; delete OB.state.ui.stgPfClient; delete OB.state.ui.stgPfResult;
    OB.dialog(proofDialog(id), { label: id === 'new' ? 'Add a proof point' : 'Edit proof point' });
  });
  OB.action('stg-pf-named', (el, e, v) => {
    const box = document.querySelector('#overlay .dialog'); if (!box) return;
    const form = box.querySelector('form');
    OB.state.ui.stgPfNamed = v === '1';
    OB.state.ui.stgPfClient = document.getElementById('stg-pf-client').value;
    OB.state.ui.stgPfResult = document.getElementById('stg-pf-result').value;
    box.innerHTML = proofDialog(form.dataset.proof);
    const r = box.querySelector(`input[name="stg-named"][value="${v}"]`); if (r) r.focus();
  });
  OB.action('stg-proof-save', (f) => {
    const id = f.dataset.proof;
    const client = document.getElementById('stg-pf-client').value.trim();
    const result = document.getElementById('stg-pf-result').value.trim();
    const named = f.querySelector('input[name="stg-named"]:checked').value === '1';
    const segment = document.getElementById('stg-pf-seg').value;
    if (!client || !result) {
      OB.state.ui.stgPfClient = client; OB.state.ui.stgPfResult = result; OB.state.ui.stgPfNamed = named;
      const box = document.querySelector('#overlay .dialog');
      box.innerHTML = proofDialog(id, { client: client ? '' : 'Add the client, named or described.', result: result ? '' : 'Add the result, with its number and time window.' });
      const bad = box.querySelector('[aria-invalid="true"]'); if (bad) bad.focus();
      return;
    }
    const d = draft();
    if (id === 'new') d.proof.push({ id: `p${Date.now()}`, client, named, result, segment, source: 'Added by you', found: '2026-10-07', confirmed: true });
    else Object.assign(d.proof.find((x) => x.id === id), { client, named, result, segment });
    OB.closeOverlays(true);
    afterEdit('[data-action="stg-save"]');
  });
  OB.action('stg-proof-remove', (el, e, id) => {
    const d = draft(); d.proof = d.proof.filter((x) => x.id !== id);
    OB.closeOverlays(true);
    afterEdit('[data-action="stg-save"]');
  });

  /* ---------- Accounts: Attio's integrations list; a row opens the account, with its daily limits ---------- */
  /* Daily limits per account (spec, section 6): n is new people (invites on LinkedIn), s is everything sent,
     follow-ups included. Onbook suggests safe; you can go lower, or up to max after a risk dialog.
     An account keeps its own choice in stgLimit (n) and stgSends (s); neither is set at the suggestion. */
  const LIM = {
    email: {
      n: { safe: 15, max: 30, opts: [5, 8, 10, 12, 15, 20, 25, 30], label: 'New people a day', unit: 'new people' },
      s: { safe: 40, max: 60, opts: [20, 30, 40, 50, 60], label: 'Emails a day', unit: 'emails', hint: 'Follow-ups included' },
    },
    linkedin: {
      n: { safe: 15, max: 25, opts: [5, 8, 10, 12, 15, 20, 25], label: 'Invites a day', unit: 'invites' },
      s: { safe: 40, max: 60, opts: [20, 30, 40, 50, 60], label: 'Messages a day', unit: 'messages', hint: 'Follow-ups and comments included' },
    },
    x: {
      n: { safe: 10, max: 20, opts: [3, 5, 8, 10, 15, 20], label: 'New people a day', unit: 'new people' },
      s: { safe: 20, max: 40, opts: [10, 15, 20, 30, 40], label: 'DMs a day', unit: 'DMs', hint: 'Follow-ups and comments included' },
    },
  };
  const PROVIDER_MARK = { email: 'google', linkedin: 'linkedin', x: 'x', calendar: 'google' };
  const KIND = { email: 'Email', linkedin: 'LinkedIn', x: 'X', calendar: 'Calendar' };
  const limitOf = (a) => a.stgLimit || (LIM[a.ch] ? LIM[a.ch].n.safe : 0);
  const sendsOf = (a) => a.stgSends || (LIM[a.ch] ? LIM[a.ch].s.safe : 0);
  const valueOf = (a, k) => (k === 'n' ? limitOf(a) : sendsOf(a));
  const isAbove = (a) => !!LIM[a.ch] && (limitOf(a) > LIM[a.ch].n.safe || sendsOf(a) > LIM[a.ch].s.safe);
  const THIS = { email: 'this inbox', linkedin: 'this account', x: 'this account' };
  const PROVIDER_LINE = {
    email: (a) => `Email, ${a.provider}`,
    linkedin: (a) => a.provider.replace(', connected through', ', through'),
    x: (a) => `X, through ${a.provider}`,
    calendar: (a) => `Calendar for bookings, ${a.provider}`,
  };
  const PROVIDER_SHORT = {
    email: (a) => a.provider,
    linkedin: (a) => a.provider.split(',')[0],
    x: (a) => `X, ${a.provider}`,
    calendar: (a) => a.provider,
  };
  // Status as a soft tag; text is the long form for the drawer
  function health(a) {
    const sim = OB.state.sim;
    if (a.stgOff) return { kind: 'outline', short: 'Disconnected', text: 'Disconnected' };
    if (sim.paymentFailed && a.ch !== 'calendar') return { kind: 'red', short: 'Paused', text: 'Paused: payment failed', cls: 't-error' };
    if (a.ch === 'linkedin' && sim.linkedinIssue) return { kind: 'amber', short: 'Signed out', text: 'Signed out', cls: 't-warn' };
    if (a.status === 'warming') return { kind: 'grey', short: 'Warming up', text: `Warming up, day ${a.rampDay} of ${a.rampDays}` };
    return { kind: 'green', short: a.ch === 'calendar' ? 'Connected' : 'Healthy', text: a.ch === 'calendar' ? 'Connected' : 'Healthy' };
  }
  const healthTag = (a) => { const h = health(a); return ui.tag(h.kind, h.short); };
  function usageWords(a) {
    if (a.ch === 'email') return `${a.sentToday} of ${sendsOf(a)} sent today`;
    if (a.ch === 'linkedin') return `${a.newToday} of ${limitOf(a)} invites today`;
    if (a.ch === 'x') return `${a.newToday} of ${Math.min(a.newPerDay, limitOf(a))} today`;
    return D.profile.booking;
  }
  function perDay() {
    const on = (ch) => D.accounts.find((a) => a.ch === ch && !a.stgOff);
    const e = on('email'); const l = on('linkedin'); const x = on('x');
    if (e && l) return Math.min(limitOf(e), limitOf(l));
    if (e || l) return limitOf(e || l);
    return x ? Math.min(limitOf(x), x.newPerDay || limitOf(x)) : 0;
  }
  const DISCONNECT = {
    email: 'Email steps stop in every campaign. People whose next step is an email skip it and carry on with LinkedIn and X. Replies already in your Inbox stay.',
    linkedin: 'LinkedIn invites and messages stop in every campaign. LinkedIn steps are skipped and flows carry on by email and X. Conversations already in your Inbox stay.',
    x: 'X DMs stop in every campaign. X steps are skipped and flows carry on by email and LinkedIn. You can remove Onbook for Chrome afterwards.',
    calendar: 'Bookings are no longer matched for you, and new messages leave out your booking link. Onbook asks for a time by reply instead.',
  };
  const SIGNED_OUT = 'LinkedIn signed you out on Wed 7 Oct, so LinkedIn steps are paused. Email and X carry on, and steps waiting on LinkedIn send after you reconnect, within the normal limits.';
  const tile = (a, size = 18) => `<span class="stg-tile" aria-hidden="true">${OB.mark(PROVIDER_MARK[a.ch], size)}</span>`;

  function accountRow(a) {
    const h = health(a);
    const signedOut = a.ch === 'linkedin' && OB.state.sim.linkedinIssue && !a.stgOff;
    const inline = a.stgOff
      ? ui.btn({ label: 'Connect again', size: 's', action: 'stg-reconnect-off', arg: a.id })
      : signedOut ? ui.btn({ label: 'Reconnect', size: 's', action: 'reconnect-linkedin', ariaLabel: 'Reconnect LinkedIn' }) : '';
    const note = a.stgOff ? `Not sending. ${DISCONNECT[a.ch]}` : signedOut ? SIGNED_OUT : '';
    const detail = [PROVIDER_SHORT[a.ch](a), a.stgOff ? '' : usageWords(a), a.status === 'warming' && !a.stgOff ? `day ${a.rampDay} of ${a.rampDays}` : '', !a.stgOff && isAbove(a) ? 'above the suggested limit' : ''].filter(Boolean).join(' \u00b7 ');
    return `<li class="stg-int${note ? ' has-note' : ''}">
      ${tile(a)}
      <button type="button" class="stg-int-open" data-action="stg-acc-open" data-arg="${esc(a.id)}"><span class="stg-int-top"><span class="stg-int-name">${esc(a.name)}</span>${ui.tag(h.kind, h.short)}</span><span class="stg-int-detail">${esc(detail)}</span><span class="sr-only">. Open details and daily limit</span></button>
      <span class="stg-int-end">${inline || icon('chevron-right', 16)}</span>
      ${note ? `<p class="stg-int-note">${esc(note)}</p>` : ''}
    </li>`;
  }
  function accountsBody() {
    const sending = D.accounts.filter((a) => a.ch !== 'calendar');
    const bookings = D.accounts.filter((a) => a.ch === 'calendar');
    return card('stg-acc-send', 'send', 'Sending', `<ul class="stg-ints" role="list">${sending.map(accountRow).join('')}</ul>`, '<span class="t-small t-2">Your own inbox, LinkedIn and X</span>')
      + (bookings.length ? card('stg-acc-book', 'calendar', 'Bookings', `<ul class="stg-ints" role="list">${bookings.map(accountRow).join('')}</ul>`, '<span class="t-small t-2">A booking stops the company</span>') : '');
  }
  /* Daily limits in the drawer: Onbook's suggestion said once, then one choice per limit. New people never go
     above everything sent, and the other way round. Above the suggestion, a quiet note with a way back. */
  function limitSelect(a, k) {
    const m = LIM[a.ch][k];
    const cur = valueOf(a, k);
    const other = valueOf(a, k === 'n' ? 's' : 'n');
    const opts = m.opts.filter((v) => v === cur || (k === 'n' ? v <= other : v >= other));
    const word = (v) => (v === m.safe ? `${v}, suggested` : v === m.max ? `${v}, the most allowed` : String(v));
    const id = `stg-lim-${a.id}-${k}`;
    return `<div class="stg-lim">
      <label class="stg-lim-label" for="${id}"><span>${esc(m.label)}</span>${m.hint ? `<span class="stg-lim-hint">${esc(m.hint)}</span>` : ''}</label>
      <select class="select" id="${id}" aria-describedby="stg-lims-${esc(a.id)}-d" data-change="stg-limit" data-acc="${esc(a.id)}" data-kind="${k}">${opts.map((v) => `<option value="${v}"${v === cur ? ' selected' : ''}>${esc(word(v))}</option>`).join('')}</select>
    </div>`;
  }
  function limitsBlock(a) {
    const L = LIM[a.ch];
    const warm = a.status === 'warming' ? ` During warm-up it sends fewer, building up to your limit by day ${a.rampDays}.` : '';
    const over = isAbove(a)
      ? `<div class="stg-above">${icon('alert', 16)}<p><span class="t-medium t-ink">Above the suggested limit.</span> ${esc(`The risk to this account sits with you, and Onbook still pauses ${KIND[a.ch]} at the first warning.`)}</p><button type="button" class="link-btn" data-action="stg-limit-reset" data-arg="${esc(a.id)}">Reset to suggested</button></div>`
      : '';
    return `<section class="stg-lims" aria-labelledby="stg-lims-${esc(a.id)}-h">
      <div class="stg-lims-text">
        <h3 class="stg-lims-h" id="stg-lims-${esc(a.id)}-h">Daily limits</h3>
        <p class="stg-lims-d" id="stg-lims-${esc(a.id)}-d">${esc(`Onbook suggests ${L.n.safe} ${L.n.unit} and ${L.s.safe} ${L.s.unit} a day for ${THIS[a.ch]}. Go lower any time, or up to ${L.n.max} and ${L.s.max} at your own risk.${warm}`)}</p>
      </div>
      <div class="stg-lim-rows">${limitSelect(a, 'n')}${limitSelect(a, 's')}</div>
      ${over}
    </section>`;
  }

  function accountDrawer(a) {
    const h = health(a); const sim = OB.state.sim;
    const signedOut = a.ch === 'linkedin' && sim.linkedinIssue && !a.stgOff;
    const facts = [[icon('flag', 14), 'Status', `${ui.tag(h.kind, h.short)}${a.stgOff ? '' : ` <span class="t-2">${esc(usageWords(a))}</span>`}`]];
    if (!a.stgOff) {
      if (a.ch === 'email') {
        facts.push([icon('shield', 14), 'Domain checks', `<span class="stg-checks">${['SPF', 'DKIM', 'DMARC', 'Blocklists'].map((k) => `<span>${icon('check', 14)}${k}</span>`).join('')}</span>`]);
        facts.push([icon('send', 14), 'Sent today', `<span class="num">${a.sentToday} of ${sendsOf(a)}</span> <span class="t-2">emails, follow-ups included</span>`]);
      } else if (a.ch === 'linkedin') {
        facts.push([icon('user', 14), 'Account', 'Premium, so invites can carry a note of up to 300 characters']);
        facts.push([icon('send', 14), 'Invites this week', `<span class="num">${a.weekInvites} of ${limitOf(a) * 5}</span>`]);
        facts.push([icon('check', 14), 'Acceptance', `<span class="num">${a.acceptance}%</span> <span class="t-2">of recent invites. Onbook slows down by itself if it drops under 20%.</span>`]);
      } else if (a.ch === 'x') {
        const pace = a.newPerDay < limitOf(a) ? `<span class="num">${a.newPerDay}</span> new people a day now, rising to ${limitOf(a)} by day ${a.rampDays}.` : `At your limit of <span class="num">${limitOf(a)}</span> new people a day.`;
        facts.push([icon('clock', 14), 'Warm-up', `<span class="stg-warm"><span>Day ${a.rampDay} of ${a.rampDays}. ${pace}</span>${ui.meter(a.rampDay, a.rampDays, { label: 'X warm-up progress', warnAt: 2 })}</span>`]);
      } else {
        facts.push([icon('link', 14), 'Booking link', `${esc(D.profile.booking)}<span class="stg-dd-sub">Sent once per person, never in the first message. A booking stops the company and lands in your Inbox.</span>`]);
      }
    }
    facts.push([icon('calendar', 14), 'Connected', esc(fmt.day(a.since))]);
    const limit = LIM[a.ch] && !a.stgOff ? limitsBlock(a) : '';
    const risk = (a.ch === 'linkedin' || a.ch === 'x') && !a.stgOff ? `<p class="stg-risk">${icon('shield', 16)}<span>${esc(`Account risk acknowledged on ${fmt.short(a.since)}. Automating ${KIND[a.ch]} can break its terms and put the account at risk; the suggested limits lower that risk.`)}</span></p>` : '';
    const callout = signedOut ? SIGNED_OUT : a.stgOff ? `Not sending. ${DISCONNECT[a.ch]}` : sim.paymentFailed && a.ch !== 'calendar' ? 'Your card was declined, so nothing sends from this account until it is updated. Replies still reach your Inbox.' : '';
    const foot = a.stgOff
      ? `<div class="drawer-foot">${ui.btn({ label: `Connect ${KIND[a.ch] === 'Email' ? 'this inbox' : KIND[a.ch]} again`, kind: 'primary', action: 'stg-reconnect-off', arg: a.id })}</div>`
      : `<div class="drawer-foot stg-foot">${ui.btn({ label: 'Disconnect', kind: 'ghost', cls: 'stg-danger-text', action: 'stg-disconnect', arg: a.id, ariaLabel: `Disconnect ${a.name}` })}${signedOut ? ui.btn({ label: 'Reconnect LinkedIn', kind: 'primary', action: 'reconnect-linkedin' }) : ui.btn({ label: 'Reconnect', icon: 'refresh', action: 'stg-reconnect', arg: a.id, ariaLabel: `Reconnect ${a.name}` })}</div>`;
    return `${recordHead(tile(a, 20), esc(a.name), esc(PROVIDER_LINE[a.ch](a)))}
      <div class="drawer-body stg-dbody">
        ${callout ? `<div class="stg-block"><div class="stg-callout ${signedOut ? 'is-warn' : ''}">${icon(signedOut || (sim.paymentFailed && !a.stgOff) ? 'alert' : 'info', 16)}<p>${esc(callout)}</p></div></div>` : ''}
        <div class="stg-block">${attrList(facts)}</div>
        ${limit || risk ? `<div class="stg-block stack gap-4">${limit}${risk}</div>` : ''}
      </div>${foot}`;
  }
  // The drawer's own onClose, kept so it can open again under the risk dialog with the same behaviour
  let accClose = null;
  const onAccounts = () => { const h = OB.parseHash(); return h.name === 'settings' && h.params[0] === 'accounts'; };
  const openAccount = (id, onClose, focusId) => {
    const a = OB.get.account(id); if (!a) return;
    accClose = onClose || null;
    OB.drawer(accountDrawer(a), { label: `Account: ${a.name}`, onClose: accClose });
    // Runs after the drawer's own first focus, so the limit you were changing keeps it
    if (focusId) requestAnimationFrame(() => { const el = document.getElementById(focusId); if (el) el.focus(); });
  };
  // Draw the open drawer again after a change, keeping its scroll and the control you used
  function redrawAccount(a, focusId) {
    const box = document.querySelector('#overlay .drawer');
    if (!box) return;
    const old = box.querySelector('.drawer-body');
    const y = old ? old.scrollTop : 0;
    box.innerHTML = accountDrawer(a);
    const body = box.querySelector('.drawer-body');
    if (body) body.scrollTop = y;
    const el = focusId && document.getElementById(focusId);
    if (el) el.focus();
  }
  function setLimit(a, k, v) {
    const key = k === 'n' ? 'stgLimit' : 'stgSends';
    if (v === LIM[a.ch][k].safe) delete a[key]; else a[key] = v;
  }
  // Redraw the page behind the drawer; closing the drawer still returns focus to this account's row
  function renderBehind(a) {
    OB.render({ keepScroll: true });
    if (OB._lastFocus && document.contains(OB._lastFocus)) return;
    const row = document.querySelector(`.stg-int-open[data-arg="${a.id}"]`);
    if (row) OB._lastFocus = row;
  }
  OB.action('stg-acc-open', (el, e, id) => openAccount(id));
  OB.action('stg-limit', (el, e, v) => {
    const a = OB.get.account(el.dataset.acc); const k = el.dataset.kind;
    if (!a || !LIM[a.ch] || !LIM[a.ch][k]) return;
    const m = LIM[a.ch][k]; const n = Number(v);
    // Going above the suggestion, or further above it, asks first; lower applies at once
    if (n > m.safe && n > valueOf(a, k)) { raiseDialog(a, k, n); return; }
    setLimit(a, k, n);
    redrawAccount(a, el.id);
    renderBehind(a);
    OB.toast(`${m.label} set to ${n} for ${a.name}`);
  });

  /* Raising a limit above Onbook's suggestion: what changes, whose risk it is, and what Onbook still does.
     The dialog sits where the drawer was; closing it either way brings the drawer back. */
  const RISK = {
    email: { why: 'More email from one inbox makes spam folders and blocklists more likely, for this inbox and your domain.', warn: 'a spam complaint or a run of bounced emails' },
    linkedin: { why: 'LinkedIn can restrict or ban accounts that send more than people usually do.', warn: 'a notice from LinkedIn, a forced sign-out or a verification prompt' },
    x: { why: 'X can limit or suspend accounts that send a lot of DMs.', warn: 'a notice from X, a forced sign-out or a verification prompt' },
  };
  let raising = null;
  function raiseDialog(a, k, v) {
    const m = LIM[a.ch][k]; const r = RISK[a.ch]; const from = valueOf(a, k);
    const selId = `stg-lim-${a.id}-${k}`;
    const title = `Raise to ${v} ${m.unit} a day?`;
    const what = k === 'n'
      ? `Up to ${v} ${m.unit} a day from ${THIS[a.ch]}, instead of the suggested ${m.safe}. More people hear from you each day, and your credits are used faster.`
      : `Up to ${v} ${m.unit} a day from ${THIS[a.ch]}, follow-ups included, instead of the suggested ${m.safe}.`;
    raising = { id: a.id, k, v };
    OB.dialog(`${OB.dialogHead(title, esc(a.ch === 'email' ? a.name : `${a.name} on ${KIND[a.ch]}`))}
      <ul class="stg-raise" role="list">
        <li>${icon('arrow-up', 16)}<p><span class="t-medium t-ink">What changes.</span> ${esc(what)}</p></li>
        <li>${icon('shield', 16)}<p><span class="t-medium t-ink">The risk to this account sits with you.</span> ${esc(r.why)}</p></li>
        <li>${icon('pause', 16)}<p><span class="t-medium t-ink">Onbook still pauses this channel at the first warning:</span> ${esc(`${r.warn}. Your other channels carry on.`)}</p></li>
      </ul>
      <div class="dialog-actions">${ui.btn({ label: `Keep ${from} a day`, action: 'close-overlay' })}${ui.btn({ label: `Raise to ${v} a day`, kind: 'primary', action: 'stg-limit-raise' })}</div>`, {
      label: title,
      onClose: () => {
        raising = null;
        if (!onAccounts()) return;
        const opener = OB._lastFocus;
        openAccount(a.id, accClose, selId);
        OB._lastFocus = opener; // closing the drawer later still returns to the row that opened it
      },
    });
  }
  OB.action('stg-limit-raise', () => {
    const r = raising; if (!r) return;
    const a = OB.get.account(r.id); if (!a) return;
    setLimit(a, r.k, r.v);
    OB.closeOverlays(true);
    renderBehind(a);
    OB.toast(`Raised to ${r.v} ${LIM[a.ch][r.k].unit} a day`);
  });
  OB.action('stg-limit-reset', (el, e, id) => {
    const a = OB.get.account(id); if (!a) return;
    const before = { stgLimit: a.stgLimit, stgSends: a.stgSends };
    delete a.stgLimit; delete a.stgSends;
    redrawAccount(a, `stg-lim-${a.id}-n`);
    renderBehind(a);
    OB.toast('Reset to the suggested limits', { undo: () => {
      Object.keys(before).forEach((k) => { if (before[k]) a[k] = before[k]; });
      redrawAccount(a);
      renderBehind(a);
    } });
  });
  const openConnect = (ch) => {
    if (OB.connect && typeof OB.connect.open === 'function') OB.connect.open(ch);
    else OB.toast(`The ${OB.chName(ch)} connect screen opens here.`);
  };
  OB.action('stg-connect-menu', (el) => OB.menu(el, [
    { label: 'Email inbox', icon: 'mail', hint: 'Google or Microsoft', action: 'stg-connect', arg: 'email' },
    { label: 'LinkedIn', icon: 'user', hint: 'One per person', action: 'stg-connect', arg: 'linkedin' },
    { label: 'X', icon: 'message', hint: 'Onbook for Chrome', action: 'stg-connect', arg: 'x' },
    { label: 'Calendar', icon: 'calendar', hint: 'For bookings', action: 'stg-connect', arg: 'calendar' },
  ]));
  OB.action('stg-connect', (el, e, ch) => openConnect(ch));
  OB.action('stg-reconnect', (el, e, id) => {
    const a = OB.get.account(id); if (!a) return;
    if (a.ch === 'linkedin') OB.actions['reconnect-linkedin']();
    else openConnect(a.ch);
  });
  OB.action('stg-reconnect-off', (el, e, id) => {
    const a = OB.get.account(id); if (!a) return;
    delete a.stgOff;
    OB.closeOverlays(true);
    OB.render({ keepScroll: true });
    if (OB.connect && typeof OB.connect.open === 'function') OB.connect.open(a.ch);
    else OB.toast(`Connected ${a.name} again`);
  });
  OB.action('stg-disconnect', (el, e, id) => {
    const a = OB.get.account(id); if (!a) return;
    OB.confirm({
      title: `Disconnect ${a.name}?`, body: esc(DISCONNECT[a.ch]), confirmLabel: 'Disconnect', danger: true,
      onConfirm: () => {
        a.stgOff = true;
        OB.render({ keepScroll: true });
        OB.toast(`Disconnected ${a.name}`, { undo: () => { delete a.stgOff; OB.render({ keepScroll: true }); } });
      },
    });
  });

  /* ---------- Plan and credits: plan, credits used, extra credits and invoices, each a card ---------- */
  /* Credits are the allowance's unit (Proposed 9 Oct): a new person or a comment on a prospect's post costs 1.
     The demo has no comments yet; commentsUsed is the count a real workspace would carry. */
  if (D.plan.commentsUsed == null) D.plan.commentsUsed = 0;
  function usageRows(used) {
    const list = D.plan.usageByCampaign;
    const sum = list.reduce((n, u) => n + u.count, 0) || 1;
    const scaled = list.map((u) => ({ c: OB.get.campaign(u.campaign), n: Math.round((u.count / sum) * used) }));
    const drift = used - scaled.reduce((n, u) => n + u.n, 0);
    if (scaled.length) scaled[0].n += drift;
    return `<ul class="stg-usage" role="list" aria-labelledby="stg-by-camp">${scaled.map((u) => `<li>
        <a href="#campaign.${esc(u.c.id)}" class="truncate">${esc(u.c.name)}</a>
        ${ui.meter(u.n, used || 1, { label: `${u.c.name}: credits used this month`, warnAt: 2 })}
        <span class="num stg-usage-n">${fmt.num(u.n)}</span>
      </li>`).join('')}</ul>`;
  }
  // What used the credits: one row per kind, each 1 credit
  function usesList(used) {
    const comments = Math.min(used, D.plan.commentsUsed || 0);
    const uses = [['New people', used - comments], ['Comments on posts', comments]];
    return `<dl class="stg-uses">${uses.map(([k, n]) => `<div class="stg-use"><dt>${esc(k)}</dt><dd class="stg-use-each">1 credit each</dd><dd class="stg-use-n num">${fmt.num(n)}</dd></div>`).join('')}</dl>`;
  }
  const invoicesCard = (list) => card('stg-inv-h', 'list', 'Invoices', list.length ? `<div class="table-wrap"><table class="table stg-table stg-inv">
      <caption class="sr-only">Invoices, newest first</caption>
      <thead><tr><th scope="col" class="stg-c-date">Date</th><th scope="col" class="stg-c-desc">Description</th><th scope="col" class="stg-c-status">Status</th><th scope="col" class="stg-c-amt">Amount</th><th scope="col" class="stg-c-end"><span class="sr-only">Download</span></th></tr></thead>
      <tbody>${list.slice().sort((a, b) => OB.d(b.date) - OB.d(a.date)).map((inv) => `<tr>
        <td class="stg-c-date">${esc(fmt.day(inv.date))}</td>
        <td class="stg-c-desc"><span class="truncate">${esc(inv.label)}</span></td>
        <td class="stg-c-status">${ui.tag(inv.status === 'Paid' ? 'green' : 'amber', inv.status)}</td>
        <td class="stg-c-amt num">${esc(fmt.money(inv.amount))}</td>
        <td class="stg-c-end">${ui.btn({ icon: 'download', size: 's', kind: 'ghost', title: 'Download PDF', action: 'stg-invoice', arg: inv.id, ariaLabel: `Download the invoice for ${inv.label}` })}</td>
      </tr>`).join('')}</tbody>
    </table></div>` : pad('<p class="t-small t-2">No invoices yet. The first one arrives when you subscribe.</p>'));
  function planBody() {
    const p = D.plan; const sim = OB.state.sim; const used = OB.get.used();
    if (prePay()) {
      const plan = card('stg-plan-h', 'card', 'Your plan', pad(`<p class="stg-price-line"><span class="stg-price num">${fmt.money(p.price)}</span><span class="t-2">a month, from the day you launch</span></p>
          <p class="t-small t-2">${fmt.num(p.allowance)} credits a month, for new people and comments on posts. Building is free; nothing is sent and nothing is charged until you subscribe.</p>`, 'stg-plan-body')
        + rows([line('Billing', `Monthly, or ${fmt.money(p.annualPrice)} a month billed yearly`)]), ui.tag('outline', 'Not subscribed'));
      const usage = card('stg-use-h', 'user', 'Credits this month', pad(`<p class="t-small t-2">Your ${fmt.num(p.allowance)} credits start the day you launch. A new person uses 1 credit, when Onbook buys their contact details the day before their first message. Follow-ups, replies and bookings are free.</p>`), '<span class="t-small t-2">Starts when you launch</span>');
      return `${plan}${usage}${invoicesCard([])}`;
    }
    const failed = sim.paymentFailed;
    const price = p.stgAnnual
      ? `<span class="stg-price num">${fmt.money(p.annualPrice)}</span><span class="t-2">a month, billed ${fmt.money(p.annualPrice * 12)} a year</span>`
      : `<span class="stg-price num">${fmt.money(p.price)}</span><span class="t-2">a month</span>`;
    const renew = p.stgCancelled
      ? '<p class="t-small"><span class="t-medium">Cancelled.</span> <span class="t-2">Sending continues until Sat 31 Oct, then stops.</span></p>'
      : `<p class="t-small t-2">${fmt.num(p.allowance)} credits a month, for new people and comments on posts. ${p.stgAnnual ? 'Renews Thu 7 Oct 2027.' : `Renews ${fmt.day(p.nextBill)}.`}</p>`;
    const billing = p.stgCancelled ? '' : p.stgAnnual
      ? line('Billing', `Annual, ${fmt.money(p.annualPrice * 12)} a year`)
      : line('Billing', `Monthly. Annual is ${fmt.money(p.annualPrice)} a month, billed ${fmt.money(p.annualPrice * 12)} a year.`, '<button type="button" class="link-btn" data-action="stg-annual">Switch to annual</button>');
    const state = failed ? ui.tag('red', 'Payment failed') : p.stgCancelled ? ui.tag('amber', 'Cancelled') : ui.tag('green', 'Active');
    const plan = card('stg-plan-h', 'card', 'Your plan', pad(`<div class="stg-plan-top"><div class="stack gap-1"><p class="stg-price-line">${price}</p>${renew}</div>${p.stgCancelled ? ui.btn({ label: 'Keep my plan', size: 's', action: 'stg-keep' }) : ''}</div>`, 'stg-plan-body')
      + rows([
        line('Card', `${esc(p.card)}${failed ? ', declined' : ''}`, failed ? '' : '<button type="button" class="link-btn" data-action="stg-card-change">Change card</button>', failed ? 'is-error' : ''),
        billing,
      ]), state);
    // Out of credits: new people and comments wait; everything already going carries on
    const out = used >= p.allowance;
    const usage = card('stg-use-h', 'user', 'Credits this month', pad(`<p class="stg-big num"><span>${fmt.num(used)}</span> <span class="t-2">of ${fmt.num(p.allowance)} used</span></p>
        ${ui.meter(used, p.allowance, { label: 'Credits used this month' })}`, 'stg-usage-top')
      + usesList(used)
      + `<p class="stg-sub-h" id="stg-by-camp">By campaign</p>${usageRows(used)}`
      + `<p class="stg-card-foot">${out
        ? 'New people and comments pause until 1 Nov, or until you buy credits. Follow-ups, replies and bookings carry on.'
        : 'A new person uses 1 credit when Onbook buys their contact details, the day before their first message. Follow-ups, replies and bookings are free.'}</p>`,
      `${out ? ui.tag('amber', 'Used up') : ''}<span class="t-small t-2">Resets 1 Nov</span>`);
    const extra = card('stg-cr-h', 'plus', 'Extra credits', rows([
        line('Packs', '100 credits for $25, 300 for $75, 500 for $125, used after the monthly credits'),
        line('Left', `<span class="t-medium num">${fmt.num(p.credits)} extra ${p.credits === 1 ? 'credit' : 'credits'}</span><span class="t-2">, ending with the period on 31 Oct</span>`),
      ]) + swRow('stg-auto', 'Buy credits automatically', 'When your monthly credits run out, Onbook buys 100 credits for $25, up to $100 a period. Off by default.', ui.sw({ id: 'stg-auto', on: p.autoCredits, action: 'stg-auto', describedBy: 'stg-auto-d' }))
      + `<div class="stg-earn"><p><span class="t-medium">Earn credits:</span> <span class="t-2">join a 30-minute feedback call with your team</span></p>${ui.btn({ label: 'Book a call', size: 's', action: 'stg-feedback', ariaLabel: 'Book a feedback call to earn credits' })}</div>`,
      ui.btn({ label: 'Buy credits', size: 's', action: 'buy-credits' }));
    const cancel = p.stgCancelled ? '' : '<p class="stg-after"><button type="button" class="link-btn stg-quiet" data-action="stg-cancel">Cancel plan</button></p>';
    return `${plan}${usage}${extra}${invoicesCard(p.invoices)}${cancel}`;
  }
  OB.action('stg-feedback', () => OB.toast("Onbook's booking page opens here. Pick 30 minutes that suit your team."));
  OB.action('stg-card-change', () => OB.toast("Stripe's secure card page opens here. Onbook never sees the card number."));
  OB.action('stg-card-update', () => {
    OB.dialog(`${OB.dialogHead('Update your card', "You enter the new card on Stripe's secure page. Onbook never sees the card number.")}
      <p class="t-2">As soon as the new card goes through, sending starts again within a few minutes. Messages that were due while sending was paused go out today, within the normal limits.</p>
      <div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${ui.btn({ label: 'Open Stripe', kind: 'primary', iconRight: 'external', action: 'stg-card-updated' })}</div>`, { label: 'Update your card' });
  });
  OB.action('stg-card-updated', () => {
    OB.closeOverlays(true);
    OB.state.sim.paymentFailed = false;
    OB.render({ keepScroll: true });
    OB.toast('Card updated. Sending starts again within a few minutes.');
  });
  OB.action('stg-annual', () => {
    const p = D.plan;
    OB.confirm({
      title: 'Switch to annual billing?',
      body: esc(`You pay ${fmt.money(p.annualPrice * 12)} today for the next 12 months, which is ${fmt.money(p.annualPrice)} a month instead of ${fmt.money(p.price)}. Unused days of October are credited. You still get ${fmt.num(p.allowance)} credits every month.`),
      confirmLabel: 'Switch to annual',
      onConfirm: () => { p.stgAnnual = true; OB.render({ keepScroll: true }); OB.toast('Switched to annual billing'); },
    });
  });
  OB.action('stg-auto', () => {
    D.plan.autoCredits = !D.plan.autoCredits;
    OB.render({ keepScroll: true });
    OB.toast(D.plan.autoCredits ? 'Automatic credits turned on. Up to $100 a period.' : 'Automatic credits turned off');
  });
  OB.action('stg-invoice', (el, e, id) => { const inv = D.plan.invoices.find((x) => x.id === id); OB.toast(`Downloaded ${inv ? inv.label : 'the invoice'} (PDF)`); });
  function cancelDialog(opts) {
    OB.dialog(`${OB.dialogHead('Cancel your plan?')}
      <ul class="stg-bullets">
        <li>Sending continues until Sat 31 Oct, the end of the period you paid for. Then new messages stop.</li>
        <li>Unused credits don't carry over.</li>
        <li>Your contacts and lists stay yours, and you can export them any time.</li>
      </ul>
      <div class="field"><label class="label" for="stg-cancel-why">Why are you cancelling? <span class="t-2" style="font-weight:400">(optional)</span></label>
        <select class="select" id="stg-cancel-why"><option value="">Choose a reason</option><option>Not enough replies</option><option>Too expensive</option><option>Switching to another tool</option><option>Finished what I needed</option><option>Something else</option></select></div>
      <div class="dialog-actions">${ui.btn({ label: 'Keep my plan', action: 'close-overlay' })}${ui.btn({ label: 'Cancel plan', kind: 'danger', action: 'stg-cancel-yes' })}</div>`, Object.assign({ label: 'Cancel your plan?' }, opts));
  }
  OB.action('stg-cancel', () => cancelDialog());
  OB.action('stg-cancel-yes', () => {
    OB.closeOverlays(true);
    D.plan.stgCancelled = true;
    settle('plan');
    OB.render({ keepScroll: true });
    OB.toast('Plan cancelled. Sending continues until Sat 31 Oct.');
  });
  OB.action('stg-keep', () => { D.plan.stgCancelled = false; OB.render({ keepScroll: true }); OB.toast(`Plan kept. It renews on ${fmt.day(D.plan.nextBill)}.`); });

  /* ---------- Team ---------- */
  const TEAM_RULES = [
    'Each teammate subscribes for $199 a month and gets their own 1,000 credits a month. There is no team invoice.',
    'A teammate can send once subscribed. A reply or booking to anyone stops that company for everyone.',
    'On a shared campaign, new companies are split equally, and each person answers replies to their own messages.',
  ];
  const teamView = (joined) => D.team.map((m) => (joined && m.status === 'Invited' && m.id === 'u2' ? Object.assign({}, m, { status: 'Active', joined: '2026-10-06', campaigns: 1 }) : m));
  function teamBody(joined) {
    const list = teamView(joined);
    const trs = list.map((m) => {
      const me = m.id === D.me.id;
      const label = m.name || m.email;
      const status = m.status === 'Invited'
        ? `<span class="stg-pair">${ui.tag('grey', `Invited ${fmt.short(m.invited)}`)}<span class="stg-why">Not subscribed yet</span></span>`
        : ui.tag('green', 'Active');
      const end = me ? '<span class="t-small t-2">You</span>'
        : ui.btn({ icon: 'more', kind: 'ghost', size: 's', title: 'More actions', ariaLabel: `More actions for ${label}`, action: 'stg-member-menu', arg: m.id, cls: 'stg-more', extra: 'aria-haspopup="menu" aria-expanded="false"' });
      return `<tr>
        <td class="stg-c-who"><span class="stg-who"><span class="rec">${ui.avatar(label, 'sm')}<span>${esc(label)}</span></span>${m.name ? `<span class="stg-why">${esc(m.email)}</span>` : ''}</span></td>
        <td class="stg-c-role">${esc(m.role)}</td>
        <td class="stg-c-status">${status}</td>
        <td class="stg-c-n num"><span class="sr-only">Campaigns: </span>${m.campaigns}</td>
        <td class="stg-c-end">${end}</td>
      </tr>`;
    }).join('');
    const members = card('stg-team-h', 'contacts', 'Members', `<div class="table-wrap"><table class="table stg-table stg-team">
        <caption class="sr-only">Teammates</caption>
        <thead><tr><th scope="col" class="stg-c-who">Person</th><th scope="col" class="stg-c-role">Role</th><th scope="col" class="stg-c-status">Status</th><th scope="col" class="stg-c-n">Campaigns</th><th scope="col" class="stg-c-end"><span class="sr-only">Actions</span></th></tr></thead>
        <tbody>${trs}</tbody>
      </table></div>`, `<span class="t-small t-2 num">${list.length}</span>`);
    const rules = card('stg-team-how', 'info', 'How teams work', `<ul class="stg-rules" role="list">${TEAM_RULES.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>`);
    return `${members}${rules}`;
  }
  function inviteHtml(err) {
    return `${OB.dialogHead('Invite a teammate')}
      <form class="stack gap-5" data-submit="stg-invite-send" novalidate>
        ${ui.field({ id: 'stg-inv-email', label: 'Their work email', type: 'email', placeholder: 'name@tideline.studio', value: OB.ui$('stgInvEmail', ''), error: err, extra: 'autocomplete="off" data-input="stg-inv-email"' })}
        <div class="field"><label class="label" for="stg-inv-role">Role</label><span class="hint" id="stg-inv-role-hint">Members run campaigns and answer their own replies. Owners can also invite and remove teammates.</span>
          <select class="select" id="stg-inv-role" aria-describedby="stg-inv-role-hint"><option>Member</option><option>Owner</option></select></div>
        <p class="stg-rule">${icon('info', 16)}<span>${esc(`${TEAM_RULES[0]} ${TEAM_RULES[1]}`)}</span></p>
        <div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${ui.btn({ label: 'Send invite', kind: 'primary', type: 'submit' })}</div>
      </form>`;
  }
  function inviteDialog(opts) { OB.state.ui.stgInvEmail = ''; OB.dialog(inviteHtml(), Object.assign({ label: 'Invite a teammate' }, opts)); }
  OB.action('stg-invite', () => inviteDialog());
  OB.action('stg-inv-email', (el, e, v) => { OB.state.ui.stgInvEmail = v; });
  OB.action('stg-invite-send', () => {
    const email = String(OB.state.ui.stgInvEmail || '').trim().toLowerCase();
    let err = '';
    if (!email) err = 'Enter their work email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err = 'That email is missing something. Check it looks like name@company.com.';
    else if (D.team.some((m) => m.email === email)) err = `${email} is already on your team.`;
    if (err) { const box = document.querySelector('#overlay .dialog'); box.innerHTML = inviteHtml(err); box.querySelector('#stg-inv-email').focus(); return; }
    const role = document.getElementById('stg-inv-role').value;
    D.team.push({ id: `u${Date.now()}`, name: '', email, role, status: 'Invited', invited: '2026-10-07', campaigns: 0 });
    OB.closeOverlays(true);
    settle('team');
    OB.render({ keepScroll: true });
    OB.toast(`Invite sent to ${email}`);
  });
  OB.action('stg-resend', (el, e, id) => { const m = D.team.find((x) => x.id === id); OB.toast(`Invite sent again to ${m ? m.email : 'them'}`); });
  OB.action('stg-uninvite', (el, e, id) => {
    const m = D.team.find((x) => x.id === id); if (!m) return;
    OB.confirm({
      title: `Cancel the invite to ${m.name || m.email}?`, body: 'The link in their email stops working. You can invite them again later.', confirmLabel: 'Cancel invite', cancelLabel: 'Keep invite', danger: true,
      onConfirm: () => {
        const i = D.team.indexOf(m); D.team.splice(i, 1);
        OB.render({ keepScroll: true });
        OB.toast('Invite cancelled', { undo: () => { D.team.splice(i, 0, m); OB.render({ keepScroll: true }); } });
      },
    });
  });
  OB.action('stg-member-menu', (el, e, id) => {
    const parts = OB.parseHash().params;
    const m = teamView(parts[0] === 'team' && parts[1] === 'joined').find((x) => x.id === id); if (!m) return;
    OB.menu(el, m.status === 'Invited'
      ? [{ label: 'Resend invite', icon: 'send', action: 'stg-resend', arg: id }, { sep: true }, { label: 'Cancel invite', icon: 'x', action: 'stg-uninvite', arg: id, danger: true }]
      : [{ label: 'Remove from team', icon: 'trash', action: 'stg-remove', arg: id, danger: true }]);
  });
  OB.action('stg-remove', (el, e, id) => {
    const m = teamView(true).find((x) => x.id === id); if (!m) return;
    const f = (m.name || m.email).split(' ')[0];
    OB.dialog(`${OB.dialogHead(`Remove ${m.name || m.email} from the team?`)}
      <p class="t-2">${esc(`${f}'s 6 companies and 1 open conversation move to you. Messages waiting to go from ${f}'s accounts are cancelled, and those companies carry on from your accounts tomorrow.`)}</p>
      <p class="t-small t-2">${esc(`${f} pays for their own plan, so your bill doesn't change. They keep their plan until they cancel it.`)}</p>
      <div class="dialog-actions">${ui.btn({ label: `Keep ${f}`, action: 'close-overlay' })}${ui.btn({ label: `Remove ${f}`, kind: 'danger-solid', action: 'stg-remove-yes', arg: id })}</div>`, { label: `Remove ${m.name || m.email}` });
  });
  OB.action('stg-remove-yes', (el, e, id) => {
    const m = D.team.find((x) => x.id === id); if (!m) return;
    OB.closeOverlays(true);
    const i = D.team.indexOf(m); D.team.splice(i, 1);
    OB.go('settings.team');
    OB.toast(`Removed ${m.name || m.email}. Their companies and conversations are yours now.`, { undo: () => { D.team.splice(i, 0, m); OB.render({ keepScroll: true }); } });
  });

  /* ---------- Notifications ---------- */
  const NOTIFS = [
    ['reply', 'Reply alerts', 'An email the moment someone replies, such as "Maya Chen at Kestrel Exchange replied". A suggested reply waits in your Inbox.'],
    ['booked', 'Booking alerts', 'When someone books a call through your link, such as "Call booked with Quanta Wallet".'],
    ['match', 'Booking to match', "When someone books and Onbook can't tell who they are."],
    ['daily', 'Daily summary at 8:00 AM', 'Each weekday: what needs you and what goes out today.'],
    ['weekly', 'Weekly results', 'Each Monday: replies, calls and people reached, by campaign.'],
  ];
  function notificationsBody() {
    const n = D.notifications;
    const chosen = NOTIFS.map(([k, label, desc]) => swRow(`stg-n-${k}`, label, desc, ui.sw({ id: `stg-n-${k}`, on: n[k], action: 'stg-notif', arg: k, describedBy: `stg-n-${k}-d` }))).join('');
    const always = [['Account problems', 'A signed-out account, a paused channel or a daily limit reached.'], ['Billing', 'A failed payment, a renewal, or credits running out.']]
      .map(([label, desc]) => `<div class="stg-sw"><div class="stg-sw-text"><span class="t-medium">${esc(label)}</span><span>${esc(desc)}</span></div><span class="stg-always">${icon('lock', 14)}Always on</span></div>`).join('');
    return card('stg-n-h', 'bell', 'Emails you choose', `<div class="stg-sws">${chosen}</div>`)
      + card('stg-n-al', 'lock', 'Always sent', `<div class="stg-sws">${always}</div>`, '<span class="t-small t-2">So sending never stops without you knowing</span>');
  }
  OB.action('stg-notif', (el, e, k) => {
    D.notifications[k] = !D.notifications[k];
    OB.render({ keepScroll: true });
    const short = { reply: 'Reply alerts', booked: 'Booking alerts', match: 'Booking to match emails', daily: 'Daily summary', weekly: 'Weekly results' }[k] || 'Emails';
    OB.toast(`${short} turned ${D.notifications[k] ? 'on' : 'off'}`);
  });

  /* ---------- Privacy and data ---------- */
  function privacyBody() {
    const t = (OB.contacts && OB.contacts.totals ? OB.contacts.totals() : D.contactsTotals) || { bought: 289 };
    const action = (text, btn) => `<div class="stg-action"><p>${text}</p>${btn}</div>`;
    const exportCard = card('stg-pv-exp', 'download', 'Export your contacts', action(esc(`A CSV of the ${fmt.num(t.bought)} people Onbook has details for: everyone whose contact details were bought, plus people you imported. Your contacts stay exportable even after you cancel.`), ui.btn({ label: 'Export contacts', icon: 'download', size: 's', action: 'stg-export' })));
    const keep = card('stg-pv-keep', 'clock', 'How long Onbook keeps data', rows([
      line('Unpaid workspaces', 'Prospect data is deleted 60 days after the last activity.'),
      line('Details bought, never used', 'Deleted after 30 days if that person was never contacted.'),
      line('Never contact list', 'Kept for good, so opt-outs are always honoured.'),
      line('Mail from outside your campaigns', 'Never stored.'),
    ]), '', 'stg-card-wide');
    const prospects = card('stg-pv-rm', 'shield', 'For the people you contact', pad(`<p>Onbook is responsible for the prospect data it finds. It tells people in the EU and UK where their details came from, and anyone can ask to be removed from every Onbook customer's lists. Requests are honoured within minutes and kept for good.</p>
        <p class="stg-links"><a href="#remove-me">The public remove-me page</a><span aria-hidden="true">&middot;</span><a href="#legal.dpa">Data agreement</a><span aria-hidden="true">&middot;</span><a href="#legal.subprocessors">Subprocessors</a></p>`, 'stack gap-3'));
    const del = card('stg-pv-del', 'trash', 'Delete workspace', action("Deletes Tideline's campaigns, lists, contacts, conversations and company profile for good. Sending stops at once and your plan ends today. Opt-outs are kept, so those people are never contacted again through Onbook.", ui.btn({ label: 'Delete workspace', kind: 'danger', size: 's', action: 'stg-delete' })), '', 'stg-card-danger');
    return `${exportCard}${keep}${prospects}${del}`;
  }
  OB.action('stg-export', () => { if (OB.contacts && OB.contacts.exportDialog) OB.contacts.exportDialog(); else OB.toast('Contacts exported'); });
  function deleteDialog(opts) {
    const ws = D.me.company;
    OB.dialog(`${OB.dialogHead(`Delete the ${ws} workspace?`)}
      <p class="t-2">This can't be undone. Campaigns, lists, contacts, conversations and the company profile are deleted for good, sending stops at once and your plan ends today. Export your contacts first if you want to keep them.</p>
      ${ui.field({ id: 'stg-del-name', label: `Type ${ws} to confirm`, extra: 'autocomplete="off" spellcheck="false" data-input="stg-del-type"' })}
      <div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${ui.btn({ label: 'Delete workspace', kind: 'danger-solid', action: 'stg-delete-yes', id: 'stg-del-go', disabled: true })}</div>`, Object.assign({ label: 'Delete workspace' }, opts));
  }
  OB.action('stg-delete', () => deleteDialog());
  OB.action('stg-del-type', (el, e, v) => { const b = document.getElementById('stg-del-go'); if (b) b.disabled = String(v).trim() !== D.me.company; });
  OB.action('stg-delete-yes', () => {
    const v = (document.getElementById('stg-del-name') || {}).value || '';
    if (v.trim() !== D.me.company) return;
    OB.closeOverlays(true);
    OB.go('site');
    OB.toast(`${D.me.company} workspace deleted`);
  });

  /* ---------- Routes and the Screens menu ---------- */
  OB.route('settings', (params) => {
    const key = SECTIONS.some((s) => s.key === params[0]) ? params[0] : 'profile';
    const v = params[1];
    const sim = OB.state.sim;
    if (key === 'profile') {
      if (v === 'edited' && !OB.state.ui.stgDraft) { const d = draft(); d.voice = `${D.profile.voice} No emojis, and never "game-changing".`; d.reasons.push('Applied for a licence'); }
      return frame('profile', profileBody(), { sub: 'What Onbook knows about Tideline. Every campaign uses it to choose companies and write messages.', after: v ? () => settle('profile') : null });
    }
    if (key === 'accounts') {
      if (v === 'linkedin-signed-out') sim.linkedinIssue = true;
      const acc = v && OB.get.account(v);
      const step = acc && LIM[acc.ch] ? LIM[acc.ch].n.opts.find((x) => x > Math.max(limitOf(acc), LIM[acc.ch].n.safe)) : null;
      // #settings.accounts.<id>.above: that account already one step above the suggestion
      if (params[2] === 'above' && step && !isAbove(acc)) setLimit(acc, 'n', step);
      const n = perDay();
      const after = acc ? () => {
        if (overlayOpen()) return;
        openAccount(acc.id, settleOnClose('accounts'));
        // #settings.accounts.<id>.raise: the risk dialog for one step above the suggestion
        if (params[2] === 'raise' && step) raiseDialog(acc, 'n', step);
      } : v ? () => settle('accounts') : null;
      // The LinkedIn problem is shown on its own row, with the one Reconnect button, so the page draws the other notices itself
      const own = sim.linkedinIssue ? shellNotices({ linkedin: false }) : [];
      return frame('accounts', accountsBody(), {
        sub: `About ${n} new people a weekday from these accounts, about ${fmt.num(n * 22)} a month. Connect another inbox to reach more.`,
        actions: ui.btn({ label: 'Connect an account', icon: 'plus', iconRight: 'chevron-down', size: 's', action: 'stg-connect-menu', extra: 'aria-haspopup="menu" aria-expanded="false"' }),
        top: own.length ? `<div class="banner-stack">${own.join('')}</div>` : '',
        view: sim.linkedinIssue ? { noBanners: true } : null,
        after,
      });
    }
    if (key === 'plan') {
      if (v === 'payment-failed') sim.paymentFailed = true;
      if (v === 'out-of-credits') sim.outOfPeople = true;
      const after = v === 'cancel' ? () => { if (!overlayOpen()) cancelDialog({ onClose: settleOnClose('plan') }); } : v ? () => settle('plan') : null;
      // On this page the payment notice's button opens the card form, so the page draws the notices itself
      const own = sim.paymentFailed
        ? [ui.notice({ kind: 'error', title: 'Your card was declined, so all sending is paused', body: `${esc(D.plan.card)} was declined. Replies still reach your Inbox. Update your card and sending starts again within a few minutes.`, actions: ui.btn({ label: 'Update card', kind: 'primary', size: 's', action: 'stg-card-update' }) })].concat(shellNotices({ payment: false }))
        : [];
      const actions = prePay() ? ui.btn({ label: 'Subscribe and launch', kind: 'primary', size: 's', href: '#setup-launch' }) : '';
      return frame('plan', planBody(), { actions, top: own.length ? `<div class="banner-stack">${own.join('')}</div>` : '', view: sim.paymentFailed ? { noBanners: true } : null, after });
    }
    if (key === 'team') {
      const actions = ui.btn({ label: 'Invite a teammate', icon: 'plus', kind: 'primary', size: 's', action: 'stg-invite' });
      const sub = 'Teammates share your company profile and never-contact list.';
      if (v === 'invite') return frame('team', teamBody(false), { sub, actions, after: () => { if (!overlayOpen()) inviteDialog({ onClose: settleOnClose('team') }); } });
      return frame('team', teamBody(v === 'joined'), { sub, actions });
    }
    if (key === 'notifications') return frame('notifications', notificationsBody(), { sub: `Emails go to <strong class="t-medium t-ink">${esc(D.me.email)}</strong>, the address you sign in with.` });
    if (v === 'delete') return frame('privacy', privacyBody(), { after: () => { if (!overlayOpen()) deleteDialog({ onClose: settleOnClose('privacy') }); } });
    return frame('privacy', privacyBody());
  });

  OB.screen('Settings', 'Company profile', 'settings');
  OB.screen('Settings', 'Company profile, unsaved changes', 'settings.profile.edited');
  OB.screen('Settings', 'Accounts', 'settings.accounts');
  OB.screen('Settings', 'Accounts, LinkedIn signed out', 'settings.accounts.linkedin-signed-out');
  OB.screen('Settings', 'Account details and daily limit (LinkedIn)', 'settings.accounts.a-li');
  OB.screen('Settings', 'Account details and daily limits (email)', 'settings.accounts.a-email');
  OB.screen('Settings', 'Account details and daily limits (X, warming up)', 'settings.accounts.a-x');
  OB.screen('Settings', 'Raise a daily limit (the risk dialog)', 'settings.accounts.a-li.raise');
  OB.screen('Settings', 'A daily limit above the suggestion', 'settings.accounts.a-li.above');
  OB.screen('Settings', 'Plan and credits', 'settings.plan');
  OB.screen('Settings', 'Plan and credits, out of credits', 'settings.plan.out-of-credits');
  OB.screen('Settings', 'Plan and credits, payment failed', 'settings.plan.payment-failed');
  OB.screen('Settings', 'Cancel plan', 'settings.plan.cancel');
  OB.screen('Settings', 'Team', 'settings.team');
  OB.screen('Settings', 'Invite a teammate', 'settings.team.invite');
  OB.screen('Settings', 'Team, after Alex joins (remove a teammate)', 'settings.team.joined');
  OB.screen('Settings', 'Notifications', 'settings.notifications');
  OB.screen('Settings', 'Privacy and data', 'settings.privacy');
  OB.screen('Settings', 'Delete workspace', 'settings.privacy.delete');
})();
