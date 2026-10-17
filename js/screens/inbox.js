/* Inbox (v4, Attio): the day's job, in three panes inside the white panel, under one top bar.
   The conversations (an Attio list: avatar, name, company in grey, time, one grey line; two filters and a More
   menu), the open conversation (a bar with the stage and small actions, Onbook's steps folded into one card,
   every reply as an email card, Attio's composer card below), and the company as Attio record details
   (attributes, the people there with their stages, why Onbook wrote, the flow so far). One pane at a time on phones.
   Speed to lead: each real reply that waits on you opens with Onbook's suggested answer at the top of the reply box.
   Use this reply puts it in the box to edit; you always press Send yourself.
   Keyboard first: J and K move, R replies, B marks a call booked, E marks done.
   Routes: #inbox (the first conversation that needs you on desktop, the list on phones), #inbox.<threadId>,
   #inbox.<threadId>.use (the suggestion already in the reply box) and #inbox.empty (day one, for this screen only). */
(function () {
  'use strict';
  const OB = window.OB;
  const { esc, icon, ui, fmt } = OB;
  const D = OB.data;

  OB.screen('Inbox', 'Inbox', 'inbox');
  OB.screen('Inbox', 'A reply that needs you', 'inbox.t1');
  OB.screen('Inbox', 'An email reply', 'inbox.t2');
  OB.screen('Inbox', 'A suggested reply, ready to send', 'inbox.t2.use');
  OB.screen('Inbox', 'A LinkedIn reply', 'inbox.t3');
  OB.screen('Inbox', 'A booking to match', 'inbox.t4');
  OB.screen('Inbox', 'Check back on a date', 'inbox.t5');
  OB.screen('Inbox', 'An auto-reply', 'inbox.t6');
  OB.screen('Inbox', 'An opt-out', 'inbox.t7');
  OB.screen('Inbox', 'A booked call', 'inbox.t8');
  OB.screen('Inbox', 'In conversation', 'inbox.t9');
  OB.screen('Inbox', 'Booked without replying', 'inbox.t10');
  OB.screen('Inbox', 'Inbox on day one', 'inbox.empty');

  /* Demo data the Inbox needs that data.js does not carry: when Onbook checks back with Leo,
     and the return date in Jonas's out-of-office reply. */
  const T5 = OB.get.thread('t5');
  if (T5 && !T5.checkBack) T5.checkBack = '2027-01-15';
  const T6 = OB.get.thread('t6');
  if (T6 && !T6.backOn) T6.backOn = '2026-10-13';

  /* Onbook's suggested answer to each real reply, in Sam's voice: short, plain, no dashes or exclamation marks,
     lowercase on X. When someone asks for a time it offers two free times from his calendar (slots, in his own
     time) and the booking link. Pricing is private, so no suggestion quotes a price. note says what the draft
     does, in one line. Leo's shows only if his conversation is reopened. */
  const SUGGEST = {
    t1: {
      note: 'Answers her question and offers two times next week.',
      slots: ['2026-10-12T09:00', '2026-10-14T09:00'],
      body: "nice, 20 oct is close. for a launch like yours it's usually a few trading creators going live the week the book opens, plus a push in the communities your traders already use. easier to show you on a call: mon 12 oct or wed 14 oct, 4pm singapore time? or grab any slot: cal.com/sam-tideline/intro",
    },
    t2: {
      note: 'Keeps your prices private and offers two times.',
      slots: ['2026-10-08T14:00', '2026-10-08T15:30'],
      body: "Hi Daniel,\n\nGlad the timing works. It's a monthly retainer. We run your growth campaigns with you, from creator programmes to paid acquisition, so you're not covering growth alone while the role is open. Scope and cost are easiest to go through on a call.\n\nThursday afternoon works for me. Would 2:00 PM or 3:30 PM on Thursday 8 October suit you? If neither does, pick any time here: cal.com/sam-tideline/intro\n\nSam",
    },
    t3: {
      note: 'Keeps your prices private and offers your teardown.',
      body: "Thanks Priya, that makes sense with mainnet on 14 Oct. Cost depends on scope, so I'd rather give you a real number once I know what you need. Until then, a free 20-minute teardown could help: what's working for three of your competitors, and where the gaps are. Want one before launch? Pick a time here: cal.com/sam-tideline/intro",
    },
    t5: {
      note: "Thanks him and says you'll check back in January.",
      body: "Hi Leo,\n\nMakes sense, thanks for letting me know. I'll check back in January, ahead of the token launch. Good luck until then.\n\nSam",
    },
  };
  Object.keys(SUGGEST).forEach((id) => { const t = OB.get.thread(id); if (t && !t.suggestion) t.suggestion = SUGGEST[id]; });

  /* ---------- Helpers ---------- */
  const st = () => OB.state.ui;
  const bag = (k) => (st()[k] = st()[k] || {});
  const pad = (n) => String(n).padStart(2, '0');
  const dayIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const nowIso = () => `${dayIso(OB.TODAY)}T${pad(OB.TODAY.getHours())}:${pad(OB.TODAY.getMinutes())}`;
  const addDays = (n) => { const d = new Date(OB.TODAY); d.setDate(d.getDate() + n); return d; };
  const weekday = (d) => { const x = new Date(d); while (x.getDay() === 0 || x.getDay() === 6) x.setDate(x.getDate() + 1); return x; };
  const addMonths = (n) => { const d = new Date(OB.TODAY); d.setMonth(d.getMonth() + n); return weekday(d); };
  const isWide = () => window.matchMedia('(min-width: 861px)').matches;
  const MAC = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent || '');
  const first = (name) => String(name || '').split(' ')[0];
  const ON = { x: 'on X', linkedin: 'on LinkedIn', email: 'by email' };
  const andList = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
  const visibleEl = (el) => !!el && el.offsetParent !== null;
  /* Words separated by a middle dot; screen readers hear a comma */
  const SEP = '<span class="ib-sep"><span aria-hidden="true">&middot;</span><span class="sr-only">,</span></span>';
  /* The shared empty state, with an h2 so headings stay in order under the Inbox h1 */
  const emptyBlock = ({ icon: ic, title, body, actions = '', id }) => `<div class="empty"><span class="empty-icon">${icon(ic, 22)}</span><h2 class="t-heading ib-empty-h"${id ? ` id="${id}"` : ''}>${esc(title)}</h2>${body ? `<p class="t-2">${body}</p>` : ''}${actions ? `<div class="row wrap gap-2">${actions}</div>` : ''}</div>`;

  /* "9:12 AM", "Yesterday", "Mon 5 Oct": short enough for the list */
  function listWhen(at) {
    const d = OB.d(at);
    if (OB.isToday(d)) return fmt.time(d);
    if (dayIso(d) === dayIso(addDays(-1))) return 'Yesterday';
    return fmt.day(d);
  }
  const callWhen = (at) => (OB.d(at) > OB.TODAY ? fmt.rel(at) : fmt.dt(at));
  const lower = (s) => String(s).replace(/^(Today|Tomorrow)/, (w) => w.toLowerCase());

  const personOf = (t) => (t && t.person ? OB.get.person(t.person) : null);
  const companyOf = (t) => { const p = personOf(t); return p ? OB.get.company(p.company) : null; };
  const isMatch = (t) => !!t && t.type === 'match' && !t.person;
  const canAnswer = (t) => !!t && !isMatch(t) && (t.status === 'needs-you' || t.status === 'in-conversation');
  const current = () => (st().ibSel ? OB.get.thread(st().ibSel) : null);

  /* A suggestion only answers a real reply that is still waiting on you: never an auto-reply, an opt-out or a booking */
  function suggestionOf(t) {
    if (!t || t.type !== 'reply' || !t.suggestion || !canAnswer(t)) return null;
    const last = t.messages[t.messages.length - 1];
    return last && last.dir === 'in' ? t.suggestion : null;
  }
  /* Shown at the top of the reply box until you use it or dismiss it */
  const sugShown = (t) => !!suggestionOf(t) && !(st().ibSugOff || {})[t.id] && !(st().ibSugUsed || {})[t.id];
  /* Onbook's mark for what it drafted: two sparkles, in the same 1.5px line as the other icons */
  const spark = (size = 14) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M10 3.5c.7 4.1 2.4 5.8 6.5 6.5-4.1.7-5.8 2.4-6.5 6.5-.7-4.1-2.4-5.8-6.5-6.5 4.1-.7 5.8-2.4 6.5-6.5z M18 14.5c.35 1.9 1.1 2.65 3 3-1.9.35-2.65 1.1-3 3-.35-1.9-1.1-2.65-3-3 1.9-.35 2.65-1.1 3-3z"/></svg>`;

  /* A person whose details Onbook never bought keeps the masked name: first name, last initial, lock */
  function nameOf(p) {
    if (p.revealed) return esc(p.name);
    const parts = String(p.name).split(' ');
    const short = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
    return `<span class="masked">${esc(short)}${icon('lock', 14)}<span class="sr-only">, full name hidden because Onbook never contacted them</span></span>`;
  }

  /* Demo changes: apply patches to data objects and return one undo for all of them */
  function change(pairs) {
    const log = [];
    pairs.forEach(([obj, patch]) => {
      if (!obj || !patch) return;
      const prev = {};
      Object.keys(patch).forEach((k) => { prev[k] = Object.prototype.hasOwnProperty.call(obj, k) ? { v: obj[k] } : null; });
      Object.assign(obj, patch);
      log.push([obj, prev]);
    });
    return () => log.slice().reverse().forEach(([obj, prev]) => Object.keys(prev).forEach((k) => { if (prev[k]) obj[k] = prev[k].v; else delete obj[k]; }));
  }

  /* ---------- Filters and order ---------- */
  const FILTERS = [
    { key: 'needs', label: 'Needs you', test: (t) => t.status === 'needs-you',
      none: ['Nothing needs you right now', 'Replies and bookings that need you land here as they come in.'] },
    { key: 'all', label: 'All', test: () => true,
      none: ['No conversations yet', 'Replies and bookings land here as they come in.'] },
    { key: 'booked', label: 'Calls booked', test: (t) => t.status === 'booked',
      none: ['No calls booked yet', 'Calls booked through your link, or marked booked by you, show here.'] },
    { key: 'talking', label: 'In conversation', test: (t) => t.status === 'in-conversation',
      none: ['No conversations in progress', 'A conversation moves here once you reply.'] },
    { key: 'auto', label: 'Auto-replies', test: (t) => t.status === 'auto',
      none: ['No auto-replies', 'Out-of-office replies pause one person and show here. They never count as replies.'] },
    { key: 'done', label: 'Done', test: (t) => t.status === 'done',
      none: ['Nothing is done yet', 'Conversations you mark done, not interested or check back later go here.'] },
  ];
  /* Two filters stay in view; the rest sit in a More menu so the row never wraps */
  const MORE = ['booked', 'talking', 'auto', 'done'];
  const filterOf = (key) => FILTERS.find((f) => f.key === key) || FILTERS[1];

  /* Newest first. The open conversation keeps its place while it is open, so the list never jumps under you. */
  function ordered() {
    const fz = st().ibFrozen;
    const key = (t) => OB.d(fz && fz.id === t.id ? fz.at : t.at).getTime();
    return D.threads.filter((t) => t.status !== 'hidden').sort((a, b) => key(b) - key(a));
  }
  function hay(t) {
    const p = personOf(t), co = companyOf(t);
    return [p && p.name, p && p.title, co && co.name, t.booking && t.booking.email, t.preview, ...t.messages.map((m) => `${m.subject || ''} ${m.body}`)].join(' ').toLowerCase();
  }
  /* The rows in the current filter and search. The open conversation stays listed after you act on it. */
  function visible(sel) {
    const f = filterOf(st().ibFilter);
    const q = String(st().ibQuery || '').trim().toLowerCase();
    return ordered().filter((t) => (f.test(t) || (!q && sel && t.id === sel.id)) && (!q || hay(t).includes(q)));
  }

  /* ---------- Words ---------- */
  /* What a row shows under the name: their words, your words, a draft, or a note from Onbook */
  function previewOf(t) {
    const d = (st().ibDrafts || {})[t.id];
    if (d && d.trim()) return { kind: 'draft', text: d.trim() };
    if (isMatch(t)) return { kind: 'note', text: `${t.booking.email} booked ${fmt.dt(t.booking.at)}. Match it to the right person.` };
    const text = String(t.preview || '');
    if (/^You: /.test(text)) return { kind: 'you', text: text.slice(5) };
    if (t.type === 'booking') return { kind: 'note', text };
    return { kind: 'theirs', text };
  }
  function statusWords(t) {
    if (isMatch(t)) return 'needs you';
    return { 'needs-you': 'needs you', 'in-conversation': 'in conversation', booked: 'call booked', auto: t.pausedUntil ? 'auto-reply, paused' : 'auto-reply', done: `done, ${String(t.doneReason || 'done').toLowerCase()}` }[t.status] || '';
  }
  /* The reply type, said once under the name. Each message card carries its own time. */
  function typeLine(t) {
    const firstIn = t.messages.find((m) => m.dir === 'in');
    if (t.type === 'auto' && firstIn) return `Auto-reply ${ON[firstIn.ch]}`;
    if (t.type === 'optout' && firstIn) return `Asked to be removed ${ON[firstIn.ch]}`;
    if (t.type === 'booking' && t.booking) {
      if (t.booking.noReply) return 'Booked without replying';
      if (t.matched) return `Booked as ${t.booking.email}, matched by you`;
      if (firstIn) return `Replied ${ON[firstIn.ch]}, then booked through your link`;
      return 'Booked through your link';
    }
    if (firstIn) return `Replied ${ON[firstIn.ch]}`;
    return '';
  }
  /* Replies go from the same account and channel as the conversation; bookings use the last channel Onbook wrote on */
  function replyCh(t) {
    if (t.channel === 'x' || t.channel === 'linkedin' || t.channel === 'email') return t.channel;
    if (t.replyCh) return t.replyCh;
    const out = t.messages.filter((m) => m.dir === 'out' && m.ch);
    return out.length ? out[out.length - 1].ch : 'email';
  }
  function fromLine(ch) {
    const acc = D.accounts.find((a) => a.ch === ch) || {};
    if (ch === 'email') return `Replying by email from ${acc.name}`;
    if (ch === 'linkedin') return `Replying on LinkedIn as ${acc.name}`;
    return `Replying on X as ${acc.name}`;
  }
  function proofOf(t, co) {
    const all = D.profile.proof;
    const text = t.messages.map((m) => m.body).join(' ');
    return all.find((x) => text.includes(x.result)) || all.find((x) => co && x.segment === co.industry && x.confirmed) || null;
  }
  /* Why the shortcut can't act here, said plainly */
  function cannot(t, what) {
    if (!t) return 'Open a conversation first';
    if (isMatch(t)) return 'Match this booking first';
    if (t.type === 'optout') return `${personOf(t).name} asked not to be contacted`;
    if (t.status === 'auto') return `Auto-replies need nothing from you. ${first(personOf(t).name)} is paused, not stopped`;
    if (t.status === 'done') return what === 'reply' ? 'Reopen the conversation to reply' : 'This conversation is already done';
    if (t.status === 'booked' && what === 'book') return 'The call is already booked';
    return '';
  }

  /* ---------- List pane ---------- */
  /* Short words for rows that don't need you: the call, the pause, or why it is done */
  function rowState(t) {
    if (t.status === 'booked' && t.booking) return `Call ${lower(callWhen(t.booking.at))}`;
    if (t.status === 'auto') return t.pausedUntil ? `Paused until ${fmt.day(t.pausedUntil)}` : 'Back in the flow';
    if (t.status === 'done') return t.doneReason || 'Done';
    return '';
  }
  /* The one grey line under the name: the state when it isn't waiting on you, then the latest words */
  function previewHtml(t) {
    const pv = previewOf(t);
    let said;
    if (pv.kind === 'draft') said = `<span class="ib-lead">Draft:</span> ${esc(pv.text)}`;
    else if (pv.kind === 'you') said = `You: ${esc(pv.text)}`;
    // A booked call already says its time; Onbook's own note only adds "without replying"
    else if (pv.kind === 'note' && t.status === 'booked') said = t.booking && t.booking.noReply ? 'Booked without replying' : '';
    else said = esc(pv.text);
    const state = rowState(t);
    return `<span class="ib-row-text" id="ib-pv-${t.id}">${[state ? esc(state) : '', said].filter(Boolean).join(SEP)}</span>`;
  }
  function row(t, isCurrent) {
    const p = personOf(t), co = companyOf(t);
    const needs = t.status === 'needs-you';
    const name = p ? p.name : 'Booking to match';
    const sub = co ? co.name : '';
    const when = listWhen(t.at);
    const pv = previewOf(t);
    const said = pv.kind === 'draft' ? `draft: ${pv.text}` : pv.kind === 'you' ? `you: ${pv.text}` : pv.text;
    const label = [name, sub, statusWords(t), sugShown(t) ? 'suggested reply ready' : '', `${OB.chName(t.channel)}, ${when}`, said].filter(Boolean).join(', ');
    const tile = p ? ui.avatar(p.name) : `<span class="ib-mark" aria-hidden="true">${icon('calendar', 13)}</span>`;
    // The channel leads the grey line, so the name and company keep the first line
    const ch = p ? `<span class="ib-row-ch" aria-hidden="true">${OB.mark(t.channel, 12)}</span>` : '';
    return `<li><a class="ib-row${t.unread ? ' is-unread' : ''}${needs ? ' is-needs' : ''}" id="ib-row-${t.id}" href="#inbox.${t.id}"${isCurrent ? ' aria-current="true"' : ''} aria-label="${esc(label)}">
      ${tile}
      <span class="ib-row-main">
        <span class="ib-row-top"><span class="ib-row-name">${esc(name)}</span><span class="ib-row-co">${esc(sub)}</span><span class="ib-row-when">${esc(when)}</span></span>
        <span class="ib-row-line">${ch}${previewHtml(t)}${needs ? '<span class="dot dot-needs ib-row-dot" aria-hidden="true"></span>' : ''}</span>
      </span>
    </a></li>`;
  }
  /* listOnly: a phone showing the list, where nothing is open yet */
  function rowsHtml(sel, listOnly) {
    const f = filterOf(st().ibFilter);
    const q = String(st().ibQuery || '').trim();
    const items = visible(sel);
    if (q && !items.length) {
      return `<div class="ib-none"><p class="t-medium">Nothing matches &ldquo;${esc(q)}&rdquo;</p><p class="t-small t-2">Search looks at names, companies and what was written.</p>${ui.btn({ label: 'Clear search', size: 's', action: 'inbox-clear-search' })}</div>`;
    }
    const rows = items.length ? `<ul class="ib-ul" role="list">${items.map((t) => row(t, !listOnly && !!sel && sel.id === t.id)).join('')}</ul>` : '';
    const none = !q && !items.some(f.test)
      ? `<div class="ib-none"><p class="t-medium">${esc(f.none[0])}</p><p class="t-small t-2">${esc(f.none[1])}</p>${f.key !== 'all' ? ui.btn({ label: 'Show all', size: 's', action: 'inbox-filter', arg: 'all' }) : ''}</div>`
      : '';
    return rows + none;
  }
  function filterBar() {
    const all = ordered();
    const cur = filterOf(st().ibFilter);
    const n = (f) => all.filter(f.test).length;
    const btn = (f) => `<button type="button" class="filter" id="ib-f-${f.key}" aria-pressed="${f.key === cur.key}" data-action="inbox-filter" data-arg="${f.key}">${esc(f.label)} <span class="num">${n(f)}</span></button>`;
    const inMore = MORE.includes(cur.key);
    const more = `<button type="button" class="filter ib-fmore${inMore ? ' is-on' : ''}" id="ib-f-more" data-action="inbox-filter-more" aria-haspopup="menu" aria-expanded="false">${inMore ? `${esc(cur.label)} <span class="num">${n(cur)}</span>` : 'More'}${icon('chevron-down', 14)}</button>`;
    return `<div class="filters ib-filters" role="group" aria-label="Show">${btn(FILTERS[0])}${btn(FILTERS[1])}${more}</div>`;
  }
  /* The list's head is the page's own top bar (Inbox and the search), with the view filters on the row under it */
  function listPane(ctx) {
    if (ctx.empty) {
      return `<section class="ib-list" aria-label="Conversations">
        ${ui.pageHead({ icon: 'inbox', title: 'Inbox' })}
        <div class="ib-rows">${emptyBlock({ icon: 'inbox', title: 'No replies yet', body: OB.state.sim.subscribed ? 'They land here as they come in; most first replies arrive 2 to 5 days after a campaign starts.' : 'Nothing has been sent yet. Replies land here once your first campaign launches; most arrive 2 to 5 days after it starts.' })}</div>
      </section>`;
    }
    const search = `<div class="search-wrap ib-search">${icon('search', 15)}<input class="input input-search" id="ib-search" type="search" autocomplete="off" placeholder="Search" aria-label="Search conversations by name, company or message" value="${esc(st().ibQuery || '')}" data-input="inbox-search"></div>`;
    return `<section class="ib-list" aria-label="Conversations">
      ${ui.pageHead({ icon: 'inbox', title: 'Inbox', actions: search })}
      <div class="ib-tools">${filterBar()}</div>
      <div class="ib-rows" id="ib-rows">${rowsHtml(ctx.sel, ctx.auto && !isWide())}</div>
      <p class="ib-keys"><span class="ib-key">${ui.kbd('J')}${ui.kbd('K')} move</span><span class="ib-key">${ui.kbd('R')} reply</span><span class="ib-key">${ui.kbd('B')} booked</span><span class="ib-key">${ui.kbd('E')} done</span></p>
    </section>`;
  }

  /* ---------- Conversation pane ---------- */
  function stageTag(t) {
    if (t.status === 'auto') return t.pausedUntil ? ui.stage('paused', `Paused until ${fmt.day(t.pausedUntil)}`) : ui.stage('in-flow', 'In flow again');
    if (t.status === 'done') return ui.stage('done', t.doneReason || 'Done');
    return ui.stage(t.status);
  }
  /* Small actions on the right of the bar. Narrow panes and phones move the first two into More. */
  function headActions(t, p) {
    const acts = [];
    if (canAnswer(t)) acts.push(ui.btn({ label: 'Mark call booked', icon: 'calendar', kind: 'secondary', size: 's', action: 'inbox-book', id: 'ib-book', title: 'Mark call booked (B)', cls: 'ib-act-book', extra: 'aria-keyshortcuts="B"' }));
    if (canAnswer(t) || t.status === 'booked') acts.push(ui.btn({ label: 'Mark done', icon: 'check', kind: 'ghost', size: 's', action: 'inbox-done', id: 'ib-done', title: 'Mark done (E)', cls: 'ib-act-done', extra: 'aria-keyshortcuts="E"' }));
    // Narrow panes show these two as an icon alone, so the name stays readable; the button keeps its name
    if (!st().ibPanel) acts.push(`<button type="button" class="btn btn-ghost btn-sm ib-co-open" data-action="inbox-panel" data-arg="open" aria-expanded="false" aria-label="Company" title="Show the company">${icon('building', 15)}<span>Company</span></button>`);
    acts.push(`<button type="button" class="btn btn-ghost btn-sm ib-co-drawer" data-action="inbox-company" aria-haspopup="dialog" aria-label="Company" title="Company details">${icon('building', 15)}<span>Company</span></button>`);
    acts.push(ui.iconBtn({ icon: 'more', label: `More actions for ${p.name}`, action: 'inbox-more', id: 'ib-more', extra: 'aria-haspopup="menu" aria-expanded="false"' }));
    return `<div class="ib-acts">${acts.join('')}</div>`;
  }
  /* The call, kept in view on the right of the role line (the Call booked tag above says what it is) */
  function callNote(t) {
    const b = t.booking;
    if (!b || t.status !== 'booked') return '';
    return `<span class="ib-sub-call" title="Call ${esc(lower(callWhen(b.at)))}">${icon('calendar', 15)}<span><span class="sr-only">Call </span>${esc(callWhen(b.at))}${b.manual ? ', marked by you' : ''}</span></span>`;
  }
  /* Attio's top bar for the conversation (name, stage, small actions), then one grey line: who they are and how they answered */
  function head(t, p, co) {
    const back = `<a class="ib-back" href="#inbox">${icon('chevron-left', 18)}<span>Inbox</span></a>`;
    if (!p) {
      return `<header class="ib-top">
        <div class="ib-head">${back}<div class="ib-name-row"><span class="ib-mark" aria-hidden="true">${icon('calendar', 13)}</span><h2 class="ib-title" id="ib-thread-title" tabindex="-1">Booking to match</h2>${t.status === 'needs-you' ? ui.stage('needs-you') : ''}</div></div>
        <p class="ib-sub"><span class="ib-sub-main">${esc(t.booking.email)}${SEP}<span class="ib-type">Booked through your link, ${esc(fmt.dt(t.at))}</span></span></p>
      </header>`;
    }
    const tl = typeLine(t);
    return `<header class="ib-top">
      <div class="ib-head">${back}
        <div class="ib-name-row">${ui.avatar(p.name)}<h2 class="ib-title" id="ib-thread-title" tabindex="-1">${esc(p.name)}</h2>${stageTag(t)}</div>
        ${headActions(t, p)}
      </div>
      <p class="ib-sub"><span class="ib-sub-main">${esc(p.title)} at <a href="#contacts.company.${esc(co.id)}" data-action="inbox-open-company" data-arg="${esc(co.id)}">${esc(co.name)}</a>${tl ? `${SEP}<span class="ib-type">${esc(tl)}</span>` : ''}</span>${callNote(t)}</p>
    </header>`;
  }

  /* The stop, said once in a quiet grey line right after the reply or booking that caused it */
  function stopLine(co, p) {
    const others = OB.get.peopleAt(co.id).filter((x) => !p || x.id !== p.id);
    let tail;
    if (!others.length) tail = 'on every channel, in every campaign.';
    else if (others.length === 1) tail = `${nameOf(others[0])}, ${esc(others[0].title)}, won't be contacted.`;
    else tail = `${andList(others.map((x) => `${nameOf(x)} (${esc(x.title)})`))} won't be contacted.`;
    return `<li class="ib-sys ib-stop"><span class="ib-sys-icon">${icon('hand', 15)}</span><span>Messages to <span class="ib-sys-strong">${esc(co.name)}</span> stopped${others.length ? '.' : ''} ${tail}</span></li>`;
  }

  /* Paragraphs: a blank line becomes space between paragraphs; single line breaks stay */
  const paras = (s) => String(s || '').split(/\n{2,}/).map((x) => `<p>${esc(x).replace(/\n/g, '<br>')}</p>`).join('');
  /* One line of a step: the body without its greeting */
  function snippet(m) {
    const parts = String(m.body || '').split(/\n{2,}/);
    const rest = parts.length > 1 && parts[0].trim().length < 24 && /,$/.test(parts[0].trim()) ? parts.slice(1) : parts;
    return rest.join(' ').replace(/\s+/g, ' ').trim();
  }

  /* A step Onbook sent: one compact line inside the Onbook card until opened */
  function onbookStep(t, flow, m, i, open) {
    const key = `${t.id}-${i}`;
    const s = flow && m.step ? flow.steps.find((x) => x.id === m.step) : null;
    const n = s ? flow.steps.indexOf(s) + 1 : 0;
    return `<li class="ib-out${open ? ' is-open' : ''}">
      <button type="button" class="ib-out-head" data-action="inbox-expand" data-arg="${key}" aria-expanded="${open}" aria-controls="ib-b-${key}">
        <span class="ib-out-ch" aria-hidden="true">${OB.mark(m.ch, 14)}</span><span class="ib-out-step">${n ? `Step ${n}` : esc(OB.chName(m.ch))}<span class="sr-only">, ${esc(s ? s.title : OB.chName(m.ch))}</span></span>
        <span class="ib-out-snip">${esc(snippet(m))}</span>
        <time class="ib-out-time" datetime="${esc(m.at)}" title="${esc(fmt.dt(m.at))}">${esc(fmt.day(m.at))}</time>
      </button>
      <div class="ib-out-body" id="ib-b-${key}">${m.ch === 'email' && m.subject ? `<p class="ib-subj">${esc(m.subject)}</p>` : ''}${paras(m.body)}</div>
    </li>`;
  }
  /* Onbook's earlier steps, grouped in one card with the campaign that sent them */
  function onbookGroup(t, items) {
    const c = t.campaign ? OB.get.campaign(t.campaign) : null;
    return `<li class="ib-onbook"><div class="card card-flush ib-steps">
      <div class="card-head">${icon('campaigns', 16)}<h3>Sent by Onbook</h3><span class="count">${items.length}</span>${c ? `<a href="#campaign.${esc(c.id)}">${esc(c.name)}</a>` : ''}</div>
      <ol class="ib-outs" role="list">${items.join('')}</ol>
    </div></li>`;
  }

  /* Every reply, theirs or yours, is an Attio email card: who, how and when, then the words */
  function convMsg(t, p, m) {
    const them = m.dir === 'in';
    const who = them ? (p ? p.name : 'They') : 'You';
    const tile = them ? (p ? ui.avatar(p.name) : '') : ui.avatar(D.me.name);
    return `<li class="ib-msg ${them ? 'is-in' : 'is-you'}${them && t.type === 'auto' ? ' is-auto' : ''}">
      <article class="card card-flush ib-mail">
        <header class="ib-mail-head">${tile}<p class="ib-mail-who"><span class="ib-mail-name">${esc(who)}</span> <span class="ib-mail-ch">${esc(ON[m.ch] || '')}</span></p><time class="ib-mail-time" datetime="${esc(m.at)}">${esc(fmt.dt(m.at))}</time></header>
        <div class="ib-mail-body">${m.ch === 'email' && m.subject ? `<p class="ib-subj">${esc(m.subject)}</p>` : ''}${paras(m.body)}</div>
      </article>
    </li>`;
  }
  const eventLine = (m) => `<li class="ib-sys ib-event"><span class="ib-sys-icon">${icon('calendar', 15)}</span><span>${esc(m.body)}${SEP}<time datetime="${esc(m.at)}">${esc(fmt.dt(m.at))}</time></span></li>`;

  /* Messages in time order. Onbook's steps fold into one card; the step they answered starts open.
     The stop is said plainly right after the reply or booking that caused it. */
  function messageLog(t, p, co) {
    const flow = t.campaign ? OB.get.flowOf(t.campaign) : null;
    const msgs = t.messages;
    let stopAt = -1;
    if (co && co.stopped) {
      const when = OB.d(co.stopped.at);
      msgs.forEach((m, i) => { if (OB.d(m.at) <= when) stopAt = i; });
      if (stopAt < 0) stopAt = msgs.length - 1;
    }
    const firstAnswer = msgs.findIndex((m) => m.dir === 'in' || m.dir === 'event');
    let answered = -1;
    msgs.forEach((m, i) => { if (m.dir === 'out' && !m.you && (firstAnswer < 0 || i < firstAnswer)) answered = i; });
    const opened = st().ibOpen || {};
    const items = [];
    let run = [];
    const flush = () => { if (run.length) items.push(onbookGroup(t, run)); run = []; };
    msgs.forEach((m, i) => {
      if (m.dir === 'out' && !m.you) {
        const key = `${t.id}-${i}`;
        run.push(onbookStep(t, flow, m, i, key in opened ? !!opened[key] : i === answered));
      } else {
        flush();
        items.push(m.dir === 'event' ? eventLine(m) : convMsg(t, p, m));
      }
      if (i === stopAt) { flush(); items.push(stopLine(co, p)); }
    });
    flush();
    return `<ol class="ib-log" role="list">${items.join('')}</ol>`;
  }

  /* A booking from an email Onbook could not match: an Attio record card with the call's details and a suggestion */
  function matchCard(t) {
    const b = t.booking;
    const s = (t.suggest || [])[0];
    const sp = s ? OB.get.person(s.person) : null;
    const sco = sp ? OB.get.company(sp.company) : null;
    const local = String(b.email).split('@')[0];
    let why = s ? String(s.why) : '';
    if (sp && sco) why = why.replace(`${sp.name} at ${sco.name} `, '');
    why = why.charAt(0).toUpperCase() + why.slice(1);
    const when = callWhen(b.at);
    return `<div class="card card-flush ib-match">
      <div class="card-head">${icon('calendar', 16)}<h3>${esc(b.title)}</h3></div>
      <div class="ib-match-sec">
        <dl class="ib-attrs">
          <dt>When</dt><dd>${esc(when)}${when === fmt.dt(b.at) ? '' : ` <span class="t-2">${esc(fmt.day(b.at))}</span>`}</dd>
          <dt>Booked as</dt><dd>${esc(b.email)}</dd>
        </dl>
        <p class="ib-nomatch">We could not match this email to anyone you contacted.</p>
      </div>
      ${sp ? `<div class="ib-match-sec ib-suggest">
        <h3 class="ib-sec-h">Suggested match</h3>
        <p class="ib-suggest-who">${ui.avatar(sp.name)}<span class="ib-person-main"><span class="ib-person-name">${esc(sp.name)}</span><span class="ib-person-title">${esc(sp.title)}, ${esc(sco.name)}</span></span></p>
        <ul class="ib-why" role="list"><li>${icon('check', 15)}<span>${esc(why)}</span></li><li>${icon('check', 15)}<span>The email starts with &ldquo;${esc(local)}&rdquo;, which fits ${esc(sp.name)}</span></li></ul>
      </div>` : ''}
      <div class="ib-match-sec ib-match-foot">
        <div class="ib-match-actions">
          ${sp ? ui.btn({ label: `Match to ${sp.name}`, kind: 'primary', action: 'inbox-match', arg: sp.id, id: 'ib-match-go' }) : ''}
          ${ui.btn({ label: 'Match to someone else', kind: sp ? 'secondary' : 'primary', action: 'inbox-match-other' })}
          ${ui.btn({ label: 'Not from a campaign', kind: 'ghost', action: 'inbox-not-campaign' })}
        </div>
        <p class="t-small t-2">Matching marks the call booked and stops everyone at ${sco ? esc(sco.name) : 'their company'}. Not from a campaign keeps it out of your Inbox and your results.</p>
      </div>
    </div>`;
  }

  /* Below the conversation: the composer card, or a card in its place saying what happens instead */
  function footNotice({ icon: ic, title, body, actions = '' }) {
    return `<div class="ib-foot"><div class="ib-state" role="status">
      <span class="ib-state-icon" aria-hidden="true">${icon(ic, 15)}</span>
      <div class="ib-state-main"><p class="ib-state-title">${esc(title)}</p><p class="t-small t-2">${body}</p></div>
      ${actions ? `<div class="ib-state-acts">${actions}</div>` : ''}
    </div></div>`;
  }
  function foot(t, p, co) {
    if (isMatch(t)) return '';
    if (t.type === 'optout') {
      return footNotice({ icon: 'shield', title: `${p.name} asked to be removed`, body: `${esc(first(p.name))} is on Never contact for good, and everyone at ${esc(co.name)} has stopped. There is nothing to reply to.`, actions: ui.btn({ label: 'Open Never contact', size: 's', href: '#contacts.never' }) });
    }
    if (t.status === 'auto') {
      if (t.pausedUntil) {
        return footNotice({ icon: 'clock', title: `Out of office until ${fmt.day(t.backOn || t.pausedUntil)}`, body: `Onbook paused ${esc(first(p.name))} and resumes on ${esc(fmt.day(t.pausedUntil))}. An auto-reply doesn't count as a reply, so ${esc(co.name)} isn't stopped.`, actions: `${ui.btn({ label: 'Resume now', size: 's', action: 'inbox-resume' })}${ui.btn({ label: 'Stop this person', size: 's', kind: 'ghost', action: 'inbox-stop-person' })}` });
      }
      const nx = OB.nextText(p);
      return footNotice({ icon: 'play', title: `${p.name} is back in the flow`, body: `Resumed ${esc(fmt.day(t.resumedAt || OB.TODAY))}.${nx ? ` Next: ${esc(nx)}.` : ''} The out-of-office reply didn't count as a reply.`, actions: ui.btn({ label: 'Stop this person', size: 's', kind: 'ghost', action: 'inbox-stop-person' }) });
    }
    if (t.status === 'done') {
      const reopen = ui.btn({ label: 'Reopen', size: 's', kind: 'ghost', action: 'inbox-reopen' });
      if (t.checkBack) {
        return footNotice({ icon: 'clock', title: `Onbook checks back on ${fmt.day(t.checkBack)}`, body: `It sends ${esc(first(p.name))} one fresh message then, and it doesn't count again. ${esc(co.name)} stays stopped until then.`, actions: `${ui.btn({ label: 'Change date', size: 's', action: 'inbox-checkback' })}${reopen}` });
      }
      if (t.doneReason === 'Never contact') {
        return footNotice({ icon: 'shield', title: `${p.name} is on Never contact`, body: `Onbook won't contact ${esc(first(p.name))} again. ${esc(co.name)} stays stopped.`, actions: ui.btn({ label: 'Open Never contact', size: 's', href: '#contacts.never' }) });
      }
      if (t.doneReason === 'Stopped by you') {
        return footNotice({ icon: 'hand', title: `You stopped ${p.name}`, body: `Onbook won't send ${esc(first(p.name))} anything else. Other people at ${esc(co.name)} can still be contacted.`, actions: reopen });
      }
      if (t.doneReason === 'Not interested') {
        return footNotice({ icon: 'check', title: 'Marked not interested', body: `${esc(co.name)} stays stopped, so Onbook won't write to anyone there.`, actions: reopen });
      }
      return footNotice({ icon: 'check', title: 'Marked done', body: `${esc(co.name)} stays stopped. Reopen the conversation to write again.`, actions: reopen });
    }
    return composer(t, p);
  }

  /* Onbook's suggested reply: the top of the reply box. A short preview, Use this reply (it fills the box for
     editing; you still press Send), Dismiss, and Show all for the whole draft. */
  const oneLine = (s) => String(s || '').split(/\n+/).map((x) => x.trim()).filter(Boolean).join(' ');
  function suggestionBlock(t) {
    const s = suggestionOf(t);
    const open = !!(st().ibSugMore || {})[t.id];
    return `<div class="ib-sug${open ? ' is-open' : ''}" role="group" aria-labelledby="ib-sug-h">
      <p class="ib-sug-head"><span class="ib-sug-mark">${spark(14)}</span><span class="ib-sug-title" id="ib-sug-h">Suggested reply</span><span class="ib-sug-note" id="ib-sug-note">${esc(s.note)}</span></p>
      <div class="ib-sug-body" id="ib-sug-body">${open ? paras(s.body) : `<p>${esc(oneLine(s.body))}</p>`}</div>
      <div class="ib-sug-foot">
        ${ui.btn({ label: 'Use this reply', size: 's', action: 'inbox-sug-use', id: 'ib-sug-use', extra: 'aria-describedby="ib-sug-note"' })}
        ${ui.btn({ label: 'Dismiss', kind: 'ghost', size: 's', action: 'inbox-sug-dismiss', id: 'ib-sug-x', ariaLabel: 'Dismiss suggested reply' })}
        <button type="button" class="link-btn ib-sug-more" id="ib-sug-more" data-action="inbox-sug-more" aria-expanded="${open}" aria-controls="ib-sug-body">${open ? 'Show less' : 'Show all'}</button>
      </div>
    </div>`;
  }

  function composer(t, p) {
    const ch = replyCh(t);
    const draft = (st().ibDrafts || {})[t.id] || '';
    const err = (st().ibErr || {})[t.id];
    const hasIn = t.messages.some((m) => m.dir === 'in');
    const sug = sugShown(t);
    const blocked = OB.state.sim.paymentFailed
      ? `<span>Sending is paused until your card is updated, so this reply can't send yet. Your draft is kept. <a class="link-btn" href="#settings.plan">Update card</a></span>`
      : ch === 'linkedin' && OB.state.sim.linkedinIssue
        ? `<span>LinkedIn signed you out, so this reply can't send yet. Your draft is kept. <button type="button" class="link-btn" data-action="reconnect-linkedin">Reconnect LinkedIn</button></span>`
        : '';
    const describe = ['ib-from', blocked ? 'ib-blocked' : '', err ? 'ib-reply-err' : ''].filter(Boolean).join(' ');
    return `<form class="ib-foot ib-compose" data-submit="inbox-send" data-thread="${t.id}" novalidate>
      ${blocked ? `<p class="ib-blocked" id="ib-blocked">${icon('alert', 15)}${blocked}</p>` : ''}
      <div class="ib-composer">
        ${sug ? suggestionBlock(t) : ''}
        <div class="ib-compose-head">
          <label class="ib-compose-label" for="ib-reply">${hasIn ? 'Reply to' : 'Write to'} ${esc(first(p.name))}</label>
          <span class="ib-from" id="ib-from">${OB.mark(ch, 13)}<span>${esc(fromLine(ch))}</span></span>
        </div>
        <textarea class="ib-textarea" id="ib-reply" name="reply" rows="${sug ? 2 : 3}" data-input="inbox-draft" data-arg="${t.id}" aria-describedby="${describe}"${err ? ' aria-invalid="true"' : ''} placeholder="${sug ? 'Or write your own reply' : 'Write your reply'}">${esc(draft)}</textarea>
        ${err ? `<p class="field-error ib-reply-err" id="ib-reply-err">${icon('alert', 15)}<span>${esc(err)}</span></p>` : ''}
        <div class="ib-compose-foot">
          ${ui.btn({ label: 'Insert booking link', icon: 'link', kind: 'ghost', size: 's', action: 'inbox-insert-link', id: 'ib-insert' })}
          <span class="ib-send-hint" aria-hidden="true">${ui.kbd(MAC ? '\u2318' : 'Ctrl')}${ui.kbd('Enter')}</span>
          ${ui.btn({ label: 'Send reply', kind: 'primary', size: 's', type: 'submit', id: 'ib-send', extra: `aria-keyshortcuts="${MAC ? 'Meta+Enter' : 'Control+Enter'}"` })}
        </div>
      </div>
    </form>`;
  }

  function threadPane(t) {
    const p = personOf(t), co = companyOf(t);
    return `<section class="ib-thread" aria-labelledby="ib-thread-title">
      ${head(t, p, co)}
      <div class="ib-msgs" id="ib-msgs" tabindex="0" aria-label="Messages">
        <div class="ib-msgs-inner">${isMatch(t) ? matchCard(t) : messageLog(t, p, co)}</div>
      </div>
      ${foot(t, p, co)}
    </section>`;
  }

  /* The top bar keeps running across the panel even when nothing is open */
  function nothingOpen() {
    const f = filterOf(st().ibFilter);
    const up = f.key === 'needs';
    return `<section class="ib-thread ib-thread-empty" aria-label="Conversation">
      <div class="ib-head ib-head-blank" aria-hidden="true"></div>
      <div class="ib-blank">${emptyBlock({ icon: up ? 'check' : 'inbox', title: up ? 'You are up to date' : f.none[0], body: esc(up ? 'Nothing needs you right now. New replies and bookings land here as they come in.' : f.none[1]), actions: f.key !== 'all' ? ui.btn({ label: 'Show all conversations', size: 's', action: 'inbox-filter', arg: 'all' }) : '' })}</div>
    </section>`;
  }

  function dayOne() {
    const c = OB.state.sim.subscribed ? D.campaigns.find((x) => x.status === 'running') : null;
    const item = (ic, title, text) => `<li><span class="ib-d1-icon" aria-hidden="true">${icon(ic, 15)}</span><span><span class="t-medium">${title}</span> <span class="t-2">${text}</span></span></li>`;
    return `<section class="ib-thread ib-thread-empty" aria-labelledby="ib-d1">
      <div class="ib-head ib-head-blank" aria-hidden="true"></div>
      <div class="ib-blank">
        <div class="ib-d1">
          <div class="card card-flush">
            <div class="card-head">${icon('inbox', 16)}<h2 id="ib-d1">What lands here</h2></div>
            <ul class="ib-d1-list" role="list">
              ${item('reply', 'Replies', 'from email, LinkedIn and X, in one list. A reply stops everyone at that company at once.')}
              ${item('calendar', 'Calls booked', 'through your link. A booking stops the company too, even without a reply.')}
              ${item('clock', 'Auto-replies', 'such as out of office. They pause that one person and never count as replies.')}
            </ul>
          </div>
          <p class="t-small t-2">You write every reply yourself; Onbook never answers for you. Each reply goes from the account and channel the conversation is on.</p>
          ${c ? ui.btn({ label: `Open ${c.name}`, size: 's', href: `#campaign.${c.id}` }) : ui.btn({ label: 'Go to launch', size: 's', href: '#setup-launch' })}
        </div>
      </div>
    </section>`;
  }

  /* ---------- Company panel (inline on wide screens, a drawer below) ---------- */
  /* Short stage tags beside each person; the detail lives in the conversation */
  function personTag(x) {
    if (x.stage === 'stopped' || x.stage === 'booked' || x.stage === 'in-flow' || x.stage === 'paused') return ui.stage(x.stage);
    return ui.stage(x.stage, x.detail);
  }
  /* One line under the strip: "Sent 4 of 6, replied to step 4, 2 stopped." */
  function flowLine(t, p, flow) {
    const prog = p.progress || [];
    const count = (k) => prog.filter((x) => x === k).length;
    const parts = [`Sent ${count('done') + count('replied')} of ${flow.steps.length}`];
    const r = prog.indexOf('replied');
    if (r >= 0) parts.push(`replied to step ${r + 1}`);
    if (count('skip')) parts.push(`${count('skip')} skipped`);
    if (t.status === 'auto' && t.pausedUntil) parts.push(`paused until ${fmt.day(t.pausedUntil)}`);
    else if (count('stopped')) parts.push(`${count('stopped')} stopped`);
    const nx = p.stage === 'in-flow' ? OB.nextText(p) : '';
    return `${parts.join(', ')}.${nx ? ` Next: ${nx}.` : ''}`;
  }
  /* Attio's attribute list: a grey label column and the value beside it */
  const attrs = (rows) => `<dl class="ib-attrs">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
  /* Everyone at the company, as record chips with their stage */
  function personRow(x) {
    return `<li class="ib-person">
      <a class="ib-person-link" href="#contacts.person.${esc(x.id)}" data-action="inbox-open-person" data-arg="${esc(x.id)}">${ui.avatar(x.name)}<span class="ib-person-main"><span class="ib-person-name">${nameOf(x)}</span><span class="ib-person-title">${esc(x.title)}</span></span></a>
      ${personTag(x)}
    </li>`;
  }
  function panelBody(t) {
    const p = personOf(t), co = companyOf(t);
    if (!co) {
      return '<div class="ib-sec"><p class="t-small t-2">Match the booking to see the company, what Onbook sent and who else there was stopped.</p></div>';
    }
    const c = OB.get.campaign(t.campaign || p.campaign);
    const flow = c ? OB.get.flowOf(c.id) : null;
    const pr = proofOf(t, co);
    const details = [['Industry', esc(co.industry)], ['Size', `${esc(co.size)} staff`], ['Location', esc(co.location)]];
    if (c) details.push(['Campaign', `<a class="ib-attr-link" href="#campaign.${esc(c.id)}">${esc(c.name)}</a> ${ui.status(c.status)}`]);
    const why = [['News', co.news ? `${esc(co.news.text)}<span class="ib-attr-sub">${esc(co.news.source)}, ${esc(fmt.short(co.news.date))}</span>` : `None recent, so Onbook wrote from ${esc(first(p.name))}'s role`]];
    if (co.fit) why.push(['Fit', esc(co.fit)]);
    if (pr) why.push(['Proof', `${esc(pr.client)}: ${esc(pr.result)}`]);
    const people = OB.get.peopleAt(co.id);
    return `
      <div class="ib-sec">${attrs(details)}</div>
      <div class="ib-sec">
        <h3 class="ib-sec-h">People <span class="count">${people.length}</span></h3>
        <ul class="ib-people" role="list">${people.map(personRow).join('')}</ul>
      </div>
      <div class="ib-sec">
        <h3 class="ib-sec-h">Why Onbook wrote</h3>
        ${attrs(why)}
      </div>
      ${flow ? `<div class="ib-sec">
        <h3 class="ib-sec-h">${esc(first(p.name))}'s flow</h3>
        <div class="ib-flow">${ui.strip(flow.steps, p.progress || [])}<p class="t-small t-2">${esc(flowLine(t, p, flow))}</p></div>
      </div>` : ''}`;
  }
  /* The record's header sits in the top bar: its tile and name, then the domain on the row under it */
  function panelPane(t) {
    const co = companyOf(t);
    return `<aside class="ib-panel" id="ib-panel" aria-labelledby="ib-panel-title">
      <div class="ib-panel-head">
        ${co ? ui.co(co.name) : ''}
        <h2 class="ib-panel-title" id="ib-panel-title" tabindex="-1">${co ? `<a href="#contacts.company.${esc(co.id)}" data-action="inbox-open-company" data-arg="${esc(co.id)}">${esc(co.name)}</a>` : 'Company'}</h2>
        ${ui.iconBtn({ icon: 'chevron-right', label: 'Hide company panel', action: 'inbox-panel', arg: 'close', id: 'ib-panel-close', extra: 'aria-controls="ib-panel" aria-expanded="true"' })}
      </div>
      ${co ? `<p class="ib-panel-sub">${esc(co.domain)}</p>` : ''}
      <div class="ib-panel-body">${panelBody(t)}</div>
    </aside>`;
  }

  /* ---------- After render: scroll, focus and the reply box ---------- */
  function ensureVisible(box, el) {
    const b = box.getBoundingClientRect(), r = el.getBoundingClientRect();
    if (r.top < b.top) box.scrollTop -= b.top - r.top + 8;
    else if (r.bottom > b.bottom) box.scrollTop += r.bottom - b.bottom + 8;
  }
  /* The reply box grows with what you write, up to a point; it has no border of its own inside the composer card */
  function grow(ta) {
    const max = parseFloat(getComputedStyle(ta).maxHeight) || 260;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, max)}px`;
    placeToasts();
  }
  /* Toasts (and the prototype's Screens button) sit just above the reply box, however tall it has grown:
     its top goes into --ib-foot-top, which inbox.css reads */
  function placeToasts() {
    const foot = document.querySelector('.ib-app .ib-foot');
    const root = document.documentElement;
    if (!visibleEl(foot)) { root.style.removeProperty('--ib-foot-top'); return; }
    root.style.setProperty('--ib-foot-top', `${Math.max(0, Math.round(window.innerHeight - foot.getBoundingClientRect().top))}px`);
  }
  window.addEventListener('resize', () => { if (document.querySelector('.ib-app')) placeToasts(); });
  function after(ctx) {
    if (ctx.restoreSim) OB.state.sim.emptyInbox = false;
    const U = st();
    // The reply box takes its height first, so the conversation can then settle on its latest message
    const ta = document.getElementById('ib-reply');
    if (ta) grow(ta);
    const rows = document.getElementById('ib-rows');
    if (rows) {
      rows.scrollTop = U.ibListScroll || 0;
      rows.addEventListener('scroll', () => { st().ibListScroll = rows.scrollTop; }, { passive: true });
      const cur = rows.querySelector('[aria-current="true"]');
      if (cur && ctx.newSel && visibleEl(rows)) ensureVisible(rows, cur);
    }
    const msgs = document.getElementById('ib-msgs');
    if (msgs && ctx.sel) {
      const s = U.ibScroll;
      if (!U.ibBottom && s && s.id === ctx.sel.id) msgs.scrollTop = s.top;
      else msgs.scrollTop = isMatch(ctx.sel) ? 0 : msgs.scrollHeight;
      if (visibleEl(msgs)) U.ibBottom = false;
      msgs.addEventListener('scroll', () => { st().ibScroll = { id: ctx.sel.id, top: msgs.scrollTop }; }, { passive: true });
    }
    if (ta) {
      ta.addEventListener('focus', () => { ta.dataset.touched = '1'; });
      const ins = document.getElementById('ib-insert');
      if (ins) ins.addEventListener('mousedown', (e) => { if (document.activeElement === ta) e.preventDefault(); });
    }
    const f = U.ibFocus;
    U.ibFocus = null;
    const byId = (id) => document.getElementById(id);
    let target = null;
    if (f === 'composer' || f === 'composer-start') target = ta;
    else if (f === 'title') target = byId('ib-thread-title');
    else if (f === 'row') target = document.querySelector('.ib-row[aria-current="true"]');
    else if (f === 'panel') target = byId('ib-panel-close');
    else if (f === 'company') target = document.querySelector('.ib-co-open');
    else if (f === 'search') target = byId('ib-search');
    else if (f && f.indexOf('filter:') === 0) target = byId(MORE.includes(f.slice(7)) ? 'ib-f-more' : `ib-f-${f.slice(7)}`);
    if (visibleEl(target)) {
      target.focus({ preventScroll: true });
      // A suggestion just put in the box reads from the top; anything else picks up where you stopped
      if (target === ta && f === 'composer-start') { ta.setSelectionRange(0, 0); ta.scrollTop = 0; }
      else if (target === ta) { const n = ta.value.length; ta.setSelectionRange(n, n); }
    } else if (!ctx.auto && !isWide()) {
      const ae = document.activeElement;
      if (!ae || ae === document.body || !visibleEl(ae)) { const h = byId('ib-thread-title'); if (h) h.focus({ preventScroll: true }); }
    }
    // Show all only when the preview is cut short
    const sugBody = byId('ib-sug-body'), sugMore = byId('ib-sug-more');
    if (sugBody && sugMore && visibleEl(sugBody) && !sugBody.closest('.ib-sug').classList.contains('is-open')) sugMore.hidden = sugBody.scrollHeight <= sugBody.clientHeight + 1;
    placeToasts();
    if (ctx.settle) OB.replaceHash(ctx.settle);
  }

  /* ---------- Keyboard ---------- */
  function move(dir) {
    const sel = current();
    const list = visible(sel);
    if (!list.length) return;
    const i = sel ? list.findIndex((t) => t.id === sel.id) : -1;
    const next = i < 0 ? list[dir > 0 ? 0 : list.length - 1] : list[i + dir];
    if (!next) { OB.toast(dir > 0 ? 'No more conversations below' : 'No more conversations above', { ms: 2000 }); return; }
    const ae = document.activeElement;
    st().ibFocus = ae && ae.classList && ae.classList.contains('ib-row') ? 'row' : 'title';
    OB.go(`inbox.${next.id}`);
  }
  const view = () => (OB.current && OB.current.view) || {};
  const onThread = () => !view().ibEmpty && (isWide() || !view().ibAuto);
  const KEYS = {
    j: () => { if (!view().ibEmpty) move(1); },
    k: () => { if (!view().ibEmpty) move(-1); },
    r: () => {
      if (!onThread()) return;
      const ta = document.getElementById('ib-reply');
      if (ta) { ta.focus(); const n = ta.value.length; ta.setSelectionRange(n, n); return; }
      const why = cannot(current(), 'reply');
      if (why) OB.toast(why, { ms: 3000 });
    },
    b: () => { if (onThread()) OB.actions['inbox-book'](); },
    e: () => { if (onThread()) OB.actions['inbox-done'](); },
  };
  /* Cmd+Enter or Ctrl+Enter sends; Escape leaves the reply box so the shortcuts work again */
  document.addEventListener('keydown', (e) => {
    const ta = e.target;
    if (!ta || ta.id !== 'ib-reply') return;
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      const form = ta.form;
      if (form && form.requestSubmit) form.requestSubmit();
      else if (form) OB.actions['inbox-send'](form, e, { reply: ta.value });
    } else if (e.key === 'Escape' && !OB._menu && !document.getElementById('overlay').innerHTML) {
      const h = document.getElementById('ib-thread-title');
      if (h) h.focus();
    }
  });

  /* ---------- Route ---------- */
  OB.route('inbox', (params, r) => {
    const U = st();
    // Day one, or before subscribing (nothing has been sent, so nothing can have replied)
    const forced = params[0] === 'empty' || !OB.state.sim.subscribed;
    const empty = forced || OB.state.sim.emptyInbox;
    if (!U.ibFilter) U.ibFilter = OB.get.needsYou().length ? 'needs' : 'all';
    if (U.ibPanel === undefined) U.ibPanel = true;
    // Drawing the same address again (after an action) keeps the open conversation; arriving picks the first
    const again = !!(OB.current && OB.current.route && r && OB.current.route.raw === r.raw);
    let sel = null, auto = true, newSel = false;
    if (!empty) {
      const want = params[0] ? OB.get.thread(params[0]) : null;
      const kept = again && U.ibSel ? OB.get.thread(U.ibSel) : null;
      if (want && want.status !== 'hidden') { sel = want; auto = false; }
      else if (kept && kept.status !== 'hidden') sel = kept;
      else { const f = filterOf(U.ibFilter); sel = ordered().find((t) => f.test(t)) || null; }
      if (sel && sel.id !== U.ibSel) {
        newSel = true;
        if (!auto && !filterOf(U.ibFilter).test(sel)) U.ibFilter = 'all';
        U.ibFrozen = { id: sel.id, at: sel.at };
        U.ibScroll = null;
        U.ibBottom = true;
      }
      U.ibSel = sel ? sel.id : null;
      if (sel && (!auto || isWide())) sel.unread = false;
      // #inbox.<threadId>.use (Screens menu): the suggestion already in the reply box, then the plain address
      if (sel && !auto && params[1] === 'use' && !again) {
        if (sugShown(sel)) { bag('ibDrafts')[sel.id] = sel.suggestion.body; bag('ibSugUsed')[sel.id] = true; U.ibBottom = true; }
        U.ibFocus = 'composer-start';
      }
    }
    const settle = !empty && sel && !auto && params[1] ? `inbox.${sel.id}` : null;
    const ctx = { sel, auto, empty, newSel, settle, restoreSim: forced && !OB.state.sim.emptyInbox };
    const panel = !empty && !!sel && !!U.ibPanel && !!companyOf(sel);
    const cls = ['ib-app', auto ? 'is-auto' : 'is-thread', panel ? 'has-panel' : '', empty ? 'is-empty' : ''].filter(Boolean).join(' ');
    const html = `<div class="${cls}">
      ${listPane(ctx)}
      ${empty ? dayOne() : sel ? threadPane(sel) : nothingOpen()}
      ${panel ? panelPane(sel) : ''}
    </div>`;
    // Day one shows an empty Inbox in the shell too; the real setting is put back once this screen has drawn
    if (ctx.restoreSim) OB.state.sim.emptyInbox = true;
    return { shell: 'app', nav: 'inbox', title: 'Inbox', wide: true, ibAuto: auto, ibEmpty: empty, html, keys: KEYS, after: () => after(ctx) };
  });

  /* ---------- List actions ---------- */
  OB.action('inbox-filter', (el, e, key) => {
    st().ibFilter = key;
    st().ibSel = null;
    st().ibListScroll = 0;
    st().ibFocus = `filter:${key}`;
    OB.go('inbox');
  });
  OB.action('inbox-filter-more', (el) => {
    const all = ordered();
    OB.menu(el, MORE.map((k) => { const f = filterOf(k); return { label: f.label, hint: String(all.filter(f.test).length), action: 'inbox-filter', arg: k }; }));
  });
  OB.action('inbox-search', (el, e, v) => {
    st().ibQuery = v;
    const box = document.getElementById('ib-rows');
    if (box) { box.innerHTML = rowsHtml(current(), !!(OB.current && OB.current.view && OB.current.view.ibAuto) && !isWide()); box.scrollTop = 0; }
  });
  OB.action('inbox-clear-search', () => { st().ibQuery = ''; st().ibFocus = 'search'; OB.render({ keepScroll: true }); });

  /* ---------- Reply box ---------- */
  OB.action('inbox-draft', (el, e, v) => {
    const id = el.dataset.arg;
    bag('ibDrafts')[id] = v;
    grow(el);
    const errs = st().ibErr || {};
    if (errs[id]) {
      delete errs[id];
      el.removeAttribute('aria-invalid');
      const msg = document.getElementById('ib-reply-err');
      if (msg) msg.remove();
      el.setAttribute('aria-describedby', (el.getAttribute('aria-describedby') || '').replace('ib-reply-err', '').trim());
    }
    const t = OB.get.thread(id);
    const pv = document.getElementById(`ib-pv-${id}`);
    if (t && pv) pv.outerHTML = previewHtml(t);
  });
  OB.action('inbox-insert-link', () => {
    const ta = document.getElementById('ib-reply');
    if (!ta) return;
    const link = D.profile.booking;
    const atCaret = document.activeElement === ta || ta.dataset.touched === '1';
    const s = atCaret ? ta.selectionStart : ta.value.length;
    const end = atCaret ? ta.selectionEnd : ta.value.length;
    const before = ta.value.slice(0, s);
    ta.setRangeText(`${before && !/\s$/.test(before) ? ' ' : ''}${link}`, s, end, 'end');
    ta.focus();
    OB.actions['inbox-draft'](ta, null, ta.value);
  });
  OB.action('inbox-send', (form, e, data) => {
    const t = OB.get.thread(form.dataset.thread);
    if (!t) return;
    const text = String((data && data.reply) || '').trim();
    if (!text) {
      bag('ibErr')[t.id] = `Write your reply to ${first(personOf(t).name)} first, then send it.`;
      st().ibFocus = 'composer';
      OB.render({ keepScroll: true });
      return;
    }
    const ch = replyCh(t);
    if (OB.state.sim.paymentFailed || (ch === 'linkedin' && OB.state.sim.linkedinIssue)) {
      bag('ibDrafts')[t.id] = text;
      OB.toast(OB.state.sim.paymentFailed ? 'Update your card to send this reply. Your draft is kept.' : 'Reconnect LinkedIn to send this reply. Your draft is kept.');
      return;
    }
    const msg = { dir: 'out', ch, at: nowIso(), you: true, body: text };
    if (ch === 'email') {
      const last = t.messages.slice().reverse().find((m) => m.subject);
      msg.subject = last ? (/^re:/i.test(last.subject) ? last.subject : `Re: ${last.subject}`) : 'Re: our conversation';
    }
    const p = personOf(t), c = OB.get.campaign(t.campaign);
    const wasNeeds = t.status === 'needs-you';
    change([
      [t, { messages: [...t.messages, msg], preview: `You: ${text}`, at: msg.at, unread: false, status: wasNeeds ? 'in-conversation' : t.status }],
      [p, wasNeeds ? { stage: 'in-conversation', detail: undefined, last: msg.at } : { last: msg.at }],
      [c, wasNeeds && c ? { needsYou: Math.max(0, (c.needsYou || 0) - 1) } : null],
    ]);
    bag('ibDrafts')[t.id] = '';
    st().ibBottom = true;
    st().ibFocus = 'title';
    OB.render({ keepScroll: true });
    OB.toast('Reply sent');
  });
  /* ---------- Suggested reply ---------- */
  /* Use this reply: the draft goes into the reply box to edit; nothing sends until you press Send */
  OB.action('inbox-sug-use', () => {
    const t = current();
    const s = suggestionOf(t);
    if (!s) return;
    const prev = String((st().ibDrafts || {})[t.id] || '');
    bag('ibDrafts')[t.id] = s.body;
    bag('ibSugUsed')[t.id] = true;
    if (st().ibErr) delete st().ibErr[t.id];
    st().ibFocus = 'composer-start';
    st().ibBottom = true;
    OB.render({ keepScroll: true });
    // Only a draft you had started is lost, so only then is there something to undo
    if (prev.trim()) {
      OB.toast('Suggested reply used in place of your draft', { undo: () => { bag('ibDrafts')[t.id] = prev; delete bag('ibSugUsed')[t.id]; st().ibFocus = 'composer'; OB.render({ keepScroll: true }); } });
    }
  });
  OB.action('inbox-sug-dismiss', () => {
    const t = current();
    if (!suggestionOf(t)) return;
    bag('ibSugOff')[t.id] = true;
    st().ibFocus = 'composer';
    OB.render({ keepScroll: true });
    OB.toast('Suggestion dismissed', { undo: () => { delete bag('ibSugOff')[t.id]; OB.render({ keepScroll: true }); } });
  });
  /* Show all or the short preview, in place, keeping the conversation pinned to its latest message */
  OB.action('inbox-sug-more', (el) => {
    const t = current();
    const s = suggestionOf(t);
    const box = el.closest('.ib-sug');
    const body = document.getElementById('ib-sug-body');
    if (!s || !box || !body) return;
    const open = el.getAttribute('aria-expanded') !== 'true';
    bag('ibSugMore')[t.id] = open;
    const msgs = document.getElementById('ib-msgs');
    const atBottom = !!msgs && msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight < 4;
    box.classList.toggle('is-open', open);
    body.innerHTML = open ? paras(s.body) : `<p>${esc(oneLine(s.body))}</p>`;
    el.setAttribute('aria-expanded', String(open));
    el.textContent = open ? 'Show less' : 'Show all';
    if (msgs && atBottom) msgs.scrollTop = msgs.scrollHeight;
    placeToasts();
  });

  /* Open or fold one of Onbook's steps */
  OB.action('inbox-expand', (el, e, key) => {
    const open = el.getAttribute('aria-expanded') !== 'true';
    bag('ibOpen')[key] = open;
    const li = el.closest('.ib-out');
    if (li) li.classList.toggle('is-open', open);
    el.setAttribute('aria-expanded', String(open));
  });

  /* ---------- Company panel ---------- */
  OB.action('inbox-panel', (el, e, arg) => {
    st().ibPanel = arg === 'open';
    st().ibFocus = arg === 'open' ? 'panel' : 'company';
    OB.render({ keepScroll: true });
  });
  OB.action('inbox-company', () => {
    const t = current();
    if (!t) return;
    const co = companyOf(t);
    OB.drawer(`${OB.drawerHead(co ? `<span class="ib-drawer-title">${ui.co(co.name)}<span>${esc(co.name)}</span></span>` : 'Company', co ? esc(co.domain) : '')}<div class="drawer-body ib-drawer">${panelBody(t)}</div>`, { label: co ? co.name : 'Company' });
  });
  OB.action('inbox-open-company', (el, e, id) => { if (OB.openCompany) OB.openCompany(id); else OB.go(`contacts.company.${id}`); });
  OB.action('inbox-open-person', (el, e, id) => { if (OB.openPerson) OB.openPerson(id); else OB.go(`contacts.person.${id}`); });

  /* ---------- Conversation actions ---------- */
  const rerender = () => { st().ibBottom = true; OB.render({ keepScroll: true }); };
  const withRender = (undo) => () => { undo(); rerender(); };

  OB.action('inbox-more', (el) => {
    const t = current();
    const p = personOf(t);
    if (!t || !p) return;
    const hidden = (id) => !visibleEl(document.getElementById(id));
    const items = [];
    if (canAnswer(t) && hidden('ib-book')) items.push({ label: 'Mark call booked', icon: 'calendar', action: 'inbox-book', hint: 'B' });
    if ((canAnswer(t) || t.status === 'booked') && hidden('ib-done')) items.push({ label: 'Mark done', icon: 'check', action: 'inbox-done', hint: 'E' });
    if (canAnswer(t)) items.push({ label: 'Not interested', icon: 'x', action: 'inbox-not-interested' }, { label: 'Check back on a date', icon: 'clock', action: 'inbox-checkback' });
    items.push({ label: 'Open contact', icon: 'user', action: 'inbox-open-person', arg: p.id });
    if (t.type !== 'optout' && t.doneReason !== 'Never contact') items.push({ sep: true }, { label: 'Add to never contact', icon: 'shield', action: 'inbox-never', danger: true });
    OB.menu(el, items);
  });

  /* Done, with a reason. The company stays stopped. */
  function setDone(t, reason, extra, extraPerson) {
    const p = personOf(t), c = OB.get.campaign(t.campaign);
    const wasNeeds = t.status === 'needs-you';
    const undo = change([
      [t, Object.assign({ status: 'done', doneReason: reason, doneFrom: t.status === 'done' ? t.doneFrom : t.status, unread: false }, extra || {})],
      [p, t.status === 'booked' ? null : Object.assign({ stage: 'done', detail: reason }, extraPerson || {})],
      [c, wasNeeds && c ? { needsYou: Math.max(0, (c.needsYou || 0) - 1) } : null],
    ]);
    rerender();
    return withRender(undo);
  }

  OB.action('inbox-done', () => {
    const t = current();
    const why = cannot(t, 'done');
    if (why || !(canAnswer(t) || t.status === 'booked')) { OB.toast(why || 'Nothing to mark done here', { ms: 3000 }); return; }
    OB.toast('Marked done', { undo: setDone(t, 'Done') });
  });
  OB.action('inbox-not-interested', () => {
    const t = current();
    if (!canAnswer(t)) return;
    OB.toast('Marked not interested', { undo: setDone(t, 'Not interested') });
  });
  OB.action('inbox-reopen', () => {
    const t = current();
    if (!t || t.status !== 'done') return;
    const p = personOf(t);
    const back = t.doneFrom && t.doneFrom !== 'needs-you' ? t.doneFrom : t.type === 'auto' ? 'auto' : 'in-conversation';
    const stage = { booked: 'booked', auto: t.pausedUntil ? 'paused' : 'in-flow', 'in-conversation': 'in-conversation' }[back] || 'in-conversation';
    const undo = change([
      [t, { status: back, doneReason: undefined, checkBack: undefined, flowBefore: undefined }],
      [p, Object.assign({ stage, detail: stage === 'paused' ? `Paused until ${fmt.day(t.pausedUntil)}` : undefined }, t.flowBefore ? { progress: t.flowBefore.slice() } : {})],
    ]);
    st().ibFocus = back === 'auto' ? 'title' : 'composer';
    rerender();
    OB.toast('Conversation reopened', { undo: withRender(undo) });
  });

  /* Mark call booked: for calls agreed anywhere, by phone or on Telegram */
  OB.action('inbox-book', () => {
    const t = current();
    const why = cannot(t, 'book');
    if (why || !canAnswer(t)) { OB.toast(why || 'Nothing to book here', { ms: 3000 }); return; }
    const co = companyOf(t);
    const day = dayIso(weekday(addDays(1)));
    OB.dialog(`${OB.dialogHead('Mark call booked', 'For a call agreed anywhere: in this conversation, by phone or on Telegram.')}
      <form class="stack gap-5" data-submit="inbox-book-save" data-thread="${t.id}" novalidate>
        <div class="ib-when-grid">
          <div class="field"><label class="label" for="ib-call-date">Date</label><input class="input" type="date" id="ib-call-date" name="date" value="${day}" min="${dayIso(OB.TODAY)}"></div>
          <div class="field"><label class="label" for="ib-call-time">Time</label><input class="input" type="time" id="ib-call-time" name="time" value="11:00" step="900"></div>
        </div>
        <p class="t-small t-2" id="ib-call-note">${esc(co.name)} stays stopped. The call shows on Home and counts in the campaign's results.</p>
        <div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${ui.btn({ label: 'Mark call booked', kind: 'primary', type: 'submit' })}</div>
      </form>`, { label: 'Mark call booked' });
  });
  OB.action('inbox-book-save', (form, e, data) => {
    const t = OB.get.thread(form.dataset.thread);
    if (!t) return;
    if (!data.date || !data.time) {
      const note = document.getElementById('ib-call-note');
      if (note) { note.className = 'field-error'; note.textContent = 'Add the date and time of the call.'; }
      return;
    }
    const at = `${data.date}T${data.time}`;
    const p = personOf(t), c = OB.get.campaign(t.campaign);
    const wasNeeds = t.status === 'needs-you';
    const call = { id: `call-${t.id}-${D.calls.length + 1}`, person: p.id, at, title: 'Intro call', thread: t.id };
    const undo = change([
      [t, { status: 'booked', booking: { at, title: `Call with ${p.name}`, manual: true }, unread: false, messages: [...t.messages, { dir: 'event', at: nowIso(), body: `You marked a call booked for ${fmt.dt(at)}` }] }],
      [p, { stage: 'booked', detail: `Call booked, ${fmt.day(at)}` }],
      [c, c ? Object.assign({ calls: (c.calls || 0) + 1 }, wasNeeds ? { needsYou: Math.max(0, (c.needsYou || 0) - 1) } : {}) : null],
    ]);
    const at2 = OB.d(at);
    const pos = D.calls.findIndex((x) => OB.d(x.at) > at2);
    D.calls.splice(pos < 0 ? D.calls.length : pos, 0, call);
    OB.closeOverlays(true);
    st().ibFocus = 'title';
    rerender();
    OB.toast(`Call booked with ${p.name}, ${fmt.dt(at)}`, { undo: () => { const i = D.calls.indexOf(call); if (i >= 0) D.calls.splice(i, 1); undo(); rerender(); } });
  });

  /* Check back on a date: the company stays stopped until then, then one fresh message at no extra count */
  function checkbackLabel(form) {
    const when = (form.querySelector('input[name="when"]:checked') || {}).value;
    let d = null;
    if (when === '1m') d = addMonths(1);
    else if (when === '3m') d = addMonths(3);
    else { const v = form.querySelector('#ib-cb-date').value; if (v) d = weekday(OB.d(v)); }
    return d;
  }
  OB.action('inbox-checkback', () => {
    const t = current();
    const p = personOf(t), co = companyOf(t);
    if (!t || !p || !(canAnswer(t) || t.checkBack)) return;
    const mode = t.checkBack ? 'pick' : '3m';
    const picked = t.checkBack || dayIso(addMonths(2));
    const opt = (v, label, d) => `<label class="ib-opt"><input type="radio" name="when" value="${v}"${mode === v ? ' checked' : ''} data-change="inbox-cb-change"><span class="grow">${esc(label)}</span>${d ? `<span class="t-2 num">${esc(fmt.day(d))}</span>` : ''}</label>`;
    const firstLabel = mode === 'pick' ? fmt.day(weekday(OB.d(picked))) : fmt.day(addMonths(3));
    OB.dialog(`${OB.dialogHead('Check back on a date', `Onbook keeps ${esc(co.name)} stopped until then, and writes to ${esc(first(p.name))} once more on that day.`)}
      <form class="stack gap-5" data-submit="inbox-cb-save" data-thread="${t.id}" novalidate>
        <fieldset class="ib-opts">
          <legend class="sr-only">When to check back</legend>
          ${opt('1m', 'In 1 month', addMonths(1))}
          ${opt('3m', 'In 3 months', addMonths(3))}
          ${opt('pick', 'After a date you pick', null)}
          <div class="field ib-opt-date"><label class="label" for="ib-cb-date">Date</label><input class="input" type="date" id="ib-cb-date" name="date" min="${dayIso(addDays(1))}" value="${esc(picked)}" data-input="inbox-cb-date"></div>
        </fieldset>
        <p class="t-small t-2">Onbook sends one fresh message then. It doesn't count again.</p>
        <p class="field-error" id="ib-cb-err" hidden></p>
        <div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}<button type="submit" class="btn btn-primary" id="ib-cb-go">Check back on ${esc(firstLabel)}</button></div>
      </form>`, { label: 'Check back on a date' });
  });
  const cbRefresh = (form) => {
    const d = checkbackLabel(form);
    const go = form.querySelector('#ib-cb-go');
    if (go) go.textContent = d ? `Check back on ${fmt.day(d)}` : 'Check back';
  };
  OB.action('inbox-cb-change', (el) => cbRefresh(el.form));
  OB.action('inbox-cb-date', (el) => {
    const pick = el.form.querySelector('input[name="when"][value="pick"]');
    if (pick) pick.checked = true;
    cbRefresh(el.form);
  });
  OB.action('inbox-cb-save', (form) => {
    const t = OB.get.thread(form.dataset.thread);
    const d = checkbackLabel(form);
    if (!t) return;
    if (!d || d <= OB.TODAY) {
      const err = form.querySelector('#ib-cb-err');
      if (err) { err.hidden = false; err.textContent = 'Pick a date after today.'; }
      return;
    }
    OB.closeOverlays(true);
    st().ibFocus = 'title';
    const undo = setDone(t, `Check back ${fmt.short(d)}`, { checkBack: dayIso(d) });
    OB.toast(`Check back set for ${fmt.day(d)}`, { undo });
  });

  OB.action('inbox-never', () => {
    const t = current();
    const p = personOf(t), co = companyOf(t);
    if (!t || !p) return;
    OB.confirm({
      title: `Add ${p.name} to never contact?`,
      body: `Onbook won't contact ${esc(p.name)} again, from any campaign or teammate. ${esc(co.name)} stays stopped. You can remove ${esc(first(p.name))} from Never contact in Contacts.`,
      confirmLabel: 'Add to never contact',
      danger: true,
      onConfirm: () => {
        const entry = { id: `n-${p.id}`, type: 'Person', value: p.name, detail: co.name, reason: 'Added by you', added: dayIso(OB.TODAY), by: 'You' };
        D.never.push(entry);
        st().ibFocus = 'title';
        const undo = setDone(t, 'Never contact');
        OB.toast(`Added ${p.name} to never contact`, { undo: () => { const i = D.never.indexOf(entry); if (i >= 0) D.never.splice(i, 1); undo(); } });
      },
    });
  });

  /* Auto-replies pause one person; these put them back in the flow or stop them */
  OB.action('inbox-resume', () => {
    const t = current();
    const p = personOf(t);
    if (!t || !p || t.status !== 'auto') return;
    const flow = OB.get.flowOf(t.campaign);
    const i = (p.progress || []).findIndex((s) => s === 'todo' || s === 'next');
    const step = flow && i >= 0 ? flow.steps[i] : null;
    const next = step ? { step: step.id, at: step.kind === 'message' ? null : `${dayIso(weekday(addDays(1)))}T09:40` } : undefined;
    const undo = change([
      [t, { pausedUntil: null, resumedAt: nowIso() }],
      [p, { stage: 'in-flow', detail: undefined, next }],
    ]);
    st().ibFocus = 'title';
    rerender();
    OB.toast(`${p.name} resumed`, { undo: withRender(undo) });
  });
  OB.action('inbox-stop-person', () => {
    const t = current();
    const p = personOf(t);
    if (!t || !p) return;
    st().ibFocus = 'title';
    const undo = setDone(t, 'Stopped by you', { flowBefore: (p.progress || []).slice() }, { progress: (p.progress || []).map((s) => (s === 'todo' || s === 'next' ? 'stopped' : s)) });
    OB.toast(`${p.name} stopped`, { undo });
  });

  /* ---------- Booking to match ---------- */
  function matchTo(t, pid) {
    const p = OB.get.person(pid);
    if (!t || !p) return;
    const co = OB.get.company(p.company), c = OB.get.campaign(p.campaign);
    const b = t.booking;
    const call = D.calls.find((x) => x.thread === t.id);
    const existing = D.threads.find((x) => x.person === pid && x.id !== t.id && x.status !== 'hidden');
    const suggested = (t.suggest || []).some((s) => s.person === pid);
    const ev = { dir: 'event', at: t.at, body: `${p.name} booked ${fmt.dt(b.at)} through your booking link, as ${b.email}` };
    const booking = { at: b.at, title: b.title, link: b.link };
    const target = existing || t;
    const undos = [];
    if (existing) {
      undos.push(change([
        [existing, { status: 'booked', booking, unread: false, preview: `Booked ${fmt.dt(b.at)}`, messages: [...existing.messages, ev] }],
        [t, { status: 'hidden' }],
        [call, { person: pid, match: undefined, email: undefined, thread: existing.id }],
      ]));
    } else {
      undos.push(change([
        [t, { type: 'booking', person: pid, campaign: p.campaign, status: 'booked', matched: true, unread: false, replyCh: suggested ? 'x' : (p.email ? 'email' : 'linkedin'), booking: Object.assign({}, b), preview: `Booked ${fmt.dt(b.at)}`, messages: [...t.messages, ev] }],
        [call, { person: pid, match: undefined, email: undefined }],
      ]));
    }
    undos.push(change([
      [p, { stage: 'booked', detail: `Call booked, ${fmt.day(b.at)}`, progress: (p.progress || []).map((s) => (s === 'next' || s === 'todo' ? 'stopped' : s)) }],
      [co, co && !co.stopped ? { stopped: { by: pid, at: nowIso(), why: `${p.name} booked a call` } } : null],
      [c, c ? { calls: (c.calls || 0) + 1 } : null],
    ]));
    OB.closeOverlays(true);
    st().ibBottom = true;
    st().ibFocus = 'title';
    OB.go(`inbox.${target.id}`);
    OB.toast(`Matched to ${p.name}`, { undo: () => { undos.slice().reverse().forEach((u) => u()); st().ibBottom = true; OB.go(`inbox.${t.id}`); } });
  }
  OB.action('inbox-match', (el, e, pid) => matchTo(current(), pid));

  /* People to match a booking to: with no search, the suggested person first, then people Onbook has written to */
  function pickList(q) {
    const ql = String(q || '').trim().toLowerCase();
    const sel = st().ibPick;
    const t = current();
    const suggested = ((t && t.suggest) || []).map((s) => s.person);
    const people = D.people
      .filter((p) => (ql ? `${p.name} ${p.title} ${(OB.get.company(p.company) || {}).name || ''} ${p.email || ''}`.toLowerCase().includes(ql) : p.stage !== 'not-contacted' && p.revealed))
      .sort((a, b) => (suggested.includes(b.id) ? 1 : 0) - (suggested.includes(a.id) ? 1 : 0))
      .slice(0, 8);
    if (!people.length) return `<p class="t-small t-2 ib-pick-none">Nobody on your lists matches &ldquo;${esc(q)}&rdquo;.</p>`;
    return people.map((p) => {
      const co = OB.get.company(p.company) || {};
      return `<label class="ib-opt"><input type="radio" name="pid" value="${esc(p.id)}"${sel === p.id ? ' checked' : ''} data-change="inbox-pick">${ui.avatar(p.name)}<span class="grow ib-pick-main"><span class="t-medium">${nameOf(p)}</span><span class="t-small t-2">${esc(p.title)}, ${esc(co.name || '')}</span></span></label>`;
    }).join('');
  }
  OB.action('inbox-match-other', () => {
    const t = current();
    if (!isMatch(t)) return;
    st().ibPick = null;
    OB.dialog(`${OB.dialogHead('Match this booking', `${esc(t.booking.email)} booked ${esc(fmt.dt(t.booking.at))}. Choose who it was.`)}
      <form class="stack gap-4" data-submit="inbox-match-save" data-thread="${t.id}" novalidate>
        <div class="field"><label class="label" for="ib-pick-q">Search people on your lists</label><div class="search-wrap">${icon('search', 16)}<input class="input input-search" id="ib-pick-q" type="search" autocomplete="off" placeholder="Name, company or title" data-input="inbox-pick-search"></div></div>
        <fieldset class="ib-opts ib-pick"><legend class="sr-only">People</legend><div id="ib-pick-list" class="ib-pick-list">${pickList('')}</div></fieldset>
        <p class="t-small t-2">Matching marks the call booked and stops everyone at their company.</p>
        <p class="field-error" id="ib-pick-err" hidden></p>
        <div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}<button type="submit" class="btn btn-primary" id="ib-pick-go">Match</button></div>
      </form>`, { label: 'Match this booking' });
  });
  OB.action('inbox-pick-search', (el, e, v) => { const box = document.getElementById('ib-pick-list'); if (box) box.innerHTML = pickList(v); });
  OB.action('inbox-pick', (el) => {
    st().ibPick = el.value;
    const p = OB.get.person(el.value);
    const go = document.getElementById('ib-pick-go');
    if (go && p) go.textContent = `Match to ${p.revealed ? p.name : first(p.name)}`;
    const err = document.getElementById('ib-pick-err');
    if (err) err.hidden = true;
  });
  OB.action('inbox-match-save', (form, e, data) => {
    const pid = data.pid || st().ibPick;
    if (!pid) {
      const err = document.getElementById('ib-pick-err');
      if (err) { err.hidden = false; err.textContent = 'Choose the person who booked, or search for them.'; }
      return;
    }
    matchTo(OB.get.thread(form.dataset.thread), pid);
  });
  OB.action('inbox-not-campaign', () => {
    const t = current();
    if (!isMatch(t)) return;
    const i = D.calls.findIndex((x) => x.thread === t.id);
    const call = i >= 0 ? D.calls.splice(i, 1)[0] : null;
    const undo = change([[t, { status: 'hidden', unread: false }]]);
    OB.go('inbox');
    OB.toast('Marked not from a campaign', { undo: () => { undo(); if (call) D.calls.splice(i, 0, call); st().ibBottom = true; OB.go(`inbox.${t.id}`); } });
  });
})();
