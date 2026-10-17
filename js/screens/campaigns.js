/* Campaigns: every campaign with its results, one campaign (Overview, People, Flow, Settings), and
   New campaign (list, flow, launch). The flow builder itself is OB.flowBuilder in flow.js.
   A campaign opens on Autopilot (Julian, 17 Oct): Onbook's status (on, paused or finished, with today's sends), the
   replies and calls that need you, the funnel from 30,000+ companies that fit to meetings, and a live feed of what
   Onbook did today. It should read as an assistant at work, not a CRM. People is the pipeline board (lanes per
   stage) with a switch to the table; Results holds the counts, today's batch and the charts. */
(function () {
  'use strict';
  const OB = window.OB;
  const { esc, icon, ui, fmt } = OB;
  const D = OB.data;

  /* ---------- Screens menu ---------- */
  OB.screen('Campaigns', 'All campaigns', 'campaigns');
  OB.screen('Campaigns', 'Running campaign: autopilot', 'campaign.c1');
  OB.screen('Campaigns', 'Running campaign: people, the board', 'campaign.c1.people');
  OB.screen('Campaigns', 'Running campaign: people, the table', 'campaign.c1.people.all');
  OB.screen('Campaigns', 'Running campaign: results', 'campaign.c1.results');
  OB.screen('Campaigns', 'Running campaign: people who need you', 'campaign.c1.people.needs-you');
  OB.screen('Campaigns', 'Running campaign: flow', 'campaign.c1.flow');
  OB.screen('Campaigns', 'Running campaign: settings', 'campaign.c1.settings');
  OB.screen('Campaigns', 'Second campaign: X warming up, nobody quiet yet', 'campaign.c2');
  OB.screen('Campaigns', 'People filter with no one in it', 'campaign.c2.people.paused');
  OB.screen('Campaigns', 'Launched today: no results yet', 'campaign.c9');
  OB.screen('Campaigns', 'Paused campaign', 'campaign.c3');
  OB.screen('Campaigns', 'Finished campaign', 'campaign.c5');
  OB.screen('Campaigns', 'Draft (opens New campaign)', 'campaign.c4');
  OB.screen('Campaigns', 'New campaign: list', 'new-campaign.list');
  OB.screen('Campaigns', 'New campaign: flow', 'new-campaign.flow');
  OB.screen('Campaigns', 'New campaign: launch', 'new-campaign.launch');
  OB.screen('Flow builder', 'Campaign flow, approved', 'campaign.c1.flow');
  OB.screen('Flow builder', 'Edited, two checks failing', 'campaign.c1.flow.edited');
  OB.screen('Flow builder', 'Comment on their latest post (1 credit)', 'campaign.c1.flow.comment');
  OB.screen('Flow builder', 'X first (Exchanges campaign)', 'campaign.c2.flow');
  OB.screen('Flow builder', 'Event follow-ups (paused campaign)', 'campaign.c3.flow');
  OB.screen('Flow builder', 'Read only (finished campaign)', 'campaign.c5.flow');
  OB.screen('Flow builder', 'In a new campaign', 'new-campaign.flow');
  OB.screen('Flow builder', 'Comment step in a new campaign (names hidden)', 'new-campaign.flow.comment');

  /* ---------- Demo data this area adds ---------- */
  /* People per stage for each campaign; each set adds up to the campaign's people */
  D.cpStages = D.cpStages || {
    c1: { 'needs-you': 3, 'in-flow': 61, 'in-conversation': 2, booked: 4, paused: 1, 'not-contacted': 44, done: 71 },
    c2: { 'needs-you': 1, 'in-flow': 39, 'in-conversation': 1, booked: 1, paused: 0, 'not-contacted': 72, done: 6 },
    c3: { 'needs-you': 0, 'in-flow': 12, 'in-conversation': 2, booked: 2, paused: 0, 'not-contacted': 34, done: 14 },
    c5: { 'needs-you': 0, 'in-flow': 0, 'in-conversation': 0, booked: 5, paused: 0, 'not-contacted': 0, done: 145 },
  };
  /* A page of people for the campaigns whose people are not in OB.data.people (shown, not opened).
     `latest` is the one line the Activity column shows for them. */
  D.cpSample = D.cpSample || {
    c3: [
      { id: 'c3-sana', name: 'Sana Okafor', title: 'Head of Partnerships', coName: 'Basalt Labs', news: 'Met at Token2049', stage: 'booked', detail: 'Call booked, Thu 1 Oct', progress: ['done', 'replied', 'stopped'], revealed: true, latest: 'Call was Thu 1 Oct' },
      { id: 'c3-tomas', name: 'Tomas Lindqvist', title: 'CEO', coName: 'Polar Pay', news: 'Met at Token2049', stage: 'in-conversation', progress: ['done', 'done', 'replied'], revealed: true, latest: 'You replied Thu 1 Oct' },
      { id: 'c3-aiko', name: 'Aiko Mori', title: 'Growth Lead', coName: 'Larkspur Finance', news: 'Met at Token2049', stage: 'in-flow', progress: ['done', 'next', 'todo'], revealed: true, latest: 'Email sent Wed 30 Sep' },
      { id: 'c3-rafael', name: 'Rafael Duarte', title: 'Co-founder', coName: 'Ridgeway Markets', news: 'Met at Token2049', stage: 'in-flow', progress: ['done', 'done', 'next'], revealed: true, latest: 'LinkedIn invite sent Thu 1 Oct' },
      { id: 'c3-hannah', name: 'Hannah Cole', title: 'CMO', coName: 'Verdant Rails', news: 'Met at Token2049', stage: 'done', detail: 'No reply', progress: ['done', 'done', 'done'], revealed: true, latest: 'No reply, flow ended' },
      { id: 'c3-ivan', name: 'Ivan Petrov', title: 'Founder', coName: 'Quartz Protocol', news: 'Met at Token2049', stage: 'not-contacted', progress: ['todo', 'todo', 'todo'], revealed: false, latest: 'Not contacted yet' },
    ],
    c5: [
      { id: 'c5-noor', name: 'Noor Haddad', title: 'Co-founder', coName: 'Lattice Lend', news: 'Launched v2 of its lending protocol', stage: 'booked', detail: 'Call booked, Tue 8 Sep', progress: ['done', 'done', 'done', 'done', 'replied', 'stopped'], revealed: true, latest: 'Call was Tue 8 Sep' },
      { id: 'c5-owen', name: 'Owen Price', title: 'Head of Marketing', coName: 'Lattice Lend', news: 'Launched v2 of its lending protocol', stage: 'stopped', detail: 'Stopped: Noor replied', progress: ['stopped', 'stopped', 'stopped', 'stopped', 'stopped', 'stopped'], revealed: false, latest: 'Noor replied, Thu 3 Sep' },
      { id: 'c5-kenji', name: 'Kenji Watanabe', title: 'CEO', coName: 'Mosaic Vaults', news: 'Raised a $7M seed round', stage: 'booked', detail: 'Call booked, Wed 26 Aug', progress: ['done', 'done', 'replied', 'stopped', 'stopped', 'stopped'], revealed: true, latest: 'Call was Wed 26 Aug' },
      { id: 'c5-erik', name: 'Erik Sandberg', title: 'Head of Growth', coName: 'Fjord Finance', news: 'Hiring a Head of Growth', stage: 'done', detail: 'Not interested', progress: ['done', 'replied', 'stopped', 'stopped', 'stopped', 'stopped'], revealed: true, latest: 'Not interested, Fri 14 Aug' },
      { id: 'c5-paula', name: 'Paula Reyes', title: 'CMO', coName: 'Cinder Swap', news: 'Announced its v2 launch date', stage: 'done', detail: 'No reply', progress: ['done', 'done', 'done', 'skip', 'done', 'done'], revealed: true, latest: 'No reply, flow ended' },
      { id: 'c5-lea', name: 'Lea Martin', title: 'Growth Lead', coName: 'Harbor DAO', news: 'Opened its v2 testnet', stage: 'done', detail: 'Opted out', progress: ['done', 'replied', 'stopped', 'stopped', 'stopped', 'stopped'], revealed: true, latest: 'Opted out, on Never contact' },
    ],
  };
  /* Results for the campaigns other than c1 (c1 uses OB.data.results.c1) */
  D.cpResults = D.cpResults || {
    c2: {
      weeks: [{ label: '28 Sep', people: 24, positive: 1, calls: 0 }, { label: '5 Oct', people: 24, positive: 2, calls: 1 }],
      byChannel: [{ ch: 'email', sent: 40, positive: 1 }, { ch: 'linkedin', sent: 31, positive: 0 }, { ch: 'x', sent: 52, positive: 2 }],
      byStep: [{ step: 's1', positive: 1 }, { step: 's3', positive: 1 }, { step: 's4', positive: 1 }],
      byReason: [{ reason: 'Launching a product', contacted: 19, positive: 1 }, { reason: 'Raised money', contacted: 17, positive: 1 }, { reason: 'New exchange listing', contacted: 12, positive: 1 }],
      replies: { positive: 3, notInterested: 2, optOut: 0, auto: 2 },
    },
    c3: {
      weeks: [{ label: '14 Sep', people: 12, positive: 1, calls: 0 }, { label: '21 Sep', people: 10, positive: 2, calls: 1 }, { label: '28 Sep', people: 8, positive: 2, calls: 1 }],
      byChannel: [{ ch: 'email', sent: 52, positive: 4 }, { ch: 'linkedin', sent: 26, positive: 1 }],
      byStep: [{ step: 's1', positive: 3 }, { step: 's2', positive: 1 }, { step: 's3', positive: 1 }],
      byReason: [{ reason: 'Met at Token2049', contacted: 30, positive: 5 }],
      replies: { positive: 5, notInterested: 3, optOut: 0, auto: 4 },
    },
    c5: {
      weeks: [
        { label: '20 Jul', people: 15, positive: 0, calls: 0 }, { label: '27 Jul', people: 22, positive: 1, calls: 0 },
        { label: '3 Aug', people: 21, positive: 2, calls: 1 }, { label: '10 Aug', people: 20, positive: 1, calls: 1 },
        { label: '17 Aug', people: 19, positive: 2, calls: 0 }, { label: '24 Aug', people: 18, positive: 2, calls: 1 },
        { label: '31 Aug', people: 20, positive: 2, calls: 1 }, { label: '7 Sep', people: 15, positive: 1, calls: 1 },
      ],
      byChannel: [{ ch: 'email', sent: 290, positive: 5 }, { ch: 'linkedin', sent: 210, positive: 4 }, { ch: 'x', sent: 70, positive: 2 }],
      byStep: [{ step: 's2', positive: 4 }, { step: 's3', positive: 2 }, { step: 's4', positive: 2 }, { step: 's5', positive: 3 }],
      byReason: [{ reason: 'Launching a product', contacted: 62, positive: 6 }, { reason: 'Raised money', contacted: 41, positive: 3 }, { reason: 'Hiring a growth lead', contacted: 25, positive: 2 }, { reason: 'No recent news', contacted: 22, positive: 0 }],
      replies: { positive: 11, notInterested: 6, optOut: 2, auto: 9 },
    },
  };
  /* New campaign: people on each saved list already in a running campaign, and a preview of a list built from the profile */
  D.cpListSkips = D.cpListSkips || { l4: 12, l5: 9, l6: 3 };
  D.cpBuilt = D.cpBuilt || {
    companies: 98, people: 191, withNews: 33,
    top: [
      { name: 'Saltmarsh Pay', industry: 'Payments', location: 'London', news: 'Raised a $7M seed round', date: '2026-09-28' },
      { name: 'Northwind Wallet', industry: 'Fintech apps', location: 'Singapore', news: 'Launched in Indonesia', date: '2026-10-01' },
      { name: 'Pillar Markets', industry: 'Exchanges and trading', location: 'Dubai', news: 'Hiring a Head of Growth', date: '2026-10-03' },
      { name: 'Kelp Finance', industry: 'DeFi protocols', location: 'Lisbon', news: 'Mainnet launch set for 21 Oct', date: '2026-10-05' },
      { name: 'Brightline Pay', industry: 'Payments', location: 'Amsterdam', news: 'Opened a US office', date: '2026-09-24' },
      { name: 'Aster Exchange', industry: 'Exchanges and trading', location: 'Singapore', news: 'Listed on two new venues', date: '2026-09-30' },
    ],
    like: { c5: { industries: ['DeFi protocols'], reasons: ['Launching a product', 'Raised money in the last 60 days'] } },
  };
  /* Overview counts each campaign adds to its results: people reached on each channel (a person reached on more
     than one counts on each, so these overlap) and people who went quiet (their flow ended with no reply).
     Every set fits the campaign's numbers: reached = contacted, and replies come from the results. */
  D.cpOverview = D.cpOverview || {
    c1: { reached: { linkedin: 118, email: 131, x: 46 }, quiet: 27 }, // the same figures as the website's Overview replica
    c2: { reached: { linkedin: 31, email: 40, x: 41 }, quiet: 0 },
    c3: { reached: { linkedin: 26, email: 30 }, quiet: 9 },
    c5: { reached: { linkedin: 138, email: 141, x: 70 }, quiet: 113 },
  };
  /* Today's batch for the running campaigns: new people and follow-ups per channel, sized to the safe daily
     limits, and the next few sends. Rows with `person` are in OB.data.people; the others stand for the rest of
     the list, which the demo doesn't hold. Follow-ups go before new people, so new people start after lunch. */
  D.cpToday = D.cpToday || {
    c1: {
      channels: [
        { ch: 'linkedin', fresh: 15, follow: 6, words: '15 invites and 6 messages' },
        { ch: 'email', fresh: 0, follow: 12, words: '12 emails' },
        { ch: 'x', fresh: 0, follow: 5, words: '5 DMs' },
      ],
      next: [
        { at: '2026-10-07T11:05', name: 'Marta Kowalski', title: 'Head of Growth', co: 'Bramble Pay', step: 's2' },
        { at: '2026-10-07T11:40', name: 'Joel Ferreira', title: 'CMO', co: 'Lighthouse Card', step: 's3' },
        { at: '2026-10-07T12:15', name: 'Aisha Bello', title: 'Co-founder', co: 'Ferro Markets', step: 's4' },
        { at: '2026-10-07T13:30', name: 'Henrik Dahl', title: 'VP Growth', co: 'Quill Finance', step: 's5' },
        { at: '2026-10-07T14:15', person: 'p-diego', step: 's1' },
      ],
    },
    c2: {
      note: "Your X account is still warming up, so 7 new people start today instead of 8. LinkedIn invites wait until tomorrow: Fintech launches, autumn uses today's 15 from the same account.",
      channels: [
        { ch: 'email', fresh: 0, follow: 4, words: '4 emails' },
        { ch: 'x', fresh: 7, follow: 1, words: '8 DMs' },
      ],
      next: [
        { at: '2026-10-07T11:40', name: 'Tariq Hassan', title: 'Head of Growth', co: 'Nimbus Perps', step: 's4' },
        { at: '2026-10-07T12:20', name: 'Lucia Romano', title: 'CMO', co: 'Vela Exchange', step: 's3' },
        { at: '2026-10-07T15:20', person: 'p-ines', step: 's3' },
        { at: '2026-10-07T15:45', name: 'Kai Nakamura', title: 'Co-founder', co: 'Driftline Markets', step: 's1' },
      ],
    },
  };
  /* A campaign launched today, for the Screens menu only: its Overview before anything has gone out. It is not in
     OB.data.campaigns, so the sidebar, Home and the campaign list don't show it. */
  D.cpLaunched = D.cpLaunched || { id: 'c9', name: 'Wallet apps in Singapore', status: 'running', list: null, flow: 'f1', started: '2026-10-07', people: 96, companies: 51, contacted: 0, inFlow: 0, needsYou: 0, positive: 0, calls: 0, keepFinding: true, noNews: 'skip', nextSend: '2026-10-07T14:30', perDay: 15 };

  /* ---------- Before the first payment ----------
     Nothing has been sent and no contact details bought, so the first campaign shows as ready to launch, with
     everyone not contacted and names as first name and last initial (as Contacts shows them). */
  const FIRST = 'c1';
  const prePay = () => !OB.state.sim.subscribed;
  const getCampaign = (id) => OB.get.campaign(id) || (D.cpLaunched && D.cpLaunched.id === id ? D.cpLaunched : null);
  const shown = (c) => (c && c.id === FIRST && prePay() ? Object.assign({}, c, { status: 'ready', prepay: true, contacted: 0, inFlow: 0, needsYou: 0, positive: 0, calls: 0 }) : c);

  /* ---------- Helpers ---------- */
  const per100 = (n, d) => (d ? (Math.round((n / d) * 1000) / 10).toFixed(1).replace(/\.0$/, '') : '0');
  const todayStr = () => { const t = OB.TODAY; return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };
  /* "today", "tomorrow", "yesterday" or "Mon 5 Oct": no times, so table cells stay on one line */
  const dayWord = (s) => {
    const d = OB.d(s); const t = OB.TODAY;
    const n = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(t.getFullYear(), t.getMonth(), t.getDate())) / 86400000);
    return n === 0 ? 'today' : n === 1 ? 'tomorrow' : n === -1 ? 'yesterday' : fmt.day(d);
  };
  /* "1 hour ago" for earlier today, otherwise the day */
  const agoShort = (s) => (OB.isToday(s) && OB.d(s) <= OB.TODAY ? fmt.rel(s) : dayWord(s));
  const firstName = (name) => String(name || '').split(' ')[0];
  const lowerTitle = (t) => (/^(LinkedIn|X\b)/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1));
  const flowOf = (c) => (c && c.flow && D.flows[c.flow]) || null;
  const focusEl = (id) => { const el = document.getElementById(id); if (el) el.focus({ preventScroll: true }); return el; };
  /* Filters come from ui.filter, which has no id, so focus finds them by their action argument */
  const focusArg = (scope, arg) => { const el = document.querySelector(`${scope} [data-arg="${String(arg).replace(/"/g, '')}"]`); if (el) el.focus({ preventScroll: true }); return el; };
  const STATUS_RANK = { ready: 0, running: 0, paused: 1, draft: 2, finished: 3 };
  const byStatus = (a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status];
  const nextId = (arr, prefix) => `${prefix}${arr.reduce((n, x) => Math.max(n, parseInt(String(x).slice(prefix.length), 10) || 0), 0) + 1}`;
  const chUsed = (steps) => ['email', 'linkedin', 'x'].filter((ch) => steps.some((s) => s.ch === ch));
  const setMap = (key, id, value) => ({ [key]: Object.assign({}, OB.state.ui[key], { [id]: value }) });

  /* The list's last column: when the next message goes, or why nothing is going */
  function nextSendCell(c) {
    if (c.status === 'ready') return '<span class="t-2">When you subscribe</span>';
    if (c.status === 'running' && OB.state.sim.paymentFailed) return '<span class="t-error">Paused, payment failed</span>';
    if (c.status === 'running') return c.nextSend ? esc(fmt.rel(c.nextSend)) : 'Today';
    if (c.status === 'paused') return `<span class="t-2">When you resume</span>`;
    if (c.status === 'draft') return '<span class="t-2">Flow not approved yet</span>';
    if (c.status === 'finished') return `<span class="t-2">Ended ${esc(fmt.day(c.ended))}</span>`;
    return '';
  }

  /* ---------- All campaigns ---------- */
  const LIST_FILTERS = [['all', 'All'], ['running', 'Running'], ['paused', 'Paused'], ['draft', 'Drafts'], ['finished', 'Finished']];
  const LIST_EMPTY = {
    running: ['No running campaigns', 'Launch a campaign and it shows here while it sends.'],
    paused: ['No paused campaigns', 'Campaigns you pause show here. Nothing sends from them until you resume.'],
    draft: ['No drafts', 'A campaign you start but have not launched is saved here.'],
    finished: ['No finished campaigns', 'Campaigns you stop, or that reach the end of their list, show here with their results.'],
  };

  OB.route('campaigns', () => {
    const before = prePay();
    const f = before ? 'all' : OB.state.ui.cpListFilter || 'all';
    /* Before the first payment there is one campaign, saved and ready to launch */
    const all = (before ? D.campaigns.filter((c) => c.id === FIRST).map(shown) : D.campaigns.slice()).sort(byStatus);
    const count = (k) => (k === 'all' ? all.length : all.filter((c) => c.status === k).length);
    const list = f === 'all' ? all : all.filter((c) => c.status === f);
    const live = all.filter((c) => c.status === 'running' || c.status === 'paused');
    const sum = live.reduce((a, c) => ({ contacted: a.contacted + c.contacted, positive: a.positive + c.positive, calls: a.calls + c.calls }), { contacted: 0, positive: 0, calls: 0 });
    const sub = before ? 'Nothing has been sent yet. Your first campaign is saved: subscribe and it launches today.'
      : `Last 30 days: ${fmt.num(sum.contacted)} people contacted, ${OB.plural(sum.positive, 'positive reply', 'positive replies')} (${per100(sum.positive, sum.contacted)} per 100) and ${OB.plural(sum.calls, 'call')} booked.`;
    const filters = before ? '' : `<div class="filters cp-filters" role="group" aria-label="Show campaigns">${LIST_FILTERS.map(([k, label]) => ui.filter({ label, count: count(k), pressed: k === f, action: 'cp-list-filter', arg: k })).join('')}</div>`;
    const empty = LIST_EMPTY[f] || LIST_EMPTY.running;
    const body = list.length ? campaignTable(list) : `<div class="cp-empty">${ui.empty({ icon: 'campaigns', title: empty[0], body: esc(empty[1]), actions: ui.btn({ label: 'Show all campaigns', size: 's', action: 'cp-list-filter', arg: 'all' }) })}</div>`;
    const main = before
      ? ui.btn({ label: 'Subscribe and launch', kind: 'primary', size: 's', href: '#setup-launch' })
      : ui.btn({ label: 'New campaign', kind: 'primary', size: 's', icon: 'plus', href: '#new-campaign.list', action: 'cp-new-start' });
    return {
      shell: 'app', nav: 'campaigns', title: 'Campaigns',
      html: `${ui.pageHead({ icon: 'campaigns', title: 'Campaigns', sub: esc(sub), actions: main })}
        <section class="cp-view" aria-label="All campaigns">
          ${filters ? `<div class="cp-toolbar">${filters}</div>` : ''}
          ${body}
        </section>`,
    };
  });

  /* Attio's record table, edge to edge: one line per campaign, status as a tag, numbers right-aligned.
     The row opens the campaign; a draft opens New campaign where it stopped. */
  function campaignTable(list) {
    const row = (c) => {
      const draft = c.status === 'draft';
      const notYet = draft || c.status === 'ready';
      const href = draft ? '#new-campaign.flow' : `#campaign.${c.id}`;
      const needs = c.needsYou ? ui.tag('blue', `${c.needsYou} need you`) : '';
      const reach = notYet ? '<span class="t-2">Not started</span>' : `${fmt.num(c.contacted)} <span class="t-2">of ${fmt.num(c.people)}</span>`;
      const phone = notYet ? `Not started. ${fmt.num(c.companies)} companies, ${fmt.num(c.people)} people` : `${fmt.num(c.contacted)} of ${fmt.num(c.people)} contacted, ${c.positive} positive, ${OB.plural(c.calls, 'call')}`;
      return `<tr class="is-link" data-action="cp-open" data-arg="${esc(c.id)}">
        <td class="cp-l-name"><span class="cp-cell"><a class="rec" href="${href}" data-action="cp-open" data-arg="${esc(c.id)}"><span>${esc(c.name)}</span></a>${needs}</span></td>
        <td class="cp-l-status">${ui.status(c.status)}</td>
        <td class="col-num num cp-l-n">${reach}</td>
        <td class="col-num num cp-l-n">${notYet ? '' : c.positive}</td>
        <td class="col-num num cp-l-n">${notYet ? '' : c.calls}</td>
        <td class="cp-l-next">${nextSendCell(c)}</td>
        <td class="cp-l-phone">${esc(phone)}</td>
      </tr>`;
    };
    const th = (cls, ic, label) => `<th scope="col" class="${cls}"><span class="cp-th">${icon(ic, 14)}${label}</span></th>`;
    return `<div class="table-wrap table-bleed"><table class="table table-grid cp-list-table">
      <caption class="sr-only">Campaigns</caption>
      <thead><tr>
        ${th('cp-l-name', 'campaigns', 'Campaign')}${th('cp-l-status', 'target', 'Status')}
        ${th('col-num cp-l-n', 'user', 'Contacted')}${th('col-num cp-l-n', 'reply', 'Positive')}${th('col-num cp-l-n', 'calendar', 'Calls')}
        ${th('cp-l-next', 'clock', 'Next send')}
      </tr></thead>
      <tbody>${list.map(row).join('')}</tbody>
    </table></div>`;
  }

  /* ---------- One campaign ---------- */
  /* Overview first. The old Results tab is part of the Overview now, so its links open the Overview */
  const TABS = [['autopilot', 'Autopilot'], ['people', 'People'], ['overview', 'Results'], ['flow', 'Flow'], ['settings', 'Settings']];
  const TAB_ALIAS = { results: 'overview', pipeline: 'people' };
  /* The first MAIN_STAGES show as filter buttons; the rest sit in the More menu */
  const STAGES = [
    ['all', 'All'], ['needs-you', 'Needs you'], ['in-flow', 'In flow'], ['booked', 'Call booked'],
    ['in-conversation', 'In conversation'], ['paused', 'Paused'], ['not-contacted', 'Not contacted'], ['done', 'Done or stopped'],
  ];
  const MAIN_STAGES = 4;
  const isMainStage = (k) => STAGES.slice(0, MAIN_STAGES).some(([x]) => x === k);

  OB.route('campaign', (params, r) => {
    const c = shown(getCampaign(params[0]));
    if (!c) return missing(params[0]);
    if (c.status === 'draft') {
      primeFromDraft(c);
      OB.replaceHash('new-campaign.flow');
      return newCampaign(['flow']);
    }
    const want = TAB_ALIAS[params[1]] || params[1];
    const tab = TABS.some(([k]) => k === want) ? want : 'autopilot';
    const entering = !OB.current || OB.current.route.raw !== r.raw;
    if (entering && tab === 'flow' && (params[2] === 'edited' || params[2] === 'comment') && OB.flowBuilder && c.flow) OB.flowBuilder.demo(c.flow, 'campaign', params[2]);
    /* People opens on the board; a stage in the link (from a lane's See all) opens the table filtered to it */
    if (entering && tab === 'people') {
      const st = params[2] && STAGES.some(([k]) => k === params[2]) ? params[2] : null;
      Object.assign(OB.state.ui, setMap('cpView', c.id, st ? 'table' : 'board'));
      if (st) Object.assign(OB.state.ui, setMap('cpStage', c.id, st), setMap('cpQuery', c.id, ''));
    }
    const content = { autopilot: autopilotTab, overview: overviewTab, people: peopleViews, flow: flowTab, settings: settingsTab }[tab](c);
    const tabs = ui.tabs(TABS.map(([k, label]) => ({ label, href: `#campaign.${c.id}.${k}`, current: k === tab, count: k === 'people' ? fmt.num(c.people) : undefined })), 'Campaign sections');
    return {
      shell: 'app', nav: 'campaigns', title: c.name,
      html: `${ui.pageHead({
          icon: 'campaigns',
          crumbs: [{ label: 'Campaigns', href: '#campaigns' }],
          title: `<span class="cp-title">${esc(c.name)}</span><span class="sr-only">, </span>${ui.status(c.status)}`,
          sub: esc(subLine(c)),
          actions: headActions(c, tab),
        })}
        <div class="cp-body cp-body-${tab}">${tabs}${content}</div>`,
    };
  });

  function missing(id) {
    return {
      shell: 'app', nav: 'campaigns', title: 'Campaign not found',
      html: `${ui.pageHead({ crumbs: [{ label: 'Campaigns', href: '#campaigns' }], title: 'There is no campaign with that link' })}
        ${ui.empty({ icon: 'campaigns', title: `Nothing found for "${id || ''}"`, body: 'It may have been renamed or the link may be old. Your campaigns are all on the Campaigns page.', actions: ui.btn({ label: 'Open Campaigns', href: '#campaigns' }) })}`,
    };
  }

  /* One grey line under the title: when it started, and that it keeps going. No list size (Julian, 17 Oct) */
  function subLine(c) {
    if (c.prepay) return `Saved ${fmt.day(OB.TODAY)}. Nothing sends until you subscribe.`;
    if (c.status === 'finished') return `Ran ${fmt.day(c.started)} to ${fmt.day(c.ended)}.`;
    if (c.status === 'paused') return `Paused ${fmt.day(c.pausedOn)}. Nothing sends until you resume, and replies still reach your Inbox.`;
    return `${c.started === todayStr() ? 'Launched today' : `Started ${fmt.day(c.started)}`}. Onbook reaches out every weekday and finds more companies as it goes.`;
  }

  /* Small actions in the top bar. Pause is always in view while a campaign runs; rare actions sit in "..." */
  function headActions(c, tab) {
    const more = `<button type="button" class="btn btn-secondary btn-sm btn-icon" id="cp-more-btn" data-action="cp-more" data-arg="${esc(c.id)}" aria-label="More actions for this campaign" aria-haspopup="menu" aria-expanded="false">${icon('more', 16)}</button>`;
    /* While the Flow tab has unsaved edits, saving them is the page's one main action */
    const editing = tab === 'flow' && c.flow && OB.flowBuilder && OB.flowBuilder.dirty(c.flow, 'campaign');
    if (c.prepay) return ui.btn({ label: 'Subscribe and launch', kind: editing ? 'secondary' : 'primary', size: 's', href: '#setup-launch' }) + more;
    if (c.status === 'running') return ui.btn({ label: 'Pause campaign', icon: 'pause', size: 's', action: 'cp-pause', arg: c.id, id: 'cp-pause-btn' }) + more;
    if (c.status === 'paused') return ui.btn({ label: 'Resume campaign', kind: editing ? 'secondary' : 'primary', icon: 'play', size: 's', action: 'cp-resume', arg: c.id, id: 'cp-resume-main' }) + more;
    if (c.status === 'finished') return ui.btn({ label: 'Add more companies like these', kind: 'primary', icon: 'plus', size: 's', action: 'cp-more-like', arg: c.id }) + more;
    return more;
  }

  /* ---------- People tab ---------- */
  /* Before paying, nobody has been contacted: the same people, not contacted yet, with masked names */
  const notYet = (p) => Object.assign({}, p, { stage: 'not-contacted', detail: null, revealed: false, progress: (p.progress || []).map(() => 'todo'), next: null, thread: null, latest: null });
  const realPeople = (c) => OB.get.peopleIn(c.id).map((p) => Object.assign({ real: true }, c.prepay ? notYet(p) : p));
  const samplePeople = (c) => { const real = realPeople(c); return real.length ? real : (D.cpSample[c.id] || []); };
  const stageCounts = (c) => Object.assign({ all: c.people }, (!c.prepay && D.cpStages[c.id]) || { 'needs-you': 0, 'in-flow': 0, 'in-conversation': 0, booked: 0, paused: 0, 'not-contacted': c.people, done: 0 });
  const inStage = (p, st) => st === 'all' || (st === 'done' ? p.stage === 'done' || p.stage === 'stopped' : p.stage === st);
  const coOf = (p) => (p.real ? OB.get.company(p.company) : null);
  const shownName = (p) => { if (p.revealed) return p.name; const [f, ...rest] = String(p.name).split(' '); return rest.length ? `${f} ${rest[rest.length - 1][0]}.` : f; };
  const STAGE_EMPTY = {
    'needs-you': ['Nobody needs you right now', 'Replies and bookings that need you show here. You answer them in the Inbox.'],
    'in-flow': ['Nobody is in the flow right now', 'People move here when their first message sends.'],
    'in-conversation': ['No conversations right now', 'People you have replied to show here until they answer or book a call.'],
    booked: ['No calls booked yet', 'People who book through your link, or that you mark as booked, show here.'],
    paused: ['Nobody is paused', 'People pause here after an auto-reply, until 2 working days after they are back.'],
    'not-contacted': ['Everyone has been contacted', 'Everyone in this campaign has had a first message.'],
    done: ['Nobody is done or stopped yet', 'People land here when their flow ends, they opt out, or someone at their company replies.'],
  };

  function peopleTab(c) {
    const flow = flowOf(c) || { steps: [] };
    const sample = samplePeople(c);
    const counts = stageCounts(c);
    const st = (OB.state.ui.cpStage || {})[c.id] || 'all';
    const q = (OB.state.ui.cpQuery || {})[c.id] || '';
    const ql = q.trim().toLowerCase();
    const hay = (p) => `${shownName(p)} ${p.title} ${(coOf(p) || {}).name || p.coName || ''}`.toLowerCase();
    const rows = sample.filter((p) => inStage(p, st)).filter((p) => !ql || hay(p).includes(ql));
    const more = STAGES.slice(MAIN_STAGES).find(([k]) => k === st);
    const filters = `<div class="filters cp-filters" role="group" aria-label="Show people by stage">
        ${STAGES.slice(0, MAIN_STAGES).map(([k, label]) => ui.filter({ label, count: counts[k] || 0, pressed: k === st, action: 'cp-stage', arg: `${c.id}~${k}` })).join('')}
        <button type="button" class="filter cp-filter-more" id="cp-st-more" data-action="cp-stage-more" data-arg="${esc(c.id)}" aria-haspopup="menu" aria-expanded="false"${more ? ' aria-pressed="true"' : ''}>${more ? `${esc(more[1])} <span class="num">${fmt.num(counts[more[0]] || 0)}</span><span class="sr-only">, more stages</span>` : 'More'}${icon('chevron-down', 14)}</button>
      </div>`;
    const search = `<div class="search-wrap cp-search">${icon('search', 15)}<input class="input input-search" type="search" id="cp-q-${esc(c.id)}" value="${esc(q)}" placeholder="Search names and companies" aria-label="Search people in this campaign by name, title or company" autocomplete="off" data-input="cp-search" data-arg="${esc(c.id)}"></div>`;
    let body;
    if (!sample.length) {
      body = `<div class="cp-empty">${ui.empty({ icon: 'clock', title: 'Nobody has been contacted yet', body: esc(`The first ${c.perDay || 15} people start today from 2:30 PM, inside working hours. Each name shows the day before that person's first message.`) })}</div>`;
    } else if (!rows.length) {
      const empty = STAGE_EMPTY[st] || ['Nobody here yet', ''];
      body = `<div class="cp-empty">${ql
        ? ui.empty({ icon: 'search', title: `No one matches "${q.trim()}"`, body: 'Search looks at names, job titles and companies on this page.', actions: ui.btn({ label: 'Clear search', size: 's', action: 'cp-clear', arg: c.id }) })
        : ui.empty({ icon: 'contacts', title: empty[0], body: esc(empty[1]), actions: ui.btn({ label: 'Show everyone', size: 's', action: 'cp-clear', arg: c.id }) })}</div>`;
    } else {
      const total = Math.max(st === 'all' ? c.people : counts[st] || 0, rows.length);
      const pager = ql
        ? `<p class="pager cp-pager">${rows.length === 1 ? '1 person matches' : `${rows.length} people match`} "${esc(q)}" on this page</p>`
        : `<div class="pager cp-pager"><span class="num">Showing 1 to ${rows.length} of ${fmt.num(total)}</span>${total > rows.length ? `<span class="spacer"></span><span class="row gap-1">${ui.btn({ label: 'Previous', kind: 'ghost', size: 's', icon: 'chevron-left', disabled: true })}${ui.btn({ label: 'Next', kind: 'ghost', size: 's', iconRight: 'chevron-right', action: 'cp-page' })}</span>` : ''}</div>`;
      body = `${peopleTable(c, rows, flow)}${pager}`;
    }
    return `<section class="cp-view" aria-labelledby="cp-people-h">
      <h2 class="sr-only" id="cp-people-h">People</h2>
      ${sample.length ? `<div class="cp-toolbar">${filters}${search}</div>` : ''}
      ${body}
    </section>`;
  }

  /* ---------- People: the board (default) or the table, with a switch ---------- */
  function peopleViews(c) {
    const view = (OB.state.ui.cpView || {})[c.id] || 'board';
    const sw = `<div class="seg cp-viewsw" role="group" aria-label="Show people as">
        <button type="button" id="cp-view-board" aria-pressed="${view === 'board'}" data-action="cp-view" data-arg="${esc(c.id)}~board">${icon('layers', 15)}<span>Board</span></button>
        <button type="button" id="cp-view-table" aria-pressed="${view === 'table'}" data-action="cp-view" data-arg="${esc(c.id)}~table">${icon('list', 15)}<span>Table</span></button>
      </div>`;
    return `<div class="cp-people-views"><div class="cp-viewbar">${sw}</div>${view === 'table' ? peopleTab(c) : pipelineTab(c)}</div>`;
  }
  OB.action('cp-view', (el, e, arg) => {
    const [id, v] = String(arg).split('~');
    OB.set(setMap('cpView', id, v));
    const b = document.getElementById(`cp-view-${v}`); if (b) b.focus();
  });

  /* ---------- Autopilot (the default view) ----------
     Onbook at work: its status with today's sends, what needs you, the funnel and a live feed. Nothing here is a
     record to keep up to date */
  D.cpAuto = D.cpAuto || {
    c1: {
      sent: 18,
      feed: [
        { at: '2026-10-07T10:31', ic: 'send', text: 'Sent LinkedIn invites to 5 new people, at Vantage Rails, Sable Exchange, Tern Pay and 2 more.' },
        { at: '2026-10-07T10:12', ic: 'mail', text: 'Followed up with Lena Fischer at Northpoint Credit by email.' },
        { at: '2026-10-07T09:40', ic: 'search', text: 'Found 4 companies that raised this week. They start tomorrow.' },
        { at: '2026-10-07T09:12', ic: 'message', who: 'p-maya', thread: 't1', text: 'Maya Chen at Kestrel Exchange replied on X. Stopped messages to Ben Ortiz there, and drafted your reply.', needs: true },
        { at: '2026-10-07T08:40', ic: 'edit', text: 'Wrote today\'s 38 messages. All passed the checks.' },
        { at: '2026-10-07T08:05', ic: 'message', who: 'p-priya', thread: 't3', text: 'Priya Natarajan at Orbit Lend replied on LinkedIn. Drafted your reply.', needs: true },
        { at: '2026-10-06T16:40', ic: 'message', who: 'p-daniel', thread: 't2', text: 'Daniel Price at Halcyon Pay replied by email. Drafted your reply.', needs: true },
        { at: '2026-10-06T12:10', ic: 'calendar', text: 'Ama Mensah at Quanta Wallet booked a call for Fri 9 Oct, 2:00 PM.' },
      ],
    },
    c2: { sent: 6, feed: [
      { at: '2026-10-07T09:55', ic: 'send', text: 'Sent X DMs to 3 new people at exchanges that listed this week.' },
      { at: '2026-10-07T08:40', ic: 'edit', text: 'Wrote today\'s messages. All passed the checks.' },
    ] },
  };
  const FEED_IC = { send: 'send', mail: 'mail', search: 'search', message: 'message', edit: 'edit', calendar: 'calendar', stop: 'hand' };
  const feedWhen = (s) => (OB.isToday(s) ? fmt.time(s) : `${fmt.day(s)}, ${fmt.time(s)}`);

  function autopilotTab(c) {
    const A = D.cpAuto[c.id] || { sent: 0, feed: [] };
    const T = D.cpToday[c.id];
    const planned = T ? T.channels.reduce((n, x) => n + x.fresh + x.follow, 0) : 0;
    const fresh = T ? T.channels.reduce((n, x) => n + x.fresh, 0) : 0;
    const sent = Math.min(A.sent || 0, planned || 0);
    const running = c.status === 'running' && !c.prepay && !OB.state.sim.paymentFailed;
    const next = T && T.next.find((x) => OB.d(x.at) > OB.TODAY);
    const nextWho = next ? (next.person ? OB.get.person(next.person) : null) : null;
    const nextLine = next ? `Next: ${esc(nextWho ? nextWho.name : next.name)} at ${esc(nextWho ? (OB.get.company(nextWho.company) || {}).name : next.co)}, ${esc(fmt.time(next.at))}` : '';
    /* The status ring: today's sends done out of today's batch */
    const R = 26; const CIRC = 2 * Math.PI * R; const k = planned ? sent / planned : 0;
    const ring = `<svg class="cp-ring" width="64" height="64" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="${R}" class="cp-ring-bg"/><circle cx="32" cy="32" r="${R}" class="cp-ring-fg${running ? '' : ' is-off'}" stroke-dasharray="${(CIRC * k).toFixed(1)} ${CIRC.toFixed(1)}" transform="rotate(-90 32 32)"/>${planned ? `<text x="32" y="31" class="cp-ring-n">${fmt.num(sent)}</text><text x="32" y="44" class="cp-ring-of">of ${fmt.num(planned)}</text>` : ''}</svg>`;
    const state = c.prepay ? ['Ready to launch', 'Nothing sends until you subscribe. Then Onbook reaches out every weekday.']
      : OB.state.sim.paymentFailed ? ['Autopilot is paused', 'Your card was declined, so nothing sends until it is updated.']
        : c.status === 'paused' ? ['Autopilot is paused', 'Nothing sends until you resume. Replies still reach your Inbox.']
          : c.status === 'finished' ? ['This campaign has finished', `It ran ${fmt.day(c.started)} to ${fmt.day(c.ended)}.`]
            : ['Autopilot is on', `${fmt.num(sent)} of ${fmt.num(planned)} sends done today, up to ${fmt.num(fresh)} of them to new people. ${nextLine}.`];
    const status = `<section class="card cp-auto" aria-labelledby="cp-auto-h">
        ${ring}
        <div class="cp-auto-text">
          <h2 class="cp-auto-h" id="cp-auto-h">${running ? '<span class="cp-live" aria-hidden="true"></span>' : ''}${esc(state[0])}</h2>
          <p class="t-2">${state[1]}</p>
        </div>
        <a class="cp-auto-link" href="#settings.accounts">Daily limits</a>
      </section>`;
    /* What needs you: replies with a drafted answer, then calls coming up */
    const threads = D.threads.filter((t) => t.campaign === c.id && t.status === 'needs-you' && t.type !== 'match');
    const calls = D.calls.filter((x) => x.person && (OB.get.person(x.person) || {}).campaign === c.id && OB.d(x.at) >= new Date(OB.TODAY.getFullYear(), OB.TODAY.getMonth(), OB.TODAY.getDate()));
    const needRow = (t) => { const p = OB.get.person(t.person); const co = OB.get.company(p.company);
      return `<li><a class="cp-need" href="#inbox.${esc(t.id)}">${ui.avatar(p.name)}<span class="cp-need-main"><span class="cp-need-who"><span>${esc(p.name)}</span><span class="t-2 truncate">${esc(co.name)}</span></span><span class="cp-need-q">&ldquo;${esc(t.preview)}&rdquo;</span></span>${ui.tag('blue', 'Reply drafted')}</a></li>`; };
    const callRow = (x) => { const p = OB.get.person(x.person); const co = OB.get.company(p.company);
      return `<li><a class="cp-need" href="#${x.thread ? `inbox.${esc(x.thread)}` : `contacts.person.${esc(p.id)}`}">${ui.avatar(p.name)}<span class="cp-need-main"><span class="cp-need-who"><span>${esc(p.name)}</span><span class="t-2 truncate">${esc(co.name)}</span></span><span class="t-2">${esc(OB.isToday(x.at) ? `Call today, ${fmt.time(x.at)}` : `Call ${fmt.dt(x.at)}`)}</span></span>${ui.tag('green', 'Booked')}</a></li>`; };
    const needs = `<section class="card card-flush cp-widget" aria-labelledby="cp-need-h">
        <div class="card-head">${icon('inbox', 16)}<h2 id="cp-need-h">Needs you</h2>${threads.length ? `<span class="count">${threads.length}</span>` : ''}<a href="#inbox">Open the Inbox</a></div>
        ${threads.length || calls.length ? `<ul class="cp-needs" role="list">${threads.map(needRow).join('')}${calls.slice(0, 3).map(callRow).join('')}</ul>` : '<p class="cp-widget-note">Nothing needs you. Replies land here with an answer drafted for you.</p>'}
      </section>`;
    /* The funnel: everyone who fits, then reached, replied and meetings */
    const Rs = resultsOf(c); const rp = Rs && Rs.replies;
    const replied = rp ? rp.positive + rp.notInterested + rp.optOut : 0;
    const steps = [['30,000+', 'companies fit you', 1, ''], [fmt.num(c.contacted || 0), 'people reached', 0.72, ''], [fmt.num(replied), 'replied', 0.46, ''], [fmt.num(c.calls || 0), c.calls === 1 ? 'meeting' : 'meetings', 0.28, 'is-win']];
    const funnel = `<section class="card card-flush cp-widget" aria-labelledby="cp-fun-h">
        <div class="card-head">${icon('target', 16)}<h2 id="cp-fun-h">So far</h2><a href="#campaign.${esc(c.id)}.results">Results</a></div>
        <ol class="cp-funnel" role="list">${steps.map(([n, label, w, cls]) => `<li class="cp-fun ${cls}" style="--w:${w}"><span class="cp-fun-bar"><span class="num">${esc(n)}</span><span>${esc(label)}</span></span></li>`).join('')}</ol>
      </section>`;
    /* The live feed: what Onbook did, newest first, with what it does next on top */
    const items = (A.feed || []).slice().sort((a, b) => OB.d(b.at) - OB.d(a.at));
    const feed = `<section class="card card-flush cp-widget" aria-labelledby="cp-feed-h">
        <div class="card-head">${icon('zap', 16)}<h2 id="cp-feed-h">What Onbook did</h2>${running ? '<span class="cp-feed-live"><span class="cp-live" aria-hidden="true"></span>Live</span>' : ''}</div>
        <ol class="cp-feed" role="list">
          ${running && next ? `<li class="cp-feed-row is-next"><span class="cp-feed-ic">${icon('clock', 14)}</span><span class="cp-feed-text">${nextLine.replace('Next: ', 'Next: a message to ')}</span><span class="cp-feed-t num">Soon</span></li>` : ''}
          ${items.length ? items.map((f) => `<li class="cp-feed-row${f.needs ? ' is-needs' : ''}"><span class="cp-feed-ic">${icon(FEED_IC[f.ic] || 'zap', 14)}</span><span class="cp-feed-text">${esc(f.text)}${f.thread ? ` <a href="#inbox.${esc(f.thread)}">Answer</a>` : ''}</span><span class="cp-feed-t num">${esc(feedWhen(f.at))}</span></li>`).join('') : `<li class="cp-feed-row"><span class="cp-feed-text t-2">${c.prepay ? 'Onbook\'s work shows here once you launch.' : 'Onbook\'s work shows here as it happens.'}</span></li>`}
        </ol>
      </section>`;
    return `<div class="cp-autopilot">${status}<div class="cp-auto-grid"><div class="cp-auto-main">${needs}${feed}</div><div class="cp-auto-side">${funnel}</div></div></div>`;
  }

  /* ---------- Pipeline (the board in People) ----------
     Attio's board: one lane per stage, left to right, each with its tag and count, and a card per person (their
     name, company, and what happens next or what happened last). Stages move on their own as Onbook sends and
     people reply, so cards are not dragged; a card opens the person. Each lane shows a few cards and links to the
     People table filtered to that stage */
  const LANES = [
    { key: 'not-contacted', label: 'Up next', tag: 'outline', has: (p) => p.stage === 'not-contacted', count: (n) => n['not-contacted'] },
    { key: 'in-flow', label: 'Reaching out', tag: 'grey', has: (p) => p.stage === 'in-flow' || p.stage === 'paused', count: (n) => (n['in-flow'] || 0) + (n.paused || 0) },
    { key: 'needs-you', label: 'Needs you', tag: 'blue', has: (p) => p.stage === 'needs-you', count: (n) => n['needs-you'] },
    { key: 'in-conversation', label: 'In conversation', tag: 'grey', has: (p) => p.stage === 'in-conversation', count: (n) => n['in-conversation'] },
    { key: 'booked', label: 'Call booked', tag: 'green', has: (p) => p.stage === 'booked', count: (n) => n.booked },
    { key: 'done', label: 'Done', tag: 'quiet', has: (p) => p.stage === 'done' || p.stage === 'stopped', count: (n) => n.done },
  ];
  const LANE_CARDS = 5;
  function pipelineCard(c, p, flow) {
    const co = coOf(p);
    const coName = co ? co.name : p.coName;
    const quiet = p.stage === 'stopped' || p.stage === 'done';
    const t = p.real && p.stage === 'needs-you' ? OB.get.threadOf(p.id) : null;
    const inner = `<span class="cp-card-who">${ui.avatar(shownName(p), 'sm')}<span class="cp-card-name">${esc(shownName(p))}</span>${p.revealed ? '' : `<span class="cp-card-lock">${icon('lock', 12)}<span class="sr-only">, full name shows the day before their first message</span></span>`}</span>
      <span class="cp-card-co">${ui.co(coName, 'sm')}<span class="truncate">${esc(coName)}</span></span>
      <span class="cp-card-title truncate">${esc(p.title)}</span>
      ${t && t.preview ? `<span class="cp-card-quote">&ldquo;${esc(t.preview)}&rdquo;</span>` : ''}
      ${p.stage === 'in-flow' || p.stage === 'paused' ? `<span class="cp-card-strip">${ui.strip(flow.steps, p.progress)}</span>` : ''}
      <span class="cp-card-act">${p.stage === 'paused' ? `${ui.tag('amber', 'Paused')} ` : ''}${esc(activityFor(c, p, co, flow))}</span>`;
    return `<li>${p.real
      ? `<button type="button" class="cp-card${quiet ? ' is-quiet' : ''}" data-action="cp-person" data-arg="${esc(p.id)}" aria-label="${esc(`${shownName(p)}, ${p.title} at ${coName}. Open their history`)}">${inner}</button>`
      : `<div class="cp-card${quiet ? ' is-quiet' : ''}">${inner}</div>`}</li>`;
  }
  function pipelineTab(c) {
    const flow = flowOf(c) || { steps: [] };
    const sample = samplePeople(c);
    const counts = stageCounts(c);
    const T = D.cpToday[c.id];
    const fresh = T ? T.channels.reduce((n, x) => n + x.fresh, 0) : 0;
    const follow = T ? T.channels.reduce((n, x) => n + x.follow, 0) : 0;
    const today = c.status === 'running' && T
      ? `<p class="cp-board-today">${icon('clock', 15)}<span><span class="t-medium">Today:</span> up to ${fmt.num(fresh)} new people and ${fmt.num(follow)} follow-ups, within your safe daily limits.</span><a href="#campaign.${esc(c.id)}.overview">See today's batch</a></p>`
      : '';
    const lanes = LANES.map((L) => {
      const people = sample.filter(L.has);
      const total = Math.max(L.count(counts) || 0, people.length);
      const shown = people.slice(0, LANE_CARDS);
      const empty = STAGE_EMPTY[L.key] ? STAGE_EMPTY[L.key][0] : 'Nobody here';
      const hid = `cp-lane-${esc(c.id)}-${L.key}`;
      return `<section class="cp-lane cp-lane-${L.key}" aria-labelledby="${hid}">
        <h3 class="cp-lane-head" id="${hid}">${ui.tag(L.tag, L.label)}<span class="num cp-lane-n">${fmt.num(total)}<span class="sr-only"> ${total === 1 ? 'person' : 'people'}</span></span></h3>
        ${shown.length ? `<ul class="cp-cards" role="list">${shown.map((p) => pipelineCard(c, p, flow)).join('')}</ul>` : `<p class="cp-lane-empty">${esc(empty)}</p>`}
        ${total > shown.length ? `<a class="cp-lane-more" href="#campaign.${esc(c.id)}.people.${L.key}">See all ${fmt.num(total)}</a>` : ''}
      </section>`;
    }).join('');
    return `<section class="cp-view cp-pipeline" aria-labelledby="cp-pipe-h">
      <h2 class="sr-only" id="cp-pipe-h">Pipeline</h2>
      ${today}
      <div class="cp-board" role="group" aria-label="People in ${esc(c.name)}, by stage">${lanes}</div>
    </section>`;
  }

  /* Attio's record table: edge to edge, column lines, one 40px line per person */
  function peopleTable(c, rows, flow) {
    const th = (cls, ic, label) => `<th scope="col" class="${cls}"><span class="cp-th">${ic ? icon(ic, 14) : ''}${label}</span></th>`;
    return `<div class="table-wrap table-bleed"><table class="table table-grid cp-people">
      <caption class="sr-only">People in ${esc(c.name)}</caption>
      <thead><tr>
        ${th('cp-c-person', 'user', 'Person')}${th('cp-c-co', 'building', 'Company')}${th('cp-c-news', 'zap', 'Reason to reach out')}
        ${th('cp-c-stage', 'target', 'Stage')}${th('cp-c-strip', 'split', 'Flow')}${th('cp-c-act', 'clock', 'Activity')}
      </tr></thead>
      <tbody>${rows.map((p) => personRow(c, p, flow)).join('')}</tbody>
    </table></div>`;
  }

  /* One line per cell: the person with their title in grey, the company tile and name, the reason in grey,
     the stage tag, the flow strip and one line of activity. Done and stopped people are plain grey rows. */
  function personRow(c, p, flow) {
    const co = coOf(p);
    const coName = co ? co.name : p.coName;
    const quiet = p.stage === 'stopped' || p.stage === 'done';
    const who = !p.revealed && p.stage === 'stopped'
      ? `<span class="masked">${esc(shownName(p))}${icon('lock', 14)}<span class="sr-only">, full name hidden because Onbook never contacted them</span></span>`
      : ui.person(p);
    const name = p.real
      ? `<a class="rec" href="#contacts.person.${esc(p.id)}" data-action="cp-person" data-arg="${esc(p.id)}">${ui.avatar(shownName(p))}${who}</a>`
      : `<span class="rec">${ui.avatar(shownName(p))}${who}</span>`;
    const newsText = co ? (co.news ? `${co.news.text}, ${fmt.ago(co.news.date)}` : '') : p.news || '';
    const news = newsText
      ? `<span class="cp-dim"${co && co.news ? ` title="${esc(`${co.news.text}. ${co.news.source}, ${fmt.day(co.news.date)}`)}"` : ''}>${esc(newsText)}</span>`
      : '<span class="cp-dim">No recent news</span>';
    const act = activityFor(c, p, co, flow);
    return `<tr class="cp-prow${p.real ? ' is-link' : ''}${quiet ? ' is-quiet' : ''}"${p.real ? ` data-action="cp-person" data-arg="${esc(p.id)}"` : ''}>
      <td class="cp-c-person"><span class="cp-cell cp-pcell">${name}<span class="cp-dim cp-ptitle">${esc(p.title)}<span class="cp-co-inline">, ${esc(coName)}</span></span></span></td>
      <td class="cp-c-co"><span class="rec">${ui.co(coName)}<span>${esc(coName)}</span></span></td>
      <td class="cp-c-news">${news}</td>
      <td class="cp-c-stage">${ui.stage(p.stage)}</td>
      <td class="cp-c-strip">${ui.strip(flow.steps, p.progress)}</td>
      <td class="cp-c-act"><span class="cp-act" title="${esc(act)}">${esc(act)}</span></td>
    </tr>`;
  }

  /* One line per person: what happens next while they are in the flow, otherwise what happened last */
  function activityFor(c, p, co, flow) {
    if (c.prepay) return 'Waits until you launch';
    if (c.status === 'paused' && (p.stage === 'in-flow' || p.stage === 'not-contacted')) return 'Waits until you resume';
    if (p.latest) return p.latest;
    const t = p.real ? OB.get.threadOf(p.id) : null;
    const how = (ch) => (ch === 'email' ? 'by email' : `on ${OB.chName(ch)}`);
    switch (p.stage) {
      case 'needs-you': return t ? `Replied ${how(t.channel)}, ${agoShort(t.at)}` : 'Replied';
      case 'booked': { const call = D.calls.find((x) => x.person === p.id); return call ? `Call ${dayWord(call.at)}, ${fmt.time(call.at)}` : 'Call booked'; }
      case 'in-conversation': { const you = t && t.messages.filter((m) => m.you).pop(); return you ? `You replied ${agoShort(you.at)}` : 'Waiting for their reply'; }
      case 'in-flow': {
        const step = p.next && flow.steps.find((s) => s.id === p.next.step);
        if (!step) return 'In the flow';
        if (!p.next.at) return step.kind === 'message' ? 'Waiting for the LinkedIn accept' : `Next: ${lowerTitle(step.title)} when they accept`;
        const d = dayWord(p.next.at);
        return `Next: ${lowerTitle(step.title)} ${d === 'today' || d === 'tomorrow' ? d : `on ${d}`}`;
      }
      case 'paused': return t && t.pausedUntil ? `Carries on ${fmt.day(t.pausedUntil)}` : 'Carries on after their auto-reply';
      case 'not-contacted': return p.detail && /^Starts /.test(p.detail) ? p.detail : 'Waiting to start';
      case 'stopped': {
        const s = co && co.stopped;
        const who = s ? OB.get.person(s.by) : null;
        if (s && who) return `${firstName(who.name)} ${s.why.replace(who.name, '').replace(/ (on X|on LinkedIn|by email)$/, '').trim()}, ${agoShort(s.at)}`;
        return String(p.detail || 'Stopped').replace(/^Stopped: /, '');
      }
      case 'done':
        if (p.detail === 'Opted out') return 'Opted out, on Never contact';
        if (/^Check back /.test(p.detail || '')) return p.detail.replace(/^Check back /, 'Check back on ');
        if (p.detail === 'No reply') return 'No reply, flow ended';
        return p.detail || 'Flow ended';
      default: return '';
    }
  }

  /* ---------- Flow tab ---------- */
  function flowTab(c) {
    if (!OB.flowBuilder) return '<p class="t-2">The flow builder could not load. Reload the page to try again.</p>';
    if (!c.flow) return ui.empty({ icon: 'layers', title: 'No flow yet', body: 'Set the flow in New campaign, then launch.', actions: ui.btn({ label: 'Set the flow', href: '#new-campaign.flow' }) });
    const finished = c.status === 'finished';
    return `<section class="cp-flow-sec" aria-label="Flow">
      ${finished ? `<p class="cp-flow-note">${icon('lock', 15)}<span>This campaign has finished, so its flow can't change. To reuse it, choose Duplicate from the menu at the top right.</span></p>` : ''}
      ${OB.flowBuilder.render({ flowId: c.flow, mode: 'campaign', editable: !finished })}
    </section>`;
  }

  /* ---------- Overview ----------
     The counts first, as Attio's number widgets in one panel with column lines: people reached (by channel),
     replies, people who went quiet, meetings booked. Then today's batch, then the results by week, channel, step
     and reason. Each number shows once on the page. */
  const resultsOf = (c) => (c.id === 'c1' ? D.results && D.results.c1 : D.cpResults[c.id]) || null;

  /* Attio's report widgets: each block is a card with a header row */
  const widget = (id, ic, title, body, extra = '', cls = '') => `<section class="card card-flush cp-widget${cls}" aria-labelledby="${id}">
      <div class="card-head">${icon(ic, 16)}<h2 id="${id}">${esc(title)}</h2>${extra}</div>
      ${body}
    </section>`;

  /* How long a person's flow runs, from the campaign's saved flow */
  const flowDays = (c) => { const f = flowOf(c); return f ? f.steps.reduce((n, s) => { const m = /Day (\d+)/.exec(s.when || ''); return m ? Math.max(n, Number(m[1])) : n; }, 1) : 14; };

  function overviewTab(c) {
    const R = resultsOf(c);
    const O = D.cpOverview[c.id];
    const today = todayCard(c);
    /* Before anything has gone out, today's batch leads and the counts say what will appear */
    if (!R || !O || !c.contacted) return `<div class="cp-ov">${today}${noCounts(c)}</div>`;
    return `<div class="cp-ov">${countsPanel(c, R, O)}${today}${resultsBlock(c, R)}</div>`;
  }

  function countsPanel(c, R, O) {
    const rp = R.replies;
    const replied = rp.positive + rp.notInterested + rp.optOut;
    const toStart = (D.cpStages[c.id] || {})['not-contacted'] || 0;
    const kpi = (id, ic, label, num, rest, body, extra = '') => `<div class="cp-kpi">
        <div class="cp-kpi-top"><h3 class="cp-kpi-h" id="${id}">${icon(ic, 15)}<span>${label}</span></h3>${extra}</div>
        <p class="cp-kpi-num"><span class="num">${fmt.num(num)}</span>${rest ? `<span class="cp-kpi-rest">${rest}</span>` : ''}</p>
        ${body}
      </div>`;
    const row = (label, value, mid = '') => `<li class="cp-kpi-row"><span class="cp-kpi-k">${label}</span>${mid}<span class="cp-kpi-n num">${value}</span></li>`;

    /* Reached: everyone contacted, then each channel with a bar against that total */
    const chans = ['linkedin', 'email', 'x'].filter((ch) => O.reached[ch] != null);
    const chRows = chans.map((ch) => row(`${OB.mark(ch, 14)}<span>${esc(OB.chName(ch))}</span>`, fmt.num(O.reached[ch]),
      `<span class="cp-kpi-bar" aria-hidden="true">${ui.meter(O.reached[ch], c.contacted, { warnAt: 2 })}</span>`)).join('');
    const reached = kpi('cp-k-reach', 'send', 'Reached', c.contacted, toStart ? `people, ${fmt.num(toStart)} still to start` : 'people, the whole list',
      `<ul class="cp-kpi-rows" role="list" aria-label="Reached on each channel">${chRows}</ul>
       <p class="cp-kpi-foot">Someone reached on two channels counts on both.</p>`);

    /* Replied: real replies only; auto-replies sit apart because they never count */
    const needs = c.needsYou && !OB.state.sim.emptyInbox ? `<a class="cp-kpi-needs" href="#inbox">${ui.tag('blue', `${c.needsYou} need${c.needsYou === 1 ? 's' : ''} you`)}</a>` : '';
    const replies = kpi('cp-k-reply', 'reply', 'Replied', replied, `${per100(rp.positive, c.contacted)} positive per 100 reached`,
      `<ul class="cp-kpi-rows" role="list" aria-label="Replies by kind">${row('Positive', rp.positive)}${row('Not interested', rp.notInterested)}${row('Opted out', rp.optOut)}</ul>
       ${rp.auto ? `<p class="cp-kpi-foot">${OB.plural(rp.auto, 'auto-reply', 'auto-replies')} not counted. Each pauses that person until they're back.</p>` : ''}`, needs);

    /* Went quiet: their flow ended with no reply */
    const quietText = O.quiet
      ? `No reply by the end of the flow.${c.status === 'running' ? ' The next person at their company starts after them.' : ''}`
      : `Nobody yet. The flow runs ${flowDays(c)} days, so the first people finish it soon.`;
    const quiet = kpi('cp-k-quiet', 'clock', 'Went quiet', O.quiet, 'people', `<p class="cp-kpi-text">${quietText}</p>`);

    /* Meetings booked, with the calls still to come */
    const upcoming = D.calls.filter((x) => { const p = x.person && OB.get.person(x.person); return p && p.campaign === c.id && OB.d(x.at) >= OB.TODAY; }).sort((a, b) => OB.d(a.at) - OB.d(b.at));
    const calls = upcoming.length
      ? `<ul class="cp-kpi-rows" role="list" aria-label="Calls coming up">${upcoming.slice(0, 3).map((x) => { const p = OB.get.person(x.person); return `<li class="cp-kpi-row"><a class="cp-kpi-k cp-kpi-call" href="${x.thread ? `#inbox.${esc(x.thread)}` : `#contacts.person.${esc(p.id)}`}">${esc(p.name)}</a><span class="cp-kpi-when">${esc(fmt.rel(x.at))}</span></li>`; }).join('')}</ul>`
      : '<p class="cp-kpi-text">No calls coming up.</p>';
    const meetings = kpi('cp-k-meet', 'calendar', 'Meetings booked', c.calls, `${per100(c.calls, c.contacted)} per 100 reached`, calls);

    return `<section class="card card-flush cp-kpis" aria-labelledby="cp-kpis-h">
      <h2 class="sr-only" id="cp-kpis-h">So far</h2>
      <div class="cp-kpi-grid">${reached}${replies}${quiet}${meetings}</div>
    </section>`;
  }

  /* Before the first messages go out, the counts panel says what will appear in it */
  function noCounts(c) {
    const body = c.prepay
      ? 'Nothing has been sent yet. Once you launch, this shows how many people Onbook reached on each channel, who replied, who went quiet and the meetings booked.'
      : 'Counts show here as the first messages go out: people reached on each channel, replies, people who went quiet and meetings booked. Most first replies arrive 2 to 5 days after a campaign starts.';
    return `<section class="card card-flush cp-kpis" aria-labelledby="cp-kpis-h">
      <div class="card-head">${icon('chart', 16)}<h2 id="cp-kpis-h">Results</h2><span class="link">${c.prepay ? 'After you launch' : 'None yet'}</span></div>
      <p class="cp-kpis-empty">${esc(body)}</p>
    </section>`;
  }

  /* ---------- Today's batch ----------
     Who Onbook contacts today, never the whole list: new people and follow-ups sized to the safe daily limits,
     then the next few sends. Account and credit problems show on the rows they hold up. */
  function todayCard(c) {
    if (c.status === 'finished') return '';
    const sim = OB.state.sim;
    const flow = flowOf(c) || { steps: [] };
    const card = (title, body) => `<section class="card card-flush cp-today" aria-labelledby="cp-today-h">
        <div class="card-head">${icon('clock', 16)}<h2 id="cp-today-h">${esc(title)}</h2><a href="#settings.accounts">Daily limits</a></div>
        ${body}
      </section>`;
    const line = (html, kind = '') => `<p class="cp-today-line${kind ? ` is-${kind}` : ''}">${kind ? icon('alert', 15) : ''}<span>${html}</span></p>`;
    const foot = `<p class="cp-widget-note">${c.prepay ? '' : 'Follow-ups go before new people. '}Everything sends inside working hours, with gaps between messages.</p>`;

    if (c.prepay) {
      const first = flow.steps[0] ? flow.steps[0].id : null;
      const rows = D.setup.list.slice(0, 5).map((co) => { const [name, title] = (D.setup.people[co] || [['', '']])[0]; return { name, title, co: (OB.get.company(co) || {}).name, step: first, masked: true, time: 'After you launch' }; });
      return card('When you launch: 5 new people today', `<div class="cp-today-notes">${line('New accounts start at 5 new people a day and build up to about 15 over two weeks. Names show the day before each first message.')}</div>${todayTable(rows, flow, () => null)}${foot}`);
    }
    if (c.status === 'paused') {
      const n = (D.cpStages[c.id] || {})['in-flow'] || c.inFlow || 0;
      return card('Today: nothing sends while it\'s paused', `<p class="cp-today-line"><span>When you resume, the ${OB.plural(n, 'person', 'people')} in the flow ${n === 1 ? 'carries' : 'carry'} on where they stopped, follow-ups first, inside today's limits.</span></p>`);
    }
    const T = D.cpToday[c.id];
    if (!T) {
      /* Launched today: the first people's details are being bought, so there are no names yet */
      const n = c.perDay || 15;
      if (sim.paymentFailed) return card('Today: nothing sends until your card is updated', line('The first people start once your card is updated.', 'error'));
      if (sim.outOfPeople) return card('Today: no new people', line('New people wait until you have credits again. Buy credits, or they start on 1 Nov.', 'warn'));
      const from = c.nextSend ? fmt.time(c.nextSend) : '2:30 PM';
      return card(`Today: ${OB.plural(n, 'new person', 'new people')}`, `<p class="cp-today-line"><span>Onbook is getting contact details for the first ${n} people now. Their first steps send from ${esc(from)}, inside working hours, and their names show here as they're bought.</span></p>`);
    }

    /* What waits: LinkedIn steps while LinkedIn is signed out, new people while credits are used up, everything
       while a payment has failed */
    const firstStep = flow.steps[0] ? flow.steps[0].id : null;
    let fresh = 0, follow = 0, liWait = 0;
    T.channels.forEach((x) => {
      if (sim.linkedinIssue && x.ch === 'linkedin') { liWait += x.fresh + x.follow; return; }
      fresh += sim.outOfPeople ? 0 : x.fresh;
      follow += x.follow;
    });
    const waits = (x, step) => {
      if (sim.paymentFailed) return ['Waits for your card', 'error'];
      if (sim.linkedinIssue && step && step.ch === 'linkedin') return ['Waits for LinkedIn', 'warn'];
      if (sim.outOfPeople && x.step === firstStep) return ['Waits for credits', 'warn'];
      return null;
    };
    const parts = [fresh ? OB.plural(fresh, 'new person', 'new people') : '', follow ? OB.plural(follow, 'follow-up') : ''].filter(Boolean);
    const title = sim.paymentFailed ? 'Today: nothing sends until your card is updated' : parts.length ? `Today: ${parts.join(' and ')}` : 'Today: nothing to send yet';
    const notes = [];
    if (sim.paymentFailed) notes.push(line('These wait until your card is updated. Replies still reach your Inbox.', 'error'));
    else {
      if (sim.linkedinIssue && liWait) notes.push(line(`${OB.plural(liWait, 'LinkedIn step')} ${liWait === 1 ? 'waits' : 'wait'} until you reconnect LinkedIn. Email and X carry on.`, 'warn'));
      if (sim.outOfPeople) notes.push(line('New people wait until you have credits again. Follow-ups carry on.', 'warn'));
      if (!notes.length) {
        notes.push(`<p class="cp-today-line cp-today-split"><span class="t-2">Inside your daily limits:</span>${T.channels.map((x) => `<span class="cp-today-ch">${OB.mark(x.ch, 14)}<span>${esc(x.words)}</span><span class="sr-only"> on ${esc(OB.chName(x.ch))}</span></span>`).join('')}</p>`);
        if (T.note) notes.push(`<p class="cp-today-line"><span class="t-2">${esc(T.note)}</span></p>`);
      }
    }
    return card(title, `<div class="cp-today-notes">${notes.join('')}</div>${todayTable(T.next, flow, waits)}${foot}`);
  }

  /* The next few sends: time, person, company and step, one line each */
  function todayTable(rows, flow, waits) {
    const body = rows.map((x) => {
      const p = x.person ? OB.get.person(x.person) : null;
      const name = p ? p.name : x.name;
      const title = p ? p.title : x.title;
      const coName = p ? (OB.get.company(p.company) || {}).name : x.co;
      const i = flow.steps.findIndex((s) => s.id === x.step);
      const step = flow.steps[i];
      const who = x.masked ? ui.person({ name }, { revealed: false }) : `<span>${esc(name)}</span>`;
      const chip = p
        ? `<a class="rec" href="#contacts.person.${esc(p.id)}" data-action="cp-person" data-arg="${esc(p.id)}">${ui.avatar(name)}${who}</a>`
        : `<span class="rec">${ui.avatar(name)}${who}</span>`;
      const wait = waits(x, step);
      const time = x.time ? `<span class="t-2">${esc(x.time)}</span>` : wait ? `<span class="t-${wait[1] === 'error' ? 'error' : 'warn'}">${esc(wait[0])}</span>` : `<span class="num">${esc(fmt.time(x.at))}</span>`;
      const stepCell = step ? `<span class="cp-step-cell"><span class="t-2 num">${i + 1}</span>${OB.mark(step.ch, 14)}<span class="truncate">${esc(step.title)}</span></span>` : '';
      return `<tr${p ? ` class="is-link" data-action="cp-person" data-arg="${esc(p.id)}"` : ''}>
        <td class="cp-t-time">${time}</td>
        <td class="cp-t-person"><span class="cp-cell">${chip}<span class="cp-dim">${esc(title)}<span class="cp-co-inline">, ${esc(coName)}</span></span></span></td>
        <td class="cp-t-co"><span class="rec">${ui.co(coName)}<span>${esc(coName)}</span></span></td>
        <td class="cp-t-step">${stepCell}</td>
      </tr>`;
    }).join('');
    return `<div class="table-wrap"><table class="table cp-mini cp-today-table">
        <caption class="sr-only">Next sends today</caption>
        <thead><tr><th scope="col" class="cp-t-time">Time</th><th scope="col" class="cp-t-person">Person</th><th scope="col" class="cp-t-co">Company</th><th scope="col" class="cp-t-step">Step</th></tr></thead>
        <tbody>${body}</tbody>
      </table></div>`;
  }

  /* ---------- Results below the counts: week by week, by step, by channel, by reason ---------- */
  function resultsBlock(c, R) {
    const flow = flowOf(c) || { steps: [] };
    const asTable = !!(OB.state.ui.cpChartTable || {})[c.id];
    const ongoing = c.status === 'running';
    const legend = `<div class="cp-legend" aria-hidden="true"><span class="cp-key"><span class="cp-key-bar"></span>People reached</span><span class="cp-key"><span class="cp-key-pos"></span>Positive reply</span><span class="cp-key"><span class="cp-key-call"></span>Call booked</span></div>`;
    const weekTable = `<div class="table-wrap"><table class="table cp-mini" id="cp-weeks-table"><caption class="sr-only">Week by week</caption>
      <thead><tr><th scope="col">Week starting</th><th scope="col" class="col-num">People reached</th><th scope="col" class="col-num">Positive replies</th><th scope="col" class="col-num">Calls booked</th></tr></thead>
      <tbody>${R.weeks.map((w, i) => `<tr><td>${esc(w.label)}${ongoing && i === R.weeks.length - 1 ? ' <span class="t-2">(so far)</span>' : ''}</td><td class="col-num num">${w.people}</td><td class="col-num num">${w.positive}</td><td class="col-num num">${w.calls}</td></tr>`).join('')}</tbody></table></div>`;
    /* Chart or table, as a small switch in the widget's header */
    const view = `<div class="seg cp-seg" role="group" aria-label="Show week by week as">${[['chart', 'Chart'], ['table', 'Table']].map(([k, label]) => `<button type="button" id="cp-view-${k}" aria-pressed="${(k === 'table') === asTable}" data-action="cp-chart-view" data-arg="${esc(c.id)}~${k}">${label}</button>`).join('')}</div>`;
    const weeks = widget('cp-weeks-h', 'chart', 'Week by week', asTable
      ? `${weekTable}${ongoing ? `<p class="cp-widget-note">The week of ${esc(R.weeks[R.weeks.length - 1].label)} is still going.</p>` : ''}`
      : `<div class="card-body cp-chart-body">
          ${legend}
          <figure class="cp-chart"><div class="cp-chart-scroll">${weekChart(R.weeks, ongoing)}</div><div class="cp-tip" role="presentation" hidden></div><figcaption class="sr-only">People reached each week, with positive replies and calls booked. Switch to Table for the numbers.</figcaption></figure>
          ${ongoing ? `<p class="t-small t-2">The week of ${esc(R.weeks[R.weeks.length - 1].label)} is still going.</p>` : ''}
        </div>`, view);

    const chRows = R.byChannel.map((x) => `<tr><td><span class="row gap-2">${ui.ch(x.ch, 15)}<span>${esc(OB.chName(x.ch))}</span></span></td><td class="col-num num">${fmt.num(x.sent)}</td><td class="col-num num">${x.positive}</td><td class="col-num num">${per100(x.positive, x.sent)}</td></tr>`).join('');
    const byChannel = widget('cp-ch-h', 'send', 'By channel', miniTable('cp-ch-h', ['Channel', 'Sent', 'Positive', 'Per 100 sent'], chRows));

    const totalPos = R.byStep.reduce((n, x) => n + x.positive, 0);
    const stRows = flow.steps.map((s, i) => {
      const hit = R.byStep.find((x) => x.step === s.id);
      const n = hit ? hit.positive : 0;
      return `<tr><td><span class="cp-step-cell"><span class="t-2 num">${i + 1}</span>${ui.ch(s.ch, 14)}<span class="truncate">${esc(s.title)}<span class="t-2">, ${esc(String(s.when || '').replace(/^Day/, 'day').replace(/^After/, 'after'))}</span></span></span></td><td class="col-num num">${n}</td><td class="cp-share">${ui.meter(n, Math.max(1, totalPos), { warnAt: 2, label: `${s.title}: share of positive replies` })}</td></tr>`;
    }).join('');
    const byStep = widget('cp-st-h', 'split', 'By step', `${miniTable('cp-st-h', ['Step', 'Positive', 'Share'], stRows)}<p class="cp-widget-note">Which step the positive reply came after.</p>`);

    const none = R.byReason.find((x) => /no recent news/i.test(x.reason));
    const rsRows = R.byReason.map((x) => `<tr${x === none ? ' class="cp-none-row"' : ''}><td>${esc(x.reason)}</td><td class="col-num num">${x.contacted}</td><td class="col-num num">${x.positive}</td><td class="col-num num">${per100(x.positive, x.contacted)}</td></tr>`).join('');
    const noneNote = none ? `<p class="cp-widget-note">${none.positive ? `Companies without recent news: ${none.positive} of ${none.contacted} replied positively.` : `None of the ${none.contacted} people at companies without recent news replied positively.`} ${c.noNews === 'skip' ? 'This campaign is set to skip them.' : `<a href="#campaign.${esc(c.id)}.settings">Skip them in Settings</a>.`}</p>` : '';
    const byReason = widget('cp-rs-h', 'zap', 'By reason to reach out', `${miniTable('cp-rs-h', ['Reason', 'Reached', 'Positive', 'Per 100'], rsRows)}${noneNote}`);

    return `<div class="cp-results">
      <div class="cp-res-grid">
        <div class="cp-res-col">${weeks}${byStep}</div>
        <div class="cp-res-col">${byChannel}${byReason}</div>
      </div>
      <p class="t-small t-2 cp-counted">How these are counted: a person is reached when their first message sends, and reached on a channel when their first message on it sends. Replies are real replies; auto-replies and bounces never count. Went quiet means their flow ended with no reply. Rates are per 100 people reached, except by channel, which is per 100 messages sent.${ongoing ? ' This week so far is included.' : ''}</p>
    </div>`;
  }

  /* A small table inside a widget: hairline rows, the card's own padding at each end */
  function miniTable(labelledBy, cols, rows) {
    return `<div class="table-wrap"><table class="table cp-mini" aria-labelledby="${labelledBy}">
        <thead><tr>${cols.map((col, i) => `<th scope="col"${i ? ' class="col-num"' : ''}>${esc(col)}</th>`).join('')}</tr></thead>
        <tbody>${rows}</tbody>
      </table></div>`;
  }

  /* Week-by-week chart: columns for people reached (to scale, one axis), and under each week a row of
     rings for positive replies and a row of ink dots for calls booked (one mark each, so they count). */
  /* The width the chart's card leaves for it, following the page's breakpoints, so the columns fit without scrolling */
  function chartRoom() {
    const w = window.innerWidth || 1440;
    const gutter = w <= 860 ? 16 : w <= 1100 ? 24 : 32;
    const content = w - (w <= 860 ? 0 : 250) - 2 * gutter;
    const card = w > 1100 ? (content - 16) / 2 : content;
    return Math.max(280, Math.floor(card - 34));
  }
  function weekChart(weeks, ongoing) {
    const G = 84, BAR = 24, TOP = 24, PLOT = 148, XL = 24, ROW = 22;
    const SLOT = Math.max(44, Math.min(88, Math.floor((chartRoom() - G - 4) / Math.max(1, weeks.length))));
    const max = Math.max(1, ...weeks.map((w) => w.people));
    const step = [5, 10, 20, 25, 50, 100, 200].find((s) => max / s <= 4) || 500;
    const top = Math.ceil(max / step) * step;
    const W = G + weeks.length * SLOT + 4;
    const base = TOP + PLOT;
    const H = base + XL + ROW * 2 + 6;
    const y = (v) => Math.round((base - (v / top) * PLOT) * 10) / 10;
    const ticks = [];
    for (let v = 0; v <= top; v += step) ticks.push(v);
    const grid = ticks.map((v) => `<line class="cp-grid" x1="${G}" x2="${W}" y1="${y(v)}" y2="${y(v)}"/><text class="cp-lbl" x="${G - 12}" y="${y(v) + 4}" text-anchor="end">${v}</text>`).join('');
    const dots = (n, cls, cx, cy) => (n > 5
      ? `<text class="cp-val" x="${cx}" y="${cy + 4}" text-anchor="middle">${n}</text>`
      : Array.from({ length: n }, (_, k) => `<circle class="${cls}" cx="${cx - ((n - 1) * 12) / 2 + k * 12}" cy="${cy}" r="4.5"/>`).join(''));
    const cols = weeks.map((w, i) => {
      const cx = G + i * SLOT + SLOT / 2;
      const h = (w.people / top) * PLOT;
      const x = cx - BAR / 2, yt = base - h, r = Math.min(4, h);
      const d = h > 0 ? `M${x},${base} V${yt + r} Q${x},${yt} ${x + r},${yt} H${x + BAR - r} Q${x + BAR},${yt} ${x + BAR},${yt + r} V${base} Z` : '';
      const soFar = ongoing && i === weeks.length - 1;
      const label = `Week of ${w.label}${soFar ? ', so far' : ''}: ${w.people} people reached, ${OB.plural(w.positive, 'positive reply', 'positive replies')}, ${OB.plural(w.calls, 'call')} booked`;
      return `<g class="cp-wk" tabindex="0" role="img" aria-label="${esc(label)}" data-week="${esc(w.label)}${soFar ? ' (so far)' : ''}" data-people="${w.people}" data-pos="${w.positive}" data-calls="${w.calls}">
        <rect class="cp-band" x="${G + i * SLOT + 6}" y="4" width="${SLOT - 12}" height="${H - 6}" rx="8"/>
        ${d ? `<path class="cp-bar" d="${d}"/>` : ''}
        <text class="cp-val" x="${cx}" y="${yt - 7}" text-anchor="middle">${w.people}</text>
        <text class="cp-lbl" x="${cx}" y="${base + 17}" text-anchor="middle">${esc(w.label)}</text>
        ${dots(w.positive, 'cp-pos', cx, base + XL + ROW / 2)}
        ${dots(w.calls, 'cp-call', cx, base + XL + ROW + ROW / 2)}
      </g>`;
    }).join('');
    const rowLabels = `<text class="cp-lbl" x="${G - 12}" y="${base + XL + ROW / 2 + 4}" text-anchor="end">Positive</text><text class="cp-lbl" x="${G - 12}" y="${base + XL + ROW + ROW / 2 + 4}" text-anchor="end">Calls</text>`;
    return `<svg class="cp-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="group" aria-label="People reached each week, with positive replies and calls booked">${grid}<line class="cp-axis" x1="${G}" x2="${W}" y1="${base}" y2="${base}"/>${cols}${rowLabels}</svg>`;
  }

  /* Chart tooltip: values first, the week second. Same on hover and keyboard focus. */
  function tipShow(g) {
    const fig = g.closest('.cp-chart');
    const tip = fig && fig.querySelector('.cp-tip');
    if (!tip) return;
    const d = g.dataset;
    const line = (cls, text) => { const s = document.createElement('span'); if (cls) s.className = cls; s.textContent = text; return s; };
    tip.textContent = '';
    tip.append(line('t-medium', `${d.people} people reached`), line('', `${OB.plural(Number(d.pos), 'positive reply', 'positive replies')}, ${OB.plural(Number(d.calls), 'call')} booked`), line('t-2', `Week of ${d.week}`));
    tip.hidden = false;
    const fr = fig.getBoundingClientRect();
    const band = g.querySelector('.cp-band') || g;
    const br = band.getBoundingClientRect();
    let left = br.right - fr.left + 8;
    if (left + tip.offsetWidth > fr.width) left = br.left - fr.left - 8 - tip.offsetWidth;
    tip.style.left = `${Math.max(0, left)}px`;
    tip.style.top = `${br.top - fr.top + 16}px`;
  }
  function tipHide(g) { const fig = g && g.closest && g.closest('.cp-chart'); const tip = fig && fig.querySelector('.cp-tip'); if (tip) tip.hidden = true; }
  const wkOf = (t) => (t && t.closest ? t.closest('.cp-wk') : null);
  document.addEventListener('pointerover', (e) => { const g = wkOf(e.target); if (g) tipShow(g); });
  document.addEventListener('pointerout', (e) => { const g = wkOf(e.target); if (g && !g.contains(e.relatedTarget)) tipHide(g); });
  document.addEventListener('focusin', (e) => { const g = wkOf(e.target); if (g) tipShow(g); });
  document.addEventListener('focusout', (e) => { const g = wkOf(e.target); if (g) tipHide(g); });

  /* ---------- Settings tab: Attio's grouped panels, a label column with the control beside it ---------- */
  const panel = (id, ic, title, rows, extra = '', cls = '') => `<section class="card card-flush cp-panel${cls}" aria-labelledby="${id}">
      <div class="card-head">${icon(ic, 16)}<h2 id="${id}">${title}</h2>${extra}</div>
      <div class="cp-rows">${rows}</div>
    </section>`;
  /* One field row. The label is a real <label> when the control is a field, otherwise text the control points at */
  const frow = (label, hint, control, { forId, labelId, hintId, cls = '' } = {}) => `<div class="cp-frow${cls}">
      <div class="cp-flabel">${forId ? `<label for="${forId}">${label}</label>` : `<span${labelId ? ` id="${labelId}"` : ''}>${label}</span>`}${hint ? `<span class="cp-fhint"${hintId ? ` id="${hintId}"` : ''}>${hint}</span>` : ''}</div>
      <div class="cp-fctl">${control}</div>
    </div>`;
  /* A switch row: the words on the left, the switch on the right */
  const switchRow = (id, on, action, arg, label, hint) => `<div class="cp-frow cp-frow-switch">
      <div class="cp-flabel"><label for="${id}">${label}</label><span class="cp-fhint" id="${id}-d">${hint}</span></div>
      <div class="cp-fctl">${ui.sw({ id, on, action, arg, describedBy: `${id}-d` })}</div>
    </div>`;

  function settingsTab(c) {
    const list = OB.get.list(c.list);
    const flow = flowOf(c);
    const chans = flow ? chUsed(flow.steps) : [];
    const per = c.perCompany || 2;
    const order = c.titleOrder || D.profile.titles.slice();
    const finished = c.status === 'finished';
    const nameId = `cp-name-${c.id}`;
    const nameRow = frow('Campaign name', 'Only you and your teammates see it.', `<input class="input" type="text" id="${nameId}" value="${esc(c.name)}" data-change="cp-set-name" data-arg="${esc(c.id)}" maxlength="80" autocomplete="off" aria-describedby="${nameId}-h">`, { forId: nameId, hintId: `${nameId}-h` });
    const listRow = list ? frow('List', '', `<span class="cp-fval">${esc(list.name)}</span><span class="cp-fsub num">${fmt.num(list.companies)} companies, ${fmt.num(list.people)} people. ${esc(list.source)}. <a href="#contacts.list.${esc(list.id)}">Open list</a></span>`) : '';
    const keepRow = finished ? '' : switchRow(`cp-keep-${c.id}`, c.keepFinding, 'cp-keep', c.id, 'Keep finding companies like these', 'When fewer than about 50 people are left, Onbook adds similar companies, favouring ones like those that replied. Finding them is free; a new person costs 1 credit the day before their first message.');
    const basics = panel('cps-basics', 'campaigns', 'Campaign', nameRow + listRow + keepRow);
    if (finished) {
      const done = panel('cps-done', 'flag', 'Finished', `<div class="cp-frow cp-frow-text">
          <p>This campaign finished on ${esc(fmt.day(c.ended))}. Its settings are kept with its results.</p>
          <p class="t-2">To reach more companies like these, start a new campaign from this one. Its flow comes with it.</p>
          <div>${ui.btn({ label: 'Add more companies like these', icon: 'plus', size: 's', action: 'cp-more-like', arg: c.id })}</div>
        </div>`);
      return `<div class="cp-settings">${basics}${done}</div>`;
    }

    const perRow = frow('People per company', '',
      `<div class="seg" role="group" aria-labelledby="cp-per-l" aria-describedby="cp-per-h">${[1, 2, 3].map((n) => `<button type="button" id="cp-per-${n}" aria-pressed="${n === per}" data-action="cp-per" data-arg="${esc(c.id)}~${n}">${n}</button>`).join('')}</div>
      <span class="cp-fhint" id="cp-per-h">One person at a time, best fit first. The next person starts only when the one before finishes the flow with no reply.</span>`, { labelId: 'cp-per-l' });
    const orderRow = frow('Title order', 'Onbook starts with the first title it finds at each company, then the next.',
      `<ol class="cp-order" aria-labelledby="cp-order-l">${order.map((t, i) => `<li>
          <span class="cp-order-n num" aria-hidden="true">${i + 1}</span><span class="grow truncate">${esc(t)}</span>
          ${ui.btn({ icon: 'arrow-up', ariaLabel: `Move ${t} up`, title: `Move ${t} up`, kind: 'ghost', size: 's', action: 'cp-title-move', arg: `${c.id}~${i}~-1`, id: `cp-to-${i}-up`, disabled: i === 0 })}
          ${ui.btn({ icon: 'arrow-down', ariaLabel: `Move ${t} down`, title: `Move ${t} down`, kind: 'ghost', size: 's', action: 'cp-title-move', arg: `${c.id}~${i}~1`, id: `cp-to-${i}-down`, disabled: i === order.length - 1 })}
        </li>`).join('')}</ol>`, { labelId: 'cp-order-l' });
    const who = panel('cps-who', 'contacts', 'Who to contact at each company', perRow + orderRow, '<span class="link">Applies from tomorrow</span>');

    const nn = c.noNews || 'skip';
    const radio = (v, title, desc) => `<label class="cp-choice"><input type="radio" name="cp-nn-${esc(c.id)}" id="cp-nn-${v}" value="${v}" data-change="cp-nonews" data-arg="${esc(c.id)}"${nn === v ? ' checked' : ''}><span class="cp-choice-text"><span class="cp-choice-title">${title}</span><span class="cp-fhint">${desc}</span></span></label>`;
    const news = panel('cps-news', 'zap', 'When there\'s no recent news', `<div class="cp-choices" role="radiogroup" aria-labelledby="cps-news">
        ${radio('skip', 'Skip the company <span class="t-2">(recommended)</span>', 'Onbook moves on to a company with a real reason to reach out.')}
        ${radio('role', 'Write from their role', 'Says who you are and asks an easy question about their role, with nothing invented.')}
      </div>`, '<span class="link">Some companies have no dated news</span>');

    const accRows = chans.map((ch) => {
      const a = D.accounts.find((x) => x.ch === ch);
      if (!a) return '';
      const signedOut = ch === 'linkedin' && OB.state.sim.linkedinIssue;
      const paused = OB.state.sim.paymentFailed;
      const nums = ch === 'email' ? `${a.newPerDay} new people and ${a.sendCap} emails a day` : ch === 'linkedin' ? `${a.newPerDay} invites and 40 messages a day` : a.status === 'warming' ? `${a.newPerDay} new people a day while warming up, rising to ${a.target}` : `${a.newPerDay} new people and 20 DMs a day`;
      const state = paused ? ui.tag('red', 'Paused: payment failed')
        : signedOut ? `<span class="row gap-2">${ui.tag('amber', 'Signed out')}<button type="button" class="link-btn t-small" data-action="reconnect-linkedin">Reconnect</button></span>`
          : a.status === 'warming' ? ui.tag('grey', `Warming up, day ${a.rampDay} of ${a.rampDays}`) : ui.tag('green', 'Healthy');
      return `<div class="cp-acc">${ui.ch(ch, 16)}<span class="cp-acc-text"><span class="truncate">${esc(a.name)}</span><span class="cp-fhint">${esc(nums)}</span></span>${state}</div>`;
    }).join('');
    const hours = [
      ['Days', 'Weekdays only'],
      chans.includes('email') ? ['Email', 'From 9 AM to 6 PM in each recipient\'s time zone'] : null,
      chans.some((ch) => ch !== 'email') ? [chans.filter((ch) => ch !== 'email').map((ch) => OB.chName(ch)).join(' and '), 'From 9 AM to 6 PM in your time zone (London)'] : null,
    ].filter(Boolean).map(([k, v]) => frow(esc(k), '', `<span class="cp-fval">${esc(v)}</span>`, { cls: ' cp-frow-kv' })).join('');
    const sending = panel('cps-send', 'send', 'Sending', `${accRows}
      <div class="cp-frow cp-frow-text"><p class="t-small t-2">Together they reach about ${c.perDay || 15} new people a weekday for this campaign, after follow-ups. Limits are shared by all your campaigns.${flow && flow.steps.some((s) => s.kind === 'comment') ? ' Comments on posts count against the same daily limits.' : ''}</p></div>
      ${hours}
      ${chans.includes('x') ? switchRow(`cp-wx-${c.id}`, !!c.weekendX, 'cp-weekend', c.id, 'Send X DMs at weekends too', 'Useful when buyers answer DMs at weekends, as many in crypto do. Email and LinkedIn stay on weekdays.') : ''}`, '<a href="#settings.accounts">Manage accounts</a>');

    const mates = (c.teammates || []).map((m) => `<div class="cp-mate">${ui.avatar(m.email)}<span class="cp-acc-text"><span class="truncate">${esc(m.email)}</span></span>${ui.tag('outline', 'Invited')}</div>`).join('');
    const team = panel('cps-team', 'user', 'Teammates', `
      <div class="cp-mate">${ui.avatar(D.me.name)}<span class="cp-acc-text"><span>${esc(D.me.name)}</span><span class="cp-fhint truncate">${esc(D.me.email)}</span></span>${ui.tag('quiet', 'Owner')}</div>
      ${mates}
      <div class="cp-frow cp-frow-foot"><p class="t-small t-2">A reply to anyone stops that company for everyone. Each person answers the replies to their own messages.</p>${ui.btn({ label: 'Add a teammate', icon: 'plus', size: 's', action: 'cp-teammate', arg: c.id, id: 'cp-add-mate' })}</div>`);

    const danger = panel('cps-stop', 'stop', 'Stop and finish', `<div class="cp-frow cp-frow-foot"><p class="t-small t-2">Stops every message at once, including any queued for today. Replies still reach your Inbox.</p>${ui.btn({ label: 'Stop and finish campaign', kind: 'danger', icon: 'stop', size: 's', action: 'cp-finish', arg: c.id })}</div>`, '', ' cp-danger');

    return `<div class="cp-settings">
      <p class="t-small t-2">Changes save as you make them. Anything that changes who or what gets sent applies from tomorrow's batch.</p>
      ${basics}${who}${news}${sending}${team}${c.prepay ? '' : danger}
    </div>`;
  }

  /* ---------- New campaign ---------- */
  const NEW_STEPS = [['list', 'List'], ['flow', 'Flow'], ['launch', 'Launch']];
  const EXTRA = { industries: ['Wallets', 'Lending', 'Crypto infrastructure'], regions: ['Canada', 'Australia'], reasons: [] };

  function nw() {
    if (!OB.state.ui.cpNew) {
      OB.state.ui.cpNew = {
        mode: 'build', listId: null, name: '', nameAuto: false, nameError: '', listError: '',
        tweaks: { industries: D.profile.industries.slice(), regions: D.profile.regions.slice(), reasons: D.profile.reasons.slice() },
        flowFrom: 'default', copyFrom: 'c2', draftOf: null, likeOf: null,
      };
    }
    return OB.state.ui.cpNew;
  }
  const sourceId = (s) => (s.flowFrom === 'copy' && OB.get.campaign(s.copyFrom) && OB.get.campaign(s.copyFrom).flow) || 'default';
  function primeFromDraft(c) {
    const s = nw();
    if (s.draftOf === c.id) return;
    Object.assign(s, { draftOf: c.id, mode: 'saved', listId: c.list, name: c.name, nameAuto: false, flowFrom: 'default', nameError: '', listError: '' });
  }
  function matchEstimate(t) {
    const P = D.profile;
    if (!t.industries.length || !t.regions.length || !t.reasons.length) return 0;
    const est = P.matches * (t.industries.length / P.industries.length) * (0.55 + (0.45 * t.regions.length) / P.regions.length) * (0.7 + (0.3 * Math.min(1, t.reasons.length / P.reasons.length)));
    return Math.max(40, Math.round(est / 10) * 10);
  }
  function listInfo(s) {
    if (s.mode === 'saved') {
      const l = OB.get.list(s.listId);
      if (!l) return null;
      const skip = D.cpListSkips[l.id] || 0;
      return { listId: l.id, name: l.name, people: l.people - skip, companies: l.companies, skip, source: l.source };
    }
    if (s.mode === 'build') return { listId: null, name: 'New list from your profile', people: D.cpBuilt.people, companies: D.cpBuilt.companies, skip: 0, source: 'Built from your profile' };
    return null;
  }

  /* The top bar: crumbs, the title, and the three steps on the right where Attio keeps its controls */
  function newHead(s, sub, step) {
    return ui.pageHead({
      icon: 'campaigns',
      crumbs: [{ label: 'Campaigns', href: '#campaigns' }],
      title: 'New campaign',
      sub: s.draftOf && OB.get.campaign(s.draftOf) ? esc(`Your draft "${OB.get.campaign(s.draftOf).name}" is saved. ${sub}`) : esc(sub),
      actions: newSteps(step),
    });
  }
  function newSteps(cur) {
    const ci = NEW_STEPS.findIndex(([k]) => k === cur);
    return `<ol class="cp-steps" aria-label="New campaign, step ${ci + 1} of 3">${NEW_STEPS.map(([k, label], i) => {
      const done = i < ci;
      const inner = `<span class="cp-step-n" aria-hidden="true">${done ? icon('check', 12) : i + 1}</span><span>${label}</span><span class="sr-only">${done ? ', done' : i === ci ? ', current step' : ''}</span>`;
      return `<li class="${done ? 'is-done' : ''}"${i === ci ? ' aria-current="step"' : ''}>${done ? `<a href="#new-campaign.${k}">${inner}</a>` : inner}</li>`;
    }).join('')}</ol>`;
  }

  OB.route('new-campaign', (params, r) => newCampaign(params, r));
  function newCampaign(params, r) {
    const step = NEW_STEPS.some(([k]) => k === params[0]) ? params[0] : 'list';
    /* Contacts' "start a campaign from this list" hands over the list to start from */
    const handed = OB.state.ui.newCampaignListId;
    if (handed) {
      OB.state.ui.newCampaignListId = null;
      const l = OB.get.list(handed);
      const busy = l && l.campaign && ['running', 'paused'].includes((OB.get.campaign(l.campaign) || {}).status);
      if (l && !busy) { OB.state.ui.cpNew = null; const s0 = nw(); s0.mode = 'saved'; s0.listId = l.id; autoName(s0, l.name); draftFor(s0); }
    }
    const s = nw();
    /* Screens menu: the flow with a comment on their latest post, as someone building a new campaign sees it */
    const entering = r && (!OB.current || OB.current.route.raw !== r.raw);
    if (entering && step === 'flow' && params[1] === 'comment' && OB.flowBuilder) OB.flowBuilder.demo(sourceId(s), 'new', 'comment');
    const html = step === 'list' ? newList(s) : step === 'flow' ? newFlow(s) : newLaunch(s);
    return { shell: 'app', nav: 'campaigns', title: 'New campaign', html };
  }

  function newList(s) {
    const P = D.profile;
    const enter = s.modeEnter; // the option panel animates only when it opens
    s.modeEnter = null;
    const chips = (key, label, all, chosen) => `<div class="field">
        <span class="label" id="cp-g-${key}">${label}</span>
        <div class="chips" role="group" aria-labelledby="cp-g-${key}">${all.map((v, i) => { const on = chosen.includes(v); return `<button type="button" class="chip" id="cp-chip-${key}-${i}" aria-pressed="${on}" data-action="cp-new-chip" data-arg="${key}~${esc(v)}">${icon(on ? 'check' : 'plus', 14)}${esc(v)}</button>`; }).join('')}</div>
      </div>`;
    const t = s.tweaks;
    const est = matchEstimate(t);
    const like = s.likeOf && OB.get.campaign(s.likeOf);
    const buildBody = `
      ${like ? `<p class="cp-note">${icon('info', 16)}<span>Starting from ${esc(like.name)}: companies like the ${OB.plural(like.positive, 'one', 'ones')} that replied come first, and nobody it already contacted is added.</span></p>` : ''}
      ${chips('industries', 'Industries', P.industries.concat(EXTRA.industries), t.industries)}
      ${chips('regions', 'Regions', P.regions.concat(EXTRA.regions), t.regions)}
      ${chips('reasons', 'Reasons to reach out', P.reasons, t.reasons)}
      <p class="cp-match${est ? '' : ' is-bad'}" aria-live="polite">${est ? '' : icon('alert', 16)}<span>${est ? 'Onbook checks over 30,000 companies against these and picks the best 100 to start, ranked on fit and fresh news, with up to 2 people at each. It keeps finding more like them.' : 'Pick at least one industry, region and reason to reach out.'}</span></p>
      <p class="t-small t-2">These choices apply to this campaign only. Your company profile stays as it is.</p>`;
    const lists = D.lists.map((l) => {
      const camp = l.campaign ? OB.get.campaign(l.campaign) : null;
      const inUse = !!camp && (camp.status === 'running' || camp.status === 'paused');
      const sel = s.listId === l.id;
      return `<label class="cp-list${inUse ? ' is-off' : ''}${sel ? ' is-sel' : ''}">
        <input type="radio" name="cp-list" value="${esc(l.id)}" id="cp-list-${esc(l.id)}" data-change="cp-new-list"${sel ? ' checked' : ''}${inUse ? ' disabled' : ''}>
        <span class="stack grow" style="--gap:2px;min-width:0"><span class="t-medium">${esc(l.name)}</span><span class="t-small t-2 num">${fmt.num(l.companies)} companies, ${fmt.num(l.people)} people. ${esc(l.source)}.</span></span>
        ${inUse ? `<span class="t-small t-2 cp-list-use">In ${esc(camp.name)}</span>` : ''}
      </label>`;
    }).join('');
    const L = s.mode === 'saved' ? listInfo(s) : null;
    const savedBody = `<div class="cp-lists" role="radiogroup" aria-label="Saved lists">${lists}</div>
      ${L ? `<p class="cp-note">${icon('info', 16)}<span>${L.skip ? `${OB.plural(L.skip, 'person', 'people')} already in a running campaign will be skipped, so this campaign starts with ${fmt.num(L.people)}.` : `Nobody on this list is in a running campaign, so all ${fmt.num(L.people)} people can start.`}</span></p>` : ''}
      <p class="t-small t-2">Lists in a running or paused campaign can't be used again until that campaign finishes.</p>`;
    const csvBody = `<p class="t-small t-2">One row per person, with their name and at least one of: work email, LinkedIn profile or company website. Onbook checks every row against Never contact and your running campaigns before anything sends.</p>`;
    const opt = (mode, title, desc, body) => `<div class="cp-opt${s.mode === mode ? ' is-sel' : ''}">
        <label class="cp-opt-head"><input type="radio" name="cp-mode" value="${mode}" id="cp-mode-${mode}" data-change="cp-new-mode"${s.mode === mode ? ' checked' : ''}><span class="stack" style="--gap:2px"><span class="t-medium">${title}</span><span class="t-small t-2">${desc}</span></span></label>
        ${s.mode === mode ? `<div class="cp-opt-body${enter === mode ? ' is-enter' : ''}">${body}</div>` : ''}
      </div>`;
    const err = s.listError ? `<p class="field-error cp-opt-err" id="cp-list-err">${icon('alert', 16)}${esc(s.listError)}</p>` : '';
    const placeholder = s.mode === 'saved' && L ? L.name : 'For example: Payments in the UK';
    const primary = s.mode === 'csv'
      ? ui.btn({ label: 'Import a CSV', kind: 'primary', icon: 'upload', href: '#contacts.import' })
      : ui.btn({ label: 'Continue to flow', kind: 'primary', type: 'submit', iconRight: 'arrow-right', id: 'cp-continue' });
    const nameErr = s.nameError ? `<span class="field-error" id="cp-new-name-err">${icon('alert', 16)}${esc(s.nameError)}</span>` : '';
    const nameRow = frow('Campaign name', 'Only you and your teammates see it.', `<input class="input" type="text" id="cp-new-name" name="name" value="${esc(s.name)}" placeholder="${esc(placeholder)}" maxlength="80" autocomplete="off" data-input="cp-new-name" aria-describedby="cp-new-name-h${s.nameError ? ' cp-new-name-err' : ''}"${s.nameError ? ' aria-invalid="true"' : ''}>${nameErr}`, { forId: 'cp-new-name', hintId: 'cp-new-name-h' });
    return `${newHead(s, 'Choose who to contact, set the flow, then launch. Nothing sends until you launch.', 'list')}
      <form class="cp-new" data-submit="cp-new-continue" novalidate>
        <section class="card card-flush cp-panel" aria-labelledby="cp-who-h">
          <div class="card-head">${icon('contacts', 16)}<h2 id="cp-who-h">Who should this campaign contact?</h2></div>
          ${err}
          <div class="cp-options" role="radiogroup" aria-labelledby="cp-who-h">
            ${opt('build', 'Build a new list from your profile', 'About 100 companies with a reason to buy now. Aim this campaign at its own industries, regions and reasons.', buildBody)}
            ${opt('saved', 'Use a saved list', 'A list you built or imported before.', savedBody)}
            ${opt('csv', 'Import a CSV', 'People or companies from a spreadsheet, such as event contacts.', csvBody)}
          </div>
        </section>
        ${panel('cp-name-h', 'edit', 'Name it', nameRow)}
        <div class="cp-actions">${primary}${ui.btn({ label: 'Cancel', href: '#campaigns' })}</div>
      </form>`;
  }

  function newFlow(s) {
    const fb = OB.flowBuilder;
    const src = sourceId(s);
    const ok = fb ? fb.valid(src, 'new') : true;
    const why = fb && !ok ? fb.blocker(src, 'new') : '';
    const camps = D.campaigns.filter((c) => c.flow && D.flows[c.flow] && c.id !== s.draftOf);
    const defaultText = fb && fb.describe ? fb.describe('default') : '6 steps over 14 days, email, LinkedIn and X';
    const from = (v, title, desc) => `<label class="cp-choice"><input type="radio" name="cp-from" value="${v}" id="cp-from-${v}" data-change="cp-new-from"${s.flowFrom === v ? ' checked' : ''}><span class="cp-choice-text"><span class="cp-choice-title">${title}</span><span class="cp-fhint">${desc}</span></span></label>`;
    const copyRow = s.flowFrom === 'copy'
      ? frow('Copy the flow from', '', `<select class="select" id="cp-copy-sel" data-change="cp-new-copy">${camps.map((c) => `<option value="${esc(c.id)}"${c.id === s.copyFrom ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</select>`, { forId: 'cp-copy-sel', cls: ' cp-frow-indent' })
      : '';
    const startFrom = `<section class="card card-flush cp-panel cp-narrow" aria-labelledby="cp-from-h">
        <div class="card-head">${icon('layers', 16)}<h2 id="cp-from-h">Start from</h2></div>
        <div class="cp-choices" role="radiogroup" aria-labelledby="cp-from-h">
          ${from('default', 'The default flow', esc(defaultText))}
          ${from('copy', 'A copy of another campaign\'s flow', 'Changes here never touch that campaign.')}
        </div>
        ${copyRow}
      </section>`;
    const builder = fb ? fb.render({ flowId: src, mode: 'new', editable: true, headingLevel: 3 }) : '<p class="t-2">The flow builder could not load. Reload the page to try again.</p>';
    return `${newHead(s, 'Set the flow: the steps, channels and timing everyone in this campaign gets. You approve it once.', 'flow')}
      ${startFrom}
      <section class="cp-flow-sec" aria-labelledby="cp-flow-h"><h2 class="sr-only" id="cp-flow-h">The flow</h2>${builder}</section>
      <div class="cp-actions">
        ${ui.btn({ label: 'Approve flow and continue', kind: 'primary', action: 'cp-new-approve', id: 'cp-approve', disabled: !ok, extra: ok ? '' : 'aria-describedby="cp-approve-why"' })}
        ${ui.btn({ label: 'Back', icon: 'arrow-left', href: '#new-campaign.list' })}
        ${ok ? '' : `<p class="cp-why t-small" id="cp-approve-why">${icon('alert', 16)}<span>${esc(why)}</span></p>`}
      </div>`;
  }

  function newLaunch(s) {
    const fb = OB.flowBuilder;
    const src = sourceId(s);
    const steps = fb ? fb.steps(src, 'new') : [];
    const ok = fb ? fb.valid(src, 'new') : true;
    const L = listInfo(s);
    const chans = chUsed(steps);
    const accounts = D.accounts.filter((a) => chans.includes(a.ch));
    const left = Math.max(0, D.plan.allowance - OB.get.used());
    const comments = steps.some((x) => x.kind === 'comment');
    const name = s.name.trim() || (L ? L.name : 'New campaign');
    const change = (href, what) => `<a class="link-btn t-small cp-change" href="${href}">Change<span class="sr-only"> ${what}</span></a>`;
    let who;
    if (!L) {
      who = `<span>Choose who to contact first.</span>`;
    } else if (s.mode === 'build') {
      const tops = D.cpBuilt.top.filter((x) => s.tweaks.industries.includes(x.industry));
      const show = (tops.length ? tops : D.cpBuilt.top).slice(0, 4);
      who = `<span class="stack gap-3"><span><span class="t-medium">Built from your profile:</span> <span class="num">${fmt.num(L.companies)} companies, ${fmt.num(L.people)} people.</span> ${D.cpBuilt.withNews} of ${L.companies} have news from the last 30 days.</span>
        <ul class="cp-tops" role="list">${show.map((x) => `<li class="cp-cell"><span class="rec">${ui.co(x.name, 'sm')}<span>${esc(x.name)}</span></span><span class="cp-dim">${esc(x.news)}, ${esc(fmt.ago(x.date))}</span></li>`).join('')}</ul>
        <span class="t-small t-2">And ${fmt.num(L.companies - show.length)} more. People show as first name and last initial until the day before their first message.</span></span>`;
    } else {
      who = `<span><strong class="t-medium">${esc(L.name)}:</strong> <span class="num">${fmt.num(L.companies)} companies, ${fmt.num(L.people)} people</span>${L.skip ? `, after ${OB.plural(L.skip, 'person', 'people')} already in a running campaign are skipped` : ''}.</span>`;
    }
    const flowRow = steps.length
      ? `<span class="stack gap-2">${ui.strip(steps, steps.map(() => 'todo'), `The flow: ${steps.map((x) => x.title).join(', then ')}`)}<span>${esc(fb.summary(src, 'new'))}. ${!ok ? '' : fb.approved(src, 'new') ? 'Approved by you today.' : 'You approve it when you launch.'}</span></span>`
      : '<span>No flow yet.</span>';
    const accRow = accounts.map((a) => `<span class="row gap-2">${ui.ch(a.ch, 15)}<span>${esc(a.name)}${a.status === 'warming' ? '<span class="t-2">, warming up</span>' : ''}</span></span>`).join('');
    const blocked = !ok || !L;
    return `${newHead(s, 'Check it once more. Launching starts sending today.', 'launch')}
      <div class="cp-launch">
        <section class="card card-flush cp-panel" aria-labelledby="cp-launch-h">
          <div class="card-head">${icon('campaigns', 16)}<h2 id="cp-launch-h" class="truncate">${esc(name)}</h2>${ui.status('ready')}</div>
          <dl class="cp-sum">
            <div class="cp-sum-row"><dt>Who</dt><dd>${who}</dd><dd class="cp-sum-act">${change('#new-campaign.list', 'who to contact')}</dd></div>
            <div class="cp-sum-row"><dt>Flow</dt><dd>${flowRow}</dd><dd class="cp-sum-act">${change('#new-campaign.flow', 'the flow')}</dd></div>
            <div class="cp-sum-row"><dt>Sends from</dt><dd><span class="stack gap-2">${accRow}</span></dd><dd class="cp-sum-act"></dd></div>
            <div class="cp-sum-row"><dt>Expected reach</dt><dd>About 15 new people a weekday, inside working hours. The first start today from 2:30 PM.</dd><dd class="cp-sum-act"></dd></div>
            <div class="cp-sum-row"><dt>Credits</dt><dd>A new person costs 1 credit, the day before their first message${comments ? '; this flow also comments on their latest post, 1 credit each when they have posted' : ''}. <span class="num">${fmt.num(left)}</span> of your ${fmt.num(D.plan.allowance)} credits are left this month. Follow-ups, replies and bookings are free.</dd><dd class="cp-sum-act"></dd></div>
          </dl>
        </section>
        <section class="card card-flush cp-panel" aria-labelledby="cp-next-h">
          <div class="card-head">${icon('clock', 16)}<h2 id="cp-next-h">What happens when you launch</h2></div>
          <div class="card-body stack gap-4">
            <ol class="cp-launch-steps">
              <li><span><span>Today.</span> <span class="t-2">Onbook buys contact details for the first people and sends their first steps inside working hours.</span></span></li>
              <li><span><span>Each weekday.</span> <span class="t-2">The next people start, follow-ups go out, and every message is checked before it sends.</span></span></li>
              <li><span><span>When someone replies.</span> <span class="t-2">Everyone at that company stops, on every channel, and the reply lands in your Inbox.</span></span></li>
            </ol>
            <p class="cp-promise">${icon('shield', 16)}<span>Every message follows the flow you approved and is checked for made-up facts before it sends. Stop the campaign any time and nothing else goes out.</span></p>
          </div>
        </section>
      </div>
      <div class="cp-actions">
        ${ui.btn({ label: 'Launch campaign', kind: 'primary', action: 'cp-launch', id: 'cp-launch-btn', disabled: blocked, extra: blocked ? 'aria-describedby="cp-launch-why"' : '' })}
        ${ui.btn({ label: 'Back', icon: 'arrow-left', href: '#new-campaign.flow' })}
        ${blocked ? `<p class="cp-why t-small" id="cp-launch-why">${icon('alert', 16)}<span>${!L ? 'Choose who to contact before you launch.' : `The flow has a check to fix: ${esc(fb.blocker(src, 'new'))}`}</span></p>` : ''}
      </div>`;
  }

  /* ---------- Actions: list and header ---------- */
  OB.action('cp-list-filter', (el, e, f) => { OB.set({ cpListFilter: f }); focusArg('.cp-filters', f); });
  OB.action('cp-open', (el, e, id) => {
    const c = getCampaign(id);
    if (!c) return;
    if (c.status === 'draft') { primeFromDraft(c); OB.go('new-campaign.flow'); return; }
    OB.go(`campaign.${c.id}`);
  });
  OB.action('cp-new-start', () => { OB.state.ui.cpNew = null; nw(); OB.go('new-campaign.list'); });

  OB.action('cp-more', (el, e, id) => {
    const c = getCampaign(id);
    if (!c) return;
    const items = [
      { label: 'Rename', icon: 'edit', action: 'cp-rename', arg: id },
      { label: 'Duplicate', icon: 'copy', action: 'cp-duplicate', arg: id },
      { label: 'Export people as CSV', icon: 'download', action: 'cp-export', arg: id },
    ];
    /* Nothing to stop before the first payment: the campaign hasn't launched */
    if (c.status !== 'finished' && !(c.id === FIRST && prePay())) items.push({ sep: true }, { label: 'Stop and finish campaign', icon: 'stop', action: 'cp-finish', arg: id, danger: true });
    OB.menu(el, items);
  });

  OB.action('cp-pause', (el, e, id) => {
    const c = getCampaign(id);
    if (!c) return;
    OB.confirm({
      title: 'Pause this campaign?',
      body: 'Nothing else sends from it until you resume, including messages queued for today. Replies still reach your Inbox, and everyone keeps their place in the flow.',
      confirmLabel: 'Pause campaign',
      onConfirm: () => {
        const prev = { status: c.status, pausedOn: c.pausedOn };
        c.status = 'paused';
        c.pausedOn = todayStr();
        OB.render({ keepScroll: true });
        focusEl('cp-resume-main');
        OB.toast('Campaign paused', { undo: () => { Object.assign(c, prev); OB.render({ keepScroll: true }); focusEl('cp-pause-btn'); } });
      },
    });
  });
  OB.action('cp-resume', (el, e, id) => {
    const c = getCampaign(id);
    if (!c) return;
    const prev = { status: c.status, pausedOn: c.pausedOn, nextSend: c.nextSend };
    c.status = 'running';
    c.nextSend = c.nextSend || '2026-10-07T13:00';
    OB.render({ keepScroll: true });
    focusEl('cp-pause-btn');
    OB.toast('Campaign resumed. Sending starts again within today\'s limits.', { undo: () => { Object.assign(c, prev); OB.render({ keepScroll: true }); focusEl('cp-resume-main'); } });
  });
  OB.action('cp-finish', (el, e, id) => {
    const c = getCampaign(id);
    if (!c) return;
    OB.confirm({
      title: 'Stop and finish this campaign?',
      body: 'Every message stops at once, including any queued for today. Credits for people whose first message hasn\'t sent come back to you. Replies still reach your Inbox. A finished campaign can\'t restart, but you can duplicate it.',
      confirmLabel: 'Stop and finish campaign',
      danger: true,
      onConfirm: () => {
        const prev = { status: c.status, ended: c.ended };
        c.status = 'finished';
        c.ended = todayStr();
        OB.render({ keepScroll: true });
        focusEl('page-title');
        OB.toast('Campaign stopped and finished', { undo: () => { Object.assign(c, prev); OB.render({ keepScroll: true }); } });
      },
    });
  });

  function renameDialog(c, error) {
    return `${OB.dialogHead('Rename campaign')}
      <form class="stack gap-5" data-submit="cp-rename-save" data-arg="${esc(c.id)}" novalidate>
        ${ui.field({ id: 'cp-rename-input', label: 'Campaign name', value: c.name, error, extra: 'name="name" maxlength="80" autocomplete="off" autofocus' })}
        <div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${ui.btn({ label: 'Rename campaign', kind: 'primary', type: 'submit' })}</div>
      </form>`;
  }
  OB.action('cp-rename', (el, e, id) => { const c = getCampaign(id); if (c) OB.dialog(renameDialog(c), { label: 'Rename campaign' }); });
  OB.action('cp-rename-save', (form, e, data) => {
    const c = getCampaign(form.dataset.arg);
    if (!c) return;
    const name = String(data.name || '').trim();
    if (!name) {
      const box = document.querySelector('#overlay .dialog');
      if (box) { box.innerHTML = renameDialog(c, 'Give the campaign a name so you can find it later.'); focusEl('cp-rename-input'); }
      return;
    }
    c.name = name;
    OB.closeOverlays();
    OB.render({ keepScroll: true });
    OB.toast('Campaign renamed');
  });
  OB.action('cp-duplicate', (el, e, id) => {
    const c = getCampaign(id);
    if (!c) return;
    OB.state.ui.cpNew = null;
    Object.assign(nw(), { name: `${c.name} (copy)`, flowFrom: c.flow ? 'copy' : 'default', copyFrom: id });
    OB.go('new-campaign.list');
    OB.toast('Campaign duplicated with its flow. Choose who it contacts.');
  });
  OB.action('cp-export', (el, e, id) => { const c = getCampaign(id); if (c) OB.toast(`${OB.plural(c.people, 'person', 'people')} exported as CSV`); });
  OB.action('cp-more-like', (el, e, id) => {
    const c = getCampaign(id);
    if (!c) return;
    OB.state.ui.cpNew = null;
    const s = nw();
    const like = D.cpBuilt.like[id];
    if (like) Object.assign(s.tweaks, { industries: like.industries.slice(), reasons: like.reasons.slice() });
    Object.assign(s, { mode: 'build', name: `${c.name}, more`, likeOf: id, flowFrom: c.flow ? 'copy' : 'default', copyFrom: id });
    OB.go('new-campaign.list');
  });

  /* ---------- Actions: people ---------- */
  OB.action('cp-stage', (el, e, arg) => { const [id, st] = String(arg).split('~'); OB.set(setMap('cpStage', id, st)); if (isMainStage(st)) focusArg('.cp-filters', `${id}~${st}`); else focusEl('cp-st-more'); });
  OB.action('cp-stage-more', (el, e, id) => {
    const c = getCampaign(id);
    if (!c) return;
    const counts = stageCounts(c);
    OB.menu(el, STAGES.slice(MAIN_STAGES).map(([k, label]) => ({ label, hint: fmt.num(counts[k] || 0), action: 'cp-stage', arg: `${id}~${k}` })));
  });
  OB.action('cp-search', (el) => OB.set(setMap('cpQuery', el.dataset.arg, el.value)));
  OB.action('cp-clear', (el, e, id) => { OB.set(Object.assign(setMap('cpStage', id, 'all'), setMap('cpQuery', id, ''))); focusArg('.cp-filters', `${id}~all`); });
  OB.action('cp-person', (el, e, id) => { if (OB.openPerson) OB.openPerson(id); else OB.go(`contacts.person.${id}`); });
  OB.action('cp-page', () => OB.toast('This prototype shows the first page of people'));

  /* ---------- Actions: results ---------- */
  OB.action('cp-chart-view', (el, e, arg) => {
    const [id, k] = String(arg).split('~');
    const table = k ? k === 'table' : !(OB.state.ui.cpChartTable || {})[id];
    OB.set(setMap('cpChartTable', id, table));
    focusEl(`cp-view-${table ? 'table' : 'chart'}`);
  });

  /* ---------- Actions: settings ---------- */
  OB.action('cp-set-name', (el) => {
    const c = getCampaign(el.dataset.arg);
    const v = el.value.trim();
    if (!c) return;
    if (!v) { el.value = c.name; OB.toast('A campaign needs a name, so the old one stays'); return; }
    if (v === c.name) return;
    c.name = v;
    OB.render({ keepScroll: true });
    OB.toast('Name saved');
  });
  OB.action('cp-keep', (el, e, id) => {
    const c = getCampaign(id);
    if (!c) return;
    c.keepFinding = !c.keepFinding;
    OB.render({ keepScroll: true });
    OB.toast(c.keepFinding ? 'Onbook will keep finding companies like these' : 'Onbook will stop adding companies to this list');
  });
  OB.action('cp-per', (el, e, arg) => {
    const [id, n] = String(arg).split('~');
    const c = getCampaign(id);
    if (!c || Number(n) === (c.perCompany || 2)) return;
    c.perCompany = Number(n);
    OB.render({ keepScroll: true });
    focusEl(`cp-per-${n}`);
    OB.toast(`Up to ${OB.plural(Number(n), 'person', 'people')} per company, from tomorrow`);
  });
  OB.action('cp-title-move', (el, e, arg) => {
    const [id, i, dir] = String(arg).split('~');
    const c = getCampaign(id);
    if (!c) return;
    const order = (c.titleOrder || D.profile.titles.slice()).slice();
    const a = Number(i), b = a + Number(dir);
    if (b < 0 || b >= order.length) return;
    [order[a], order[b]] = [order[b], order[a]];
    c.titleOrder = order;
    OB.render({ keepScroll: true });
    const want = document.getElementById(`cp-to-${b}-${Number(dir) < 0 ? 'up' : 'down'}`);
    if (want && !want.disabled) want.focus(); else focusEl(`cp-to-${b}-${Number(dir) < 0 ? 'down' : 'up'}`);
  });
  OB.action('cp-nonews', (el, e, v) => {
    const c = getCampaign(el.dataset.arg);
    if (!c) return;
    c.noNews = v;
    OB.render({ keepScroll: true });
    focusEl(`cp-nn-${v}`);
    OB.toast(v === 'skip' ? 'Companies with no recent news will be skipped' : 'Companies with no recent news get a message from their role');
  });
  OB.action('cp-weekend', (el, e, id) => {
    const c = getCampaign(id);
    if (!c) return;
    c.weekendX = !c.weekendX;
    OB.render({ keepScroll: true });
    OB.toast(c.weekendX ? 'X DMs will send at weekends too' : 'X DMs will send on weekdays only');
  });

  function teammateDialog(c, error, value = '') {
    return `${OB.dialogHead('Add a teammate', esc(`They join ${c.name} and send from their own accounts.`))}
      <form class="stack gap-5" data-submit="cp-teammate-send" data-arg="${esc(c.id)}" novalidate>
        ${ui.field({ id: 'cp-tm-email', label: 'Work email', type: 'email', value, placeholder: 'name@tideline.studio', error, extra: 'name="email" autocomplete="email" autofocus' })}
        <ul class="cp-facts" role="list">
          <li>${icon('card', 16)}<span>Each teammate subscribes for $199 a month and gets their own 1,000 credits a month. There is no team plan.</span></li>
          <li>${icon('send', 16)}<span>They can send once they have subscribed. New companies in this campaign are then split equally.</span></li>
          <li>${icon('hand', 16)}<span>A reply to anyone stops that company for everyone.</span></li>
        </ul>
        <div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${ui.btn({ label: 'Send invite', kind: 'primary', type: 'submit' })}</div>
      </form>`;
  }
  OB.action('cp-teammate', (el, e, id) => { const c = getCampaign(id); if (c) OB.dialog(teammateDialog(c), { label: 'Add a teammate' }); });
  OB.action('cp-teammate-send', (form, e, data) => {
    const c = getCampaign(form.dataset.arg);
    if (!c) return;
    const email = String(data.email || '').trim();
    const bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a work email, like name@tideline.studio.'
      : email.toLowerCase() === D.me.email ? 'That is your own email. Enter your teammate\'s.'
        : (c.teammates || []).some((m) => m.email.toLowerCase() === email.toLowerCase()) ? 'You have already invited this person.' : '';
    if (bad) {
      const box = document.querySelector('#overlay .dialog');
      if (box) { box.innerHTML = teammateDialog(c, bad, email); focusEl('cp-tm-email'); }
      return;
    }
    c.teammates = (c.teammates || []).concat({ email, status: 'invited' });
    OB.closeOverlays();
    OB.render({ keepScroll: true });
    OB.toast(`Invite sent to ${email}`);
  });

  /* ---------- Actions: New campaign ---------- */
  /* The name follows the chosen list until the user types their own */
  const autoName = (s, name) => { if (!s.name.trim() || s.nameAuto) { s.name = name; s.nameAuto = !!name; if (name) s.nameError = ''; } };
  /* Choosing the list of a saved draft continues that draft instead of making a second campaign */
  const draftFor = (s) => { const l = s.mode === 'saved' ? OB.get.list(s.listId) : null; const c = l && l.campaign ? OB.get.campaign(l.campaign) : null; s.draftOf = c && c.status === 'draft' ? c.id : null; };
  OB.action('cp-new-mode', (el, e, v) => {
    const s = nw();
    s.mode = v;
    s.modeEnter = v;
    s.listError = '';
    if (v === 'saved' && !s.listId) {
      const first = D.lists.find((l) => { const c = l.campaign ? OB.get.campaign(l.campaign) : null; return !c || (c.status !== 'running' && c.status !== 'paused'); });
      if (first) s.listId = first.id;
    }
    const l = v === 'saved' ? OB.get.list(s.listId) : null;
    autoName(s, l ? l.name : '');
    draftFor(s);
    OB.render({ keepScroll: true });
    focusEl(`cp-mode-${v}`);
  });
  OB.action('cp-new-chip', (el, e, arg) => {
    const [key, ...rest] = String(arg).split('~');
    const v = rest.join('~');
    const s = nw();
    const arr = s.tweaks[key];
    if (!arr) return;
    const i = arr.indexOf(v);
    if (i >= 0) arr.splice(i, 1); else arr.push(v);
    s.listError = '';
    OB.render({ keepScroll: true });
  });
  OB.action('cp-new-list', (el, e, v) => {
    const s = nw();
    s.listId = v;
    s.listError = '';
    const l = OB.get.list(v);
    if (l) autoName(s, l.name);
    draftFor(s);
    OB.render({ keepScroll: true });
    focusEl(`cp-list-${v}`);
  });
  OB.action('cp-new-name', (el) => {
    const s = nw();
    s.name = el.value;
    s.nameAuto = false;
    if (s.nameError && el.value.trim()) { s.nameError = ''; OB.render({ keepScroll: true }); }
  });
  OB.action('cp-new-continue', () => {
    const s = nw();
    if (s.mode === 'csv') { OB.go('contacts.import'); return; }
    s.nameError = '';
    s.listError = '';
    if (s.mode === 'saved' && !OB.get.list(s.listId)) s.listError = 'Choose a list, or build a new one from your profile.';
    if (s.mode === 'build' && !matchEstimate(s.tweaks)) s.listError = 'Pick at least one industry, region and reason to reach out.';
    if (!s.name.trim()) s.nameError = 'Name the campaign so you can find it later.';
    if (s.listError || s.nameError) {
      OB.render({ keepScroll: true });
      focusEl(s.nameError ? 'cp-new-name' : `cp-mode-${s.mode}`);
      return;
    }
    OB.go('new-campaign.flow');
  });
  OB.action('cp-new-from', (el, e, v) => { nw().flowFrom = v; OB.render({ keepScroll: true }); focusEl(`cp-from-${v}`); });
  OB.action('cp-new-copy', (el, e, v) => { nw().copyFrom = v; OB.render({ keepScroll: true }); focusEl('cp-copy-sel'); });
  OB.action('cp-new-approve', () => {
    const s = nw();
    if (OB.flowBuilder && !OB.flowBuilder.approve(sourceId(s), 'new')) { OB.render({ keepScroll: true }); return; }
    OB.go('new-campaign.launch');
  });
  OB.action('cp-launch', (el) => {
    const s = nw();
    const fb = OB.flowBuilder;
    const src = sourceId(s);
    const L = listInfo(s);
    if (!L) { OB.go('new-campaign.list'); return; }
    if (fb && !fb.valid(src, 'new')) { OB.go('new-campaign.flow'); return; }
    el.classList.add('is-loading');
    el.setAttribute('aria-busy', 'true');
    setTimeout(() => {
      const name = s.name.trim() || L.name;
      const flowId = nextId(Object.keys(D.flows), 'f');
      if (fb) { fb.save(src, 'new', flowId); fb.reset(src, 'new'); }
      let listId = L.listId;
      if (s.mode === 'build') {
        listId = nextId(D.lists.map((l) => l.id), 'l');
        D.lists.push({ id: listId, name, people: L.people, companies: L.companies, source: 'Built from your profile', created: todayStr(), campaign: null });
      }
      let c = s.draftOf ? OB.get.campaign(s.draftOf) : null;
      if (!c) { c = { id: nextId(D.campaigns.map((x) => x.id), 'c') }; D.campaigns.push(c); }
      Object.assign(c, {
        name, status: 'running', list: listId, flow: fb ? flowId : 'f1', started: todayStr(), people: L.people, companies: L.companies,
        contacted: 0, inFlow: 0, needsYou: 0, positive: 0, calls: 0, keepFinding: true, noNews: 'skip', nextSend: '2026-10-07T14:30', perDay: 15,
      });
      delete c.draftStep;
      const list = OB.get.list(listId);
      if (list) list.campaign = c.id;
      OB.state.ui.cpNew = null;
      OB.go(`campaign.${c.id}`);
      OB.toast('Campaign launched');
    }, 650);
  });
})();
