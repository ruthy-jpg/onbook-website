/* Page frames: app (sidebar, phone tab bar), setup (five steps), site (marketing), bare. */
(function () {
  'use strict';
  const OB = window.OB;
  const { esc, icon, ui } = OB;

  const NAV = [
    { key: 'home', label: 'Home', icon: 'home', href: '#home' },
    { key: 'inbox', label: 'Inbox', icon: 'inbox', href: '#inbox' },
    { key: 'campaigns', label: 'Campaigns', icon: 'campaigns', href: '#campaigns' },
    { key: 'contacts', label: 'Contacts', icon: 'contacts', href: '#contacts' },
    { key: 'settings', label: 'Settings', icon: 'settings', href: '#settings' },
  ];

  /* The Onbook mark (brand book, concept T2): a near-black tile with a 3 by 3 grid of days, the
     bottom-right one booked in mint. Each size uses its own grid: 16 up to 24px, 32 up to 47px, 48 above. */
  OB.logo = (size = 22) => {
    const g = size <= 24 ? { t: 16, r: 4, d: 2, dr: 0.5, at: [3, 7, 11] }
      : size < 48 ? { t: 32, r: 8, d: 4, dr: 1, at: [7, 14, 21] }
        : { t: 48, r: 12, d: 8, dr: 2, at: [8, 20, 32] };
    const days = g.at.map((y, yi) => g.at.map((x, xi) => `<rect class="${xi === 2 && yi === 2 ? 'lg-mint' : 'lg-day'}" x="${x}" y="${y}" width="${g.d}" height="${g.d}" rx="${g.dr}"/>`).join('')).join('');
    return `<svg class="ob-logo" width="${size}" height="${size}" viewBox="0 0 ${g.t} ${g.t}" aria-hidden="true" focusable="false"><rect class="lg-tile" width="${g.t}" height="${g.t}" rx="${g.r}"/>${days}</svg>`;
  };
  /* The lockup: the mark and the Inter 600 wordmark */
  OB.brand = (href = '#home', size = 22) => `<a class="brand" href="${href}" aria-label="Onbook home">${OB.logo(size)}<span>Onbook</span></a>`;

  function healthLine() {
    const sim = OB.state.sim;
    if (sim.paymentFailed) return { dot: 'error', text: 'Sending paused', sub: 'Payment failed', href: '#settings.plan' };
    if (sim.linkedinIssue) return { dot: 'warn', text: 'LinkedIn needs you', sub: 'Signed out on Wed 7 Oct', href: '#settings.accounts' };
    const x = OB.get.account('a-x');
    return { dot: 'ink', text: 'Accounts healthy', sub: x && x.status === 'warming' ? `X warming up, day ${x.rampDay} of ${x.rampDays}` : 'Email, LinkedIn and X', href: '#settings.accounts' };
  }

  function banners() {
    const sim = OB.state.sim;
    const out = [];
    if (sim.paymentFailed) out.push(ui.notice({ kind: 'error', title: 'Your card was declined, so all sending is paused', body: 'Replies still reach your Inbox. Update your card and sending starts again within a few minutes.', actions: ui.btn({ label: 'Update card', kind: 'secondary', size: 's', href: '#settings.plan' }) }));
    if (sim.linkedinIssue) out.push(ui.notice({ kind: 'warn', title: 'LinkedIn signed you out, so LinkedIn steps are paused', body: 'Email and X carry on. Steps waiting on LinkedIn send after you reconnect, within the normal daily limits.', actions: ui.btn({ label: 'Reconnect LinkedIn', kind: 'secondary', size: 's', action: 'reconnect-linkedin' }) }));
    if (sim.outOfPeople) out.push(ui.notice({ kind: 'warn', title: 'You have used your 1,000 credits this month', body: 'Follow-ups, replies and bookings carry on. New people and comments start again on 1 Nov, or buy credits to keep going now.', actions: ui.btn({ label: 'Buy credits', kind: 'secondary', size: 's', action: 'buy-credits' }) }));
    return out.length ? `<div class="banner-stack">${out.join('')}</div>` : '';
  }

  OB.shells.app = (view) => {
    const counts = OB.get.needsYouCounts();
    const sim = OB.state.sim;
    const used = view.usedOverride != null ? view.usedOverride : OB.get.used();
    const plan = OB.data.plan;
    const h = healthLine();
    const here = OB.parseHash();
    const inboxCount = sim.emptyInbox || !sim.subscribed || view.beforePay ? 0 : counts.total;
    const navItems = NAV.map((n) => {
      const cur = view.nav === n.key && !(n.key === 'campaigns' && here.name === 'campaign') ? 'aria-current="page"' : '';
      const count = n.key === 'inbox' && inboxCount ? `<span class="count"><span class="dot dot-needs"></span>${inboxCount}<span class="sr-only"> need you</span></span>` : '';
      return `<a href="${n.href}" ${cur}>${icon(n.icon, 16)}<span>${esc(n.label)}</span>${count}</a>`;
    }).join('');
    /* The workspace row shows the customer's own logo, or a colour tile with their initial; the Onbook mark
       stays outside the workspace (brand book, Applications). Attio lists your lists under the main sections;
       Onbook lists the campaigns that are still going. */
    const DOTS = { running: 'live', paused: 'warn', draft: 'quiet', ready: 'quiet' };
    /* Before the first payment only the first campaign exists, ready to launch */
    const prePay = !sim.subscribed || view.beforePay;
    const camps = prePay ? (OB.data.campaigns || []).slice(0, 1).map((c) => Object.assign({}, c, { status: 'ready' })) : (OB.data.campaigns || []).filter((c) => c.status !== 'finished');
    const campItems = camps.map((c) => {
      const cur = here.name === 'campaign' && here.params[0] === c.id ? 'aria-current="page"' : '';
      const label = { running: 'running', paused: 'paused', draft: 'draft', ready: 'ready to launch' }[c.status] || c.status;
      return `<a href="#campaign.${esc(c.id)}" ${cur}><span class="dot dot-${DOTS[c.status] || 'quiet'}" aria-hidden="true"></span><span>${esc(c.name)}</span><span class="sr-only">, ${esc(label)}</span></a>`;
    }).join('');
    const tabItems = NAV.map((n) => {
      const cur = view.nav === n.key ? 'aria-current="page"' : '';
      const dot = n.key === 'inbox' && inboxCount ? `<span class="tab-dot" aria-hidden="true"></span><span class="sr-only">, ${inboxCount} need you</span>` : '';
      return `<a href="${n.href}" ${cur}>${icon(n.icon, 22)}<span>${esc(n.label)}</span>${dot}</a>`;
    }).join('');
    const usage = sim.subscribed && !view.beforePay
      ? `<a class="side-block" href="#settings.plan"><span class="row"><span class="t-2">Credits this month</span></span><span class="row num gap-1"><strong>${OB.fmt.num(used)}</strong><span class="t-2">of ${OB.fmt.num(plan.allowance)} used</span></span>${ui.meter(used, plan.allowance, { label: 'Credits used this month' })}</a>`
      : `<a class="side-block" href="#setup-launch"><span class="t-2">Credits this month</span><span><strong>Starts when you launch</strong></span></a>`;
    return `
      <div class="app">
        <aside class="side" aria-label="Main">
          <button type="button" class="ws" data-action="me-menu" aria-haspopup="menu" aria-expanded="false" aria-label="${esc(OB.data.me.company)} workspace menu">${ui.co(OB.data.me.company)}<span class="ws-name">${esc(OB.data.me.company)}</span>${icon('chevron-down', 14)}</button>
          <button type="button" class="side-search" data-action="open-search">${icon('search', 15)}<span>Search</span>${ui.kbd('\u2318K')}</button>
          <nav class="nav" aria-label="Sections">${navItems}</nav>
          ${campItems ? `<p class="side-label">Campaigns</p><nav class="nav nav-sub" aria-label="Campaigns">${campItems}</nav>` : ''}
          <div class="side-foot">
            ${usage}
            <a class="side-block" href="${h.href}"><span class="row gap-2"><span class="dot dot-${h.dot === 'ink' ? 'live' : h.dot}"></span><span>${esc(h.text)}</span></span><span class="t-micro t-2">${esc(h.sub)}</span></a>
            <button type="button" class="me" data-action="me-menu" aria-haspopup="menu" aria-expanded="false">${ui.avatar(OB.data.me.name, 'sm')}<span class="grow t-small truncate">${esc(OB.data.me.name)}</span>${icon('chevron-up', 14, 'style="color:var(--text-2)"')}</button>
          </div>
        </aside>
        <header class="topbar">
          <a class="topbar-title ws-mini" href="#home" aria-label="${esc(OB.data.me.company)}, Home">${ui.co(OB.data.me.company)}<span>${esc(OB.data.me.company)}</span></a>
          ${ui.iconBtn({ icon: 'search', label: 'Search', action: 'open-search', size: 'm' })}
          <button type="button" class="btn btn-ghost btn-icon" data-action="me-menu" aria-label="Account menu" aria-haspopup="menu" aria-expanded="false">${ui.avatar(OB.data.me.name, 'sm')}</button>
        </header>
        <main class="main" id="main">
          <div class="main-inner${view.narrow ? ' is-narrow' : ''}">
            ${view.noBanners ? '' : banners()}
            ${view.html}
          </div>
        </main>
        <nav class="tabbar" aria-label="Sections">${tabItems}</nav>
      </div>`;
  };

  const SETUP_STEPS = [
    { route: 'setup-website', label: 'Website' },
    { route: 'setup-profile', label: 'Company profile' },
    { route: 'setup-list', label: 'Companies' },
    { route: 'setup-accounts', label: 'Accounts and flow' },
    { route: 'setup-launch', label: 'Launch' },
  ];
  OB.setupSteps = SETUP_STEPS;
  OB.shells.setup = (view) => {
    const cur = view.step || 1;
    const steps = SETUP_STEPS.map((s, i) => {
      const n = i + 1;
      const state = n < cur ? 'is-done' : '';
      const mark = n < cur ? icon('check', 14, 'stroke-width="2.2"') : n;
      const inner = `<span class="n" aria-hidden="true">${mark}</span><span class="step-name">${esc(s.label)}</span><span class="sr-only">${n < cur ? ', done' : n === cur ? ', current step' : ''}</span>`;
      return `<li class="${state}" ${n === cur ? 'aria-current="step"' : ''}>${n < cur ? `<a href="#${s.route}">${inner}</a>` : inner}</li>`;
    }).join('');
    return `
      <header class="setup-top">
        ${OB.brand('#site')}
        <ol class="setup-steps" aria-label="Setup steps, ${cur} of 5">${steps}</ol>
        <div class="setup-meta">
          ${view.saved === false ? '' : `<span class="meta-saved row gap-1">${icon('check', 16)}Saved</span>`}
          <a class="btn btn-ghost btn-sm" href="#home-ready">Exit setup</a>
        </div>
      </header>
      <main class="setup-main${view.narrow ? ' is-narrow' : ''}" id="main">${view.html}</main>
      ${view.foot ? `<div class="setup-foot"><div class="setup-foot-inner">${view.foot}</div></div>` : ''}`;
  };

  OB.shells.site = (view) => `
    <div class="site-head-wrap"><header class="site-head">
      ${OB.brand('#site', 24)}
      <nav aria-label="Site">
        <a class="site-link hide-sm" href="#site" data-action="site-product">Product</a>
        <a class="site-link hide-sm" href="#pricing">Pricing</a>
        <a class="btn ${view.quietHead ? 'btn-secondary' : 'btn-primary'}" href="#site" data-action="site-join">Join the waitlist</a>
      </nav>
    </header></div>
    <main class="site-main" id="main">${view.html}</main>
    <footer class="site-foot"><div class="site-foot-inner">
      <span>Onbook, from Surgence Labs</span>
      <a href="#pricing">Pricing</a><a href="#legal.privacy">Privacy</a><a href="#legal.terms">Terms</a><a href="#legal.dpa">Data agreement</a><a href="#legal.subprocessors">Subprocessors</a><a href="#remove-me">Remove me from Onbook</a>
    </div></footer>`;

  OB.shells.bare = (view) => view.html;

  /* Product in the site header: the homepage's How it works section */
  OB.action('site-product', () => {
    const show = () => { const h = document.getElementById('st-how-h'); if (h) h.closest('section').scrollIntoView({ block: 'start' }); };
    if (OB.parseHash().name === 'site' && document.getElementById('st-how-h')) show();
    else { OB.go('site'); setTimeout(show, 60); }
  });

  /* Shared app actions */
  OB.action('open-search', () => OB.search());
  OB.action('me-menu', (el) => OB.menu(el, [
    { label: 'Settings', icon: 'settings', action: 'go', arg: 'settings' },
    { label: 'Plan and credits', icon: 'card', action: 'go', arg: 'settings.plan' },
    { label: 'Keyboard shortcuts', icon: 'keyboard', action: 'shortcuts' },
    { sep: true },
    { label: 'Log out', icon: 'logout', action: 'go', arg: 'login' },
  ]));
  OB.action('shortcuts', () => OB.dialog(`${OB.dialogHead('Keyboard shortcuts')}
    <dl class="kv">
      <dt>${ui.kbd('\u2318K')}</dt><dd>Search or jump anywhere</dd>
      <dt>${ui.kbd('J')} ${ui.kbd('K')}</dt><dd>Next and previous conversation in the Inbox</dd>
      <dt>${ui.kbd('R')}</dt><dd>Reply</dd>
      <dt>${ui.kbd('B')}</dt><dd>Mark a call booked</dd>
      <dt>${ui.kbd('E')}</dt><dd>Mark done</dd>
      <dt>${ui.kbd('Esc')}</dt><dd>Close a dialog, drawer or menu</dd>
    </dl>`, { label: 'Keyboard shortcuts' }));
  OB.action('reconnect-linkedin', () => {
    OB.dialog(`${OB.dialogHead('Reconnect LinkedIn', 'You sign in on a secure page run by Unipile, our LinkedIn partner. Onbook never sees your password.')}
      <ol class="ticks">
        <li class="tick is-done"><span class="tick-mark">${icon('check', 14)}</span>Open LinkedIn's sign-in page</li>
        <li class="tick"><span class="tick-mark"></span>Sign in, and enter the code LinkedIn sends you</li>
        <li class="tick"><span class="tick-mark"></span>Come back here. Paused steps send within today's limits</li>
      </ol>
      <div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${ui.btn({ label: 'Open LinkedIn sign-in', kind: 'primary', action: 'reconnect-done' })}</div>`, { label: 'Reconnect LinkedIn' });
  });
  OB.action('reconnect-done', () => { OB.closeOverlays(true); OB.state.sim.linkedinIssue = false; OB.render({ keepScroll: true }); OB.toast('LinkedIn reconnected. Paused steps send today.'); });
  OB.action('buy-credits', () => {
    const packs = [{ n: 100, p: 25 }, { n: 300, p: 75 }, { n: 500, p: 125 }];
    OB.state.ui.pack = OB.state.ui.pack || 100;
    const render = () => `${OB.dialogHead('Buy credits', 'Top-up credits are used after your 1,000 monthly credits and end with this period on 31 Oct. A new person or a comment on their latest post costs 1 credit.')}
      <div class="stack gap-2" role="radiogroup" aria-label="Credit pack">
        ${packs.map((k) => `<label class="check pack-opt${OB.state.ui.pack === k.n ? ' is-on' : ''}"><input type="radio" name="pack" value="${k.n}" ${OB.state.ui.pack === k.n ? 'checked' : ''} data-change="pick-pack"><span class="grow"><strong>${k.n} credits</strong> <span class="t-2">${OB.fmt.money(k.p / k.n)} each</span></span><strong class="num">${OB.fmt.money(k.p)}</strong></label>`).join('')}
      </div>
      <p class="t-small t-2">Charged to ${esc(OB.data.plan.card)}. Follow-ups, replies and bookings never cost credits.</p>
      <div class="dialog-actions">${ui.btn({ label: 'Cancel', action: 'close-overlay' })}${ui.btn({ label: `Buy ${OB.state.ui.pack} credits for ${OB.fmt.money(packs.find((k) => k.n === OB.state.ui.pack).p)}`, kind: 'primary', action: 'credits-bought' })}</div>`;
    OB.dialog(render(), { label: 'Buy credits' });
    OB.actions['pick-pack'] = (el) => { OB.state.ui.pack = Number(el.value); const box = document.querySelector('#overlay .dialog'); if (box) box.innerHTML = render(); box.querySelector(`input[value="${el.value}"]`).focus(); };
  });
  OB.action('credits-bought', () => {
    OB.closeOverlays(true);
    const n = OB.state.ui.pack || 100;
    OB.data.plan.credits += n;
    OB.state.sim.outOfPeople = false;
    OB.render({ keepScroll: true });
    OB.toast(`Bought ${n} credits. New people and comments start again today.`);
  });
})();
