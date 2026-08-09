(() => {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine   = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ═══════════════════════════════════════════════════════════════
     CONTENT — every visible section is rendered from this object.
     DEFAULT_CONTENT is the full fallback: if content.json is missing,
     fails to parse, or a field is absent from it, the site still
     renders completely and correctly from these values. This also
     means a partial content.json (e.g. hand-edited, or written by a
     future admin-panel version) can safely omit sections it doesn't
     touch — they fall back to this shape rather than disappearing.
     ═══════════════════════════════════════════════════════════════ */
  const DEFAULT_CONTENT = {
    theme: 'candlelit',
    business: {
      brandFirst: 'Luxury', brandLast: 'Hina',
      copyrightName: 'LuxuryHina', footerTagline: 'הפקת חינות יוקרתיות',
      phoneDisplay: '050-288-3996', phoneIntl: '972502883996',
      email: 'info@luxuryhina.co.il',
      instagramUrl: 'https://www.instagram.com/luxury_hina', instagramHandle: '@luxury_hina',
      facebookUrl: 'https://www.facebook.com/share/19AWW7qJVB/'
    },
    header: { ctaLabel: 'בואו נדבר' },
    nav: {
      about: 'אודות', services: 'השירותים', process: 'תהליך',
      gallery: 'גלריה', testimonials: 'המלצות', contact: 'צור קשר'
    },
    hero: {
      eyebrowNum: '01', eyebrow: 'בוטיק הפקות חינה',
      title: 'חינה יוקרתית', lede: 'בהתאמה אישית, לחלום שלכם',
      sub: 'עיצוב, תפאורה ואווירה שמתוכננים בקפידה — וליווי אישי מהרעיון הראשון ועד הרגע הגדול.',
      ctaPrimary: 'תיאום פגישת ייעוץ', ctaSecondary: 'לצפייה בעבודות',
      photo: 'images/IMG_4621.jpeg', video: 'videos/hero.mp4'
    },
    about: {
      eyebrowNum: '02', eyebrow: 'מי אנחנו',
      heading: 'אירוע חינה הוא סיפור.\nאנחנו כאן לספר אותו נכון.',
      paragraphs: [
        'אנחנו צוות מפיקים ומעצבים המתמחה באירועי חינה יוקרתיים, המשלבים מסורת עשירה עם עיצוב עכשווי ומדויק. כל אירוע מתחיל בהקשבה — לסיפור המשפחה, למנהגים, לצבעים ולחלום שלכם.',
        'מתפאורה מרהיבה ותאורה אווירתית, דרך עמדות מזון וריחות מסורתיים, ועד לליווי צמוד בכל שלב — אנחנו דואגים שתוכלו פשוט ליהנות מהרגע.'
      ],
      photo: 'images/IMG_4631.jpeg',
      stats: [
        { value: 150, suffix: '+', label: 'אירועים מופקים' },
        { value: 10,  suffix: '',  label: 'שנות ניסיון' },
        { value: 100, suffix: '%', label: 'התאמה אישית' }
      ]
    },
    services: {
      eyebrowNum: '03', eyebrow: 'מה כלול', heading: 'השירותים שלנו',
      items: [
        { title: 'עיצוב ותפאורה', text: 'עיצוב חלל מלא הכולל בדים, כריות, פנסים, שטיחים ופרטי נוי בסגנון מסורתי־מודרני.', motif: 'orn-boteh' },
        { title: 'קונספט אישי', text: 'בניית קונספט צבעוני וייחודי המותאם לסיפור המשפחה ולטעם האישי שלכם.', motif: 'orn-rosette' },
        { title: 'קייטרינג ומתוקים', text: 'עמדות פירות, מתוקים מסורתיים ותה בהתאמה מלאה לאווירת האירוע.', motif: 'orn-vine' },
        { title: 'הפקה מלאה באירוע', text: 'ניהול לוגיסטי, תיאום ספקים וליווי צמוד ביום האירוע — כדי שתהיו נוכחים ברגע, לא בפרטים.', motif: 'orn-mandala' },
        { title: 'תאורה ואווירה', text: 'תכנון תאורה שמדגיש כל פינה ויוצר אווירה חמה, קסומה ומיוחדת.', motif: 'orn-rosette' },
        { title: 'ליווי אישי מהיום הראשון', text: 'פגישת ייעוץ, הצעת עיצוב מותאמת, ותיאום מלא עד לרגע האירוע עצמו.', motif: 'orn-boteh' }
      ]
    },
    process: {
      eyebrowNum: '04', eyebrow: 'איך זה עובד',
      heading: 'מהפנייה הראשונה ועד הרגע הגדול',
      sub: 'בלי הפתעות ובלי עומס — ארבעה שלבים ברורים, ואנחנו איתכם בכל אחד מהם.',
      steps: [
        { title: 'שיחת היכרות', text: 'מדברים על התאריך, מספר האורחים, המקום והחלום שלכם. בסוף השיחה תדעו בדיוק מה אפשרי ומה זה כולל.' },
        { title: 'הצעת עיצוב אישית', text: 'בונים לכם קונספט מותאם — צבעים, תפאורה, תאורה ועמדות — יחד עם הצעת מחיר מפורטת וברורה.' },
        { title: 'תכנון והפקה', text: 'מתאמים ספקים, לוחות זמנים ולוגיסטיקה. אתם מקבלים עדכונים לאורך הדרך ולא צריכים לרדוף אחרי אף אחד.' },
        { title: 'יום האירוע', text: 'אנחנו מגיעים מוקדם, מקימים הכל ונשארים עד הסוף. אתם רק צריכים להגיע וליהנות.' }
      ]
    },
    gallery: {
      eyebrowNum: '05', eyebrow: 'עבודות נבחרות', heading: 'גלריה',
      note: 'מתוך אירועים שהפקנו. לצפייה בעוד עבודות — {instagram}',
      items: [
        { title: 'אוהל החינה', photo: 'images/IMG_4621.jpeg', video: 'videos/gallery-01.mp4', tall: true,  motif: 'orn-mandala', tone: 'a', pattern: 'pat-girih' },
        { title: 'עמדת מתוקים ומזכרות', photo: 'images/IMG_4623.jpeg', video: 'videos/gallery-02.mp4', tall: false, motif: 'orn-boteh',   tone: 'b', pattern: 'pat-ogee' },
        { title: 'כניסה ותפאורה', photo: 'images/IMG_4624.jpeg', video: 'videos/gallery-03.mp4', tall: false, motif: 'orn-rosette', tone: 'a', pattern: 'pat-scallop' },
        { title: 'מופע וחוויה', photo: 'images/IMG_4625.jpeg', video: 'videos/gallery-04.mp4', tall: true,  motif: 'orn-vine',    tone: 'b', pattern: 'pat-girih' },
        { title: 'מתחם ישיבה', photo: 'images/IMG_4622.jpeg', video: 'videos/gallery-05.mp4', tall: true,  motif: 'orn-mandala', tone: 'b', pattern: 'pat-ogee' },
        { title: 'רגעים מהאירוע', photo: 'images/IMG_4627.jpeg', video: 'videos/gallery-06.mp4', tall: false, motif: 'orn-boteh',   tone: 'a', pattern: 'pat-scallop' }
      ]
    },
    testimonials: {
      eyebrowNum: '06', eyebrow: 'לקוחות ממליצים', heading: 'מה אומרים עלינו',
      items: [
        { text: 'האירוע היה מעבר לכל דמיון — כל פרט חושב עד הסוף. תודה שהפכתם את היום שלנו לקסום כל כך.', author: 'משפחת כהן' },
        { text: 'מקצועיות, טעם עיצובי מדהים וזמינות מלאה לאורך כל התהליך. ממליצים בחום.', author: 'משפחת לוי' },
        { text: 'הצוות הבין בדיוק את החלום שלנו והפך אותו למציאות. אירוע שכל האורחים עדיין מדברים עליו.', author: 'משפחת אזולאי' }
      ]
    },
    faq: {
      eyebrowNum: '07', eyebrow: 'שאלות נפוצות', heading: 'כל מה שכדאי לדעת',
      items: [
        { q: 'כמה זמן מראש כדאי לפנות?', a: 'ככל שמוקדם יותר — כך יש יותר גמישות בתאריכים ובספקים. בעונה החמה התאריכים נתפסים מהר, אז שווה לפנות ברגע שיש תאריך משוער, גם אם עוד לא הכל סגור.' },
        { q: 'כמה זה עולה?', a: 'המחיר נבנה לפי היקף האירוע — מספר האורחים, גודל החלל, היקף התפאורה והעמדות. אחרי שיחת היכרות קצרה נשלח הצעת מחיר מפורטת ושקופה, בלי הפתעות בהמשך.' },
        { q: 'מה בדיוק כלול בהפקה?', a: 'אפשר לקחת הכל או רק חלק. הפקה מלאה כוללת עיצוב ותפאורה, תאורה, עמדות מתוקים וקייטרינג, תיאום ספקים וליווי צמוד ביום האירוע. אפשר גם רק עיצוב ותפאורה — נתאים לפי מה שצריך.' },
        { q: 'אתם מגיעים לכל אזור בארץ?', a: 'כן, אנחנו מפיקים אירועים ברחבי הארץ. באזורים מרוחקים ייתכן תוספת הגעה שתופיע מראש ובשקיפות בהצעת המחיר.' },
        { q: 'אפשר להתאים את העיצוב למנהגים של המשפחה?', a: 'בהחלט — זה בדיוק הלב של מה שאנחנו עושים. מרוקאי, תימני, כורדי או שילוב משלכם: אנחנו מקשיבים לסיפור המשפחה ובונים סביבו את העיצוב, הצבעים והפרטים.' },
        { q: 'יש לכם אוהל ותפאורה משלכם?', a: 'כן. יש לנו מלאי תפאורה, אוהלים, שטיחים, פופים, פמוטים ופרטי נוי — כך שהעיצוב נבנה מתוך מה שראיתם בגלריה, ולא מתמונות שאי אפשר לממש.' }
      ]
    },
    contact: {
      eyebrowNum: '08', eyebrow: 'בואו נתחיל לתכנן', heading: 'נדבר על האירוע שלכם?',
      sub: 'השאירו פרטים ונחזור אליכם בהקדם — או פשוט שלחו הודעה בוואטסאפ, זו הדרך המהירה ביותר.',
      whatsappNote: 'הדרך המהירה ביותר להגיע אלינו',
      phoneNote: 'זמינים בשעות הפעילות',
      emailNote: 'לפניות ומידע נוסף',
      instagramNote: 'עוד עבודות ורגעים מאירועים',
      whatsappMessageGreeting: 'היי, אשמח לקבל פרטים על הפקת חינה 🙂'
    }
  };

  /* ─────────  helpers  ───────── */
  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function escNl(s) {
    return String(s ?? '').split('\n').map(esc).join('<br>');
  }
  function pad2(n) { return String(n).padStart(2, '0'); }

  /* Shallow-merge onto defaults per top-level section, so a content.json
     that only touches (say) "hero" doesn't blank out everything else. */
  function mergeContent(base, patch) {
    const out = {};
    for (const key of Object.keys(base)) {
      out[key] = (patch && Object.prototype.hasOwnProperty.call(patch, key)) ? patch[key] : base[key];
    }
    for (const key of Object.keys(patch || {})) {
      if (!(key in out)) out[key] = patch[key];
    }
    return out;
  }

  function normalize(content) {
    const b = content.business;
    b.waLink = 'https://wa.me/' + b.phoneIntl;
    b.telLink = 'tel:+' + b.phoneIntl;
    b.mailLink = 'mailto:' + b.email;
    b.brandUpper = (b.brandFirst + b.brandLast).toUpperCase();
    return content;
  }

  async function resolveContent() {
    // The admin panel drops unsaved edits here (same-origin sessionStorage)
    // so it can preview them live, in a real tab, before publishing.
    try {
      const preview = sessionStorage.getItem('lh-preview-content');
      if (preview) return normalize(mergeContent(DEFAULT_CONTENT, JSON.parse(preview)));
    } catch (e) {}
    try {
      const res = await fetch('content.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('no content.json (' + res.status + ')');
      const patch = await res.json();
      return normalize(mergeContent(DEFAULT_CONTENT, patch));
    } catch (e) {
      // Missing file, bad JSON, or running from file:// (fetch is blocked
      // there) — the embedded defaults keep the site fully working.
      return normalize(mergeContent(DEFAULT_CONTENT, {}));
    }
  }

  /* ─────────  THEME  ───────── */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme || 'candlelit');
    try { localStorage.setItem('lh-theme', theme || 'candlelit'); } catch (e) {}
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER — one function per section. Every function only touches
     nodes inside its own section, and reproduces the exact markup/
     classes the CSS and the interaction layer below expect.
     ═══════════════════════════════════════════════════════════════ */
  function renderHead(content) {
    $('#introWord').textContent = content.business.brandUpper;
    $('#brandFirst').textContent = content.business.brandFirst;
    $('#brandLast').textContent = content.business.brandLast;
    $('#headerCta').textContent = content.header.ctaLabel;
    const nav = content.nav;
    ['about', 'services', 'process', 'gallery', 'testimonials', 'contact'].forEach((k) => {
      const el = document.getElementById('nav' + k[0].toUpperCase() + k.slice(1));
      if (el && nav[k] != null) el.textContent = nav[k];
    });
  }

  function renderHero(content) {
    const h = content.hero, b = content.business;
    $('#heroEyebrowNum').textContent = h.eyebrowNum;
    $('#heroEyebrow').textContent = h.eyebrow;
    $('#heroTitle').textContent = h.title;
    $('#heroLede').textContent = h.lede;
    $('#heroSub').textContent = h.sub;
    $('#heroCtaPrimaryLabel').textContent = h.ctaPrimary;
    $('#heroCtaPrimary').href = b.waLink;
    $('#heroCtaSecondaryLabel').textContent = h.ctaSecondary;
    const photoHost = $('#heroPhoto');
    if (h.video) photoHost.dataset.video = h.video;
    if (h.photo) photoHost.dataset.photo = h.photo;
  }

  function renderAbout(content) {
    const a = content.about;
    $('#aboutEyebrowNum').textContent = a.eyebrowNum;
    $('#aboutEyebrow').textContent = a.eyebrow;
    $('#aboutHeading').innerHTML = escNl(a.heading);
    $('#aboutParagraphs').innerHTML = a.paragraphs.map((p, i) =>
      `<p class="reveal" style="--d:${(0.1 + i * 0.08).toFixed(2)}s">${esc(p)}</p>`
    ).join('');
    $('#aboutStats').innerHTML = a.stats.map((s) =>
      `<li><strong class="foil" data-count="${Number(s.value) || 0}" data-suffix="${esc(s.suffix || '')}">0</strong><span>${esc(s.label)}</span></li>`
    ).join('');
    if (a.photo) $('#aboutPanel').dataset.photo = a.photo;
  }

  function renderServices(content) {
    const s = content.services;
    $('#servicesEyebrowNum').textContent = s.eyebrowNum;
    $('#servicesEyebrow').textContent = s.eyebrow;
    $('#servicesHeading').textContent = s.heading;
    $('#servicesRows').innerHTML = s.items.map((it, i) => `
      <article class="row reveal">
        <span class="row-ghost" aria-hidden="true">${pad2(i + 1)}</span>
        <span class="row-num">${pad2(i + 1)}</span>
        <h3>${esc(it.title)}</h3>
        <p>${esc(it.text)}</p>
        <svg class="row-orn" viewBox="0 0 400 400" aria-hidden="true"><use href="#${esc(it.motif || 'orn-rosette')}"/></svg>
      </article>`).join('');
  }

  function renderProcess(content) {
    const p = content.process;
    $('#processEyebrowNum').textContent = p.eyebrowNum;
    $('#processEyebrow').textContent = p.eyebrow;
    $('#processHeading').textContent = p.heading;
    $('#processSub').textContent = p.sub;
    $('#processSteps').innerHTML = p.steps.map((st, i) => `
      <li class="step reveal" style="--d:${(i * 0.08).toFixed(2)}s">
        <span class="step-num">${pad2(i + 1)}</span>
        <h3>${esc(st.title)}</h3>
        <p>${esc(st.text)}</p>
      </li>`).join('');
  }

  function renderGallery(content) {
    const g = content.gallery, b = content.business;
    $('#galleryEyebrowNum').textContent = g.eyebrowNum;
    $('#galleryEyebrow').textContent = g.eyebrow;
    $('#galleryHeading').textContent = g.heading;
    $('#plates').innerHTML = g.items.map((it, i) => `
      <figure class="plate${it.tall ? ' tall' : ''} reveal" style="--d:${(i * 0.06).toFixed(2)}s">
        <button class="plate-face" type="button" data-motif="${esc(it.motif)}" data-tone="${esc(it.tone)}" data-title="${esc(it.title)}" data-index="${pad2(i + 1)}"${it.video ? ` data-video="${esc(it.video)}"` : ''}${it.photo ? ` data-photo="${esc(it.photo)}"` : ''}>
          <span class="plate-bg tone-${esc(it.tone)}"></span>
          <span class="plate-pat ${esc(it.pattern)}"></span>
          <span class="plate-motif"><svg viewBox="0 0 400 400"><use href="#${esc(it.motif)}"/></svg></span>
          <span class="plate-sheen"></span>
          <span class="plate-edge"></span>
          <span class="plate-zoom" aria-hidden="true">הגדלה</span>
        </button>
        <figcaption><b>${pad2(i + 1)}</b> ${esc(it.title)}</figcaption>
      </figure>`).join('');
    $('#galleryNote').innerHTML = esc(g.note).replace(
      '{instagram}',
      `<a href="${esc(b.instagramUrl)}" target="_blank" rel="noopener">${esc(b.instagramHandle)}</a>`
    );
  }

  function renderTestimonials(content) {
    const t = content.testimonials;
    $('#testimonialsEyebrowNum').textContent = t.eyebrowNum;
    $('#testimonialsEyebrow').textContent = t.eyebrow;
    $('#testimonialsHeading').textContent = t.heading;
    $('#quoteTrack').innerHTML = t.items.map((it, i) => `
      <blockquote class="quote${i === 0 ? ' is-on' : ''}">
        <p>${esc(it.text)}</p>
        <cite>${esc(it.author)}</cite>
      </blockquote>`).join('');
  }

  function renderFaq(content) {
    const f = content.faq;
    $('#faqEyebrowNum').textContent = f.eyebrowNum;
    $('#faqEyebrow').textContent = f.eyebrow;
    $('#faqHeading').textContent = f.heading;
    $('#faqList').innerHTML = f.items.map((it, i) => `
      <details class="faq-item reveal" style="--d:${(i * 0.05).toFixed(2)}s">
        <summary><span>${esc(it.q)}</span><svg class="faq-ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-plus"/></svg></summary>
        <div class="faq-body"><p>${esc(it.a)}</p></div>
      </details>`).join('');
  }

  function renderContact(content) {
    const c = content.contact, b = content.business;
    $('#contactEyebrowNum').textContent = c.eyebrowNum;
    $('#contactEyebrow').textContent = c.eyebrow;
    $('#contactHeading').textContent = c.heading;
    $('#contactSub').textContent = c.sub;
    $('#contactChannels').innerHTML = `
      <li>
        <a class="ch" href="${b.waLink}" target="_blank" rel="noopener" data-wa-link>
          <span class="ch-ic ch-wa"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-whatsapp"/></svg></span>
          <span class="ch-txt"><b>וואטסאפ</b><em>${esc(c.whatsappNote)}</em></span>
        </a>
      </li>
      <li>
        <a class="ch" href="${b.telLink}">
          <span class="ch-ic ch-ph"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-phone"/></svg></span>
          <span class="ch-txt"><b dir="ltr">${esc(b.phoneDisplay)}</b><em>${esc(c.phoneNote)}</em></span>
        </a>
      </li>
      <li>
        <a class="ch" href="${b.mailLink}">
          <span class="ch-ic ch-ml"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-mail"/></svg></span>
          <span class="ch-txt"><b dir="ltr">${esc(b.email)}</b><em>${esc(c.emailNote)}</em></span>
        </a>
      </li>
      <li>
        <a class="ch" href="${esc(b.instagramUrl)}" target="_blank" rel="noopener">
          <span class="ch-ic ch-ig"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-instagram"/></svg></span>
          <span class="ch-txt"><b dir="ltr">${esc(b.instagramHandle)}</b><em>${esc(c.instagramNote)}</em></span>
        </a>
      </li>`;
  }

  function renderFooter(content) {
    const b = content.business;
    $('#footerCopyright').textContent = `${b.copyrightName} — ${b.footerTagline}`;
    $('#footerSocial').innerHTML = `
      <li><a class="soc-wa" href="${b.waLink}" target="_blank" rel="noopener" aria-label="וואטסאפ" data-wa-link><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-whatsapp"/></svg></a></li>
      <li><a class="soc-ig" href="${esc(b.instagramUrl)}" target="_blank" rel="noopener" aria-label="אינסטגרם"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-instagram"/></svg></a></li>
      <li><a class="soc-fb" href="${esc(b.facebookUrl)}" target="_blank" rel="noopener" aria-label="פייסבוק"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-facebook"/></svg></a></li>
      <li><a class="soc-ph" href="${b.telLink}" aria-label="טלפון"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-phone"/></svg></a></li>
      <li><a class="soc-ml" href="${b.mailLink}" aria-label="אימייל"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-mail"/></svg></a></li>`;
    $('#waFloat').href = b.waLink;
  }

  function renderAll(content) {
    renderHead(content);
    renderHero(content);
    renderAbout(content);
    renderServices(content);
    renderProcess(content);
    renderGallery(content);
    renderTestimonials(content);
    renderFaq(content);
    renderContact(content);
    renderFooter(content);
  }

  /* ═══════════════════════════════════════════════════════════════
     INTERACTIONS — unchanged in spirit from the static-content version;
     these all run AFTER renderAll() has built the real DOM, and read
     content only where doing so is more robust than scraping markup
     (e.g. the WhatsApp number, the greeting message).
     ═══════════════════════════════════════════════════════════════ */

  /* ─────────  SPLIT TEXT (word-level: safe for Hebrew bidi)  ───────── */
  function split(el) {
    if (el.dataset.splitDone) return;
    const frag = document.createDocumentFragment();
    let wi = 0;
    [...el.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
          const mask = document.createElement('span');
          mask.className = 'word-mask';
          const inner = document.createElement('span');
          inner.className = 'word-in';
          inner.style.setProperty('--wd', (wi++ * 0.055) + 's');
          inner.textContent = tok;
          mask.appendChild(inner);
          frag.appendChild(mask);
        });
      } else {
        frag.appendChild(node.cloneNode(true));
      }
    });
    el.textContent = '';
    el.appendChild(frag);
    el.dataset.splitDone = '1';
  }

  /* ─────────  PHOTOGRAPHY & VIDEO  ─────────
     Preload/probe first and only insert on success, so a missing file
     degrades to the ornamental plate underneath instead of a broken-image
     icon or a <video> stuck showing nothing. Video is tried before the
     photo on any slot that offers both — if it resolves, the photo probe
     is skipped. */
  function mountPhoto(host, src, alt) {
    if (!host || !src) return;
    const probe = new Image();
    probe.onload = () => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = alt || '';
      img.className = 'photo';
      img.decoding = 'async';
      if (!host.classList.contains('hero-photo')) img.loading = 'lazy';
      host.prepend(img);
      host.classList.add('has-photo');
    };
    probe.src = src;
  }

  function mountVideo(host, src, opts) {
    if (!host || !src) return Promise.resolve(false);
    opts = opts || {};
    return new Promise((resolve) => {
      const probe = document.createElement('video');
      probe.preload = 'metadata';
      probe.muted = true;
      probe.onloadedmetadata = () => {
        const v = document.createElement('video');
        v.src = src;
        v.className = 'photo';
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.setAttribute('muted', '');
        v.setAttribute('playsinline', '');
        v.preload = opts.eager ? 'auto' : 'metadata';
        if (opts.autoplay && !reduce) {
          v.autoplay = true;
          v.play().catch(() => {});
        }
        host.prepend(v);
        host.classList.add('has-video', 'has-photo');
        if (host.classList.contains('plate-face')) {
          const badge = document.createElement('span');
          badge.className = 'plate-video-badge';
          badge.setAttribute('aria-hidden', 'true');
          host.appendChild(badge);
        }
        resolve(v);
      };
      probe.onerror = () => resolve(false);
      probe.src = src;
    });
  }

  function mountAllMedia() {
    $$('[data-video], [data-photo]').forEach((el) => {
      const isHero = el.classList.contains('hero-photo');
      if (el.dataset.video) {
        mountVideo(el, el.dataset.video, { autoplay: isHero, eager: isHero }).then((v) => {
          if (!v && el.dataset.photo) mountPhoto(el, el.dataset.photo, el.dataset.title || '');
        });
      } else if (el.dataset.photo) {
        mountPhoto(el, el.dataset.photo, el.dataset.title || '');
      }
    });

    if (fine && !reduce) {
      $$('.plate-face').forEach((face) => {
        face.addEventListener('pointerenter', () => {
          const v = face.querySelector('video.photo');
          if (v) v.play().catch(() => {});
        });
        face.addEventListener('pointerleave', () => {
          const v = face.querySelector('video.photo');
          if (v) { v.pause(); v.currentTime = 0; }
        });
      });
    }
  }

  /* ─────────  SCROLL REVEAL  ───────── */
  function initReveal() {
    const revealables = $$('.reveal, [data-split]:not(.hero [data-split])');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -70px 0px' });
      revealables.forEach((el) => io.observe(el));
    } else {
      revealables.forEach((el) => el.classList.add('is-in'));
    }
  }

  /* ─────────  HEADER / PROGRESS / TO-TOP  ───────── */
  function initChrome() {
    const header = $('#header');
    const bar = $('#progress');
    const toTop = $('#toTop');

    function onScroll() {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      header.classList.toggle('is-stuck', y > 40);
      toTop.classList.toggle('is-on', y > 800);
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

    const burger = $('#burger');
    const nav = $('#nav');
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    $$('a', nav).forEach((a) => a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ─────────  BOKEH (candlelight depth)  ───────── */
  function initBokeh() {
    if (reduce) return;
    const box = $('#bokeh');
    const N = innerWidth < 900 ? 3 : 5;
    for (let i = 0; i < N; i++) {
      const s = document.createElement('span');
      const size = 130 + Math.random() * 210;
      s.style.width = s.style.height = size + 'px';
      s.style.left = (Math.random() * 92) + '%';
      s.style.top  = (35 + Math.random() * 60) + '%';
      s.style.setProperty('--o', (0.10 + Math.random() * 0.10).toFixed(2));
      s.style.setProperty('--dx', (Math.random() * 120 - 60).toFixed(0) + 'px');
      s.style.setProperty('--dy', (-180 - Math.random() * 220).toFixed(0) + 'px');
      s.style.animationDuration = (20 + Math.random() * 18).toFixed(1) + 's';
      s.style.animationDelay = (-Math.random() * 26).toFixed(1) + 's';
      box.appendChild(s);
    }
  }

  /* ─────────  CURSOR  ───────── */
  function initCursor() {
    if (!fine || reduce) return;
    document.body.classList.add('has-cursor');
    const cur = $('#cursor');
    const dot = $('.cursor-dot', cur);
    const ring = $('.cursor-ring', cur);
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    }, { passive: true });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();

    const hot = 'a, button, .plate-face, input, textarea';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hot)) cur.classList.add('is-hot');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hot)) cur.classList.remove('is-hot');
    });
  }

  /* ─────────  MAGNETIC  ───────── */
  function initMagnetic() {
    if (!fine || reduce) return;
    $$('.magnetic').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.14}px, ${y * 0.22}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ─────────  PARALLAX  ───────── */
  function initParallax() {
    const par = $$('[data-parallax]');
    if (!par.length || reduce) return;
    let ticking = false;
    const apply = () => {
      const vh = innerHeight;
      par.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const mid = r.top + r.height / 2 - vh / 2;
        const k = parseFloat(el.dataset.parallax) || 0.03;
        el.style.setProperty('--py', (-mid * k).toFixed(1) + 'px');
      });
      ticking = false;
    };
    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    }, { passive: true });
    apply();
  }

  /* ─────────  COUNTERS  ───────── */
  function initCounters() {
    const counters = $$('[data-count]');
    if (!counters.length || !('IntersectionObserver' in window)) return;
    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        co.unobserve(el);
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        if (reduce) { el.textContent = target + suffix; return; }
        const dur = 1500, t0 = performance.now();
        (function step(now) {
          const p = Math.min((now - t0) / dur, 1);
          el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => co.observe(el));
  }

  /* ─────────  QUOTES CAROUSEL  ───────── */
  function initCarousel() {
    const track = $('#quoteTrack');
    if (!track) return;
    const slides = $$('.quote', track);
    const navBox = $('#quoteNav');
    let i = Math.max(0, slides.findIndex((s) => s.classList.contains('is-on')));
    let timer;

    slides.forEach((_, k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `המלצה ${k + 1}`);
      b.setAttribute('aria-selected', String(k === i));
      if (k === i) b.classList.add('is-on');
      b.addEventListener('click', () => { go(k); restart(); });
      navBox.appendChild(b);
    });
    const dots = [...navBox.children];

    function go(k) {
      slides[i].classList.remove('is-on');
      dots[i].classList.remove('is-on');
      dots[i].setAttribute('aria-selected', 'false');
      i = (k + slides.length) % slides.length;
      slides[i].classList.add('is-on');
      dots[i].classList.add('is-on');
      dots[i].setAttribute('aria-selected', 'true');
    }
    function start() { if (!reduce) timer = setInterval(() => go(i + 1), 6000); }
    function restart() { clearInterval(timer); start(); }
    start();
    track.addEventListener('mouseenter', () => clearInterval(timer));
    track.addEventListener('mouseleave', start);
  }

  /* ─────────  FLOATING WHATSAPP  ─────────
     Retire the bubble once the footer is on screen: it would otherwise sit
     on top of the footer's own links, and the footer already offers
     WhatsApp. */
  function initWaFloat() {
    const waFloat = $('#waFloat');
    const footerEl = $('.footer');
    if (waFloat && footerEl && 'IntersectionObserver' in window) {
      const fo = new IntersectionObserver((entries) => {
        entries.forEach((e) => waFloat.classList.toggle('is-tucked', e.isIntersecting));
      }, { threshold: 0.08 });
      fo.observe(footerEl);
    }
  }

  /* ─────────  FAQ  ─────────
     Native <details> keeps this accessible and keyboard-friendly; this
     only adds the accordion behaviour of closing the previously open
     answer. */
  function initFaq() {
    const faqItems = $$('.faq-item');
    faqItems.forEach((item) => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;
        faqItems.forEach((other) => { if (other !== item) other.open = false; });
      });
    });
  }

  /* ─────────  LIGHTBOX  ───────── */
  function initLightbox() {
    const lb = $('#lb');
    const faces = $$('.plate-face');
    if (!lb || !faces.length) return;

    const patVar = { 'pat-girih': 'var(--girih-url)', 'pat-ogee': 'var(--ogee-url)', 'pat-scallop': 'var(--scallop-url)' };
    const patSize = { 'pat-girih': '120px 120px', 'pat-ogee': '120px 160px', 'pat-scallop': '64px 64px' };
    const lbBg = $('#lbBg'), lbPat = $('#lbPat'), lbUse = $('#lbUse');
    const lbTitle = $('#lbTitle'), lbIndex = $('#lbIndex');
    let at = 0, lastFocus = null;

    function paint(k) {
      at = (k + faces.length) % faces.length;
      const f = faces[at];
      const patClass = [...$('.plate-pat', f).classList].find((c) => c.startsWith('pat-'));
      lbBg.className = 'lb-bg tone-' + f.dataset.tone;
      lbPat.style.backgroundImage = patVar[patClass] || '';
      lbPat.style.backgroundSize = patSize[patClass] || '';
      lbUse.setAttribute('href', '#' + f.dataset.motif);
      lbTitle.textContent = f.dataset.title;
      lbIndex.textContent = f.dataset.index;

      const lbPlate = $('#lbPlate'), lbPhoto = $('#lbPhoto');
      const playing = lbPhoto.querySelector('video');
      if (playing) playing.pause();
      lbPhoto.textContent = '';
      lbPlate.classList.remove('has-photo', 'has-video');

      if (f.classList.contains('has-video')) {
        const v = document.createElement('video');
        v.src = f.dataset.video; v.className = 'photo';
        v.controls = true; v.muted = true; v.loop = true; v.playsInline = true;
        v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
        v.play().catch(() => {});
        lbPhoto.appendChild(v);
        lbPlate.classList.add('has-video', 'has-photo');
      } else if (f.classList.contains('has-photo')) {
        const img = document.createElement('img');
        img.src = f.dataset.photo; img.alt = f.dataset.title || ''; img.className = 'photo';
        lbPhoto.appendChild(img);
        lbPlate.classList.add('has-photo');
      }
    }

    function open(k) {
      lastFocus = document.activeElement;
      paint(k);
      lb.hidden = false;
      document.body.classList.add('lb-open');
      requestAnimationFrame(() => lb.classList.add('is-on'));
      $('#lbClose').focus();
    }
    function close() {
      lb.classList.remove('is-on');
      document.body.classList.remove('lb-open');
      const v = $('#lbPhoto video');
      if (v) v.pause();
      setTimeout(() => { lb.hidden = true; }, 420);
      if (lastFocus) lastFocus.focus();
    }

    faces.forEach((f, k) => f.addEventListener('click', () => open(k)));
    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', () => paint(at - 1));
    $('#lbNext').addEventListener('click', () => paint(at + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });

    addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft')  paint(at + 1);
      if (e.key === 'ArrowRight') paint(at - 1);
      if (e.key === 'Tab') {
        const f = $$('button', lb);
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    let sx = 0;
    lb.addEventListener('touchstart', (e) => { sx = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      const d = e.changedTouches[0].clientX - sx;
      if (Math.abs(d) > 55) paint(d > 0 ? at - 1 : at + 1);
    }, { passive: true });
  }

  /* ─────────  FORM  ─────────
     There is no backend. Rather than pretend the form was "sent" and
     silently drop the lead, we hand the details off to WhatsApp as a
     pre-filled message — so enquiries actually arrive. */
  function initForm(content) {
    const form = $('#form');
    if (!form) return;
    const note = $('#formNote');
    const rules = {
      'f-name':  (v) => v.trim().length >= 2 || 'נא למלא שם מלא',
      'f-phone': (v) => /^[\d\s+\-()]{9,}$/.test(v.trim()) || 'נא למלא מספר טלפון תקין'
    };
    function check(id) {
      const input = document.getElementById(id);
      const field = input.closest('.field');
      const err = $(`.field-err[data-for="${id}"]`);
      const res = rules[id](input.value);
      const ok = res === true;
      field.classList.toggle('has-err', !ok);
      if (err) err.textContent = ok ? '' : res;
      return ok;
    }
    Object.keys(rules).forEach((id) => {
      const input = document.getElementById(id);
      input.addEventListener('blur', () => check(id));
      input.addEventListener('input', () => {
        if (input.closest('.field').classList.contains('has-err')) check(id);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = Object.keys(rules).map(check).every(Boolean);
      if (!ok) { note.textContent = 'נא לבדוק את השדות המסומנים.'; return; }

      const val = (id) => (document.getElementById(id).value || '').trim();
      const lines = [
        content.contact.whatsappMessageGreeting,
        '',
        'שם: ' + val('f-name'),
        'טלפון: ' + val('f-phone'),
      ];
      if (val('f-date'))   lines.push('תאריך משוער: ' + val('f-date'));
      if (val('f-guests')) lines.push('מספר אורחים: ' + val('f-guests'));
      if (val('f-msg'))    lines.push('', val('f-msg'));

      window.open(content.business.waLink + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
      note.textContent = 'נפתח וואטסאפ עם הפרטים — רק צריך ללחוץ שליחה.';
      form.reset();
    });
  }

  function initInteractions(content) {
    $$('[data-split]').forEach(split);
    mountAllMedia();
    initReveal();
    initChrome();
    initBokeh();
    initCursor();
    initMagnetic();
    initParallax();
    initCounters();
    initCarousel();
    initWaFloat();
    initFaq();
    initLightbox();
    initForm(content);
    $('#year').textContent = new Date().getFullYear();
  }

  /* ═══════════════════════════════════════════════════════════════
     INTRO — gated on content being resolved AND rendered, so the
     preloader (which already hides everything) covers the fetch+render
     work instead of visitors ever seeing an empty or half-built page.
     ═══════════════════════════════════════════════════════════════ */
  const intro = $('#intro');
  const introCount = $('#introCount');
  let introFinished = false;
  let contentReady = false;
  let progressDone = reduce;

  function startHero() {
    document.body.classList.remove('is-loading');
    $$('.hero [data-split]').forEach((el) => el.classList.add('is-in'));
  }

  function endIntro() {
    if (introFinished) return;
    introFinished = true;
    intro.classList.add('is-done');
    startHero();
    if (reduce) {
      intro.classList.add('is-gone'); // skip the fade-out wait too
    } else {
      setTimeout(() => intro.classList.add('is-gone'), 1100);
    }
  }

  function maybeEndIntro() {
    if (progressDone && contentReady) endIntro();
  }

  if (!reduce) {
    let n = 0;
    const tick = setInterval(() => {
      n = Math.min(100, n + Math.ceil(Math.random() * 9));
      introCount.textContent = n;
      if (n >= 100) { clearInterval(tick); progressDone = true; maybeEndIntro(); }
    }, 45);
    intro.addEventListener('click', endIntro);
  }
  // Hard ceiling so a stalled fetch or asset can never trap the visitor.
  setTimeout(endIntro, 3200);

  resolveContent().then((content) => {
    applyTheme(content.theme);
    renderAll(content);
    initInteractions(content);
    contentReady = true;
    maybeEndIntro();
  });
})();
