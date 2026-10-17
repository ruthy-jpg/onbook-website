/* Flow builder: the signature component, drawn like Attio's workflow builder. A campaign's flow is a column of
   node cards on a dotted canvas (channel, wait, instruction), a live preview on three example people in a
   composer card, and the checks Onbook enforces. Light only, Inter throughout.
   Embedded by setup step 4 (mode 'setup'), the campaign Flow tab (mode 'campaign') and New campaign (mode 'new').

   OB.flowBuilder.render({ flowId, mode, editable, headingLevel }) returns one HTML string.
   OB.flowBuilder.summary({ flowId, mode }) returns the plan as a compact list, one line per step (setup's
   "Use this plan"); summary(flowId, mode) with a plain id still returns the one-line text.
   Working copies live in OB.state.ui.flowDraft[key]: the key is the flowId in a campaign, and
   `${mode}-${flowId}` in setup and New campaign, so drafting a new campaign never edits a running one.
   Optional step (Proposed 9 Oct): a comment on the person's latest post on LinkedIn or X, 1 credit each,
   skipped if they haven't posted in 14 days. It is never in the default flow. */
(function () {
  'use strict';
  const OB = window.OB;
  const { esc, icon, ui, fmt } = OB;
  const D = OB.data;

  const clone = (o) => JSON.parse(JSON.stringify(o));
  const words = (t) => (String(t || '').trim().match(/\S+/g) || []).length;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const lowerTitle = (t) => (/^(LinkedIn|X\b)/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1));
  const listAnd = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
  const todayStr = () => { const t = OB.TODAY; return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MAX_WAIT = 30;

  /* The default flow as shipped, kept apart so "Start from the default flow" never picks up a campaign's edits */
  const DEFAULT_STEPS = clone(D.flows.f1.steps);

  /* ---------- Step types ---------- */
  const TYPES = {
    email: { ch: 'email', kind: 'email', title: 'Email', label: 'Email', hint: 'To their work inbox', purpose: 'A short follow-up with one useful idea and an easy question. No link.' },
    invite: { ch: 'linkedin', kind: 'invite', title: 'LinkedIn invite', label: 'LinkedIn invite', hint: 'Ask to connect', purpose: 'Connect. A short note on Premium accounts; no note on free ones.' },
    message: { ch: 'linkedin', kind: 'message', title: 'LinkedIn message', label: 'LinkedIn message', hint: 'After they accept', purpose: 'One human line and a question. No link.' },
    dm: { ch: 'x', kind: 'dm', title: 'X DM', label: 'X DM', hint: 'If they accept DMs', purpose: 'Only if they accept DMs. Under 50 words, no link.' },
    'comment-li': { ch: 'linkedin', kind: 'comment', title: 'Comment on their latest post', label: 'Comment on a LinkedIn post', hint: '1 credit', purpose: 'A short, specific comment on something they posted in the last 14 days. No pitch, no link.' },
    'comment-x': { ch: 'x', kind: 'comment', title: 'Comment on their latest post', label: 'Comment on an X post', hint: '1 credit', purpose: 'A short, specific comment on something they posted in the last 14 days. No pitch, no link.' },
  };
  const TYPE_ORDER = ['email', 'invite', 'message', 'dm', 'comment-li', 'comment-x'];
  const isComment = (s) => !!s && s.kind === 'comment';
  const typeOf = (s) => (isComment(s) ? (s.ch === 'x' ? 'comment-x' : 'comment-li') : s.ch === 'email' ? 'email' : s.ch === 'x' ? 'dm' : s.kind === 'invite' ? 'invite' : 'message');
  /* What a comment step promises, in the words its card, editor and preview share */
  const COMMENT_RULES = ['At most one comment per person', 'Never on posts about health, politics, religion or personal life'];

  /* ---------- Example messages ----------
     The default flow's steps use OB.data.examples directly. The other demo flows map their steps onto
     those, plus the few messages below that only they need (a plain invite, an X DM with the booking
     link, and follow-ups for people met at an event). */
  const EX_MAP = {
    f1: { s1: 's1', s2: 's2', s3: 's3', s4: 's4', s5: 's5', s6: 's6' },
    f2: { s1: 's4', s2: 'invite-plain', s3: 's2', s4: 'x-offer', s5: 's6' },
    f3: { s1: 'met-email', s2: 'met-invite', s3: 'met-offer' },
  };
  const offerMail = (first, lead) => `Hi ${first},\n\n${lead}: a free 20-minute teardown of what's working for three of your competitors.\n\nIf useful, pick a time: cal.com/sam-tideline/intro\n\nSam`;
  const offerDm = (first, lead) => `${first.toLowerCase()}, ${lead}: a free 20-minute teardown of what's working for three of your competitors. grab a time if useful: cal.com/sam-tideline/intro`;
  D.flowExamples = D.flowExamples || {
    strong: {
      messages: {
        'invite-plain': { body: '', noNote: true },
        'x-offer': { body: offerDm('Maya', 'one idea before the book opens') },
        'met-email': { subject: 'Good to meet at Token2049', body: "Hi Maya,\n\nGood to meet you at Token2049. You mentioned Kestrel opens the book to traders soon.\n\nWe run launch campaigns for trading products. One example: a top-10 perp DEX, $2.1B in trading volume in the first 90 days.\n\nWorth comparing notes before you open?\n\nSam" },
        'met-invite': { body: 'Hi Maya, good to meet you at Token2049. Would be good to stay in touch.' },
        'met-offer': { subject: 'Re: Good to meet at Token2049', body: offerMail('Maya', 'One idea before the book opens') },
        /* Comments: her post from Mon 5 Oct, and what Onbook would say under it */
        'comment-li': { posted: '2026-10-05', post: 'Mainnet date is set: Kestrel opens to traders on 20 October.\n\nThank you to everyone who stress-tested the testnet with us this summer. The early access list is open now.', body: 'Congrats on locking the date, Maya. Good luck turning all those testnet traders into day-one volume on the 20th.' },
        'comment-x': { posted: '2026-10-05', post: 'mainnet date is set: kestrel opens to traders on 20 oct. thank you to everyone who stress-tested the testnet this summer', body: 'congrats on locking the date. good luck turning those testnet traders into day-one volume on the 20th' },
      },
      why: {
        'invite-plain': 'No note, as this step asks. LinkedIn shows your name and headline with the invite.',
        'x-offer': 'Your offer, and the booking link for the only time. Still lowercase and short.',
        'met-email': 'Says where you met and uses the note from your import. Proof closest to an exchange.',
        'met-invite': 'A short note about where you met. No pitch.',
        'met-offer': 'Your offer, and the booking link for the first time.',
        'comment-li': 'Picks up the date and the testnet from her post, nothing else. No pitch, no link.',
        'comment-x': 'Picks up the date and the testnet from her post, in lowercase as your voice allows on X. No pitch, no link.',
      },
    },
    weak: {
      messages: {
        'invite-plain': { body: '', noNote: true },
        'x-offer': { body: offerDm('Daniel', 'one idea while the growth role is open') },
        'met-email': { subject: 'Good to meet at Token2049', body: "Hi Daniel,\n\nGood to meet you at Token2049. You mentioned Halcyon is hiring a Head of Growth.\n\nWe run launch campaigns for payments apps. One example: Ledgerly, 0 to 40,000 funded accounts in 12 weeks.\n\nWho is covering growth until the role is filled?\n\nSam" },
        'met-invite': { body: 'Hi Daniel, good to meet you at Token2049. Would be good to stay in touch.' },
        'met-offer': { subject: 'Re: Good to meet at Token2049', body: offerMail('Daniel', 'One idea while the role is open') },
        'comment-li': { posted: '2026-10-02', post: "We're hiring a Head of Growth at Halcyon Pay. If you've taken a payments app from 10k to 100k users and want to do it again in London, my DMs are open.", body: 'Good luck with the search, Daniel. 10k to 100k is a great brief for the right person.' },
        'comment-x': { posted: '2026-10-02', post: "We're hiring a Head of Growth at Halcyon Pay. London, payments, 10k to 100k users. DMs open.", body: 'good luck with the search. 10k to 100k is a great brief for the right person' },
      },
      why: {
        'invite-plain': 'No note, as this step asks. LinkedIn shows your name and headline with the invite.',
        'x-offer': 'Your offer, and the booking link for the only time. Mentions the open role, nothing else.',
        'met-email': 'Where you met, plus the open role from your import notes. Fintech proof (Ledgerly).',
        'met-invite': 'A short note about where you met. No pitch.',
        'met-offer': 'Your offer, and the booking link for the first time.',
        'comment-li': 'Answers the role he posted about, nothing else. No pitch, no link.',
        'comment-x': 'Answers the role he posted about, in lowercase as your voice allows on X. No pitch, no link.',
      },
    },
    none: {
      messages: {
        'invite-plain': { body: '', noNote: true },
        'x-offer': { body: offerDm('Lena', 'one idea') },
        'met-email': { subject: 'Good to meet at Token2049', body: "Hi Lena,\n\nGood to meet you at Token2049.\n\nWe run launch and growth campaigns for fintech apps. One example: Ledgerly, 0 to 40,000 funded accounts in 12 weeks.\n\nWho looks after growth at Northpoint today?\n\nSam" },
        'met-invite': { body: 'Hi Lena, good to meet you at Token2049. Would be good to stay in touch.' },
        'met-offer': { subject: 'Re: Good to meet at Token2049', body: offerMail('Lena', 'One idea') },
        /* Lena hasn't posted in 14 days, so her example shows the step being skipped */
        'comment-li': { skipped: true },
        'comment-x': { skipped: true },
      },
      why: {
        'invite-plain': 'No note, as this step asks. LinkedIn shows your name and headline with the invite.',
        'x-offer': 'Your offer, and the booking link for the only time. No news to mention, so nothing else.',
        'met-email': 'No recent news, so only where you met and who you are. Fintech proof (Ledgerly).',
        'met-invite': 'A short note about where you met. No pitch.',
        'met-offer': 'Your offer, and the booking link for the first time.',
        'comment-li': 'No post in the last 14 days, so there is nothing to comment on.',
        'comment-x': 'No post in the last 14 days, so there is nothing to comment on.',
      },
    },
  };
  function exampleOf(ref, exKey) {
    if (!ref) return null;
    const ex = D.examples[exKey] || {};
    const extra = D.flowExamples[exKey] || {};
    const msg = (ex.messages && ex.messages[ref]) || (extra.messages && extra.messages[ref]) || null;
    const why = (ex.why && ex.why[ref]) || (extra.why && extra.why[ref]) || '';
    return msg ? { msg, why } : null;
  }

  /* ---------- Working copies ---------- */
  const keyOf = (flowId, mode) => (mode === 'campaign' ? flowId : `${mode}-${flowId}`);
  const drafts = () => OB.state.ui.flowDraft || (OB.state.ui.flowDraft = {});
  const sourceOf = (flowId) => (flowId === 'default' || !D.flows[flowId] ? DEFAULT_STEPS : D.flows[flowId].steps);

  function toDraft(src, flowId, mode) {
    const map = EX_MAP[flowId === 'default' ? 'f1' : flowId] || {};
    let anchor = 1;
    const steps = src.map((s, i) => {
      const m = /day\s+(\d+)/i.exec(s.when || '');
      const day = m ? Number(m[1]) : null;
      let wait;
      if (i === 0) { wait = 0; anchor = day || 1; }
      else if (day == null) wait = 'accept';
      else { wait = Math.max(0, day - anchor); anchor = day; }
      const ex = s.ex !== undefined ? s.ex : (map[s.id] || null);
      const link = s.link != null ? !!s.link : /booking link/i.test(s.purpose || '');
      return { id: s.id, ch: s.ch, kind: s.kind, title: s.title, purpose: s.purpose || '', wait, link, ex, orig: { type: typeOf(s), title: s.title, purpose: s.purpose || '', ex } };
    });
    return { flowId, mode, steps, dirty: false, approvedAt: null, seq: 0 };
  }
  function getDraft(flowId, mode = 'campaign') {
    const key = keyOf(flowId, mode);
    const all = drafts();
    if (!all[key]) all[key] = toDraft(sourceOf(flowId), flowId, mode);
    return all[key];
  }
  const touch = (d) => { if (!d.dirty) anim.bar = true; d.dirty = true; d.approvedAt = null; };

  /* ---------- Timing ----------
     Step 1 is day 1. A step with a wait in days counts from the previous step that has a day.
     A LinkedIn message can instead wait for the invite to be accepted: not before the day after
     the previous dated step, and it never moves the dates of the steps after it. */
  function schedule(steps) {
    let anchor = 1, anchorIdx = 0;
    return steps.map((s, i) => {
      if (i === 0) { anchor = 1; anchorIdx = 0; return { day: 1, anchorIdx: null }; }
      if (s.wait === 'accept') return { day: null, notBefore: anchor + 1, anchorIdx };
      const from = anchorIdx;
      const day = anchor + s.wait;
      anchor = day; anchorIdx = i;
      return { day, anchorIdx: from };
    });
  }
  const totalDays = (steps, sch = schedule(steps)) => sch.reduce((n, w) => Math.max(n, w.day || w.notBefore || 1), steps.length ? 1 : 0);
  const whenText = (s, i, sch) => (i === 0 ? 'Day 1' : s.wait === 'accept' ? 'After they accept' : `Day ${sch[i].day}`);
  const afterAccept = (steps, i) => i > 1 && steps[i - 1].wait === 'accept';
  function waitText(steps, i, sch) {
    const s = steps[i];
    if (s.wait === 'accept') return `When they accept, not before day ${sch[i].notBefore}`;
    const anchorStep = steps[sch[i].anchorIdx] || steps[i - 1];
    if (s.wait === 0) return afterAccept(steps, i) ? `Same day as the ${lowerTitle(anchorStep.title)}` : 'Same day as the step before';
    if (afterAccept(steps, i)) return `${OB.plural(s.wait, 'day')} after the ${lowerTitle(anchorStep.title)}`;
    return `${OB.plural(s.wait, 'day')} later`;
  }
  /* Where a comment lands: best the day before the next message on its channel */
  function commentNote(steps, i, sch) {
    const s = steps[i];
    const j = steps.findIndex((x, k) => k > i && x.ch === s.ch && !isComment(x));
    if (j < 0) return 'Skipped if they haven\'t posted.';
    const day = sch[i].day;
    const nextDay = sch[j].day || sch[j].notBefore;
    const next = lowerTitle(steps[j].title);
    return day && nextDay === day + 1 ? `Lands the day before the ${next}. Skipped if they haven't posted.` : `Works best the day before the ${next}. Skipped if they haven't posted.`;
  }
  function channelsText(steps) {
    const names = { email: 'email', linkedin: 'LinkedIn', x: 'X' };
    return listAnd(['email', 'linkedin', 'x'].filter((c) => steps.some((s) => s.ch === c)).map((c) => names[c]));
  }
  function summaryParts(steps) {
    if (!steps.length) return { head: 'No steps yet', tail: '' };
    const days = totalDays(steps);
    const head = steps.length === 1 ? '1 step on day 1' : `${steps.length} steps over ${OB.plural(days, 'day')}`;
    return { head, tail: channelsText(steps) };
  }
  const summaryText = (steps) => { const p = summaryParts(steps); return p.tail ? `${p.head}, ${p.tail}` : p.head; };

  function toData(d) {
    const sch = schedule(d.steps);
    return d.steps.map((s, i) => ({
      id: s.id, ch: s.ch, kind: s.kind, title: s.title,
      when: i === 0 ? 'Day 1' : s.wait === 'accept' ? 'After they accept' : `Day ${sch[i].day}`,
      wait: i === 0 ? null : waitText(d.steps, i, sch),
      purpose: s.purpose, link: s.link, ex: s.ex,
    }));
  }

  /* ---------- Checks: the guardrails Onbook enforces whatever the flow says ---------- */
  function runChecks(steps) {
    const N = (i) => i + 1;
    const idx = (fn) => steps.map((s, i) => (fn(s, i) ? i : -1)).filter((i) => i >= 0);
    const sch = schedule(steps);
    const out = [];
    const add = (c) => { c.issues = c.issues || {}; out.push(c); };

    // 1. One message a day
    const zero = idx((s, i) => i > 0 && s.wait === 0);
    const accepts = idx((s, i) => i > 0 && s.wait === 'accept');
    const twin = accepts.slice(1);
    const dayIssues = {};
    zero.forEach((i) => { dayIssues[steps[i].id] = `Same day as step ${N(sch[i].anchorIdx)}. Wait at least 1 day.`; });
    twin.forEach((i) => { dayIssues[steps[i].id] = `Step ${N(accepts[0])} already sends when they accept.`; });
    add({
      id: 'day', label: 'Never two messages to one person on the same day', ok: !zero.length && !twin.length,
      detail: 'Every step waits at least a day after the one before.',
      fix: zero.length ? `Step ${N(zero[0])} sends on the same day as step ${N(sch[zero[0]].anchorIdx)}. Set it to at least 1 day later.`
        : twin.length ? `Steps ${N(accepts[0])} and ${N(twin[0])} both send when they accept. Give step ${N(twin[0])} a wait in days.` : '',
      bad: [...zero, ...twin].sort((a, b) => a - b), issues: dayIssues,
    });

    // 2. The booking link once, never in the first message (a comment before it is not a message)
    const first = steps.findIndex((s) => !isComment(s));
    const links = idx((s) => s.link);
    const keep = links.find((i) => i !== first);
    const linkBad = links.filter((i) => i === first || i !== keep);
    const linkIssues = {};
    linkBad.forEach((i) => { linkIssues[steps[i].id] = i === first ? 'Your booking link can\'t go in the first message.' : `Your booking link is already in step ${N(keep)}.`; });
    add({
      id: 'link', label: 'Your booking link once, never in the first message', ok: !linkBad.length,
      detail: links.length ? `In step ${N(links[0])} only.` : 'No step has it. People can still reply to ask for a time.',
      fix: links.includes(first) ? `Step ${N(first)} is the first message and has your booking link. Move the link to a later step.` : linkBad.length ? `Steps ${listAnd(links.map((i) => String(N(i))))} all have your booking link. Keep it in one.`.replace(/^Steps (\d+) and (\d+) all/, 'Steps $1 and $2 both') : '',
      bad: linkBad, issues: linkIssues,
    });

    // 3. LinkedIn messages only after an invite
    const msgs = idx((s) => typeOf(s) === 'message');
    const orphans = msgs.filter((i) => !steps.slice(0, i).some((p) => typeOf(p) === 'invite'));
    const liIssues = {};
    orphans.forEach((i) => { liIssues[steps[i].id] = 'No LinkedIn invite before this step.'; });
    add({
      id: 'linkedin', label: 'LinkedIn messages only after an invite', ok: !orphans.length,
      detail: msgs.length ? 'Each one waits for an accepted invite. An invite not accepted in 21 days is withdrawn and the flow carries on.' : 'No LinkedIn messages in this flow.',
      fix: orphans.length ? `Step ${N(orphans[0])} is a LinkedIn message with no invite before it. Add a LinkedIn invite earlier, or move this step down.` : '',
      bad: orphans, issues: liIssues,
    });

    // 4. At most 2 X DMs (a comment on their post is not a DM)
    const dms = idx((s) => typeOf(s) === 'dm');
    const dmIssues = {};
    dms.slice(2).forEach((i) => { dmIssues[steps[i].id] = 'A third X DM. At most 2 before a reply.'; });
    add({
      id: 'x', label: 'At most 2 X DMs before a reply', ok: dms.length <= 2,
      detail: dms.length ? `${OB.plural(dms.length, 'X DM')} in this flow. Each one sends only if they accept DMs.` : 'No X DMs in this flow.',
      fix: dms.length > 2 ? `This flow has ${dms.length} X DMs. Remove one, or change it to email or LinkedIn.` : '',
      bad: dms.slice(2), issues: dmIssues,
    });

    // 5. Small companies: messages only; a comment on a post is not a message
    const msgIdx = idx((s) => !isComment(s));
    const nMsg = msgIdx.length;
    const nCmt = steps.length - nMsg;
    const over = msgIdx.slice(7);
    const smIssues = {};
    over.forEach((i) => { smIssues[steps[i].id] = 'Over 7 messages for a small company.'; });
    add({
      id: 'small', label: 'Fewer than 8 messages to a small company', ok: nMsg < 8,
      detail: `${OB.plural(nMsg, 'message')} per person${nCmt ? `, plus ${OB.plural(nCmt, 'comment')}` : ''}. At companies under 50 staff, Onbook stops at 7 in total.`,
      fix: nMsg >= 8 ? `This flow sends ${nMsg} messages to one person. A company under 50 staff can get at most 7. Remove a step.` : '',
      bad: over, issues: smIssues,
    });

    // 5b. Comments on posts: at most one per person (only listed when the flow has one)
    const cmts = idx((s) => isComment(s));
    if (cmts.length) {
      const cmIssues = {};
      cmts.slice(1).forEach((i) => { cmIssues[steps[i].id] = `Step ${N(cmts[0])} already comments on their post.`; });
      add({
        id: 'comment', label: 'At most one comment per person', ok: cmts.length < 2,
        detail: `In step ${N(cmts[0])}, on ${OB.chName(steps[cmts[0]].ch)}. Skipped for anyone who hasn't posted in the last 14 days.`,
        fix: cmts.length > 1 ? `Steps ${listAnd(cmts.map((i) => String(N(i))))} all comment on their posts. Keep one.`.replace(/^Steps (\d+) and (\d+) all/, 'Steps $1 and $2 both') : '',
        bad: cmts.slice(1), issues: cmIssues,
      });
    }

    // 6. Every step has an instruction
    const empty = idx((s) => !String(s.purpose || '').trim());
    const emIssues = {};
    empty.forEach((i) => { emIssues[steps[i].id] = 'Say what this message should do.'; });
    add({
      id: 'purpose', label: 'Every step says what it should do', ok: !empty.length,
      detail: 'Onbook writes each message from its step\'s instruction.',
      fix: empty.length ? `Step ${N(empty[0])} has no instruction. Say what the message should do.` : '',
      bad: empty, issues: emIssues,
    });

    // 7. Length of the flow
    const p = summaryParts(steps);
    add({
      id: 'length', label: 'Length of the flow', ok: steps.length > 0,
      detail: steps.length ? `${p.head}, ${p.tail}.` : '',
      fix: steps.length ? '' : 'Add at least one step.', bad: [],
    });
    return out;
  }
  function issuesByStep(checks) {
    const map = {};
    checks.filter((c) => !c.ok).forEach((c) => Object.entries(c.issues || {}).forEach(([id, t]) => { (map[id] = map[id] || []).push(t); }));
    return map;
  }

  /* ---------- Selection ---------- */
  const selOf = (key, steps) => { const s = (OB.state.ui.flowSel || {})[key]; return steps.some((x) => x.id === s) ? s : (steps[0] ? steps[0].id : null); };
  const openOf = (key) => !!(OB.state.ui.flowOpen || {})[key];
  function setSel(key, id, open) {
    OB.state.ui.flowSel = Object.assign({}, OB.state.ui.flowSel, { [key]: id });
    OB.state.ui.flowOpen = Object.assign({}, OB.state.ui.flowOpen, { [key]: open });
  }
  /* One-shot entrance animations: only the editor or message that just changed animates, never a re-render */
  const anim = { editor: null, msg: false, sel: null, bar: false };
  const focusEl = (id) => { const el = document.getElementById(id); if (el) el.focus({ preventScroll: true }); return el; };
  function announce(text) {
    let r = document.getElementById('fb-live');
    if (!r) { r = document.createElement('div'); r.id = 'fb-live'; r.className = 'sr-only'; r.setAttribute('aria-live', 'polite'); document.body.appendChild(r); }
    r.textContent = '';
    setTimeout(() => { r.textContent = text; }, 40);
  }

  /* A small error mark on a step's tile; the words in the card say what to fix */
  const BADGE = '<svg class="fb-badge" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle class="fb-badge-bg" cx="8" cy="8" r="8"/><path class="fb-badge-fg" d="M8 4.2v4.6"/><circle class="fb-badge-dot" cx="8" cy="11.6" r="1.1"/></svg>';

  /* ---------- Rendering ----------
     Drawn like Attio's workflow builder: a dotted canvas with a header line, each step a white node card,
     thin connectors carrying the wait, and the selected step ringed in cobalt. The preview beside it is a
     composer card, and the checks sit in a panel under the canvas. */
  function render({ flowId = 'f1', mode = 'campaign', editable = true, headingLevel = 2 } = {}) {
    const key = keyOf(flowId, mode);
    const draft = getDraft(flowId, mode);
    const steps = draft.steps;
    const sch = schedule(steps);
    const checks = runChecks(steps);
    const ok = checks.every((c) => c.ok);
    /* In setup, a step on a channel that isn't connected yet is skipped, not failed */
    const skipCh = (ch) => mode === 'setup' && !!OB.connect && typeof OB.connect.isConnected === 'function' && !OB.connect.isConnected(ch);
    const ctx = {
      key, mode, flowId, editable, draft, steps, sch, checks, ok, skipCh,
      flow: D.flows[flowId] || null,
      issues: issuesByStep(checks),
      sel: selOf(key, steps),
      open: openOf(key),
      hl: clamp(headingLevel, 2, 5),
    };
    const html = `
      <div class="fb${draft.dirty && mode === 'campaign' ? ' is-dirty' : ''}" data-flow="${esc(key)}">
        ${mode === 'campaign' && draft.dirty && editable ? saveBar(ctx) : ''}
        <div class="fb-grid">
          <section class="fb-main" aria-labelledby="fb-steps-h">
            <h${ctx.hl} class="sr-only" id="fb-steps-h">Steps</h${ctx.hl}>
            <div class="fb-canvas">
              ${summaryBar(ctx)}
              <div class="fb-board">${track(ctx)}</div>
            </div>
          </section>
          <aside class="fb-side" aria-labelledby="fb-preview-h">${preview(ctx)}</aside>
          ${checksBlock(ctx)}
        </div>
      </div>`;
    anim.editor = null; anim.msg = false; anim.sel = null; anim.bar = false;
    return html;
  }

  /* The canvas header: the flow's length and channels on the left, where approval stands on the right */
  function summaryBar(ctx) {
    const { steps, mode, draft, flow, ok, checks, editable } = ctx;
    const p = summaryParts(steps);
    const bad = checks.filter((c) => !c.ok).length;
    let state = '';
    if (mode === 'campaign') {
      /* Read only (a finished campaign): the host page says why, and a shared flow's approval date may postdate it */
      if (!editable) state = '';
      else if (draft.dirty) state = `<p class="fb-sum-state is-edited">${icon('edit', 14)}<span>Edited, not saved yet</span></p>`;
      else if (flow && flow.approved) state = `<p class="fb-sum-state">${icon('check', 14)}<span>Approved by ${esc(flow.approvedBy || D.me.name)} on ${esc(fmt.day(flow.approved))}</span></p>`;
    } else if (!ok) {
      state = `<p class="fb-sum-state is-bad">${icon('alert', 14)}<button type="button" class="link-btn" data-action="flow-jump" data-arg="fb-checks-h">${bad === 1 ? '1 check' : `${bad} checks`} to fix before you approve</button></p>`;
    } else if (draft.approvedAt) {
      state = `<p class="fb-sum-state">${icon('check', 14)}<span>Approved by you today</span></p>`;
    } else {
      state = `<p class="fb-sum-state">${icon('check', 14)}<span>All checks pass</span></p>`;
    }
    return `<div class="fb-canvas-head">
      <p class="fb-sum-text"><span class="t-medium">${esc(p.head)}</span>${p.tail ? `<span class="t-2"> on ${esc(p.tail)}</span>` : ''}</p>
      ${state}
    </div>`;
  }

  function saveBar(ctx) {
    const { key, ok, checks } = ctx;
    const bad = checks.filter((c) => !c.ok);
    const why = `fb-why-${key}`;
    return `<div class="card fb-savebar${anim.bar ? ' is-enter' : ''}" role="region" aria-label="Unsaved changes to this flow">
      <div class="fb-savebar-text">
        <strong class="t-medium">You changed this flow</strong>
        <span class="t-small t-2">Changes apply to messages written from tomorrow. Messages already sent never change.</span>
        ${ok ? '' : `<span class="fb-savebar-why t-small" id="${esc(why)}">${icon('alert', 16)}<span>Approval waits until ${bad.length === 1 ? 'this check passes' : `${bad.length} checks pass`}: ${esc(bad[0].fix)}</span></span>`}
      </div>
      <div class="fb-savebar-actions">
        ${ui.btn({ label: 'Discard changes', action: 'flow-discard', arg: key, id: 'fb-discard' })}
        ${ui.btn({ label: 'Save and approve flow', kind: 'primary', action: 'flow-save', arg: key, id: 'fb-save', disabled: !ok, extra: ok ? '' : `aria-describedby="${esc(why)}"` })}
      </div>
    </div>`;
  }

  /* The steps as node cards joined by connectors; "Add a step" hangs off the last one */
  function track(ctx) {
    const { steps, editable, key } = ctx;
    const items = steps.map((s, i) => stepItem(ctx, s, i)).join('');
    const add = editable ? `<div class="fb-add-row">${ui.btn({ label: 'Add a step', icon: 'plus', size: 's', action: 'flow-add-menu', arg: key, id: 'fb-add', extra: 'aria-haspopup="menu" aria-expanded="false"' })}</div>` : '';
    return `<ol class="fb-track" role="list">${items}</ol>${add}`;
  }

  /* One step: the connector with its wait, then the node card (tile, "Step 1", channel, the instruction in one
     line, the day on the right). The card's header is one button that selects the step and opens its editor. */
  function stepItem(ctx, s, i) {
    const { key, steps, sch, issues, sel, open, editable, checks, skipCh } = ctx;
    const skipped = skipCh(s.ch);
    const isSel = s.id === sel;
    const isOpen = isSel && open && editable;
    const iss = issues[s.id] || [];
    const dayCheck = checks.find((c) => c.id === 'day');
    const waitBad = i > 0 && dayCheck && !dayCheck.ok && dayCheck.bad.includes(i);
    const arg = esc(`${key}~${s.id}`);
    const wait = i === 0 ? '' : `<div class="fb-wait${waitBad ? ' is-bad' : ''}"><span class="fb-wait-pill">${icon(waitBad ? 'alert' : 'clock', 13)}<span>${esc(waitText(steps, i, sch))}</span></span></div>`;
    const purpose = String(s.purpose || '').trim();
    const head = `<button type="button" class="fb-head" id="fb-head-${esc(s.id)}" data-action="flow-select" data-arg="${arg}" aria-pressed="${isSel}"${editable ? ` aria-expanded="${isOpen}"` : ''}${isOpen ? ` aria-controls="fb-ed-${esc(s.id)}"` : ''}>
        <span class="fb-tile" aria-hidden="true">${OB.mark(s.ch, 16)}${iss.length ? BADGE : ''}</span>
        <span class="fb-head-main">
          <span class="fb-head-top"><span class="fb-num">Step ${i + 1}</span><span class="sr-only">, </span><span class="fb-when">${esc(whenText(s, i, sch))}</span><span class="sr-only">: </span></span>
          <span class="fb-title-row"><span class="fb-title">${esc(s.title)}</span>${isComment(s) ? `<span class="sr-only">, on ${esc(OB.chName(s.ch))}</span>${ui.tag('grey', '1 credit')}` : ''}${s.link ? ui.tag('grey', 'Booking link') : ''}</span>
          <span class="fb-purpose${purpose ? '' : ' is-empty'}${isComment(s) ? ' is-wrap' : ''}">${esc(purpose || 'No instruction yet')}</span>
          ${isComment(s) && !skipped ? `<span class="fb-cmt-note">${esc(commentNote(steps, i, sch))}</span>` : ''}
          ${skipped ? `<span class="fb-skip">${icon('minus', 14)}<span>Skipped until you connect ${esc(OB.chName(s.ch))}</span></span>` : ''}
          ${iss.map((t) => `<span class="fb-issue">${icon('alert', 14)}<span>${esc(t)}</span></span>`).join('')}
        </span>
        ${editable ? `<span class="fb-chev" aria-hidden="true">${icon(isOpen ? 'chevron-up' : 'chevron-down', 16)}</span>` : ''}
      </button>`;
    return `<li class="fb-item">${wait}
      <div class="fb-step${isSel ? ' is-open' : ''}${isOpen ? ' is-editing' : ''}${iss.length ? ' is-bad' : ''}${skipped ? ' is-skipped' : ''}${anim.sel === s.id ? ' is-enter' : ''}" id="fb-step-${esc(s.id)}">
        ${head}${isOpen ? editor(ctx, s, i) : ''}
      </div>
    </li>`;
  }

  function editor(ctx, s, i) {
    const { key, steps, sch } = ctx;
    const id = esc(s.id);
    const a = (...p) => esc([key, s.id, ...p].join('~'));
    const t = typeOf(s);
    const cmt = isComment(s);
    const whenLabel = cmt ? 'When Onbook comments' : 'When it sends';
    const typeField = `<div class="field">
        <label class="label" for="fb-type-${id}">Step</label>
        <select class="select" id="fb-type-${id}" data-change="flow-type" data-arg="${a()}">
          ${TYPE_ORDER.map((k) => `<option value="${k}"${k === t ? ' selected' : ''}>${esc(TYPES[k].label)}</option>`).join('')}
        </select>
      </div>`;
    let when;
    if (i === 0) {
      when = `<div class="field"><span class="label">${whenLabel}</span><p class="fb-static">Day 1, when this person starts</p></div>`;
    } else {
      const accept = s.wait === 'accept';
      const modes = t === 'message' ? `<div class="seg fb-seg" role="group" aria-label="When it sends">
          <button type="button" id="fb-wa-${id}" aria-pressed="${accept}" data-action="flow-waitmode" data-arg="${a('accept')}">When they accept</button>
          <button type="button" id="fb-wd-${id}" aria-pressed="${!accept}" data-action="flow-waitmode" data-arg="${a('days')}">After a wait</button>
        </div>` : '';
      let body;
      if (accept) {
        body = `<p class="t-small t-2">Not before day ${sch[i].notBefore}. If they haven't accepted after 21 days, the invite is withdrawn and this step is skipped.</p>`;
      } else {
        const n = s.wait;
        const bad = n === 0;
        const anchorIdx = sch[i].anchorIdx;
        const from = afterAccept(steps, i) && steps[anchorIdx] ? `the ${lowerTitle(steps[anchorIdx].title)} on day ${sch[anchorIdx].day}` : 'the step before';
        body = `<div class="fb-days-row">
            <div class="fb-days${bad ? ' is-bad' : ''}" role="group" aria-labelledby="fb-wl-${id}">
              <button type="button" class="fb-days-btn" id="fb-dm-${id}" data-action="flow-days" data-arg="${a('-1')}" aria-label="One day fewer"${n <= 0 ? ' aria-disabled="true"' : ''}>${icon('minus', 16)}</button>
              <input class="fb-days-input" id="fb-days-${id}" type="text" inputmode="numeric" autocomplete="off" value="${n}" data-input="flow-days-input" data-change="flow-days-commit" data-arg="${a()}" aria-label="Days after ${esc(from)}"${bad ? ' aria-invalid="true"' : ''}>
              <button type="button" class="fb-days-btn" id="fb-dp-${id}" data-action="flow-days" data-arg="${a('1')}" aria-label="One day more"${n >= MAX_WAIT ? ' aria-disabled="true"' : ''}>${icon('plus', 16)}</button>
            </div>
            <span class="t-small t-2">${n === 1 ? 'day' : 'days'} after ${esc(from)}${sch[i].day ? `, so day ${sch[i].day}` : ''}</span>
          </div>`;
      }
      when = `<div class="field"><span class="label" id="fb-wl-${id}">${whenLabel}</span>${modes}${body}</div>`;
    }
    const emptyPurpose = !String(s.purpose || '').trim();
    const purpose = `<div class="field">
        <label class="label" for="fb-purpose-${id}">${cmt ? 'What the comment should do' : 'What this message should do'}</label>
        <span class="hint" id="fb-ph-${id}">${cmt ? 'The day before, Onbook reads what they posted in the last 14 days and writes one short comment from this.' : 'Onbook writes each person\'s message from this the day before it sends, using their news and your closest proof point.'}</span>
        <textarea class="textarea" id="fb-purpose-${id}" rows="3" data-input="flow-purpose" data-arg="${a()}" aria-describedby="fb-ph-${id}"${emptyPurpose ? ' aria-invalid="true"' : ''}>${esc(s.purpose)}</textarea>
      </div>`;
    /* A comment never carries a link; its rules are Onbook's, whatever the instruction says */
    const rules = cmt ? `<ul class="fb-rules" role="list" aria-label="Rules for comments">
        ${COMMENT_RULES.concat(`Counts against your ${OB.chName(s.ch)} daily limits`, '1 credit for each comment left, none when it\'s skipped').map((r) => `<li>${icon('check', 14)}<span>${esc(r)}</span></li>`).join('')}
      </ul>` : '';
    const link = t === 'invite' || cmt ? '' : `<label class="check fb-link"><input type="checkbox" id="fb-link-${id}" data-change="flow-link" data-arg="${a()}"${s.link ? ' checked' : ''}><span>Add your booking link <span class="t-2 t-small">${esc(D.profile.booking)}</span></span></label>`;
    const tools = `<div class="fb-tools">
        ${ui.btn({ label: 'Move up', ariaLabel: 'Move up', icon: 'arrow-up', kind: 'ghost', size: 's', action: 'flow-move', arg: `${key}~${s.id}~-1`, id: `fb-up-${s.id}`, disabled: i === 0, cls: 'fb-move' })}
        ${ui.btn({ label: 'Move down', ariaLabel: 'Move down', icon: 'arrow-down', kind: 'ghost', size: 's', action: 'flow-move', arg: `${key}~${s.id}~1`, id: `fb-down-${s.id}`, disabled: i === steps.length - 1, cls: 'fb-move' })}
        ${ui.btn({ label: 'See the example', kind: 'ghost', size: 's', icon: 'eye', action: 'flow-jump', arg: 'fb-preview-h', cls: 'fb-only-narrow' })}
        <span class="spacer"></span>
        ${ui.btn({ label: 'Remove step', icon: 'trash', kind: 'ghost', size: 's', action: 'flow-remove', arg: `${key}~${s.id}`, id: `fb-rm-${s.id}`, disabled: steps.length === 1, cls: 'fb-remove' })}
      </div>`;
    return `<div class="fb-editor${anim.editor === s.id ? ' is-enter' : ''}" id="fb-ed-${id}" role="group" aria-label="Edit step ${i + 1}, ${esc(s.title)}">
      <div class="fb-ed-row">${typeField}${when}</div>
      ${purpose}
      ${rules}
      ${link}
      ${tools}
    </div>`;
  }

  /* ---------- Preview ---------- */
  /* Names stay first name and last initial until the day before a person's first message: always in setup and
     a new campaign, and in a campaign before the first payment (nothing has been sent or bought yet) */
  function maskedWho(ex, mode) {
    const masked = mode !== 'campaign' || !OB.state.sim.subscribed;
    const parts = String(ex.person).split(' ');
    const short = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
    return { masked, text: masked ? short : ex.person, html: masked ? ui.person({ name: ex.person }, { revealed: false }) : esc(ex.person) };
  }
  function preview(ctx) {
    const { steps, sch, sel, hl } = ctx;
    const i = steps.findIndex((s) => s.id === sel);
    const s = steps[i];
    const exKey = D.examples[OB.state.ui.flowEx] ? OB.state.ui.flowEx : 'strong';
    const ex = D.examples[exKey];
    const person = D.people.find((p) => p.name === ex.person) || {};
    const proof = OB.get.proof(ex.proof);
    /* Before a person's first message their name is first name and last initial, and their details aren't bought yet.
       That is always true in setup and in a new campaign; a running campaign's examples have been contacted. */
    const who0 = maskedWho(ex, ctx.mode);
    const seg = `<div class="seg fb-ex" role="group" aria-label="Example person: three people from your list, with strong news, weak news and none">${['strong', 'weak', 'none'].map((k) => `<button type="button" id="fb-ex-${k}" aria-pressed="${k === exKey}" data-action="flow-ex" data-arg="${k}">${esc(D.examples[k].label)}</button>`).join('')}</div>`;
    let body = '';
    if (!s) {
      body = `<p class="t-2">Add a step to see what it would say.</p>`;
    } else {
      const got = exampleOf(s.ex, exKey);
      const stale = got && s.purpose !== s.orig.purpose;
      const skipNote = ctx.skipCh(s.ch) ? `<p class="fb-note">${icon('info', 15)}<span>${esc(OB.chName(s.ch))} is not connected yet, so this step is skipped and the flow carries on without it. Connect ${esc(OB.chName(s.ch))} to include it.</span></p>` : '';
      const rows = lengthRows(s, i, steps, got);
      /* Attio's record details: a grey label column and the value beside it */
      const attr = (label, value) => `<div class="fb-attr"><dt>${label}</dt><dd>${value}</dd></div>`;
      /* A comment answers their post, so it shows the post's date instead of the company news, and never a proof point */
      const cmt = isComment(s);
      const post = cmt && got && got.msg && !got.msg.skipped ? got.msg : null;
      const attrs = [
        attr('Who', `${esc(ex.title)} at ${esc(ex.company)}`),
        cmt
          ? attr('Their post', post ? `${esc(fmt.day(post.posted))} <span class="t-2">on ${esc(OB.chName(s.ch))}, ${esc(fmt.ago(post.posted))}</span>` : '<span class="t-2">None in the last 14 days</span>')
          : attr('Reason', ex.reason ? `${esc(ex.reason)} <span class="t-2">${esc(ex.source)}, ${esc(fmt.ago(ex.date))}</span>` : '<span class="t-2">No recent news, so the message says who you are and asks an easy question</span>'),
        proof && !cmt ? attr('Proof point', `${esc(proof.client)}, ${esc(proof.result)}`) : '',
        got && got.why ? attr('Why it says this', esc(got.why)) : '',
        attr('Length', `<ul class="fb-len" role="list">${rows.map((r) => `<li class="${r.ok ? 'is-ok' : 'is-bad'}">${icon(r.ok ? 'check' : 'alert', 14)}<span><span class="num">${esc(r.text)}</span>${r.note ? ` <span class="t-2">${esc(r.note)}</span>` : ''}</span><span class="sr-only">${r.ok ? ', within the limit' : ', over the limit'}</span></li>`).join('')}</ul>`),
      ].join('');
      body = `
        ${skipNote}
        ${messageCard(ctx, s, i, got, ex, person, who0)}
        ${stale ? `<p class="fb-note">${icon('info', 15)}<span>This example was written for the earlier instruction. Onbook writes each message from your new one.</span></p>` : ''}
        <dl class="fb-attrs" aria-label="About this example">${attrs}</dl>`;
    }
    return `<div class="fb-preview">
      <div class="fb-prev-head">
        <h${hl} class="fb-h" id="fb-preview-h" tabindex="-1">Preview</h${hl}>
        ${s ? `<span class="t-small t-2">Step ${i + 1} of ${steps.length}, ${esc(whenText(s, i, sch).replace(/^Day/, 'day').replace(/^After/, 'after'))}</span>` : ''}
      </div>
      ${seg}
      ${body}
    </div>`;
  }

  /* Which account a step sends from, and when: the composer's quiet footer line */
  function sendLine(ctx, s, i, skipped) {
    const { sch } = ctx;
    if (ctx.skipCh(s.ch)) return `Skipped until you connect ${OB.chName(s.ch)}`;
    const acc = D.accounts.find((a) => a.ch === s.ch);
    const from = !acc ? '' : s.ch === 'linkedin' ? ` from ${acc.name} on LinkedIn` : ` from ${acc.name}`;
    if (isComment(s)) return skipped ? `Skipped on day ${i === 0 ? 1 : sch[i].day}` : `Comments on day ${i === 0 ? 1 : sch[i].day}${from}, 1 credit`;
    const dm = typeOf(s) === 'dm' ? ', if they accept DMs' : '';
    if (i === 0) return `Sends on day 1${from}${dm}`;
    if (s.wait === 'accept') return `Sends when they accept, not before day ${sch[i].notBefore}${from}`;
    return `Sends on day ${sch[i].day}${from}${dm}`;
  }

  /* The example message as Attio's composer card: a small grey label, the recipient row with an avatar chip,
     the message in Inter 14px, and a quiet footer line. Onbook sends every message itself, so there are no buttons. */
  function messageCard(ctx, s, i, got, ex, person, who) {
    const t = typeOf(s);
    const enter = anim.msg ? ' is-enter' : '';
    const co = D.companies.find((c) => c.name === ex.company) || {};
    const chip = `<span class="fb-chip">${ui.avatar(ex.person, 'sm')}<span class="fb-chip-name">${who.html}</span></span>`;
    let detail;
    if (t === 'email') detail = who.masked ? 'work email, found the day before it sends' : (person.email || `${ex.person.split(' ')[0].toLowerCase()}@${co.domain || 'example.com'}`);
    else if (t === 'dm') detail = !who.masked && person.x ? person.x : 'on X';
    else detail = 'on LinkedIn';
    const toRow = `<div class="fb-row"><span class="fb-row-k">To</span>${chip}<span class="fb-row-v">${esc(detail)}</span></div>`;
    const foot = `<p class="fb-msg-foot">${OB.mark(s.ch, 13)}<span>${esc(sendLine(ctx, s, i))}</span></p>`;
    const label = `<p class="fb-msg-label">${esc(TYPES[t].label)}</p>`;
    if (isComment(s) && got) {
      const skipped = !got.msg || got.msg.skipped;
      const cfoot = skipped ? `<p class="fb-msg-foot">${OB.mark(s.ch, 13)}<span>${esc(sendLine(ctx, s, i, true))}</span></p>` : foot;
      return commentCard(s, got, ex, person, who, { enter, foot: cfoot, label });
    }
    if (!got) {
      return `<article class="fb-msg${enter}" aria-label="${esc(`${TYPES[t].label} to ${who.text}`)}, not written yet">
        ${label}
        <div class="fb-msg-box">
          ${toRow}
          <div class="fb-msg-body">
            <p class="t-2">Onbook writes this the day before it sends, from your instruction for this step:</p>
            <p class="fb-instr" id="fb-instr">${esc(String(s.purpose || '').trim() ? s.purpose : 'No instruction yet.')}</p>
          </div>
        </div>
        ${foot}
      </article>`;
    }
    const m = got.msg;
    if (t === 'email') {
      const euuk = /London|Manchester|Dublin|Berlin|Lisbon|Amsterdam|Paris|Madrid/.test(co.location || '');
      return `<article class="fb-msg fb-mail${enter}" aria-label="Example email to ${esc(who.text)}">
        ${label}
        <div class="fb-msg-box">
          ${toRow}
          <div class="fb-row fb-subj"><span class="sr-only">Subject: </span>${esc(m.subject || '')}</div>
          <div class="fb-msg-body">
            <div class="fb-text">${esc(m.body)}</div>
            <div class="fb-mail-foot">${esc(D.profile.address)}<br>Not relevant? Reply 'no' and I won't follow up.${euuk ? '<br>Your work details came from a business data provider. To be removed from Onbook, visit onbook.ai/remove-me.' : ''}</div>
          </div>
        </div>
        ${foot}
      </article>`;
    }
    const text = t === 'invite' && m.noNote
      ? '<p class="t-2">No note. The invite sends on its own, with your name and headline.</p>'
      : `<p class="fb-text">${esc(m.body)}</p>`;
    return `<article class="fb-msg${enter}" aria-label="Example ${esc(TYPES[t].label)} to ${esc(who.text)}">
      ${label}
      <div class="fb-msg-box">
        ${toRow}
        <div class="fb-msg-body">${text}</div>
      </div>
      ${foot}
    </article>`;
  }

  /* A comment's example: their post as it appears on LinkedIn or X, and Onbook's reply under it. When the example
     person hasn't posted in 14 days, the card says the step is skipped for them. */
  function commentCard(s, got, ex, person, who, { enter, foot, label }) {
    const m = got && got.msg;
    const first = String(ex.person).split(' ')[0];
    const chn = OB.chName(s.ch);
    if (!m || m.skipped) {
      return `<article class="fb-msg${enter}" aria-label="${esc(`Comment for ${who.text}, skipped`)}">
        ${label}
        <div class="fb-msg-box"><div class="fb-msg-body">
          <p class="fb-cmt-skip">${icon('minus', 14)}<span>Skipped for ${esc(first)}</span></p>
          <p class="t-2">${esc(first)} hasn't posted on ${esc(chn)} in the last 14 days, so there is nothing to comment on. The flow carries on and no credit is used.</p>
        </div></div>
        ${foot}
      </article>`;
    }
    const handle = s.ch === 'x' && !who.masked && person.x ? `<span class="t-2">${esc(person.x)}</span>` : '';
    const sub = s.ch === 'x' ? fmt.ago(m.posted) : `${ex.title} at ${ex.company}, ${fmt.ago(m.posted)}`;
    return `<article class="fb-msg fb-cmt${enter}" aria-label="${esc(`Example comment on a post by ${who.text}`)}">
      ${label}
      <div class="fb-msg-box">
        <div class="fb-post">
          <div class="fb-post-head">${ui.avatar(ex.person, 'sm')}<span class="fb-post-meta"><span class="fb-post-who"><span class="fb-post-name">${who.html}</span>${handle}</span><span class="fb-post-sub">${esc(sub)}</span></span></div>
          <p class="fb-post-text">${esc(m.post)}</p>
        </div>
        <div class="fb-reply">
          ${ui.avatar(D.me.name, 'sm')}
          <div class="fb-reply-body"><p class="fb-reply-who">${esc(D.me.name)} <span class="t-2">replied</span></p><p class="fb-text">${esc(m.body)}</p></div>
        </div>
      </div>
      ${foot}
    </article>`;
  }

  function lengthRows(s, i, steps, got) {
    const t = typeOf(s);
    const m = got && got.msg;
    if (isComment(s)) {
      if (!m) return [{ ok: true, text: 'One or two sentences', note: 'No pitch, no link' }];
      if (m.skipped) return [{ ok: true, text: 'Nothing to write', note: '' }];
      return [{ ok: true, text: OB.plural(words(m.body), 'word'), note: 'One or two sentences, no pitch, no link' }];
    }
    if (t === 'email') {
      const first = steps.findIndex((x) => x.ch === 'email') === i;
      const limit = first ? 110 : 70;
      const which = first ? 'the first email' : 'later emails';
      if (!m) return [{ ok: true, text: `At most ${limit} words`, note: `The limit for ${which}` }];
      const n = words(m.body);
      const sw = words(String(m.subject || '').replace(/^re:\s*/i, ''));
      return [
        { ok: n <= limit, text: `${n} of ${limit} words`, note: `At most ${limit} for ${which}` },
        { ok: sw >= 2 && sw <= 5, text: `Subject: ${OB.plural(sw, 'word')}`, note: '2 to 5 words' },
      ];
    }
    if (t === 'invite') {
      const premium = /premium/i.test((OB.get.account('a-li') || {}).provider || '');
      const limit = premium ? 300 : 200;
      const note = premium ? 'LinkedIn Premium. Free accounts allow 200' : 'Free LinkedIn account';
      if (!m) return [{ ok: true, text: `Note under ${limit} characters`, note }];
      if (m.noNote) return [{ ok: true, text: 'No note', note: 'A note is optional' }];
      const n = m.body.length;
      return [{ ok: n <= limit, text: `${n} of ${limit} characters`, note }];
    }
    if (t === 'dm') {
      const first = steps.findIndex((x) => x.ch === 'x') === i;
      if (!m) return [{ ok: true, text: first ? 'At most 50 words' : 'Short, no set limit', note: first ? 'The limit for the first X DM' : '' }];
      const n = words(m.body);
      return [first ? { ok: n <= 50, text: `${n} of 50 words`, note: 'At most 50 for the first X DM' } : { ok: true, text: OB.plural(n, 'word'), note: 'No set limit after the first X DM' }];
    }
    if (!m) return [{ ok: true, text: 'One or two lines', note: 'No set limit for LinkedIn messages' }];
    return [{ ok: true, text: OB.plural(words(m.body), 'word'), note: 'No set limit for LinkedIn messages' }];
  }

  /* ---------- Checks block ---------- */
  function checksBlock(ctx) {
    const { checks, key, hl, steps } = ctx;
    const bad = checks.filter((c) => !c.ok).length;
    const rows = checks.map((c) => {
      const go = !c.ok && c.bad && c.bad.length ? steps[c.bad[0]] : null;
      return `<li class="fb-check${c.ok ? ' is-ok' : ' is-bad'}">
        <span class="fb-check-mark" aria-hidden="true">${icon(c.ok ? 'check' : 'alert', 15)}</span>
        <span class="fb-check-text">
          <span class="fb-check-label">${esc(c.label)}<span class="sr-only">${c.ok ? ': passes.' : ': needs a fix.'}</span></span>
          <span class="fb-check-detail">${esc(c.ok ? c.detail : c.fix)}</span>
        </span>
        ${go ? `<button type="button" class="link-btn fb-check-go" data-action="flow-goto" data-arg="${esc(`${key}~${go.id}`)}">Show step ${steps.indexOf(go) + 1}</button>` : ''}
      </li>`;
    }).join('');
    return `<section class="card card-flush fb-checks" aria-labelledby="fb-checks-h">
      <div class="card-head">
        ${icon('shield', 16)}
        <h${hl} class="fb-h" id="fb-checks-h" tabindex="-1">Checks</h${hl}>
        <span class="link fb-checks-count${bad ? ' is-bad' : ''}">${bad ? `${bad} to fix` : `All ${checks.length} pass`}</span>
      </div>
      <ul class="fb-check-list" role="list">${rows}</ul>
      <p class="fb-checks-foot">Onbook also checks every message just before it sends: who it goes to, names, length, style, numbers, proof and links. A step on a channel someone can't be reached on is skipped, and steps send on weekdays inside working hours.${steps.some(isComment) ? ' Comments count against that channel\'s daily limits, and Onbook never comments on posts about health, politics, religion or personal life.' : ''}</p>
    </section>`;
  }

  /* ---------- Actions ---------- */
  const parse = (arg) => String(arg || '').split('~');
  const find = (key, id) => {
    const d = drafts()[key];
    if (!d) return {};
    const i = d.steps.findIndex((x) => x.id === id);
    return { d, s: d.steps[i], i };
  };
  const rerender = () => OB.render({ keepScroll: true });
  const scrollToEl = (el, block = 'nearest') => { if (el) el.scrollIntoView({ block, behavior: reduced() ? 'auto' : 'smooth' }); };

  OB.action('flow-select', (el, e, arg) => {
    const [key, id] = parse(arg);
    const d = drafts()[key];
    if (!d || !d.steps.some((s) => s.id === id)) return;
    if (selOf(key, d.steps) === id) setSel(key, id, !openOf(key));
    else { setSel(key, id, true); anim.msg = true; anim.sel = id; }
    if (openOf(key)) anim.editor = id;
    rerender();
    focusEl(`fb-head-${id}`);
  });

  OB.action('flow-type', (el, e, value) => {
    const [key, id] = parse(el.dataset.arg);
    const { d, s } = find(key, id);
    const T = TYPES[value];
    if (!s || !T) return;
    const wasComment = isComment(s);
    s.ch = T.ch; s.kind = T.kind;
    const back = value === s.orig.type;
    s.title = back ? s.orig.title : T.title;
    /* A comment always has an example post to show; other new types are written from the instruction */
    s.ex = back ? s.orig.ex : T.kind === 'comment' ? value : null;
    /* Between a message and a comment, an untouched instruction follows the new kind of step */
    const isNowComment = T.kind === 'comment';
    if (wasComment !== isNowComment) {
      const plain = [s.orig.purpose, TYPES['comment-li'].purpose].concat(TYPE_ORDER.map((k) => TYPES[k].purpose));
      if (plain.includes(s.purpose)) s.purpose = back ? s.orig.purpose : T.purpose;
    }
    if (value !== 'message' && s.wait === 'accept') s.wait = s.lastDays != null ? s.lastDays : 2;
    if (value === 'invite' || isNowComment) s.link = false;
    touch(d); anim.msg = true;
    rerender();
    announce(`Step changed to ${T.label}`);
  });

  OB.action('flow-waitmode', (el, e, arg) => {
    const [key, id, mode] = parse(arg);
    const { d, s } = find(key, id);
    if (!s) return;
    if (mode === 'accept' && s.wait !== 'accept') { s.lastDays = s.wait; s.wait = 'accept'; }
    else if (mode === 'days' && s.wait === 'accept') s.wait = s.lastDays != null ? s.lastDays : 2;
    else return;
    touch(d);
    rerender();
  });

  OB.action('flow-days', (el, e, arg) => {
    if (el.getAttribute('aria-disabled') === 'true') return;
    const [key, id, delta] = parse(arg);
    const { d, s } = find(key, id);
    if (!s || s.wait === 'accept') return;
    const next = clamp(Number(s.wait) + Number(delta), 0, MAX_WAIT);
    if (next === s.wait) return;
    s.wait = next;
    touch(d);
    rerender();
    announce(`${OB.plural(next, 'day')} after the step before`);
  });

  OB.action('flow-days-input', (el) => {
    const [key, id] = parse(el.dataset.arg);
    const { d, s } = find(key, id);
    if (!s || s.wait === 'accept') return;
    const v = el.value.replace(/\D/g, '');
    if (v === '') return; // let them finish typing; the change event restores the value
    s.wait = clamp(Number(v), 0, MAX_WAIT);
    touch(d);
    rerender();
  });
  OB.action('flow-days-commit', (el) => { if (el.value.replace(/\D/g, '') === '') rerender(); });

  OB.action('flow-purpose', (el) => {
    const [key, id] = parse(el.dataset.arg);
    const { d, s } = find(key, id);
    if (!s) return;
    const snap = () => [d.dirty, !!d.approvedAt, s.purpose === s.orig.purpose, !String(s.purpose).trim()].join();
    const before = snap();
    s.purpose = el.value;
    touch(d);
    if (snap() !== before) { rerender(); return; }
    const instr = document.getElementById('fb-instr');
    if (instr) instr.textContent = String(s.purpose).trim() ? s.purpose : 'No instruction yet.';
  });

  OB.action('flow-link', (el, e, checked) => {
    const [key, id] = parse(el.dataset.arg);
    const { d, s } = find(key, id);
    if (!s) return;
    s.link = !!checked;
    touch(d);
    rerender();
  });

  OB.action('flow-move', (el, e, arg) => {
    const [key, id, dir] = parse(arg);
    const { d, i } = find(key, id);
    if (!d || i < 0) return;
    const j = i + Number(dir);
    if (j < 0 || j >= d.steps.length) return;
    const [s] = d.steps.splice(i, 1);
    d.steps.splice(j, 0, s);
    touch(d);
    rerender();
    const btn = document.getElementById(el.id);
    if (!btn || btn.disabled) focusEl(Number(dir) < 0 ? `fb-down-${id}` : `fb-up-${id}`);
    scrollToEl(document.getElementById(`fb-step-${id}`));
    announce(`${s.title} moved to step ${j + 1}`);
  });

  OB.action('flow-remove', (el, e, arg) => {
    const [key, id] = parse(arg);
    const { d, s, i } = find(key, id);
    if (!s || d.steps.length <= 1) return;
    const sch = schedule(d.steps);
    const when = i === 0 ? 'day 1' : s.wait === 'accept' ? 'after they accept' : `day ${sch[i].day}`;
    OB.confirm({
      title: `Remove step ${i + 1}?`,
      body: esc(`The ${lowerTitle(s.title)} on ${when} comes out of this flow.${d.mode === 'campaign' ? ' Messages already sent never change.' : ''}`),
      confirmLabel: 'Remove step',
      danger: true,
      onConfirm: () => {
        const at = d.steps.indexOf(s);
        if (at < 0) return;
        /* A comment only adds a touch: taking it out gives its days back to the step after it, so no message moves */
        const after = d.steps[at + 1];
        const giveBack = isComment(s) && at > 0 && after && typeof after.wait === 'number' && typeof s.wait === 'number';
        const afterWait = after ? after.wait : null;
        d.steps.splice(at, 1);
        if (giveBack) after.wait = clamp(s.wait + after.wait, 0, MAX_WAIT);
        touch(d);
        const next = d.steps[Math.min(at, d.steps.length - 1)];
        setSel(key, next.id, false);
        anim.msg = true;
        rerender();
        focusEl(`fb-head-${next.id}`);
        OB.toast('Step removed', {
          undo: () => {
            const dd = drafts()[key];
            if (!dd || dd.steps.includes(s)) return;
            if (giveBack && dd.steps.includes(after)) after.wait = afterWait;
            dd.steps.splice(Math.min(at, dd.steps.length), 0, s);
            touch(dd);
            setSel(key, s.id, true);
            anim.editor = s.id; anim.msg = true;
            rerender();
            focusEl(`fb-head-${s.id}`);
          },
        });
      },
    });
  });

  /* The messages first, then the optional comments with their credit as a small tag (OB.menu prints hints as
     plain text, so the hint becomes a tag once the menu is drawn) */
  OB.action('flow-add-menu', (el, e, key) => {
    const btn = document.getElementById('fb-add');
    const item = (t) => ({ label: TYPES[t].label, hint: TYPES[t].hint, action: 'flow-add', arg: `${key}~${t}` });
    OB.menu(btn && el.tagName !== 'BUTTON' ? btn : el, TYPE_ORDER.filter((t) => TYPES[t].kind !== 'comment').map(item).concat({ sep: true }, TYPE_ORDER.filter((t) => TYPES[t].kind === 'comment').map(item)));
    const m = OB._menu && OB._menu.el;
    if (!m) return;
    m.classList.add('fb-add-menu');
    m.querySelectorAll('.menu-item').forEach((b) => {
      const t = parse(b.dataset.arg)[1];
      const hint = b.querySelector('.menu-hint');
      if (hint && TYPES[t] && TYPES[t].kind === 'comment') { hint.className = 'tag tag-grey fb-credit'; b.setAttribute('aria-label', `${TYPES[t].label}, costs 1 credit each`); }
    });
  });

  /* A comment goes the day before the first message on its channel, without moving that message when there is
     room; at the very start of a flow it becomes day 1 and the rest move a day later */
  function insertStep(d, t) {
    const T = TYPES[t];
    let id;
    do { d.seq = (d.seq || 0) + 1; id = `n${d.seq}`; } while (d.steps.some((s) => s.id === id));
    const step = { id, ch: T.ch, kind: T.kind, title: T.title, purpose: T.purpose, wait: 2, link: false, ex: T.kind === 'comment' ? t : null, orig: { type: t, title: T.title, purpose: T.purpose, ex: T.kind === 'comment' ? t : null } };
    let at = d.steps.length;
    if (!d.steps.length) step.wait = 0;
    else if (T.kind === 'comment') {
      const j = d.steps.findIndex((s) => s.ch === T.ch && !isComment(s));
      if (j === 0) { at = 0; step.wait = 0; d.steps[0].wait = 1; }
      else if (j > 0) {
        const next = d.steps[j];
        at = j;
        if (typeof next.wait === 'number' && next.wait >= 2) { step.wait = next.wait - 1; next.wait = 1; }
        else { step.wait = 1; if (next.wait !== 'accept') next.wait = 1; }
      }
    } else {
      const hasInvite = d.steps.some((s) => typeOf(s) === 'invite');
      const hasAccept = d.steps.some((s, i) => i > 0 && s.wait === 'accept');
      if (t === 'message' && hasInvite && !hasAccept) step.wait = 'accept';
    }
    d.steps.splice(at, 0, step);
    return { step, at };
  }

  OB.action('flow-add', (el, e, arg) => {
    const [key, t] = parse(arg);
    const d = drafts()[key];
    const T = TYPES[t];
    if (!d || !T) return;
    const { step, at } = insertStep(d, t);
    const id = step.id;
    touch(d);
    setSel(key, id, true);
    anim.editor = id; anim.msg = true; anim.sel = id;
    rerender();
    scrollToEl(document.getElementById(`fb-step-${id}`), 'center');
    focusEl(`fb-type-${id}`);
    OB.toast(`${T.label} added as step ${at + 1}`);
  });

  OB.action('flow-ex', (el, e, v) => {
    if (!D.examples[v]) return;
    anim.msg = true;
    OB.set({ flowEx: v });
  });

  OB.action('flow-goto', (el, e, arg) => {
    const [key, id] = parse(arg);
    const d = drafts()[key];
    if (!d || !d.steps.some((s) => s.id === id)) return;
    setSel(key, id, true);
    anim.editor = id; anim.msg = true; anim.sel = id;
    rerender();
    scrollToEl(document.getElementById(`fb-step-${id}`), 'center');
    focusEl(`fb-head-${id}`);
  });

  OB.action('flow-jump', (el, e, id) => {
    const t = document.getElementById(id);
    if (!t) return;
    scrollToEl(t, 'start');
    t.focus({ preventScroll: true });
  });

  OB.action('flow-save', (el, e, key) => {
    const d = drafts()[key];
    if (!d || !runChecks(d.steps).every((c) => c.ok)) return;
    save(d.flowId, d.mode);
    rerender();
    focusEl(`fb-head-${selOf(key, d.steps)}`);
    OB.toast('Flow saved and approved');
  });

  OB.action('flow-discard', (el, e, key) => {
    const d = drafts()[key];
    if (!d) return;
    drafts()[key] = toDraft(sourceOf(d.flowId), d.flowId, d.mode);
    rerender();
    focusEl(`fb-head-${selOf(key, drafts()[key].steps)}`);
    OB.toast('Changes discarded', { undo: () => { drafts()[key] = d; rerender(); } });
  });

  /* Arrow keys move between steps; Home and End jump to the first and last */
  document.addEventListener('keydown', (e) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key) || e.altKey || e.metaKey || e.ctrlKey) return;
    const btn = e.target && e.target.closest && e.target.closest('.fb-head');
    if (!btn) return;
    const all = [...document.querySelectorAll('.fb-head')];
    const i = all.indexOf(btn);
    const j = e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1 : e.key === 'Home' ? 0 : all.length - 1;
    if (j < 0 || j >= all.length || j === i) return;
    e.preventDefault();
    all[j].focus();
  });

  /* ---------- Saving and the shared API ---------- */
  function save(flowId, mode = 'campaign', targetId) {
    const d = getDraft(flowId, mode);
    const id = targetId || (flowId === 'default' ? 'f1' : flowId);
    const f = D.flows[id] || (D.flows[id] = { id });
    f.steps = toData(d);
    f.approved = todayStr();
    f.approvedBy = D.me.name;
    d.steps.forEach((s) => { s.orig = { type: typeOf(s), title: s.title, purpose: s.purpose, ex: s.ex }; });
    d.dirty = false;
    d.approvedAt = OB.TODAY;
    return id;
  }

  /* Demo states for the Screens menu: 'edited' leaves two checks failing so approval is blocked; 'comment' adds a
     comment on their latest post the day before the first X DM (or LinkedIn step) and shows its preview */
  function demo(flowId, mode = 'campaign', which = 'edited') {
    const key = keyOf(flowId, mode);
    const d = (drafts()[key] = toDraft(sourceOf(flowId), flowId, mode));
    if (which === 'edited') {
      const dm = d.steps.find((s) => s.ch === 'x');
      const email = d.steps.find((s) => s.ch === 'email');
      if (dm) dm.wait = 0;
      if (email) email.link = true;
      d.dirty = true;
      if (dm) setSel(key, dm.id, true);
    } else if (which === 'comment') {
      const { step } = insertStep(d, d.steps.some((s) => typeOf(s) === 'dm') ? 'comment-x' : 'comment-li');
      d.dirty = true;
      setSel(key, step.id, true);
      OB.state.ui.flowEx = 'strong';
    }
    return d;
  }

  /* The plan as a compact list for host pages such as setup's "Use this plan": one line per step with the channel
     mark, the step, its day and what it does. Without a mode it reads the working copy of the page it is on. */
  const hostMode = () => { const n = OB.parseHash().name; return /^setup/.test(n) ? 'setup' : n === 'new-campaign' ? 'new' : 'campaign'; };
  function planList({ flowId = 'f1', mode } = {}) {
    const m = mode || hostMode();
    const steps = getDraft(flowId, m).steps;
    if (!steps.length) return '<p class="fb-plan-empty">No steps yet.</p>';
    const sch = schedule(steps);
    const skip = (ch) => m === 'setup' && !!OB.connect && typeof OB.connect.isConnected === 'function' && !OB.connect.isConnected(ch);
    return `<ol class="fb-plan" role="list" aria-label="${esc(`The plan: ${summaryText(steps)}`)}">${steps.map((s, i) => {
      const off = skip(s.ch);
      const what = off ? `Skipped until you connect ${OB.chName(s.ch)}` : String(s.purpose || '').trim() || 'No instruction yet';
      return `<li class="fb-plan-row${off ? ' is-skipped' : ''}">
        <span class="fb-plan-mark" aria-hidden="true">${OB.mark(s.ch, 14)}</span>
        <span class="fb-plan-name"><span class="fb-plan-title">${esc(s.title)}</span>${isComment(s) ? `<span class="sr-only">, on ${esc(OB.chName(s.ch))}</span>${ui.tag('grey', '1 credit')}` : ''}</span>
        <span class="fb-plan-day">${esc(whenText(s, i, sch))}</span>
        <span class="fb-plan-what">${off ? icon('minus', 14) : ''}<span>${esc(what)}</span></span>
      </li>`;
    }).join('')}</ol>`;
  }

  OB.flowBuilder = {
    render,
    /* Read-only helpers for host pages (setup step 4, New campaign) */
    steps: (flowId, mode = 'campaign') => toData(getDraft(flowId, mode)),
    /* summary({ flowId, mode }) returns the plan as an HTML list; summary(flowId, mode) the one-line text */
    summary: (flowId, mode = 'campaign') => (flowId && typeof flowId === 'object' ? planList(flowId) : summaryText(getDraft(flowId, mode).steps)),
    checks: (flowId, mode = 'campaign') => runChecks(getDraft(flowId, mode).steps).map(({ id, label, ok, detail, fix }) => ({ id, label, ok, detail, fix })),
    valid: (flowId, mode = 'campaign') => runChecks(getDraft(flowId, mode).steps).every((c) => c.ok),
    blocker: (flowId, mode = 'campaign') => { const c = runChecks(getDraft(flowId, mode).steps).find((x) => !x.ok); return c ? c.fix : ''; },
    dirty: (flowId, mode = 'campaign') => !!getDraft(flowId, mode).dirty,
    approved: (flowId, mode = 'campaign') => !!getDraft(flowId, mode).approvedAt,
    /* Host pages call approve() from their own primary button; it returns false while a check fails */
    approve: (flowId, mode = 'campaign') => { const d = getDraft(flowId, mode); if (!runChecks(d.steps).every((c) => c.ok)) return false; d.approvedAt = OB.TODAY; return true; },
    save,
    reset: (flowId, mode = 'campaign') => { delete drafts()[keyOf(flowId, mode)]; },
    demo,
    defaultSteps: () => clone(DEFAULT_STEPS),
    /* "6 steps over 14 days, email, LinkedIn and X" for any saved flow ('default' for the shipped one) */
    describe: (flowId) => summaryText(toDraft(sourceOf(flowId), flowId, 'preview').steps),
  };
})();
