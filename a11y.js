(() => {
  'use strict';

  const KEY = 'lh-a11y';
  const SCALE_STEPS = [1, 1.1, 1.2, 1.3];
  const defaults = { scaleIdx: 0, contrast: false, motion: false, underline: false, plainFont: false };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
    } catch (e) { return { ...defaults }; }
  }
  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function apply(state) {
    const html = document.documentElement;
    html.style.setProperty('--a11y-scale', String(SCALE_STEPS[state.scaleIdx]));
    if (state.contrast) html.setAttribute('data-a11y-contrast', 'high'); else html.removeAttribute('data-a11y-contrast');
    if (state.motion) html.setAttribute('data-a11y-motion', 'reduce'); else html.removeAttribute('data-a11y-motion');
    if (state.underline) html.setAttribute('data-a11y-underline', 'on'); else html.removeAttribute('data-a11y-underline');
    if (state.plainFont) html.setAttribute('data-a11y-font', 'plain'); else html.removeAttribute('data-a11y-font');
  }

  let state = load();
  apply(state);

  function update(patch) {
    state = { ...state, ...patch };
    apply(state);
    save(state);
    syncUI();
  }

  const fabIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="5.5" r="2.3"/>
    <path d="M4.5 9.5c2.2 1 5 1.5 7.5 1.5s5.3-.5 7.5-1.5"/>
    <path d="M12 11v10"/>
    <path d="M8 21l2.2-6.2M16 21l-2.2-6.2"/>
    <path d="M7 15.5l-1.8 2M17 15.5l1.8 2"/>
  </svg>`;

  const fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'a11y-fab';
  fab.setAttribute('aria-label', 'אפשרויות נגישות');
  fab.setAttribute('aria-haspopup', 'dialog');
  fab.setAttribute('aria-expanded', 'false');
  fab.setAttribute('aria-controls', 'a11yPanel');
  fab.innerHTML = fabIcon;

  const panel = document.createElement('div');
  panel.className = 'a11y-panel';
  panel.id = 'a11yPanel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'a11yPanelTitle');
  panel.hidden = true;
  panel.innerHTML = `
    <h2 id="a11yPanelTitle">אפשרויות נגישות</h2>
    <p class="a11y-sub">ההעדפות נשמרות בדפדפן שלכם לביקורים הבאים.</p>

    <div class="a11y-row">
      <span>גודל טקסט</span>
      <div class="a11y-btns">
        <button type="button" class="a11y-btn" data-a11y-action="scale-down" aria-label="הקטנת טקסט">A-</button>
        <button type="button" class="a11y-btn" data-a11y-action="scale-up" aria-label="הגדלת טקסט">A+</button>
      </div>
    </div>
    <div class="a11y-row">
      <span>ניגודיות גבוהה</span>
      <button type="button" class="a11y-btn" data-a11y-action="contrast" aria-pressed="false">הפעלה</button>
    </div>
    <div class="a11y-row">
      <span>עצירת אנימציות</span>
      <button type="button" class="a11y-btn" data-a11y-action="motion" aria-pressed="false">הפעלה</button>
    </div>
    <div class="a11y-row">
      <span>הדגשת קישורים</span>
      <button type="button" class="a11y-btn" data-a11y-action="underline" aria-pressed="false">הפעלה</button>
    </div>
    <div class="a11y-row">
      <span>גופן קריא</span>
      <button type="button" class="a11y-btn" data-a11y-action="plainFont" aria-pressed="false">הפעלה</button>
    </div>

    <button type="button" class="a11y-reset" data-a11y-action="reset">איפוס כל ההגדרות</button>
    <p class="a11y-panel-foot"><a href="accessibility.html">הצהרת נגישות מלאה</a></p>
  `;

  function syncUI() {
    panel.querySelector('[data-a11y-action="contrast"]').setAttribute('aria-pressed', String(state.contrast));
    panel.querySelector('[data-a11y-action="motion"]').setAttribute('aria-pressed', String(state.motion));
    panel.querySelector('[data-a11y-action="underline"]').setAttribute('aria-pressed', String(state.underline));
    panel.querySelector('[data-a11y-action="plainFont"]').setAttribute('aria-pressed', String(state.plainFont));
    panel.querySelector('[data-a11y-action="scale-down"]').disabled = state.scaleIdx === 0;
    panel.querySelector('[data-a11y-action="scale-up"]').disabled = state.scaleIdx === SCALE_STEPS.length - 1;
  }

  let lastFocus = null;
  function openPanel() {
    lastFocus = document.activeElement;
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    panel.querySelector('.a11y-btn, button').focus();
  }
  function closePanel() {
    panel.hidden = true;
    fab.setAttribute('aria-expanded', 'false');
    if (lastFocus) lastFocus.focus(); else fab.focus();
  }

  fab.addEventListener('click', () => { panel.hidden ? openPanel() : closePanel(); });

  panel.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-a11y-action]');
    if (!btn) return;
    const action = btn.dataset.a11yAction;
    if (action === 'scale-up') update({ scaleIdx: Math.min(SCALE_STEPS.length - 1, state.scaleIdx + 1) });
    else if (action === 'scale-down') update({ scaleIdx: Math.max(0, state.scaleIdx - 1) });
    else if (action === 'contrast') update({ contrast: !state.contrast });
    else if (action === 'motion') update({ motion: !state.motion });
    else if (action === 'underline') update({ underline: !state.underline });
    else if (action === 'plainFont') update({ plainFont: !state.plainFont });
    else if (action === 'reset') update({ ...defaults });
  });

  document.addEventListener('keydown', (e) => {
    if (panel.hidden) return;
    if (e.key === 'Escape') { closePanel(); return; }
    if (e.key !== 'Tab') return;
    const focusable = Array.from(panel.querySelectorAll('button:not(:disabled), a[href]'));
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  document.addEventListener('click', (e) => {
    if (panel.hidden) return;
    if (panel.contains(e.target) || fab.contains(e.target)) return;
    closePanel();
  });

  function mount() {
    document.body.appendChild(fab);
    document.body.appendChild(panel);
    syncUI();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
