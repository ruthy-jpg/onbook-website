/* Site (v4, Attio): the public pages. The homepage follows attio.com: a centred hero (eyebrow pill, big
   headline, the website field), a product shot of the app in a window, a "Built for" grid of the four
   audiences, then bordered sections, each with a cobalt eyebrow, a two-tone heading and a product panel
   (the example story, the flow, the stop rule, the safety limits), pricing, questions and a last call to
   action. Also Pricing, Log in, Check your email, Remove me (for prospects) and the legal documents.
   Light only. The header's Get started is the ink button (brand book WebHeader) wherever the page's own main
   action is also Get started; pages with a different main action (log in, remove me) keep it secondary (quietHead). */
(function () {
  'use strict';
  const OB = window.OB;
  const { esc, icon, ui, fmt } = OB;
  const D = OB.data;

  OB.screen('Site', 'Homepage', 'site');
  OB.screen('Site', 'Pricing', 'pricing');
  OB.screen('Site', 'Remove me', 'remove-me');
  OB.screen('Site', 'Remove me: done', 'remove-me.done');
  OB.screen('Site', 'Privacy', 'legal.privacy');
  OB.screen('Site', 'Terms', 'legal.terms');
  OB.screen('Site', 'Data agreement', 'legal.dpa');
  OB.screen('Site', 'Subprocessors', 'legal.subprocessors');

  /* ---------- Small helpers ---------- */
  const st = () => OB.state.ui;
  const reduceMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const validEmail = (v) => /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(String(v || ''));
  const cleanSite = (v) => String(v || '').trim().replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/^www\./i, '').split(/[/?#]/)[0].toLowerCase();
  /* Renders are synchronous, so the field exists by the time this runs */
  const focusField = (id) => { const el = document.getElementById(id); if (el) el.focus(); };
  const firstName = (name) => String(name).split(' ')[0];
  /* Someone never contacted shows as first name and last initial, as everywhere in Onbook */
  const masked = (name) => { const [first, ...rest] = String(name).split(' '); return rest.length ? `${first}\u00a0${rest[rest.length - 1][0]}.` : first; };
  const monthOf = (s) => fmt.short(s).split(' ')[1];
  const byChannel = (ch) => ({ email: 'by email', linkedin: 'on LinkedIn', x: 'on X' }[ch] || '');
  const checks = (items, cls = '') => `<ul class="st-checks${cls ? ' ' + cls : ''}" role="list">${items.map((t) => `<li>${icon('check', 16)}<span>${t}</span></li>`).join('')}</ul>`;
  const eyebrow = (text) => `<p class="st-eyebrow">${esc(text)}</p>`;
  /* Attio's two-tone heading: the first sentence is the heading in near-black, the rest runs on in grey.
     `rest` is HTML. The heading takes focus when the page jumps to it. */
  const two = (tag, id, lead, rest, cls = '') => `<div class="st-two${cls ? ' ' + cls : ''}"><${tag} id="${id}" tabindex="-1">${esc(lead)}</${tag}>${rest ? ` <p>${rest}</p>` : ''}</div>`;
  /* A question list built on details and summary, so it works without script */
  const faqList = (items) => `<div class="st-faq">${items.map(([q, a]) => `
    <details class="st-q">
      <summary><span>${esc(q)}</span>${icon('plus', 16)}</summary>
      <div class="st-q-a">${a}</div>
    </details>`).join('')}</div>`;

  /* ---------- The worked examples, one per audience ----------
     Each starts with companies Onbook found that fit, each with its news (from "over 30,000" checked, the same
     figure for everyone, and never how many fit: Julian, 17 Oct), and follows one company from the dated reason
     to an intro call: your email, the reply in the prospect's own words, everyone else there stopping, and the
     call. All invented. */
  const AUDIENCES = ['web3', 'web2', 'services', 'saas'];
  const EX = {
    web3: {
      label: 'Web3 agency', who: 'a Web3 agency', co: 'Kestrel Exchange',
      lead: 'Kestrel Exchange raised an $8M seed round', source: 'CryptoRank', at: '2026-09-24',
      why: 'Written from the seed round and your perp DEX result.',
      to: { name: 'Maya Chen', title: 'Co-founder' },
      next: { name: 'Ben Ortiz', title: 'Head of Growth' },
      sent: { at: '2026-10-01T09:40', subject: "Kestrel's first traders", body: 'Saw Kestrel closed an $8M seed last month. One example: a top-10 perp DEX, $2.1B in trading volume in the first 90 days. Are you planning for your first traders now, or closer to launch?' },
      reply: { ch: 'x', at: '2026-10-07T09:12', body: 'ha, good timing. we open the book on 20 oct. happy to jump on a call next week' },
      call: '2026-10-14T11:00',
      list: [
        ['Kestrel Exchange', 'Raised an $8M seed round', '2026-09-24'],
        ['Orbit Lend', 'Mainnet launch set for 14 Oct', '2026-10-05'],
        ['Sable Exchange', 'Opened its testnet to traders', '2026-10-04'],
        ['Quanta Wallet', 'Raised a $12M Series A', '2026-09-28'],
        ['Atlas Perps', 'Points programme starts 20 Oct', '2026-09-26'],
        ['Lumen Markets', 'Announced a new options product', '2026-09-27'],
        ['Glasswing Pay', 'Raised a $9M seed round', '2026-10-02'],
        ['Juniper Pay', 'Launched in the United Kingdom', '2026-10-01'],
        ['Arcadia Wallet', 'Hiring a Growth Marketing Lead', '2026-10-02'],
      ],
    },
    web2: {
      label: 'Web2 agency', who: 'a Web2 agency', co: 'Brightloop',
      lead: 'Brightloop hired a VP of Marketing', source: 'LinkedIn', at: '2026-09-21',
      why: 'Written from the new role and your paid search result.',
      to: { name: 'Erin Cole', title: 'VP of Marketing' },
      next: { name: 'Owen Hart', title: 'Head of Growth' },
      sent: { at: '2026-09-29T10:05', subject: 'Paid search at Brightloop', body: 'Congrats on the new role at Brightloop. One example of our paid search work: a B2B software client, cost per demo down from $640 to $210 in two quarters. Is paid search on your list yet?' },
      reply: { ch: 'email', at: '2026-10-05T16:20', body: "Good timing. It's on my list, and our agency contract ends in December. Could you do a call next Tuesday?" },
      call: '2026-10-13T14:00',
      list: [
        ['Brightloop', 'Hired a VP of Marketing', '2026-09-21'],
        ['Parcelwise', 'Raised a $14M Series A', '2026-09-25'],
        ['Tallgrass HR', 'Hiring a Head of Marketing', '2026-10-02'],
        ['Quillpoint', 'Opened a Chicago office', '2026-09-28'],
        ['Kindred Ledger', 'Launched a self-serve plan', '2026-09-30'],
        ['Marlowe Analytics', 'Hired a Head of Growth', '2026-09-17'],
        ['Sundial CRM', 'Launched a partner programme', '2026-09-23'],
        ['Northfold', 'Raised a $6M seed round', '2026-09-19'],
        ['Brisk Billing', 'Hiring a Head of Paid Media', '2026-10-03'],
      ],
    },
    services: {
      label: 'B2B services', who: 'a B2B services firm', co: 'Cedar Grove Clinic',
      lead: 'Cedar Grove Clinic is hiring a billing specialist', source: 'Indeed', at: '2026-09-28',
      why: 'Written from the job post and your Lakeside Family Medicine result.',
      to: { name: 'Teresa Alvarez', title: 'Practice manager' },
      next: { name: 'Nolan Pierce', title: 'Owner' },
      sent: { at: '2026-09-29T08:30', subject: 'Billing at Cedar Grove', body: 'Saw Cedar Grove is hiring a billing specialist. One example of our work: Lakeside Family Medicine, claim denials down from 14% to 4% in 90 days. Who looks after denials while the role is open?' },
      reply: { ch: 'email', at: '2026-10-06T11:45', body: "We're behind on denials since our third location opened. Could we talk Thursday morning?" },
      call: '2026-10-08T09:30',
      list: [
        ['Cedar Grove Clinic', 'Hiring a billing specialist', '2026-09-28'],
        ['Riverside Dental', 'Opened a third location', '2026-09-22'],
        ['Maple Pediatrics', 'Hiring a practice manager', '2026-10-01'],
        ['Westbrook Ortho', 'Hiring two billing staff', '2026-09-30'],
        ['Summit Physio', 'Opened a new clinic', '2026-09-18'],
        ['Harborview Clinic', 'Added two physicians', '2026-09-24'],
        ['Oakridge Health', 'Opened a second location', '2026-09-26'],
        ['Bayside Urgent Care', 'Hiring a billing manager', '2026-10-02'],
        ['Northgate Dental', 'Hiring a front desk lead', '2026-09-29'],
      ],
    },
    saas: {
      label: 'SaaS', who: 'a SaaS team', co: 'Loomstack',
      lead: 'Loomstack launched an enterprise plan', source: 'the Loomstack blog', at: '2026-09-29',
      why: 'Written from the enterprise launch and your Pillar Payroll result.',
      to: { name: 'Arjun Patel', title: 'CTO' },
      next: { name: 'Hannah Brooks', title: 'VP of Engineering' },
      sent: { at: '2026-09-30T09:15', subject: 'SOC 2 for Loomstack', body: 'Saw Loomstack launched an enterprise plan this week. One example: Pillar Payroll, from no policies to a SOC 2 Type I report in 7 weeks. Is SOC 2 on the plan for your enterprise deals?' },
      reply: { ch: 'linkedin', at: '2026-10-07T08:40', body: 'Timely. Our first enterprise prospect sent a security questionnaire on Monday. Can we talk this week?' },
      call: '2026-10-09T11:00',
      list: [
        ['Loomstack', 'Launched an enterprise plan', '2026-09-29'],
        ['Relaybase', 'Raised a $10M Series A', '2026-09-24'],
        ['Inkwell Docs', 'Hiring a Head of Security', '2026-10-01'],
        ['Gridwise', 'Hiring an enterprise sales lead', '2026-09-30'],
        ['Hatchway', 'Launched SSO and audit logs', '2026-09-26'],
        ['Plinth', 'Opened an EU data centre', '2026-09-21'],
        ['Copperhead', 'Raised a $12M Series A', '2026-09-27'],
        ['Driftline', 'Launched an EU region', '2026-09-22'],
        ['Tessellate', 'Hiring a compliance lead', '2026-10-02'],
      ],
    },
  };
  const audience = () => (EX[st().siteAudience] ? st().siteAudience : 'web3');

  /* ---------- The waitlist form: work email and Join the waitlist. Used in the hero and at the end.
     Onbook is not open yet, so this replaces "Get started". After joining, the same spot says so and offers the Discord. ---------- */
  const CFG = window.ONBOOK_CONFIG || {};
  const discordBtn = (kind) => CFG.discordUrl ? `<a class="btn ${kind || 'btn-secondary'}" href="${esc(CFG.discordUrl)}" target="_blank" rel="noopener">Join the Discord community</a>` : '';
  function startForm(which, note) {
    const id = `st-site-${which}`;
    const s = st();
    if (s.waitlistDone) {
      return `<div class="st-start st-joined" role="status">
        <p class="st-joined-t">${icon('check', 16)}<span>You are on the waitlist. We will email ${esc(s.waitlistDone)} when Onbook opens.</span></p>
        ${CFG.discordUrl ? `<p class="st-start-note">Meet the team and other founders while you wait.</p><div class="st-start-row">${discordBtn('btn-primary')}</div>` : ''}
      </div>`;
    }
    const err = s.waitlistError && s.waitlistErrorAt === which ? s.waitlistError : '';
    return `<form class="st-start" data-submit="site-start" data-which="${which}" novalidate>
      <label class="sr-only" for="${id}">Your work email</label>
      <div class="st-start-row">
        <div class="input-group"><input class="input" id="${id}" name="email" type="email" autocomplete="email" autocapitalize="off" spellcheck="false" placeholder="sam@tideline.studio" value="${esc(s.waitlistEmail || '')}" data-input="site-url"${err ? ` aria-invalid="true" aria-describedby="${id}-err"` : ''}></div>
        <button type="submit" class="btn btn-primary">Join the waitlist</button>
      </div>
      ${err ? `<p class="field-error" id="${id}-err">${icon('alert', 16)}<span>${esc(err)}</span></p>` : ''}
      ${note ? `<p class="st-start-note">${note}</p>` : ''}
      ${CFG.discordUrl ? `<p class="st-start-note">or</p><div class="st-start-row">${discordBtn()}</div>` : ''}
    </form>`;
  }

  /* ---------- Homepage: hero (Proposed 17 Oct: the outcome and the search words, "AI outreach", in the headline;
     the two minutes in the pill and under the field) ---------- */
  function hero() {
    return `<section class="st-hero" aria-labelledby="page-title">
      <a class="st-pill" href="#pricing"><span>Opening soon. Join the waitlist</span>${icon('chevron-right', 14)}</a>
      <h1 class="st-display" id="page-title" tabindex="-1">AI outreach that books you sales meetings.</h1>
      <p class="st-hero-sub">Onbook finds companies with a reason to hear from you and writes to the right people from your own LinkedIn, X and email. It stops the moment anyone replies.</p>
      ${startForm('hero', 'Be first in line. Free until you launch.')}
    </section>`;
  }

  /* ---------- Homepage: the product demo ----------
     How little it takes, as a short loop in an app window: the website, the profile Onbook fills in, the
     companies it finds, the accounts, then Onbook outreaching and, the next morning, a reply. A chapter bar
     above it names each part with the time it takes, and lets you jump to one or pause. Nothing inside the
     window can be focused; the chapter bar and a hidden list say the same thing for screen readers. With
     reduced motion it starts paused and nothing moves. */
  /* The chapters: what happens, when it is done on the setup clock (seconds), and how long the loop shows it */
  const SCENES = [
    { label: 'Enter your website', clock: 0, ms: 3400 },
    { label: 'Onbook fills in your profile', clock: 14, ms: 3800 },
    { label: 'It finds companies that fit', clock: 41, ms: 3800 },
    { label: 'Connect your accounts', clock: 77, ms: 3400 },
    { label: 'Autopilot starts', clock: 112, ms: 5200 },
    { label: 'Replies come in', clock: null, ms: 5600 },
  ];
  const DEMO_SITE = 'tideline.studio';
  const demo = { i: 0, playing: null, timer: null, raf: null, sceneAt: 0 };
  const clockText = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

  /* The app on the campaign's Autopilot view, for the last two chapters: the ring fills as today's messages go out
     and the feed fills with what Onbook did; the next morning Maya Chen's reply tops the feed and the funnel moves */
  const FEED = [
    ['edit', 'Wrote today\'s 38 messages. All passed the checks.', '8:40 AM'],
    ['send', 'Sent LinkedIn invites to 5 new people at Vantage Rails, Sable Exchange and 3 more.', '10:31 AM'],
    ['mail', 'Followed up with Lena Fischer at Northpoint Credit by email.', '11:05 AM'],
    ['search', 'Found 4 companies that raised this week. They start tomorrow.', '11:40 AM'],
  ];
  function autoBody(reply) {
    const camp = OB.get.campaign('c1');
    const nav = [['home', 'Home'], ['inbox', 'Inbox'], ['campaigns', 'Campaigns'], ['contacts', 'Contacts'], ['settings', 'Settings']];
    const R = 22; const C = 2 * Math.PI * R;
    const ring = `<svg class="st-ap-ring" width="56" height="56" viewBox="0 0 56 56"><circle cx="28" cy="28" r="${R}" class="st-ap-ring-bg"/><circle cx="28" cy="28" r="${R}" class="st-ap-ring-fg" style="--c:${C.toFixed(1)}" stroke-dasharray="${C.toFixed(1)}" transform="rotate(-90 28 28)"/></svg>`;
    const row = ([ic, text, at], k, cls = '') => `<li class="st-ap-row${cls}" style="--k:${k}"><span class="st-ap-ic">${icon(ic, 13)}</span><span class="st-ap-text">${esc(text)}</span><span class="st-ap-t">${esc(at)}</span></li>`;
    const fun = [['30,000+', 'companies fit you', 1, ''], ['142', 'people reached', 0.74, ''], ['<span class="st-n0">14</span><span class="st-n1">15</span>', 'replied', 0.5, ''], ['4', 'meetings', 0.32, ' is-win']];
    return `<div class="st-win-body">
      <div class="st-w-side">
        <div class="st-w-ws">${ui.co(D.me.company)}<span>${esc(D.me.company)}</span>${icon('chevron-down', 14)}</div>
        <div class="st-w-search">${icon('search', 15)}<span>Search</span>${ui.kbd('\u2318K')}</div>
        <div class="st-w-nav">${nav.map(([ic, text]) => `<span>${icon(ic, 16)}<span>${text}</span>${ic === 'inbox' ? '<span class="count st-inbox-n"><span class="dot dot-needs"></span>1</span>' : ''}</span>`).join('')}</div>
        <p class="st-w-label">Campaign</p>
        <div class="st-w-nav st-w-camps"><span class="is-on"><span class="dot dot-live"></span><span>${esc(camp.name)}</span></span></div>
        <div class="st-w-foot">
          <span class="t-2">Credits this month</span>
          <span class="num"><strong>${fmt.num(D.plan.used)}</strong> <span class="t-2">of ${fmt.num(D.plan.allowance)} used</span></span>
          ${ui.meter(D.plan.used, D.plan.allowance)}
        </div>
      </div>
      <div class="st-w-main">
        <div class="st-w-bar">
          <span class="st-w-crumbs">Campaigns${icon('chevron-right', 14)}</span><span class="st-w-title">${esc(camp.name)}</span>${ui.status(camp.status)}
          <span class="st-w-actions"><span class="btn btn-secondary btn-sm">${icon('pause', 15)}<span>Pause campaign</span></span></span>
        </div>
        <div class="st-w-tabs"><span class="is-on">Autopilot</span><span>People</span><span>Results</span><span>Flow</span><span>Settings</span></div>
        <div class="st-ap">
          <div class="st-ap-status">${ring}<span class="st-ap-st"><strong><span class="st-ap-live"></span>Autopilot is on</strong><span class="t-2"><span class="st-n0">Sending today's messages, up to 15 to new people.</span><span class="st-n1">Next morning: 1 reply, with an answer drafted for you.</span></span></span></div>
          <div class="st-ap-grid">
            <div class="st-ap-card"><p class="st-ap-h">${icon('zap', 14)}What Onbook did<span class="st-ap-livetag"><span class="st-ap-live"></span>Live</span></p>
              <ul class="st-ap-feed">
                <li class="st-ap-row st-ap-reply"><span class="st-ap-ic">${icon('message', 13)}</span><span class="st-ap-text">Maya Chen at Kestrel Exchange replied on X: &ldquo;${esc((reply || '').slice(0, 64))}&hellip;&rdquo; Your reply is drafted.</span><span class="st-ap-t">9:12 AM</span></li>
                ${FEED.slice().reverse().map((f, k) => row(f, FEED.length - 1 - k)).join('')}
              </ul>
            </div>
            <div class="st-ap-card"><p class="st-ap-h">${icon('target', 14)}So far</p>
              <ol class="st-ap-fun">${fun.map(([n, label, w, cls], k) => `<li class="st-ap-fbar${cls}" style="--w:${w};--k:${k}"><span class="num">${n}</span><span>${esc(label)}</span></li>`).join('')}</ol>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  /* A setup card in the window: a title and its contents, centred on the grey window */
  const setupCard = (title, body, foot = '') => `<div class="st-dc"><p class="st-dc-h">${title}</p>${body}${foot ? `<div class="st-dc-foot">${foot}</div>` : ''}</div>`;
  const tok = (t, k) => `<span class="su-token su-token-static st-pop" style="--k:${k}">${esc(t)}</span>`;

  function demoScenes() {
    const P = D.profile;
    const S = D.setup;
    const cos = S.list.slice(0, 5).map((id) => OB.get.company(id)).filter(Boolean);
    const t = OB.get.thread('t1');
    const reply = t ? t.messages.filter((m) => m.dir === 'in').slice(-1)[0] : null;
    const acc = [['linkedin', 'LinkedIn', D.me.name], ['email', 'Email', D.me.email || 'sam@tideline.studio'], ['x', 'X', '@samrivera'], ['calendar', 'Calendar', P.booking || 'cal.com']];
    let k = 0;
    const row = (label, tags) => `<div class="st-dc-row"><span class="st-dc-k">${label}</span><span class="st-dc-tags">${tags.map((x) => tok(x, k++)).join('')}</span></div>`;
    return [
      setupCard('Start with your website', `<div class="st-dc-site"><span class="input-group st-dc-input"><span class="prefix">https://</span><span class="input"><span id="st-demo-type"></span><span class="st-caret"></span></span></span><span class="btn btn-primary st-dc-go">Get started</span></div>
        <p class="st-dc-note">That's all Onbook needs to start.</p>`),
      setupCard('Here\'s what Onbook understood', `<div class="st-dc-rows">
          <div class="st-dc-row"><span class="st-dc-k">What you sell</span><span class="st-dc-v st-pop" style="--k:0">${esc(S.read && S.read.sellShort ? S.read.sellShort : P.sell)}</span></div>
          ${row('Who you sell to', P.industries.slice(0, 4))}
          ${row('Where they are', ['United States', 'United Kingdom', 'European Union'])}
          ${row('Who to contact', P.titles.slice(0, 3))}
        </div>`, `<span class="btn btn-primary btn-sm">Save and continue</span>`),
      setupCard('10 companies we believe fit you', `<ul class="st-dc-cos" role="list">${cos.map((co, i) => `<li class="st-pop" style="--k:${i}">${ui.co(co.name)}<span class="st-dc-co"><strong>${esc(co.name)}</strong><span class="t-2">${esc(co.news ? co.news.text : co.location)}</span></span></li>`).join('')}</ul>`, '<span class="t-2">From 30,000+ that fit your profile</span><span class="btn btn-primary btn-sm">Continue</span>'),
      setupCard('Where Onbook sends from', `<ul class="st-dc-accs" role="list">${acc.map(([ch, name, who], i) => `<li style="--k:${i}">${OB.mark(ch, 16)}<span class="st-dc-co"><strong>${esc(name)}</strong><span class="t-2">${esc(who)}</span></span><span class="st-dc-conn"><span class="btn btn-secondary btn-sm st-dc-c1">Connect</span><span class="tag tag-green st-dc-c2">${icon('check', 12)}Connected</span></span></li>`).join('')}</ul>`, '<span class="btn btn-primary btn-sm">Subscribe and launch</span>'),
      autoBody(reply ? reply.body : ''),
    ];
  }

  function demoHtml() {
    const sc = demoScenes();
    const i = demo.i;
    const playing = demo.playing !== false;
    const desc = 'An example of setting up Onbook in about two minutes: enter your website, Onbook fills in your profile, finds companies that fit, you connect your accounts, and it starts reaching out. The next morning, a reply is waiting.';
    return `<div class="st-shot st-demo" id="st-demo">
      <div class="st-chapters" role="group" aria-label="Setting up Onbook, step by step">
        <ol class="st-chap-list">${SCENES.map((s, n) => `<li><button type="button" class="st-chap${n === i ? ' is-on' : ''}${n < i ? ' is-done' : ''}" id="st-chap-${n}" data-action="site-demo-go" data-arg="${n}" aria-pressed="${n === i}">
          <span class="st-chap-bar" aria-hidden="true"><span></span></span>
          <span class="st-chap-t num">${s.clock == null ? 'Next day' : clockText(s.clock)}</span>
          <span class="st-chap-l">${esc(s.label)}</span>
        </button></li>`).join('')}</ol>
        <button type="button" class="btn btn-ghost btn-sm btn-icon st-chap-play" id="st-demo-play" data-action="site-demo-play" aria-label="${playing ? 'Pause the demo' : 'Play the demo'}">${icon(playing ? 'pause' : 'play', 16)}</button>
      </div>
      <div class="st-win st-demo-win" role="img" aria-label="${esc(desc)}">
        <div class="st-win-in" aria-hidden="true">
          <div class="st-win-bar"><span></span><span></span><span></span><span class="st-clock" id="st-clock"></span></div>
          <div class="st-stage" id="st-stage" data-scene="${i}">
            ${sc.slice(0, 4).map((h, n) => `<div class="st-scene st-scene-setup${n === i ? ' is-on' : ''}" data-s="${n}">${h}</div>`).join('')}
            <div class="st-scene st-scene-app${i >= 4 ? ' is-on' : ''}${i === 5 ? ' is-reply' : ''}" data-s="4">${sc[4]}</div>
          </div>
        </div>
      </div>
      <p class="st-shot-note">An example workspace. Every company and person in it is invented.</p>
    </div>`;
  }

  /* Show chapter n: mark it in the bar and the stage, restart its animations, run its clock and typing */
  function demoShow(n) {
    const root = document.getElementById('st-demo');
    if (!root) return false;
    demo.i = n;
    demo.sceneAt = performance.now();
    root.querySelectorAll('.st-chap').forEach((b, k) => {
      b.classList.toggle('is-on', k === n); b.classList.toggle('is-done', k < n); b.setAttribute('aria-pressed', String(k === n));
      const bar = b.querySelector('.st-chap-bar > span');
      if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; bar.style.animationDuration = `${SCENES[k].ms}ms`; }
    });
    root.classList.toggle('is-paused', demo.playing === false);
    const stage = document.getElementById('st-stage');
    stage.dataset.scene = String(n);
    stage.querySelectorAll('.st-scene').forEach((el) => {
      const on = Number(el.dataset.s) === n || (el.classList.contains('st-scene-app') && n >= 4);
      const was = el.classList.contains('is-on');
      el.classList.toggle('is-on', on);
      if (el.classList.contains('st-scene-app')) el.classList.toggle('is-reply', n === 5);
      if (on && (!was || el.dataset.s === String(n))) { el.classList.remove('is-anim'); void el.offsetWidth; el.classList.add('is-anim'); }
    });
    /* Typing the website */
    const typed = document.getElementById('st-demo-type');
    if (typed) {
      typed.textContent = n === 0 && demo.playing !== false ? '' : DEMO_SITE;
      if (n === 0 && demo.playing !== false) DEMO_SITE.split('').forEach((ch, k) => setTimeout(() => { if (demo.i === 0 && typed.isConnected) typed.textContent = DEMO_SITE.slice(0, k + 1); }, 350 + k * 95));
    }
    tickClock();
    return true;
  }
  /* The setup clock in the window bar: counts from this chapter's time to the next one's while it plays */
  function tickClock() {
    cancelAnimationFrame(demo.raf);
    const el = document.getElementById('st-clock');
    if (!el) return;
    const s = SCENES[demo.i];
    if (s.clock == null) { el.textContent = 'Next morning, 9:12 AM'; return; }
    const next = SCENES[demo.i + 1] && SCENES[demo.i + 1].clock != null ? SCENES[demo.i + 1].clock : s.clock;
    const run = () => {
      if (!el.isConnected) return;
      const k = demo.playing === false ? 0 : Math.min(1, (performance.now() - demo.sceneAt) / s.ms);
      el.textContent = `${demo.i >= 4 ? 'Set up in' : 'Setup time'} ${clockText(s.clock + (next - s.clock) * k)}`;
      if (k < 1) demo.raf = requestAnimationFrame(run);
    };
    run();
  }
  function demoSchedule() {
    clearTimeout(demo.timer);
    if (demo.playing === false) return;
    demo.timer = setTimeout(() => {
      if (!document.getElementById('st-demo')) return;
      demoShow((demo.i + 1) % SCENES.length);
      demoSchedule();
    }, SCENES[demo.i].ms);
  }
  function demoStart() {
    if (demo.playing === null) demo.playing = !reduceMotion();
    if (demoShow(demo.i)) demoSchedule();
  }
  OB.action('site-demo-go', (el, e, n) => { demoShow(Number(n)); demoSchedule(); });
  OB.action('site-demo-play', () => {
    demo.playing = demo.playing === false;
    const b = document.getElementById('st-demo-play');
    if (b) { b.setAttribute('aria-label', demo.playing ? 'Pause the demo' : 'Play the demo'); b.innerHTML = icon(demo.playing ? 'pause' : 'play', 16); }
    demoShow(demo.i);
    demoSchedule();
  });

  /* ---------- Homepage: Built for (Attio's logo grid, with words). Each cell opens that audience's example ---------- */
  const FOR = [
    ['web3', 'zap', 'Web3 agencies', 'Raises, launches and listings'],
    ['web2', 'globe', 'Web2 agencies', 'Proof without naming clients'],
    ['services', 'building', 'B2B services', 'Set up once, then it runs'],
    ['saas', 'layers', 'SaaS', 'Never your own customers'],
  ];
  function builtFor() {
    return `<section class="st-for" aria-labelledby="st-for-h">
      <h2 class="st-for-h" id="st-for-h">Built for B2B teams with high-value deals</h2>
      <ul class="st-for-grid" role="list">${FOR.map(([key, ic, name, sub]) => `<li><button type="button" class="st-for-cell" data-action="site-for" data-arg="${key}">
        <span class="st-for-name">${icon(ic, 18)}<span>${esc(name)}</span></span>
        <span class="st-for-sub">${esc(sub)}</span>
        <span class="st-for-go" aria-hidden="true">${icon('arrow-right', 14)}</span>
        <span class="sr-only">, see an example</span>
      </button></li>`).join('')}</ul>
    </section>`;
  }

  /* ---------- How it works: four ideas, each a two-tone heading and a product panel ---------- */
  function exampleFig(key, on) {
    const x = EX[key];
    const when = (s, withTime) => `<time datetime="${esc(s)}">${esc(withTime ? fmt.dt(s) : fmt.day(s))}</time>`;
    const rows = x.list.map(([name, reason, date]) => {
      const me = name === x.co;
      return `<tr${me ? ' class="is-selected"' : ''}>
        <td><span class="rec">${ui.co(name, 'sm')}<span>${esc(name)}</span></span>${me ? '<span class="sr-only">, the company in this example</span>' : ''}</td>
        <td class="t-2" title="${esc(`${reason}, ${fmt.day(date)}`)}">${esc(reason)}</td>
      </tr>`;
    }).join('');
    /* What Onbook found first, then the companies that fit, each with its news. The button is part of the picture */
    return `<figure class="st-ex-fig${on ? '' : ' is-off'}" id="st-ex-${key}" aria-label="Example for ${esc(x.who)}: companies that fit, from over 30,000 checked, then ${esc(x.co)}, from the news to an intro call">
      <div class="card card-flush st-list">
        <div class="card-head">${icon('building', 16)}<span class="t-heading">Companies that fit you</span><span class="count">30,000+</span></div>
        <p class="st-l-sum">${icon('search', 15)}<span>Onbook checked <span class="t-ink num">over 30,000</span> companies. Here are some that fit, each with its news. It finds more every day.</span></p>
        <div class="table-wrap"><table class="table table-grid st-l-table">
          <caption class="sr-only">Companies that fit in this example, with their news</caption>
          <thead><tr><th scope="col">Company</th><th scope="col">Reason</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
        <div class="st-l-foot"><span class="st-fake is-ink" aria-hidden="true">Continue</span></div>
      </div>
      <div class="card card-flush st-compose">
        <div class="st-c-head">
          <p class="st-c-label">Found on ${esc(x.source)}, ${when(x.at)}</p>
          <p class="st-c-title">${esc(x.lead)}</p>
          <p class="st-c-why">${esc(x.why)}</p>
        </div>
        <div class="st-c-mail">
          <p class="st-c-to"><span class="t-2">To</span><span class="rec">${ui.avatar(x.to.name, 'sm')}<span>${esc(x.to.name)}</span></span><span class="t-2 st-c-role">${esc(x.to.title)}</span></p>
          <p class="st-c-subj">${esc(x.sent.subject)}</p>
          <div class="st-c-body"><p>Hi ${esc(firstName(x.to.name))},</p><p>${esc(x.sent.body)}</p></div>
        </div>
        <p class="st-c-sent">${icon('check', 15)}<span>Onbook sent it from your inbox</span>${when(x.sent.at, true)}</p>
        <div class="st-c-reply" data-reveal="1">
          <p class="st-c-meta">${ui.avatar(x.to.name, 'sm')}<span><span class="t-strong">${esc(firstName(x.to.name))} replied</span> <span class="t-2">${byChannel(x.reply.ch)}</span></span>${when(x.reply.at, true)}</p>
          <blockquote class="st-c-quote"><p>${esc(x.reply.body)}</p></blockquote>
          <p class="st-c-stop" data-reveal="2">${icon('hand', 15)}<span>Messages to ${esc(x.co)} stopped. ${esc(masked(x.next.name))}, ${esc(x.next.title)}, won't be contacted.</span></p>
        </div>
        <div class="st-c-call" data-reveal="3">
          <span class="st-cal" aria-hidden="true"><span>${esc(monthOf(x.call))}</span><span class="num">${OB.d(x.call).getDate()}</span></span>
          <span class="st-c-what"><span class="t-strong">Intro call with ${esc(x.to.name)}</span><time class="t-small t-2 num" datetime="${esc(x.call)}">${esc(fmt.dt(x.call))}</time></span>
          ${ui.stage('booked')}
        </div>
      </div>
    </figure>`;
  }

  /* The four examples share one grid cell, so switching never changes the panel's height.
     Only the current one is visible (the others are hidden from sight and from screen readers). */
  function storyPanel() {
    const cur = audience();
    return `<div class="st-story">
      <div class="st-story-top">
        <span class="t-small t-2" id="st-aud-label">Example for</span>
        <div class="seg st-aud" role="group" aria-labelledby="st-aud-label">${AUDIENCES.map((k) => `<button type="button" id="st-aud-${k}" aria-pressed="${k === cur}" aria-controls="st-ex-${k}" data-action="site-audience" data-arg="${k}">${esc(EX[k].label)}</button>`).join('')}</div>
      </div>
      <div class="st-ex-stack">${AUDIENCES.map((k) => exampleFig(k, k === cur)).join('')}</div>
      <p class="st-panel-note">An example. The companies, people and results are invented.</p>
    </div>`;
  }

  /* The recommended flow as Attio draws a workflow: node cards joined by lines on a dotted canvas, one click to
     accept it above, and the optional comment step below. The buttons are part of the picture */
  function flowPanel() {
    const flow = OB.get.flow('f1');
    const ex = D.examples;
    const people = [ex.strong, ex.weak, ex.none];
    return `<div class="st-canvas">
      <div class="st-canvas-top">
        ${ui.tag('blue', 'Recommended')}<span class="t-small t-2">${flow.steps.length} steps over 14 days, on email, LinkedIn and X</span>

      </div>
      <ol class="st-nodes" aria-label="The recommended flow: ${flow.steps.length} steps over 14 days">${flow.steps.map((s, i) => `<li class="st-node${i === 0 ? ' is-start' : ''}">
        ${i === 0 ? '<span class="st-node-tab" aria-hidden="true">Start</span>' : ''}
        <span class="st-node-ic st-ic-${s.ch}">${OB.mark(s.ch, 14)}</span>
        <span class="st-node-text"><span class="st-node-t">${esc(s.title)}</span><span class="st-node-s">${esc(s.when)}</span></span>
      </li>`).join('')}</ol>
      <div class="st-opt">
        <span class="st-node-ic">${icon('message', 14)}</span>
        <span class="st-node-text"><span class="st-node-t">Comment on their latest post</span><span class="st-node-s">On LinkedIn or X, 1 credit. Skipped if they haven't posted in 14 days.</span></span>
        ${ui.tag('outline', 'Optional')}
      </div>
      <p class="st-canvas-foot"><span class="t-2">Previewed on</span>${people.map((p) => `<span class="st-pchip">${ui.avatar(p.person, 'sm')}<span>${esc(p.person)}</span><span class="t-2">${esc(p.label.toLowerCase())}</span></span>`).join('')}</p>
    </div>`;
  }

  /* The stop rule: a reply stops the whole company; an out-of-office only pauses one person */
  function stopPanel() {
    const flow = OB.get.flow('f1');
    const co = OB.get.company('kestrel');
    const people = OB.get.peopleAt('kestrel');
    const cancelled = people.reduce((n, p) => n + p.progress.filter((s) => s === 'stopped').length, 0);
    const jonas = OB.get.person('p-jonas');
    const bank = OB.get.company(jonas.company);
    const auto = OB.get.thread('t6');
    const row = (p) => `<li class="st-prow">${ui.avatar(p.revealed ? p.name : masked(p.name))}<span class="st-prow-who"><span class="st-prow-name">${ui.person(p)}</span><span class="t-2 truncate">${esc(p.title)}</span></span>${ui.stage(p.stage)}<span class="st-prow-strip">${ui.strip(flow.steps, p.progress)}</span></li>`;
    const head = (c) => `<div class="card-head">${ui.co(c.name, 'sm')}<span class="t-heading">${esc(c.name)}</span><span class="link">${esc(c.domain)}</span></div>`;
    return `<div class="st-stack">
      <div class="card card-flush">
        ${head(co)}
        <p class="st-rec-note">${icon('hand', 15)}<span><span class="t-ink">Every message to ${esc(co.name)} stopped ${esc(fmt.dt(co.stopped.at))}.</span> ${esc(co.stopped.why)}, so ${cancelled} scheduled messages were cancelled on email, LinkedIn and X.</span></p>
        <ul class="st-prows" role="list">${people.map(row).join('')}</ul>
      </div>
      <div class="card card-flush">
        ${head(bank)}
        <p class="st-rec-note">${icon('clock', 15)}<span><span class="t-ink">An out-of-office reply only pauses that person.</span> ${esc(firstName(jonas.name))} is back on Tue 13 Oct, and the flow carries on ${esc(fmt.day(auto.pausedUntil))}.</span></p>
        <ul class="st-prows" role="list">${row(jonas)}</ul>
      </div>
    </div>`;
  }

  /* Safety: the daily limits as a small table (what Onbook suggests, and the most a user can set after accepting
     the risk), and the checks every message passes */
  function safePanel() {
    /* channel, account (and what the limit is per), suggested new people and all sends a day, then the maximum of each (spec section 6) */
    const limits = [['email', 'Email', 'per inbox', 15, 40, 30, 60], ['linkedin', 'LinkedIn', '', 15, 40, 25, 60], ['x', 'X', '', 10, 20, 20, 40]];
    const list = [
      'Nobody at the company has replied or booked',
      'Not a client, an opt-out or on Never contact',
      'Every number matches your proof or the news',
      'Nothing made up, no leftover placeholders',
      'One message a person a day, in working hours',
    ];
    return `<div class="st-pair st-pair-safe">
      <section class="card card-flush" aria-labelledby="st-lim-h">
        <div class="card-head">${icon('shield', 16)}<h4 id="st-lim-h">Daily limits</h4><span class="link">Per account</span></div>
        <div class="table-wrap"><table class="table table-grid st-limits">
          <caption class="sr-only">Daily limits for each account: the number Onbook suggests, and the most you can set if you accept the risk. New means new people; sends include follow-ups.</caption>
          <colgroup><col></colgroup><colgroup span="2"></colgroup><colgroup span="2"></colgroup>
          <thead>
            <tr><th scope="col" rowspan="2">Account</th><th scope="colgroup" colspan="2" class="st-lim-g">Suggested</th><th scope="colgroup" colspan="2" class="st-lim-g">Maximum</th></tr>
            <tr><th scope="col" class="col-num">New</th><th scope="col" class="col-num">Sends</th><th scope="col" class="col-num">New</th><th scope="col" class="col-num">Sends</th></tr>
          </thead>
          <tbody>${limits.map(([ch, name, per, fresh, all, maxFresh, maxAll]) => `<tr><th scope="row"><span class="rec">${OB.mark(ch, 15)}<span>${esc(name)}${per ? `<span class="st-lim-per"><span class="st-lim-c">, </span>${esc(per)}</span>` : ''}</span></span></th><td class="col-num num st-lim-on">${fresh}</td><td class="col-num num st-lim-on">${all}</td><td class="col-num num">${maxFresh}</td><td class="col-num num">${maxAll}</td></tr>`).join('')}</tbody>
        </table></div>
        <p class="st-card-foot">Going above the suggestion asks you to accept the risk first.</p>
      </section>
      <section class="card card-flush" aria-labelledby="st-chk-h">
        <div class="card-head">${icon('check', 16)}<h4 id="st-chk-h">Checks before every send</h4></div>
        ${checks(list.map(esc), 'st-checks-rows')}
        <p class="st-card-foot">A message that fails is rewritten or held. It never goes out as it was.</p>
      </section>
    </div>`;
  }

  const SUBS = [
    { id: 'st-story', nav: 'Companies that fit', lead: 'Onbook checks over 30,000 companies. You see who fits.', rest: 'Each comes with a dated reason to buy now that you can check. Onbook writes to them from your own accounts every weekday and keeps finding more. The replies and calls come straight to you.', panel: storyPanel },
    { id: 'st-flow', nav: 'The plan', lead: 'Onbook has the plan ready. Keep it or change any step.', rest: 'The steps, channels and timing that suit your accounts, with an example of each message on three people it found. Change anything you like. Onbook writes each message the day before and checks it before it sends.', panel: flowPanel, dots: true },
    { id: 'st-stop', nav: 'Stop on a reply', lead: 'A reply stops the whole company.', rest: 'Onbook writes to one person at each company at a time, best fit first. When anyone there replies or books, every message to that company stops, on every channel and campaign, for every teammate.', panel: stopPanel },
    { id: 'st-safe', nav: 'Keep accounts safe', lead: 'Careful with your accounts.', rest: "Onbook sends at a person's pace, on weekdays inside working hours. It suggests a safe daily limit for each account. Lower it any time, or raise it to a set maximum if you accept the risk; Onbook still pauses at the first warning.", panel: safePanel },
  ];

  function howBand() {
    return `<section class="st-band" aria-labelledby="st-how-h">
      <header class="st-band-head">
        ${eyebrow('How it works')}
        ${two('h2', 'st-how-h', 'Onbook does the work. You take the calls.', 'It checks over 30,000 companies, finds the ones with a reason to hear from you and has the plan ready. Set it up in two minutes, then answer the replies.')}
      </header>
      <div class="st-how">
        <div class="st-how-side">
          <nav class="st-subnav" aria-label="How it works">${SUBS.map((s, i) => `<button type="button" data-action="site-jump" data-arg="${s.id}"${i === 0 ? ' aria-current="true"' : ''}>${esc(s.nav)}</button>`).join('')}</nav>
        </div>
        <div class="st-subs">${SUBS.map((s) => `<section class="st-sub" id="${s.id}" aria-labelledby="${s.id}-h">
          <div class="st-sub-text">${two('h3', `${s.id}-h`, s.lead, esc(s.rest), 'st-two-sm')}</div>
          <div class="st-panel${s.dots ? ' st-panel-dots' : ''}">${s.panel()}</div>
        </section>`).join('')}</div>
      </div>
    </section>`;
  }

  /* ---------- Credits (spec section 8): what costs one, for the homepage card and the Pricing table, and the packs ---------- */
  const COSTS = [
    ['Building your list', 0, 'Finding, checking and researching companies'],
    ['A new person', 1, 'The day before their first message, when Onbook buys their contact details'],
    ['A comment on their latest post', 1, "An optional step. Skipped if they haven't posted in 14 days"],
    ['Follow-ups', 0, 'Every later step in the flow'],
    ['Replies and bookings', 0, 'Whenever they happen'],
  ];
  const cost = (n) => (n ? `${n} credit` : 'Free');
  const PACKS = [[100, 25], [300, 75], [500, 125]];

  /* ---------- Homepage: pricing, questions and the last call to action ---------- */
  function priceBand() {
    const p = D.plan;
    const included = [
      `${fmt.num(p.allowance)} credits a month`,
      'Email, LinkedIn and X, from your own accounts',
      'Unlimited campaigns and lists',
      'The Inbox, with every reply and booking',
    ];
    return `<section class="st-band" aria-labelledby="st-price-h">
      <header class="st-band-head">
        ${eyebrow('Pricing')}
        ${two('h2', 'st-price-h', `One plan, ${fmt.money(p.price)} a month.`, 'Build your first campaign free and pay when you launch. Follow-ups, replies and bookings never cost a credit.')}
      </header>
      <div class="st-panel">
        <div class="st-pair st-pair-even">
          <section class="card st-plan" aria-labelledby="st-plan-h">
            <div class="st-plan-top"><h3 class="st-plan-name" id="st-plan-h">Onbook</h3><span class="t-small t-2">One plan, per person</span></div>
            <p class="st-price"><span class="st-price-n num">${fmt.money(p.price)}</span><span class="t-2">a month</span></p>
            <p class="t-small t-2">Or ${fmt.money(p.annualPrice)} a month, billed yearly. Extra credits are ${fmt.money(PACKS[0][1])} for ${PACKS[0][0]}.</p>
            ${ui.btn({ label: 'See pricing', href: '#pricing', block: true })}
            ${checks(included.map(esc), 'st-checks-plain')}
          </section>
          <section class="card card-flush" aria-labelledby="st-count-h">
            <div class="card-head">${icon('card', 16)}<h3 id="st-count-h">What costs credits</h3><span class="link st-hide-xs">From your ${fmt.num(p.allowance)} a month</span></div>
            <div class="table-wrap"><table class="table table-grid st-count">
              <caption class="sr-only">What costs credits from your ${fmt.num(p.allowance)} a month</caption>
              <thead><tr><th scope="col">What</th><th scope="col">Cost</th></tr></thead>
              <tbody>${COSTS.map(([what, n]) => `<tr${n ? ' class="is-count"' : ''}><th scope="row">${esc(what)}</th><td>${cost(n)}</td></tr>`).join('')}</tbody>
            </table></div>
            <p class="st-card-foot">If Onbook buys someone's details but never messages them, you get the credit back.</p>
          </section>
        </div>
      </div>
    </section>`;
  }

  const HOME_FAQ = [
    ['Will it email my customers?', "<p>No. Before anything sends, you add clients, partners and anyone else you know to Never contact, one by one, by domain or from a CSV. Onbook also skips any company you've emailed or messaged in the last 12 months.</p>"],
    ['Do I approve every message?', '<p>No. Onbook has a plan ready: the steps, channels, timing and an example of each message, shown on three people it found for you. Keep it or change any step. Onbook writes each message the day before it sends and checks it for made-up facts. Stop a campaign any time and nothing else goes out.</p>'],
    ['Which accounts does it send from?', '<p>Your own Gmail or Microsoft inbox, your LinkedIn and your X. Each one is optional. LinkedIn connects through a secure sign-in page, so Onbook never sees your password, and X connects through the Onbook extension for Chrome.</p>'],
    ['Is my LinkedIn safe?', "<p>Not completely, and we would rather say so. Automation can break LinkedIn's terms, and LinkedIn can restrict accounts it thinks are automated. Onbook suggests about 15 invites and 40 messages a day, builds up new accounts slowly, works weekdays with random gaps, and pauses LinkedIn the moment it sees a warning. You can raise that to at most 25 invites and 60 messages if you accept the extra risk. The risk sits with you, and the connect screen asks you to confirm that.</p>"],
    ['What happens when someone replies?', "<p>Everyone at that company stops at once, on every channel and for every teammate. The reply lands in your Inbox with a suggested answer, ready for you to edit and send. Out-of-office replies don't count: Onbook pauses that one person until they're back.</p>"],
    ['Who is Onbook for?', "<p>B2B teams with high-value deals: Web3 agencies, Web2 agencies selling their own services, B2B services firms and SaaS teams. It isn't built for high-volume, low-price sending, selling to consumers, or running outreach for clients.</p>"],
  ];

  /* Questions: Attio's split, the heading on the left and the list on the right */
  const faqBand = (id, rest, items) => `<section class="st-band" aria-labelledby="${id}">
      <div class="st-split">
        <header class="st-band-head">${eyebrow('Questions')}${two('h2', id, 'Questions, answered.', rest)}</header>
        <div class="st-split-body">${faqList(items)}</div>
      </div>
    </section>`;

  function finalBand() {
    return `<section class="st-band st-final" aria-labelledby="st-final-h">
      ${two('h2', 'st-final-h', 'See the companies Onbook would contact for you.', 'Join the waitlist and we will email you the day Onbook opens.', 'st-two-center')}
      ${startForm('final')}
    </section>`;
  }

  /* ---------- Homepage motion and in-page navigation ---------- */
  /* The reply, the stop and the call arrive one after another the first time the example scrolls into
     view. Only when it starts off screen, so nothing visible ever disappears. The page is complete without it. */
  let revealObs = null;
  function disarm() {
    if (revealObs) { revealObs.disconnect(); revealObs = null; }
    document.querySelectorAll('.st-ex-fig.st-armed').forEach((f) => f.classList.remove('st-armed'));
  }
  function armReveal() {
    disarm();
    if (reduceMotion() || !('IntersectionObserver' in window)) return;
    const fig = document.querySelector('.st-ex-fig:not(.is-off)');
    if (!fig || fig.getBoundingClientRect().top < window.innerHeight) return;
    fig.classList.remove('st-play');
    fig.classList.add('st-armed');
    revealObs = new IntersectionObserver((entries) => {
      if (!entries.some((en) => en.isIntersecting)) return;
      disarm();
      fig.classList.add('st-play');
    }, { threshold: 0.35 });
    revealObs.observe(fig);
  }

  /* The side list of "How it works" follows the reader down the page */
  let spyFrame = 0;
  function spy() {
    spyFrame = 0;
    const nav = document.querySelector('.st-subnav');
    if (!nav) return;
    const line = window.innerHeight * 0.45;
    let cur = '';
    document.querySelectorAll('.st-sub').forEach((s) => { if (!cur || s.getBoundingClientRect().top <= line) cur = s.id; });
    nav.querySelectorAll('button[data-arg]').forEach((b) => {
      if (b.dataset.arg === cur) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', () => { if (!spyFrame) spyFrame = requestAnimationFrame(spy); }, { passive: true });

  /* Hash links are routes here, so in-page jumps scroll by script and move focus to the heading */
  function jumpTo(id, smooth = true) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: smooth && !reduceMotion() ? 'smooth' : 'auto', block: 'start' });
    const h = target.querySelector('[tabindex="-1"]');
    if (h) h.focus({ preventScroll: true });
  }

  function showAudience(key, animate) {
    st().siteAudience = key;
    document.querySelectorAll('[data-action="site-audience"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.arg === key)));
    const figs = document.querySelectorAll('.st-ex-fig');
    if (!figs.length) { OB.render({ keepScroll: true }); return; }
    disarm();
    figs.forEach((f) => {
      const on = f.id === `st-ex-${key}`;
      f.classList.toggle('is-off', !on);
      f.classList.remove('st-play', 'st-swap');
      if (on && animate && !reduceMotion()) { void f.offsetWidth; f.classList.add('st-swap'); }
    });
  }

  let jumpToStory = false;
  OB.route('site', (params) => {
    /* #site.saas (or web2, services) opens that audience's example and scrolls to it. Applied once per
       link, so the switch still works after it. */
    const want = params[0] && EX[params[0]] ? params[0] : null;
    if (want !== st().siteAudienceLink) {
      st().siteAudienceLink = want;
      if (want) { st().siteAudience = want; jumpToStory = true; }
    }
    return {
      shell: 'site', title: 'AI outreach for LinkedIn, X and email',
      html: `<div class="st-page st-home">
        ${hero()}
        ${demoHtml()}
        <div class="st-frame">
          ${builtFor()}
          ${howBand()}
          ${priceBand()}
          ${faqBand('st-faq-h', 'Anything else? Write to hello@onbook.ai and a person answers.', HOME_FAQ)}
          ${finalBand()}
        </div>
      </div>`,
      after: () => {
        demoStart();
        spy();
        /* After the router has reset the scroll position */
        requestAnimationFrame(() => {
          if (jumpToStory) { jumpToStory = false; jumpTo('st-story', false); return; }
          armReveal();
        });
      },
    };
  });

  OB.action('site-audience', (el, e, key) => { if (EX[key]) showAudience(key, true); });
  OB.action('site-for', (el, e, key) => {
    if (!EX[key]) return;
    showAudience(key, false);
    armReveal();
    jumpTo('st-story');
  });
  OB.action('site-jump', (el, e, id) => jumpTo(id));

  OB.action('site-url', (el, e, value) => {
    const s = st();
    s.siteUrl = value;
    if (s.waitlistError) s.waitlistError = '';
    if (s.siteUrlError) {
      s.siteUrlError = '';
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
      const err = document.getElementById(`${el.id}-err`);
      if (err) err.remove();
    }
  });

  OB.action('site-start', (form) => {
    const which = form.dataset.which || 'hero';
    const input = form.querySelector('input[name="email"]');
    const email = input ? input.value.trim() : '';
    if (!validEmail(email)) {
      OB.set({ waitlistEmail: email, waitlistError: email ? 'Check the address. It needs an @ and a domain, like sam@tideline.studio.' : 'Enter your work email.', waitlistErrorAt: which });
      focusField(`st-site-${which}`);
      return;
    }
    const done = () => OB.set({ waitlistDone: email, waitlistError: '', waitlistEmail: '' });
    const fail = () => OB.set({ waitlistEmail: email, waitlistError: 'Something went wrong. Please try again in a moment.', waitlistErrorAt: which });
    if (!CFG.waitlistEndpoint) { done(); return; }
    fetch(CFG.waitlistEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, _subject: 'Onbook waitlist signup', source: 'onbook.ai' }) })
      .then((r) => (r.ok ? done() : fail())).catch(fail);
  });
  OB.action('site-join', () => {
    const go = () => { const el = document.getElementById('st-site-hero'); if (el) { window.scrollTo(0, 0); el.focus(); } };
    if (OB.parseHash().name === 'site') go(); else { OB.go('site'); setTimeout(go, 60); }
  });

  /* ---------- Pricing ---------- */
  function priceBlock(bill) {
    const p = D.plan;
    const annual = bill === 'annual';
    const sub = annual
      ? `Billed ${fmt.money(p.annualPrice * 12)} a year, which saves ${fmt.money((p.price - p.annualPrice) * 12)}.`
      : 'Billed monthly. Save 20% with annual billing.';
    return `<p class="st-price"><span class="st-price-n num">${fmt.money(annual ? p.annualPrice : p.price)}</span><span class="t-2">a month</span></p><p class="t-small t-2">${esc(sub)}</p>`;
  }

  const PRICING_FAQ = [
    ['Do unused credits carry over?', "<p>No. Your 1,000 credits renew on your billing date each month, and unused ones don't carry over. Credits you buy are used after your monthly ones and end with the same billing period.</p>"],
    ['Can I cancel any time?', '<p>Yes, from Settings. Sending continues to the end of the period you paid for, then stops. Your contacts and lists stay yours to export as a CSV.</p>'],
    ['What happens if a payment fails?', '<p>All sending pauses at once, and replies still reach your Inbox. Update your card and sending starts again within a few minutes.</p>'],
    ['How do teams work?', '<p>There is no team plan. Each teammate subscribes for themselves and gets their own 1,000 credits a month. You add each other to campaigns, and a reply to anyone stops that company for everyone.</p>'],
    ['How many people will I actually reach?', "<p>It depends on the accounts you connect. At Onbook's suggested limits, one inbox plus LinkedIn reaches about 15 new people a weekday, about 330 a month. Using all 1,000 credits takes about three inboxes, a mostly email flow, or higher limits if you accept the risk. Launch shows your expected reach before you pay.</p>"],
  ];

  OB.route('pricing', () => {
    const p = D.plan;
    const bill = st().siteBilling === 'annual' ? 'annual' : 'monthly';
    const included = [
      `${fmt.num(p.allowance)} credits a month, one per new person`,
      'Unlimited campaigns and lists',
      'Email, LinkedIn and X, sent from your own accounts',
      'Every reply and booking in one Inbox, with suggested answers',
      'Your pipeline board, results, and who Onbook contacts today',
    ];
    const free = [
      'Companies that fit, from 30,000+, found every day',
      'The top 10 with a researched reason, its source and date',
      'Connect your email, LinkedIn and X',
      'A recommended plan, previewed on three people Onbook found',
    ];
    return {
      shell: 'site', title: 'Pricing',
      html: `<div class="st-page st-pricing">
        <header class="st-phead">
          ${eyebrow('Pricing')}
          <h1 class="st-h1" id="page-title" tabindex="-1">Build free, pay when you launch.</h1>
          <p class="st-hero-sub">One plan with ${fmt.num(p.allowance)} credits a month. Buy more when you need them.</p>
          <div class="seg st-bill" role="group" aria-label="Billing">
            <button type="button" id="st-bill-monthly" aria-pressed="${bill === 'monthly'}" data-action="site-billing" data-arg="monthly">Monthly</button>
            <button type="button" id="st-bill-annual" aria-pressed="${bill === 'annual'}" data-action="site-billing" data-arg="annual">Annual <span class="st-save">Save 20%</span></button>
          </div>
        </header>
        <div class="st-frame">
          <div class="st-plans">
            <section class="st-plan-cell" aria-labelledby="st-free-h">
              <div class="st-plan-top"><h2 class="st-plan-name" id="st-free-h">Build</h2><p class="t-2">Onbook builds your first campaign. Judge it before you pay.</p></div>
              <p class="st-price"><span class="st-price-n num">$0</span><span class="t-2">until you launch</span></p>
              <p class="t-small t-2">Everything is saved, and nothing sends until you subscribe.</p>
              <h3 class="st-label">Free before you pay</h3>
              ${checks(free.map(esc), 'st-checks-plain')}
              <p class="t-small t-2">People show as first name and last initial, like ${ui.person({ name: 'Maya Chen' }, { revealed: false })}, until the day before their first message.</p>
            </section>
            <section class="st-plan-cell" aria-labelledby="st-plan-h">
              <div class="st-plan-top"><h2 class="st-plan-name" id="st-plan-h">Launch</h2><p class="t-2">Onbook sends, and the replies and calls come to you.</p></div>
              <div class="st-price-box" id="st-price" aria-live="polite">${priceBlock(bill)}</div>
              ${ui.btn({ label: 'Join the waitlist', kind: 'primary', action: 'site-join', block: true, cls: 'st-btn-lg' })}
              <h3 class="st-label">Included</h3>
              ${checks(included.map(esc), 'st-checks-plain')}
            </section>
          </div>
          <section class="st-band" aria-labelledby="st-counts-h">
            <header class="st-band-head">${eyebrow('What costs credits')}${two('h2', 'st-counts-h', 'One credit per new person, once.', 'A comment on their latest post costs one more. Everything else is free.')}</header>
            <div class="st-band-body">
              <div class="table-wrap st-bleed"><table class="table table-grid table-stack st-ledger">
                <caption class="sr-only">What costs credits from your ${fmt.num(p.allowance)} a month</caption>
                <thead><tr><th scope="col">What</th><th scope="col">Cost</th><th scope="col">Details</th></tr></thead>
                <tbody>${COSTS.map(([what, n, detail]) => `<tr${n ? ' class="is-count"' : ''}><th scope="row">${esc(what)}</th><td data-label="Cost">${cost(n)}</td><td data-label="Details">${esc(detail)}</td></tr>`).join('')}</tbody>
              </table></div>
              <div class="st-notes st-notes-3">
                <p><span class="t-strong t-ink">Given back.</span> If Onbook buys someone's details but never messages them, because you stopped the campaign or a colleague at their company replied first, you get the credit back. People Onbook can't reach on any channel never cost one.</p>
                <p><span class="t-strong t-ink">Every month.</span> Your ${fmt.num(p.allowance)} credits renew on your billing date. Unused credits don't carry over.</p>
                <p><span class="t-strong t-ink">If you run out.</span> New people and comments pause until next month, or until you buy more credits. Follow-ups, replies and bookings carry on.</p>
              </div>
            </div>
          </section>
          <section class="st-band" aria-labelledby="st-credits-h">
            <header class="st-band-head">${eyebrow('More credits')}${two('h2', 'st-credits-h', 'More credits when you need them.', `${fmt.money(PACKS[0][1] / PACKS[0][0])} each. They're used after your monthly ${fmt.num(p.allowance)} and end with the billing period.`)}</header>
            <div class="st-band-body">
              <div class="table-wrap st-bleed"><table class="table table-grid st-credits">
                <caption class="sr-only">Credit packs</caption>
                <thead><tr><th scope="col">Pack</th><th scope="col" class="col-num">Price</th><th scope="col" class="col-num">Per credit</th></tr></thead>
                <tbody>${PACKS.map(([n, price]) => `<tr><th scope="row">${fmt.num(n)} credits</th><td class="col-num num">${fmt.money(price)}</td><td class="col-num num">${fmt.money(price / n)}</td></tr>`).join('')}</tbody>
              </table></div>
              <p class="st-notes t-2">Automatic credits are off by default. Turn them on in Settings and Onbook buys ${PACKS[0][0]} credits for ${fmt.money(PACKS[0][1])} whenever your monthly credits run out, up to ${fmt.money(p.autoCap)} a billing period.</p>
            </div>
          </section>
          ${faqBand('st-pfaq-h', 'Anything else? Write to hello@onbook.ai.', PRICING_FAQ)}
        </div>
      </div>`,
    };
  });

  OB.action('site-billing', (el, e, value) => {
    st().siteBilling = value === 'annual' ? 'annual' : 'monthly';
    const group = el.closest('.seg');
    if (group) group.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === el)));
    const box = document.getElementById('st-price');
    if (box) box.innerHTML = priceBlock(st().siteBilling);
    else OB.render({ keepScroll: true });
  });

  /* ---------- Remove me (a public page for prospects; Onbook is the controller) ---------- */
  const SOURCES = `<section class="st-nsec" aria-labelledby="st-src-h">
      <h2 class="st-nsec-h" id="st-src-h">Where your details came from</h2>
      <p>Onbook is responsible for your details (the data controller). Your name, job title, employer and work email came from a business contact data provider that licenses them to us, or from public pages such as your company's website. News about your company, such as funding or job posts, comes from public sources.</p>
      <p class="t-2">Every email sent through Onbook to someone in the UK or EU says where their details came from. Questions about your data: privacy@onbook.ai, or read the <a href="#legal.privacy">privacy policy</a>.</p>
    </section>`;

  OB.route('remove-me', (params) => {
    const s = st();
    if (params[0] === 'done') {
      const email = s.siteRemoved || 'hana@mintleaf.finance';
      return {
        shell: 'site', quietHead: true, title: 'Removed',
        html: `<div class="st-page st-narrow">
          <header class="st-narrow-head">
            ${authMark('check')}
            <h1 class="st-auth-title" id="page-title" tabindex="-1">You're removed</h1>
            <p class="t-2">No Onbook customer will contact <span class="t-strong t-ink">${esc(email)}</span> again.</p>
          </header>
          <section class="st-nsec" aria-labelledby="st-done-h">
            <h2 class="st-nsec-h" id="st-done-h">What happens now</h2>
            ${checks([
              'Any message scheduled to you is cancelled, on email, LinkedIn and X.',
              'Your address is on the never-contact list that every Onbook customer is checked against.',
              'We delete the contact details we hold. We keep only a scrambled code made from your address, so it can never be added again.',
            ], 'st-checks-plain')}
            <p class="t-small t-2">A company you already work with may still write to you directly, outside Onbook.</p>
          </section>
          <p class="st-auth-foot t-small t-2">Questions about your data: privacy@onbook.ai<br><a href="#remove-me">Remove another address</a></p>
        </div>`,
      };
    }
    return {
      shell: 'site', quietHead: true, title: 'Remove me',
      html: `<div class="st-page st-narrow">
        <header class="st-narrow-head">
          <h1 class="st-auth-title" id="page-title" tabindex="-1">Remove yourself from Onbook</h1>
          <p class="t-2">Onbook helps businesses contact people at other businesses. Enter your email and no Onbook customer will contact you again.</p>
        </header>
        <form class="st-remove" data-submit="site-remove" novalidate>
          ${ui.field({ id: 'st-remove-email', label: 'Your email address', hint: 'The address the message was sent to. One request covers every company that uses Onbook.', type: 'email', value: s.siteRemoveEmail || '', placeholder: 'you@company.com', error: s.siteRemoveError || '', extra: 'name="email" autocomplete="email" autocapitalize="off" spellcheck="false" data-input="site-remove-type"' })}
          ${ui.btn({ label: 'Remove me', kind: 'primary', type: 'submit', block: true })}
        </form>
        <section class="st-nsec" aria-labelledby="st-what-h">
          <h2 class="st-nsec-h" id="st-what-h">What removing does</h2>
          ${checks([
            'Cancels any message already scheduled to you, on email, LinkedIn and X.',
            'Adds you to a never-contact list that every Onbook customer is checked against.',
            'Deletes the contact details we hold, keeping only a scrambled code made from your address so you are never added again.',
          ], 'st-checks-plain')}
          <p class="t-small t-2">Contacted only on LinkedIn or X? Reply "stop" to the message and the same happens.</p>
        </section>
        ${SOURCES}
      </div>`,
    };
  });

  OB.action('site-remove-type', (el, e, value) => {
    const s = st();
    s.siteRemoveEmail = value;
    if (s.siteRemoveError) {
      s.siteRemoveError = '';
      el.removeAttribute('aria-invalid');
      const err = document.getElementById(`${el.id}-err`);
      if (err) err.remove();
    }
  });

  OB.action('site-remove', (form, e, data) => {
    const email = String(data.email || '').trim();
    if (!validEmail(email)) {
      OB.set({ siteRemoveEmail: email, siteRemoveError: email ? 'Check the address. It needs an @ and a domain, like you@company.com.' : 'Enter the email address you want removed.' });
      focusField('st-remove-email');
      return;
    }
    Object.assign(st(), { siteRemoved: email, siteRemoveEmail: '', siteRemoveError: '' });
    OB.go('remove-me.done');
  });

  /* ---------- Legal documents: a side list and one readable column ---------- */
  const ul = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
  /* Bracketed notes ("[to be confirmed]") read as quieter asides */
  const tbc = (html) => String(html).replace(/\[([^\]<>]+)\]/g, '<span class="st-tbc">[$1]</span>');
  const LEGAL_ORDER = ['privacy', 'terms', 'dpa', 'subprocessors'];
  const SUBPROCESSORS = [
    ['Supabase', 'Stores the Onbook database: accounts, lists, contacts, messages and the never-contact list', 'United States'],
    ['Vercel', 'Hosts the Onbook web app', 'United States'],
    ['Anthropic', 'AI models that research companies, write and check messages, and sort replies', 'United States'],
    ['Unipile', "Connects customers' LinkedIn accounts to send and read messages", 'European Union'],
    ['Lead data vendor (to be confirmed)', 'Supplies business contact details: names, job titles and work emails', 'To be confirmed'],
    ['Stripe', 'Payments, invoices and tax', 'United States'],
    ['Resend', "Sends Onbook's own emails, such as sign-in links and alerts, never outreach", 'United States'],
  ];

  const LEGAL = {
    privacy: {
      label: 'Privacy', title: 'Privacy policy',
      lede: 'What Onbook knows about you, where it came from, how long we keep it and how to have it removed. If you received a message sent through Onbook, the first seven sections are for you.',
      sections: [
        ['Who we are', `<p>Onbook (onbook.ai) is made by Surgence Labs [legal entity and registered address to be confirmed]. Onbook helps businesses find and contact people at other businesses.</p>
          <p>For the people our customers contact, Onbook is the data controller. That means we decide how their details are found, used and protected, and we answer for it, whichever customer sent the message. You can reach us at privacy@onbook.ai.</p>`],
        ['What we collect about people we contact', `${ul(['Name, job title and employer', 'Work email address, and public profile links such as LinkedIn and X', "Your recent public posts on LinkedIn or X, if a customer's campaign comments on one", 'Public news about the company you work for, such as funding, launches, job posts or new offices, with its date and source', 'Messages sent to you through Onbook, and your replies'])}
          <p>We don't collect home addresses, personal phone numbers or anything about your private life. We never use health, lawsuits, layoffs, security incidents or personal matters as a reason to contact anyone.</p>`],
        ['Why we use it', `<p>To help a business contact the right person at another business about something relevant to their work. Our legal basis is legitimate interest: the contact is business to business, about your job, at low volume, and every email has a plain way to opt out.</p>
          <p>Onbook contacts one person per company at a time, and stops everyone at a company as soon as anyone there replies.</p>`],
        ['Where it comes from', `${ul(['Business contact data providers that license this information to us [provider to be confirmed]', 'Public sources: company websites, press releases, job posts, funding databases and public posts on LinkedIn and X', 'Our customers, when they import their own list of contacts'])}
          <p>Every email sent through Onbook to someone in the UK or EU says where their details came from.</p>`],
        ['Who can see it', `${ul(['The Onbook customer whose campaign contacts you. They see your name, job title, company and your conversation.', 'The companies that help us run Onbook, listed on our <a href="#legal.subprocessors">Subprocessors page</a>.'])}
          <p>What we learn about a company, such as its news, can be used for any Onbook customer who targets that company. Your contact details are reused only where our data provider's licence allows it. We don't sell personal data.</p>`],
        ['How long we keep it', ul(['Contact details we bought but never used in a message: deleted after 30 days', 'Everything in a workspace that never subscribed: deleted 60 days after its last activity', "Emails in a customer's inbox that don't belong to a campaign: never stored", 'The never-contact list: kept for good, as a hash, a one-way code that lets us recognise an address without keeping it'])],
        ['Your rights', `<p>You can ask to see what we hold about you, correct it or delete it, and you can object to being contacted. For business outreach an objection always wins: we stop, for every customer, for good.</p>
          <p>The quickest way is the <a href="#remove-me">Remove me page</a>. Replying "stop" to any message works too. For anything else, email privacy@onbook.ai and we reply within 30 days. You can also complain to your data protection authority, such as the ICO in the UK.</p>`],
        ['If you use Onbook', `${ul(['We keep your name, email, company and billing details. Payments run through Stripe, so we never see your full card number.', 'Connected accounts are stored as encrypted access tokens that only the sending service can read. We never see your LinkedIn password.', "Onbook looks in your mailbox only for conversations with the companies and people in your campaigns, and never stores mail that doesn't belong to one."])}
          <p>The <a href="#legal.dpa">Data agreement</a> covers the data you bring to Onbook.</p>`],
        ['Transfers outside the UK and EU', "<p>Some of the companies that help run Onbook are in the United States. Where data leaves the UK or EU, we rely on the standard contractual clauses approved for this, or on the provider's certification under the EU-US Data Privacy Framework.</p>"],
        ['Changes to this policy', '<p>When we change this policy, we update the date at the top and email customers before the change takes effect.</p>'],
      ],
    },
    terms: {
      label: 'Terms', title: 'Terms of service',
      lede: 'The agreement between you and Onbook when you use it. This is a short outline; the full terms are being drafted with a lawyer.',
      sections: [
        ['The service', '<p>Onbook finds companies with a reason to buy, writes to people there from your own email, LinkedIn and X accounts, stops when anyone at a company replies, and gives you the replies and calls. It is not a CRM.</p>'],
        ['Your account', ul(['You sign in with Google, Microsoft or a link sent by email. There are no passwords.', 'Each account is for one person. Teammates subscribe for themselves.', 'You are responsible for what happens in your account.'])],
        ['Plans and payment', ul(["$199 a month, or $159 a month billed $1,908 a year, with 1,000 credits a month. A new person costs 1 credit, and so does a comment on their latest post. Unused credits don't carry over.", 'Extra credits: 100 for $25, 300 for $75 or 500 for $125. Automatic credits stay off unless you turn them on.', 'If a payment fails, all sending pauses until the card is updated.', 'You can cancel any time. Sending continues to the end of the period you paid for. [Refunds to be confirmed.]'])],
        ['Your connected accounts', "<p>You connect accounts you own. Automating LinkedIn and X can break their terms and lead to restrictions on your account. You accept that risk when you connect, and Onbook records that you did. Onbook suggests conservative daily limits and pauses a channel when it sees a warning, but it can't promise an account won't be restricted. If you raise a limit above Onbook's suggestion, you take on the extra risk.</p>"],
        ['How you may use Onbook', ul(['Business to business only. No outreach to consumers.', "Your own sales only. Onbook isn't for running outreach on behalf of clients.", 'Proof points must be true and yours to quote.', 'Follow the law where you are and where your recipients are. Onbook blocks cold email to Germany and Austria by default.', 'No deceptive, harassing or illegal content.'])],
        ['Messages', "<p>You approve each campaign's flow before it starts. Onbook writes each message, and any comment on a prospect's post, from that flow and checks it before it sends. You can stop a campaign at any time, and nothing else goes out. Messages are sent in your name, from your accounts.</p>"],
        ['Data', '<p>Onbook is the controller of the prospect data it finds. The <a href="#legal.privacy">Privacy policy</a> and the <a href="#legal.dpa">Data agreement</a> explain how data is handled. Your contacts and lists stay yours to export as a CSV.</p>'],
        ['No promised results', "<p>Onbook doesn't guarantee replies, calls or sales.</p>"],
        ['Liability', '<p>[Limits of liability to be written by a lawyer.]</p>'],
        ['Ending the agreement', '<p>You can cancel any time from Settings. We may suspend an account that breaks these terms, for example by contacting people who asked not to be contacted, and we will tell you why.</p>'],
        ['Changes and contact', '<p>We email you at least 30 days before a change that affects you. Questions: legal@onbook.ai. [Governing law to be confirmed.]</p>'],
      ],
    },
    dpa: {
      label: 'Data agreement', title: 'Data agreement',
      lede: 'Who is responsible for which personal data when you use Onbook, and what each of us promises. It forms part of the Terms.',
      sections: [
        ['Who is responsible for what', ul(['<span class="t-strong">Data Onbook finds:</span> names, job titles, business contact details and research about companies. Onbook is the controller.', '<span class="t-strong">Data you bring:</span> contacts you import, your mailbox and conversations, and your calendar bookings. You are the controller, and Onbook processes it for you.'])],
        ['What Onbook does as controller', ul(['Tells people in the UK and EU where their details came from, in every email', 'Runs the public <a href="#remove-me">Remove me page</a> and honours every removal for all customers', 'Keeps a never-contact list, stored as hashes', 'Deletes unused contact details after 30 days, and unpaid workspaces 60 days after their last activity'])],
        ['What you agree to', ul(['Contact businesses only, about your own products or services', 'Have a lawful basis for any contacts you import', 'Quote only true results you are allowed to share', 'Add your clients, partners and anyone who asks to Never contact', 'Tell us about any complaint you receive about a message sent through Onbook'])],
        ['When Onbook processes data for you', '<p>Onbook uses your data only to run Onbook as you set it up: your campaigns and settings are your instructions. Staff who can reach it are bound by confidentiality, and we help you answer requests from individuals.</p>'],
        ['Security', ul(['Data is encrypted in transit and at rest', 'Account tokens are encrypted and readable only by the sending service. AI jobs never see them.', 'Staff access is by role, with two-factor sign-in, and every change is logged'])],
        ['Subprocessors', "<p>We use the companies on the <a href=\"#legal.subprocessors\">Subprocessors page</a> and pass the same obligations on to each one. We give 30 days' notice before adding or replacing one.</p>"],
        ['Breaches', '<p>If a breach affects your data, we tell you without undue delay, within 48 hours of finding it [to be confirmed], with what we know and what we are doing about it.</p>'],
        ['Transfers', '<p>Where data leaves the UK or EU, the standard contractual clauses apply, with the UK addendum.</p>'],
        ['When you leave', '<p>You can export your contacts and lists. We delete your workspace data [within a period to be confirmed], except the never-contact list, which we keep as hashes so those people are never contacted again.</p>'],
        ['Audits', '<p>We answer reasonable security questionnaires and share audit reports when we have them. [Audit rights to be confirmed.]</p>'],
      ],
    },
    subprocessors: {
      label: 'Subprocessors', title: 'Subprocessors',
      lede: 'The companies that help run Onbook and may handle personal data, what each one does and where.',
      sections: [
        ['Current subprocessors', `<div class="table-wrap"><table class="table table-grid table-stack st-subs-table">
            <caption class="sr-only">Onbook subprocessors</caption>
            <thead><tr><th scope="col">Company</th><th scope="col">What it does for Onbook</th><th scope="col">Where</th></tr></thead>
            <tbody>${SUBPROCESSORS.map(([who, what, where]) => `<tr><td class="cell-main">${esc(who)}</td><td data-label="What it does">${esc(what)}</td><td data-label="Where" class="nowrap">${esc(where)}</td></tr>`).join('')}</tbody>
          </table></div>
          <p>Not listed: the accounts you connect yourself, such as Google, Microsoft, LinkedIn or X. They handle data under your own agreement with them.</p>
          <p>Anthropic does not train its models on data sent through Onbook.</p>`],
        ['How we announce changes', `<p>We update this page and email every customer at least 30 days before a new subprocessor starts handling personal data.</p>
          <p>If you have a data protection reason to object, reply within 15 days of the notice. We will try to resolve it with you. If we can't, you can end the affected service and get back what you prepaid for it.</p>`],
      ],
    },
  };

  OB.route('legal', (params, r) => {
    const key = params[0] || 'privacy';
    const doc = LEGAL[key];
    if (!doc) return OB.routes['not-found'](params, r);
    const nav = LEGAL_ORDER.map((k) => `<a href="#legal.${k}"${k === key ? ' aria-current="page"' : ''}>${esc(LEGAL[k].label)}</a>`).join('');
    return {
      shell: 'site', title: doc.title,
      html: `<div class="st-page st-legal">
        <nav class="st-legal-nav" aria-label="Legal documents"><p class="st-legal-label" aria-hidden="true">Legal</p>${nav}</nav>
        <article class="st-doc" aria-labelledby="page-title">
          <header class="st-doc-head">
            <h1 class="st-doc-title" id="page-title" tabindex="-1">${esc(doc.title)}</h1>
            <p class="st-doc-meta"><span>Draft for legal review</span><span aria-hidden="true">&middot;</span><span>Last updated ${esc(fmt.long(OB.TODAY))}</span></p>
            <p class="st-doc-lede">${esc(doc.lede)}</p>
          </header>
          ${doc.sections.map(([h, body], i) => `<section aria-labelledby="st-doc-${key}-${i}"><h2 id="st-doc-${key}-${i}">${esc(h)}</h2>${tbc(body)}</section>`).join('')}
        </article>
      </div>`,
      after: () => {
        /* On a phone the document list scrolls sideways: bring the current one into view (sideways only). */
        const navEl = document.querySelector('.st-legal-nav');
        const cur = navEl && navEl.querySelector('[aria-current="page"]');
        if (!cur || navEl.scrollWidth <= navEl.clientWidth) return;
        const delta = cur.getBoundingClientRect().left - navEl.getBoundingClientRect().left;
        navEl.scrollLeft += delta - (navEl.clientWidth - cur.offsetWidth) / 2;
      },
    };
  });
})();
