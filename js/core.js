/* Onbook prototype core: routing, actions, overlays, formatting, icons and the UI kit.
   Screens register with OB.route(name, fn) and return { shell, title, nav, html, after, keys }.
   Interactions use data-action="name" (click), data-input / data-change, and form[data-submit]. */
(function () {
  'use strict';
  const OB = (window.OB = window.OB || {});
  OB.routes = {};
  OB.actions = {};
  OB.shells = {};
  OB.screens = [];          // prototype index: { group, label, route }
  OB.state = { ui: {}, sim: { linkedinIssue: false, outOfPeople: false, paymentFailed: false, subscribed: true, emptyInbox: false } };

  /* ---------- Registration ---------- */
  OB.route = (name, fn) => { OB.routes[name] = fn; };
  OB.action = (name, fn) => { OB.actions[name] = fn; };
  OB.screen = (group, label, route) => { OB.screens.push({ group, label, route }); };

  /* ---------- Escaping and small helpers ---------- */
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  OB.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  OB.plural = (n, one, many) => `${OB.fmt.num(n)} ${n === 1 ? one : many || one + 's'}`;
  OB.initials = (name) => String(name || '').replace(/^@/, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  OB.uid = (() => { let i = 0; return (p = 'id') => `${p}-${++i}`; })();
  OB.ui = OB.ui || {};

  /* ---------- Dates: the prototype's clock is Wed 7 Oct 2026, 10:30 AM ---------- */
  OB.TODAY = new Date(2026, 9, 7, 10, 30);
  OB.d = (s) => {
    if (s instanceof Date) return s;
    const [day, t = '00:00'] = String(s).split('T');
    const [y, m, dd] = day.split('-').map(Number);
    const [hh, mm] = t.split(':').map(Number);
    return new Date(y, m - 1, dd, hh || 0, mm || 0);
  };
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  OB.fmt = {
    num: (n) => Number(n).toLocaleString('en-US'),
    money: (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0 }),
    pct: (n, digits = 1) => `${Number(n).toFixed(digits).replace(/\.0$/, '')}%`,
    day: (s) => { const d = OB.d(s); return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`; },
    short: (s) => { const d = OB.d(s); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; },
    long: (s) => { const d = OB.d(s); return `${d.getDate()} ${['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()]} ${d.getFullYear()}`; },
    time: (s) => { const d = OB.d(s); let h = d.getHours(); const m = d.getMinutes(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${String(m).padStart(2, '0')} ${ap}`; },
    dt: (s) => `${OB.fmt.day(s)}, ${OB.fmt.time(s)}`,
    rel: (s) => {
      const d = OB.d(s); const diff = (OB.TODAY - d) / 60000;
      if (diff < 0) { // future
        if (sameDay(d, OB.TODAY)) return `Today, ${OB.fmt.time(d)}`;
        const tom = new Date(OB.TODAY); tom.setDate(tom.getDate() + 1);
        if (sameDay(d, tom)) return `Tomorrow, ${OB.fmt.time(d)}`;
        return OB.fmt.dt(d);
      }
      if (diff < 1) return 'Just now';
      if (diff < 60) return `${Math.round(diff)} min ago`;
      if (sameDay(d, OB.TODAY)) return `${Math.round(diff / 60)} ${Math.round(diff / 60) === 1 ? 'hour' : 'hours'} ago`;
      const y = new Date(OB.TODAY); y.setDate(y.getDate() - 1);
      if (sameDay(d, y)) return `Yesterday, ${OB.fmt.time(d)}`;
      return OB.fmt.dt(d);
    },
    ago: (s) => { const days = Math.round((OB.TODAY - OB.d(s)) / 86400000); if (days <= 0) return 'today'; if (days === 1) return 'yesterday'; if (days < 14) return `${days} days ago`; if (days < 60) return `${Math.round(days / 7)} weeks ago`; return `${Math.round(days / 30)} months ago`; },
  };
  OB.isToday = (s) => sameDay(OB.d(s), OB.TODAY);

  /* ---------- Icons: 1.5px line icons on a 24px grid ---------- */
  const P = {
    home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
    inbox: 'M3 13h5l1.5 3h5l1.5-3h5 M5.5 5h13l2.5 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z',
    campaigns: 'M21 3 10.5 13.5 M21 3l-6.5 18-4-7.5L3 9.5z',
    contacts: 'M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1 M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M22 20v-1a4 4 0 0 0-3-3.87 M16 4.13a3.5 3.5 0 0 1 0 6.75',
    settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M20.5 20.5l-4.6-4.6',
    plus: 'M12 5v14 M5 12h14',
    minus: 'M5 12h14',
    check: 'M20 6 9 17l-5-5',
    x: 'M18 6 6 18 M6 6l12 12',
    'chevron-right': 'M9 18l6-6-6-6',
    'chevron-left': 'M15 18l-6-6 6-6',
    'chevron-down': 'M6 9l6 6 6-6',
    'chevron-up': 'M18 15l-6-6-6 6',
    'arrow-left': 'M19 12H5 M12 19l-7-7 7-7',
    'arrow-right': 'M5 12h14 M12 5l7 7-7 7',
    'arrow-up': 'M12 19V5 M5 12l7-7 7 7',
    'arrow-down': 'M12 5v14 M19 12l-7 7-7-7',
    pause: 'M8 5v14 M16 5v14',
    play: 'M7 4.5v15l12.5-7.5z',
    stop: 'M7 7h10v10H7z',
    mail: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M3.5 6.5 12 13l8.5-6.5',
    calendar: 'M4 5.5h16a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1z M16 3v5 M8 3v5 M3 10.5h18',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 3',
    alert: 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z M12 9v4 M12 17h.01',
    info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 16v-4.5 M12 8h.01',
    lock: 'M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z M8 11V7.5a4 4 0 1 1 8 0V11',
    filter: 'M3 5.5h18 M6.5 12h11 M10 18.5h4',
    edit: 'M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z',
    trash: 'M3 6h18 M8 6V4h8v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6 M10 11v6 M14 11v6',
    upload: 'M12 15V4 M7 9l5-5 5 5 M4 20h16',
    download: 'M12 4v11 M7 10l5 5 5-5 M4 20h16',
    external: 'M14 4h6v6 M20 4 10 14 M18 13.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5.5',
    refresh: 'M20.5 12a8.5 8.5 0 1 1-2.5-6 M20.5 4v5h-5',
    reply: 'M9 14 4 9l5-5 M4 9h10a6 6 0 0 1 6 6v4',
    building: 'M4 21V4.5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1V21 M15 9h4a1 1 0 0 1 1 1v11 M2.5 21h19 M8 7.5h3 M8 11.5h3 M8 15.5h3',
    list: 'M9 6h12 M9 12h12 M9 18h12 M4 6h.01 M4 12h.01 M4 18h.01',
    chart: 'M4 20V11 M10 20V5 M16 20v-6 M21.5 20h-19',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4',
    bell: 'M18 9a6 6 0 1 0-12 0c0 6.5-3 8.5-3 8.5h18S18 15.5 18 9 M13.7 21a2 2 0 0 1-3.4 0',
    card: 'M3 5.5h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z M2 10h20 M6 15h4',
    user: 'M20 21v-1a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v1 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    link: 'M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1 M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1',
    globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3 12h18 M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9 M12 3C9.5 5.7 8.2 8.7 8.2 12s1.3 6.3 3.8 9',
    moon: 'M20.5 13.5A8.5 8.5 0 1 1 10.5 3.5a6.5 6.5 0 0 0 10 10z',
    sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4',
    eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    message: 'M20.5 11.5a8 8 0 0 1-11.7 7.1L3.5 20.5l1.9-5.1a8 8 0 1 1 15.1-3.9z',
    puzzle: 'M10 4a2 2 0 1 1 4 0v1h4a1 1 0 0 1 1 1v4h-1a2 2 0 1 0 0 4h1v4a1 1 0 0 1-1 1h-4v-1a2 2 0 1 0-4 0v1H6a1 1 0 0 1-1-1v-4h1a2 2 0 1 0 0-4H5V6a1 1 0 0 1 1-1h4z',
    logout: 'M9.5 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4.5 M16 17l5-5-5-5 M21 12H9',
    menu: 'M4 6.5h16 M4 12h16 M4 17.5h16',
    copy: 'M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1z M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1',
    send: 'M21 3 10.5 13.5 M21 3l-6.5 18-4-7.5L3 9.5z',
    flag: 'M5 21V4 M5 4h11l-2 4 2 4H5',
    zap: 'M13 2 4 14h7l-1 8 9-12h-7z',
    layers: 'M12 3 2 8l10 5 10-5z M2 13l10 5 10-5',
    target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 12h.01',
    split: 'M6 3v6a6 6 0 0 0 6 6h6 M15 12l3 3-3 3 M6 21v-3',
    undo: 'M9 14 4 9l5-5 M4 9h11a5 5 0 0 1 0 10h-3',
    keyboard: 'M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z M6 10h.01 M10 10h.01 M14 10h.01 M18 10h.01 M7 14h10',
    sparkline: 'M3 17l5-5 4 3 8-9',
    hand: 'M8 13V5.5a1.5 1.5 0 0 1 3 0V12 M11 11V4.5a1.5 1.5 0 0 1 3 0V12 M14 11V6.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5a6 6 0 0 1-5-2.7L3 15.5a1.5 1.5 0 0 1 2.5-1.7L8 16',
  };
  const DOTS = { more: [[5, 12], [12, 12], [19, 12]], grip: [[9, 6], [15, 6], [9, 12], [15, 12], [9, 18], [15, 18]] };
  OB.icon = (name, size = 20, extra = '') => {
    if (DOTS[name]) {
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" ${extra}>${DOTS[name].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="currentColor"/>`).join('')}</svg>`;
    }
    const d = P[name] || P.info;
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" ${extra}><path d="${d}"/></svg>`;
  };

  /* Provider marks, drawn in the text colour */
  OB.mark = (name, size = 18) => {
    const s = `width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"`;
    switch (name) {
      case 'linkedin':
        return `<svg ${s}><rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="currentColor"/><path d="M7.6 10.2v6.6 M7.6 7.3v.1 M11.2 16.8v-6.6 M11.2 13c0-1.8 1-2.9 2.5-2.9s2.2 1 2.2 2.9v3.8" fill="none" stroke="var(--mark-cut, var(--surface))" stroke-width="1.9" stroke-linecap="round"/></svg>`;
      case 'x':
        return `<svg ${s}><path d="M4 4h4.4l11.6 16h-4.4z" fill="currentColor"/><path d="M19.4 4l-6 6.8 M4.6 20l6-6.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
      case 'google':
        return `<svg ${s}><path fill="currentColor" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z M12 21.8c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.2H3.1v2.6A9.8 9.8 0 0 0 12 21.8z M6.4 13.7a5.9 5.9 0 0 1 0-3.4V7.7H3.1a9.8 9.8 0 0 0 0 8.6z M12 6.2c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.8 9.8 0 0 0 3.1 7.7l3.3 2.6C7.2 7.9 9.4 6.2 12 6.2z"/></svg>`;
      case 'microsoft':
        return `<svg ${s}><rect x="3" y="3" width="8.4" height="8.4" fill="currentColor"/><rect x="12.6" y="3" width="8.4" height="8.4" fill="currentColor" opacity=".8"/><rect x="3" y="12.6" width="8.4" height="8.4" fill="currentColor" opacity=".8"/><rect x="12.6" y="12.6" width="8.4" height="8.4" fill="currentColor" opacity=".6"/></svg>`;
      case 'email': return OB.icon('mail', size);
      case 'calendar': return OB.icon('calendar', size);
      case 'chrome': return OB.icon('puzzle', size);
      default: return OB.icon('info', size);
    }
  };
  OB.chName = (ch) => ({ email: 'Email', linkedin: 'LinkedIn', x: 'X', calendar: 'Calendar' }[ch] || ch);

  /* ---------- UI kit (returns HTML strings) ---------- */
  const attr = (o) => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== false).map(([k, v]) => (v === true ? k : `${k}="${OB.esc(v)}"`)).join(' ');
  OB.attr = attr;

  OB.ui.btn = ({ label, kind = 'secondary', size, icon, iconRight, action, arg, href, id, disabled, block, title, ariaLabel, type = 'button', extra = '', cls = '' } = {}) => {
    const c = ['btn', `btn-${kind}`, size === 's' ? 'btn-sm' : '', block ? 'btn-block' : '', !label ? 'btn-icon' : '', cls].filter(Boolean).join(' ');
    const inner = `${icon ? OB.icon(icon, size === 's' ? 16 : 18) : ''}${label ? `<span>${OB.esc(label)}</span>` : ''}${iconRight ? OB.icon(iconRight, 16) : ''}`;
    const a = attr({ id, title, 'aria-label': ariaLabel || (!label ? title : undefined), 'data-action': action, 'data-arg': arg });
    if (href && !disabled) return `<a class="${c}" href="${OB.esc(href)}" ${a} ${extra}>${inner}</a>`;
    return `<button type="${type}" class="${c}" ${a} ${disabled ? 'disabled' : ''} ${extra}>${inner}</button>`;
  };
  OB.ui.iconBtn = ({ icon, label, action, arg, kind = 'ghost', size = 's', id, extra = '' }) => OB.ui.btn({ icon, title: label, ariaLabel: label, action, arg, kind, size, id, extra });

  OB.ui.tag = (kind, text, dot) => `<span class="tag tag-${kind}">${dot ? `<span class="dot dot-${dot}"></span>` : ''}${OB.esc(text)}</span>`;

  OB.ui.stage = (stage, detail) => {
    switch (stage) {
      case 'not-contacted': return OB.ui.tag('outline', 'Not contacted');
      case 'in-flow': return OB.ui.tag('grey', detail || 'In flow');
      case 'needs-you': return OB.ui.tag('blue', 'Needs you');
      case 'in-conversation': return OB.ui.tag('grey', 'In conversation');
      case 'booked': return OB.ui.tag('green', detail || 'Call booked');
      case 'paused': return OB.ui.tag('amber', detail || 'Paused');
      case 'stopped': return OB.ui.tag('quiet', detail || 'Stopped');
      case 'done': return OB.ui.tag('quiet', detail || 'Done');
      default: return OB.ui.tag('quiet', stage);
    }
  };
  OB.ui.status = (status) => ({
    running: OB.ui.tag('green', 'Running'),
    paused: OB.ui.tag('amber', 'Paused'),
    draft: OB.ui.tag('outline', 'Draft'),
    ready: OB.ui.tag('blue', 'Ready to launch'),
    finished: OB.ui.tag('grey', 'Finished'),
  }[status] || OB.ui.tag('quiet', status));

  OB.ui.ch = (ch, size = 16) => `<span class="ch" title="${OB.esc(OB.chName(ch))}">${OB.mark(ch, size)}<span class="sr-only">${OB.esc(OB.chName(ch))}</span></span>`;
  /* A steady soft colour per name, the way Attio shows people and companies without a photo or logo */
  OB.tone = (name) => { let h = 0; const t = String(name || ''); for (let i = 0; i < t.length; i += 1) h = (h * 31 + t.charCodeAt(i)) >>> 0; return (h % 7) + 1; };
  OB.ui.avatar = (name, size) => `<span class="avatar av-${OB.tone(name)}${size ? ' avatar-' + size : ''}" aria-hidden="true">${OB.esc(OB.initials(name))}</span>`;
  OB.ui.co = (name, size) => `<span class="co-mark av-${OB.tone(name)}${size ? ' co-mark-' + size : ''}" aria-hidden="true">${OB.esc(String(name || '?').trim()[0] || '?')}</span>`;
  OB.ui.meter = (value, max, { warnAt = 0.8, label, large } = {}) => {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    return `<div class="meter${large ? ' meter-lg' : ''}${value / max >= warnAt ? ' is-warn' : ''}" role="progressbar" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}" ${label ? `aria-label="${OB.esc(label)}"` : ''}><span style="width:${pct}%"></span></div>`;
  };

  /* Flow strip: progress is an array of 'done' | 'next' | 'todo' | 'skip' | 'stopped' | 'replied' aligned with steps */
  OB.ui.strip = (steps, progress = [], label) => {
    const chOf = (s) => (typeof s === 'string' ? s : s.ch);
    const names = { done: 'sent', next: 'next', todo: 'not yet', skip: 'skipped', stopped: 'stopped', replied: 'replied' };
    const parts = steps.map((s, i) => {
      const st = progress[i] || 'todo';
      const node = `<span class="sn ${st}" title="${OB.esc(OB.chName(chOf(s)))}: ${names[st]}">${OB.mark(chOf(s), 12)}</span>`;
      const line = i < steps.length - 1 ? `<span class="sl ${st === 'done' && (progress[i + 1] === 'done' || progress[i + 1] === 'replied') ? 'done' : ''}"></span>` : '';
      return node + line;
    });
    const sr = steps.map((s, i) => `${OB.chName(chOf(s))} ${names[progress[i] || 'todo']}`).join(', ');
    return `<span class="strip" role="img" aria-label="${OB.esc(label || 'Flow progress: ' + sr)}">${parts.join('')}</span>`;
  };

  /* Masked name: first name, last initial and a lock until their first message */
  OB.ui.person = (p, { revealed } = {}) => {
    const open = revealed != null ? revealed : p.revealed;
    if (open) return `<span>${OB.esc(p.name)}</span>`;
    const [first, ...rest] = String(p.name).split(' ');
    const last = rest.length ? ` ${rest[rest.length - 1][0]}.` : '';
    return `<span class="masked">${OB.esc(first + last)}${OB.icon('lock', 14)}<span class="sr-only">, full name appears the day before their first message</span></span>`;
  };

  OB.ui.notice = ({ kind = 'info', title, body, actions = '', icon } = {}) => {
    const ic = icon || { warn: 'alert', error: 'alert', needs: 'info', info: 'info' }[kind];
    return `<div class="notice notice-${kind}" role="${kind === 'error' ? 'alert' : 'status'}">${OB.icon(ic, 20)}<div class="notice-body">${title ? `<strong class="t-medium">${OB.esc(title)}</strong>` : ''}${body ? `<span class="t-small t-2">${body}</span>` : ''}</div>${actions ? `<div class="notice-actions">${actions}</div>` : ''}</div>`;
  };
  OB.ui.empty = ({ icon = 'info', title, body, actions = '' }) => `<div class="empty"><span class="empty-icon">${OB.icon(icon, 22)}</span><h3 class="t-heading">${OB.esc(title)}</h3>${body ? `<p class="t-2">${body}</p>` : ''}${actions ? `<div class="row wrap gap-2">${actions}</div>` : ''}</div>`;

  OB.ui.sw = ({ id, on, label, action, arg, describedBy }) => `<button type="button" role="switch" class="switch" id="${OB.esc(id || OB.uid('sw'))}" aria-checked="${on ? 'true' : 'false'}" ${label ? `aria-label="${OB.esc(label)}"` : ''} ${describedBy ? `aria-describedby="${OB.esc(describedBy)}"` : ''} ${action ? `data-action="${OB.esc(action)}"` : ''} ${arg != null ? `data-arg="${OB.esc(arg)}"` : ''}></button>`;
  OB.ui.seg = (options, current, action, label = 'View') => `<div class="seg" role="group" aria-label="${OB.esc(label)}">${options.map((o) => `<button type="button" aria-pressed="${o.value === current}" data-action="${OB.esc(action)}" data-arg="${OB.esc(o.value)}">${OB.esc(o.label)}</button>`).join('')}</div>`;
  OB.ui.field = ({ id, label, hint, value = '', placeholder, type = 'text', error, prefix, textarea, rows = 4, extra = '', optional } = {}) => {
    const fid = id || OB.uid('f');
    const describe = [hint ? `${fid}-hint` : '', error ? `${fid}-err` : ''].filter(Boolean).join(' ');
    const common = `id="${fid}" ${placeholder ? `placeholder="${OB.esc(placeholder)}"` : ''} ${describe ? `aria-describedby="${describe}"` : ''} ${error ? 'aria-invalid="true"' : ''} ${extra}`;
    let control = textarea
      ? `<textarea class="textarea" rows="${rows}" ${common}>${OB.esc(value)}</textarea>`
      : `<input class="input" type="${type}" value="${OB.esc(value)}" ${common}>`;
    if (prefix) control = `<div class="input-group"><span class="prefix">${OB.esc(prefix)}</span>${control}</div>`;
    return `<div class="field"><label class="label" for="${fid}">${OB.esc(label)}${optional ? ' <span class="t-2" style="font-weight:400">(optional)</span>' : ''}</label>${hint ? `<span class="hint" id="${fid}-hint">${hint}</span>` : ''}${control}${error ? `<span class="field-error" id="${fid}-err">${OB.icon('alert', 16)}${OB.esc(error)}</span>` : ''}</div>`;
  };
  /* The page bar: crumbs and the title on the left, actions on the right, one optional line underneath */
  OB.ui.pageHead = ({ crumbs, title, sub, actions = '', after = '', icon } = {}) => `
    <header class="page-head">
      <div class="page-bar">
        <div class="page-titles">
          ${icon ? `<span class="page-icon" aria-hidden="true">${OB.icon(icon, 14)}</span>` : ''}
          ${crumbs ? `<nav class="crumbs" aria-label="Breadcrumb">${crumbs.map((c) => (c.href ? `<a href="${OB.esc(c.href)}">${OB.esc(c.label)}</a>` : `<span>${OB.esc(c.label)}</span>`) + OB.icon('chevron-right', 14)).join('')}</nav>` : ''}
          <h1 tabindex="-1" id="page-title">${title}</h1>
        </div>
        ${actions ? `<div class="page-actions">${actions}</div>` : ''}
      </div>
      ${sub ? `<p class="page-sub">${sub}</p>` : ''}
    </header>${after}`;
  OB.ui.tabs = (items, label = 'Sections') => `<nav class="tabs" aria-label="${OB.esc(label)}">${items.map((t) => `<a class="tab" href="${OB.esc(t.href)}" ${t.current ? 'aria-current="page"' : ''}>${OB.esc(t.label)}${t.count != null ? ` <span class="t-2 num" style="font-weight:500">${OB.esc(t.count)}</span>` : ''}${t.dot ? '<span class="dot dot-needs"></span>' : ''}</a>`).join('')}</nav>`;
  OB.ui.kbd = (k) => `<kbd class="kbd">${OB.esc(k)}</kbd>`;
  OB.ui.sk = (w = '100%', h = 12) => `<span class="sk" style="width:${w};height:${h}px"></span>`;
  OB.ui.week = (days) => `
    <div class="week" role="list" aria-label="Calls this week">
      ${days.map((d) => `<span class="wd" aria-hidden="true">${OB.esc(d.wd)}</span>`).join('')}
      ${days.map((d) => `<span role="listitem" class="day${d.calls ? ' booked' : ''}${d.today ? ' today' : ''}${d.weekend ? ' weekend' : ''}" aria-label="${OB.esc(d.label)}">${d.n}</span>`).join('')}
    </div>`;
  OB.ui.filter = ({ label, count, pressed, action, arg }) => `<button type="button" class="filter" aria-pressed="${pressed ? 'true' : 'false'}" data-action="${OB.esc(action)}" data-arg="${OB.esc(arg)}">${OB.esc(label)}${count != null ? ` <span class="num">${OB.fmt.num(count)}</span>` : ''}</button>`;

  /* ---------- State and rendering ---------- */
  OB.ui$ = (key, fallback) => (key in OB.state.ui ? OB.state.ui[key] : fallback);
  OB.set = (patch, opts = {}) => { Object.assign(OB.state.ui, patch); if (opts.render !== false) OB.render({ keepScroll: true }); };
  OB.sim = (patch) => { Object.assign(OB.state.sim, patch); OB.render({ keepScroll: true }); };

  OB.parseHash = () => {
    const raw = decodeURIComponent(location.hash.replace(/^#/, '')) || 'site';
    const [name, ...params] = raw.split('.');
    return { raw, name, params };
  };
  OB.go = (hash) => { if (location.hash.replace(/^#/, '') === hash) OB.render(); else location.hash = hash; };
  OB.href = (hash) => `#${hash}`;

  OB.render = (opts = {}) => {
    const r = OB.parseHash();
    const fn = OB.routes[r.name] || OB.routes['not-found'];
    let view;
    try { view = fn(r.params, r) || {}; }
    catch (err) { console.error(err); view = { shell: 'bare', title: 'Something broke', html: `<main class="site-main stack" style="padding-top:48px"><h1 class="t-title">This screen hit an error</h1><pre class="t-small" style="white-space:pre-wrap">${OB.esc(err && err.stack || err)}</pre><a class="btn btn-secondary" href="#screens">Open the screen list</a></main>` }; }
    const shell = OB.shells[view.shell || 'app'] || ((v) => v.html);
    const app = document.getElementById('app');
    // Remember focus so re-renders don't lose the user's place
    const ae = document.activeElement;
    const focusId = ae && ae.id && app.contains(ae) ? ae.id : null;
    const sel = focusId && 'selectionStart' in ae ? [ae.selectionStart, ae.selectionEnd] : null;
    const y = window.scrollY;
    app.innerHTML = shell(view, r);
    document.title = view.title ? `${view.title} | Onbook AI` : 'Onbook AI: AI outreach that books you sales meetings';
    OB.current = { route: r, view };
    if (opts.keepScroll) window.scrollTo(0, y);
    if (focusId) { const el = document.getElementById(focusId); if (el) { el.focus({ preventScroll: true }); if (sel && el.setSelectionRange) try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { /* not a text field */ } } }
    else if (opts.focusTitle) { const h = document.getElementById('page-title'); if (h) h.focus({ preventScroll: true }); }
    if (view.after) { try { view.after(); } catch (e) { console.error(e); } }
  };
  /* Change the address without a redraw. Some hosts don't allow history.replaceState, so fall back to a quiet hash change. */
  OB.replaceHash = (hash) => {
    const target = '#' + String(hash).replace(/^#/, '');
    try { if (window.history && typeof window.history.replaceState === 'function') { window.history.replaceState(null, '', target); return; } } catch (e) { /* not allowed here */ }
    if (location.hash === target) return;
    OB._quietHash = target;
    location.replace(target);
  };
  window.addEventListener('hashchange', () => {
    if (OB._quietHash && location.hash === OB._quietHash) { OB._quietHash = null; return; }
    OB.closeOverlays(true); OB.closeMenu(); OB.render({ focusTitle: true }); window.scrollTo(0, 0);
  });

  /* ---------- Events ---------- */
  document.addEventListener('click', (e) => {
    // Close an open menu when clicking outside it
    if (OB._menu && !OB._menu.el.contains(e.target) && !OB._menu.anchor.contains(e.target)) OB.closeMenu();
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const name = el.dataset.action;
    const fn = OB.actions[name];
    if (!fn) { console.warn('No action registered for', name); return; }
    if (el.tagName === 'A' || el.tagName === 'BUTTON' || el.getAttribute('role') === 'switch') e.preventDefault();
    if (OB._menu && OB._menu.el.contains(el)) OB.closeMenu(true);
    fn(el, e, el.dataset.arg);
  });
  document.addEventListener('input', (e) => { const el = e.target.closest('[data-input]'); if (el && OB.actions[el.dataset.input]) OB.actions[el.dataset.input](el, e, el.value); });
  document.addEventListener('change', (e) => { const el = e.target.closest('[data-change]'); if (el && OB.actions[el.dataset.change]) OB.actions[el.dataset.change](el, e, el.type === 'checkbox' ? el.checked : el.value); });
  document.addEventListener('submit', (e) => { const f = e.target.closest('form[data-submit]'); if (!f) return; e.preventDefault(); const fn = OB.actions[f.dataset.submit]; if (fn) fn(f, e, Object.fromEntries(new FormData(f))); });
  document.addEventListener('keydown', (e) => {
    const k = e.key;
    if ((e.metaKey || e.ctrlKey) && k.toLowerCase() === 'k') { e.preventDefault(); OB.search(); return; }
    if (k === 'Escape') { if (OB._menu) { OB.closeMenu(true); return; } if (document.getElementById('overlay').innerHTML) { OB.closeOverlays(); return; } }
    if (OB._menu) { menuKeys(e); return; }
    const ov = document.getElementById('overlay');
    if (ov.innerHTML && k === 'Tab') { trap(e, ov); return; }
    // Route shortcuts, ignored while typing
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const keys = OB.current && OB.current.view && OB.current.view.keys;
    if (keys && keys[k] && !ov.innerHTML) { e.preventDefault(); keys[k](e); }
  });

  /* ---------- Overlays ---------- */
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function trap(e, root) {
    const f = [...root.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function openOverlay(kind, html, { label = '', wide = false, onClose } = {}) {
    OB.closeMenu();
    const ov = document.getElementById('overlay');
    if (!ov.innerHTML) OB._lastFocus = document.activeElement;
    OB._onClose = onClose || null;
    const cls = kind === 'drawer' ? 'drawer' : `dialog${wide ? ' dialog-wide' : ''}`;
    ov.innerHTML = `<div class="scrim" data-action="close-overlay"></div><div class="${cls}" role="dialog" aria-modal="true" aria-label="${OB.esc(label)}" tabindex="-1">${html}</div>`;
    const box = ov.querySelector(`.${kind === 'drawer' ? 'drawer' : 'dialog'}`);
    const target = box.querySelector('[autofocus]') || box.querySelector('input, textarea, select') || box.querySelector(FOCUSABLE) || box;
    requestAnimationFrame(() => target.focus());
    return box;
  }
  OB.dialog = (html, opts) => openOverlay('dialog', html, opts);
  OB.drawer = (html, opts) => openOverlay('drawer', html, opts);
  OB.closeOverlays = (silent) => {
    const ov = document.getElementById('overlay');
    if (!ov || !ov.innerHTML) return;
    ov.innerHTML = '';
    const cb = OB._onClose; OB._onClose = null;
    if (cb) cb();
    if (!silent && OB._lastFocus && document.contains(OB._lastFocus)) OB._lastFocus.focus();
  };
  OB.action('close-overlay', () => OB.closeOverlays());
  OB.dialogHead = (title, sub) => `<div class="dialog-head"><div class="stack gap-1" style="flex:1"><h2>${OB.esc(title)}</h2>${sub ? `<p class="t-2 t-small">${sub}</p>` : ''}</div>${OB.ui.iconBtn({ icon: 'x', label: 'Close', action: 'close-overlay' })}</div>`;
  OB.drawerHead = (title, sub, extra = '') => `<div class="drawer-head"><div class="stack gap-1" style="flex:1;min-width:0"><h2>${title}</h2>${sub ? `<p class="t-2 t-small">${sub}</p>` : ''}</div>${extra}${OB.ui.iconBtn({ icon: 'x', label: 'Close', action: 'close-overlay' })}</div>`;

  /* Confirm dialog built into the page (window.confirm is not available) */
  OB.confirm = ({ title, body, confirmLabel, cancelLabel = 'Cancel', danger, onConfirm }) => {
    OB._confirmFn = onConfirm;
    OB.dialog(`${OB.dialogHead(title)}<p class="t-2">${body}</p><div class="dialog-actions">${OB.ui.btn({ label: cancelLabel, kind: 'secondary', action: 'close-overlay' })}${OB.ui.btn({ label: confirmLabel, kind: danger ? 'danger-solid' : 'primary', action: 'confirm-yes' })}</div>`, { label: title });
  };
  OB.action('confirm-yes', () => { const fn = OB._confirmFn; OB._confirmFn = null; OB.closeOverlays(true); if (fn) fn(); });

  /* Menus: real lists, keyboard operable */
  OB.menu = (anchor, items) => {
    if (OB._menu && OB._menu.anchor === anchor) { OB.closeMenu(true); return; }
    OB.closeMenu();
    const m = document.createElement('div');
    m.className = 'menu';
    m.setAttribute('role', 'menu');
    m.innerHTML = items.map((it) => (it.sep ? '<div class="menu-sep" role="separator"></div>' : `<button type="button" class="menu-item${it.danger ? ' danger' : ''}" role="menuitem" data-action="${OB.esc(it.action)}" ${it.arg != null ? `data-arg="${OB.esc(it.arg)}"` : ''}>${it.icon ? OB.icon(it.icon, 16) : ''}<span>${OB.esc(it.label)}</span>${it.hint ? `<span class="menu-hint">${OB.esc(it.hint)}</span>` : ''}</button>`)).join('');
    document.body.appendChild(m);
    const r = anchor.getBoundingClientRect();
    const w = m.offsetWidth, h = m.offsetHeight;
    let left = Math.min(Math.max(16, r.right - w), window.innerWidth - w - 16);
    let top = r.bottom + 6;
    if (top + h > window.innerHeight - 16) top = Math.max(16, r.top - h - 6);
    m.style.left = `${left}px`; m.style.top = `${top}px`;
    anchor.setAttribute('aria-expanded', 'true');
    OB._menu = { el: m, anchor };
    const first = m.querySelector('.menu-item'); if (first) first.focus();
  };
  OB.closeMenu = (returnFocus) => {
    if (!OB._menu) return;
    const { el, anchor } = OB._menu;
    el.remove(); anchor.setAttribute('aria-expanded', 'false');
    OB._menu = null;
    if (returnFocus && document.contains(anchor)) anchor.focus();
  };
  function menuKeys(e) {
    const items = [...OB._menu.el.querySelectorAll('.menu-item')];
    const i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
    else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
    else if (e.key === 'Tab') { OB.closeMenu(); }
  }
  window.addEventListener('resize', () => OB.closeMenu());
  window.addEventListener('scroll', () => OB.closeMenu(), { passive: true });

  /* Toasts confirm with the button's own verb */
  OB.toast = (text, { undo, actionLabel = 'Undo', ms = 5000 } = {}) => {
    const wrap = document.getElementById('toasts');
    const t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.innerHTML = `<span>${OB.esc(text)}</span>${undo ? `<button type="button" class="btn btn-secondary btn-sm">${OB.esc(actionLabel)}</button>` : ''}`;
    if (undo) t.querySelector('button').addEventListener('click', () => { t.remove(); undo(); });
    wrap.appendChild(t);
    setTimeout(() => t.remove(), ms);
  };

  /* ---------- Search (Cmd+K) ---------- */
  OB.searchIndex = () => {
    const D = OB.data || {};
    const items = [];
    (D.campaigns || []).forEach((c) => items.push({ kind: 'Campaign', label: c.name, sub: `${c.status === 'running' ? 'Running' : c.status}`, href: `#campaign.${c.id}` }));
    (D.people || []).forEach((p) => items.push({ kind: 'Person', label: p.revealed ? p.name : (() => { const parts = String(p.name).split(' '); return parts[0] + (parts.length > 1 ? ' ' + parts[parts.length - 1][0] + '.' : ''); })(), sub: `${p.title}, ${(OB.get && OB.get.company(p.company) || {}).name || ''}`, href: `#contacts.person.${p.id}` }));
    (D.companies || []).forEach((c) => items.push({ kind: 'Company', label: c.name, sub: c.domain, href: `#contacts.company.${c.id}` }));
    OB.screens.forEach((s) => items.push({ kind: 'Screen', label: s.label, sub: s.group, href: `#${s.route}` }));
    return items;
  };
  OB.search = () => {
    OB.dialog(`
      <div class="stack gap-3">
        <div class="search-wrap">${OB.icon('search', 18)}<input class="input input-search" id="ob-search" placeholder="Search campaigns, people, companies and screens" autocomplete="off" data-input="search-type" aria-label="Search"></div>
        <div id="ob-search-results" class="stack gap-1" role="listbox" aria-label="Results"></div>
        <p class="t-micro t-2">${OB.ui.kbd('\u2191')} ${OB.ui.kbd('\u2193')} to move, ${OB.ui.kbd('Enter')} to open, ${OB.ui.kbd('Esc')} to close</p>
      </div>`, { label: 'Search' });
    OB.actions['search-type'](document.getElementById('ob-search'), null, '');
  };
  OB.action('search-type', (el, e, q) => {
    const box = document.getElementById('ob-search-results');
    if (!box) return;
    const ql = String(q || '').trim().toLowerCase();
    const all = OB.searchIndex();
    const hits = (ql ? all.filter((i) => (i.label + ' ' + i.sub).toLowerCase().includes(ql)) : all.filter((i) => i.kind === 'Campaign' || i.kind === 'Screen').slice(0, 8)).slice(0, 10);
    box.innerHTML = hits.length ? hits.map((h, i) => `<a class="menu-item" role="option" href="${OB.esc(h.href)}" data-action="search-go" ${i === 0 ? 'aria-selected="true"' : ''}><span class="tag tag-quiet" style="min-width:76px;justify-content:center">${OB.esc(h.kind)}</span><span class="truncate"><span class="t-medium">${OB.esc(h.label)}</span> <span class="t-2 t-small">${OB.esc(h.sub || '')}</span></span></a>`).join('') : `<p class="t-2" style="padding:12px">Nothing matches "${OB.esc(q)}".</p>`;
  });
  OB.action('search-go', (el) => { OB.closeOverlays(true); location.hash = el.getAttribute('href'); });
  document.addEventListener('keydown', (e) => {
    const box = document.getElementById('ob-search-results');
    if (!box || !document.getElementById('ob-search')) return;
    const opts = [...box.querySelectorAll('[role="option"]')];
    if (!opts.length) return;
    let i = opts.findIndex((o) => o.getAttribute('aria-selected') === 'true');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (i >= 0) opts[i].removeAttribute('aria-selected');
      i = e.key === 'ArrowDown' ? (i + 1) % opts.length : (i - 1 + opts.length) % opts.length;
      opts[i].setAttribute('aria-selected', 'true'); opts[i].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'ob-search') {
      e.preventDefault(); const pick = opts[Math.max(0, i)]; OB.closeOverlays(true); location.hash = pick.getAttribute('href');
    }
  });

  /* ---------- Theme ---------- */
  /* Light only (Julian, 7 Oct 2026): no dark mode, and a theme saved by an older version is cleared */
  OB.setTheme = () => { document.documentElement.setAttribute('data-theme', 'light'); };
  OB.setTheme();
  try { localStorage.removeItem('ob-theme'); } catch (e) { /* storage blocked */ }

  /* ---------- Prototype chrome: the Screens menu (not part of the product) ---------- */
  OB.protoFab = () => `<button type="button" class="proto-fab" data-action="proto-open" aria-label="Prototype: all screens and states">${OB.icon('layers', 16)}<span>Screens</span></button>`;
  OB.action('proto-open', () => {
    const cur = OB.parseHash().raw;
    const groups = {};
    OB.screens.forEach((s) => { (groups[s.group] = groups[s.group] || []).push(s); });
    const sim = OB.state.sim;
    OB.drawer(`
      ${OB.drawerHead('Prototype', 'Every screen and state. Nothing here sends anything.')}
      <div class="drawer-body">
        <div class="stack gap-2">
          <h3 class="t-small t-2 t-strong" style="font-family:var(--font-text)">Simulate</h3>
          ${[
            ['subscribed', 'Subscribed (off shows Home before paying)'],
            ['linkedinIssue', 'LinkedIn needs attention'],
            ['outOfPeople', 'Out of credits this month'],
            ['paymentFailed', 'Payment failed'],
            ['emptyInbox', 'Day one: nothing in the Inbox yet'],
          ].map(([k, l]) => `<div class="switch-row">${OB.ui.sw({ id: 'sim-' + k, on: sim[k], label: l, action: 'proto-sim', arg: k })}<label for="sim-${k}">${OB.esc(l)}</label></div>`).join('')}
        </div>
        <div class="proto-list">
          ${Object.entries(groups).map(([g, list]) => `<div class="proto-group"><h3>${OB.esc(g)}</h3>${list.map((s) => `<a href="#${OB.esc(s.route)}" ${s.route === cur ? 'aria-current="page"' : ''} data-action="proto-go">${OB.esc(s.label)}</a>`).join('')}</div>`).join('')}
        </div>
      </div>`, { label: 'Prototype screens' });
  });
  OB.action('proto-go', (el) => { OB.closeOverlays(true); location.hash = el.getAttribute('href'); });
  OB.action('proto-sim', (el, e, k) => { OB.state.sim[k] = !OB.state.sim[k]; el.setAttribute('aria-checked', String(OB.state.sim[k])); OB.render({ keepScroll: true }); });

  /* Generic actions */
  OB.action('go', (el, e, arg) => OB.go(arg));
  OB.action('noop', () => {});
  OB.action('toast', (el, e, arg) => OB.toast(arg));
})();
