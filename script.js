(() => {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine   = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ─────────  SPLIT TEXT (word-level: safe for Hebrew bidi)  ───────── */
  function split(el) {
    if (el.dataset.splitDone) return;
    const frag = document.createDocumentFragment();
    let wi = 0;
    // Walk child nodes so inline markup like <br> survives.
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
  $$('[data-split]').forEach(split);

  /* ─────────  PHOTOGRAPHY & VIDEO  ─────────
     Both preload/probe first and only insert on success, so a missing file
     degrades to the ornamental plate underneath instead of a broken-image icon
     or a <video> stuck showing nothing. Video is tried before the photo on any
     slot that offers both — if it resolves, the photo probe is skipped. */
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
          v.play().catch(() => {}); // autoplay can still be blocked; thumbnail poster stays fine either way
        }
        host.prepend(v);
        host.classList.add('has-video', 'has-photo'); // has-photo: reuse "media covers the ornament" styling
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

  /* gallery thumbnails: play the muted loop only on hover, so six clips never
     autoplay together. No-op on touch devices — reduced motion. */
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

  /* ─────────  INTRO  ───────── */
  const intro = $('#intro');
  const introCount = $('#introCount');
  let introFinished = false;

  function startHero() {
    document.body.classList.remove('is-loading');
    $$('.hero [data-split]').forEach((el) => el.classList.add('is-in'));
  }

  function endIntro() {
    if (introFinished) return;
    introFinished = true;
    intro.classList.add('is-done');
    startHero();
    setTimeout(() => intro.classList.add('is-gone'), 1100);
  }

  if (reduce) {
    intro.classList.add('is-done', 'is-gone');
    startHero();
  } else {
    let n = 0;
    const tick = setInterval(() => {
      n = Math.min(100, n + Math.ceil(Math.random() * 9));
      introCount.textContent = n;
      if (n >= 100) { clearInterval(tick); setTimeout(endIntro, 260); }
    }, 45);
    // hard ceiling so a stalled asset can never trap the visitor
    setTimeout(endIntro, 3200);
    intro.addEventListener('click', endIntro);
  }

  /* ─────────  SCROLL REVEAL  ───────── */
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

  /* ─────────  HEADER / PROGRESS / TO-TOP  ───────── */
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

  /* ─────────  MOBILE NAV  ───────── */
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

  /* ─────────  BOKEH (candlelight depth)  ───────── */
  if (!reduce) {
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
  if (fine && !reduce) {
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
  if (fine && !reduce) {
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
  const par = $$('[data-parallax]');
  if (par.length && !reduce) {
    let ticking = false;
    const apply = () => {
      const vh = innerHeight;
      par.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const mid = r.top + r.height / 2 - vh / 2;
        const k = parseFloat(el.dataset.parallax) || 0.03;
        // Only publish the offset; each element decides how to compose it
        // (some also need their own centring translate).
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
  const counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
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
  const track = $('#quoteTrack');
  if (track) {
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
     Retire the bubble once the footer is on screen: it would otherwise sit on
     top of the footer's own links, and the footer already offers WhatsApp. */
  const waFloat = $('#waFloat');
  const footerEl = $('.footer');
  if (waFloat && footerEl && 'IntersectionObserver' in window) {
    const fo = new IntersectionObserver((entries) => {
      entries.forEach((e) => waFloat.classList.toggle('is-tucked', e.isIntersecting));
    }, { threshold: 0.08 });
    fo.observe(footerEl);
  }

  /* ─────────  FAQ  ─────────
     Native <details> keeps this accessible and keyboard-friendly; this only
     adds the accordion behaviour of closing the previously open answer. */
  const faqItems = $$('.faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      faqItems.forEach((other) => { if (other !== item) other.open = false; });
    });
  });

  /* ─────────  LIGHTBOX  ───────── */
  const lb = $('#lb');
  const faces = $$('.plate-face');
  if (lb && faces.length) {
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

      // show the real photo or video when this plate has one mounted
      const lbPlate = $('#lbPlate'), lbPhoto = $('#lbPhoto');
      const playing = lbPhoto.querySelector('video');
      if (playing) playing.pause(); // stop before the node is discarded
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
      if (v) v.pause(); // stop immediately rather than let it play through the fade-out
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
      // arrows are mirrored: this is an RTL document
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

  /* ─────────  FORM  ───────── */
  const form = $('#form');
  if (form) {
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

    /* There is no backend. Rather than pretend the form was "sent" and silently
       drop the lead, we hand the details off to WhatsApp as a pre-filled
       message — so enquiries actually arrive. The number is read from the
       existing WhatsApp links, keeping one source of truth in the markup. */
    function waNumber() {
      const link = document.querySelector('[data-wa-link]');
      const m = link && link.getAttribute('href').match(/wa\.me\/(\d+)/);
      return m ? m[1] : null;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = Object.keys(rules).map(check).every(Boolean);
      if (!ok) { note.textContent = 'נא לבדוק את השדות המסומנים.'; return; }

      const val = (id) => (document.getElementById(id).value || '').trim();
      const lines = [
        'היי, אשמח לקבל פרטים על הפקת חינה 🙂',
        '',
        'שם: ' + val('f-name'),
        'טלפון: ' + val('f-phone'),
      ];
      if (val('f-date'))   lines.push('תאריך משוער: ' + val('f-date'));
      if (val('f-guests')) lines.push('מספר אורחים: ' + val('f-guests'));
      if (val('f-msg'))    lines.push('', val('f-msg'));

      const num = waNumber();
      if (!num) { note.textContent = 'אירעה תקלה. אפשר ליצור קשר ישירות בוואטסאפ.'; return; }

      window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
      note.textContent = 'נפתח וואטסאפ עם הפרטים — רק צריך ללחוץ שליחה.';
      form.reset();
    });
  }

  $('#year').textContent = new Date().getFullYear();
})();
