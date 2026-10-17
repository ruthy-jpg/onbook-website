/* Setup: the five steps from a website to a launched campaign, then Day one.
   1 Website and sign-up; 2 Company profile (reading the site, then the profile, five questions); 3 Companies (finding
   them, then 10 examples); 4 Accounts and flow (where to send from, then the plan); 5 Launch (plan and payment); Day one.
   Make the user lazy (spec section 4, Proposed 9 and 17 Oct): Onbook works out of sight and shows the work in plain
   words. Every step is already filled in with Onbook's answer and is editable in place, with one button to go on
   ("Save and continue", "Continue"). No summary pages and no "Change" (Julian, 17 Oct). There is no leads list: Onbook
   is always on, says 30,000+ companies fit, and talks about how many people it reaches a day.
   Also OB.connect.open(ch, { onDone }): the connect dialogs for email, LinkedIn, X and calendar, which Settings reuses.
   v4 (Attio, light only): white cards with a header row, attribute rows (a grey label column, then the value), grey
   tokens for chosen values, a list of example companies, an integrations list for accounts. */
(function () {
  'use strict';
  const OB = window.OB;
  const { esc, icon, ui, fmt } = OB;
  const D = OB.data;
  const S = D.setup;
  const P = D.profile;
  const TODAY = '2026-10-07';

  /* ---------- Demo data this area adds (read by nothing else unless noted) ---------- */
  const uniq = (arr) => arr.filter((v, i) => arr.findIndex((w) => w.toLowerCase() === v.toLowerCase()) === i);
  S.options = S.options || {
    industries: ['Lending and credit', 'Wealth and investing', 'Crypto wallets', 'Insurance'],
    sizes: ['1 to 10', '11 to 50', '51 to 200', '201 to 500', '501 to 1,000', 'Over 1,000'],
    regions: ['Canada', 'Australia', 'Hong Kong', 'Switzerland', 'Latin America'],
    never: [],
    reasons: ['Opened a new office', 'Announced a partnership', 'Hired a new marketing lead'],
  };
  /* Company size is an optional filter, off unless the user sets it (Proposed 17 Oct): every band, "Any size" */
  S.sizeSel = S.sizeSel || S.options.sizes.slice();
  S.chipAll = S.chipAll || {
    titles: uniq(P.titles.concat(['Founder', 'VP Marketing', 'Head of Partnerships'])),
    industries: uniq(P.industries.concat(S.options.industries)),
    sizes: S.options.sizes.slice(),
    regions: uniq(P.regions.concat(S.options.regions)),
    never: uniq(P.never.concat(S.options.never)),
    reasons: uniq(P.reasons.concat(S.options.reasons)),
  };
  /* A third person at some companies, for "3 people per company" */
  S.third = S.third || {
    kestrel: ['Tom Hale', 'CEO'], halcyon: ['Nina Shah', 'Growth Lead'], orbit: ['Marco Ruiz', 'Co-founder'],
    quanta: ['Owen Clarke', 'VP Growth'], glasswing: ['Pablo Reyes', 'CEO'], sable: ['Ivy Chan', 'CMO'],
    arcadia: ['Beatriz Lopes', 'Head of Marketing'], juniper: ['Noah Fraser', 'CEO'], brightwater: ['Hugh Patel', 'CEO'],
    lumen: ['Daphne Koh', 'CMO'], tern: ['Amani Otieno', 'Growth Lead'], fathom: ['Jared Cole', 'CEO'],
  };
  /* People on the whole list of 100 for 1, 2 or 3 per company (14 companies have one person, 61 have a third) */
  S.peopleTotals = S.peopleTotals || { 1: 100, 2: 186, 3: 247 };
  /* Day one: accounts ramp from 5 new people a day (spec section 6), so 5 start today */
  S.firstDay = S.firstDay || { count: 15, started: '2026-10-07T10:31', invites: ['2026-10-07T11:05', '2026-10-07T11:19', '2026-10-07T11:36', '2026-10-07T11:52', '2026-10-07T12:14'] };
  S.neverImport = S.neverImport || null;
  /* What Onbook reads on the site in step 2: 12 client logos (8 crypto, 4 fintech) and 4 case studies on 14 pages */
  S.read = S.read || {
    pages: 14,
    caseStudies: 4,
    clients: [
      ['Nimbus Swap', 'crypto'], ['Basalt Chain', 'crypto'], ['Ferro Wallet', 'crypto'], ['Quill Markets', 'crypto'],
      ['Polder Staking', 'crypto'], ['Tessera Labs', 'crypto'], ['Rivet Exchange', 'crypto'], ['Cinder Perps', 'crypto'],
      ['Ledgerly', 'fintech'], ['Corelane Pay', 'fintech'], ['Gridline Bank', 'fintech'], ['Plume Invest', 'fintech'],
    ],
    sellShort: 'Launch and growth campaigns for fintech and crypto products, run as a monthly retainer.',
    /* Partners and investors named on the site, for the never contact step (step 3) */
    others: [['Bluefin Capital', 'Investor'], ['Keystone Audit', 'Partner'], ['Halyard Legal', 'Partner']],
  };
  /* Never contact in setup (step 3, Proposed 17 Oct): what the user ticked, by company name; null until the step is
     saved. "Set up later" leaves it null and the launch summary says so */
  S.neverTick = S.neverTick || null;
  S.neverLater = !!S.neverLater;
  /* Step 3 checks this many companies before it picks the best 100 to start. Screens say "over 30,000", never how many
     fit: a fixed pool reads as a ceiling, and Onbook keeps finding more like them (Julian, 17 Oct) */
  S.checked = S.checked || 31400;
  const checkedWords = () => `over ${fmt.num(Math.floor(S.checked / 10000) * 10000)}`;
  /* Your offer starts empty in setup and must be written before the list is built: only the customer knows it */
  S.offerDraft = S.offerDraft == null ? '' : S.offerDraft;
  /* Proof read from the website needs "Confirmed by you" before first use (spec 3, Proof points). Setup starts the way a
     new account does: what Onbook read stays unconfirmed until it is confirmed here; proof the user adds or rewrites
     counts as confirmed. Kept apart from D.profile, which holds the account as it is today (Settings) */
  S.proofOk = S.proofOk || {};
  const DESCRIBE = { 'Fintech apps': 'A fintech app', 'Exchanges and trading': 'A trading platform', 'DeFi protocols': 'A DeFi protocol', Payments: 'A payments app' };
  P.proof.forEach((p) => {
    if (p.clientName == null) p.clientName = p.named ? p.client : '';
    if (p.clientDesc == null) p.clientDesc = p.named ? (DESCRIBE[p.segment] || 'A client') : p.client;
  });

  /* ---------- Screens menu ---------- */
  [
    ['Step 1: website and sign-up', 'setup-website'],
    ['Step 1: website address not valid', 'setup-website.error'],
    ['Step 2: reading the website', 'setup-reading'],
    ['Step 2: website could not be opened', 'setup-reading.error'],
    ['Step 2: company profile', 'setup-profile'],
    ['Step 2: company profile, no offer written', 'setup-profile.no-offer'],
    ['Step 2: five questions', 'setup-questions'],
    ['Step 2: five questions, the last one', 'setup-questions.5'],
    ['Step 3: finding companies that fit', 'setup-list-building'],
    ['Step 3: 10 example companies', 'setup-list'],
    ['Step 3: companies to never contact', 'setup-never'],
    ['Step 4: where to send from', 'setup-accounts'],
    ['Step 4: nothing connected yet', 'setup-accounts.none'],
    ['Step 4: everything connected', 'setup-accounts.all'],
    ['Connect email', 'setup-accounts.email'],
    ['Connect email: permission declined', 'setup-accounts.email-declined'],
    ['Connect LinkedIn', 'setup-accounts.linkedin'],
    ['Connect LinkedIn: sign-in failed', 'setup-accounts.linkedin-failed'],
    ['Connect X', 'setup-accounts.x'],
    ['Connect calendar', 'setup-accounts.calendar'],
    ['Step 4: message flow', 'setup-flow'],
    ['Step 5: launch', 'setup-launch'],
    ['Step 5: launch, billed annually', 'setup-launch.annual'],
    ['Step 5: card declined', 'setup-launch.declined'],
    ['Day one: campaign live', 'day-one'],
  ].forEach(([label, route]) => OB.screen('Setup', label, route));

  /* ---------- Small helpers ---------- */
  const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const focusEl = (id) => { const el = document.getElementById(id); if (el) el.focus(); };
  const site = () => String(OB.state.ui.siteUrl || S.site).trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '') || S.site;
  /* Channel names mid-sentence ("Connect email", "X and email") and at the start of one */
  const chWord = (ch) => (ch === 'email' ? 'email' : OB.chName(ch));
  const andList = (w) => (w.length > 1 ? `${w.slice(0, -1).join(', ')} and ${w[w.length - 1]}` : w.join(''));
  const chList = (chs) => andList(chs.map(chWord));
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const campaign = () => OB.get.campaign('c1') || { name: 'Your first campaign' };
  const conn = () => {
    if (!OB.state.ui.setupConn) OB.state.ui.setupConn = { email: true, linkedin: true, x: false, calendar: true };
    return OB.state.ui.setupConn;
  };
  /* True when this render comes from navigation, not a re-render of the same screen */
  const entering = () => { const raw = OB.parseHash().raw; return !OB.current || !OB.current.route || OB.current.route.raw !== raw; };
  const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthYear = (s) => { const d = OB.d(s); return `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`; };
  const rowsFor = (text, per = 78) => Math.max(2, Math.min(8, Math.ceil(String(text || '').length / per) + 1));
  const DOT = ' &middot; ';

  /* A polite live region outside #app, so it survives re-renders */
  let liveEl = null;
  function announce(text) {
    if (!liveEl) {
      liveEl = document.createElement('div');
      liveEl.className = 'sr-only';
      liveEl.setAttribute('role', 'status');
      liveEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(liveEl);
    }
    liveEl.textContent = '';
    setTimeout(() => { liveEl.textContent = text; }, 80);
  }

  /* Timers for the progress screens and the payment hand-off; cleared when the route changes */
  let timers = [];
  let timerRaw = null;
  function clearTimers() { timers.forEach((t) => clearTimeout(t)); timers = []; timerRaw = null; }
  function later(ms, fn) { timerRaw = OB.parseHash().raw; timers.push(setTimeout(fn, ms)); }
  window.addEventListener('hashchange', () => { if (timerRaw && OB.parseHash().raw !== timerRaw) clearTimers(); });

  /* The sticky footer bar: a note (hidden on phones), Back (hidden on phones), then "Change" (a secondary button that
     opens the editor) and the one main button that accepts Onbook's answer */
  function foot({ note = '', back, second = '', primary }) {
    return `<p class="foot-note">${note}</p>${back ? `<a class="btn btn-secondary su-foot-back" href="#${esc(back)}">${icon('arrow-left', 18)}<span>Back</span></a>` : ''}${second}${primary}`;
  }
  /* Segmented control with ids, so focus survives a re-render */
  const seg = (opts, cur, action, label, idp) => `<div class="seg" role="group" aria-label="${esc(label)}">${opts.map((o) => `<button type="button" id="${idp}-${esc(o.value)}" aria-pressed="${String(o.value) === String(cur)}" data-action="${action}" data-arg="${esc(o.value)}">${esc(o.label)}</button>`).join('')}</div>`;

  /* The work as it happens (reading the site, checking companies): one line per thing Onbook does, in plain words. A line
     says what Onbook is doing while it works ("Reading tideline.studio"), then what it found, with any detail under it.
     Lines appear one at a time; `detail` and `extra` are HTML the caller has escaped */
  const workLog = (id, items) => `<ol class="su-log" id="${id}">${items.map((it, i) => `<li class="su-log-item${i ? '' : ' is-now'}"${i ? ' hidden' : ''} data-done="${esc(it.done)}">
      <span class="su-log-mark" aria-hidden="true"></span>
      <div class="su-log-body">
        <p class="su-log-text"><span class="su-log-words">${esc(it.now)}</span><span class="sr-only su-log-state">, in progress</span></p>
        ${it.detail ? `<p class="su-log-detail" hidden>${it.detail}</p>` : ''}
        ${it.extra ? `<div class="su-log-extra" hidden>${it.extra}</div>` : ''}
      </div>
    </li>`).join('')}</ol>`;
  function logStep(li, state) {
    if (!li) return;
    li.hidden = false;
    li.classList.toggle('is-now', state === 'now');
    li.classList.toggle('is-done', state === 'done');
    li.querySelector('.su-log-mark').innerHTML = state === 'done' ? icon('check', 12) : '';
    li.querySelector('.su-log-state').textContent = state === 'done' ? ', done' : ', in progress';
    if (state !== 'done') return;
    li.querySelector('.su-log-words').textContent = li.dataset.done;
    li.querySelectorAll('.su-log-detail, .su-log-extra').forEach((el) => { el.hidden = false; el.classList.add('su-in'); });
  }
  /* Each line works for `gap` ms, then shows what it found and the next line starts. onStep(i) runs as line i finishes */
  function runLog(id, gap, onStep, onDone) {
    const list = document.getElementById(id);
    if (!list) return;
    const t = [...list.children];
    t.forEach((li, i) => later(gap * (i + 1), () => {
      logStep(li, 'done');
      if (onStep) onStep(i);
      if (t[i + 1]) logStep(t[i + 1], 'now');
      else if (onDone) onDone();
    }));
  }
  /* A quiet "..." button for a row's menu; it shows on hover and focus */
  const moreBtn = (id, action, arg, label) => `<button type="button" class="btn btn-ghost btn-sm btn-icon su-reveal" id="${id}" data-action="${action}" data-arg="${esc(arg)}" aria-label="${esc(label)}" aria-haspopup="menu" aria-expanded="false">${icon('more', 16)}</button>`;

  /* An Attio card: a header row (icon, title, anything on the right), an optional grey line, then the body */
  function panel({ id, ic, title, hint, body = '', extra = '', cls = '', hid, tag = 'section' }) {
    const h = hid || `su-h-${id}`;
    return `<${tag} class="card card-flush su-card${cls ? ` ${cls}` : ''}"${id ? ` id="su-sec-${id}"` : ''} aria-labelledby="${h}">
      <div class="card-head">${icon(ic, 16)}<h2 id="${h}">${title}</h2>${extra}</div>
      ${hint ? `<p class="su-card-hint"${id ? ` id="su-why-${id}"` : ''}>${hint}</p>` : ''}
      ${body}
    </${tag}>`;
  }
  /* An attribute row: a grey label on the left, the value beside it, an optional action on the right */
  const attr = ({ k, kId, v, act = '', cls = '' }) => `<div class="su-attr${cls ? ` ${cls}` : ''}">
      <h3 class="su-attr-k"${kId ? ` id="${kId}"` : ''}>${k}</h3>
      <div class="su-attr-v">${v}</div>
      ${act ? `<div class="su-attr-act">${act}</div>` : ''}
    </div>`;
  /* A provider's mark on a small white tile, the way Attio shows apps */
  const tile = (ch, size = 18) => `<span class="su-tile" aria-hidden="true">${OB.mark(ch, size)}</span>`;
  /* A big number with grey words beside it */
  const stat = (n, words, { id, wordsId } = {}) => `<p class="su-stat"><span class="su-stat-n num"${id ? ` id="${id}"` : ''}>${n}</span> <span class="t-2"${wordsId ? ` id="${wordsId}"` : ''}>${words}</span></p>`;

  /* ---------- What Onbook understood: proof, clients, and the profile in a few words ---------- */
  const siteProof = (p) => p.source !== 'Added by you';
  const proofOk = (p) => !siteProof(p) || !!S.proofOk[p.id];
  const proofWho = (p) => (p.named ? p.clientName || p.client : p.clientDesc || p.client);
  const cryptoClients = () => S.read.clients.filter((c) => c[1] === 'crypto').length;
  /* The client logos Onbook found, as company tiles: the crypto clients, then the fintech ones */
  function logoStrip() {
    const group = (kind, label) => {
      const list = S.read.clients.filter((c) => c[1] === kind);
      return `<ul class="su-logos-group" role="list" aria-label="${esc(`${label}: ${list.length}`)}">${list.map(([name]) => `<li title="${esc(name)}">${ui.co(name)}<span class="sr-only">${esc(name)}</span></li>`).join('')}</ul>`;
    };
    return `<div class="su-logos">${group('crypto', 'Crypto clients')}${group('fintech', 'Fintech clients')}</div>`;
  }
  /* What decides which companies are on the list. The list remembers what it was built from, so saving the profile
     rebuilds it only when one of these changed (job titles change who is contacted, not which companies) */
  const targetKey = () => JSON.stringify([P.industries, S.sizeSel, P.regions, P.never, P.reasons]);
  const listBuilt = () => S.builtFrom != null;

  /* ---------- The match count: drafted profile = 1,860; choices move it ---------- */
  const W = {
    industries: { 'Fintech apps': 640, 'Exchanges and trading': 380, 'DeFi protocols': 300, Payments: 520, 'Lending and credit': 260, 'Wealth and investing': 240, 'Crypto wallets': 180, Insurance: 150 },
    sizes: { '1 to 10': 0.30, '11 to 50': 0.36, '51 to 200': 0.22, '201 to 500': 0.07, '501 to 1,000': 0.03, 'Over 1,000': 0.02 },
    regions: { 'United States': 0.38, 'United Kingdom': 0.12, 'European Union': 0.20, Singapore: 0.07, 'United Arab Emirates': 0.05, Canada: 0.04, Australia: 0.03, 'Hong Kong': 0.04, Switzerland: 0.02, 'Latin America': 0.05 },
    never: { Agencies: 0.04, 'VCs and funds': 0.03, 'Media and events': 0.02, 'Public companies': 0.02, 'Memecoins and gambling': 0.05 },
  };
  const sumOf = (list, map, other) => list.reduce((n, k) => n + (map[k] != null ? map[k] : other), 0);
  const rawScore = () => sumOf(P.industries, W.industries, 120) * sumOf(S.sizeSel, W.sizes, 0.05) * Math.min(1, sumOf(P.regions, W.regions, 0.02)) * Math.max(0.5, 1 - sumOf(P.never, W.never, 0.02));
  const BASE = rawScore() || 1;
  const BASE_MATCHES = S.matches || 1860;
  const matchCount = () => Math.round((BASE_MATCHES * rawScore()) / BASE / 10) * 10;
  /* Company size is a range of bands: "11 to 200 staff" */
  const SIZE_BANDS = S.options.sizes;
  const BAND = { '1 to 10': [1, 10], '11 to 50': [11, 50], '51 to 200': [51, 200], '201 to 500': [201, 500], '501 to 1,000': [501, 1000], 'Over 1,000': [1001, Infinity] };
  function sizeText(sel) {
    const b = sel.map((x) => BAND[x]).filter(Boolean);
    if (!b.length) return '';
    const lo = Math.min(...b.map((x) => x[0])); const hi = Math.max(...b.map((x) => x[1]));
    if (hi === Infinity) return lo <= 1 ? 'Any size' : `Over ${fmt.num(lo - 1)} staff`;
    return `${fmt.num(lo)} to ${fmt.num(hi)} staff`;
  }
  function sizeRange() {
    const idx = S.sizeSel.map((b) => SIZE_BANDS.indexOf(b)).filter((i) => i >= 0);
    return idx.length ? [Math.min(...idx), Math.max(...idx)] : [1, 2];
  }

  /* ---------- The flow as edited in setup (from the flow area's builder when it is loaded) ---------- */
  const FB = () => OB.flowBuilder || {};
  function flowSteps() {
    try { if (FB().steps) { const st = FB().steps('f1', 'setup'); if (st && st.length) return st; } } catch (err) { console.error(err); }
    return (OB.get.flow('f1') || { steps: [] }).steps;
  }
  function flowSummary(steps) {
    try { if (FB().summary) return FB().summary('f1', 'setup'); } catch (err) { console.error(err); }
    return `${steps.length} steps over 14 days`;
  }
  const stepPhrase = (st) => (st.kind === 'comment' ? `a comment on their latest ${OB.chName(st.ch)} post`
    : st.ch === 'email' ? 'an email' : st.ch === 'x' ? 'an X DM' : st.kind === 'invite' ? 'a LinkedIn invite' : 'a LinkedIn message');
  const dayOf = (step) => { const m = /Day (\d+)/.exec((step && step.when) || ''); return m ? Number(m[1]) : null; };

  /* ---------- Expected reach from what is connected ---------- */
  const PACE = { email: 15, linkedin: 15, x: 10 };
  function reach(c) {
    const first = flowSteps().find((s) => c[s.ch]) || null;
    const pace = first ? PACE[first.ch] : 0;
    return { pace, month: pace * 22, first: first ? first.ch : null };
  }
  /* Channels the flow uses that are not connected, so their steps are skipped */
  const skippedChs = (c) => ['linkedin', 'x', 'email'].filter((ch) => !c[ch] && flowSteps().some((s) => s.ch === ch));

  /* ======================================================================
     1 Website and sign-up
     ====================================================================== */
  function siteError(v) {
    const t = String(v || '').trim();
    if (!t) return 'Enter your company website, like tideline.studio.';
    if (/\s/.test(t)) return 'Web addresses have no spaces. Enter it like tideline.studio.';
    const bare = t.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    if (bare.indexOf('.') < 1 || /\.$/.test(bare)) return `Add the ending to your address, like ${bare.replace(/\.$/, '') || 'tideline'}.com.`;
    return '';
  }
  const cleanSite = (v) => String(v || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');

  OB.route('setup-website', (params) => {
    if (entering()) {
      if (params[0] === 'error') Object.assign(OB.state.ui, { setupSite: 'tideline', setupSiteErr: siteError('tideline') });
      else Object.assign(OB.state.ui, { setupSite: site(), setupSiteErr: '' });
    }
    const val = OB.ui$('setupSite', site());
    const err = OB.ui$('setupSiteErr', '');
    const next = [
      ['Company profile', 'Onbook reads your site and fills in your profile.'],
      ['Companies', 'It checks over 30,000 companies and shows you 10 that fit.'],
      ['Accounts and flow', 'Connect your accounts. Onbook has the plan ready.'],
      ['Launch', 'Subscribe, and the first messages go out that day.'],
    ];
    return {
      shell: 'setup', step: 1, saved: false, title: 'Website and sign-up',
      html: `
        ${ui.pageHead({ title: 'Start with your website', sub: 'Onbook drafts your company profile from it, then finds companies that need what you sell.' })}
        <div class="su-split">
          <div class="su-main stack gap-4">
            <section class="card su-signup" aria-label="Sign up">
              <form class="su-signup-form" data-submit="setup-site-submit" novalidate>
                <div class="su-site">
                  ${ui.field({ id: 'su-site', label: 'Your company website', value: val, prefix: 'https://', error: err || undefined, extra: 'name="site" data-input="setup-site-input" inputmode="url" autocomplete="url" autocapitalize="off" spellcheck="false"' })}
                </div>
                <div class="su-providers" role="group" aria-label="Sign up to continue">
                  <button type="button" class="btn btn-primary btn-block" id="su-signup-google" data-action="setup-signup" data-arg="google">${OB.mark('google', 16)}<span>Continue with Google</span></button>
                  <button type="button" class="btn btn-secondary btn-block" id="su-signup-microsoft" data-action="setup-signup" data-arg="microsoft">${OB.mark('microsoft', 16)}<span>Continue with Microsoft</span></button>
                  <button type="button" class="btn btn-secondary btn-block" id="su-signup-email" data-action="setup-signup" data-arg="email">${icon('mail', 16)}<span>Email me a link</span></button>
                </div>
                <p class="t-small t-2">Onbook reads your site while you sign up, and asks only for your name and email. Inbox access comes later.</p>
              </form>
            </section>
            <p class="t-small t-2">Already have an account? <a href="#login">Log in</a></p>
          </div>
          <aside class="su-aside" aria-labelledby="su-next-h">
            <div class="card card-flush su-card">
              <div class="card-head">${icon('clock', 16)}<h2 id="su-next-h">The next 10 minutes</h2></div>
              <ol class="su-rows su-next-list">
                ${next.map(([t, d], i) => `<li><span class="su-num num" aria-hidden="true">${i + 2}</span><span class="su-next-text"><span>${t}</span><span class="t-small t-2">${d}</span></span></li>`).join('')}
              </ol>
              <p class="su-card-foot"><span class="t-ink">Free until you launch,</span> and nothing is sent before then. After that, ${fmt.money(D.plan.price)} a month with ${fmt.num(D.plan.allowance)} credits a month. Cancel any time.</p>
            </div>
          </aside>
        </div>`,
    };
  });

  OB.action('setup-site-input', (el, e, v) => { OB.state.ui.setupSite = v; });
  function checkSite() {
    const v = OB.ui$('setupSite', site());
    const err = siteError(v);
    if (err) {
      OB.set({ setupSiteErr: err });
      focusEl('su-site');
      return false;
    }
    OB.state.ui.setupSiteErr = '';
    OB.state.ui.siteUrl = cleanSite(v);
    return true;
  }
  OB.action('setup-site-submit', () => { if (checkSite()) { OB.render({ keepScroll: true }); focusEl('su-signup-google'); announce('Address saved. Choose how to sign up.'); } });
  OB.action('setup-signup', () => { if (checkSite()) OB.go('setup-reading'); });

  /* ======================================================================
     2 Reading the website: the work as it happens, in plain words, then what Onbook understood
     ====================================================================== */
  OB.route('setup-reading', (params) => {
    if (params[0] === 'error') return readingError();
    if (entering()) OB.state.ui.setupFrom = 'site';
    const s = site();
    const R = S.read;
    const found = P.proof.filter(siteProof);
    const items = [
      { now: `Reading ${s}`, done: `Read ${R.pages} pages on ${s}` },
      { now: 'Looking for your clients and case studies', done: `Found ${R.clients.length} client logos and ${R.caseStudies} case studies`, extra: logoStrip() },
      { now: 'Working out who you sell to', done: `${cryptoClients()} of the ${R.clients.length} clients are crypto companies`, detail: 'So Onbook favours crypto and fintech.' },
      { now: 'Looking for results you can quote', done: found.length ? `Found ${OB.plural(found.length, 'result')} you can quote` : 'Found no results to quote yet', detail: found.length ? esc(`In the ${andList(found.map(proofWho))} case studies.`) : 'You can add one in your profile.' },
      { now: 'Drafting your profile', done: 'Your profile is ready' },
    ];
    return {
      shell: 'setup', step: 2, narrow: true, title: 'Reading your website',
      html: `
        ${ui.pageHead({ title: `Reading ${esc(s)}`, sub: 'Onbook drafts your company profile from it. You check it next.' })}
        <section class="card su-log-card" aria-label="What Onbook is doing">${workLog('su-read-log', items)}</section>`,
      foot: foot({ note: '<span id="su-read-note">Nothing is sent until you launch.</span>', primary: ui.btn({ label: 'Continue', kind: 'primary', href: '#setup-profile', id: 'su-read-go' }) }),
      after: startReading,
    };
  });

  function startReading() {
    clearTimers();
    const r = reduced();
    runLog('su-read-log', r ? 450 : 700, null, () => {
      const n = document.getElementById('su-read-note'); if (n) n.textContent = 'Your profile is ready. Nothing is sent until you launch.';
      announce(`Your profile is ready.${r ? ' Choose Continue to check it.' : ''}`);
      if (!r) later(1100, () => { if (OB.parseHash().name === 'setup-reading') OB.go('setup-profile'); });
    });
  }

  function readingError() {
    const bad = OB.ui$('setupBadSite', 'tideline.studoi');
    return {
      shell: 'setup', step: 2, narrow: true, title: 'Website could not be opened',
      html: `
        ${ui.pageHead({ title: `We could not open ${esc(bad)}`, sub: 'You are signed up and nothing is lost. Check the address and try again.' })}
        <div class="stack gap-4">
          <section class="card su-signup" aria-label="Your website">
            <form id="su-retry-form" class="su-site" data-submit="setup-retry" novalidate>
              ${ui.field({ id: 'su-retry', label: 'Your company website', value: bad, prefix: 'https://', error: `${bad} did not load. Check the spelling, or try it with www. in front.`, extra: 'name="site" data-input="setup-retry-input" inputmode="url" autocomplete="url" autocapitalize="off" spellcheck="false"' })}
            </form>
          </section>
          <p class="t-small t-2">No website, or it says very little? <a href="#setup-questions">Answer five questions instead</a></p>
        </div>`,
      foot: foot({ note: 'Nothing is sent until you launch.', primary: ui.btn({ label: 'Try again', kind: 'primary', type: 'submit', extra: 'form="su-retry-form"' }) }),
    };
  }
  OB.action('setup-retry-input', (el, e, v) => { OB.state.ui.setupBadSite = v; });
  OB.action('setup-retry', (f, e, data) => {
    const v = data.site;
    if (siteError(v)) { OB.state.ui.setupBadSite = v; OB.render({ keepScroll: true }); focusEl('su-retry'); return; }
    OB.state.ui.siteUrl = cleanSite(v) === 'tideline.studoi' ? S.site : cleanSite(v);
    OB.go('setup-reading');
  });

  /* ======================================================================
     2 Company profile
     ====================================================================== */
  const SEL = { titles: () => P.titles, industries: () => P.industries, sizes: () => S.sizeSel, regions: () => P.regions, never: () => P.never, reasons: () => P.reasons };
  const SETSEL = {
    titles: (v) => { P.titles = v; },
    industries: (v) => { P.industries = v; },
    sizes: (v) => { S.sizeSel = v; P.sizes = sizeText(v) || P.sizes; },
    regions: (v) => { P.regions = v; },
    never: (v) => { P.never = v; },
    reasons: (v) => { P.reasons = v; },
  };
  const ADD_LABEL = { titles: 'Add a job title', industries: 'Add an industry', regions: 'Add a region', never: 'Add a kind of company', reasons: 'Add a reason' };
  const ADD_HINT = { titles: 'For example, VP Marketing', industries: 'For example, Neobanks', regions: 'For example, Brazil', never: 'For example, Consultancies', reasons: 'For example, Won an award' };
  const SUGGEST_NAME = { titles: 'Suggested job titles', industries: 'Suggested industries', regions: 'Suggested regions', never: 'Kinds of company to leave out', reasons: 'Suggested reasons' };
  const SUGGEST_MAX = 3;
  const vIdx = (group, v) => S.chipAll[group].indexOf(v);
  const tokId = (group, v) => `su-tok-${group}-${vIdx(group, v)}`;
  const sugId = (group, v) => `su-sug-${group}-${vIdx(group, v)}`;
  /* What a token group shows: the chosen values, then a few suggestions from the rest */
  function groupState(group) {
    const all = S.chipAll[group];
    const sel = SEL[group]();
    const on = (v) => sel.some((x) => x.toLowerCase() === v.toLowerCase());
    const chosen = all.filter(on);
    const rest = all.filter((v) => !on(v));
    return { chosen, rest, sugg: rest.slice(0, SUGGEST_MAX) };
  }
  /* Where focus goes when a group has an error: its first token, suggestion or Add */
  function groupFocusId(group) {
    if (group === 'sizes') return 'su-size-lo';
    const g = groupState(group);
    if (g.chosen.length) return tokId(group, g.chosen[0]);
    if (g.sugg.length) return sugId(group, g.sugg[0]);
    return `su-add-${group}`;
  }

  function profileErrors() {
    const e = {};
    if (!String(P.sell || '').trim()) e.sell = 'Say what you sell in a sentence or two, so Onbook can find companies that need it.';
    if (!P.industries.length) e.industries = 'Choose at least one industry, or add your own.';
    if (!P.regions.length) e.regions = 'Choose at least one region.';
    if (!P.titles.length) e.titles = 'Add at least one job title, so Onbook knows who to contact.';
    if (!String(S.offerDraft || '').trim()) e.offer = 'Write what you offer the people Onbook contacts, so messages have a reason to reply.';
    return e;
  }
  const errOf = (key) => (OB.state.ui.setupProfErr || {})[key];
  const errLine = (key) => (errOf(key) ? `<p class="field-error" id="su-err-${key}">${icon('alert', 16)}<span>${esc(errOf(key))}</span></p>` : '');

  /* A textarea labelled by its card's title */
  function textBox(key) {
    const err = errOf(key);
    return `<div class="su-card-body"><textarea class="textarea su-auto" id="su-f-${key}" rows="${rowsFor(P[key])}" data-input="setup-prof-text" data-key="${key}" aria-labelledby="su-h-${key}" aria-describedby="su-why-${key}${err ? ` su-err-${key}` : ''}"${err ? ' aria-invalid="true"' : ''}>${esc(P[key] || '')}</textarea>${errLine(key)}</div>`;
  }
  /* A textarea with its own label, for sections that hold two */
  function textField(key, label, hint, { rows, lock } = {}) {
    const id = `su-f-${key}`;
    return `<div class="field">
      <label class="label${lock ? ' su-lock' : ''}" for="${id}">${lock ? icon('lock', 14) : ''}${esc(label)}</label>
      <span class="hint" id="${id}-hint">${hint}</span>
      <textarea class="textarea su-auto" id="${id}" rows="${rows || rowsFor(P[key])}" data-input="setup-prof-text" data-key="${key}" aria-describedby="${id}-hint">${esc(P[key] || '')}</textarea>
    </div>`;
  }

  /* Chosen values as grey tokens, then up to three suggestions and Add. h is the id of the heading that names them */
  function tokens(group, h) {
    const { chosen, rest, sugg } = groupState(group);
    const adding = OB.ui$('setupAdding', null) === group;
    const err = errOf(group);
    const toks = chosen.map((v) => `<li class="su-token">${esc(v)}<button type="button" class="su-token-x" id="${tokId(group, v)}" data-action="setup-chip" data-arg="${esc(`${group}|${v}`)}" aria-label="Remove ${esc(v)}">${icon('x', 14)}</button></li>`).join('');
    const more = adding
      ? `<form class="su-add" data-submit="setup-chip-add" data-group="${group}">
          <label class="sr-only" for="su-add-${group}-input">${esc(ADD_LABEL[group])}</label>
          <input class="input" id="su-add-${group}-input" name="value" autocomplete="off" placeholder="${esc(ADD_HINT[group])}" data-cancel="setup-chip-add-cancel"${rest.length ? ` list="su-dl-${group}"` : ''}>
          ${rest.length ? `<datalist id="su-dl-${group}">${rest.map((v) => `<option value="${esc(v)}"></option>`).join('')}</datalist>` : ''}
          <button type="submit" class="btn btn-secondary btn-sm">Add</button>
          <button type="button" class="btn btn-ghost btn-sm" data-action="setup-chip-add-cancel">Cancel</button>
        </form>`
      : `<div class="su-suggests" role="group" aria-label="${esc(SUGGEST_NAME[group])}">
          ${sugg.map((v) => `<button type="button" class="su-suggest" id="${sugId(group, v)}" data-action="setup-chip" data-arg="${esc(`${group}|${v}`)}" aria-label="Add ${esc(v)}">${icon('plus', 13)}${esc(v)}</button>`).join('')}
          <button type="button" class="su-suggest su-suggest-add" id="su-add-${group}" data-action="setup-chip-adding" data-arg="${group}">${icon('plus', 13)}${esc(ADD_LABEL[group])}${rest.length > sugg.length ? '&hellip;' : ''}</button>
        </div>`;
    return `${chosen.length ? `<ul class="su-tokens" role="list" aria-labelledby="${h}"${err ? ` aria-describedby="su-err-${group}"` : ''}>${toks}</ul>` : ''}${more}`;
  }
  /* A token group as an attribute row: the label on the left, the tokens beside it */
  function tokenRow(group, label, hint) {
    const h = `su-h-${group}`;
    return attr({ k: esc(label), kId: h, cls: 'su-attr-tokens', v: `${tokens(group, h)}${hint ? `<p class="su-attr-hint">${hint}</p>` : ''}${errLine(group)}` });
  }

  /* Company size: two selects, from and to */
  function sizeRow() {
    const [lo, hi] = sizeRange();
    const los = ['1', '11', '51', '201', '501', '1,001'];
    const his = ['10', '50', '200', '500', '1,000', 'No limit'];
    const opts = (list, cur) => list.map((t, i) => `<option value="${i}"${i === cur ? ' selected' : ''}>${t}</option>`).join('');
    return attr({
      k: 'Company size', kId: 'su-h-sizes', cls: 'su-attr-ctl',
      v: `<div class="su-size" role="group" aria-labelledby="su-h-sizes">
          <label class="sr-only" for="su-size-lo">From, in staff</label>
          <select class="select" id="su-size-lo" data-change="setup-size" data-end="lo">${opts(los, lo)}</select>
          <span class="t-2">to</span>
          <label class="sr-only" for="su-size-hi">To, in staff</label>
          <select class="select" id="su-size-hi" data-change="setup-size" data-end="hi">${opts(his, hi)}</select>
          <span class="t-2">staff</span>
        </div>
        <p class="su-attr-hint">Optional. Leave it at any size unless you only work with some.</p>`,
    });
  }

  function proofRow(p, i) {
    const who = proofWho(p);
    const ok = proofOk(p);
    const source = !siteProof(p) ? `Added by you on ${esc(fmt.short(p.found))}` : `${ok ? 'From' : 'Found on'} ${esc(p.source)}, ${esc(monthYear(p.found))}`;
    const check = ok ? '' : `<div class="su-proof-check">
        ${ui.tag('blue', 'Needs you')}
        <p class="t-small t-2 su-proof-why"><span class="t-ink">${p.stale ? 'Over a year old.' : 'Read from your website.'}</span> Onbook never uses it until you confirm it is still true.</p>
        ${ui.btn({ label: "Confirm it's still true", size: 's', action: 'setup-proof-confirm', arg: p.id, id: `su-pc-${p.id}` })}
      </div>`;
    return `<li class="su-proof su-row" id="su-proof-${p.id}" tabindex="-1">
      <div class="su-proof-main">
        <p class="su-quote"><span class="su-quote-who">${esc(who)}:</span> &ldquo;${esc(p.result)}&rdquo;</p>
        <p class="su-meta">Used for ${esc(String(p.segment || '').toLowerCase())}${DOT}${source}${p.confirmedOn ? `${DOT}Confirmed by you today` : ''}</p>
        ${check}
      </div>
      ${moreBtn(`su-pm-${p.id}`, 'setup-proof-menu', p.id, `Proof point ${i + 1}: edit, name or describe the client, or remove`)}
    </li>`;
  }

  /* Clients and partners to never contact: tokens, then Add and Import */
  function clientsField() {
    const never = ownNever();
    const imp = S.neverImport;
    const adding = OB.ui$('setupAdding', null) === 'clients';
    const toks = never.map((n) => `<li class="su-token">${esc(n.value)}<button type="button" class="su-token-x" id="su-nx-${n.id}" data-action="setup-never-remove" data-arg="${n.id}" aria-label="Remove ${esc(n.value)} from never contact">${icon('x', 14)}</button></li>`).join('')
      + (imp ? `<li class="su-token">${fmt.num(imp.count)} from ${esc(imp.file)}<button type="button" class="su-token-x" id="su-nx-import" data-action="setup-never-unimport" aria-label="Remove the ${fmt.num(imp.count)} companies imported from ${esc(imp.file)}">${icon('x', 14)}</button></li>` : '');
    const more = adding
      ? `<form class="su-add" data-submit="setup-never-add">
          <label class="sr-only" for="su-never-new">Add a client or partner</label>
          <input class="input" id="su-never-new" name="company" autocomplete="off" placeholder="A company name or website" data-cancel="setup-chip-add-cancel">
          <button type="submit" class="btn btn-secondary btn-sm">Add</button>
          <button type="button" class="btn btn-ghost btn-sm" data-action="setup-chip-add-cancel">Done</button>
        </form>`
      : `<div class="su-suggests">
          <button type="button" class="su-suggest su-suggest-add" id="su-add-clients" data-action="setup-chip-adding" data-arg="clients">${icon('plus', 13)}Add a company</button>
          <button type="button" class="su-suggest" id="su-never-import" data-action="setup-never-import">${icon('upload', 13)}Import a CSV</button>
        </div>`;
    return `<div class="su-card-body">
      ${toks ? `<ul class="su-tokens" role="list" aria-label="Companies Onbook never contacts">${toks}</ul>` : ''}
      ${more}
    </div>`;
  }

  /* The widget beside the profile: what is left before Onbook builds the list. No match count: a fixed number of
     matching companies reads as a ceiling, and Onbook keeps finding more like them (Julian, 17 Oct) */
  function profilePanel() {
    const todo = P.proof.filter((p) => !proofOk(p));
    const checks = [];
    if (!String(S.offerDraft || '').trim()) checks.push(['Write your offer', 'What you offer the people Onbook contacts. Only you can say this.', 'su-f-offer', 'Write it']);
    if (todo.length) checks.push([`${OB.plural(todo.length, 'result')} to confirm`, 'Onbook quotes a result only after you confirm it is true.', `su-proof-${todo[0].id}`, `Check ${todo.length === 1 ? 'it' : 'them'}`]);
    return `<aside class="su-aside su-profile-aside" aria-labelledby="su-panel-h">
      <div class="card card-flush su-card">
        <div class="card-head">${icon('list', 16)}<h2 id="su-panel-h">${checks.length ? 'Before you continue' : 'Ready to continue'}</h2></div>
        ${checks.length ? checks.map(([t, d, target, go]) => `<div class="su-check">
          <span class="dot dot-needs" aria-hidden="true"></span>
          <div class="su-check-text">
            <p class="t-small t-medium">${esc(t)}</p>
            <p class="t-small t-2">${esc(d)}</p>
          </div>
          <button type="button" class="su-edit su-check-link" data-action="setup-jump" data-arg="${target}">${esc(go)}</button>
        </div>`).join('') : `<div class="su-card-body"><p class="t-small t-2">Next, Onbook checks ${checkedWords()} companies against this profile and shows you 10 that fit.</p></div>`}
      </div>
    </aside>`;
  }

  /* ---------- The company profile, one structure everywhere (spec section 4, Proposed 17 Oct) ----------
     Every profile has the same six parts, in this order, each at a fixed level of detail: what you sell (one sentence),
     who you sell to (kinds of company, as tags), where they are (regions, as tags), who to contact (roles, as tags),
     proof points (client and result, each confirmed), your offer (one sentence the customer writes). Setup and Settings
     show these six the same way; everything else sits under "More about you". Example companies are step 3 */
  const OFFER_EG = 'For example: a free 20-minute launch strategy workshop, or a guest spot on our podcast.';
  const OFFER_TIP = 'Offer something useful, not a sales call. People who feel sold to don\'t reply. A guest spot on your podcast or a free short workshop gets far more yeses than "a quick call to discuss".';
  /* The offer box. The label is the heading or row name with id su-k-offer */
  function offerField() {
    const err = errOf('offer');
    const open = !!OB.ui$('setupOfferTip', false);
    return `<textarea class="textarea su-auto su-offer-box" id="su-f-offer" rows="${rowsFor(S.offerDraft, 70)}" placeholder="${esc(OFFER_EG)}" data-input="setup-offer" aria-labelledby="su-k-offer" aria-describedby="su-offer-tip${err ? ' su-err-offer' : ''}" aria-required="true"${err ? ' aria-invalid="true"' : ''}>${esc(S.offerDraft)}</textarea>
      ${errLine('offer')}
      <button type="button" class="su-tip-btn" id="su-offer-tip-btn" data-action="setup-offer-tip" aria-expanded="${open}" aria-controls="su-offer-tip">${icon('info', 14)}<span>What makes a good offer</span></button>
      <p class="su-tip" id="su-offer-tip"${open ? '' : ' hidden'}>${esc(OFFER_TIP)}</p>`;
  }
  /* Step 2 is one page: what Onbook understood, already filled in and editable, then "Save and continue". No summary
     and no separate Change page (Julian, 17 Oct). #setup-profile.edit still opens it, for old links */
  OB.route('setup-profile', (params) => {
    if (entering() && params[0] !== 'edit') OB.state.ui.setupProfErr = params[0] === 'no-offer' ? { offer: profileErrors().offer || 'Write what you offer the people Onbook contacts, so messages have a reason to reply.' } : null;
    return profileEditor();
  });

  OB.action('setup-offer', (el, e, v) => {
    const was = !!String(S.offerDraft || '').trim();
    S.offerDraft = v;
    const now = !!String(v).trim();
    if (now && errOf('offer')) { recheck(); OB.render({ keepScroll: true }); return; }
    /* The editor's checklist beside the profile changes when the offer goes from empty to written */
    if (was !== now && OB.parseHash().params[0] === 'edit') OB.render({ keepScroll: true });
  });
  OB.action('setup-offer-tip', () => { OB.set({ setupOfferTip: !OB.ui$('setupOfferTip', false) }); focusEl('su-offer-tip-btn'); });
  /* The full profile: every field, the live match count and the proof checks. Saving builds the list, or rebuilds it
     when who you sell to has changed since it was built (one of the rebuilds before launch) */
  function profileEditor() {
    const R = S.read;
    const from = OB.ui$('setupFrom', 'site');
    const sub = from === 'answers' ? 'Drafted from your answers to the five questions. Change anything, then continue.'
      : from === 'paste' ? 'Drafted from the document you pasted. Change anything, then continue.'
        : `Read from ${esc(site())}: ${R.pages} pages, ${R.clients.length} client logos and ${R.caseStudies} case studies. Change anything, then continue.`;
    const more = !!OB.ui$('setupMore', false);
    const html = `
      ${ui.pageHead({ title: 'Here\'s what Onbook understood', sub, actions: ui.btn({ label: 'Answer five questions instead', kind: 'ghost', size: 's', href: '#setup-questions' }) })}
      <div class="su-split su-profile">
        ${profilePanel()}
        <div class="su-main su-cards">
          ${panel({ id: 'sell', ic: 'building', title: 'What you sell', hint: 'One sentence. Used to find companies that need it, and to say what you do.', body: textBox('sell') })}
          ${panel({
            id: 'who', ic: 'target', title: 'Who you sell to',
            body: `<div class="su-attrs">
              ${tokenRow('industries', 'Kinds of company')}
              ${tokenRow('regions', 'Where they are')}
            </div>`,
          })}
          ${panel({ id: 'contact', ic: 'user', title: 'Who to contact', body: `<div class="su-attrs">${tokenRow('titles', 'Roles', 'At each company, Onbook finds the people who best match these roles.')}</div>` })}
          ${panel({
            id: 'proof', ic: 'sparkline', title: 'Proof points',
            hint: 'Messages quote one at a time, word for word, with its numbers unchanged. Onbook only uses proof you have confirmed.',
            extra: `<button type="button" class="su-head-btn" id="su-proof-add" data-action="setup-proof-add">${icon('plus', 14)}<span>Add a proof point</span></button>`,
            body: P.proof.length ? `<ul class="su-rows su-proofs" role="list">${P.proof.map(proofRow).join('')}</ul>` : '<p class="su-card-body t-2">No proof points yet. Add a result you can quote, so messages have something to show.</p>',
          })}
          ${panel({ id: 'offer', hid: 'su-k-offer', ic: 'message', title: 'Your offer', hint: 'One sentence: what you give the people Onbook contacts for saying yes. Later messages offer it beside your booking link.', body: `<div class="su-card-body su-offer-body">${offerField()}</div>` })}
          <button type="button" class="su-more-btn" id="su-more" data-action="setup-more" aria-expanded="${more}" aria-controls="su-more-cards">${icon(more ? 'chevron-up' : 'chevron-down', 16)}<span>More about you</span><span class="t-2">Optional: your voice, the news to look for, kinds of company to leave out</span></button>
          <div class="su-cards" id="su-more-cards"${more ? '' : ' hidden'}>
            ${panel({ id: 'voice', ic: 'edit', title: 'How you sound', hint: 'Every message is written in this voice, and checked against it before it sends.', body: textBox('voice') })}
            ${panel({ id: 'reasons', ic: 'zap', title: 'Reasons to reach out now', hint: 'Onbook looks for these in each company\'s news from the last 30 days, and ranks fresh news first.', body: `<div class="su-card-body">${tokens('reasons', 'su-h-reasons')}</div>` })}
            ${panel({
              id: 'filters', ic: 'filter', title: 'Leave out',
              body: `<div class="su-attrs">
                ${tokenRow('never', 'Kinds of company', 'Never contacted, whatever else matches.')}
                ${sizeRow()}
              </div>`,
            })}
            ${panel({ id: 'notes', ic: 'edit', title: 'Notes for Onbook', body: `<div class="su-card-body su-fields">
                ${textField('extra', 'Anything else we should know', 'Shapes who Onbook picks and what it writes about. Never quoted.')}
                ${textField('privateNotes', 'Pricing and private notes', 'Never used in messages, and never shown to anyone you contact.', { rows: 2, lock: true })}
              </div>` })}
          </div>
        </div>
      </div>`;
    return {
      shell: 'setup', step: 2, title: 'Company profile',
      html,
      foot: foot({ note: 'Nothing is sent until you launch.', back: 'setup-website', primary: ui.btn({ label: 'Save and continue', kind: 'primary', action: 'setup-profile-save', id: 'su-profile-save' }) }),
    };
  }
  OB.action('setup-more', () => { OB.set({ setupMore: !OB.ui$('setupMore', false) }); focusEl('su-more'); });

  /* The profile as written in setup becomes the account's: the offer the customer wrote */
  function commitProfile() { P.offer = String(S.offerDraft || '').trim(); }

  /* After "Save and continue": find the examples, or go back to them if who you sell to has not changed */
  function proceedFromProfile() {
    if (listBuilt() && S.builtFrom === targetKey()) { OB.go('setup-list'); return; }
    S.matches = matchCount(); P.matches = S.matches;
    OB.go(listBuilt() ? 'setup-list-building.rebuild' : 'setup-list-building');
  }

  const recheck = () => { if (OB.state.ui.setupProfErr) OB.state.ui.setupProfErr = profileErrors(); };

  OB.action('setup-prof-text', (el, e, v) => {
    P[el.dataset.key] = v;
    if (el.dataset.key === 'sell' && errOf('sell') && v.trim()) { recheck(); OB.render({ keepScroll: true }); }
  });
  /* Remove a token, or add a suggestion; focus stays at the same place in the group */
  OB.action('setup-chip', (el, e, arg) => {
    const i = arg.indexOf('|');
    const group = arg.slice(0, i); const v = arg.slice(i + 1);
    const before = groupState(group);
    const sel = SEL[group]();
    const on = sel.some((x) => x.toLowerCase() === v.toLowerCase());
    const next = on ? sel.filter((x) => x.toLowerCase() !== v.toLowerCase()) : S.chipAll[group].filter((x) => x === v || sel.some((y) => y.toLowerCase() === x.toLowerCase()));
    SETSEL[group](next);
    recheck();
    OB.render({ keepScroll: true });
    const after = groupState(group);
    let target;
    if (on) {
      const k = before.chosen.indexOf(v);
      const nv = after.chosen[k] || after.chosen[k - 1];
      target = nv ? tokId(group, nv) : groupFocusId(group);
    } else {
      const k = before.sugg.indexOf(v);
      const nv = after.sugg[k] || after.sugg[k - 1];
      target = nv ? sugId(group, nv) : `su-add-${group}`;
    }
    focusEl(target);
    announce(`${v} ${on ? 'removed' : 'added'}.`);
  });
  OB.action('setup-chip-adding', (el, e, group) => { OB.set({ setupAdding: group }); focusEl(group === 'clients' ? 'su-never-new' : `su-add-${group}-input`); });
  OB.action('setup-chip-add-cancel', () => { const g = OB.ui$('setupAdding', null); OB.set({ setupAdding: null }); if (g) focusEl(`su-add-${g}`); });
  OB.action('setup-chip-add', (f, e, data) => {
    const group = f.dataset.group;
    const v = String(data.value || '').trim().replace(/\s+/g, ' ');
    if (!v) { focusEl(`su-add-${group}-input`); return; }
    const all = S.chipAll[group];
    let idx = all.findIndex((x) => x.toLowerCase() === v.toLowerCase());
    if (idx < 0) { all.push(v); idx = all.length - 1; }
    const name = all[idx];
    if (!SEL[group]().some((x) => x.toLowerCase() === name.toLowerCase())) SETSEL[group](all.filter((x) => x === name || SEL[group]().indexOf(x) >= 0));
    recheck();
    OB.set({ setupAdding: null });
    focusEl(`su-add-${group}`);
    announce(`Added ${name}.`);
  });
  OB.action('setup-size', (el, e, v) => {
    let [lo, hi] = sizeRange();
    const i = Number(v);
    if (el.dataset.end === 'lo') { lo = i; if (hi < lo) hi = lo; } else { hi = i; if (lo > hi) lo = hi; }
    SETSEL.sizes(SIZE_BANDS.slice(lo, hi + 1));
    recheck();
    OB.render({ keepScroll: true });
    announce(`${sizeText(S.sizeSel)}.`);
  });
  /* Escape inside an inline add field cancels it */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const t = e.target;
    if (t && t.dataset && t.dataset.cancel && OB.actions[t.dataset.cancel] && !document.getElementById('overlay').innerHTML) { e.preventDefault(); OB.actions[t.dataset.cancel](t, e); }
  });

  /* Titles: in the "Change who we contact" dialog, from the profile and the leads list */
  function titlesChanged(el, focusId, msg) {
    recheck();
    const box = el.closest('#overlay .dialog');
    if (box) { box.innerHTML = whoDialogHtml(); }
    else OB.render({ keepScroll: true });
    if (focusId) focusEl(focusId);
    if (msg) announce(msg);
  }
  const titlePx = (el) => (el.closest('#overlay .dialog') ? 'su-wt' : 'su-t');
  OB.action('setup-title-move', (el, e, arg) => {
    if (el.getAttribute('aria-disabled') === 'true') return;
    const [is, dir] = arg.split('|'); const i = Number(is);
    const j = dir === 'up' ? i - 1 : i + 1;
    const t = P.titles;
    if (j < 0 || j >= t.length) return;
    [t[i], t[j]] = [t[j], t[i]];
    titlesChanged(el, `${titlePx(el)}-${dir}-${j}`, `${t[j]} moved to number ${j + 1} of ${t.length}.`);
  });
  OB.action('setup-title-remove', (el, e, is) => {
    const i = Number(is);
    const px = titlePx(el);
    const [name] = P.titles.splice(i, 1);
    const n = P.titles.length;
    titlesChanged(el, n ? `${px}-rm-${Math.min(i, n - 1)}` : `${px}-new`, `Removed ${name}.`);
  });
  OB.action('setup-title-add', (f, e, data) => {
    const v = String(data.title || '').trim().replace(/\s+/g, ' ');
    const px = f.closest('#overlay .dialog') ? 'su-wt' : 'su-t';
    if (!v) { focusEl(`${px}-new`); return; }
    if (P.titles.some((x) => x.toLowerCase() === v.toLowerCase())) { announce(`${v} is already on the list.`); focusEl(`${px}-new`); return; }
    P.titles.push(v);
    titlesChanged(f, `${px}-new`, `Added ${v}, number ${P.titles.length}.`);
  });

  /* Proof points. The editor has a menu per proof (#su-pm-), the overview Edit and Delete (#su-pe-, #su-pd-) */
  const focusProof = (id) => { const t = id && ['su-pm-', 'su-pe-'].map((x) => document.getElementById(`${x}${id}`)).find(Boolean); if (t) t.focus(); else focusEl('su-proof-add'); };
  OB.action('setup-jump', (el, e, id) => {
    const t = document.getElementById(id);
    if (!t) return;
    t.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
    t.focus({ preventScroll: true });
  });
  OB.action('setup-proof-menu', (el, e, id) => {
    const p = OB.get.proof(id);
    if (!p) return;
    OB.menu(el, [
      { label: 'Edit', icon: 'edit', action: 'setup-proof-edit', arg: id },
      { label: p.named ? 'Describe the client instead' : 'Name the client instead', icon: 'user', action: 'setup-proof-named', arg: `${id}|${p.named ? 'describe' : 'name'}` },
      { sep: true },
      { label: 'Remove', icon: 'trash', action: 'setup-proof-remove', arg: id, danger: true },
    ]);
  });
  OB.action('setup-proof-named', (el, e, arg) => {
    const [id, how] = arg.split('|');
    const p = OB.get.proof(id);
    if (!p) return;
    if (how === 'name' && !p.clientName) { openProof(p, { named: true }); return; }
    p.named = how === 'name';
    p.client = p.named ? p.clientName : p.clientDesc;
    OB.render({ keepScroll: true });
    focusEl(`su-pm-${id}`);
    announce(p.named ? `Messages name ${p.client}.` : `Messages describe the client as ${p.client}.`);
  });
  /* Used on what Onbook understood and in the full profile: both draw the proof as #su-proof-<id> with #su-pc-<id> */
  OB.action('setup-proof-confirm', (el, e, id) => {
    const p = OB.get.proof(id);
    if (!p) return;
    const was = { confirmed: p.confirmed, stale: p.stale, confirmedOn: p.confirmedOn };
    const wasOk = !!S.proofOk[id];
    Object.assign(p, { confirmed: true, stale: false, confirmedOn: TODAY });
    S.proofOk[id] = true;
    OB.render({ keepScroll: true });
    focusEl(`su-proof-${id}`);
    OB.toast('Proof point confirmed', { undo: () => { Object.assign(p, was); if (!wasOk) delete S.proofOk[id]; OB.render({ keepScroll: true }); focusEl(`su-pc-${id}`); } });
  });
  OB.action('setup-proof-remove', (el, e, id) => {
    const i = P.proof.findIndex((p) => p.id === id);
    if (i < 0) return;
    const [p] = P.proof.splice(i, 1);
    OB.render({ keepScroll: true });
    focusProof(P.proof[i] ? P.proof[i].id : null);
    OB.toast('Proof point removed', { undo: () => { P.proof.splice(i, 0, p); OB.render({ keepScroll: true }); focusProof(p.id); } });
  });
  OB.action('setup-proof-add', () => openProof(null));
  OB.action('setup-proof-edit', (el, e, id) => openProof(OB.get.proof(id)));

  let proofDraft = null;
  function openProof(p, over = {}) {
    proofDraft = {
      id: p ? p.id : null,
      result: p ? p.result : '',
      named: over.named != null ? over.named : p ? p.named : true,
      name: p ? p.clientName || '' : '',
      desc: p ? p.clientDesc || '' : '',
      segment: p ? p.segment : P.industries[0] || 'Fintech apps',
      source: p && p.source !== 'Added by you' ? p.source : '',
      errs: {},
    };
    OB.dialog(proofHtml(), { label: p ? 'Edit proof point' : 'Add a proof point', onClose: () => { proofDraft = null; } });
  }
  function proofHtml() {
    const d = proofDraft;
    const segs = uniq(P.industries.concat(d.segment ? [d.segment] : []));
    return `${OB.dialogHead(d.id ? 'Edit proof point' : 'Add a proof point', 'Messages quote it word for word, so write it exactly as it should be said.')}
      <form id="su-proof-form" class="stack gap-5" data-submit="setup-proof-save" novalidate>
        ${ui.field({ id: 'su-pf-result', label: 'The result, word for word', textarea: true, rows: 3, value: d.result, hint: 'Include the number and how long it took, like "0 to 40,000 funded accounts in 12 weeks".', error: d.errs.result, extra: 'name="result" data-input="setup-pf" data-key="result"' })}
        <fieldset class="su-fieldset stack gap-3">
          <legend class="label">The client</legend>
          <div class="seg" role="group" aria-label="How messages mention the client">
            <button type="button" id="su-pf-how-name" aria-pressed="${d.named}" data-action="setup-pf-how" data-arg="name">Name the client</button>
            <button type="button" id="su-pf-how-describe" aria-pressed="${!d.named}" data-action="setup-pf-how" data-arg="describe">Describe the client</button>
          </div>
          ${d.named
            ? ui.field({ id: 'su-pf-name', label: 'Client name', value: d.name, placeholder: 'Ledgerly', error: d.errs.name, extra: 'name="name" data-input="setup-pf" data-key="name" autocomplete="off"' })
            : ui.field({ id: 'su-pf-desc', label: 'How to describe them', value: d.desc, placeholder: 'A top-10 perp DEX', hint: 'Specific enough to be believable, without the name.', error: d.errs.desc, extra: 'name="desc" data-input="setup-pf" data-key="desc" autocomplete="off"' })}
        </fieldset>
        <div class="field">
          <label class="label" for="su-pf-seg">Use it for</label>
          <span class="hint" id="su-pf-seg-hint">Messages to companies in this industry use it first.</span>
          <select class="select" id="su-pf-seg" name="segment" aria-describedby="su-pf-seg-hint" data-change="setup-pf-seg">${segs.map((x) => `<option ${x === d.segment ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select>
        </div>
        ${ui.field({ id: 'su-pf-source', label: 'Where it is published', optional: true, value: d.source, placeholder: 'tideline.studio/work/ledgerly', hint: 'Leave it blank if it is not published. Proof you add counts as confirmed by you.', extra: 'name="source" data-input="setup-pf" data-key="source" autocomplete="off"' })}
      </form>
      <div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${ui.btn({ label: d.id ? 'Save proof point' : 'Add proof point', kind: 'primary', type: 'submit', extra: 'form="su-proof-form"' })}</div>`;
  }
  function paintProof(focusId) {
    const box = document.querySelector('#overlay .dialog');
    if (!box || !proofDraft) return;
    box.innerHTML = proofHtml();
    focusEl(focusId);
  }
  OB.action('setup-pf', (el, e, v) => { if (proofDraft) proofDraft[el.dataset.key] = v; });
  OB.action('setup-pf-seg', (el, e, v) => { if (proofDraft) proofDraft.segment = v; });
  OB.action('setup-pf-how', (el, e, how) => { if (!proofDraft) return; proofDraft.named = how === 'name'; paintProof(`su-pf-how-${how}`); });
  OB.action('setup-proof-save', () => {
    const d = proofDraft;
    if (!d) return;
    d.errs = {};
    if (!d.result.trim()) d.errs.result = 'Enter the result as messages should quote it.';
    if (d.named && !d.name.trim()) d.errs.name = 'Enter the client name, or choose Describe the client.';
    if (!d.named && !d.desc.trim()) d.errs.desc = 'Describe the client in a few words, like "A top-10 perp DEX".';
    const first = d.errs.result ? 'su-pf-result' : d.errs.name ? 'su-pf-name' : d.errs.desc ? 'su-pf-desc' : null;
    if (first) { paintProof(first); return; }
    const fields = {
      result: d.result.trim().replace(/^"|"$/g, ''),
      named: d.named,
      clientName: d.name.trim(),
      clientDesc: d.desc.trim() || DESCRIBE[d.segment] || 'A client',
      segment: d.segment,
    };
    fields.client = d.named ? fields.clientName : fields.clientDesc;
    let id = d.id;
    if (id) Object.assign(OB.get.proof(id), fields, d.source.trim() ? { source: d.source.trim() } : {});
    else {
      id = `p${P.proof.reduce((n, p) => Math.max(n, Number(String(p.id).replace(/\D/g, '')) || 0), 0) + 1}`;
      P.proof.push(Object.assign({ id, source: d.source.trim() || 'Added by you', found: TODAY, confirmed: true }, fields));
    }
    /* Proof the user writes or rewrites here counts as confirmed by them */
    S.proofOk[id] = true;
    const added = !d.id;
    OB.closeOverlays(true);
    OB.render({ keepScroll: true });
    focusProof(id);
    OB.toast(added ? 'Proof point added' : 'Proof point saved');
  });

  /* Never contact: clients and partners */
  let neverSeq = 0;
  const neverIds = () => ownNever().map((n) => `su-nx-${n.id}`).concat(S.neverImport ? ['su-nx-import'] : []);
  OB.action('setup-never-add', (f, e, data) => {
    const v = String(data.company || '').trim();
    if (!v) { focusEl('su-never-new'); return; }
    if (D.never.some((n) => n.value.toLowerCase() === v.toLowerCase())) { announce(`${v} is already on never contact.`); focusEl('su-never-new'); return; }
    const isDomain = /\.[a-z]{2,}$/i.test(v) && !/\s/.test(v);
    D.never.push({ id: `n-su${++neverSeq}`, type: 'Company', value: v, detail: isDomain ? v : '', reason: 'Client', added: TODAY, by: 'You' });
    OB.render({ keepScroll: true });
    focusEl('su-never-new');
    announce(`Added ${v} to never contact.`);
  });
  OB.action('setup-never-remove', (el, e, id) => {
    const i = D.never.findIndex((n) => n.id === id);
    if (i < 0) return;
    const ids = neverIds();
    const at = ids.indexOf(`su-nx-${id}`);
    const [n] = D.never.splice(i, 1);
    OB.render({ keepScroll: true });
    const left = neverIds();
    focusEl(left[at] || left[at - 1] || 'su-add-clients');
    OB.toast(`Removed ${n.value} from never contact`, { undo: () => { D.never.splice(i, 0, n); OB.render({ keepScroll: true }); focusEl(`su-nx-${n.id}`); } });
  });
  OB.action('setup-never-unimport', () => {
    const imp = S.neverImport;
    S.neverImport = null;
    OB.render({ keepScroll: true });
    focusEl('su-never-import');
    OB.toast(`Removed ${fmt.num(imp.count)} imported companies`, { undo: () => { S.neverImport = imp; OB.render({ keepScroll: true }); } });
  });
  let importPicked = false;
  function importHtml() {
    return `${OB.dialogHead('Import clients and partners', 'A CSV with one company per row: a name, a website, or both. Onbook leaves every one out of your lists and campaigns.')}
      ${importPicked
        ? `<div class="su-file">${icon('list', 20)}<div class="stack gap-1 grow"><strong class="t-medium">clients.csv</strong><span class="t-small t-2">38 companies found. 2 are already on never contact, so 36 are new.</span></div></div>`
        : `<div class="su-drop"><span class="t-2">Choose a CSV file from your computer.</span>${ui.btn({ label: 'Choose a CSV file', icon: 'upload', action: 'setup-import-pick', id: 'su-import-pick' })}</div>`}
      <p class="t-small t-2">Columns can be in any order. Rows that are not companies are skipped and listed for you.</p>
      <div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${ui.btn({ label: importPicked ? 'Import 38 companies' : 'Import companies', kind: 'primary', action: 'setup-import-go', id: 'su-import-go', disabled: !importPicked })}</div>`;
  }
  OB.action('setup-never-import', () => { importPicked = false; OB.dialog(importHtml(), { label: 'Import clients and partners' }); });
  OB.action('setup-import-pick', () => { importPicked = true; const box = document.querySelector('#overlay .dialog'); if (box) { box.innerHTML = importHtml(); focusEl('su-import-go'); } });
  OB.action('setup-import-go', () => {
    S.neverImport = { file: 'clients.csv', count: 38 };
    OB.closeOverlays(true);
    OB.render({ keepScroll: true });
    focusEl('su-never-import');
    OB.toast('Imported 38 companies');
  });

  OB.action('setup-profile-save', () => {
    const errs = profileErrors();
    const keys = Object.keys(errs);
    if (keys.length) {
      OB.set({ setupProfErr: errs });
      const k = keys[0];
      const target = k === 'sell' ? 'su-f-sell' : k === 'offer' ? 'su-f-offer' : groupFocusId(k);
      const el = document.getElementById(target);
      if (el) { el.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' }); el.focus({ preventScroll: true }); }
      announce(`${OB.plural(keys.length, 'thing')} to fix before Onbook builds your list. ${errs[k]}`);
      return;
    }
    OB.state.ui.setupProfErr = null;
    commitProfile();
    proceedFromProfile();
  });

  /* ======================================================================
     2 Five questions, one at a time
     ====================================================================== */
  const Q_HINTS = [
    'One or two sentences, the way you would say it to a customer.',
    'Name them if you like. Onbook looks for companies like them.',
    'Word for word, with the number and how long it took. For example: Ledgerly, 0 to 40,000 funded accounts in 12 weeks.',
    'Clients, partners, investors and competitors, or kinds of company such as agencies.',
    'A few words is enough. For example: direct and friendly, short sentences, no hype.',
  ];
  OB.route('setup-questions', (params) => {
    const qs = S.fiveQuestions;
    const i = Math.max(0, Math.min(qs.length - 1, (Number(params[0]) || 1) - 1));
    const q = qs[i];
    const last = i === qs.length - 1;
    if (entering()) OB.state.ui.setupQErr = '';
    const err = OB.ui$('setupQErr', '');
    return {
      shell: 'setup', step: 2, narrow: true, title: `Question ${i + 1} of ${qs.length}`,
      html: `
        <header class="page-head">
          <div class="page-bar">
            <div class="page-titles">
              <p class="su-q-count"><span class="su-q-bar" aria-hidden="true">${qs.map((x, k) => `<span class="${k < i ? 'is-done' : k === i ? 'is-now' : ''}"></span>`).join('')}</span><span class="num">Question ${i + 1} of ${qs.length}</span></p>
              <h1 tabindex="-1" id="page-title">${esc(q.q)}</h1>
            </div>
          </div>
          <p class="page-sub" id="su-q-hint">${esc(Q_HINTS[i])}</p>
        </header>
        <form id="su-q-form" class="su-q-form" data-submit="setup-q-next" novalidate>
          <div class="field">
            <textarea class="textarea" id="su-q-a" rows="6" data-input="setup-q-input" data-i="${i}" aria-labelledby="page-title" aria-describedby="su-q-hint${err ? ' su-q-err' : ''}"${err ? ' aria-invalid="true"' : ''}>${esc(q.a)}</textarea>
            ${err ? `<span class="field-error" id="su-q-err">${icon('alert', 16)}<span>${esc(err)}</span></span>` : ''}
          </div>
          <p class="su-q-alt t-small t-2"><button type="button" class="link-btn" data-action="setup-q-paste" id="su-q-paste">Paste answers from a document</button>, or <a href="#setup-reading">use my website instead</a></p>
        </form>`,
      foot: foot({
        note: 'Answers save as you go. Nothing is sent until you launch.',
        primary: `${ui.btn({ label: 'Back', icon: 'arrow-left', action: 'setup-q-back', arg: String(i), cls: 'su-q-back' })}${ui.btn({ label: last ? 'Build my profile' : 'Next question', kind: 'primary', type: 'submit', extra: 'form="su-q-form"' })}`,
      }),
    };
  });
  OB.action('setup-q-input', (el, e, v) => { const q = S.fiveQuestions[Number(el.dataset.i)]; if (q) q.a = v; });
  OB.action('setup-q-back', (el, e, is) => { const i = Number(is); OB.go(i > 0 ? `setup-questions.${i}` : 'setup-profile'); });
  OB.action('setup-q-next', () => {
    const qs = S.fiveQuestions;
    const i = Math.max(0, Math.min(qs.length - 1, (Number(OB.parseHash().params[0]) || 1) - 1));
    if (i < qs.length - 1) { OB.go(`setup-questions.${i + 2}`); return; }
    if (!qs.some((q) => String(q.a || '').trim())) {
      OB.set({ setupQErr: 'Answer at least one question so Onbook has something to build from. The first one helps most.' });
      focusEl('su-q-a');
      return;
    }
    Object.assign(OB.state.ui, { setupQErr: '', setupFrom: 'answers' });
    OB.go('setup-profile');
    OB.toast('Profile built from your answers');
  });
  let pasteText = '';
  let pasteErr = '';
  const pasteHtml = () => `${OB.dialogHead('Paste answers from a document', 'Paste anything that answers the five questions: notes, a deck, or answers from an AI chat. Onbook drafts your profile from it, and you check it next.')}
    <form id="su-paste-form" class="stack gap-4" data-submit="setup-paste-go" novalidate>
      ${ui.field({ id: 'su-paste', label: 'Your answers', textarea: true, rows: 12, value: pasteText, error: pasteErr || undefined, extra: 'name="text" data-input="setup-paste-input"' })}
    </form>
    <div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${ui.btn({ label: 'Build my profile', kind: 'primary', type: 'submit', extra: 'form="su-paste-form"' })}</div>`;
  OB.action('setup-q-paste', () => { pasteErr = ''; OB.dialog(pasteHtml(), { label: 'Paste answers from a document', wide: true }); });
  OB.action('setup-paste-input', (el, e, v) => { pasteText = v; });
  OB.action('setup-paste-go', () => {
    if (!pasteText.trim()) {
      pasteErr = 'Paste some text first, or answer the questions one at a time.';
      const box = document.querySelector('#overlay .dialog');
      if (box) { box.innerHTML = pasteHtml(); focusEl('su-paste'); }
      return;
    }
    pasteErr = '';
    OB.state.ui.setupFrom = 'paste';
    OB.closeOverlays(true);
    OB.go('setup-profile');
    OB.toast('Profile built from your document');
  });

  /* ======================================================================
     3 Companies: Onbook checks over 30,000 companies against the profile and shows 10 examples it believes fit. There is
     no leads list: Onbook is always on and finds more every day (Julian, 17 Oct). The customer removes, changes or adds
     examples, and Onbook looks for more like the ones they keep
     ====================================================================== */
  /* The examples on screen ({ id } for a company Onbook found, { name } for one the customer typed), then the next ones
     Onbook would show when one is removed */
  S.picks = S.picks || { shown: S.list.slice(0, 10).map((id) => ({ id })), pool: S.list.slice(10) };
  const resetPicks = () => { S.picks = { shown: S.list.slice(0, 10).map((id) => ({ id })), pool: S.list.slice(10) }; };
  const pickCo = (x) => (x.id ? OB.get.company(x.id) : null);
  const pickName = (x) => (x.id ? (pickCo(x) || {}).name || '' : x.name);
  /* People at a company in contact order (used on Day one): sorted by the order of the roles in the profile */
  const TITLE_LIKE = { 'growth lead': 'head of growth', 'vp growth': 'head of growth', 'head of marketing': 'cmo', 'vp marketing': 'cmo', founder: 'co-founder' };
  function titleRank(title) {
    const order = P.titles.map((x) => x.toLowerCase());
    const t = String(title).toLowerCase();
    let i = order.indexOf(t);
    if (i < 0 && TITLE_LIKE[t]) i = order.indexOf(TITLE_LIKE[t]);
    return i < 0 ? 99 : i;
  }
  function peopleAt(id) {
    const base = (S.people[id] || []).map(([name, title], i) => ({ name, title, i }));
    base.sort((a, b) => titleRank(a.title) - titleRank(b.title) || a.i - b.i);
    if (S.third[id]) base.push({ name: S.third[id][0], title: S.third[id][1], i: 9 });
    return base;
  }
  /* "Why it fits" without repeating the staff count shown beside the name */
  const fitText = (co) => String(co.fit || '').replace(new RegExp(`,? ${co.size} staff`), '').replace(/\s+\./g, '.');

  OB.route('setup-list-building', (params) => {
    const rebuild = params[0] === 'rebuild';
    const items = [
      { now: `Checking ${checkedWords()} companies against your profile`, done: 'Found 30,000+ companies that fit your profile', detail: 'And Onbook keeps finding more every day.' },
      { now: 'Reading the news for the best fits', done: 'Read the news for the best fits', detail: 'Funding, launches, new markets and hiring from the last 30 days.' },
      { now: 'Picking 10 examples for you', done: 'Picked 10 examples', detail: 'Companies Onbook believes fit you, each with its news.' },
    ];
    return {
      shell: 'setup', step: 3, narrow: true, title: 'Finding companies that fit you',
      html: `
        ${ui.pageHead({ title: 'Finding 10 companies that fit you', sub: rebuild ? 'From your profile as it is now.' : `Onbook checks ${checkedWords()} companies against your profile.` })}
        <section class="card su-log-card" aria-label="What Onbook is doing">${workLog('su-build-log', items)}</section>`,
      foot: foot({ note: '<span id="su-build-note">Nothing is sent until you launch.</span>', primary: ui.btn({ label: 'Continue', kind: 'primary', href: '#setup-list', id: 'su-build-go' }) }),
      after: () => startBuilding(rebuild),
    };
  });
  function startBuilding(rebuild) {
    clearTimers();
    const r = reduced();
    if (rebuild) resetPicks();
    runLog('su-build-log', r ? 450 : 850, null, () => {
      S.builtFrom = targetKey();
      const n = document.getElementById('su-build-note'); if (n) n.textContent = 'Your examples are ready. Nothing is sent until you launch.';
      announce(`Your 10 examples are ready.${r ? ' Choose Continue to see them.' : ''}`);
      if (!r) later(1000, () => { if (OB.parseHash().name === 'setup-list-building') OB.go('setup-list'); });
    });
  }

  /* One example: the company, where it is and its size, its news (or why it fits), then Change and Remove */
  function pickRow(x, i, editing) {
    const name = pickName(x);
    if (editing) {
      return `<li class="su-pick su-pick-editing">
        <form class="su-add su-pick-form" data-submit="setup-pick-save" data-i="${i}">
          <label class="sr-only" for="su-pick-in">Company name or website</label>
          <input class="input" id="su-pick-in" name="name" value="${esc(name)}" autocomplete="off" data-cancel="setup-pick-cancel">
          <button type="submit" class="btn btn-secondary btn-sm">Save</button>
          <button type="button" class="btn btn-ghost btn-sm" data-action="setup-pick-cancel">Cancel</button>
        </form>
      </li>`;
    }
    const co = pickCo(x);
    const line = co ? `${co.location}, ${fmt.num(co.size)} staff` : 'Added by you';
    const why = co && co.news ? `<span>${esc(co.news.text)}</span><span class="t-2">${esc(`${co.news.source}, ${fmt.ago(co.news.date)}`)}</span>`
      : co ? `<span class="t-2">${esc(fitText(co))}</span>` : '<span class="t-2">Onbook looks for more companies like this one.</span>';
    return `<li class="su-pick" id="su-pick-${i}">
      ${ui.co(name)}
      <span class="su-top-main">
        <span class="su-top-name"><span>${esc(name)}</span><span class="t-2 truncate">${esc(line)}</span></span>
        <span class="su-top-why">${why}</span>
      </span>
      <span class="su-pick-acts">
        <button type="button" class="btn btn-ghost btn-sm btn-icon" id="su-pke-${i}" data-action="setup-pick-edit" data-arg="${i}" aria-label="Change ${esc(name)}">${icon('edit', 16)}</button>
        <button type="button" class="btn btn-ghost btn-sm btn-icon" id="su-pkx-${i}" data-action="setup-pick-remove" data-arg="${i}" aria-label="Remove ${esc(name)}">${icon('x', 16)}</button>
      </span>
    </li>`;
  }
  OB.route('setup-list', () => {
    if (!listBuilt()) S.builtFrom = targetKey();
    const K = S.picks;
    const editing = OB.ui$('setupPickEdit', null);
    const n = K.shown.length;
    const html = `
      ${ui.pageHead({ title: `${n === 10 ? '10' : fmt.num(n)} ${n === 1 ? 'company' : 'companies'} we believe fit you`, sub: 'Examples from 30,000+ companies that fit your profile. Remove any that don\'t fit, change one, or add your own. Onbook looks for more like the ones you keep, every day.' })}
      <section class="card card-flush su-card su-picks" aria-labelledby="su-picks-h">
        <div class="card-head">${icon('building', 16)}<h2 id="su-picks-h">Examples</h2><span class="su-head-end t-small t-2">30,000+ available</span></div>
        ${n ? `<ul class="su-rows su-pick-list" role="list" aria-labelledby="su-picks-h">${K.shown.map((x, i) => pickRow(x, i, editing === i)).join('')}</ul>` : '<p class="su-card-body t-2">No examples left. Add a company you would like more of.</p>'}
        <form class="su-add su-pick-add" data-submit="setup-pick-add">
          <label class="sr-only" for="su-pick-new">Add a company</label>
          <input class="input" id="su-pick-new" name="name" autocomplete="off" placeholder="Enter a company name or website">
          <button type="submit" class="btn btn-secondary btn-sm">${icon('plus', 15)}<span>Add</span></button>
        </form>
      </section>`;
    return {
      shell: 'setup', step: 3, narrow: true, title: 'Companies that fit you',
      html,
      foot: foot({ note: 'Nothing is sent until you launch.', back: 'setup-profile', primary: ui.btn({ label: 'Continue', kind: 'primary', action: 'setup-picks-ok', id: 'su-list-ok' }) }),
    };
  });
  OB.action('setup-pick-edit', (el, e, is) => { OB.set({ setupPickEdit: Number(is) }); const f = document.getElementById('su-pick-in'); if (f) { f.focus(); f.select(); } });
  OB.action('setup-pick-cancel', () => { const i = OB.ui$('setupPickEdit', null); OB.set({ setupPickEdit: null }); if (i != null) focusEl(`su-pke-${i}`); });
  OB.action('setup-pick-save', (f, e, data) => {
    const i = Number(f.dataset.i);
    const K = S.picks;
    const v = String(data.name || '').trim().replace(/\s+/g, ' ');
    if (!v) { focusEl('su-pick-in'); announce('Enter a company name or website, or choose Cancel.'); return; }
    const was = K.shown[i];
    if (v.toLowerCase() !== pickName(was).toLowerCase()) K.shown.splice(i, 1, { name: v });
    OB.set({ setupPickEdit: null });
    focusEl(`su-pke-${i}`);
    if (K.shown[i] !== was) OB.toast(`Changed to ${v}`, { undo: () => { K.shown.splice(i, 1, was); OB.render({ keepScroll: true }); focusEl(`su-pke-${i}`); } });
  });
  OB.action('setup-pick-remove', (el, e, is) => {
    const i = Number(is);
    const K = S.picks;
    const was = K.shown[i];
    if (!was) return;
    const nextId = K.pool.shift();
    if (nextId) K.shown.splice(i, 1, { id: nextId }); else K.shown.splice(i, 1);
    OB.set({ setupPickEdit: null });
    focusEl(K.shown[i] ? `su-pkx-${i}` : K.shown.length ? `su-pkx-${K.shown.length - 1}` : 'su-pick-new');
    OB.toast(nextId ? `Removed ${pickName(was)}. Here is ${pickName({ id: nextId })} instead` : `Removed ${pickName(was)}`, {
      undo: () => {
        if (nextId) { K.shown.splice(i, 1, was); K.pool.unshift(nextId); } else K.shown.splice(i, 0, was);
        OB.render({ keepScroll: true });
        focusEl(`su-pkx-${i}`);
      },
    });
  });
  OB.action('setup-pick-add', (f, e, data) => {
    const v = String(data.name || '').trim().replace(/\s+/g, ' ');
    if (!v) { focusEl('su-pick-new'); return; }
    const K = S.picks;
    if (K.shown.some((x) => pickName(x).toLowerCase() === v.toLowerCase())) { announce(`${v} is already an example.`); focusEl('su-pick-new'); return; }
    K.shown.push({ name: v });
    OB.render({ keepScroll: true });
    focusEl('su-pick-new');
    announce(`Added ${v}. Onbook looks for more companies like it.`);
  });
  /* The examples the customer kept become the profile's "Companies like these" (Settings) */
  OB.action('setup-picks-ok', () => {
    P.examples = S.picks.shown.map(pickName).filter(Boolean);
    OB.set({ setupPickEdit: null });
    OB.go('setup-never');
  });

  /* ======================================================================
     3 Never contact: companies Onbook must leave alone (Proposed 17 Oct)
     Onbook ticks the clients, partners and investors it read on the website; the user unticks any that are fine to
     contact, adds others or imports a CSV, then "Save and continue". "Set up later" skips it, and the launch summary
     and Day one say it is not set up yet. Everything here lands on Contacts > Never contact
     ====================================================================== */
  const proofNames = () => P.proof.map((x) => String(x.clientName || x.client || '').toLowerCase());
  function neverFound() {
    const R = S.read;
    return R.clients.map(([name]) => ({ name, reason: 'Client', from: proofNames().includes(name.toLowerCase()) ? 'Case study on your site' : 'Client logo on your site' }))
      .concat((R.others || []).map(([name, reason]) => ({ name, reason, from: `${reason} on your site` })));
  }
  const foundKeys = () => neverFound().map((f) => f.name.toLowerCase());
  /* Companies on never contact that the step does not list as found on the site: the user's own additions */
  const ownNever = () => D.never.filter((n) => n.type === 'Company' && !foundKeys().includes(n.value.toLowerCase()));
  const ticks = () => {
    if (!OB.state.ui.setupNeverTick) OB.state.ui.setupNeverTick = S.neverTick ? Object.assign({}, S.neverTick) : Object.fromEntries(neverFound().map((f) => [f.name, true]));
    return OB.state.ui.setupNeverTick;
  };
  OB.route('setup-never', () => {
    const found = neverFound();
    const t = ticks();
    const on = found.filter((f) => t[f.name]).length;
    const rows = found.map((f, i) => `<li class="su-nv">
        <input type="checkbox" id="su-nv-${i}" data-change="setup-nv-tick" data-arg="${i}"${t[f.name] ? ' checked' : ''}>
        <label class="su-nv-label" for="su-nv-${i}">
          ${ui.co(f.name)}
          <span class="su-top-main"><span class="su-top-name"><span>${esc(f.name)}</span></span><span class="t-small t-2">${esc(f.from)}</span></span>
          ${ui.tag('grey', f.reason)}
        </label>
      </li>`).join('');
    const html = `
      ${ui.pageHead({ title: 'Who should Onbook never contact?', sub: `Nobody at these companies hears from Onbook, in any campaign. We ticked the clients, partners and investors on ${esc(site())}. Untick any that are fine to contact, or add your own.` })}
      <section class="card card-flush su-card" aria-labelledby="su-nv-h">
        <div class="card-head">${icon('shield', 16)}<h2 id="su-nv-h">Found on your website</h2><span class="su-head-end t-small t-2" id="su-nv-count" aria-live="polite">${on} of ${found.length} ticked</span></div>
        <div class="su-nv-all">
          <button type="button" class="su-edit" id="su-nv-all" data-action="setup-nv-all" data-arg="${on === found.length ? 'none' : 'all'}">${on === found.length ? 'Untick all' : 'Tick all'}</button>
        </div>
        <ul class="su-rows su-nv-list" role="list" aria-labelledby="su-nv-h">${rows}</ul>
      </section>
      <section class="card card-flush su-card" aria-labelledby="su-nv-own-h">
        <div class="card-head">${icon('plus', 16)}<h2 id="su-nv-own-h">Add your own</h2></div>
        ${clientsField()}
        <p class="su-card-foot">${icon('inbox', 14)} Once your email is connected, Onbook also skips every company you emailed in the last 12 months.</p>
      </section>`;
    return {
      shell: 'setup', step: 3, narrow: true, title: 'Companies to never contact',
      html,
      foot: foot({
        note: 'Change it any time in Contacts, under Never contact.',
        back: 'setup-list',
        second: ui.btn({ label: 'Set up later', kind: 'ghost', action: 'setup-never-later', id: 'su-nv-later' }),
        primary: ui.btn({ label: 'Save and continue', kind: 'primary', action: 'setup-never-save', id: 'su-nv-save' }),
      }),
    };
  });
  /* Ticking a row repaints only the count, so focus stays on the checkbox */
  function paintNeverCount() {
    const found = neverFound();
    const t = ticks();
    const on = found.filter((f) => t[f.name]).length;
    const c = document.getElementById('su-nv-count'); if (c) c.textContent = `${on} of ${found.length} ticked`;
    const b = document.getElementById('su-nv-all');
    if (b) { b.textContent = on === found.length ? 'Untick all' : 'Tick all'; b.dataset.arg = on === found.length ? 'none' : 'all'; }
  }
  OB.action('setup-nv-tick', (el, e, checked) => {
    const f = neverFound()[Number(el.dataset.arg)];
    if (!f) return;
    ticks()[f.name] = !!checked;
    paintNeverCount();
  });
  OB.action('setup-nv-all', (el, e, how) => {
    const t = ticks();
    neverFound().forEach((f) => { t[f.name] = how === 'all'; });
    OB.render({ keepScroll: true });
    focusEl('su-nv-all');
    announce(how === 'all' ? 'All ticked.' : 'All unticked.');
  });
  /* Saving writes the ticked companies to never contact and takes unticked ones off it */
  OB.action('setup-never-save', () => {
    const t = ticks();
    neverFound().forEach((f) => {
      const at = D.never.findIndex((n) => n.type === 'Company' && n.value.toLowerCase() === f.name.toLowerCase());
      if (t[f.name] && at < 0) D.never.push({ id: `n-su${++neverSeq}`, type: 'Company', value: f.name, detail: f.from, reason: f.reason, added: TODAY, by: 'You' });
      if (!t[f.name] && at >= 0) D.never.splice(at, 1);
    });
    S.neverTick = Object.assign({}, t);
    S.neverLater = false;
    OB.state.ui.setupNeverTick = null;
    OB.go('setup-accounts');
  });
  OB.action('setup-never-later', () => {
    S.neverLater = !S.neverTick;
    OB.state.ui.setupNeverTick = null;
    OB.go('setup-accounts');
    OB.toast('Skipped for now. Set it up before launch, or any time in Contacts.');
  });
  /* How many companies are on never contact, for the launch summary */
  const neverCount = () => D.never.filter((n) => n.type === 'Company').length + (S.neverImport ? S.neverImport.count : 0);

  /* ======================================================================
     4 Accounts: where to send from
     ====================================================================== */
  /* "does" and "riskLine" are the short versions on the page; the connect dialogs say it in full, with the acknowledgement */
  const ACC = {
    email: { name: 'Email', does: 'Sends your emails from your own inbox, and reads the replies.' },
    linkedin: { name: 'LinkedIn', does: 'Sends invites and messages as you, and reads the replies.', riskLine: 'Automating it can break LinkedIn\'s terms; the risk sits with your account.', risk: 'Automating LinkedIn can break its terms. The risk sits with your account; Onbook keeps to safe daily limits.' },
    x: { name: 'X', does: 'Sends DMs as you through Onbook for Chrome, and reads the replies.', riskLine: 'Automating it can break X\'s terms; the risk sits with your account.', risk: 'Automating X can break its terms. The risk sits with your account; Onbook keeps to safe daily limits.' },
    calendar: { name: 'Calendar and booking link', does: 'A booking through your link stops the whole company and shows in your Inbox.' },
  };
  const accOf = (id) => OB.get.account(id) || {};
  /* What a connected account says: who it is, its checks and its pace, in one line */
  /* Onbook suggests a safe pace for each account (spec 6): it starts low and rises over a few weeks */
  function accResult(ch) {
    if (ch === 'email') {
      const a = accOf('a-email');
      return `${a.name || D.me.email}, ${a.provider || 'Google Workspace'}. SPF, DKIM, DMARC and blocklists pass. Starts at 5 new people a day, rising to a safe 15 over 2 weeks.`;
    }
    if (ch === 'linkedin') return `${D.me.name}, Premium, so invites can include a note. Starts at 5 invites a day, rising to a safe 15 over 3 weeks.`;
    if (ch === 'x') return `${accOf('a-x').name || '@samrivera'} through Onbook for Chrome. Starts at 5 DMs a day, rising to a safe 10 over 2 weeks.`;
    const cal = accOf('a-cal');
    return `${cal.name || 'Google Calendar'}, ${cal.provider || D.me.email}. A booking through your link stops the whole company.`;
  }
  /* One account per row, as Attio lists apps: a tile, the name and its status, what it does or what it found, the action */
  function accRow(ch, c) {
    const a = ACC[ch];
    const on = !!c[ch];
    const status = on ? ui.tag('green', 'Connected') : ui.tag('outline', 'Not connected');
    /* The plan shows which steps are skipped while a channel is off, so the row only says what connecting does */
    const details = on ? accResult(ch) : `${ch === 'calendar' ? 'Optional. ' : ''}${a.does}${a.riskLine ? ` ${a.riskLine}` : ''}`;
    const action = on
      ? moreBtn(`su-acc-${ch}-btn`, 'setup-acc-menu', ch, `${OB.chName(ch)} options`)
      : ui.btn({ label: `Connect ${ch === 'calendar' ? 'calendar' : chWord(ch)}`, kind: 'secondary', size: 's', action: 'setup-connect', arg: ch, id: `su-acc-${ch}-btn` });
    return `<li class="su-acc su-row${on ? ' is-on' : ''}" id="su-acc-${ch}">
      ${tile(ch)}
      <div class="su-acc-main"${on ? ` id="su-acc-${ch}-result" tabindex="-1"` : ''}>
        <h2 class="su-acc-line"><span class="su-acc-name">${esc(a.name)}</span>${status}</h2>
        <p class="su-meta">${esc(details)}</p>
        ${ch === 'calendar' ? `<div class="su-booking">${ui.field({ id: 'su-booking', label: 'Booking link', optional: true, value: P.booking || '', placeholder: 'cal.com/your-name/intro', hint: 'Without a link, messages ask for a time by reply.', extra: 'data-input="setup-booking" inputmode="url" autocomplete="url" autocapitalize="off" spellcheck="false"' })}</div>` : ''}
      </div>
      <div class="su-acc-act">${action}</div>
    </li>`;
  }
  function reachPanel(c) {
    const r = reach(c);
    const steps = flowSteps();
    const skipped = skippedChs(c);
    const why = !r.pace ? 'Connect email, LinkedIn or X to see how many people Onbook can reach.'
      : steps[0] && steps[0].ch === r.first ? `The plan starts with ${stepPhrase(steps[0])}, so ${chWord(r.first)} sets the pace.`
        : (() => {
          const firstAt = steps.findIndex((x) => x.ch === r.first);
          const before = skipped.filter((ch) => steps.findIndex((x) => x.ch === ch) < firstAt);
          return `${cap(chList(before))} ${before.length === 1 ? 'is' : 'are'} not connected, so the plan starts with ${stepPhrase(steps[firstAt])}, and ${chWord(r.first)} sets the pace.`;
        })();
    return `<aside class="su-aside" aria-labelledby="su-reach-h">
      <div class="card card-flush su-card">
        <div class="card-head">${icon('user', 16)}<h2 id="su-reach-h">Expected reach</h2></div>
        <div class="su-card-body">
          ${r.pace ? `<div class="stack gap-1">${stat(`About ${r.pace}`, 'new people a weekday')}<p class="t-small t-2">About ${fmt.num(r.month)} a month</p></div>` : '<p class="t-2">Nothing connected yet.</p>'}
          <p class="t-small t-2">${why}${r.pace ? ' New accounts start at 5 a day and rise over 2 to 3 weeks.' : ''}</p>
        </div>
        <p class="su-card-foot">${fmt.money(D.plan.price)} a month includes ${fmt.num(D.plan.allowance)} credits, one per new person. Using them all takes about three inboxes, or mostly email steps.</p>
      </div>
    </aside>`;
  }

  OB.route('setup-accounts', (params) => {
    const p = params[0] || '';
    const fresh = entering();
    const dlg = { email: 'email', linkedin: 'linkedin', x: 'x', calendar: 'calendar', 'email-declined': 'email', 'linkedin-failed': 'linkedin' }[p];
    const before = fresh && dlg ? Object.assign({}, conn()) : null;
    if (fresh) {
      if (p === 'none') OB.state.ui.setupConn = { email: false, linkedin: false, x: false, calendar: false };
      if (p === 'all') OB.state.ui.setupConn = { email: true, linkedin: true, x: true, calendar: true };
      if (dlg) OB.state.ui.setupConn = Object.assign({ email: true, linkedin: true, x: false, calendar: true }, { [dlg]: false });
    }
    const c = conn();
    const any = c.email || c.linkedin || c.x;
    return {
      shell: 'setup', step: 4, title: 'Where to send from',
      html: `
        ${ui.pageHead({ title: 'Where to send from', sub: 'Onbook sends every message from your own accounts. Connect the ones your buyers reply on.' })}
        ${any ? '' : ui.notice({ kind: 'info', title: 'Connect at least one way to send', body: 'Email, LinkedIn or X. A calendar on its own cannot send messages.' })}
        <div class="su-split">
          <div class="su-main card card-flush su-card">
            <ul class="su-accs" role="list">${['email', 'linkedin', 'x', 'calendar'].map((ch) => accRow(ch, c)).join('')}</ul>
          </div>
          ${reachPanel(c)}
        </div>`,
      foot: foot({
        note: any ? 'Next: the plan Onbook recommends. Nothing sends until you launch.' : 'Connect email, LinkedIn or X to continue.',
        back: 'setup-never',
        primary: ui.btn({ label: 'Continue to the plan', kind: 'primary', href: '#setup-flow', disabled: !any }),
      }),
      after: () => {
        if (!(fresh && dlg)) return;
        OB.connect.open(dlg, { start: p, onCancel: () => { OB.state.ui.setupConn = before; if (OB.parseHash().name === 'setup-accounts') OB.render({ keepScroll: true }); } });
      },
    };
  });
  OB.action('setup-connect', (el, e, ch) => OB.connect.open(ch));
  OB.action('setup-acc-menu', (el, e, ch) => OB.menu(el, [
    { label: `Disconnect ${ch === 'calendar' ? 'calendar' : chWord(ch)}`, icon: 'logout', action: 'setup-disconnect', arg: ch, danger: true },
  ]));
  OB.action('setup-booking', (el, e, v) => { P.booking = v.trim(); });
  OB.action('setup-disconnect', (el, e, ch) => {
    const name = OB.chName(ch);
    OB.confirm({
      title: `Disconnect ${chWord(ch)}?`,
      body: ch === 'calendar' ? 'Bookings will not stop companies until you connect a calendar again. Nothing has been sent yet.' : `${name} steps are skipped until you connect ${chWord(ch) === 'email' ? 'email' : name} again. Nothing has been sent yet.`,
      confirmLabel: `Disconnect ${chWord(ch)}`,
      danger: true,
      onConfirm: () => {
        conn()[ch] = false;
        OB.render({ keepScroll: true });
        focusEl(`su-acc-${ch}-btn`);
        OB.toast(`${cap(chWord(ch))} disconnected`, { undo: () => { conn()[ch] = true; OB.render({ keepScroll: true }); focusEl(`su-acc-${ch}-btn`); } });
      },
    });
  });

  /* ======================================================================
     Connect dialogs: OB.connect.open(ch, { onDone }) works on any page
     ====================================================================== */
  const CHS = ['email', 'linkedin', 'x', 'calendar'];
  let cx = null;
  function cxOpen(ch, opts = {}) {
    if (CHS.indexOf(ch) < 0) return;
    if (cx && cx.timer) clearTimeout(cx.timer);
    const s = {
      ch, state: 'intro', provider: 'google', ack: false, installed: false, link: P.booking || '', onDone: opts.onDone || null, onCancel: opts.onCancel || null,
      err: opts.start === 'email-declined' ? 'declined' : opts.start === 'linkedin-failed' ? 'failed' : null,
    };
    if (s.err) s.ack = true;
    cx = s;
    OB.dialog(cxHtml(), { label: `Connect ${OB.chName(ch)}`, onClose: () => cxClosed(s) });
  }
  function cxClosed(s) {
    if (s.timer) clearTimeout(s.timer);
    if (cx === s) cx = null;
    if (s.state !== 'done') { if (s.onCancel) { try { s.onCancel(s.ch); } catch (err) { console.error(err); } } return; }
    OB.render({ keepScroll: true });
    const r = document.getElementById(`su-acc-${s.ch}-result`);
    if (r) r.focus();
    OB.toast(`${OB.chName(s.ch)} connected`);
    if (s.onDone) { try { s.onDone(s.ch); } catch (err) { console.error(err); } }
  }
  function applyConnected(s) {
    conn()[s.ch] = true;
    const put = (id, ch, fields) => { let a = OB.get.account(id); if (!a) { a = { id, ch, since: TODAY }; D.accounts.push(a); } Object.assign(a, fields); };
    if (s.ch === 'email') put('a-email', 'email', { name: D.me.email, provider: s.provider === 'microsoft' ? 'Microsoft 365' : 'Google Workspace', status: 'healthy', checks: { spf: true, dkim: true, dmarc: true, blocklists: true } });
    if (s.ch === 'linkedin') { put('a-li', 'linkedin', { name: D.me.name, provider: 'LinkedIn Premium, connected through Unipile', status: 'healthy' }); OB.state.sim.linkedinIssue = false; }
    if (s.ch === 'x') put('a-x', 'x', { name: '@samrivera', provider: 'Onbook for Chrome', status: 'warming', newPerDay: 5, target: 10, rampDay: 1, rampDays: 14, newToday: 0 });
    if (s.ch === 'calendar') { put('a-cal', 'calendar', { name: s.provider === 'microsoft' ? 'Outlook Calendar' : 'Google Calendar', provider: D.me.email, status: 'healthy' }); P.booking = String(s.link || '').trim(); }
  }
  /* The dialog's header carries the provider's tile, as Attio's app dialogs do */
  const cxHead = (title, sub) => OB.dialogHead(title, sub)
    .replace('<div class="dialog-head">', `<div class="dialog-head su-cx-head">${tile(cx ? cx.ch : 'email', 20)}`)
    .replace('<h2>', '<h2 class="su-cx-title" tabindex="-1" autofocus>');
  const doesList = (items) => `<ul class="su-does-list">${items.map(([ic, t]) => `<li>${icon(ic, 16)}<span>${esc(t)}</span></li>`).join('')}</ul>`;
  const provOpt = (s, value, mark, title, sub) => `<label class="su-opt"><input type="radio" name="su-prov" value="${value}" ${s.provider === value ? 'checked' : ''} data-change="setup-cx-provider"><span class="su-opt-mark" aria-hidden="true">${mark}</span><span class="su-opt-text"><strong class="t-medium">${esc(title)}</strong><span class="t-small t-2">${esc(sub)}</span></span></label>`;
  const ackBox = (s, text) => `<div class="stack gap-2">
      <label class="check su-ack" for="su-ack"><input type="checkbox" id="su-ack" ${s.ack ? 'checked' : ''} data-change="setup-cx-ack"${s.err === 'ack' ? ' aria-invalid="true" aria-describedby="su-ack-err"' : ''}><span>${esc(text)}</span></label>
      ${s.err === 'ack' ? `<p class="field-error" id="su-ack-err">${icon('alert', 16)}<span>Tick the box to continue.</span></p>` : ''}
    </div>`;
  const cxActions = (s, label) => `<div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${s.state === 'working'
    ? `<button type="button" class="btn btn-primary is-loading" id="su-cx-go" aria-busy="true"><span>${esc(label)}</span></button>`
    : ui.btn({ label, kind: 'primary', action: 'setup-cx-go', id: 'su-cx-go' })}</div>`;
  const risk = (text) => `<p class="su-risk">${icon('alert', 16)}<span>${esc(text)}</span></p>`;
  const doesHead = (text) => `<h3 class="su-label">${esc(text)}</h3>`;

  function cxHtml() {
    const s = cx;
    if (!s) return '';
    if (s.ch === 'email') {
      if (s.state === 'done') {
        const checks = [['SPF', 'Your domain lets your provider send for you'], ['DKIM', 'Messages are signed and match your domain'], ['DMARC', 'Your domain has a policy set'], ['MX', 'Replies reach your inbox'], ['Blocklists', 'Your domain is not on the main blocklists']];
        return `${cxHead('Email connected', `${esc(D.me.email)}, ${s.provider === 'microsoft' ? 'Microsoft 365' : 'Google Workspace'}`)}
          <div class="stack gap-2">
            ${doesHead('Checks passed')}
            <ul class="su-checklist">${checks.map(([k, t]) => `<li><span class="su-check-k">${k}</span><span class="t-2 su-check-v">${t}</span>${ui.tag('green', 'Pass')}</li>`).join('')}</ul>
          </div>
          <p class="t-small t-2">Onbook starts at 5 new people a day and rises to 15 over 2 weeks, with at most 40 emails a day including follow-ups. Plain text, with no tracking and no rewritten links.</p>
          <div class="dialog-actions">${ui.btn({ label: 'Done', kind: 'primary', action: 'close-overlay', id: 'su-cx-done' })}</div>`;
      }
      const ms = s.provider === 'microsoft';
      const provName = ms ? 'Microsoft' : 'Google';
      return `${cxHead('Connect email', "Onbook sends your flow's emails from your own inbox, so replies come straight back to you.")}
        ${s.err === 'declined' ? ui.notice({ kind: 'error', title: `${provName} did not give Onbook permission, so email is off`, body: 'Onbook needs to send from this inbox and see the replies. Without it, email steps are skipped; LinkedIn still works.' }) : ''}
        <div class="su-opts" role="radiogroup" aria-label="Where your email is">
          ${provOpt(s, 'google', OB.mark('google', 20), 'Google', 'Google Workspace or Gmail')}
          ${provOpt(s, 'microsoft', OB.mark('microsoft', 20), 'Microsoft', 'Microsoft 365 or Outlook')}
        </div>
        <div class="stack gap-3">
          ${doesHead('What Onbook can do with access')}
          ${doesList([
            ['send', 'Send the emails in flows you approve, as you, from this inbox'],
            ['reply', 'Read replies to those emails, so a reply stops the whole company'],
            ['search', 'Check whether you emailed a company in the last 12 months, so Onbook skips it'],
            ['shield', 'Never delete, move or change your email'],
          ])}
        </div>
        ${ms ? '' : `<p class="su-aside-note">${icon('info', 16)}<span>Google may say the app isn't verified yet. Choose Advanced, then Go to onbook.ai.</span></p>`}
        ${cxActions(s, s.err === 'declined' ? 'Try again' : `Continue to ${provName}`)}`;
    }
    if (s.ch === 'linkedin') {
      return `${cxHead('Connect LinkedIn', 'You sign in on a secure page run by Unipile, our LinkedIn partner. Onbook never sees your password, and LinkedIn may ask you for a code.')}
        ${s.err === 'failed' ? ui.notice({ kind: 'error', title: 'LinkedIn did not connect', body: 'Try again, and enter the newest code LinkedIn sends you.' }) : ''}
        <div class="stack gap-3">
          ${doesHead('What Onbook does with your account')}
          ${doesList([
            ['send', 'Sends invites and messages as you, inside your working hours'],
            ['clock', 'Starts at 5 new people a day, rising to 15 over 3 weeks'],
            ['reply', 'Reads replies, so a reply stops the whole company'],
          ])}
        </div>
        ${risk(ACC.linkedin.risk)}
        ${ackBox(s, 'I understand that automating LinkedIn can break its terms, and that the risk sits with my account.')}
        ${cxActions(s, s.err === 'failed' ? 'Try again' : 'Open LinkedIn sign-in')}`;
    }
    if (s.ch === 'x') {
      return `${cxHead('Connect X', 'Onbook sends and reads your X DMs through Onbook for Chrome, a browser extension linked to your X account.')}
        <ol class="su-steps">
          <li class="${s.installed ? 'is-done' : ''}">
            <span class="su-step-n" aria-hidden="true">${s.installed ? icon('check', 12) : '1'}</span>
            <div class="stack gap-2">
              <span>Add Onbook for Chrome${s.installed ? '<span class="sr-only">, done</span>' : ''}</span>
              ${s.installed ? '<span class="t-small t-2">Added to Chrome</span>' : ui.btn({ label: 'Add to Chrome', size: 's', icon: 'puzzle', action: 'setup-cx-install', id: 'su-x-install', extra: s.err === 'install' ? 'aria-describedby="su-x-install-err"' : '' })}
              ${s.err === 'install' ? `<p class="field-error" id="su-x-install-err">${icon('alert', 16)}<span>Add Onbook for Chrome first, then link your account.</span></p>` : ''}
            </div>
          </li>
          <li><span class="su-step-n" aria-hidden="true">2</span><span>Open x.com while signed in to the account you send from</span></li>
          <li><span class="su-step-n" aria-hidden="true">3</span><span>Click "Link account" in the extension</span></li>
        </ol>
        <div class="stack gap-3">
          ${doesHead('What Onbook does with your account')}
          ${doesList([
            ['send', 'Sends DMs as you, at most 2 to anyone before they reply'],
            ['clock', 'Starts at 5 new people a day, rising to 10 over 2 weeks'],
            ['reply', 'Reads replies, so a reply stops the whole company'],
          ])}
        </div>
        ${risk(ACC.x.risk)}
        ${ackBox(s, 'I understand that automating X can break its terms, and that the risk sits with my account.')}
        ${cxActions(s, 'Finish connecting X')}`;
    }
    const ms = s.provider === 'microsoft';
    return `${cxHead('Connect calendar', 'Optional. Onbook sees calls booked through your link, so a booking stops the whole company and shows in your Inbox.')}
      <div class="su-opts" role="radiogroup" aria-label="Your calendar">
        ${provOpt(s, 'google', OB.mark('google', 20), 'Google Calendar', 'Google Workspace or Gmail')}
        ${provOpt(s, 'microsoft', OB.mark('microsoft', 20), 'Outlook', 'Microsoft 365 or Outlook')}
      </div>
      ${ui.field({ id: 'su-cx-link', label: 'Booking link', optional: true, value: s.link, placeholder: 'cal.com/your-name/intro', hint: 'Without a link, your flow asks for a time by reply.', extra: 'data-input="setup-cx-link" inputmode="url" autocomplete="url" autocapitalize="off" spellcheck="false"' })}
      <p class="t-small t-2">Onbook reads new events only to spot bookings from people you contacted. It never changes your calendar.</p>
      ${cxActions(s, ms ? 'Connect Outlook' : 'Connect Google Calendar')}`;
  }
  function cxPaint(focusSel) {
    const box = document.querySelector('#overlay .dialog');
    if (!box || !cx) return;
    box.innerHTML = cxHtml();
    const t = (focusSel && box.querySelector(focusSel)) || box.querySelector('h2') || box;
    t.focus();
  }
  function cxGo() {
    const s = cx;
    if (!s || s.state === 'working') return;
    if ((s.ch === 'linkedin' || s.ch === 'x') && !s.ack) { s.err = 'ack'; cxPaint('#su-ack'); return; }
    if (s.ch === 'x' && !s.installed) { s.err = 'install'; cxPaint('#su-x-install'); return; }
    s.err = null;
    s.state = 'working';
    cxPaint('#su-cx-go');
    announce({ email: `Waiting for ${s.provider === 'microsoft' ? 'Microsoft' : 'Google'}`, linkedin: 'Waiting for you to sign in to LinkedIn', x: 'Looking for your linked X account', calendar: 'Connecting your calendar' }[s.ch]);
    s.timer = setTimeout(() => {
      if (cx !== s) return;
      s.state = 'done';
      applyConnected(s);
      if (s.ch === 'email') { cxPaint('#su-cx-done'); announce('Email connected. All checks passed.'); }
      else OB.closeOverlays(true);
    }, 1300);
  }
  OB.action('setup-cx-go', () => cxGo());
  OB.action('setup-cx-provider', (el, e, v) => { if (!cx) return; cx.provider = v; cxPaint(`input[name="su-prov"][value="${v}"]`); });
  OB.action('setup-cx-ack', (el, e, checked) => { if (!cx) return; cx.ack = !!checked; if (cx.err === 'ack' && cx.ack) { cx.err = null; cxPaint('#su-ack'); } });
  OB.action('setup-cx-install', () => { if (!cx) return; cx.installed = true; if (cx.err === 'install') cx.err = null; cxPaint('#su-ack'); announce('Onbook for Chrome added. Next, open x.com and link your account.'); });
  OB.action('setup-cx-link', (el, e, v) => { if (cx) cx.link = v; });

  OB.connect = {
    open: cxOpen,
    isConnected: (ch) => !!conn()[ch],
    state: () => Object.assign({}, conn()),
  };

  /* ======================================================================
     4 The plan: the builder, open and filled in with Onbook's recommended flow and an example message for each step.
     No summary and no "Change the plan" (Julian, 17 Oct); #setup-flow.edit still opens it, for old links
     ====================================================================== */
  OB.route('setup-flow', () => {
    if (entering()) OB.state.ui.setupFlowErr = '';
    return flowEditor();
  });
  const flowDirty = () => { try { return !!(FB().dirty && FB().dirty('f1', 'setup')); } catch (err) { console.error(err); return false; } };
  OB.action('setup-plan-reset', () => OB.confirm({
    title: 'Go back to the recommended plan?',
    body: 'Your changes to the plan are lost, and Onbook uses the plan it recommends for agencies like yours.',
    confirmLabel: 'Use the recommended plan',
    onConfirm: () => {
      try { if (FB().reset) FB().reset('f1', 'setup'); } catch (err) { console.error(err); }
      OB.state.ui.setupFlowErr = '';
      OB.render({ keepScroll: true });
      focusEl('page-title');
      OB.toast('Using the recommended plan');
    },
  }));

  /* The builder, with Onbook's plan in it */
  function flowEditor() {
    const c = conn();
    const flow = { steps: flowSteps() };
    const skipped = skippedChs(c);
    const flowErr = OB.ui$('setupFlowErr', '');
    let builder = '';
    try { builder = OB.flowBuilder ? OB.flowBuilder.render({ flowId: 'f1', mode: 'setup', editable: true }) : ''; }
    catch (err) { console.error(err); builder = ''; }
    if (!builder) {
      builder = `<div class="stack gap-3">
        ${ui.strip(flow.steps, flow.steps.map((s) => (c[s.ch] ? 'todo' : 'skip')))}
        <p class="t-2">The flow builder loads here: ${flow.steps.length} steps over 14 days, starting from the default flow, with an example message for each step.</p>
      </div>`;
    }
    const names = cap(chList(skipped));
    const usedChs = flow.steps.reduce((a, st) => (a.indexOf(st.ch) < 0 ? a.concat(st.ch) : a), []);
    const skipTitle = `${names} ${skipped.length === 1 ? 'is' : 'are'} not connected, so ${skipped.length === 1 ? 'its steps are' : 'their steps are'} skipped`;
    const connectBtns = skipped.map((ch) => ui.btn({ label: `Connect ${chWord(ch)}`, size: 's', action: 'setup-connect', arg: ch })).join('');
    /* One notice at a time: an error to fix wins, and the skipped channels become a line */
    const notice = flowErr
      ? `<div id="su-flow-err" tabindex="-1">${ui.notice({ kind: 'error', title: 'Fix the plan before you use it', body: esc(flowErr) })}</div>${skipped.length ? `<p class="t-small t-2">${esc(skipTitle)}.</p>` : ''}`
      : skipped.length ? ui.notice({
        kind: 'info',
        title: skipTitle,
        body: skipped.length >= usedChs.length ? 'Nothing can send until you connect at least one of them.' : `Everyone still gets the other steps. Connect ${skipped.length === 1 ? 'it to include its steps' : 'them to include their steps'}.`,
        actions: connectBtns,
      }) : '';
    return {
      shell: 'setup', step: 4, title: 'Your plan',
      html: `
        ${ui.pageHead({
          title: flowDirty() ? 'Your plan' : 'Here\'s the plan Onbook recommends',
          sub: flowDirty() ? 'You changed it. Onbook still checks every step against the same safety rules.' : 'Based on what gets replies for agencies like yours. Change any step, or keep it as it is. Onbook writes each message the day before it sends, then checks it.',
          actions: flowDirty() ? ui.btn({ label: 'Go back to the recommended plan', kind: 'ghost', size: 's', action: 'setup-plan-reset', id: 'su-plan-reset' }) : '',
        })}
        ${notice}
        <div class="su-flow">${builder}</div>`,
      foot: foot({ note: 'Next: launch. Nothing sends until then.', back: 'setup-accounts', primary: ui.btn({ label: 'Continue', kind: 'primary', action: 'setup-flow-approve', id: 'su-flow-ok' }) }),
      after: () => { if (OB.flowBuilder && typeof OB.flowBuilder.after === 'function') { try { OB.flowBuilder.after({ flowId: 'f1', mode: 'setup' }); } catch (err) { console.error(err); } } },
    };
  }
  OB.action('setup-flow-approve', () => {
    if (FB().approve) {
      let ok = true;
      try { ok = FB().approve('f1', 'setup') !== false; } catch (err) { console.error(err); }
      if (!ok) {
        let why = '';
        try { why = FB().blocker ? FB().blocker('f1', 'setup') : ''; } catch (err) { console.error(err); }
        OB.set({ setupFlowErr: why || 'One of the checks below does not pass yet.' });
        const n = document.getElementById('su-flow-err');
        if (n) { n.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' }); n.focus({ preventScroll: true }); }
        return;
      }
    }
    OB.state.ui.setupFlowErr = '';
    const f = OB.get.flow('f1');
    if (f) Object.assign(f, { approved: TODAY, approvedBy: D.me.name });
    OB.go('setup-launch');
  });

  /* ======================================================================
     5 Launch: the plan, the campaign, what happens today, and payment on Stripe
     ====================================================================== */
  function flowSum(c) {
    const steps = flowSteps();
    const progress = steps.map((s) => (c[s.ch] ? 'todo' : 'skip'));
    const label = `Flow: ${steps.map((s) => `${s.title}${c[s.ch] ? '' : ' (skipped)'}`).join(', ')}`;
    return { strip: ui.strip(steps, progress, label), text: flowSummary(steps), steps: steps.length, sending: steps.filter((s) => c[s.ch]).length };
  }
  /* The date of the first email after a non-email first step ("Fri 9 Oct" for the default flow) */
  function firstEmailAfter(c) {
    const steps = flowSteps();
    const r = reach(c);
    if (!c.email || !r.first || r.first === 'email') return null;
    const firstIdx = steps.findIndex((s) => s.ch === r.first);
    const em = steps.find((s, i) => i > firstIdx && s.ch === 'email');
    const n = dayOf(em);
    if (!em || !n) return null;
    const d = new Date(OB.TODAY); d.setDate(d.getDate() + n - 1);
    return { day: fmt.day(d), gap: n - 1 };
  }
  function firstStepText(r) {
    if (r.first === 'linkedin') return ['From 11:00 AM', 'First LinkedIn invites go out, a few minutes apart, inside your working hours.'];
    if (r.first === 'email') return ['From 11:00 AM', 'First emails go out, a few minutes apart, inside each person\'s working hours.'];
    if (r.first === 'x') return ['From 11:00 AM', 'First X DMs go out, a few minutes apart, inside your working hours.'];
    return ['', ''];
  }
  OB.route('setup-launch', (params) => {
    if (entering() && params[0] === 'annual') OB.state.ui.setupBilling = 'annual';
    const billing = OB.ui$('setupBilling', 'monthly');
    const annual = billing === 'annual';
    const declined = params[0] === 'declined';
    const c = conn();
    const r = reach(c);
    const camp = campaign();
    const fs = flowSum(c);
    const fe = firstEmailAfter(c);
    const plan = D.plan;
    const first = firstStepText(r);
    /* Today Onbook contacts up to the suggested daily number for the first channel (spec section 6), not a warm-up 5 */
    const n = r.pace || S.firstDay.count;
    /* Connected accounts as chips: the channel's mark, then the account */
    const from = [c.email ? ['email', accOf('a-email').name || D.me.email] : null, c.linkedin ? ['linkedin', D.me.name] : null, c.x ? ['x', accOf('a-x').name || '@samrivera'] : null].filter(Boolean);
    const fromChips = from.map(([ch, name]) => `<span class="su-from-item">${ui.ch(ch, 14)}<span>${esc(name)}</span></span>`).join('');
    const notOnCh = ['email', 'linkedin', 'x'].filter((ch) => !c[ch]);
    const notOn = notOnCh.length ? [chList(notOnCh)] : [];
    const today = [
      ['Now', `Onbook buys contact details for up to ${n} people, and their full names appear. Each uses 1 credit.`],
      first,
      fe ? [fe.day, `First emails, ${OB.plural(fe.gap, 'day')} after each ${r.first === 'linkedin' ? 'invite' : 'first message'}.`] : null,
      ['Any reply', 'Lands in your Inbox, and everyone at that company stops at once.'],
    ].filter((x) => x && x[0]);
    /* An attribute row of the summary, with its Edit link */
    const sumRow = (k, v, href, label) => `<div class="su-attr"><dt class="su-attr-k">${k}</dt><dd class="su-attr-v">${v}</dd><dd class="su-attr-act"><a class="su-edit" href="${href}" aria-label="${esc(label)}">Edit</a></dd></div>`;
    const html = `
      ${ui.pageHead({ title: `Launch ${esc(camp.name)}`, sub: 'Nothing has been sent yet. You can stop the campaign any time.' })}
      ${declined ? ui.notice({ kind: 'error', title: 'Your card was declined, so nothing was charged', body: 'Your campaign is saved and nothing has been sent. Subscribe again with another card, or ask your bank why it was declined.' }) : ''}
      <div class="su-split su-launch">
        <div class="su-main su-cards">
          <section class="card card-flush su-card" aria-labelledby="su-camp-h">
            <div class="card-head">${icon('campaigns', 16)}<h2 id="su-camp-h">The campaign</h2><button type="button" class="su-head-btn" id="su-rename-btn" data-action="setup-rename" aria-label="Rename the campaign">${icon('edit', 14)}<span>Rename</span></button></div>
            <dl class="su-attrs su-sum">
              ${sumRow('Who you reach', `<span>Companies like your ${OB.plural(S.picks.shown.length, 'example')}</span><span class="su-meta">From 30,000+ companies that fit your profile. Onbook finds more every day.</span>`, '#setup-list', 'Edit the example companies')}
              ${sumRow('Never contact', S.neverLater ? `<span>Not set up yet</span><span class="su-meta">Onbook could contact your clients and partners. It takes a minute.</span>` : `<span>${OB.plural(neverCount(), 'company', 'companies')}</span><span class="su-meta">Nobody at these companies hears from Onbook, plus anyone you emailed in the last 12 months.</span>`, '#setup-never', 'Edit the companies to never contact')}
              ${sumRow('Flow', `${fs.strip}<span>${esc(cap(fs.text))}</span><span class="su-meta">${fs.sending < fs.steps ? `${OB.plural(fs.steps - fs.sending, 'step')} skipped until you connect ${notOn.join(' and ')}. ` : ''}Approved by you today.</span>`, '#setup-flow', 'Edit the flow')}
              ${sumRow('Sending from', `${from.length ? `<span class="su-from">${fromChips}</span>` : '<span>Nothing connected yet</span>'}${(notOn.length && from.length) || c.calendar ? `<span class="su-meta">${[notOn.length && from.length ? `${cap(chList(notOnCh))} not connected.` : '', c.calendar ? `Bookings through ${esc(P.booking || 'your calendar')}.` : ''].filter(Boolean).join(' ')}</span>` : ''}`, '#setup-accounts', 'Edit where to send from')}
            </dl>
          </section>
          <section class="card card-flush su-card" aria-labelledby="su-today-h">
            <div class="card-head">${icon('clock', 16)}<h2 id="su-today-h">What happens today</h2></div>
            ${r.pace ? `<div class="su-card-body su-lead"><p class="su-lead-n">Today Onbook contacts up to ${n} people</p><p class="t-small t-2">The first person at each company. Then up to ${n} new people every weekday, for as long as you run it.</p></div>` : ''}
            <div class="su-card-body"><ol class="su-tl">${today.map(([when, what], i) => `<li class="${i === 0 ? 'is-first' : ''}"><span class="su-tl-when">${esc(when)}</span><span class="su-tl-dot" aria-hidden="true"></span><span class="su-tl-what">${esc(what)}</span></li>`).join('')}</ol></div>
            <p class="su-card-foot">${r.pace ? `About ${r.pace} new people a weekday, about ${fmt.num(r.month)} a month, from 30,000+ companies that fit your profile.` : 'Connect an account to see your expected reach.'}</p>
          </section>
        </div>
        <aside class="su-aside" aria-labelledby="su-price-h">
          <section class="card card-flush su-card su-price-card">
            <div class="card-head">${icon('card', 16)}<h2 id="su-price-h">Subscription</h2></div>
            <div class="su-card-body">
              ${seg([{ value: 'monthly', label: 'Monthly' }, { value: 'annual', label: 'Annual, save 20%' }], billing, 'setup-billing', 'Billing', 'su-bill')}
              <div>
                <p class="su-price"><span class="num">${fmt.money(annual ? plan.annualPrice : plan.price)}</span> <span class="su-price-per">a month</span></p>
                <p class="t-small t-2">${annual ? `Billed ${fmt.money(plan.annualPrice * 12)} a year` : 'Billed monthly'}</p>
              </div>
            </div>
            <div class="su-card-body su-plan-incl">
              <ul class="su-incl">
                <li>${icon('check', 15)}<span>${fmt.num(plan.allowance)} credits a month</span></li>
                <li>${icon('check', 15)}<span>A new person or a comment on their latest post costs 1 credit; follow-ups, replies and bookings are free</span></li>
                <li>${icon('check', 15)}<span>Cancel any time from Settings</span></li>
              </ul>
              <p class="t-small t-2">A new person's credit is used the day before their first message. More credits are $25 for 100, only if you buy them.</p>
            </div>
            <div class="su-card-foot su-due-box">
              <dl class="su-due"><dt>Due today</dt><dd class="num">${fmt.money(annual ? plan.annualPrice * 12 : plan.price)}</dd></dl>
              <p>${annual ? 'Then every year on 7 Oct.' : 'Then on the 7th of each month.'} You pay on Stripe's secure page; Onbook never sees your card number.</p>
            </div>
          </section>
        </aside>
      </div>`;
    return {
      shell: 'setup', step: 5, title: 'Launch',
      html,
      foot: foot({ note: r.pace ? 'You pay on Stripe\'s secure page. Nothing has been sent yet.' : 'Connect email, LinkedIn or X before you launch.', back: 'setup-flow', primary: ui.btn({ label: 'Subscribe and launch', kind: 'primary', action: 'setup-subscribe', id: 'su-subscribe', disabled: !r.pace }) }),
    };
  });
  OB.action('setup-billing', (el, e, v) => OB.set({ setupBilling: v }));
    OB.action('setup-subscribe', (el) => {
    if (el.classList.contains('is-loading')) return;
    el.classList.add('is-loading');
    el.setAttribute('aria-busy', 'true');
    const note = document.querySelector('.setup-foot .foot-note');
    if (note) note.textContent = 'Opening Stripe\'s secure page.';
    announce('Opening Stripe\'s secure payment page.');
    later(1500, () => {
      if (OB.parseHash().name !== 'setup-launch') return;
      OB.state.sim.subscribed = true;
      const camp = OB.get.campaign('c1');
      if (camp) camp.status = 'running';
      OB.go('day-one');
    });
  });

  let renameErr = '';
  const renameHtml = (v) => `${OB.dialogHead('Rename the campaign')}
    <form id="su-rename-form" class="stack gap-4" data-submit="setup-rename-save" novalidate>
      ${ui.field({ id: 'su-rename-f', label: 'Campaign name', value: v, error: renameErr || undefined, extra: 'name="name" maxlength="60" autocomplete="off"' })}
    </form>
    <div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${ui.btn({ label: 'Save name', kind: 'primary', type: 'submit', extra: 'form="su-rename-form"' })}</div>`;
  OB.action('setup-rename', () => { renameErr = ''; OB.dialog(renameHtml(campaign().name), { label: 'Rename the campaign' }); });
  OB.action('setup-rename-save', (f, e, data) => {
    const v = String(data.name || '').trim().replace(/\s+/g, ' ');
    if (!v) {
      renameErr = 'Enter a name, like Fintech launches, autumn.';
      const box = document.querySelector('#overlay .dialog');
      if (box) { box.innerHTML = renameHtml(''); focusEl('su-rename-f'); }
      return;
    }
    const camp = OB.get.campaign('c1'); if (camp) camp.name = v;
    const list = OB.get.list('l1'); if (list) list.name = v;
    OB.closeOverlays(true);
    OB.render({ keepScroll: true });
    focusEl('su-rename-btn');
    OB.toast('Campaign renamed');
  });

  /* ======================================================================
     Day one: the campaign is live
     ====================================================================== */
  function firstPeople() {
    const ids = S.picks.shown.filter((x) => x.id).map((x) => x.id).concat(S.picks.pool);
    return ids.slice(0, S.firstDay.count).map((id, i) => {
      const p = peopleAt(id)[0];
      const at = S.firstDay.invites[i] || new Date(OB.d(S.firstDay.invites[0]).getTime() + i * 17 * 60000);
      return { name: p.name, title: p.title, company: OB.get.company(id).name, at };
    });
  }
  OB.route('day-one', () => {
    const camp = campaign();
    const paused = camp.status === 'paused';
    const c0 = conn();
    /* Day one follows a launch, which needs a connected account; from the Screens menu, fall back to the demo's */
    const c = c0.email || c0.linkedin || c0.x ? c0 : { email: true, linkedin: true, x: false, calendar: true };
    const r = reach(c);
    const firstCh = r.first || 'linkedin';
    const firstName = { linkedin: 'LinkedIn invite', email: 'email', x: 'X DM' }[firstCh];
    const people = firstPeople();
    const n = S.firstDay.count;
    const fe = firstEmailAfter(c);
    /* Today's batch, not the whole list (spec 5, The daily batch): who Onbook contacts today, and when */
    const batchFoot = `Contact details bought at ${fmt.time(S.firstDay.started)}, using ${n} of your ${fmt.num(D.plan.allowance)} credits.${fe ? ` First emails go out ${fe.day}, ${OB.plural(fe.gap, 'day')} after each ${firstCh === 'linkedin' ? 'invite' : 'first message'}.` : ''}`;
    return {
      shell: 'app', nav: 'campaigns', title: paused ? 'Campaign paused' : 'Your campaign is live', noBanners: true, usedOverride: S.firstDay.count,
      html: `
        ${ui.pageHead({
          icon: 'campaigns',
          crumbs: [{ label: 'Campaigns', href: '#campaigns' }, { label: camp.name, href: '#campaign.c1' }],
          title: paused ? 'Your campaign is paused' : 'Your campaign is live',
          sub: paused ? 'Nothing else sends from it, including messages queued for today. Replies still reach your Inbox.' : `${esc(camp.name)} started at ${fmt.time(S.firstDay.started)}. Nothing needs you until someone replies.`,
          actions: `${paused ? ui.btn({ label: 'Resume campaign', icon: 'play', size: 's', action: 'setup-resume', id: 'su-pause' }) : ui.btn({ label: 'Pause campaign', icon: 'pause', size: 's', action: 'setup-pause', id: 'su-pause' })}${ui.btn({ label: 'Go to Home', kind: 'primary', size: 's', href: '#home' })}`,
        })}
        <div class="su-day">
          <div class="su-cards">
            <section class="card card-flush su-card" aria-labelledby="su-d-batch">
              <div class="card-head">${icon('clock', 16)}<h2 id="su-d-batch">Today: ${n} new people</h2><span class="su-head-end">${paused ? ui.status('paused') : ui.status('running')}</span></div>
              <p class="su-card-hint">${paused ? `Paused, so they wait until you resume. Each weekday after that, Onbook picks the next ones within safe limits.` : `Each weekday Onbook picks the next ones within safe limits, starting at ${n} a day while your accounts warm up.`}</p>
              <ul class="su-rows su-starters" role="list" aria-label="${esc(`Starting today, each with ${firstName === 'email' ? 'an email' : `a ${firstName}`}`)}">${people.map((p) => `<li>
                ${ui.avatar(p.name)}
                <span class="su-starter-who"><span class="su-starter-name">${esc(p.name)}</span><span class="t-2 truncate">${esc(p.title)}, ${esc(p.company)}</span></span>
                <span class="su-starter-when">${ui.ch(firstCh, 13)}${esc(fmt.time(p.at))}</span>
              </li>`).join('')}</ul>
              <p class="su-card-foot">${esc(batchFoot)}</p>
            </section>
          </div>
          <div class="su-cards">
            <section class="card card-flush su-card" aria-labelledby="su-d-replies">
              <div class="card-head">${icon('inbox', 16)}<h2 id="su-d-replies">Where replies land</h2><a href="#inbox">Open the Inbox</a></div>
              <div class="su-card-body">
                <p>Replies on email, LinkedIn and X come to your Inbox, and Onbook emails you at ${esc(D.me.email)}. A reply stops everyone at that company at once.</p>
                <p class="t-small t-2">Most first replies arrive 2 to 5 days after a campaign starts.</p>
              </div>
            </section>
            <section class="card card-flush su-card" aria-labelledby="su-d-now">
              <div class="card-head">${icon('list', 16)}<h2 id="su-d-now">While you wait</h2></div>
              <ul class="su-rows su-todo" role="list">
                ${S.neverLater ? `<li><a class="su-link-row" href="#contacts.never"><span class="su-link-text"><span>Add your clients to never contact</span><span class="t-small t-2">You skipped this in setup. So nobody you already work with hears from Onbook.</span></span>${icon('chevron-right', 16)}</a></li>` : ''}
                <li><a class="su-link-row" href="#settings.team"><span class="su-link-text"><span>Invite a teammate, later</span><span class="t-small t-2">When you want help with replies. Each teammate subscribes for themselves.</span></span>${icon('chevron-right', 16)}</a></li>
              </ul>
            </section>
          </div>
        </div>`,
    };
  });
  OB.action('setup-pause', () => {
    const camp = OB.get.campaign('c1');
    if (!camp) return;
    OB.confirm({
      title: `Pause ${camp.name}?`,
      body: 'Nothing else sends from this campaign, including messages queued for today. Replies still reach your Inbox, and you can resume any time.',
      confirmLabel: 'Pause campaign',
      onConfirm: () => {
        camp.status = 'paused';
        camp.pausedOn = TODAY;
        OB.render({ keepScroll: true });
        focusEl('su-pause');
        OB.toast('Campaign paused', { undo: () => { camp.status = 'running'; OB.render({ keepScroll: true }); focusEl('su-pause'); } });
      },
    });
  });
  OB.action('setup-resume', () => {
    const camp = OB.get.campaign('c1');
    if (!camp) return;
    camp.status = 'running';
    OB.render({ keepScroll: true });
    focusEl('su-pause');
    OB.toast('Campaign resumed');
  });
})();
