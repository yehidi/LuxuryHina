(() => {
  'use strict';

  const REPO_OWNER = 'yehidi';
  const REPO_NAME = 'LuxuryHina';
  const BRANCH = 'main';
  const API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
  const TOKEN_KEY = 'lh-admin-token';

  /* Embedded fallback so the panel still opens (against an empty shell)
     even if content.json can't be fetched from GitHub for some reason —
     same resilience philosophy as the public site's script.js. */
  const FALLBACK_CONTENT = {
    theme: 'candlelit',
    business: {
      brandFirst: 'Luxury', brandLast: 'Hina',
      title: 'LuxuryHina | הפקת חינות יוקרתיות ואירועי חינה מרוקאית',
      description: 'הפקת אירועי חינה יוקרתיים בהתאמה אישית: עיצוב ותפאורה מרוקאית, תאורה, עמדות מתוקים וליווי אישי מלא — מהרעיון הראשון ועד הרגע הגדול.',
      url: 'https://yehidi.github.io/LuxuryHina/',
      phoneDisplay: '050-288-3996', phoneIntl: '972502883996',
      email: 'info@luxuryhina.co.il',
      instagramUrl: 'https://www.instagram.com/luxury_hina', instagramHandle: '@luxury_hina',
      facebookUrl: 'https://www.facebook.com/share/19AWW7qJVB/',
      copyrightName: 'LuxuryHina', footerTagline: 'הפקת חינות יוקרתיות'
    },
    nav: { about: 'אודות', services: 'השירותים', process: 'תהליך', gallery: 'גלריה', testimonials: 'המלצות', contact: 'צור קשר' },
    header: { ctaLabel: 'בואו נדבר' },
    hero: { eyebrowNum: '01', eyebrow: 'בוטיק הפקות חינה', title: 'חינה יוקרתית', lede: 'בהתאמה אישית, לחלום שלכם', sub: '', ctaPrimary: 'תיאום פגישת ייעוץ', ctaSecondary: 'לצפייה בעבודות', photo: '', video: '' },
    about: { eyebrowNum: '02', eyebrow: 'מי אנחנו', heading: 'אירוע חינה הוא סיפור.\nאנחנו כאן לספר אותו נכון.', paragraphs: [], photo: '', stats: [{ value: 150, suffix: '+', label: 'אירועים מופקים' }, { value: 10, suffix: '', label: 'שנות ניסיון' }, { value: 100, suffix: '%', label: 'התאמה אישית' }] },
    services: { eyebrowNum: '03', eyebrow: 'מה כלול', heading: 'השירותים שלנו', items: [] },
    process: { eyebrowNum: '04', eyebrow: 'איך זה עובד', heading: '', sub: '', steps: [{ title: '', text: '' }, { title: '', text: '' }, { title: '', text: '' }, { title: '', text: '' }] },
    gallery: { eyebrowNum: '05', eyebrow: 'עבודות נבחרות', heading: 'גלריה', note: 'מתוך אירועים שהפקנו.', items: [] },
    testimonials: { eyebrowNum: '06', eyebrow: 'לקוחות ממליצים', heading: 'מה אומרים עלינו', items: [] },
    faq: { eyebrowNum: '07', eyebrow: 'שאלות נפוצות', heading: 'כל מה שכדאי לדעת', items: [] },
    contact: { eyebrowNum: '08', eyebrow: 'בואו נתחיל לתכנן', heading: 'נדבר על האירוע שלכם?', sub: '', whatsappNote: '', phoneNote: '', emailNote: '', instagramNote: '', whatsappMessageGreeting: 'היי, אשמח לקבל פרטים על הפקת חינה 🙂' }
  };

  const MOTIFS = [
    ['orn-boteh', 'בוטה / פייזלי'],
    ['orn-rosette', 'רוזטה'],
    ['orn-vine', 'גפן'],
    ['orn-mandala', 'מנדלה']
  ];
  const PATTERNS = [
    ['pat-girih', 'גיריח'],
    ['pat-ogee', 'אוג׳י'],
    ['pat-scallop', 'קונכייה']
  ];
  const THEMES = [
    { id: 'candlelit', name: 'Candlelit', desc: 'זהב חם על שחור פחם', swatch: ['#0f0b09', '#dcb978', '#4a1018'] },
    { id: 'light', name: 'Light', desc: 'נייר בהיר וזהב עמוק', swatch: ['#faf7f2', '#815e22', '#7a1f30'] },
    { id: 'bold', name: 'Bold', desc: 'אזמרגד עמוק וזהב-ורד', swatch: ['#071b14', '#dba06a', '#8a1249'] }
  ];

  const state = {
    token: null,
    content: null,
    originalContent: null,
    contentSha: null,
    pendingMedia: {}, // path -> { base64, mime }
    dirty: false
  };

  /* ─────────  small utils  ───────── */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  function elFromHTML(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function esc(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function escXml(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function getPath(obj, path) { return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj); }
  function setPath(obj, path, value) {
    const keys = path.split('.');
    let o = obj;
    for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
    o[keys[keys.length - 1]] = value;
  }
  function utf8ToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    bytes.forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin);
  }
  function base64ToUtf8(b64) {
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  function sanitizeFilename(name) {
    const dot = name.lastIndexOf('.');
    const base = dot > 0 ? name.slice(0, dot) : name;
    const ext = (dot > 0 ? name.slice(dot) : '.bin').toLowerCase();
    const cleanBase = base.normalize('NFKD').replace(/[^\w\- ]/g, '').trim().replace(/\s+/g, '-').toLowerCase();
    const uid = Math.random().toString(36).slice(2, 7);
    return `${cleanBase || 'file'}-${uid}${ext}`;
  }
  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = String(reader.result).split(',')[1];
        resolve({ base64, mime: file.type });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ─────────  toasts  ───────── */
  function toast(msg, kind) {
    const host = $('#toasts');
    const t = elFromHTML(`<div class="toast${kind === 'err' ? ' is-err' : kind === 'ok' ? ' is-ok' : ''}"></div>`);
    t.textContent = msg;
    host.appendChild(t);
    setTimeout(() => t.remove(), 6000);
  }

  /* ─────────  GitHub API  ───────── */
  function authHeaders() {
    return { Authorization: `Bearer ${state.token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  }
  function encodeGhPath(path) { return path.split('/').map(encodeURIComponent).join('/'); }

  async function validateToken(token) {
    const res = await fetch(API, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } });
    if (res.status === 401) throw new Error('הטוקן לא תקין או פג תוקף.');
    if (res.status === 404) throw new Error('אין גישה למאגר LuxuryHina עם הטוקן הזה. ודאו שבחרתם את המאגר הנכון ביצירת הטוקן.');
    if (!res.ok) throw new Error(`שגיאה בחיבור ל-GitHub (${res.status}).`);
    const data = await res.json();
    if (data.permissions && data.permissions.push === false) {
      throw new Error('לטוקן יש הרשאת קריאה בלבד. יש ליצור טוקן עם הרשאת Contents: Read and write.');
    }
    return data;
  }

  async function ghGetSha(path) {
    const res = await fetch(`${API}/contents/${encodeGhPath(path)}?ref=${BRANCH}`, { headers: authHeaders() });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`בדיקת ${path} נכשלה (${res.status}).`);
    const data = await res.json();
    return data.sha;
  }

  async function ghGetFile(path) {
    const res = await fetch(`${API}/contents/${encodeGhPath(path)}?ref=${BRANCH}`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`טעינת ${path} נכשלה (${res.status}).`);
    const data = await res.json();
    const raw = (data.content || '').replace(/\n/g, '');
    return { text: base64ToUtf8(raw), sha: data.sha };
  }

  async function ghPutFile(path, base64Content, message, sha) {
    const body = { message, content: base64Content, branch: BRANCH };
    if (sha) body.sha = sha;
    const res = await fetch(`${API}/contents/${encodeGhPath(path)}`, {
      method: 'PUT',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `שמירת ${path} נכשלה (${res.status}).`);
    }
    return res.json();
  }

  /* ─────────  head patch (SEO / share tags)  ───────── */
  function patchIndexHead(html, content) {
    const b = content.business;
    const brand = `${b.brandFirst}${b.brandLast}`;
    const absUrl = (p) => { try { return new URL(p, b.url).href; } catch (e) { return p; } };
    const heroPhoto = content.hero && content.hero.photo ? absUrl(content.hero.photo) : null;
    const themeColor = { candlelit: '#0f0b09', light: '#faf7f2', bold: '#071b14' }[content.theme] || '#0f0b09';

    let out = html;
    out = out.replace(/<title>[^<]*<\/title>/, `<title>${escXml(b.title)}</title>`);
    out = out.replace(/(<meta name="description" content=")[^"]*(")/, `$1${escXml(b.description)}$2`);
    out = out.replace(/(<meta name="theme-color" content=")[^"]*(")/, `$1${themeColor}$2`);
    out = out.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${escXml(b.url)}$2`);
    out = out.replace(/(<meta property="og:site_name" content=")[^"]*(")/, `$1${escXml(brand)}$2`);
    out = out.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escXml(b.title)}$2`);
    out = out.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escXml(b.description)}$2`);
    out = out.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${escXml(b.url)}$2`);
    if (heroPhoto) {
      out = out.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${escXml(heroPhoto)}$2`);
      out = out.replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${escXml(heroPhoto)}$2`);
    }
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      additionalType: 'https://schema.org/EventService',
      name: brand,
      description: b.description,
      url: b.url,
      ...(heroPhoto ? { image: heroPhoto } : {}),
      telephone: '+' + b.phoneIntl,
      email: b.email,
      priceRange: '$$$',
      areaServed: { '@type': 'Country', name: 'IL' },
      sameAs: [b.instagramUrl, b.facebookUrl].filter(Boolean)
    };
    out = out.replace(/(<script type="application\/ld\+json">)[\s\S]*?(<\/script>)/, `$1\n${JSON.stringify(jsonLd, null, 2)}\n$2`);
    return out;
  }

  /* ─────────  dirty / status  ───────── */
  function markDirty() { setDirty(true); }
  function setDirty(v) {
    state.dirty = v;
    $('#publishBtn').disabled = !v;
    $('#statusDot').classList.toggle('is-dirty', v);
    $('#statusText').textContent = v ? 'יש שינויים שלא פורסמו' : 'כל השינויים פורסמו';
  }
  window.addEventListener('beforeunload', (e) => {
    if (state.dirty) { e.preventDefault(); e.returnValue = ''; }
  });

  /* ─────────  generic static-field binder  ───────── */
  function wireStaticFields(container) {
    $$('[data-bind]', container).forEach((inp) => {
      const path = inp.dataset.bind;
      const val = getPath(state.content, path);
      if (inp.type === 'checkbox') inp.checked = !!val;
      else inp.value = val ?? '';
      inp.addEventListener('input', () => {
        const v = inp.type === 'checkbox' ? inp.checked : inp.value;
        setPath(state.content, path, v);
        markDirty();
      });
    });
  }

  /* ─────────  media field  ───────── */
  function buildMediaField(kind, pathStr, label) {
    const wrap = elFromHTML(`
      <div class="field">
        <span>${esc(label)}</span>
        <div class="media-field">
          <div class="media-thumb"></div>
          <div class="media-controls">
            <button type="button" class="media-upload-btn">${kind === 'image' ? 'העלאת תמונה' : 'העלאת סרטון'}</button>
            <input type="file" accept="${kind === 'image' ? 'image/*' : 'video/*'}" data-media>
            <span class="media-path"></span>
            <button type="button" class="media-remove" hidden>הסרה</button>
          </div>
        </div>
      </div>`);
    const thumb = $('.media-thumb', wrap);
    const pathEl = $('.media-path', wrap);
    const uploadBtn = $('.media-upload-btn', wrap);
    const fileInput = $('[data-media]', wrap);
    const removeBtn = $('.media-remove', wrap);

    function refresh() {
      const val = getPath(state.content, pathStr) || '';
      pathEl.textContent = val || '(אין קובץ)';
      removeBtn.hidden = !val;
      thumb.innerHTML = '';
      thumb.style.backgroundImage = '';
      if (!val) { thumb.textContent = kind === 'image' ? '🖼️' : '🎬'; return; }
      const pending = state.pendingMedia[val];
      const src = pending ? `data:${pending.mime};base64,${pending.base64}` : val;
      if (kind === 'image') {
        thumb.style.backgroundImage = `url("${src}")`;
      } else {
        thumb.textContent = '🎬';
      }
    }

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      try {
        const { base64, mime } = await readFileAsBase64(file);
        const dir = kind === 'image' ? 'images' : 'videos';
        const newPath = `${dir}/${sanitizeFilename(file.name)}`;
        state.pendingMedia[newPath] = { base64, mime };
        setPath(state.content, pathStr, newPath);
        markDirty();
        refresh();
      } catch (e) {
        toast('העלאת הקובץ נכשלה: ' + e.message, 'err');
      } finally {
        fileInput.value = '';
      }
    });
    removeBtn.addEventListener('click', () => {
      setPath(state.content, pathStr, '');
      markDirty();
      refresh();
    });

    refresh();
    return wrap;
  }

  /* ─────────  option select helper  ───────── */
  function selectHTML(dataAttr, options, current) {
    return `<select ${dataAttr}>${options.map(([v, l]) => `<option value="${v}"${v === current ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  }

  /* ═══════════════  LIST SECTIONS  ═══════════════ */
  function buildListSection({ container, items, itemLabel, fields, newItem, mediaFields }) {
    const list = elFromHTML('<div class="list-host"></div>');
    const addBtn = elFromHTML(`<button type="button" class="add-item-btn">+ הוספת ${esc(itemLabel)}</button>`);

    function renderList() {
      list.innerHTML = '';
      items.forEach((item, i) => {
        const card = elFromHTML(`
          <div class="item-card" data-index="${i}">
            <div class="item-card-head">
              <span class="item-num">${String(i + 1).padStart(2, '0')}</span>
              <span class="item-title">${esc(itemLabel)} ${i + 1}</span>
              <div class="item-actions">
                <button type="button" class="icon-btn" data-action="up" title="הזזה למעלה" ${i === 0 ? 'disabled' : ''}>↑</button>
                <button type="button" class="icon-btn" data-action="down" title="הזזה למטה" ${i === items.length - 1 ? 'disabled' : ''}>↓</button>
                <button type="button" class="icon-btn danger" data-action="remove" title="מחיקה">🗑</button>
              </div>
            </div>
            <div class="item-fields"></div>
          </div>`);
        const fieldsHost = $('.item-fields', card);
        fields.forEach((f) => {
          if (f.type === 'text' || f.type === 'textarea') {
            const tag = f.type === 'textarea' ? 'textarea' : 'input';
            const attrs = f.type === 'textarea' ? '' : 'type="text"';
            const fEl = elFromHTML(`<label class="field"><span>${esc(f.label)}</span><${tag} ${attrs} data-item-field="${f.key}"></${tag}></label>`);
            $(`[data-item-field]`, fEl).value = item[f.key] ?? '';
            fieldsHost.appendChild(fEl);
          } else if (f.type === 'select') {
            const fEl = elFromHTML(`<label class="field"><span>${esc(f.label)}</span>${selectHTML(`data-item-field="${f.key}"`, f.options, item[f.key])}</label>`);
            fieldsHost.appendChild(fEl);
          } else if (f.type === 'checkbox') {
            const fEl = elFromHTML(`<label class="field" style="display:flex;align-items:center;gap:9px;"><input type="checkbox" data-item-field="${f.key}" style="width:auto;"><span style="margin:0;">${esc(f.label)}</span></label>`);
            $('input', fEl).checked = !!item[f.key];
            fieldsHost.appendChild(fEl);
          }
        });
        (mediaFields || []).forEach((m) => {
          fieldsHost.appendChild(buildItemMediaField(item, m));
        });
        list.appendChild(card);
      });
    }

    function buildItemMediaField(item, m) {
      const wrap = elFromHTML(`
        <div class="field">
          <span>${esc(m.label)}</span>
          <div class="media-field">
            <div class="media-thumb"></div>
            <div class="media-controls">
              <button type="button" class="media-upload-btn">${m.kind === 'image' ? 'העלאת תמונה' : 'העלאת סרטון'}</button>
              <input type="file" accept="${m.kind === 'image' ? 'image/*' : 'video/*'}" data-media>
              <span class="media-path"></span>
              <button type="button" class="media-remove" hidden>הסרה</button>
            </div>
          </div>
        </div>`);
      const thumb = $('.media-thumb', wrap);
      const pathEl = $('.media-path', wrap);
      const uploadBtn = $('.media-upload-btn', wrap);
      const fileInput = $('[data-media]', wrap);
      const removeBtn = $('.media-remove', wrap);
      function refresh() {
        const val = item[m.key] || '';
        pathEl.textContent = val || '(אין קובץ)';
        removeBtn.hidden = !val;
        thumb.style.backgroundImage = '';
        thumb.textContent = '';
        if (!val) { thumb.textContent = m.kind === 'image' ? '🖼️' : '🎬'; return; }
        const pending = state.pendingMedia[val];
        const src = pending ? `data:${pending.mime};base64,${pending.base64}` : val;
        if (m.kind === 'image') thumb.style.backgroundImage = `url("${src}")`;
        else thumb.textContent = '🎬';
      }
      uploadBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (!file) return;
        try {
          const { base64, mime } = await readFileAsBase64(file);
          const dir = m.kind === 'image' ? 'images' : 'videos';
          const newPath = `${dir}/${sanitizeFilename(file.name)}`;
          state.pendingMedia[newPath] = { base64, mime };
          item[m.key] = newPath;
          markDirty();
          refresh();
        } catch (e) {
          toast('העלאת הקובץ נכשלה: ' + e.message, 'err');
        } finally {
          fileInput.value = '';
        }
      });
      removeBtn.addEventListener('click', () => { item[m.key] = ''; markDirty(); refresh(); });
      refresh();
      return wrap;
    }

    list.addEventListener('input', (e) => {
      const t = e.target;
      if (!t.matches('[data-item-field]')) return;
      const card = t.closest('.item-card');
      const i = Number(card.dataset.index);
      const key = t.dataset.itemField;
      items[i][key] = t.type === 'checkbox' ? t.checked : t.value;
      markDirty();
    });
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const card = btn.closest('.item-card');
      const i = Number(card.dataset.index);
      const action = btn.dataset.action;
      if (action === 'remove') {
        if (!confirm(`למחוק את ${itemLabel} ${i + 1}?`)) return;
        items.splice(i, 1);
      } else if (action === 'up' && i > 0) {
        [items[i - 1], items[i]] = [items[i], items[i - 1]];
      } else if (action === 'down' && i < items.length - 1) {
        [items[i + 1], items[i]] = [items[i], items[i + 1]];
      } else {
        return;
      }
      markDirty();
      renderList();
    });
    addBtn.addEventListener('click', () => {
      items.push(JSON.parse(JSON.stringify(newItem)));
      markDirty();
      renderList();
    });

    renderList();
    container.appendChild(list);
    container.appendChild(addBtn);
  }

  /* ═══════════════  SECTION DEFINITIONS  ═══════════════ */
  function buildThemeSection(container) {
    container.insertAdjacentHTML('beforeend', `<h2>עיצוב ותבנית</h2><p class="section-hint">בחרו את סגנון העיצוב הכללי של האתר. השינוי חל על כל האתר מיד עם הפרסום.</p>`);
    const grid = elFromHTML('<div class="theme-grid"></div>');
    THEMES.forEach((t) => {
      const card = elFromHTML(`
        <button type="button" class="theme-card" data-theme-id="${t.id}">
          <span class="theme-check">✓</span>
          <div class="theme-swatch">
            <span style="background:${t.swatch[0]}"></span>
            <span style="background:${t.swatch[1]}"></span>
            <span style="background:${t.swatch[2]}"></span>
          </div>
          <div class="theme-card-body"><b>${t.name}</b><small>${esc(t.desc)}</small></div>
        </button>`);
      card.addEventListener('click', () => {
        state.content.theme = t.id;
        markDirty();
        $$('.theme-card', grid).forEach((c) => c.classList.toggle('is-selected', c.dataset.themeId === t.id));
      });
      grid.appendChild(card);
    });
    container.appendChild(grid);
    $$('.theme-card', grid).forEach((c) => c.classList.toggle('is-selected', c.dataset.themeId === state.content.theme));
  }

  function buildBusinessSection(container) {
    container.insertAdjacentHTML('beforeend', `
      <h2>פרטי העסק</h2>
      <p class="section-hint">שם המותג, פרטי הקשר והרשתות החברתיות שמופיעים בכל האתר.</p>
      <div class="panel">
        <h3>מיתוג</h3>
        <div class="field-row">
          <label class="field"><span>שם פרטי במותג</span><input type="text" data-bind="business.brandFirst"></label>
          <label class="field"><span>המשך שם המותג</span><input type="text" data-bind="business.brandLast"></label>
        </div>
        <label class="field"><span>שם לזכויות יוצרים (פוטר)</span><input type="text" data-bind="business.copyrightName"></label>
        <label class="field"><span>תיאור קצר בפוטר</span><input type="text" data-bind="business.footerTagline"></label>
      </div>
      <div class="panel">
        <h3>פרטי קשר ורשתות</h3>
        <div class="field-row">
          <label class="field"><span>טלפון לתצוגה</span><input type="text" data-bind="business.phoneDisplay" placeholder="050-288-3996"></label>
          <label class="field"><span>טלפון בינלאומי (ללא +)</span><input type="text" data-bind="business.phoneIntl" placeholder="972501234567"></label>
        </div>
        <label class="field"><span>אימייל</span><input type="email" data-bind="business.email"></label>
        <div class="field-row">
          <label class="field"><span>קישור אינסטגרם</span><input type="url" data-bind="business.instagramUrl"></label>
          <label class="field"><span>שם משתמש להצגה</span><input type="text" data-bind="business.instagramHandle" placeholder="@luxury_hina"></label>
        </div>
        <label class="field"><span>קישור פייסבוק</span><input type="url" data-bind="business.facebookUrl"></label>
      </div>
      <div class="panel">
        <h3>SEO ושיתוף</h3>
        <p class="field-hint" style="margin:0 0 16px;">אלה הטקסטים שמופיעים בתוצאות גוגל ובתצוגה המקדימה כששולחים את הקישור בוואטסאפ.</p>
        <label class="field"><span>כותרת האתר (Title)</span><input type="text" data-bind="business.title"></label>
        <label class="field"><span>תיאור האתר</span><textarea data-bind="business.description"></textarea></label>
        <label class="field"><span>כתובת האתר (URL)</span><input type="url" data-bind="business.url"></label>
      </div>`);
    wireStaticFields(container);
  }

  function buildNavSection(container) {
    container.insertAdjacentHTML('beforeend', `
      <h2>תפריט ניווט</h2>
      <p class="section-hint">הטקסטים שמופיעים בתפריט העליון ובכפתור הקריאה לפעולה.</p>
      <div class="panel">
        <div class="field-row">
          <label class="field"><span>אודות</span><input type="text" data-bind="nav.about"></label>
          <label class="field"><span>השירותים</span><input type="text" data-bind="nav.services"></label>
        </div>
        <div class="field-row">
          <label class="field"><span>תהליך</span><input type="text" data-bind="nav.process"></label>
          <label class="field"><span>גלריה</span><input type="text" data-bind="nav.gallery"></label>
        </div>
        <div class="field-row">
          <label class="field"><span>המלצות</span><input type="text" data-bind="nav.testimonials"></label>
          <label class="field"><span>צור קשר</span><input type="text" data-bind="nav.contact"></label>
        </div>
        <label class="field"><span>כפתור קריאה לפעולה בתפריט</span><input type="text" data-bind="header.ctaLabel"></label>
      </div>`);
    wireStaticFields(container);
  }

  function buildHeroSection(container) {
    container.insertAdjacentHTML('beforeend', `
      <h2>עמוד הבית (Hero)</h2>
      <p class="section-hint">הקטע הראשון שהמבקרים רואים.</p>
      <div class="panel">
        <label class="field"><span>מספר סקציה (01)</span><input type="text" data-bind="hero.eyebrowNum" style="max-width:100px;"></label>
        <label class="field"><span>תווית עליונה</span><input type="text" data-bind="hero.eyebrow"></label>
        <label class="field"><span>כותרת ראשית</span><input type="text" data-bind="hero.title"></label>
        <label class="field"><span>שורת משנה</span><input type="text" data-bind="hero.lede"></label>
        <label class="field"><span>טקסט הסבר</span><textarea data-bind="hero.sub"></textarea></label>
        <div class="field-row">
          <label class="field"><span>כפתור ראשי</span><input type="text" data-bind="hero.ctaPrimary"></label>
          <label class="field"><span>כפתור משני</span><input type="text" data-bind="hero.ctaSecondary"></label>
        </div>
      </div>
      <div class="panel"><h3>מדיה</h3><div id="heroMediaHost"></div></div>`);
    wireStaticFields(container);
    const host = $('#heroMediaHost', container);
    host.appendChild(buildMediaField('image', 'hero.photo', 'תמונת רקע'));
    host.appendChild(buildMediaField('video', 'hero.video', 'סרטון רקע (גובר על התמונה אם קיים)'));
  }

  function buildAboutSection(container) {
    container.insertAdjacentHTML('beforeend', `
      <h2>אודות</h2>
      <div class="panel">
        <label class="field"><span>מספר סקציה (02)</span><input type="text" data-bind="about.eyebrowNum" style="max-width:100px;"></label>
        <label class="field"><span>תווית עליונה</span><input type="text" data-bind="about.eyebrow"></label>
        <label class="field"><span>כותרת (אפשר לשבור שורה עם Enter)</span><textarea data-bind="about.heading"></textarea></label>
        <label class="field"><span>פסקאות (שורה ריקה מפרידה בין פסקאות)</span><textarea id="aboutParagraphs" style="min-height:140px;"></textarea></label>
      </div>
      <div class="panel"><h3>מדיה</h3><div id="aboutMediaHost"></div></div>
      <div class="panel">
        <h3>מספרים (סטטיסטיקות)</h3>
        <div class="field-row">
          <label class="field"><span>מספר 1</span><input type="text" data-bind="about.stats.0.value"></label>
          <label class="field"><span>סימן (%,+)</span><input type="text" data-bind="about.stats.0.suffix"></label>
          <label class="field"><span>תווית</span><input type="text" data-bind="about.stats.0.label"></label>
        </div>
        <div class="field-row">
          <label class="field"><span>מספר 2</span><input type="text" data-bind="about.stats.1.value"></label>
          <label class="field"><span>סימן</span><input type="text" data-bind="about.stats.1.suffix"></label>
          <label class="field"><span>תווית</span><input type="text" data-bind="about.stats.1.label"></label>
        </div>
        <div class="field-row">
          <label class="field"><span>מספר 3</span><input type="text" data-bind="about.stats.2.value"></label>
          <label class="field"><span>סימן</span><input type="text" data-bind="about.stats.2.suffix"></label>
          <label class="field"><span>תווית</span><input type="text" data-bind="about.stats.2.label"></label>
        </div>
      </div>`);
    wireStaticFields(container);
    const ta = $('#aboutParagraphs', container);
    ta.value = state.content.about.paragraphs.join('\n\n');
    ta.addEventListener('input', () => {
      state.content.about.paragraphs = ta.value.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
      markDirty();
    });
    $('#aboutMediaHost', container).appendChild(buildMediaField('image', 'about.photo', 'תמונת פאנל'));
  }

  function buildProcessSection(container) {
    container.insertAdjacentHTML('beforeend', `
      <h2>תהליך העבודה</h2>
      <p class="section-hint">ארבעת השלבים הקבועים שמוצגים באתר.</p>
      <div class="panel">
        <label class="field"><span>מספר סקציה (04)</span><input type="text" data-bind="process.eyebrowNum" style="max-width:100px;"></label>
        <label class="field"><span>תווית עליונה</span><input type="text" data-bind="process.eyebrow"></label>
        <label class="field"><span>כותרת</span><input type="text" data-bind="process.heading"></label>
        <label class="field"><span>טקסט הסבר</span><textarea data-bind="process.sub"></textarea></label>
      </div>
      <div id="processSteps"></div>`);
    wireStaticFields(container);
    const host = $('#processSteps', container);
    state.content.process.steps.forEach((step, i) => {
      const card = elFromHTML(`
        <div class="item-card">
          <div class="item-card-head"><span class="item-num">${i + 1}</span><span class="item-title">שלב ${i + 1}</span></div>
          <div class="item-fields">
            <label class="field"><span>כותרת השלב</span><input type="text" data-bind="process.steps.${i}.title"></label>
            <label class="field"><span>תיאור השלב</span><textarea data-bind="process.steps.${i}.text"></textarea></label>
          </div>
        </div>`);
      host.appendChild(card);
    });
    wireStaticFields(host);
  }

  function buildServicesSection(container) {
    container.insertAdjacentHTML('beforeend', `
      <h2>שירותים</h2>
      <p class="section-hint">רשימת השירותים המוצגת באתר — אפשר להוסיף, למחוק ולשנות סדר.</p>
      <div class="panel">
        <label class="field"><span>מספר סקציה (03)</span><input type="text" data-bind="services.eyebrowNum" style="max-width:100px;"></label>
        <label class="field"><span>תווית עליונה</span><input type="text" data-bind="services.eyebrow"></label>
        <label class="field"><span>כותרת</span><input type="text" data-bind="services.heading"></label>
      </div>`);
    wireStaticFields(container);
    buildListSection({
      container,
      items: state.content.services.items,
      itemLabel: 'שירות',
      fields: [
        { key: 'title', label: 'כותרת', type: 'text' },
        { key: 'text', label: 'תיאור', type: 'textarea' },
        { key: 'motif', label: 'עיטור', type: 'select', options: MOTIFS }
      ],
      newItem: { title: 'שירות חדש', text: '', motif: 'orn-boteh' }
    });
  }

  function buildGallerySection(container) {
    container.insertAdjacentHTML('beforeend', `
      <h2>גלריה</h2>
      <p class="section-hint">עבודות לתצוגה בגלריה — אפשר להוסיף, למחוק, לשנות סדר ולהעלות תמונה/סרטון לכל פריט.</p>
      <div class="panel">
        <label class="field"><span>מספר סקציה (05)</span><input type="text" data-bind="gallery.eyebrowNum" style="max-width:100px;"></label>
        <label class="field"><span>תווית עליונה</span><input type="text" data-bind="gallery.eyebrow"></label>
        <label class="field"><span>כותרת</span><input type="text" data-bind="gallery.heading"></label>
        <label class="field"><span>משפט קצר מתחת לגלריה (הקישור לאינסטגרם מתווסף אוטומטית)</span><input type="text" data-bind="gallery.note"></label>
      </div>`);
    wireStaticFields(container);
    buildListSection({
      container,
      items: state.content.gallery.items,
      itemLabel: 'פריט',
      fields: [
        { key: 'title', label: 'כותרת', type: 'text' },
        { key: 'motif', label: 'עיטור', type: 'select', options: MOTIFS },
        { key: 'pattern', label: 'דוגמת רקע', type: 'select', options: PATTERNS },
        { key: 'tone', label: 'גוון', type: 'select', options: [['a', 'א'], ['b', 'ב']] },
        { key: 'tall', label: 'לוח גבוה (תופס יותר גובה בגריד)', type: 'checkbox' }
      ],
      mediaFields: [{ key: 'photo', kind: 'image', label: 'תמונה' }, { key: 'video', kind: 'video', label: 'סרטון (מתנגן בריחוף עכבר)' }],
      newItem: { title: 'עבודה חדשה', photo: '', video: '', tall: false, motif: 'orn-mandala', tone: 'a', pattern: 'pat-girih' }
    });
  }

  function buildTestimonialsSection(container) {
    container.insertAdjacentHTML('beforeend', `
      <h2>המלצות</h2>
      <p class="section-hint">המלצות לקוחות אמיתיות — אפשר להוסיף, למחוק ולשנות סדר.</p>
      <div class="panel">
        <label class="field"><span>מספר סקציה (06)</span><input type="text" data-bind="testimonials.eyebrowNum" style="max-width:100px;"></label>
        <label class="field"><span>תווית עליונה</span><input type="text" data-bind="testimonials.eyebrow"></label>
        <label class="field"><span>כותרת</span><input type="text" data-bind="testimonials.heading"></label>
      </div>`);
    wireStaticFields(container);
    buildListSection({
      container,
      items: state.content.testimonials.items,
      itemLabel: 'המלצה',
      fields: [
        { key: 'text', label: 'תוכן ההמלצה', type: 'textarea' },
        { key: 'author', label: 'שם הממליץ/ה', type: 'text' }
      ],
      newItem: { text: '', author: '' }
    });
  }

  function buildFaqSection(container) {
    container.insertAdjacentHTML('beforeend', `
      <h2>שאלות נפוצות</h2>
      <p class="section-hint">אפשר להוסיף, למחוק ולשנות סדר של שאלות.</p>
      <div class="panel">
        <label class="field"><span>מספר סקציה (07)</span><input type="text" data-bind="faq.eyebrowNum" style="max-width:100px;"></label>
        <label class="field"><span>תווית עליונה</span><input type="text" data-bind="faq.eyebrow"></label>
        <label class="field"><span>כותרת</span><input type="text" data-bind="faq.heading"></label>
      </div>`);
    wireStaticFields(container);
    buildListSection({
      container,
      items: state.content.faq.items,
      itemLabel: 'שאלה',
      fields: [
        { key: 'q', label: 'השאלה', type: 'text' },
        { key: 'a', label: 'התשובה', type: 'textarea' }
      ],
      newItem: { q: '', a: '' }
    });
  }

  function buildContactSection(container) {
    container.insertAdjacentHTML('beforeend', `
      <h2>יצירת קשר</h2>
      <div class="panel">
        <label class="field"><span>מספר סקציה (08)</span><input type="text" data-bind="contact.eyebrowNum" style="max-width:100px;"></label>
        <label class="field"><span>תווית עליונה</span><input type="text" data-bind="contact.eyebrow"></label>
        <label class="field"><span>כותרת</span><input type="text" data-bind="contact.heading"></label>
        <label class="field"><span>טקסט הסבר</span><textarea data-bind="contact.sub"></textarea></label>
        <div class="field-row">
          <label class="field"><span>הערה ליד וואטסאפ</span><input type="text" data-bind="contact.whatsappNote"></label>
          <label class="field"><span>הערה ליד טלפון</span><input type="text" data-bind="contact.phoneNote"></label>
        </div>
        <div class="field-row">
          <label class="field"><span>הערה ליד אימייל</span><input type="text" data-bind="contact.emailNote"></label>
          <label class="field"><span>הערה ליד אינסטגרם</span><input type="text" data-bind="contact.instagramNote"></label>
        </div>
        <label class="field"><span>פתיח להודעת וואטסאפ מהטופס</span><input type="text" data-bind="contact.whatsappMessageGreeting"></label>
      </div>`);
    wireStaticFields(container);
  }

  const SECTIONS = [
    { id: 'theme', build: buildThemeSection },
    { id: 'business', build: buildBusinessSection },
    { id: 'nav', build: buildNavSection },
    { id: 'hero', build: buildHeroSection },
    { id: 'about', build: buildAboutSection },
    { id: 'services', build: buildServicesSection },
    { id: 'process', build: buildProcessSection },
    { id: 'gallery', build: buildGallerySection },
    { id: 'testimonials', build: buildTestimonialsSection },
    { id: 'faq', build: buildFaqSection },
    { id: 'contact', build: buildContactSection }
  ];

  function buildAllSections() {
    const editor = $('#editor');
    editor.innerHTML = '';
    SECTIONS.forEach((s) => {
      const el = elFromHTML(`<section class="editor-section" id="section-${s.id}"></section>`);
      s.build(el);
      editor.appendChild(el);
    });
    showSection('theme');
  }

  function showSection(id) {
    $$('.editor-section').forEach((el) => el.classList.toggle('is-active', el.id === `section-${id}`));
    $$('.side-item').forEach((btn) => btn.classList.toggle('is-active', btn.dataset.section === id));
    $('#editor').scrollTop = 0;
  }

  /* ─────────  validation  ───────── */
  function validateBeforePublish() {
    const b = state.content.business;
    if (!b.brandFirst.trim() || !b.brandLast.trim()) { toast('יש למלא את שם המותג בפרטי העסק.', 'err'); showSection('business'); return false; }
    if (!/^\d{9,15}$/.test(b.phoneIntl.replace(/\D/g, ''))) { toast('מספר הטלפון הבינלאומי לא תקין (רק ספרות, למשל 972501234567).', 'err'); showSection('business'); return false; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.email.trim())) { toast('כתובת האימייל לא תקינה.', 'err'); showSection('business'); return false; }
    if (!/^https?:\/\//.test(b.url.trim())) { toast('כתובת האתר צריכה להתחיל ב-https://', 'err'); showSection('business'); return false; }
    return true;
  }

  /* ─────────  preview  ───────── */
  function buildPreviewContent() {
    const clone = JSON.parse(JSON.stringify(state.content));
    const swap = (val) => (val && state.pendingMedia[val]) ? `data:${state.pendingMedia[val].mime};base64,${state.pendingMedia[val].base64}` : val;
    clone.hero.photo = swap(clone.hero.photo);
    clone.hero.video = swap(clone.hero.video);
    clone.about.photo = swap(clone.about.photo);
    (clone.gallery.items || []).forEach((it) => { it.photo = swap(it.photo); it.video = swap(it.video); });
    return clone;
  }
  function openPreview() {
    try {
      sessionStorage.setItem('lh-preview-content', JSON.stringify(buildPreviewContent()));
      window.open('index.html', 'lh-preview');
    } catch (e) {
      toast('לא הצלחתי לפתוח תצוגה מקדימה: ' + e.message, 'err');
    }
  }

  /* ─────────  publish  ───────── */
  function openPublishModal(steps) {
    const modal = $('#publishModal');
    const list = $('#publishSteps');
    list.innerHTML = steps.map((s, i) => `<li data-i="${i}"><span class="step-icon">•</span><span class="step-label">${esc(s.label)}</span></li>`).join('');
    $('#publishCloseBtn').hidden = true;
    modal.hidden = false;
  }
  function setStepState(i, cls, icon) {
    const li = $(`#publishSteps li[data-i="${i}"]`);
    if (!li) return;
    li.classList.remove('is-active', 'is-done', 'is-err');
    li.classList.add(cls);
    $('.step-icon', li).textContent = icon;
  }
  function finishPublishModal() { $('#publishCloseBtn').hidden = false; }

  async function publish() {
    if (!validateBeforePublish()) return;
    const publishBtn = $('#publishBtn');
    publishBtn.disabled = true;
    $('.btn-label', publishBtn).hidden = true;
    $('.btn-spin', publishBtn).hidden = false;

    const planSteps = [];
    const mediaPaths = Object.keys(state.pendingMedia);
    mediaPaths.forEach((p) => planSteps.push({ type: 'media', path: p, label: `מעלה קובץ מדיה: ${p}` }));
    planSteps.push({ type: 'content', label: 'שומר תוכן (content.json)' });

    let patchedHead = null;
    let headSha = null;
    try {
      const current = await ghGetFile('index.html');
      const patched = patchIndexHead(current.text, state.content);
      if (patched !== current.text) {
        patchedHead = patched;
        headSha = current.sha;
        planSteps.push({ type: 'head', label: 'מעדכן תגיות SEO ושיתוף' });
      }
    } catch (e) {
      toast('לא הצלחתי לבדוק תגיות SEO — ממשיך בלעדיהן.', 'err');
    }

    openPublishModal(planSteps);
    let failed = false;
    try {
      for (let i = 0; i < planSteps.length; i++) {
        setStepState(i, 'is-active', '…');
        const step = planSteps[i];
        if (step.type === 'media') {
          const m = state.pendingMedia[step.path];
          const sha = await ghGetSha(step.path);
          await ghPutFile(step.path, m.base64, `עדכון מדיה מהפאנל: ${step.path}`, sha);
        } else if (step.type === 'content') {
          const sha = await ghGetSha('content.json');
          const body = utf8ToBase64(JSON.stringify(state.content, null, 2));
          const result = await ghPutFile('content.json', body, 'עדכון תוכן האתר מהפאנל', sha);
          state.contentSha = result.content && result.content.sha;
        } else if (step.type === 'head') {
          await ghPutFile('index.html', utf8ToBase64(patchedHead), 'עדכון תגיות SEO ושיתוף מהפאנל', headSha);
        }
        setStepState(i, 'is-done', '✓');
      }
      state.pendingMedia = {};
      state.originalContent = JSON.parse(JSON.stringify(state.content));
      setDirty(false);
      toast('הפרסום הושלם בהצלחה — האתר עודכן.', 'ok');
    } catch (e) {
      failed = true;
      const activeLi = $('#publishSteps li.is-active');
      if (activeLi) {
        const i = Number(activeLi.dataset.i);
        setStepState(i, 'is-err', '!');
      }
      toast('הפרסום נעצר: ' + e.message, 'err');
    } finally {
      finishPublishModal();
      $('.btn-label', publishBtn).hidden = false;
      $('.btn-spin', publishBtn).hidden = true;
      publishBtn.disabled = !state.dirty;
    }
  }

  /* ─────────  auth / bootstrap  ───────── */
  async function loadContent() {
    try {
      const file = await ghGetFile('content.json');
      state.content = JSON.parse(file.text);
      state.contentSha = file.sha;
    } catch (e) {
      toast('לא הצלחתי לטעון את content.json מ-GitHub, טוען תוכן בסיסי במקום.', 'err');
      state.content = JSON.parse(JSON.stringify(FALLBACK_CONTENT));
    }
    state.originalContent = JSON.parse(JSON.stringify(state.content));
    state.pendingMedia = {};
    setDirty(false);
  }

  function showApp() {
    $('#loginScreen').hidden = true;
    $('#app').hidden = false;
    buildAllSections();
  }
  function showLogin(errMsg) {
    $('#app').hidden = true;
    $('#loginScreen').hidden = false;
    const err = $('#loginError');
    if (errMsg) { err.textContent = errMsg; err.hidden = false; } else { err.hidden = true; }
  }

  async function attemptLogin(token, { silent } = {}) {
    const loginBtn = $('#loginBtn');
    if (!silent) {
      loginBtn.disabled = true;
      $('.btn-label', loginBtn).hidden = true;
      $('.btn-spin', loginBtn).hidden = false;
    }
    try {
      await validateToken(token);
      state.token = token;
      localStorage.setItem(TOKEN_KEY, token);
      await loadContent();
      showApp();
    } catch (e) {
      localStorage.removeItem(TOKEN_KEY);
      showLogin(e.message);
    } finally {
      if (!silent) {
        loginBtn.disabled = false;
        $('.btn-label', loginBtn).hidden = false;
        $('.btn-spin', loginBtn).hidden = true;
      }
    }
  }

  function init() {
    $('#loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const token = $('#tokenInput').value.trim();
      if (!token) return;
      attemptLogin(token);
    });
    $('#logoutBtn').addEventListener('click', () => {
      if (state.dirty && !confirm('יש שינויים שלא פורסמו — להתנתק בכל זאת?')) return;
      localStorage.removeItem(TOKEN_KEY);
      state.token = null;
      state.content = null;
      showLogin();
    });
    $('#sidebar').addEventListener('click', (e) => {
      const btn = e.target.closest('.side-item');
      if (!btn) return;
      showSection(btn.dataset.section);
    });
    $('#previewBtn').addEventListener('click', openPreview);
    $('#publishBtn').addEventListener('click', publish);
    $('#publishCloseBtn').addEventListener('click', () => { $('#publishModal').hidden = true; });

    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) attemptLogin(saved, { silent: true });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
