/* Contacts: People, Companies, Lists, Never contact and Import, plus the person and company drawers.
   v4 (Attio): under the page bar sit the tabs and a toolbar (view filters left, search right), then a record
   table that runs edge to edge with column lines and 40px one-line rows. A row opens its record in a drawer
   drawn as Attio's record view: a header, an attribute list, then the activity timeline.
   Before subscribing nothing has been sent or bought, so Contacts shows the first list, not contacted, with
   names masked.
   Exposes OB.openPerson(id) and OB.openCompany(id): drawers that open over whatever page is showing.
   Exposes OB.contacts.exportDialog() and OB.contacts.findPerson(id) for other areas. */
(function () {
  'use strict';
  const OB = window.OB;
  const { esc, icon, ui, fmt } = OB;
  const D = OB.data;

  /* ---------- Demo data for this area (shared data stays untouched) ---------- */

  // Whole-workspace totals. The tables show a sample of OB.data.people.
  D.contactsTotals = D.contactsTotals || {
    people: 547, companies: 312, bought: 289,
    filters: { all: 547, campaign: 112, replied: 24, not: 236, ended: 175 },
  };

  // Companies and people that only appear on other lists (Token2049, UK payments, DeFi v2, partners, the import).
  D.ctCompanies = D.ctCompanies || [
    { id: 'riverstone', name: 'Riverstone Pay', domain: 'riverstonepay.com', industry: 'Payments', size: 38, location: 'Singapore', fit: 'Cross-border payments for exporters. Met at Token2049.', news: null },
    { id: 'helio', name: 'Helio Markets', domain: 'heliomarkets.io', industry: 'Exchanges and trading', size: 27, location: 'Dubai', fit: 'Broker app adding derivatives. Met at Token2049.', news: { text: 'Opened a Dubai office', source: 'Company newsroom', date: '2026-09-10', type: 'Entered a new market' } },
    { id: 'quill', name: 'Quillfi', domain: 'quill.fi', industry: 'DeFi protocols', size: 9, location: 'Remote', fit: 'Yield app with a small team. Met at Token2049.', news: null },
    { id: 'sterling', name: 'Sterling Rails', domain: 'sterlingrails.co.uk', industry: 'Payments', size: 58, location: 'London', fit: 'Open banking payments for retailers, Series A.', news: { text: 'Raised a $14M Series A', source: 'Company newsroom', date: '2026-09-29', type: 'Raised money' } },
    { id: 'parcel', name: 'Parcelpay', domain: 'parcelpay.co.uk', industry: 'Payments', size: 22, location: 'Leeds', fit: 'Pay-later checkout for small shops.', news: null },
    { id: 'aurora', name: 'Aurora Lend', domain: 'auroralend.xyz', industry: 'DeFi protocols', size: 16, location: 'Zug', fit: 'Lending protocol that shipped v2 in July.', news: { text: 'Launched v2 of its protocol', source: 'Company blog', date: '2026-07-14', type: 'Launching a product' } },
    { id: 'cinder', name: 'Cinder Swap', domain: 'cinderswap.xyz', industry: 'DeFi protocols', size: 13, location: 'Remote', fit: 'DEX that launched v2 with a points programme.', news: { text: 'Launched v2 with a points programme', source: 'Company post on X', date: '2026-07-16', type: 'Launching a product' } },
    { id: 'basalt', name: 'Basalt Finance', domain: 'basalt.finance', industry: 'DeFi protocols', size: 20, location: 'Paris', fit: 'Stablecoin vaults, v2 in beta.', news: null },
    { id: 'fold', name: 'Fold Studio', domain: 'foldstudio.co', industry: 'Design studio', size: 14, location: 'London', fit: 'Design partner on two client launches.', news: null },
    { id: 'hatch', name: 'Hatch Legal', domain: 'hatchlegal.com', industry: 'Legal services', size: 30, location: 'London', fit: 'Law firm that refers fintech founders.', news: null },
    { id: 'mesa', name: 'Mesa Research', domain: 'mesaresearch.io', industry: 'Crypto research', size: 8, location: 'Remote', fit: 'Research shop that shares launch data.', news: null },
    { id: 'kumo', name: 'Kumo Wallet', domain: 'kumowallet.com', industry: 'Fintech apps', size: 19, location: 'Tokyo', fit: 'Wallet app for traders. Met at Token2049.', news: null },
    { id: 'saltmarsh', name: 'Saltmarsh Pay', domain: 'saltmarsh.money', industry: 'Payments', size: 11, location: 'Singapore', fit: 'Stablecoin invoicing. Met at Token2049.', news: null },
    { id: 'vela', name: 'Vela Exchange', domain: 'vela.exchange', industry: 'Exchanges and trading', size: 33, location: 'Seoul', fit: 'Spot exchange planning a perps launch. Met at Token2049.', news: null },
  ];
  D.ctPeople = D.ctPeople || [
    // Token2049 contacts: imported 14 Sep, used by Token2049 follow-ups (paused)
    { id: 'p-tara', name: 'Tara Okafor', title: 'Head of Partnerships', company: 'riverstone', campaign: 'c3', stage: 'done', detail: 'No reply', progress: ['done', 'done', 'done'], email: 'tara@riverstonepay.com', revealed: true, imported: true },
    { id: 'p-omid', name: 'Omid Rahimi', title: 'Co-founder', company: 'helio', campaign: 'c3', stage: 'booked', detail: 'Call booked, Thu 1 Oct', progress: ['replied', 'stopped', 'stopped'], email: 'omid@heliomarkets.io', revealed: true, imported: true },
    { id: 'p-hannah', name: 'Hannah Cole', title: 'Head of Marketing', company: 'helio', campaign: 'c3', stage: 'stopped', detail: 'Stopped: Omid replied', progress: ['stopped', 'stopped', 'stopped'], email: 'hannah@heliomarkets.io', revealed: true, imported: true },
    { id: 'p-lucas', name: 'Lucas Meyer', title: 'Founder', company: 'quill', campaign: 'c3', stage: 'paused', detail: 'Paused with the campaign', progress: ['done', 'next', 'todo'], email: 'lucas@quill.fi', revealed: true, imported: true },
    // UK payments companies: a draft, so nobody is contacted and no details are bought
    { id: 'p-ian', name: 'Ian Shaw', title: 'CEO', company: 'sterling', campaign: 'c4', stage: 'not-contacted', detail: 'Starts at launch', progress: [], revealed: false },
    { id: 'p-maria', name: 'Maria Lopes', title: 'Head of Growth', company: 'parcel', campaign: 'c4', stage: 'not-contacted', detail: 'Starts at launch', progress: [], revealed: false },
    // DeFi v2 launches: finished
    { id: 'p-noah', name: 'Noah Becker', title: 'Co-founder', company: 'aurora', campaign: 'c5', stage: 'done', detail: 'No reply', progress: ['done', 'done', 'skip', 'done', 'done', 'done'], email: 'noah@auroralend.xyz', revealed: true },
    { id: 'p-zara', name: 'Zara Khan', title: 'Head of Growth', company: 'cinder', campaign: 'c5', stage: 'booked', detail: 'Call booked, Tue 4 Aug', progress: ['done', 'done', 'done', 'replied', 'stopped', 'stopped'], email: 'zara@cinderswap.xyz', x: '@zarakhan', revealed: true },
    { id: 'p-eli', name: 'Eli Navarro', title: 'CMO', company: 'basalt', campaign: 'c5', stage: 'done', detail: 'Not interested', progress: ['done', 'replied', 'stopped', 'stopped', 'stopped', 'stopped'], email: 'eli@basalt.finance', revealed: true },
    // Partners and friends: imported, not used by a campaign
    { id: 'p-hugo', name: 'Hugo Lam', title: 'Founder', company: 'fold', campaign: null, lists: ['l6'], stage: 'not-contacted', progress: [], email: 'hugo@foldstudio.co', revealed: true, imported: true },
    { id: 'p-nina', name: 'Nina Patel', title: 'Partner', company: 'hatch', campaign: null, lists: ['l6'], stage: 'not-contacted', progress: [], email: 'nina@hatchlegal.com', revealed: true, imported: true },
    { id: 'p-oscar', name: 'Oscar Reyes', title: 'Research Lead', company: 'mesa', campaign: null, lists: ['l6'], stage: 'not-contacted', progress: [], email: 'oscar@mesaresearch.io', revealed: true, imported: true },
  ];

  // When each flow step went out (aligned with the campaign's flow). Threads in OB.data win where they exist.
  const SENT = {
    'p-maya': ['2026-09-29T10:14', '2026-10-01T09:40', '2026-10-02T11:02', '2026-10-06T10:20'],
    'p-daniel': ['2026-09-28T09:55', '2026-09-30T09:31'],
    'p-priya': ['2026-10-01T10:30', '2026-10-05T09:12', '2026-10-06T14:30'],
    'p-grace': ['2026-09-25T10:05', '2026-09-28T09:30', '2026-09-29T11:40', '2026-09-30T10:10', '2026-10-05T09:15'],
    'p-ama': ['2026-09-25T09:50', '2026-09-28T10:20', null, '2026-09-30T11:00', '2026-10-05T10:30'],
    'p-leo': ['2026-09-30T09:45', '2026-10-02T09:20'],
    'p-jonas': ['2026-10-01T10:20', '2026-10-05T09:48'],
    'p-hana': ['2026-09-30T10:40', '2026-10-02T10:05'],
    'p-omar': ['2026-09-29T11:20', '2026-10-01T10:40'],
    'p-lena': ['2026-10-02T10:10', '2026-10-05T09:30'],
    'p-sofia': ['2026-10-06T10:00'],
    'p-ruben': ['2026-10-01T09:30', '2026-10-05T09:10', '2026-10-06T15:20'],
    'p-chloe': ['2026-10-01T11:15', '2026-10-05T10:05'],
    'p-tom': ['2026-09-28T10:30', '2026-09-30T09:45', '2026-10-01T11:10', '2026-10-02T10:00', '2026-10-06T09:50'],
    'p-isla': ['2026-10-06T11:40'],
    'p-yuki': ['2026-10-02T09:20', '2026-10-05T09:35', '2026-10-06T13:10'],
    'p-elena': ['2026-09-22T10:00', '2026-09-24T09:40', '2026-09-25T14:20', null, '2026-10-01T09:30', '2026-10-06T09:15'],
    'p-marcus': ['2026-09-22T11:30', '2026-09-24T10:10', null, '2026-09-28T10:40', '2026-10-01T09:55', '2026-10-06T10:20'],
    'p-felix': ['2026-09-30T10:20', '2026-10-01T09:30', '2026-10-05T09:40'],
    'p-rachel': ['2026-09-30T10:00', '2026-10-01T09:20', '2026-10-02T09:50', '2026-10-05T10:15'],
    'p-ines': [null, '2026-10-05T10:30'],
    'p-tara': ['2026-09-15T10:00', '2026-09-16T09:30', '2026-09-21T10:10'],
    'p-omid': ['2026-09-15T10:20'],
    'p-lucas': ['2026-10-01T10:00'],
    'p-noah': ['2026-07-21T10:00', '2026-07-23T09:30', null, '2026-07-27T10:40', '2026-07-30T09:20', '2026-08-04T10:00'],
    'p-zara': ['2026-07-22T10:15', '2026-07-24T09:50', '2026-07-27T11:30', '2026-07-29T10:05'],
    'p-eli': ['2026-08-03T09:40', '2026-08-05T10:10'],
  };
  const SKIP = {
    'p-ama': { 2: 'Skipped: the invite was not accepted' },
    'p-chloe': { 3: 'Skipped: no X account found' },
    'p-elena': { 3: 'Skipped: X DMs are closed' },
    'p-marcus': { 2: 'Skipped: the invite was not accepted' },
    'p-ines': { 0: 'Skipped: X DMs are closed' },
    'p-noah': { 2: 'Skipped: the invite was not accepted' },
  };
  // Replies and bookings for people without a thread in the demo data
  const EVENTS = {
    'p-felix': { reply: { at: '2026-10-05T17:30', ch: 'email', text: 'Sounds good. Grabbed a slot for Tuesday.' }, booked: { at: '2026-10-05T17:42', call: '2026-10-13T10:00' } },
    'p-omid': { reply: { at: '2026-09-17T09:05', ch: 'email', text: 'Good to meet you at the booth. Happy to talk once the event rush is over.' }, booked: { at: '2026-09-17T11:00', call: '2026-10-01T15:00' } },
    'p-zara': { reply: { at: '2026-07-30T08:45', ch: 'x', text: 'timing is good, we have budget for the v2 push. got a calendar link?' }, booked: { at: '2026-07-30T16:00', call: '2026-08-04T11:00' } },
    'p-eli': { reply: { at: '2026-08-06T09:20', ch: 'email', text: 'Thanks, but we handle growth in-house.' } },
  };
  // Added later by "Keep finding companies like these"
  const FOUND = { 'p-diego': '2026-10-02', 'p-wei': '2026-10-05' };
  // Lists beyond the one their campaign uses (a person can be on many lists)
  const LIST_EXTRA = { 'p-maya': ['l2'], 'p-ben': ['l2'], 'p-daniel': ['l4'], 'p-rosa': ['l4'] };


  /* ---------- Before subscribing ---------- */
  // Nothing is sent and no contact details are bought before the first payment. The first campaign's people show
  // as not contacted with masked names; people you imported keep the names they came with.
  const prePay = () => !OB.state.sim.subscribed;
  const FIRST = 'c1';
  const PREPAY_TOTALS = { people: 209, companies: 116, bought: 23, filters: { all: 209, campaign: 0, replied: 0, not: 209, ended: 0 }, coFilters: { all: 116, flow: 0, stopped: 0, not: 116 } };
  // Whole-workspace company counts for the Companies filters (the rest have ended or are on never contact)
  D.contactsTotals.coFilters = D.contactsTotals.coFilters || { all: 312, flow: 104, stopped: 24, not: 118 };
  function beforePay(p) {
    const never = !!p.ctNever;
    return Object.assign({}, p, {
      stage: never ? 'done' : 'not-contacted', detail: never ? 'Never contact' : null, revealed: false,
      progress: (p.progress || []).map(() => (never ? 'stopped' : 'todo')), next: null, thread: null, last: null, prepay: true,
    });
  }

  /* ---------- Lookups ---------- */
  const rawPeople = () => D.people.concat(D.ctPeople);
  const allPeople = () => (prePay()
    ? D.people.filter((p) => p.campaign === FIRST).map(beforePay).concat(D.ctPeople.filter((p) => !p.campaign))
    : rawPeople());
  const allCompanies = () => {
    const all = D.companies.concat(D.ctCompanies);
    if (!prePay()) return all;
    const ids = new Set(allPeople().map((p) => p.company));
    return all.filter((c) => ids.has(c.id));
  };
  const findPerson = (id) => allPeople().find((p) => p.id === id);
  const rawPerson = (id) => rawPeople().find((p) => p.id === id);
  const findCompany = (id) => allCompanies().find((c) => c.id === id);
  const companyOf = (p) => findCompany(p.company) || { id: '', name: 'Unknown company', domain: '', industry: '', size: 0, location: '' };
  const peopleAt = (cid) => allPeople().filter((p) => p.company === cid);
  // Before subscribing, the first campaign is ready to launch rather than running
  const camp = (id) => { const c = id ? OB.get.campaign(id) : null; return c && prePay() && c.id === FIRST ? Object.assign({}, c, { status: 'ready' }) : c; };
  const campaignOf = (p) => camp(p.campaign);
  const flowOf = (p) => { const c = campaignOf(p); return c && c.flow ? OB.get.flow(c.flow) : null; };
  const threadOf = (p) => (p.prepay ? null : (p.thread ? OB.get.thread(p.thread) : D.threads.find((t) => t.person === p.id)) || null);
  const listsAll = () => (prePay() ? D.lists.filter((l) => l.campaign === FIRST || !l.campaign) : D.lists);
  const neverAll = () => (prePay() ? D.never.filter((n) => n.by !== 'Onbook') : D.never);
  const T = () => (prePay() ? PREPAY_TOTALS : D.contactsTotals);
  const firstName = (p) => String(p.name).split(' ')[0];
  const nameText = (p) => { if (p.revealed) return p.name; const [f, ...r] = String(p.name).split(' '); return r.length ? `${f} ${r[r.length - 1][0]}.` : f; };
  const chWords = (ch) => ({ email: 'by email', linkedin: 'on LinkedIn', x: 'on X', calendar: 'through your booking link' }[ch] || '');
  const campaignHref = (c) => (c.status === 'draft' ? '#new-campaign.flow' : c.status === 'ready' ? '#setup-launch' : `#campaign.${c.id}`);
  const newer = (a, b) => (!b || (a && OB.d(a) > OB.d(b)) ? a : b);
  const addDays = (s, n) => { const d = new Date(OB.d(s)); d.setDate(d.getDate() + n); return d; };
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const hasTime = (s) => String(s).includes('T');
  const whenText = (s) => (hasTime(s) ? fmt.dt(s) : fmt.day(s));
  function touchText(s) {
    if (OB.isToday(s)) return `Today, ${fmt.time(s).replace(' ', '\u00a0')}`;
    if (iso(OB.d(s)) === iso(addDays(OB.TODAY, -1))) return 'Yesterday';
    return fmt.day(s);
  }
  const overlayOpen = () => { const ov = document.getElementById('overlay'); return !!(ov && ov.innerHTML); };
  const hashNow = () => location.hash.replace(/^#/, '');

  /* ---------- What happened to a person ---------- */
  function sentAt(p, i) {
    if (p.prepay) return null;
    const flow = flowOf(p); const t = threadOf(p);
    if (t && flow && flow.steps[i]) { const m = t.messages.find((x) => x.dir === 'out' && x.step === flow.steps[i].id); if (m) return m.at; }
    const arr = SENT[p.id];
    return arr && arr[i] ? arr[i] : null;
  }
  function subjectAt(p, i) {
    const flow = flowOf(p); const t = threadOf(p);
    if (!t || !flow || !flow.steps[i]) return '';
    const m = t.messages.find((x) => x.dir === 'out' && x.step === flow.steps[i].id);
    return m && m.subject ? m.subject : '';
  }
  function replyOf(p) {
    if (p.prepay) return null;
    const t = threadOf(p);
    if (t) { const m = t.messages.find((x) => x.dir === 'in'); if (m) return { at: m.at, ch: m.ch, text: m.body, kind: t.type }; }
    const e = EVENTS[p.id];
    return e && e.reply ? Object.assign({ kind: 'reply' }, e.reply) : null;
  }
  function bookingOf(p) {
    if (p.prepay) return null;
    const t = threadOf(p);
    if (t && t.booking && t.type === 'booking') { const ev = t.messages.find((m) => m.dir === 'event'); return { at: ev ? ev.at : t.at, call: t.booking.at, noReply: !!t.booking.noReply }; }
    const e = EVENTS[p.id];
    return e && e.booked ? { at: e.booked.at, call: e.booked.call } : null;
  }
  const youReplied = (p) => { const t = threadOf(p); return t ? t.messages.filter((m) => m.you) : []; };
  function firstSent(p) {
    const flow = flowOf(p); let best = null;
    if (flow) flow.steps.forEach((s, i) => { const a = sentAt(p, i); if (a && (!best || OB.d(a) < OB.d(best))) best = a; });
    return best;
  }
  function lastTouch(p) {
    const flow = flowOf(p); let best = null;
    if (flow) flow.steps.forEach((s, i) => { best = newer(sentAt(p, i), best); });
    const r = replyOf(p); if (r) best = newer(r.at, best);
    youReplied(p).forEach((m) => { best = newer(m.at, best); });
    return newer(p.last || null, best);
  }
  // Contact details are bought the day before the first message; imported people bring their own.
  function boughtOn(p) {
    if (!p.revealed || p.imported) return null;
    const s0 = firstSent(p) || (p.next && p.next.at);
    if (!s0) return null;
    // On launch day the first batch is bought and sent the same day, so never before the person was found.
    const c = campaignOf(p); const l = c && c.list ? OB.get.list(c.list) : null;
    const found = FOUND[p.id] || (l && l.created);
    const day = iso(addDays(s0, -1));
    return found && found > day ? found : day;
  }
  const listIdsOf = (p) => {
    const c = campaignOf(p);
    const own = p.prepay ? [] : [...(p.lists || []), ...(LIST_EXTRA[p.id] || [])];
    const ids = [c && c.list, ...own, ...((OB.state.ui.ctAddedLists || {})[p.id] || [])].filter(Boolean);
    const ok = listsAll();
    return ids.filter((id, i) => ids.indexOf(id) === i && ok.some((l) => l.id === id));
  };
  const listPeople = (l) => allPeople().filter((p) => listIdsOf(p).includes(l.id));

  /* Why a company stopped: the data says so, or someone there replied or booked */
  function stopInfo(co) {
    if (!co || !co.id || prePay()) return null;
    if (co.stopped) return { by: co.stopped.by, at: co.stopped.at, why: co.stopped.why };
    const hit = peopleAt(co.id).find((p) => { const r = replyOf(p); return (r && r.kind !== 'auto') || p.stage === 'booked'; });
    if (!hit) return null;
    const r = replyOf(hit); const b = bookingOf(hit);
    if (r && r.kind !== 'auto') return { by: hit.id, at: r.at, why: `${hit.name} replied ${chWords(r.ch)}` };
    return { by: hit.id, at: b ? b.at : null, why: `${hit.name} booked a call` };
  }
  const neverEntryFor = (match) => neverAll().find(match);
  const companyNever = (co) => neverEntryFor((n) => n.type === 'Company' && (n.value === co.name || n.detail === co.domain));
  const personNever = (p) => neverEntryFor((n) => n.type === 'Person' && n.pid === p.id) || (p.detail === 'Opted out' ? neverEntryFor((n) => n.type === 'Person' && n.value === p.name) : null);

  /* ---------- Status: always the shared soft tags ---------- */
  const stageTag = (p) => ui.stage(p.stage, p.detail);

  // A company's state in one tag and one grey line. A company stopped by a reply shows that person's stage, so
  // the ones that need you stand out in the table; the drawer says plainly that everyone there stopped.
  function companyStatus(co) {
    const never = companyNever(co);
    if (never) return { tag: ui.tag('quiet', 'Never contact'), label: 'Never contact', why: never.reason, key: 'never' };
    const stop = stopInfo(co);
    if (stop) {
      const who = findPerson(stop.by);
      const tag = !who ? ui.stage('stopped') : who.stage === 'booked' ? ui.stage('booked') : stageTag(who);
      return { tag, label: 'Stopped', why: stop.why, key: 'stopped' };
    }
    const ppl = peopleAt(co.id);
    if (ppl.length && ppl.every((p) => p.ctNever)) return { tag: ui.stage('stopped'), label: 'Stopped', why: 'Everyone here is on never contact', key: 'stopped' };
    const paused = ppl.find((p) => p.stage === 'paused');
    if (paused) {
      const until = /until (.+)$/.exec(paused.detail || '');
      return { tag: ui.stage('paused'), label: 'Paused', why: until ? `${nameText(paused)}, until ${until[1]}` : `${nameText(paused)}, while the campaign is paused`, key: 'paused' };
    }
    const active = ppl.find((p) => p.stage === 'in-flow');
    if (active) {
      const f = flowOf(active); const ni = active.progress.indexOf('next');
      const n = ni >= 0 ? ni + 1 : active.progress.filter((s) => s === 'done' || s === 'skip').length + 1;
      return { tag: ui.stage('in-flow'), label: 'In flow', why: `${nameText(active)}, step ${n} of ${f ? f.steps.length : n}`, key: 'flow' };
    }
    const ended = ppl.find((p) => p.stage === 'done' && !p.ctNever);
    if (ended) return { tag: ui.stage('done', 'Flow ended'), label: 'Flow ended', why: `No reply from ${nameText(ended)}`, key: 'ended' };
    const wait = ppl.find((p) => p.stage === 'not-contacted');
    const why = !wait ? 'Nobody here yet' : wait.prepay ? 'Starts after you launch' : wait.detail ? wait.detail : wait.campaign ? 'In the queue' : 'Not in a campaign';
    return { tag: ui.stage('not-contacted'), label: 'Not contacted', why, key: 'not' };
  }

  /* ---------- Flow steps, activity and counting ---------- */
  const clip = (s, n = 90) => { const t = String(s || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1).trim() + '\u2026' : t; };
  // What the prospect wrote, without the greeting and the sign-off
  function spoken(body) {
    const parts = String(body || '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
    if (parts.length > 1 && /^(hi|hey|hello|dear)\b[^.!?]*,$/i.test(parts[0])) parts.shift();
    if (parts.length > 1 && /^[A-Z][a-z]+\.?$/.test(parts[parts.length - 1])) parts.pop();
    return parts.join(' ');
  }
  const relWords = (s) => fmt.rel(s).replace(/^(Today|Yesterday|Tomorrow|Just now)/, (m) => m.toLowerCase());
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function startFromDetail(p) {
    const m = /(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/.exec(p.detail || '');
    return m ? new Date(2026, MONTHS.indexOf(m[2]), Number(m[1]), 9, 0) : null;
  }
  function stepText(p, i, st, firstTodo) {
    const flow = flowOf(p); const s = flow.steps[i]; const c = campaignOf(p); const sim = OB.state.sim;
    const at = sentAt(p, i);
    if (st === 'done') return at ? `Sent ${fmt.dt(at)}` : 'Sent';
    if (st === 'replied') { const r = replyOf(p); return `Sent${at ? ' ' + fmt.day(at) : ''}. ${firstName(p)} replied${r ? ' ' + fmt.day(r.at) : ''}`; }
    if (st === 'next') {
      if (c && c.status === 'paused') return 'Sends when the campaign is resumed';
      if (sim.paymentFailed) return 'Paused until your card is updated';
      if (sim.linkedinIssue && s.ch === 'linkedin') return 'Paused until you reconnect LinkedIn';
      if (p.next && p.next.step === s.id) return p.next.at ? `Next: ${fmt.rel(p.next.at)}` : `Sends when ${firstName(p)} accepts the invite`;
      return 'Next';
    }
    if (st === 'skip') return (SKIP[p.id] && SKIP[p.id][i]) || 'Skipped: no way to reach them on this channel';
    if (st === 'stopped') {
      if (p.ctNever) return 'Not sent: on never contact';
      const stop = stopInfo(companyOf(p));
      return stop ? `Not sent: ${stop.why}` : 'Not sent';
    }
    if (p.prepay) return i === 0 ? 'Sends after you launch' : 'Not sent yet';
    if (i === firstTodo && p.stage === 'paused' && p.detail) return p.detail;
    if (s.ch === 'linkedin' && s.kind === 'message' && p.progress.some((x, j) => j < i && x === 'done' && flow.steps[j].kind === 'invite')) return `Sends after ${firstName(p)} accepts the invite`;
    if (i === firstTodo && p.stage === 'not-contacted' && p.detail) return p.detail;
    return 'Not sent yet';
  }

  function eventsOf(p) {
    const ev = [];
    const c = campaignOf(p); const flow = flowOf(p); const co = companyOf(p);
    const lid = listIdsOf(p)[0]; const l = lid ? OB.get.list(lid) : null;
    if (l) {
      if (p.imported) ev.push({ at: l.created, ic: 'upload', text: `Imported into "${l.name}"` });
      else if (FOUND[p.id] && !p.prepay) ev.push({ at: FOUND[p.id], ic: 'search', text: `Added to "${l.name}" by Keep finding companies like these` });
      else ev.push({ at: l.created, ic: 'search', text: `Found in "${l.name}"` });
    }
    const bought = boughtOn(p);
    if (bought) ev.push({ at: bought, ic: 'check', text: 'Contact details bought, counted once toward your 1,000' });
    else if (p.imported && c && c.started && firstSent(p)) ev.push({ at: c.started, ic: 'check', text: `Picked up by "${c.name}", counted once toward your 1,000` });
    if (flow) {
      flow.steps.forEach((s, i) => {
        const at = sentAt(p, i);
        if (!at) return;
        const subj = subjectAt(p, i);
        const link = /booking link/i.test(s.purpose || '') ? ', with your booking link' : '';
        ev.push({ at, ch: s.ch, text: `${s.title} sent${subj ? `: "${subj}"` : ''}${link}` });
      });
    }
    const r = replyOf(p);
    if (r && r.kind === 'auto') {
      ev.push({ at: r.at, ic: 'clock', text: `Auto-reply: "${clip(r.text)}"` });
      const t = threadOf(p);
      if (t && t.pausedUntil) ev.push({ at: r.at, ic: 'pause', text: `Paused until ${fmt.day(t.pausedUntil)}. An auto-reply is not a reply, so ${co.name} is not stopped` });
    } else if (r && r.kind === 'optout') {
      ev.push({ at: r.at, ch: r.ch, text: `Asked to be removed ${chWords(r.ch)}`, quote: clip(spoken(r.text), 140) });
      ev.push({ at: r.at, ic: 'lock', text: 'Added to never contact for good' });
    } else if (r) {
      ev.push({ at: r.at, ch: r.ch, text: `Replied ${chWords(r.ch)}`, quote: clip(spoken(r.text), 140) });
    }
    const b = bookingOf(p);
    if (b) ev.push({ at: b.at, ic: 'calendar', text: `Call booked for ${fmt.dt(b.call)}${b.noReply ? ', without replying' : ''}` });
    youReplied(p).forEach((m) => ev.push({ at: m.at, ic: 'reply', text: 'You replied' }));
    const stop = stopInfo(co);
    if (stop && stop.at) {
      if (stop.by === p.id) ev.push({ at: stop.at, ic: 'stop', text: `Messages to everyone at ${co.name} stopped` });
      else if (p.progress.includes('stopped') && !p.ctNever) ev.push({ at: stop.at, ic: 'stop', text: `Stopped: ${stop.why}${firstSent(p) ? '' : `. ${firstName(p)} was never contacted`}` });
    }
    if (r && /^Check back/.test(p.detail || '')) ev.push({ at: r.at, ic: 'clock', text: `You chose "${p.detail}". ${co.name} waits until then, then gets one fresh message` });
    if (r && p.detail === 'Not interested') ev.push({ at: r.at, ic: 'check', text: 'You marked it not interested' });
    if (p.detail === 'No reply') { const last = lastTouch(p); if (last) ev.push({ at: last, ic: 'check', text: 'Flow ended with no reply' }); }
    if (c && c.status === 'paused' && c.pausedOn && p.stage === 'paused') ev.push({ at: c.pausedOn, ic: 'pause', text: `You paused "${c.name}"` });
    if (p.ctNever) ev.push({ at: p.ctNever, ic: 'lock', text: 'You added this person to never contact' });
    return ev.sort((a, z) => OB.d(a.at) - OB.d(z.at));
  }
  // Attio's activity timeline: small round marks on a thin line, newest last, the prospect's words in a soft box
  function timeline(p) {
    const ev = eventsOf(p);
    if (!ev.length) return '<p class="t-small t-2">Nothing has happened yet.</p>';
    return `<ol class="ct-tl">${ev.map((e) => `<li><span class="ct-tl-mark" aria-hidden="true">${e.ch ? OB.mark(e.ch, 12) : icon(e.ic || 'info', 13)}</span><span class="ct-tl-body"><span>${esc(e.text)}</span>${e.quote ? `<span class="t-quote ct-tl-quote">${esc(e.quote)}</span>` : ''}<span class="ct-tl-when num">${esc(whenText(e.at))}</span></span></li>`).join('')}</ol>`;
  }
  function maskedNote(p) {
    const f = firstName(p); const c = campaignOf(p);
    let line;
    if (p.ctNever) line = `${f} is on never contact, so the details are never bought and ${f} never counts toward your 1,000.`;
    else if (p.prepay) line = `Nothing is sent before you subscribe. Onbook buys ${f}'s contact details the day before the first message, once "${c ? c.name : 'the campaign'}" launches. That is when ${f} counts toward your 1,000, once.`;
    else if (p.stage === 'stopped' || (stopInfo(companyOf(p)) && !firstSent(p))) line = `${f} was never contacted, so the details were never bought and never counted toward your 1,000.`;
    else if (c && c.status === 'draft') line = `Onbook buys ${f}'s contact details the day before the first message, once "${c.name}" launches. That is when ${f} counts toward your 1,000, once.`;
    else {
      const start = (p.next && p.next.at) || startFromDetail(p);
      const buy = start ? addDays(start, -1) : null;
      const when = !buy ? 'the day before the first message' : iso(buy) === iso(OB.TODAY) ? 'later today, the day before the first message' : `on ${fmt.day(buy)}, the day before the first message`;
      line = `Onbook buys ${f}'s contact details ${when}. That is when ${f} counts toward your 1,000, once.`;
      if (OB.state.sim.outOfPeople) line += ` This month's 1,000 are used, so that waits until 1 Nov unless you buy credits.`;
    }
    return `<div class="ct-callout">${icon('lock', 16)}<p><span class="t-medium">Full name appears the day before their first message.</span> <span class="t-2">${esc(line)}</span></p></div>`;
  }
  const NEWS_DAYS = { 'Raised money': 90, 'Launching a product': 45, 'New exchange listing': 30, 'Entered a new market': 120 };
  function freshLine(n) {
    if (n.type === 'Hiring a growth lead') return 'Messages can mention it while the job post is live.';
    const days = NEWS_DAYS[n.type] || 30;
    const until = addDays(n.date, days);
    if (until < OB.TODAY) return `Too old to mention now: news like this is used for ${days} days.`;
    return `Messages can mention it until ${fmt.day(until)}.`;
  }
  const slug = (name) => String(name).toLowerCase().replace(/[^a-z]/g, '');

  /* ---------- Record view pieces (drawers) ---------- */
  // Attio's record header: the tile, the name and one grey line, with Close on the right
  const recordHead = (tile, title, sub) => `<div class="drawer-head ct-head">${tile}<div class="ct-head-text"><h2>${title}</h2>${sub ? `<p class="t-small t-2">${sub}</p>` : ''}</div>${ui.iconBtn({ icon: 'x', label: 'Close', action: 'close-overlay' })}</div>`;
  // Attio's attribute list: a grey label column with a small icon, and the value beside it
  const attrList = (rows, label) => `<dl class="ct-attrs" aria-label="${esc(label)}">${rows.filter(Boolean).map(([ic, name, value]) => `<div class="ct-attr"><dt>${ic}<span>${esc(name)}</span></dt><dd>${value}</dd></div>`).join('')}</dl>`;
  const sec = (id, title, body, aside) => `<section class="ct-block ct-sec" aria-labelledby="${id}"><div class="ct-sec-head"><h3 id="${id}">${esc(title)}</h3>${aside || ''}</div>${body}</section>`;
  const block = (html) => `<div class="ct-block">${html}</div>`;
  const companyButton = (co) => (co.id
    ? `<button type="button" class="rec ct-recbtn" data-action="ct-company" data-arg="${esc(co.id)}">${ui.co(co.name, 'sm')}<span>${esc(co.name)}</span></button>`
    : '<span class="t-2">Unknown company</span>');
  const campaignLink = (c) => `<a href="${campaignHref(c)}">${esc(c.name)}</a>`;

  /* ---------- Person drawer ---------- */
  // The latest thing the person said, in a soft card, with the way into the Inbox
  function replyCard(p, t) {
    const ins = t.messages.filter((m) => m.dir === 'in');
    const last = ins[ins.length - 1];
    const mine = t.messages.filter((m) => m.you).pop();
    const b = bookingOf(p);
    let title; let mark; let at; let text;
    if (last) {
      mark = icon(t.type === 'auto' ? 'clock' : 'reply', 14); at = last.at;
      title = t.type === 'auto' ? `Auto-reply ${chWords(last.ch)}` : t.type === 'optout' ? `Asked to be removed ${chWords(last.ch)}` : `Replied ${chWords(last.ch)}`;
      text = `<p class="ct-said${t.type === 'auto' ? ' t-2' : ''}">${esc(clip(spoken(last.body), t.type === 'auto' ? 180 : 260))}</p>`;
    } else if (b) {
      mark = icon('calendar', 14); at = b.at; title = b.noReply ? 'Booked without replying' : 'Booked a call';
      text = `<p class="ct-said">${esc(`Booked ${fmt.dt(b.call)} through your booking link.`)}</p>`;
    } else {
      mark = icon('message', 14); at = t.at; title = 'Conversation';
      text = `<p class="ct-said">${esc(t.preview)}</p>`;
    }
    return `<section class="ct-block" aria-labelledby="ctp-conv"><div class="ct-reply">
        <div class="ct-reply-head"><span class="ct-reply-mark" aria-hidden="true">${mark}</span><h3 id="ctp-conv">${esc(title)}</h3><span class="ct-reply-when">${esc(fmt.rel(at))}</span><a class="ct-reply-link" href="#inbox.${esc(t.id)}">Open in Inbox</a></div>
        ${text}
        ${mine ? `<p class="t-small t-2">${esc(`You replied ${relWords(mine.at)}`)}</p>` : ''}
      </div></section>`;
  }
  function flowSection(p) {
    const flow = flowOf(p); const c = campaignOf(p);
    const firstTodo = p.progress.indexOf('todo');
    const aside = flow ? `<span class="ct-sec-aside">${OB.plural(flow.steps.length, 'step')}</span>` : '';
    if (flow && p.progress.length && p.progress.every((x) => x === 'stopped')) {
      const stopNow = stopInfo(companyOf(p));
      return sec('ctp-flow', 'Flow', `<div class="ct-flow-none">${ui.strip(flow.steps, p.progress)}<p class="t-small t-2">${esc(p.ctNever ? `None of the ${flow.steps.length} steps will be sent: ${firstName(p)} is on never contact.` : `None of the ${flow.steps.length} steps were sent${stopNow ? `: ${stopNow.why}` : ''}.`)}</p></div>`, aside);
    }
    if (flow) {
      return sec('ctp-flow', 'Flow', `<ol class="ct-steps">${flow.steps.map((s, i) => { const k = p.progress[i] || 'todo'; return `<li class="is-${k}"><span class="ct-node ${k}" aria-hidden="true">${OB.mark(s.ch, 11)}</span><span class="ct-step-name">${esc(s.title)}</span><span class="ct-step-text">${esc(stepText(p, i, k, firstTodo))}</span></li>`; }).join('')}</ol>`, aside);
    }
    if (c && c.status === 'draft') return sec('ctp-flow', 'Flow', `<p class="t-small t-2">"${esc(c.name)}" is a draft. Nothing is sent until its flow is approved and it launches.</p>`);
    return '';
  }
  // The next step in words, or why it waits
  function nextLine(p) {
    if (p.prepay || !p.next || p.ctNever || !['in-flow', 'paused', 'not-contacted'].includes(p.stage)) return '';
    const c = campaignOf(p); const flow = flowOf(p); const s = flow && flow.steps.find((x) => x.id === p.next.step);
    const sim = OB.state.sim;
    if (c && c.status === 'paused') return `${s ? `${s.title}, ` : ''}when the campaign is resumed`;
    if (sim.paymentFailed) return `${s ? `${s.title}, ` : ''}paused until your card is updated`;
    if (sim.linkedinIssue && s && s.ch === 'linkedin') return `${s.title}, paused until you reconnect LinkedIn`;
    return OB.nextText(p);
  }
  function personDrawer(p) {
    const co = companyOf(p); const c = campaignOf(p); const t = threadOf(p);
    const never = p.ctNever || p.detail === 'Opted out' || personNever(p);
    const st = companyStatus(co);
    const lists = listIdsOf(p).map((id) => OB.get.list(id));
    const next = nextLine(p);
    const rows = [
      [icon('flag', 14), 'Stage', stageTag(p)],
      next ? [icon('clock', 14), 'Next step', esc(next)] : null,
      [icon('campaigns', 14), 'Campaign', c ? `${campaignLink(c)}${c.status !== 'running' ? ` ${ui.status(c.status)}` : ''}` : '<span class="t-2">Not in a campaign</span>'],
      [icon('building', 14), 'Company', `<span class="ct-dd-line">${companyButton(co)}</span>${co.id ? `<span class="ct-dd-sub">${esc(`${st.label}: ${st.why}`)}</span>` : ''}`],
      p.revealed && p.email ? [icon('mail', 14), 'Email', `<span class="ct-ell">${esc(p.email)}</span>`] : null,
      p.revealed ? [OB.mark('linkedin', 14), 'LinkedIn', `<span class="ct-ell">linkedin.com/in/${esc(slug(p.name))}</span>`] : null,
      p.revealed && p.x ? [OB.mark('x', 14), 'X', esc(p.x)] : null,
      [icon('list', 14), 'Lists', lists.length ? lists.map((l) => `<span class="ct-dd-line"><a href="#contacts.list.${esc(l.id)}">${esc(l.name)}</a>${l.campaign && p.campaign && l.campaign !== p.campaign ? '<span class="t-2">, skipped there: already in another campaign</span>' : ''}</span>`).join('') : '<span class="t-2">Not on any list</span>'],
      never ? [icon('lock', 14), 'Never contact', '<span>Yes, for good</span>'] : null,
    ];
    const foot = `<div class="drawer-foot ct-foot-bar">${never ? '' : ui.btn({ label: 'Never contact', kind: 'ghost', cls: 'ct-danger-text', action: 'ct-never-person', arg: p.id })}${ui.btn({ label: 'Add to list', icon: 'plus', action: 'ct-add-list', arg: p.id })}</div>`;
    return `${recordHead(ui.avatar(nameText(p), 'lg'), ui.person(p), esc(`${p.title} at ${co.name}`))}
      <div class="drawer-body ct-dbody">
        ${p.revealed ? '' : block(maskedNote(p))}
        ${t ? replyCard(p, t) : ''}
        ${block(attrList(rows, 'Details'))}
        ${flowSection(p)}
        ${sec('ctp-hist', 'Activity', timeline(p))}
      </div>${foot}`;
  }

  /* ---------- Company drawer ---------- */
  function companyDrawer(co) {
    const ppl = peopleAt(co.id); const stop = stopInfo(co); const st = companyStatus(co); const never = companyNever(co);
    const camps = ppl.map(campaignOf).filter((c, i, a) => c && a.findIndex((x) => x && x.id === c.id) === i);
    const n = co.news;
    const callout = (ic, title, line) => block(`<div class="ct-callout">${icon(ic, 16)}<p><span class="t-medium">${esc(title)}</span> <span class="t-2">${esc(line)}</span></p></div>`);
    const state = never
      ? callout('lock', 'On never contact.', `Added ${fmt.day(never.added)}, reason: ${never.reason}. No campaign or teammate contacts anyone here.`)
      : stop ? callout('hand', `Messages stopped${stop.at ? ' ' + whenText(stop.at) : ''}.`, `${stop.why}, so nobody else at ${co.name} gets another message, in any campaign or from any teammate.`) : '';
    const rows = [
      never || stop ? null : [icon('flag', 14), 'Status', `<span class="ct-pair">${st.tag}<span class="ct-why">${esc(st.why)}</span></span>`],
      [icon('target', 14), 'Industry', esc(co.industry)],
      co.size ? [icon('contacts', 14), 'Size', `<span class="num">${esc(co.size)}</span> staff`] : null,
      co.location ? [icon('globe', 14), 'Location', esc(co.location)] : null,
      co.domain ? [icon('link', 14), 'Website', esc(co.domain)] : null,
      [icon('zap', 14), 'Latest news', n ? `<span class="ct-dd-line">${esc(n.text)}</span><span class="ct-dd-sub">${esc(`${n.source}, ${fmt.day(n.date)}, ${fmt.ago(n.date)}. ${freshLine(n)}`)}</span>` : '<span class="t-2">No recent news. Campaigns set to skip companies without news leave it out; the others write from the person\'s role.</span>'],
      [icon('check', 14), 'Why it fits', esc(co.fit)],
      camps.length ? [icon('campaigns', 14), 'Campaigns', camps.map((c) => `<span class="ct-dd-line">${campaignLink(c)} ${ui.status(c.status)}</span>`).join('')] : null,
    ];
    const people = sec('ctc-people', 'People', `<ul class="ct-plist" role="list">${ppl.map((p) => `<li><button type="button" class="ct-prow" data-action="ct-person" data-arg="${esc(p.id)}">${ui.avatar(nameText(p), 'sm')}<span class="ct-prow-name">${ui.person(p)}</span><span class="ct-prow-title">${esc(p.title)}</span>${stageTag(p)}</button></li>`).join('')}</ul>
      <p class="t-small t-2">Onbook contacts one person here at a time, best fit first. The next starts only when the flow before ends with no reply.</p>`, `<span class="ct-sec-aside num">${ppl.length}</span>`);
    const foot = never ? '' : `<div class="drawer-foot ct-foot-bar">${ui.btn({ label: 'Never contact this company', kind: 'ghost', cls: 'ct-danger-text', action: 'ct-never-company', arg: co.id })}</div>`;
    return `${recordHead(ui.co(co.name), esc(co.name), esc(co.domain))}
      <div class="drawer-body ct-dbody">
        ${state}
        ${block(attrList(rows, 'Details'))}
        ${people}
      </div>${foot}`;
  }

  /* ---------- Opening drawers (also from other areas) ---------- */
  const DRAWER_ROUTE = /^contacts\.(person|company)\./;
  // A drawer opened from its own route puts the plain tab back in the address when it closes, so later renders don't reopen it.
  function closer() {
    const at = hashNow();
    return () => { if (hashNow() === at && DRAWER_ROUTE.test(at)) OB.replaceHash(at.indexOf('contacts.person.') === 0 ? 'contacts' : 'contacts.companies'); };
  }
  OB.openPerson = (id) => {
    const p = findPerson(id);
    if (!p) { OB.toast('That person is no longer in your contacts.'); return; }
    OB.drawer(personDrawer(p), { label: `Contact: ${nameText(p)}`, onClose: closer() });
  };
  OB.openCompany = (id) => {
    const co = findCompany(id);
    if (!co) { OB.toast('That company is no longer in your contacts.'); return; }
    OB.drawer(companyDrawer(co), { label: `Company: ${co.name}`, onClose: closer() });
  };
  OB.action('ct-person', (el, e, id) => OB.openPerson(id));
  OB.action('ct-company', (el, e, id) => OB.openCompany(id));

  // Dialogs opened from a drawer return to it on Cancel or Escape.
  let skipBack = false;
  let pendingConfirm = null;
  function dialogOver(back, html, opts) {
    const at = hashNow();
    OB.dialog(html, Object.assign({}, opts, { onClose: () => { if (skipBack) { skipBack = false; return; } if (back && hashNow() === at) setTimeout(back, 0); } }));
  }
  function closeDialogThen(fn) { skipBack = true; OB.closeOverlays(true); skipBack = false; if (fn) fn(); }
  function confirmOver(back, { title, body, confirmLabel, danger = true, onConfirm }) {
    pendingConfirm = onConfirm;
    dialogOver(back, `${OB.dialogHead(title)}<p class="t-2">${body}</p><div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${ui.btn({ label: confirmLabel, kind: danger ? 'danger-solid' : 'primary', action: 'ct-confirm-yes' })}</div>`, { label: title });
  }
  OB.action('ct-confirm-yes', () => { const fn = pendingConfirm; pendingConfirm = null; closeDialogThen(fn); });
  const refresh = (reopen) => { OB.render({ keepScroll: true }); if (reopen) reopen(); };

  const REASONS = ['Client', 'Partner', 'Investor', 'Other'];
  const isLive = (p) => ['in-flow', 'paused', 'not-contacted'].includes(p.stage);
  const stopPerson = (p) => { p.stage = 'done'; p.detail = 'Never contact'; p.progress = p.progress.map((s) => (s === 'next' || s === 'todo' ? 'stopped' : s)); };
  const snapOf = (p) => ({ stage: p.stage, detail: p.detail, progress: p.progress.slice() });
  // Changes go to the stored record; before subscribing everyone at the company counts as not contacted yet
  const stopTargets = (cid) => rawPeople().filter((p) => p.company === cid && (prePay() ? p.campaign === FIRST || !p.campaign : isLive(p)));

  OB.action('ct-never-person', (el, e, id) => {
    const p = findPerson(id); const r = rawPerson(id); if (!p || !r) return;
    const co = companyOf(p); const n = nameText(p); const f = firstName(p);
    const companyLine = stopInfo(co) ? `${co.name} is already stopped, so nobody there is being contacted now.` : `The rest of ${co.name} keeps going unless you also add the company.`;
    confirmOver(() => OB.openPerson(id), {
      title: `Never contact ${n}?`,
      body: esc(`Adds ${n} to never contact for good, so no campaign or teammate messages ${f} again.${isLive(p) ? ' Any steps still to come stop now.' : ''} ${companyLine}`),
      confirmLabel: `Never contact ${f}`,
      onConfirm: () => {
        const snap = snapOf(r);
        const entry = { id: `n-${r.id}`, type: 'Person', value: n, detail: co.name, reason: 'Other', added: '2026-10-07', by: 'You', pid: r.id };
        D.never.push(entry);
        r.ctNever = '2026-10-07T10:30';
        if (isLive(r)) stopPerson(r);
        refresh(() => OB.openPerson(id));
        OB.toast(`Added ${n} to never contact`, { undo: () => { D.never.splice(D.never.indexOf(entry), 1); delete r.ctNever; Object.assign(r, snap); refresh(overlayOpen() ? () => OB.openPerson(id) : null); } });
      },
    });
  });

  OB.action('ct-never-company', (el, e, id) => {
    const co = findCompany(id); if (!co) return;
    const live = peopleAt(co.id).filter(isLive);
    const body = live.length
      ? `Adds ${co.domain} to never contact for good. ${OB.plural(live.length, 'person', 'people')} there ${live.length === 1 ? 'stops' : 'stop'} at once, and every campaign and teammate leaves ${co.name} out from now on.`
      : `Adds ${co.domain} to never contact for good. Nobody there is being contacted now, and every campaign and teammate leaves ${co.name} out from now on.`;
    dialogOver(() => OB.openCompany(id), `${OB.dialogHead(`Never contact ${co.name}?`)}
      <p class="t-2">${esc(body)}</p>
      <div class="field"><label class="label" for="ct-nc-reason">Reason</label><select class="select" id="ct-nc-reason">${REASONS.map((r) => `<option>${r}</option>`).join('')}</select></div>
      <div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${ui.btn({ label: `Never contact ${co.name}`, kind: 'danger-solid', action: 'ct-never-company-yes', arg: co.id })}</div>`, { label: `Never contact ${co.name}` });
  });
  OB.action('ct-never-company-yes', (el, e, id) => {
    const co = findCompany(id); if (!co) return;
    const sel = document.getElementById('ct-nc-reason');
    const reason = sel ? sel.value : 'Other';
    closeDialogThen(() => {
      const targets = stopTargets(co.id);
      const snaps = targets.map((p) => [p, snapOf(p)]);
      const entry = { id: `n-${co.id}`, type: 'Company', value: co.name, detail: co.domain, reason, added: '2026-10-07', by: 'You', cid: co.id };
      D.never.push(entry);
      targets.forEach((p) => { if (isLive(p)) stopPerson(p); p.ctNever = '2026-10-07T10:30'; });
      refresh(() => OB.openCompany(id));
      OB.toast(`Added ${co.name} to never contact`, { undo: () => { D.never.splice(D.never.indexOf(entry), 1); snaps.forEach(([p, s]) => { Object.assign(p, s); delete p.ctNever; }); refresh(overlayOpen() ? () => OB.openCompany(id) : null); } });
    });
  });

  /* Add a person to lists (from the drawer) */
  function nextListId() { let n = D.lists.length + 1; while (OB.get.list(`l${n}`)) n += 1; return `l${n}`; }
  OB.action('ct-add-list', (el, e, id) => {
    const p = findPerson(id); if (!p) return;
    const on = listIdsOf(p);
    dialogOver(() => OB.openPerson(id), `${OB.dialogHead(`Add ${nameText(p)} to a list`, 'Being on a list starts nothing. A person is in one running campaign at a time.')}
      <form class="stack gap-5" data-submit="ct-add-list-save" data-person="${esc(id)}" novalidate>
        <fieldset class="ct-fieldset"><legend class="label">Your lists</legend>
          <div class="stack gap-3">${listsAll().map((l) => `<label class="check"><input type="checkbox" name="list" value="${esc(l.id)}" ${on.includes(l.id) ? 'checked disabled' : ''}><span>${esc(l.name)} <span class="t-small t-2">${on.includes(l.id) ? 'Already on it' : OB.plural(l.people, 'person', 'people')}</span></span></label>`).join('')}</div>
        </fieldset>
        ${ui.field({ id: 'ct-newlist', label: 'Or start a new list', optional: true, placeholder: 'For example, Warm intros' })}
        <p class="field-error" id="ct-addlist-err" role="alert" hidden>${icon('alert', 16)}Choose a list or name a new one.</p>
        <div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${ui.btn({ label: 'Add to list', kind: 'primary', type: 'submit' })}</div>
      </form>`, { label: 'Add to a list' });
  });
  OB.action('ct-add-list-save', (f) => {
    const id = f.dataset.person; const p = findPerson(id); if (!p) return;
    const picked = [...f.querySelectorAll('input[name="list"]:checked:not(:disabled)')].map((i) => i.value);
    const name = (document.getElementById('ct-newlist') || {}).value || '';
    if (!picked.length && !name.trim()) { f.querySelector('#ct-addlist-err').hidden = false; return; }
    if (name.trim()) { const nl = { id: nextListId(), name: name.trim(), people: 0, companies: 0, source: 'Made by you', created: '2026-10-07', campaign: null }; D.lists.push(nl); picked.push(nl.id); }
    const added = OB.state.ui.ctAddedLists = OB.state.ui.ctAddedLists || {};
    added[id] = (added[id] || []).concat(picked);
    picked.forEach((lid) => { const l = OB.get.list(lid); l.people += 1; if (!listPeople(l).some((x) => x.id !== p.id && x.company === p.company)) l.companies += 1; });
    closeDialogThen(() => {
      refresh(() => OB.openPerson(id));
      OB.toast(picked.length === 1 ? `Added to ${OB.get.list(picked[0]).name}` : `Added to ${picked.length} lists`);
    });
  });

  /* ---------- Page frame, toolbar and tables ---------- */
  function frame(tab, actions, body, extra) {
    const tabs = ui.tabs([
      { label: 'People', href: '#contacts', current: tab === 'people', count: fmt.num(T().people) },
      { label: 'Companies', href: '#contacts.companies', current: tab === 'companies', count: fmt.num(T().companies) },
      { label: 'Lists', href: '#contacts.lists', current: tab === 'lists', count: listsAll().length },
      { label: 'Never contact', href: '#contacts.never', current: tab === 'never', count: neverAll().length },
    ], 'Contacts sections');
    return Object.assign({
      shell: 'app', nav: 'contacts', title: 'Contacts',
      html: `${prePayNotice()}${ui.pageHead({ icon: 'contacts', title: 'Contacts', actions })}
        <div class="ct-page"><div class="ct-tabs">${tabs}</div>${body}</div>`,
    }, extra || {});
  }
  // Before subscribing, one notice says why names are masked and nobody is contacted
  const prePayNotice = () => (prePay() ? `<div class="banner-stack">${ui.notice({ kind: 'info', icon: 'lock', title: "Full names show the day before each person's first message", body: 'Nothing is sent and no contact details are bought until you subscribe and launch. People you imported keep the names they came with.', actions: ui.btn({ label: 'Subscribe and launch', size: 's', href: '#setup-launch' }) })}</div>` : '');
  const toolbar = (left, right) => `<div class="ct-toolbar">${left}${right || ''}</div>`;
  const searchBox = (id, value, placeholder, label, action) => `<div class="search-wrap ct-search">${icon('search', 15)}<input class="input input-search" id="${id}" type="search" value="${esc(value)}" placeholder="${esc(placeholder)}" aria-label="${esc(label)}" autocomplete="off" data-input="${action}"></div>`;
  const filterBar = (label, items, current, action, count) => `<div class="filters ct-filters" role="group" aria-label="${esc(label)}">${items.map((f) => ui.filter({ label: f.label, count: count ? count(f.key) : undefined, pressed: current === f.key, action, arg: f.key })).join('')}</div>`;
  const moreBtn = (label, action, arg, cls = '') => ui.btn({ icon: 'more', kind: 'ghost', size: 's', title: label, ariaLabel: label, action, arg, cls: `ct-more ${cls}`.trim(), extra: 'aria-haspopup="menu" aria-expanded="false"' });
  const topMore = (label, action, arg) => ui.btn({ icon: 'more', size: 's', title: label, ariaLabel: label, action, arg, extra: 'aria-haspopup="menu" aria-expanded="false"' });
  const foot = (left, right = '') => `<div class="ct-foot">${left}${right}</div>`;
  function pager(shown, total, what) {
    const more = total > shown;
    return foot(`<span class="num">${more ? `Showing ${fmt.num(shown)} of ${fmt.num(total)} ${what}` : `${fmt.num(shown)} ${what}`}</span>`, more ? `<span class="ct-foot-btns">${ui.btn({ icon: 'chevron-left', kind: 'ghost', size: 's', ariaLabel: 'Previous page', title: 'Previous page', disabled: true })}${ui.btn({ icon: 'chevron-right', kind: 'ghost', size: 's', ariaLabel: 'Next page', title: 'Next page', action: 'ct-page' })}</span>` : '');
  }
  const matchFoot = (n, one, many, q) => `<div class="ct-foot" role="status">${esc(`${OB.plural(n, one, many)} "${q}".`)}</div>`;
  const emptyBlock = (o) => `<div class="ct-empty">${ui.empty(o)}</div>`;

  // A record chip: the tile and the name, linking to the record's drawer
  const personChip = (p) => `<a class="rec" href="#contacts.person.${esc(p.id)}" data-action="ct-person" data-arg="${esc(p.id)}">${ui.avatar(nameText(p), 'sm')}<span>${ui.person(p)}</span></a>`;
  const companyChip = (co) => (co.id ? `<a class="rec" href="#contacts.company.${esc(co.id)}" data-action="ct-company" data-arg="${esc(co.id)}">${ui.co(co.name, 'sm')}<span>${esc(co.name)}</span></a>` : '<span class="t-2">Unknown company</span>');

  // One line per person: the name with the job title beside it, then company, campaign, stage and last touch
  function personRows(list, cols) {
    return list.map((p) => {
      const co = companyOf(p); const c = campaignOf(p);
      const touch = cols.touch ? lastTouch(p) : null;
      return `<tr class="is-link" data-action="ct-person" data-arg="${esc(p.id)}">
        <td class="ct-c-who"><span class="ct-who">${personChip(p)}<span class="ct-title">${esc(p.title)}</span></span></td>
        <td class="ct-c-co">${companyChip(co)}</td>
        ${cols.campaign ? `<td class="ct-c-camp"><span class="ct-ell">${c ? esc(c.name) : '<span class="t-2">Not in a campaign</span>'}</span></td>` : ''}
        <td class="ct-c-stage">${stageTag(p)}</td>
        ${cols.touch ? `<td class="ct-c-touch num">${touch ? esc(touchText(touch)) : `<span class="sr-only">${p.stage === 'stopped' ? 'Never contacted' : 'No messages yet'}</span>`}</td>` : ''}
      </tr>`;
    }).join('');
  }
  // Columns that would be the same on every row (one campaign, nobody contacted yet) are left out
  function peopleTable(list, caption, showCampaign = true) {
    const cols = { campaign: showCampaign, touch: list.some((p) => lastTouch(p)) };
    return `<div class="table-wrap table-bleed"><table class="table table-grid ct-table ct-people">
      <caption class="sr-only">${esc(caption)}</caption>
      <thead><tr><th scope="col" class="ct-c-who">Person</th><th scope="col" class="ct-c-co">Company</th>${cols.campaign ? '<th scope="col" class="ct-c-camp">Campaign</th>' : ''}<th scope="col" class="ct-c-stage">Stage</th>${cols.touch ? '<th scope="col" class="ct-c-touch">Last touch</th>' : ''}</tr></thead>
      <tbody>${personRows(list, cols)}</tbody></table></div>`;
  }

  /* ---------- People ---------- */
  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'campaign', label: 'In a campaign' },
    { key: 'replied', label: 'Replied or booked' },
    { key: 'not', label: 'Not contacted' },
    { key: 'ended', label: 'Stopped or done' },
  ];
  const FILTER_OF = { 'in-flow': 'campaign', paused: 'campaign', 'needs-you': 'replied', 'in-conversation': 'replied', booked: 'replied', 'not-contacted': 'not', stopped: 'ended', done: 'ended' };
  const matchesQ = (p, q) => {
    if (!q) return true;
    const co = companyOf(p); const c = campaignOf(p);
    return [nameText(p), p.title, co.name, co.domain, c ? c.name : ''].join(' ').toLowerCase().includes(q);
  };
  const byRecent = (a, b) => { const ta = lastTouch(a); const tb = lastTouch(b); if (ta && tb) return OB.d(tb) - OB.d(ta); if (ta) return -1; if (tb) return 1; return 0; };

  function peopleView(openId) {
    const raw = String(OB.ui$('ctQ', ''));
    const q = raw.trim().toLowerCase();
    const filter = OB.ui$('ctFilter', 'all');
    const sample = (prePay() ? allPeople() : D.people).slice().sort(byRecent);
    const inFilter = (p, f) => f === 'all' || FILTER_OF[p.stage] === f;
    const count = (f) => (q ? sample.filter((p) => inFilter(p, f) && matchesQ(p, q)).length : T().filters[f]);
    const rows = sample.filter((p) => inFilter(p, filter) && matchesQ(p, q));
    const bar = toolbar(filterBar('Show people', FILTERS, filter, 'ct-filter', count), searchBox('ct-q', raw, 'Search people', 'Search people', 'ct-q'));
    let body;
    if (rows.length) body = peopleTable(rows, 'People') + (q ? matchFoot(rows.length, 'person matches', 'people match', raw.trim()) : pager(rows.length, T().filters[filter], 'people'));
    else body = emptyBlock({ icon: 'search', title: q ? `Nobody matches "${raw.trim()}"` : 'Nobody here yet', body: q ? 'Search looks at names, job titles, companies and campaigns. Names not shown yet match on first name and last initial.' : 'People show up here as your campaigns find them.', actions: q ? ui.btn({ label: 'Clear search', action: 'ct-clear' }) : '' });
    const actions = ui.btn({ label: 'Import a CSV', icon: 'upload', size: 's', href: '#contacts.import' }) + topMore('More actions', 'ct-people-more');
    return frame('people', actions, bar + body, openId ? { after: () => { if (!overlayOpen() && findPerson(openId)) OB.openPerson(openId); } } : null);
  }
  OB.action('ct-q', (el, e, v) => OB.set({ ctQ: v }));
  OB.action('ct-filter', (el, e, k) => OB.set({ ctFilter: k }));
  OB.action('ct-clear', () => { OB.set({ ctQ: '' }); const i = document.getElementById('ct-q'); if (i) i.focus(); });
  OB.action('ct-page', () => OB.toast('The prototype has one page of sample rows.'));
  OB.action('ct-people-more', (el) => OB.menu(el, [{ label: 'Export CSV', icon: 'download', action: 'ct-export' }]));

  function exportDialog() {
    const t = T();
    OB.dialog(`${OB.dialogHead('Export contacts')}
      <p>The CSV has the <strong class="num">${fmt.num(t.bought)}</strong> people Onbook has details for: everyone whose contact details were bought, plus the people you imported. It includes name, job title, company, email, LinkedIn, stage, campaign and last touch.</p>
      <p class="t-small t-2">The other ${fmt.num(t.people - t.bought)} people have not been bought yet, so there are no details to export for them.</p>
      <div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${ui.btn({ label: 'Export CSV', kind: 'primary', icon: 'download', action: 'ct-export-go' })}</div>`, { label: 'Export contacts' });
  }
  OB.action('ct-export', () => exportDialog());
  OB.action('ct-export-go', () => { OB.closeOverlays(); OB.toast(`Exported ${fmt.num(T().bought)} people to onbook-contacts.csv`); });

  /* ---------- Companies ---------- */
  const CO_FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'flow', label: 'In flow' },
    { key: 'stopped', label: 'Stopped by a reply' },
    { key: 'not', label: 'Not contacted' },
  ];
  const coKey = (st) => (st.key === 'paused' ? 'flow' : st.key === 'never' || st.key === 'ended' ? 'other' : st.key);
  function companiesView(openId) {
    const raw = String(OB.ui$('ctCoQ', ''));
    const q = raw.trim().toLowerCase();
    const filter = OB.ui$('ctCoFilter', 'all');
    const all = (prePay() ? allCompanies() : D.companies).map((c) => ({ c, st: companyStatus(c) }));
    const hit = (x) => !q || [x.c.name, x.c.domain, x.c.industry, x.c.location].join(' ').toLowerCase().includes(q);
    const inF = (x, k) => k === 'all' || coKey(x.st) === k;
    const count = (k) => all.filter((x) => inF(x, k) && hit(x)).length;
    const rows = all.filter((x) => inF(x, filter) && hit(x));
    const table = `<div class="table-wrap table-bleed"><table class="table table-grid ct-table ct-cos">
      <caption class="sr-only">Companies</caption>
      <thead><tr><th scope="col" class="ct-c-name">Company</th><th scope="col" class="ct-c-ind">Industry</th><th scope="col" class="ct-c-status">Status</th><th scope="col" class="ct-c-news">Latest news</th><th scope="col" class="ct-c-n">People</th></tr></thead>
      <tbody>${rows.map(({ c, st }) => `<tr class="is-link" data-action="ct-company" data-arg="${esc(c.id)}">
          <td class="ct-c-name"><span class="ct-who">${companyChip(c)}<span class="ct-title">${esc(c.domain)}</span></span></td>
          <td class="ct-c-ind"><span class="ct-ell">${esc(c.industry)}</span></td>
          <td class="ct-c-status"><span class="ct-pair">${st.tag}<span class="ct-why">${esc(st.why)}</span></span></td>
          <td class="ct-c-news">${c.news ? `<span class="ct-pair"><span class="ct-news">${esc(c.news.text)}</span><span class="ct-age">${esc(fmt.ago(c.news.date))}</span></span>` : '<span class="t-2">No recent news</span>'}</td>
          <td class="ct-c-n num"><span class="sr-only">People: </span>${peopleAt(c.id).length}</td>
        </tr>`).join('')}</tbody></table></div>`;
    const coTotal = (k) => { const n = (T().coFilters || {})[k]; return n == null ? count(k) : n; };
    const total = q ? rows.length : coTotal(filter);
    const body = rows.length ? table + (q ? matchFoot(rows.length, 'company matches', 'companies match', raw.trim()) : pager(rows.length, total, 'companies'))
      : emptyBlock(q ? { icon: 'search', title: `No company matches "${raw.trim()}"`, body: 'Search looks at company names, websites, industries and places.', actions: ui.btn({ label: 'Clear search', action: 'ct-coclear' }) } : { icon: 'building', title: 'No companies here', body: 'Companies show up here as your campaigns find them and reach them.' });
    const bar = toolbar(filterBar('Show companies', CO_FILTERS, filter, 'ct-co-filter', q ? count : coTotal), searchBox('ct-coq', raw, 'Search companies', 'Search companies', 'ct-coq'));
    const actions = ui.btn({ label: 'Import a CSV', icon: 'upload', size: 's', href: '#contacts.import' }) + topMore('More actions', 'ct-people-more');
    return frame('companies', actions, bar + body, openId ? { after: () => { if (!overlayOpen() && findCompany(openId)) OB.openCompany(openId); } } : null);
  }
  OB.action('ct-coq', (el, e, v) => OB.set({ ctCoQ: v }));
  OB.action('ct-co-filter', (el, e, k) => OB.set({ ctCoFilter: k }));
  OB.action('ct-coclear', () => { OB.set({ ctCoQ: '' }); const i = document.getElementById('ct-coq'); if (i) i.focus(); });

  /* ---------- Lists ---------- */
  const listTile = () => `<span class="ct-tile" aria-hidden="true">${icon('list', 12)}</span>`;
  const LIST_FILTERS = [{ key: 'all', label: 'All' }, { key: 'used', label: 'Used by a campaign' }, { key: 'unused', label: 'Not used yet' }];
  function listsView() {
    const raw = String(OB.ui$('ctListQ', ''));
    const q = raw.trim().toLowerCase();
    const filter = OB.ui$('ctListFilter', 'all');
    const lists = listsAll().slice().sort((a, b) => OB.d(b.created) - OB.d(a.created));
    const inF = (l, k) => k === 'all' || (k === 'used' ? !!l.campaign : !l.campaign);
    const hit = (l) => { const c = camp(l.campaign); return !q || [l.name, l.source, c ? c.name : ''].join(' ').toLowerCase().includes(q); };
    const count = (k) => lists.filter((l) => inF(l, k) && hit(l)).length;
    const rows = lists.filter((l) => inF(l, filter) && hit(l));
    const table = `<div class="table-wrap table-bleed"><table class="table table-grid ct-table ct-lists">
      <caption class="sr-only">Lists</caption>
      <thead><tr><th scope="col" class="ct-c-name">List</th><th scope="col" class="ct-c-src">Source</th><th scope="col" class="ct-c-used">Used by</th><th scope="col" class="ct-c-n">People</th><th scope="col" class="ct-c-n ct-c-n2">Companies</th><th scope="col" class="ct-c-date">Created</th></tr></thead>
      <tbody>${rows.map((l) => {
        const c = camp(l.campaign);
        return `<tr class="is-link" data-action="go" data-arg="contacts.list.${esc(l.id)}">
          <td class="ct-c-name"><a class="rec" href="#contacts.list.${esc(l.id)}">${listTile()}<span>${esc(l.name)}</span></a></td>
          <td class="ct-c-src"><span class="ct-ell t-2">${esc(l.source)}</span></td>
          <td class="ct-c-used">${c ? `<span class="ct-pair"><span class="ct-news">${esc(c.name)}</span>${ui.status(c.status)}</span>` : '<span class="t-2">Not used yet</span>'}</td>
          <td class="ct-c-n num"><span class="sr-only">People: </span>${fmt.num(l.people)}</td>
          <td class="ct-c-n ct-c-n2 num">${fmt.num(l.companies)}</td>
          <td class="ct-c-date num">${esc(fmt.day(l.created))}</td>
        </tr>`;
      }).join('')}</tbody></table></div>`;
    const body = rows.length
      ? table + (q ? matchFoot(rows.length, 'list matches', 'lists match', raw.trim()) : foot('<span>A person can be on many lists but is in one running campaign at a time.</span>'))
      : emptyBlock(q ? { icon: 'search', title: `No list matches "${raw.trim()}"`, body: 'Search looks at list names, sources and campaigns.', actions: ui.btn({ label: 'Clear search', action: 'ct-list-clear' }) } : { icon: 'list', title: 'No lists here', body: 'Lists come from your profile or from a CSV you import.' });
    const bar = toolbar(filterBar('Show lists', LIST_FILTERS, filter, 'ct-list-filter', count), searchBox('ct-listq', raw, 'Search lists', 'Search lists', 'ct-listq'));
    const actions = ui.btn({ label: 'New list', icon: 'plus', iconRight: 'chevron-down', size: 's', action: 'ct-new-list', extra: 'aria-haspopup="menu" aria-expanded="false"' });
    return frame('lists', actions, bar + body);
  }
  OB.action('ct-listq', (el, e, v) => OB.set({ ctListQ: v }));
  OB.action('ct-list-filter', (el, e, k) => OB.set({ ctListFilter: k }));
  OB.action('ct-list-clear', () => { OB.set({ ctListQ: '' }); const i = document.getElementById('ct-listq'); if (i) i.focus(); });
  OB.action('ct-new-list', (el) => OB.menu(el, [
    { label: 'Build from your profile', icon: 'target', action: 'go', arg: 'new-campaign.list' },
    { label: 'Import a CSV', icon: 'upload', action: 'go', arg: 'contacts.import' },
  ]));

  function listView(id) {
    const l = OB.get.list(id);
    if (!l || !listsAll().includes(l)) {
      return { shell: 'app', nav: 'contacts', title: 'Lists', html: `${ui.pageHead({ icon: 'list', crumbs: [{ label: 'Contacts', href: '#contacts' }, { label: 'Lists', href: '#contacts.lists' }], title: 'This list is gone' })}${ui.empty({ icon: 'list', title: 'It may have been deleted', body: 'Your other lists are still here, and the people on this one stay in Contacts.', actions: ui.btn({ label: 'Open lists', href: '#contacts.lists' }) })}` };
    }
    const c = camp(l.campaign);
    const raw = String(OB.ui$('ctLQ', ''));
    const q = raw.trim().toLowerCase();
    const everyone = listPeople(l).sort(byRecent);
    const ppl = everyone.filter((p) => matchesQ(p, q));
    const camps = everyone.map((p) => p.campaign || '').filter((x, i, a) => a.indexOf(x) === i);
    const more = topMore('More list actions', 'ct-list-more', l.id);
    const actions = ui.btn({ label: 'Start a campaign with this list', kind: c ? 'secondary' : 'primary', size: 's', icon: c ? 'plus' : null, action: 'ct-start-campaign', arg: l.id }) + more;
    const dot = '<span class="ct-sep" aria-hidden="true">&middot;</span>';
    const facts = `<p class="ct-toolbar-text"><span class="num">${esc(`${OB.plural(l.people, 'person', 'people')} at ${OB.plural(l.companies, 'company', 'companies')}`)}</span>${dot}${esc(`${l.source}, ${fmt.day(l.created)}`)}${dot}${c ? `Used by ${campaignLink(c)} ${ui.status(c.status)}` : 'Not used by a campaign yet'}</p>`;
    const hint = c
      ? 'A new campaign with this list skips anyone already being contacted, and says how many it skipped.'
      : 'Nobody on this list is contacted until a campaign picks them up. That is also when they count toward your 1,000.';
    let body;
    if (ppl.length) body = peopleTable(ppl, l.name, camps.length > 1) + (q ? matchFoot(ppl.length, 'person matches', 'people match', raw.trim()) : pager(ppl.length, l.people, 'people')) + `<p class="ct-note">${esc(hint)}</p>`;
    else if (q) body = emptyBlock({ icon: 'search', title: `Nobody matches "${raw.trim()}"`, body: 'Search looks at names, job titles, companies and campaigns.', actions: ui.btn({ label: 'Clear search', action: 'ct-lclear' }) });
    else body = emptyBlock({ icon: 'contacts', title: 'Nobody on this list yet', body: 'Add people from their contact drawer, or import a CSV into a new list.', actions: ui.btn({ label: 'Import a CSV', href: '#contacts.import' }) });
    return {
      shell: 'app', nav: 'contacts', title: l.name,
      html: `${prePayNotice()}${ui.pageHead({ icon: 'list', crumbs: [{ label: 'Contacts', href: '#contacts' }, { label: 'Lists', href: '#contacts.lists' }], title: esc(l.name), actions })}
        <div class="ct-page">${toolbar(facts, everyone.length ? searchBox('ct-lq', raw, 'Search this list', 'Search this list', 'ct-lq') : '')}${body}</div>`,
    };
  }
  OB.action('ct-lq', (el, e, v) => OB.set({ ctLQ: v }));
  OB.action('ct-lclear', () => { OB.set({ ctLQ: '' }); const i = document.getElementById('ct-lq'); if (i) i.focus(); });
  OB.action('ct-start-campaign', (el, e, id) => { OB.state.ui.newCampaignListId = id; OB.go('new-campaign.list'); });
  OB.action('ct-list-more', (el, e, id) => OB.menu(el, [
    { label: 'Rename list', icon: 'edit', action: 'ct-list-rename', arg: id },
    { sep: true },
    { label: 'Delete list', icon: 'trash', action: 'ct-list-delete', arg: id, danger: true },
  ]));
  OB.action('ct-list-rename', (el, e, id) => {
    const l = OB.get.list(id); if (!l) return;
    OB.dialog(`${OB.dialogHead('Rename list')}
      <form class="stack gap-5" data-submit="ct-list-rename-save" data-list="${esc(id)}" novalidate>
        ${ui.field({ id: 'ct-rename', label: 'List name', value: l.name, extra: 'autocomplete="off"' })}
        <p class="field-error" id="ct-rename-err" role="alert" hidden>${icon('alert', 16)}Give the list a name.</p>
        <div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${ui.btn({ label: 'Rename list', kind: 'primary', type: 'submit' })}</div>
      </form>`, { label: 'Rename list' });
  });
  OB.action('ct-list-rename-save', (f) => {
    const l = OB.get.list(f.dataset.list); const v = document.getElementById('ct-rename').value.trim();
    if (!v) { f.querySelector('#ct-rename-err').hidden = false; document.getElementById('ct-rename').setAttribute('aria-invalid', 'true'); return; }
    l.name = v; OB.closeOverlays(); OB.render({ keepScroll: true }); OB.toast('List renamed');
  });
  OB.action('ct-list-delete', (el, e, id) => {
    const l = OB.get.list(id); if (!l) return;
    const c = camp(l.campaign);
    if (c) {
      OB.dialog(`${OB.dialogHead('This list is in use')}<p class="t-2">${esc(`"${c.name}" uses this list, so it can't be deleted while the campaign exists.`)}</p><div class="dialog-actions">${ui.btn({ label: 'Close', action: 'close-overlay' })}${ui.btn({ label: 'Open campaign', href: campaignHref(c) })}</div>`, { label: 'This list is in use' });
      return;
    }
    OB.confirm({
      title: `Delete "${l.name}"?`, body: esc(`The ${OB.plural(l.people, 'person', 'people')} on it stay in your contacts. Only the list goes.`), confirmLabel: 'Delete list', danger: true,
      onConfirm: () => {
        const i = D.lists.indexOf(l); D.lists.splice(i, 1);
        OB.go('contacts.lists');
        OB.toast('List deleted', { undo: () => { D.lists.splice(i, 0, l); OB.render({ keepScroll: true }); } });
      },
    });
  });

  /* ---------- Never contact ---------- */
  const isOptOut = (n) => n.by === 'Onbook' || /removed|opted out/i.test(n.reason);
  const NEVER_TYPE = { Company: 'Company', Domain: 'Domain', Person: 'Person', People: 'People', Rule: 'Kind of company' };
  const NEVER_GROUP = { Company: 'company', Domain: 'company', Person: 'person', People: 'person', Rule: 'rule' };
  const NEVER_FILTERS = [{ key: 'all', label: 'All' }, { key: 'company', label: 'Companies' }, { key: 'person', label: 'People' }, { key: 'rule', label: 'Kinds of company' }];
  function neverChip(n) {
    const tile = n.type === 'Company' ? ui.co(n.value, 'sm') : n.type === 'Person' ? ui.avatar(n.value, 'sm')
      : `<span class="ct-tile" aria-hidden="true">${icon(n.type === 'Domain' ? 'globe' : n.type === 'Rule' ? 'filter' : 'contacts', 12)}</span>`;
    return `<span class="rec">${tile}<span>${esc(n.value)}</span></span>`;
  }
  function neverAction(n) {
    if (isOptOut(n)) return `<button type="button" class="ct-kept" data-action="ct-never-why" data-arg="${esc(n.id)}" aria-label="${esc(`Kept for good: why ${n.value} can't be removed`)}">${icon('lock', 14)}<span>Kept for good</span></button>`;
    return moreBtn(`Actions for ${n.value}`, 'ct-never-menu', n.id);
  }
  function neverView() {
    const raw = String(OB.ui$('ctNevQ', ''));
    const q = raw.trim().toLowerCase();
    const filter = OB.ui$('ctNevFilter', 'all');
    const all = neverAll().slice().sort((a, b) => OB.d(b.added) - OB.d(a.added));
    const inF = (n, k) => k === 'all' || NEVER_GROUP[n.type] === k;
    const hit = (n) => !q || [n.value, n.detail, n.reason].join(' ').toLowerCase().includes(q);
    const count = (k) => all.filter((n) => inF(n, k) && hit(n)).length;
    const rows = all.filter((n) => inF(n, filter) && hit(n));
    const table = `<div class="table-wrap table-bleed"><table class="table table-grid ct-table ct-never">
      <caption class="sr-only">Never contact</caption>
      <thead><tr><th scope="col" class="ct-c-name">Who</th><th scope="col" class="ct-c-type">Type</th><th scope="col" class="ct-c-reason">Reason</th><th scope="col" class="ct-c-added">Added</th><th scope="col" class="ct-c-act"><span class="sr-only">Actions</span></th></tr></thead>
      <tbody>${rows.map((n) => `<tr>
        <td class="ct-c-name"><span class="ct-who">${neverChip(n)}<span class="ct-title">${esc(n.detail)}</span></span></td>
        <td class="ct-c-type"><span class="ct-ell">${esc(NEVER_TYPE[n.type] || n.type)}</span></td>
        <td class="ct-c-reason"><span class="ct-ell">${esc(n.reason)}</span></td>
        <td class="ct-c-added"><span class="ct-ell"><span class="num">${esc(fmt.day(n.added))}</span><span class="t-2">, by ${n.by === 'You' ? 'you' : esc(n.by)}</span></span></td>
        <td class="ct-c-act">${neverAction(n)}</td>
      </tr>`).join('')}</tbody></table></div>`;
    const explainer = 'No campaign or teammate ever contacts these companies, domains or people. Opt-outs are added for you and kept for good.';
    const body = rows.length
      ? table + (q ? matchFoot(rows.length, 'entry matches', 'entries match', raw.trim()) : foot(`<span>${esc(explainer)}</span>`))
      : emptyBlock(q ? { icon: 'search', title: `Nothing matches "${raw.trim()}"`, body: 'Search looks at names, websites, domains and reasons.', actions: ui.btn({ label: 'Clear search', action: 'ct-nev-clear' }) }
        : { icon: 'lock', title: filter === 'all' ? 'Nobody is on never contact' : 'Nothing of this kind yet', body: 'Add clients, partners and investors so no campaign ever reaches them. Opt-outs land here on their own.' });
    const bar = toolbar(filterBar('Show entries', NEVER_FILTERS, filter, 'ct-nev-filter', count), searchBox('ct-nevq', raw, 'Search never contact', 'Search never contact', 'ct-nevq'));
    const actions = ui.btn({ label: 'Import a CSV', icon: 'upload', size: 's', action: 'ct-import-never' }) + ui.btn({ label: 'Add to never contact', icon: 'plus', kind: 'primary', size: 's', action: 'ct-never-add' });
    return frame('never', actions, bar + body);
  }
  OB.action('ct-nevq', (el, e, v) => OB.set({ ctNevQ: v }));
  OB.action('ct-nev-filter', (el, e, k) => OB.set({ ctNevFilter: k }));
  OB.action('ct-nev-clear', () => { OB.set({ ctNevQ: '' }); const i = document.getElementById('ct-nevq'); if (i) i.focus(); });
  OB.action('ct-import-never', () => { OB.state.ui.ctImpPreset = 'never'; OB.go('contacts.import'); });
  OB.action('ct-never-menu', (el, e, id) => {
    const n = D.never.find((x) => x.id === id); if (!n) return;
    OB.menu(el, n.type === 'Rule'
      ? [{ label: 'Change in company profile', icon: 'edit', action: 'go', arg: 'settings.profile' }]
      : [{ label: 'Remove from never contact', icon: 'trash', action: 'ct-never-remove', arg: n.id, danger: true }]);
  });

  const NEVER_META = {
    Company: { label: 'Company name or website', ph: 'For example, Ledgerly or ledgerly.com', hint: 'Everyone at the company is left out.', detail: 'Everyone at this company' },
    Domain: { label: 'Email domain', ph: 'For example, bluefin.vc', hint: 'Anyone with an email address at this domain is left out.', detail: 'Every address at this domain' },
    Person: { label: 'Email or LinkedIn URL', ph: 'For example, jo@example.com', hint: 'Only this person is left out. Others at their company can still be contacted.', detail: 'This person only' },
  };
  function neverAddHtml() {
    const type = OB.ui$('ctNType', 'Company'); const m = NEVER_META[type];
    return `${OB.dialogHead('Add to never contact', 'Onbook leaves them out of every list and campaign, for you and your teammates.')}
      <form class="stack gap-5" data-submit="ct-never-save" novalidate>
        <div class="field"><span class="label" aria-hidden="true">Type</span>${ui.seg([{ value: 'Company', label: 'Company' }, { value: 'Domain', label: 'Domain' }, { value: 'Person', label: 'Person' }], type, 'ct-never-type', 'Type')}</div>
        ${ui.field({ id: 'ct-nv-value', label: m.label, hint: m.hint, placeholder: m.ph, value: OB.ui$('ctNValue', ''), error: OB.ui$('ctNErr', ''), extra: 'autocomplete="off" data-input="ct-never-value"' })}
        <div class="field"><label class="label" for="ct-nv-reason">Reason</label><select class="select" id="ct-nv-reason" data-change="ct-never-reason">${REASONS.map((r) => `<option ${OB.ui$('ctNReason', 'Client') === r ? 'selected' : ''}>${r}</option>`).join('')}</select></div>
        <p class="t-small t-2">If anyone this matches is in a campaign now, their messages stop at once.</p>
        <div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${ui.btn({ label: 'Add to never contact', kind: 'primary', type: 'submit' })}</div>
      </form>`;
  }
  const redrawDialog = (html, focusSel) => { const box = document.querySelector('#overlay .dialog'); if (!box) return; box.innerHTML = html; const f = focusSel && box.querySelector(focusSel); if (f) f.focus(); };
  OB.action('ct-never-add', () => { Object.assign(OB.state.ui, { ctNType: 'Company', ctNValue: '', ctNErr: '', ctNReason: 'Client' }); OB.dialog(neverAddHtml(), { label: 'Add to never contact' }); });
  OB.action('ct-never-type', (el, e, v) => { OB.state.ui.ctNType = v; OB.state.ui.ctNErr = ''; redrawDialog(neverAddHtml(), '.seg button[aria-pressed="true"]'); });
  OB.action('ct-never-value', (el, e, v) => { OB.state.ui.ctNValue = v; });
  OB.action('ct-never-reason', (el, e, v) => { OB.state.ui.ctNReason = v; });
  OB.action('ct-never-save', () => {
    const s = OB.state.ui; const value = String(s.ctNValue || '').trim(); const type = s.ctNType || 'Company';
    if (!value) { s.ctNErr = type === 'Person' ? 'Enter an email address or a LinkedIn URL.' : type === 'Domain' ? 'Enter a domain, such as bluefin.vc.' : 'Enter a company name or website.'; redrawDialog(neverAddHtml(), '#ct-nv-value'); return; }
    if (type === 'Domain' && !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(value.replace(/^@/, ''))) { s.ctNErr = 'That is not a domain. Use the part after the @, such as bluefin.vc.'; redrawDialog(neverAddHtml(), '#ct-nv-value'); return; }
    const v = value.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
    const co = type !== 'Person' ? allCompanies().find((c) => c.name.toLowerCase() === value.toLowerCase() || c.domain === v.replace(/^@/, '')) : null;
    const entry = { id: `n-${Date.now()}`, type, value: co ? co.name : value.replace(/^@/, ''), detail: co ? co.domain : NEVER_META[type].detail, reason: s.ctNReason || 'Client', added: '2026-10-07', by: 'You' };
    const targets = co ? stopTargets(co.id) : [];
    const stopped = co ? peopleAt(co.id).filter(isLive).length : 0;
    const snaps = targets.map((p) => [p, snapOf(p)]);
    D.never.push(entry);
    targets.forEach((p) => { if (isLive(p)) stopPerson(p); p.ctNever = '2026-10-07T10:30'; });
    OB.closeOverlays();
    OB.render({ keepScroll: true });
    OB.toast(`Added ${entry.value} to never contact${stopped ? `. ${OB.plural(stopped, 'person', 'people')} stopped` : ''}`, { undo: () => { D.never.splice(D.never.indexOf(entry), 1); snaps.forEach(([p, sn]) => { Object.assign(p, sn); delete p.ctNever; }); OB.render({ keepScroll: true }); } });
  });
  OB.action('ct-never-remove', (el, e, id) => {
    const n = D.never.find((x) => x.id === id); if (!n) return;
    OB.confirm({
      title: `Remove ${n.value} from never contact?`,
      body: esc(`Onbook can find and contact ${n.type === 'Person' ? 'this person' : n.value} again in future lists and campaigns. Nobody is contacted until a campaign picks them up.`),
      confirmLabel: 'Remove', danger: true,
      onConfirm: () => {
        const i = D.never.indexOf(n); D.never.splice(i, 1);
        const p = n.pid ? rawPerson(n.pid) : null; const had = p && p.ctNever; if (p) delete p.ctNever;
        OB.render({ keepScroll: true });
        OB.toast(`Removed ${n.value} from never contact`, { undo: () => { D.never.splice(i, 0, n); if (p && had) p.ctNever = had; OB.render({ keepScroll: true }); } });
      },
    });
  });
  OB.action('ct-never-why', (el, e, id) => {
    const n = D.never.find((x) => x.id === id); if (!n) return;
    OB.dialog(`${OB.dialogHead('Opt-outs stay for good')}
      <p class="t-2">${esc(`${n.value} asked not to be contacted on ${fmt.day(n.added)}. Onbook keeps every opt-out on never contact for good, for every campaign and teammate, so it can't be removed. Email law requires it, and it protects your sending accounts.`)}</p>
      <p class="t-small t-2">${esc(`If ${n.value.split(' ')[0]} writes to you again, reply from your own inbox as usual.`)}</p>
      <div class="dialog-actions">${ui.btn({ label: 'Close', action: 'close-overlay' })}</div>`, { label: 'Opt-outs stay for good' });
  });

  /* ---------- Import a CSV ---------- */
  const IMPORT = {
    file: 'token2049-contacts.csv', rows: 67, people: 64, companies: 41,
    cols: [
      { name: 'First Name', samples: ['Aiko', 'Ravi', 'Clara'], field: 'first' },
      { name: 'Last Name', samples: ['Mori', 'Menon', 'Jensen'], field: 'last' },
      { name: 'Email', samples: ['aiko@kumowallet.com', 'ravi@saltmarsh.money'], field: 'email' },
      { name: 'Company', samples: ['Kumo Wallet', 'Saltmarsh Pay', 'Vela Exchange'], field: 'company' },
      { name: 'Website', samples: ['kumowallet.com', 'saltmarsh.money'], field: 'website' },
      { name: 'LinkedIn', samples: ['linkedin.com/in/aikomori', 'linkedin.com/in/ravimenon'], field: 'linkedin' },
      { name: 'Title', samples: ['Growth Lead', 'Co-founder', 'CMO'], field: 'title' },
      { name: 'Where we met', samples: ['Booth chat about a creator push', 'Panel on perp listings'], field: 'notes' },
      { name: 'Badge ID', samples: ['T49-08812', 'T49-10477'], field: 'skip' },
    ],
    skipped: [['Row 12', 'Wen, no company'], ['Row 31', 'Rafael at Lumio'], ['Row 58', 'D. Okoro at Brava']],
  };
  const IMPORT_PEOPLE = [
    { id: 'p-aiko', name: 'Aiko Mori', title: 'Growth Lead', company: 'kumo', email: 'aiko@kumowallet.com' },
    { id: 'p-ravi', name: 'Ravi Menon', title: 'Co-founder', company: 'saltmarsh', email: 'ravi@saltmarsh.money' },
    { id: 'p-clara', name: 'Clara Jensen', title: 'CMO', company: 'vela', email: 'clara@vela.exchange' },
  ];
  const FIELDS = [['first', 'First name'], ['last', 'Last name'], ['email', 'Email'], ['company', 'Company'], ['website', 'Company website'], ['linkedin', 'LinkedIn URL'], ['title', 'Job title'], ['notes', 'Notes for warmer first messages'], ['skip', "Don't import"]];
  const FIELD_NAME = Object.fromEntries(FIELDS);
  const newImport = (dest) => ({ file: false, map: IMPORT.cols.map((c) => c.field), dest: dest || 'list', name: 'Token2049 contacts, 7 Oct', nameErr: '' });

  function importProblems(map) {
    const out = [];
    const used = {};
    map.forEach((f, i) => { if (f !== 'skip') (used[f] = used[f] || []).push(IMPORT.cols[i].name); });
    Object.entries(used).forEach(([f, cols]) => { if (cols.length > 1) out.push(`${cols.join(' and ')} are both matched to ${FIELD_NAME[f]}. Each Onbook field takes one column.`); });
    if (!used.email && !used.linkedin) out.push('Match a column to Email or LinkedIn URL. Onbook needs one of them to reach anyone.');
    if (!used.first) out.push('Match a column to First name. Every message starts with it.');
    if (!used.company && !used.website) out.push('Match a column to Company or Company website, so a reply can stop everyone at the company.');
    return out;
  }

  // One card, four numbered steps. Steps after the first open once a file is chosen.
  function importView(arg) {
    const prev = OB.current && OB.current.route;
    const fresh = !prev || prev.name !== 'contacts' || prev.params[0] !== 'import';
    if (fresh || !OB.state.ui.ctImp) {
      OB.state.ui.ctImp = newImport(OB.state.ui.ctImpPreset);
      OB.state.ui.ctImpPreset = null;
      if (arg === 'file') OB.state.ui.ctImp.file = true;
    }
    const s = OB.state.ui.ctImp;
    const problems = s.file ? importProblems(s.map) : [];
    const matched = s.map.filter((f) => f !== 'skip').length;
    const skippedCols = IMPORT.cols.filter((c, i) => s.map[i] === 'skip').map((c) => c.name);
    const step = (n, title, meta, body) => {
      const st = n === 1 ? (s.file ? 'is-done' : 'is-on') : s.file ? 'is-on' : 'is-off';
      return `<li class="ct-istep ${st}">
        <div class="ct-istep-head"><span class="ct-istep-n num" aria-hidden="true">${st === 'is-done' ? icon('check', 12) : n}</span><h2 class="ct-istep-title"><span class="sr-only">Step ${n}: </span>${esc(title)}${st === 'is-off' ? '<span class="sr-only">, after you choose a file</span>' : ''}</h2>${st !== 'is-off' && meta ? `<span class="ct-istep-meta">${meta}</span>` : ''}</div>
        ${st === 'is-off' ? '' : `<div class="ct-istep-body">${body}</div>`}
      </li>`;
    };
    const choose = s.file
      ? `<div class="ct-file"><span class="ct-file-tile" aria-hidden="true">${icon('list', 16)}</span><span class="ct-file-main"><span class="t-medium">${esc(IMPORT.file)}</span><span class="t-small t-2">${IMPORT.rows} rows, ${IMPORT.cols.length} columns</span></span><button type="button" class="link-btn ct-file-change" data-action="ct-imp-reset">Choose another file</button></div>`
      : `<div class="ct-drop" id="ct-drop">
          <span class="ct-drop-icon" aria-hidden="true">${icon('upload', 18)}</span>
          <span class="ct-drop-text"><span class="t-medium">Drop a CSV file here</span><span class="t-small t-2">One row per person, with an email or a LinkedIn URL. Up to 5,000 rows from a spreadsheet, a CRM or an event app.</span></span>
          ${ui.btn({ label: 'Choose a CSV', size: 's', action: 'ct-imp-choose' })}
        </div>`;
    const mapTable = `<p class="t-small t-2">${esc(`${skippedCols.length ? `${skippedCols.join(', ')} won't be imported. ` : ''}Check each match.`)}</p>
      <div class="table-wrap ct-map-wrap"><table class="table table-grid ct-table ct-map">
        <caption class="sr-only">Match the columns in your file</caption>
        <thead><tr><th scope="col" class="ct-c-col">Column in your file</th><th scope="col" class="ct-c-sample">Sample values</th><th scope="col" class="ct-c-field">Onbook field</th></tr></thead>
        <tbody>${IMPORT.cols.map((c, i) => `<tr>
          <td class="ct-c-col"><span class="ct-ell t-medium">${esc(c.name)}</span></td>
          <td class="ct-c-sample"><span class="ct-ell">${esc(c.samples.join(', '))}</span></td>
          <td class="ct-c-field"><label class="sr-only" for="ct-map-${i}">Onbook field for ${esc(c.name)}</label><select class="select ct-map-select" id="ct-map-${i}" data-change="ct-imp-map" data-col="${i}">${FIELDS.map(([v, l]) => `<option value="${v}" ${s.map[i] === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></td>
        </tr>`).join('')}</tbody>
      </table></div>
      ${problems.length ? `<div class="stack gap-2" role="alert">${problems.map((t) => `<p class="field-error">${icon('alert', 16)}<span>${esc(t)}</span></p>`).join('')}</div>` : ''}`;
    const dest = `<fieldset class="ct-fieldset ct-dest"><legend class="sr-only">Where to put them</legend>
        <label class="check ct-radio"><input type="radio" name="ct-dest" value="list" ${s.dest === 'list' ? 'checked' : ''} data-change="ct-imp-dest"><span class="ct-radio-text"><span class="t-medium">A new list</span><span class="t-small t-2">Ready to use in a campaign. Nobody is contacted until a campaign picks them up.</span></span></label>
        ${s.dest === 'list' ? `<div class="ct-radio-more">${ui.field({ id: 'ct-imp-name', label: 'List name', value: s.name, error: s.nameErr, extra: 'autocomplete="off" data-input="ct-imp-name"' })}</div>` : ''}
        <label class="check ct-radio"><input type="radio" name="ct-dest" value="never" ${s.dest === 'never' ? 'checked' : ''} data-change="ct-imp-dest"><span class="ct-radio-text"><span class="t-medium">Never contact</span><span class="t-small t-2">For clients, partners or anyone who should never hear from you. Everyone in the file is left out of every campaign.</span></span></label>
      </fieldset>`;
    const review = `<p><span class="t-medium num">${IMPORT.people} people at ${IMPORT.companies} companies.</span> <span class="t-2">${IMPORT.skipped.length} rows skipped: no email and no LinkedIn. ${s.dest === 'never' ? 'They go on never contact, so no campaign or teammate ever reaches them.' : 'Imported people count once, the first time a campaign picks them up.'}</span></p>
      <details class="ct-details"><summary>See the skipped rows</summary><ul class="ct-plain">${IMPORT.skipped.map(([r, who]) => `<li><span class="t-2">${esc(r)}:</span> ${esc(who)}</li>`).join('')}</ul><p class="t-small t-2">Add an email or a LinkedIn URL to these rows and import the file again. Rows already imported are not added twice.</p></details>
      ${s.map[IMPORT.cols.findIndex((c) => c.field === 'notes')] === 'notes' ? '<p class="t-small t-2">Notes from "Where we met" help write warmer first messages.</p>' : ''}`;
    const mapMeta = problems.length ? `<span class="t-error">${OB.plural(problems.length, 'problem')} to fix</span>` : `${matched} of ${IMPORT.cols.length} matched`;
    const go = s.file ? `<div class="ct-imp-foot">${ui.btn({ label: 'Cancel', kind: 'ghost', href: s.dest === 'never' ? '#contacts.never' : '#contacts.lists' })}${ui.btn({ label: s.dest === 'never' ? `Add ${IMPORT.people} people to never contact` : `Import ${IMPORT.people} people`, kind: 'primary', action: 'ct-imp-go', disabled: problems.length > 0 })}</div>` : '';
    return {
      shell: 'app', nav: 'contacts', title: 'Import a CSV',
      html: `${ui.pageHead({ icon: 'upload', crumbs: [{ label: 'Contacts', href: '#contacts' }, { label: 'Lists', href: '#contacts.lists' }], title: 'Import a CSV', sub: 'Bring in people you already know, such as event contacts, into a list or onto never contact.' })}
        <section class="card card-flush ct-import" aria-label="Import a CSV, four steps">
          <ol class="ct-isteps">
            ${step(1, 'Choose a file', '', choose)}
            ${step(2, 'Match columns', mapMeta, mapTable)}
            ${step(3, 'Where to put them', '', dest)}
            ${step(4, 'Review', s.file ? esc(`${IMPORT.people} people`) : '', review)}
          </ol>
          ${go}
        </section>`,
      after: () => {
        const drop = document.getElementById('ct-drop');
        if (!drop) return;
        drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('is-over'); });
        drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
        drop.addEventListener('drop', (e) => { e.preventDefault(); OB.actions['ct-imp-choose'](); });
      },
    };
  }
  OB.action('ct-imp-choose', () => { OB.state.ui.ctImp.file = true; OB.render({ keepScroll: true }); OB.toast(`Read ${IMPORT.file}: ${IMPORT.rows} rows`); });
  OB.action('ct-imp-reset', () => { const s = OB.state.ui.ctImp; Object.assign(s, newImport(s.dest)); OB.render({ keepScroll: true }); });
  OB.action('ct-imp-map', (el, e, v) => { OB.state.ui.ctImp.map[Number(el.dataset.col)] = v; OB.render({ keepScroll: true }); });
  OB.action('ct-imp-dest', (el, e, v) => { OB.state.ui.ctImp.dest = v; OB.render({ keepScroll: true }); });
  OB.action('ct-imp-name', (el, e, v) => { OB.state.ui.ctImp.name = v; if (OB.state.ui.ctImp.nameErr && v.trim()) { OB.state.ui.ctImp.nameErr = ''; OB.render({ keepScroll: true }); } });
  OB.action('ct-imp-go', () => {
    const s = OB.state.ui.ctImp;
    if (!s || !s.file || importProblems(s.map).length) return;
    if (s.dest === 'never') {
      D.never.push({ id: `n-imp-${Date.now()}`, type: 'People', value: `${IMPORT.people} people`, detail: `From ${IMPORT.file}`, reason: 'Other', added: '2026-10-07', by: 'You' });
      OB.state.ui.ctImp = null;
      OB.go('contacts.never');
      OB.toast(`Added ${IMPORT.people} people to never contact`);
      return;
    }
    const name = String(s.name || '').trim();
    if (!name) { s.nameErr = 'Give the new list a name.'; OB.render({ keepScroll: true }); const i = document.getElementById('ct-imp-name'); if (i) i.focus(); return; }
    const l = { id: nextListId(), name, people: IMPORT.people, companies: IMPORT.companies, source: `Imported from ${IMPORT.file}`, created: '2026-10-07', campaign: null };
    D.lists.push(l);
    IMPORT_PEOPLE.forEach((p) => {
      const have = rawPerson(p.id);
      if (have) have.lists = (have.lists || []).concat(l.id);
      else D.ctPeople.push(Object.assign({ campaign: null, lists: [l.id], stage: 'not-contacted', progress: [], revealed: true, imported: true }, p));
    });
    OB.state.ui.ctImp = null;
    OB.go(`contacts.list.${l.id}`);
    OB.toast(`Imported ${IMPORT.people} people into ${name}`);
  });

  /* ---------- Routes and the Screens menu ---------- */
  OB.route('contacts', (params) => {
    const [s, arg] = params;
    if (s === 'companies') return companiesView();
    if (s === 'company') return companiesView(arg);
    if (s === 'lists') return listsView();
    if (s === 'list') return listView(arg);
    if (s === 'never') return neverView();
    if (s === 'import') return importView(arg);
    if (s === 'person') return peopleView(arg);
    return peopleView();
  });

  OB.screen('Contacts', 'People', 'contacts');
  OB.screen('Contacts', 'Person who replied (Maya Chen)', 'contacts.person.p-maya');
  OB.screen('Contacts', 'Person, name not shown yet (Ben O.)', 'contacts.person.p-ben');
  OB.screen('Contacts', 'Person starting tomorrow (Nadia R.)', 'contacts.person.p-nadia');
  OB.screen('Contacts', 'Person in a flow (Ruben Visser)', 'contacts.person.p-ruben');
  OB.screen('Contacts', 'Person with a call booked (Grace Park)', 'contacts.person.p-grace');
  OB.screen('Contacts', 'Person who opted out (Hana Sato)', 'contacts.person.p-hana');
  OB.screen('Contacts', 'Companies', 'contacts.companies');
  OB.screen('Contacts', 'Company stopped by a reply (Kestrel)', 'contacts.company.kestrel');
  OB.screen('Contacts', 'Company in a flow (Pebble Finance)', 'contacts.company.pebble');
  OB.screen('Contacts', 'Lists', 'contacts.lists');
  OB.screen('Contacts', 'List used by a campaign', 'contacts.list.l1');
  OB.screen('Contacts', 'List not used yet', 'contacts.list.l6');
  OB.screen('Contacts', 'Never contact', 'contacts.never');
  OB.screen('Contacts', 'Import a CSV', 'contacts.import');
  OB.screen('Contacts', 'Import a CSV, file chosen', 'contacts.import.file');

  OB.contacts = { exportDialog, findPerson, findCompany, companyStatus, totals: T };
})();
