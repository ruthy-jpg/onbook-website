/* Boot: the screen index, a not-found screen, and the first render. Loaded last. */
(function () {
  'use strict';
  const OB = window.OB;
  const { esc, ui } = OB;

  OB.screen('Prototype', 'All screens', 'screens');

  OB.route('screens', () => {
    const groups = {};
    OB.screens.filter((s) => s.route !== 'screens').forEach((s) => { (groups[s.group] = groups[s.group] || []).push(s); });
    return {
      shell: 'site', title: 'All screens',
      html: `<div class="stack gap-8" style="padding-top:24px">
        <div class="stack gap-2 measure">
          <h1 class="t-title" id="page-title" tabindex="-1">Onbook prototype</h1>
          <p class="t-2">Every screen and state in design v2, built on the 6 October spec. The data is invented. Use the Screens button in the corner to jump anywhere, switch light and dark, or simulate problems such as a LinkedIn sign-out.</p>
        </div>
        <div class="screens-grid">
          ${Object.entries(groups).map(([g, list]) => `<section class="stack gap-2"><h2 class="t-heading" style="font-size:17px">${esc(g)}</h2><ul class="stack gap-1" role="list">${list.map((s) => `<li><a href="#${esc(s.route)}">${esc(s.label)}</a></li>`).join('')}</ul></section>`).join('')}
        </div>
      </div>`,
    };
  });

  OB.route('not-found', (params, r) => ({
    shell: 'site', title: 'Not found',
    html: `<div class="stack gap-4 measure" style="padding-top:48px">
      <h1 class="t-title" id="page-title" tabindex="-1">There is no screen called "${esc(r.raw)}"</h1>
      <p class="t-2">The link may be from an older version of the prototype.</p>
      <div class="row wrap gap-2">${ui.btn({ label: 'Open the screen list', kind: 'primary', href: '#screens' })}${ui.btn({ label: 'Go to Home', href: '#home' })}</div>
    </div>`,
  }));

  const start = () => OB.render();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
