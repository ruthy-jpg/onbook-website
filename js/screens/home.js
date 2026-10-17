/* Home: the day's job first (replies and bookings that need you), then campaigns, calls, accounts and usage.
   Also Home before subscribing ("Ready to launch"). v4 follows Attio's home: a greeting, then widget cards. */
(function () {
  'use strict';
  const OB = window.OB;
  const { esc, icon, ui, fmt } = OB;
  const D = OB.data;

  OB.screen('App', 'Home', 'home');
  OB.screen('App', 'Home before subscribing', 'home-ready');

  const card = (id, ic, title, link, body, extra = '') => `<section class="card card-flush" aria-labelledby="${id}">
      <div class="card-head">${icon(ic, 16)}<h2 id="${id}">${title}</h2>${extra}${link || ''}</div>
      ${body}
    </section>`;

  function needsYouRows() {
    const items = OB.get.needsYou();
    if (OB.state.sim.emptyInbox || !items.length) {
      return `<div class="card-body">${ui.empty({ icon: 'inbox', title: 'Nothing needs you yet', body: 'Replies and bookings land here as they come in. Most first replies arrive 2 to 5 days after a campaign starts.' })}</div>`;
    }
    return `<ul class="ny-list" role="list">${items.map((t) => {
      if (t.type === 'match') {
        return `<li><a class="ny-row" href="#inbox.${t.id}">
          <span class="ny-mark">${icon('calendar', 13)}</span>
          <span class="ny-main">
            <span class="ny-who"><span>Booking to match</span><span class="t-2 truncate">${esc(t.booking.email)}</span></span>
            <span class="ny-text">Booked ${esc(fmt.dt(t.booking.at))}. Match it to the right person.</span>
          </span>
          <span class="ny-meta">${esc(fmt.rel(t.at))}</span>
        </a></li>`;
      }
      const p = OB.get.person(t.person); const co = OB.get.company(p.company);
      return `<li><a class="ny-row" href="#inbox.${t.id}">
        ${ui.avatar(p.name)}
        <span class="ny-main">
          <span class="ny-who"><span>${esc(p.name)}</span><span class="t-2 truncate">${esc(co.name)}</span></span>
          <span class="ny-text">${esc(t.preview)}</span>
        </span>
        <span class="ny-meta">${ui.ch(t.channel, 13)}${esc(fmt.rel(t.at))}</span>
      </a></li>`;
    }).join('')}</ul>`;
  }

  /* Today across campaigns: what's sent, what's left and the next send, from each campaign's batch (campaigns.js) */
  function todayLine() {
    const sent = D.accounts.reduce((n, a) => n + (a.sentToday || a.newToday || 0), 0);
    const batches = D.cpToday || {};
    const planned = Object.values(batches).reduce((n, b) => n + b.channels.reduce((m, x) => m + x.fresh + x.follow, 0), 0) || 27;
    const next = Object.entries(batches)
      .flatMap(([id, b]) => b.next.map((x) => Object.assign({ campaign: id }, x)))
      .filter((x) => OB.d(x.at) > OB.TODAY)
      .sort((a, b) => OB.d(a.at) - OB.d(b.at))[0];
    let nextText = '';
    if (next) {
      const c = OB.get.campaign(next.campaign); const flow = c && OB.get.flow(c.flow);
      const step = flow && flow.steps.find((st) => st.id === next.step);
      const p = next.person ? OB.get.person(next.person) : null;
      const who = p ? p.name : next.name;
      const co = p ? (OB.get.company(p.company) || {}).name : next.co;
      const what = step ? (/^(LinkedIn|X )/.test(step.title) ? step.title : step.title.charAt(0).toLowerCase() + step.title.slice(1)) : 'a message';
      nextText = `. Next: ${what} to ${esc(who)} at ${esc(co)}, ${esc(fmt.time(next.at))}`;
    }
    if (OB.state.sim.paymentFailed) return `<div class="home-today"><p class="t-error">Sending is paused until your card is updated.</p></div>`;
    return `<div class="home-today">
      <p class="grow"><span class="num">${sent} sent today</span><span class="t-2">, ${Math.max(0, planned - sent)} to go${nextText}</span></p>
      ${ui.meter(sent, planned, { label: 'Messages sent today', warnAt: 2 })}
    </div>`;
  }

  function campaignTable() {
    const list = D.campaigns.filter((c) => c.status !== 'finished');
    const rows = list.map((c) => {
      const href = c.status === 'draft' ? 'new-campaign.flow' : `campaign.${c.id}`;
      const reach = c.status === 'draft' ? '<span class="t-2">Flow is next</span>' : `${fmt.num(c.contacted)} <span class="t-2">of ${fmt.num(c.people)}</span>`;
      return `<tr class="is-link" data-action="go" data-arg="${esc(href)}">
        <td><a class="rec" href="#${esc(href)}"><span>${esc(c.name)}</span></a></td>
        <td>${ui.status(c.status)}</td>
        <td class="col-num num">${reach}</td>
        <td class="col-num num hide-md">${c.status === 'draft' ? '' : c.positive}</td>
        <td class="col-num num hide-md">${c.status === 'draft' ? '' : c.calls}</td>
      </tr>`;
    }).join('');
    return `<div class="table-wrap"><table class="table table-grid home-table">
      <caption class="sr-only">Campaigns still going</caption>
      <thead><tr><th scope="col">Campaign</th><th scope="col">Status</th><th scope="col" class="col-num">Contacted</th><th scope="col" class="col-num hide-md">Positive</th><th scope="col" class="col-num hide-md">Calls</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
  }

  function weekBody() {
    const start = new Date(2026, 9, 5);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start); d.setDate(d.getDate() + i);
      const calls = D.calls.filter((c) => { const a = OB.d(c.at); return a.getDate() === d.getDate() && a.getMonth() === d.getMonth(); });
      return { wd: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i], n: d.getDate(), calls: calls.length, today: d.getDate() === 7, weekend: i >= 5, label: `${fmt.day(d)}${calls.length ? `, ${OB.plural(calls.length, 'call')}` : ', no calls'}${d.getDate() === 7 ? ', today' : ''}` };
    });
    const thisWeek = D.calls.filter((c) => OB.d(c.at) < new Date(2026, 9, 12));
    const next = D.calls.filter((c) => OB.d(c.at) >= new Date(2026, 9, 12));
    const row = (c) => {
      if (c.match) return `<li><a class="call-row" href="#inbox.${c.thread}"><span class="call-time num">${esc(fmt.day(c.at))}<span>${esc(fmt.time(c.at))}</span></span><span class="call-who"><span class="truncate">${esc(c.email)}</span><span class="t-2">Booking to match</span></span></a></li>`;
      const p = OB.get.person(c.person); const co = OB.get.company(p.company);
      return `<li><a class="call-row" href="${c.thread ? `#inbox.${c.thread}` : `#contacts.person.${p.id}`}"><span class="call-time num">${OB.isToday(c.at) ? 'Today' : esc(fmt.day(c.at))}<span>${esc(fmt.time(c.at))}</span></span><span class="call-who"><span class="truncate">${esc(p.name)}</span><span class="t-2 truncate">${esc(co.name)}${c.noReply ? ', booked without replying' : ''}</span></span></a></li>`;
    };
    return `<div class="cal-body">
      ${ui.week(days)}
      <ul class="call-list" role="list">${thisWeek.map(row).join('')}</ul>
      ${next.length ? `<p class="t-small t-2">Next week: ${next.map((c) => { const p = OB.get.person(c.person); return `${esc(p.name)}, ${esc(fmt.dt(c.at))}`; }).join('; ')}</p>` : ''}
    </div>`;
  }

  function accountsBody() {
    const sim = OB.state.sim;
    const rows = D.accounts.filter((a) => a.ch !== 'calendar').map((a) => {
      let state, cls = '';
      if (sim.paymentFailed) { state = 'Paused: payment failed'; cls = 't-error'; }
      else if (a.ch === 'linkedin' && sim.linkedinIssue) { state = 'Signed out'; cls = 't-warn'; }
      else if (a.status === 'warming') state = `Warming up, ${a.newPerDay} a day`;
      else state = a.ch === 'email' ? `${a.sentToday} of ${a.sendCap} sent today` : `${a.newToday} of ${a.newPerDay} today`;
      return `<li class="acc-row">${ui.ch(a.ch, 15)}<span class="truncate grow">${esc(a.name)}</span><span class="t-small ${cls || 't-2'} nowrap">${esc(state)}</span></li>`;
    }).join('');
    return `<ul class="acc-list" role="list">${rows}</ul>`;
  }

  function usageBody() {
    const used = OB.get.used();
    const p = D.plan;
    return `<div class="card-body stack gap-3">
      <p class="num usage-num"><span>${fmt.num(used)}</span><span class="t-2">of ${fmt.num(p.allowance)} used</span></p>
      ${ui.meter(used, p.allowance, { label: 'Credits used this month' })}
      <p class="t-small t-2">One credit per new person or post comment. About ${fmt.num(p.expectedReach)} this month at your current pace; resets 1 Nov.</p>
    </div>`;
  }

  OB.route('home', () => {
    if (!OB.state.sim.subscribed) return OB.routes['home-ready']();
    const c = OB.get.needsYouCounts();
    const empty = OB.state.sim.emptyInbox;
    const summary = empty || !c.total ? 'You are up to date' : [c.replies ? OB.plural(c.replies, 'reply', 'replies') : '', c.matches ? OB.plural(c.matches, 'booking') : ''].filter(Boolean).join(' and ') + ' need you';
    const first = OB.get.needsYou()[0];
    const firstName = String(D.me.name).split(' ')[0];
    return {
      shell: 'app', nav: 'home', title: 'Home',
      html: `
        ${ui.pageHead({ icon: 'home', title: 'Home', actions: !empty && first ? ui.btn({ label: 'Answer replies', kind: 'primary', size: 's', href: `#inbox.${first.id}` }) : ui.btn({ label: 'Start a campaign', kind: 'secondary', size: 's', icon: 'plus', href: '#new-campaign' }) })}
        <div class="home-hello">
          <h2 class="t-title">Good morning, ${esc(firstName)}</h2>
          <p class="t-2">Wednesday 7 October. ${esc(summary)}.</p>
        </div>
        <div class="home-grid">
          <div class="stack gap-4">
            ${card('ny-h', 'inbox', 'Needs you', !empty && c.total ? '<a href="#inbox">Open the Inbox</a>' : '', needsYouRows(), !empty && c.total ? `<span class="count">${c.total}</span>` : '')}
            ${card('camp-h', 'campaigns', 'Campaigns', '<a href="#campaigns">All campaigns</a>', todayLine() + campaignTable())}
          </div>
          <div class="stack gap-4">
            ${card('week-h', 'calendar', 'This week', '<span class="link">5 to 11 Oct</span>', weekBody())}
            ${card('acc-h', 'link', 'Accounts', '<a href="#settings.accounts">Manage</a>', accountsBody())}
            ${card('use-h', 'user', 'Credits this month', '<a href="#settings.plan">Plan</a>', usageBody())}
          </div>
        </div>`,
    };
  });

  OB.route('home-ready', () => {
    const flow = OB.get.flow('f1');
    const done = ['Website read and profile checked', '10 example companies checked', 'Email, LinkedIn and X connected', 'Flow approved: 6 steps over 14 days'];
    return {
      shell: 'app', nav: 'home', title: 'Home', beforePay: true, noBanners: true,
      html: `
        ${ui.pageHead({ icon: 'home', title: 'Home', actions: ui.btn({ label: 'Subscribe and launch', kind: 'primary', size: 's', href: '#setup-launch' }) })}
        <div class="home-hello">
          <h2 class="t-title">Your first campaign is ready to launch</h2>
          <p class="t-2">Everything is saved and nothing has been sent. Subscribe and the first messages go out today.</p>
        </div>
        <div class="home-grid">
          <section class="card card-flush" aria-labelledby="ready-h">
            <div class="card-head">${icon('campaigns', 16)}<h2 id="ready-h">Fintech launches, autumn</h2>${ui.status('ready')}<span class="link">Saved Wed 7 Oct, 10:12 AM</span></div>
            <div class="card-body stack gap-5">
              <p class="t-2">Up to 15 new people a weekday, from 30,000+ companies that fit your profile.</p>
              <div class="stack gap-2">
                ${ui.strip(flow.steps, flow.steps.map(() => 'todo'))}
                <p class="t-small t-2">${flow.steps.map((s) => esc(s.title)).join(', then ')}.</p>
              </div>
              <ul class="ticks" role="list">${done.map((d) => `<li class="tick is-done"><span class="tick-mark">${icon('check', 11)}</span>${esc(d)}</li>`).join('')}</ul>
              <div class="row wrap gap-2">${ui.btn({ label: 'Review the flow', kind: 'secondary', size: 's', href: '#setup-flow' })}${ui.btn({ label: 'Review the examples', kind: 'ghost', size: 's', href: '#setup-list' })}</div>
            </div>
          </section>
          <section class="card card-flush" aria-labelledby="next-h">
            <div class="card-head">${icon('clock', 16)}<h2 id="next-h">When you launch</h2></div>
            <div class="card-body stack gap-4">
              <ol class="launch-steps">
                <li><span><span>Today.</span> <span class="t-2">Onbook buys contact details for up to 15 people and sends their first steps inside working hours.</span></span></li>
                <li><span><span>Each weekday.</span> <span class="t-2">The next people start, follow-ups go out, and every message is checked before it sends.</span></span></li>
                <li><span><span>When someone replies.</span> <span class="t-2">Everyone at that company stops, and the reply lands in your Inbox.</span></span></li>
              </ol>
              <p class="t-small t-2">Names show as first name and last initial until the day before each person's first message.</p>
            </div>
          </section>
        </div>`,
    };
  });
})();
