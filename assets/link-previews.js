(() => {
  'use strict';

  // Each destination has its own artwork, colour, and entrance gesture.
  // Assets stay local: hovering never visits or embeds the destination.
  const entries = [
    ['odace.com', 'Odace', 'Social media & creative agency', 'odace.webp', 'butter', [-12, 18, -5, .94]],
    ['retine.io', 'Rétine', 'A new perspective on opinion', 'retine.webp', 'lilac', [18, 8, 5, .96]],
    ['jetevois.fr', 'Je te vois', 'Making sense of data', 'jetevois.webp', 'coral', [-22, 0, -3, .97]],
    ['lesdecryptages.fr', 'Les Décryptages', 'Contextualiser, analyser, expliquer', 'lesdecryptages.webp', 'mint', [0, 24, 4, .95]],
    ['petitparis.app', 'Petit Paris', 'A little Paris to get lost in', 'petitparis.webp', 'butter', [6, 26, -6, .91]],
    ['presidoscope-2027.vercel.app', 'Présidoscope 2027', 'The presidential race, in perspective', 'presidoscope.webp', 'coral', [20, 12, 3, .95]],
    ['thepalette.app', 'Palette', 'Your brand, ready for your agents', 'palette.webp', 'butter', [-16, 20, -4, .93]],
    ['quiquoicomment.com', 'Qui Quoi Comment ?', 'Who is running, and for what?', 'quiquoicomment.webp', 'mint', [22, -6, 5, .96]],
    ['labo-paris.com', 'Labo Paris', 'Political programs under the microscope', 'labo-paris.webp', 'lilac', [-20, 12, -2, .95]],
    ['jaimele19.com', 'J’aime le 19', 'One arrondissement, endless stories', 'jaimele19.webp', 'coral', [12, 24, 6, .94]],
    ['fake-mrr.com', 'FakeMRR', 'Unverified revenues. Trust me bro.', 'fake-mrr.svg', 'mint', [-6, 26, -5, .92]],
    ['open.spotify.com/album/4m0HgHpftLHA7HkZP5VTHx', 'Modular Systems', 'An album by Pierre-Baptiste Borges', 'modular-systems.webp', 'lilac', [18, 16, 7, .94]],
    ['music.apple.com/ca/album/modular-systems/1784107627', 'Modular Systems', 'An album by Pierre-Baptiste Borges', 'modular-systems.webp', 'lilac', [-18, 16, -7, .94]],
    ['github.com/Liftof/littletodo', 'LittleTodo', 'A tiny macOS menu bar companion', 'littletodo.svg', 'butter', [0, 28, -3, .92]],
    ['github.com/Liftof/reddit-scout', 'reddit-scout', 'Find the right conversation', 'reddit-scout.svg', 'coral', [26, 6, 4, .96]],
    ['github.com/Liftof/election-lab', 'Election Lab', 'Open-source political program analysis', 'labo-paris.webp', 'mint', [-24, -4, -4, .95]],
    ['/writing/pour-un-humanisme-technophile/', 'Pour un humanisme technophile', 'Technology, with people at its heart · 2026', 'humanisme.svg', 'butter', [-16, 22, -5, .93]],
    ['/writing/attention-sovereignty/', 'Attention Sovereignty', 'Taking back our attention · 2025', 'attention.svg', 'coral', [22, 2, 3, .94]],
    ['/writing/apple-isnt-losing-the-thread/', 'Weaving a New One', 'Following Apple’s thread · 2025', 'weaving.svg', 'mint', [-24, 10, -6, .96]],
    ['/writing/la-verite-sans-filtre/', 'La vérité sans filtre', 'Looking beyond the brand · 2024', 'verite.svg', 'lilac', [18, 24, 6, .93]],
    ['/writing/quest-ce-que-la-qualite/', 'Qu’est-ce que la qualité ?', 'Giving shape to the ineffable · 2024', 'qualite.svg', 'butter', [0, 26, -7, .90]],
    ['/writing/founder-mode/', 'Founder mode', 'Building with intention · 2024', 'founder.svg', 'coral', [-20, 26, -3, .94]],
    ['/writing/the-great-shift/', 'The great shift', 'Making room for what comes next · 2024', 'shift.svg', 'mint', [26, 0, 4, .95]],
    ['/projects/', 'Small internet projects', 'Tools, experiments, and music', 'projects.svg', 'butter', [-12, 22, -4, .94]],
    ['/writing/', 'Writing', 'Thoughts on technology and culture', 'writing.svg', 'coral', [18, 20, 4, .95]],
    ['/about/', 'About Pierre-Baptiste', 'Building, writing, making things', 'about.svg', 'mint', [-18, 18, -5, .94]],
    ['/', 'Pierre-Baptiste Borges', 'A small corner of the internet', 'about.svg', 'butter', [0, 24, 3, .94]],
    ['mailto:pierrebaptiste.borges@gmail.com', 'Say hello', 'pierrebaptiste.borges@gmail.com', 'contact.svg', 'butter', [-12, 22, -4, .95]],
    ['x.com/pierbapt', '@pierbapt', 'Notes from around the internet', 'social.svg', 'mint', [14, 22, 4, .94]],
    ['linkedin.com/in/pierrebaptisteborges', 'Pierre-Baptiste Borges', 'Let’s stay in touch', 'social.svg', 'lilac', [-14, 22, -4, .94]]
  ];

  function keyFor(href) {
    const url = new URL(href, location.href);
    if (url.protocol === 'mailto:') return url.href;
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const path = url.pathname.replace(/\/+$/, '') || '/';
    return url.origin === location.origin ? path : url.hostname.replace(/^www\./, '') + (path === '/' ? '' : path);
  }

  const previews = new Map(entries.map(([key, title, subtitle, file, colour, motion]) => [
    key.startsWith('/') ? key.replace(/\/+$/, '') || '/' : key,
    { title, subtitle, file, colour, motion }
  ]));
  const hover = matchMedia('(any-hover: hover)');
  const fine = matchMedia('(any-pointer: fine)');
  const cache = new Map();
  let active = null;
  let dismissed = null;
  let showTimer;
  let hideTimer;
  let sequence = 0;
  let point = null;

  const preview = document.createElement('div');
  preview.className = 'link-preview';
  preview.setAttribute('aria-hidden', 'true');
  const card = document.createElement('div');
  card.className = 'link-preview__card';
  const media = document.createElement('div');
  media.className = 'link-preview__media';
  const caption = document.createElement('div');
  caption.className = 'link-preview__caption';
  const title = document.createElement('span');
  title.className = 'link-preview__title';
  const subtitle = document.createElement('span');
  subtitle.className = 'link-preview__subtitle';
  caption.append(title, subtitle);
  card.append(media, caption);
  preview.append(card);
  document.body.append(preview);

  function eligible(target) {
    const link = target.closest?.('a[href]');
    if (!link || !link.closest('.copy, .site-nav, .identity-rail')) return null;
    return previews.has(keyFor(link.href)) ? link : null;
  }

  function load(file) {
    if (!cache.has(file)) {
      const pending = new Promise((resolve, reject) => {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Preview image unavailable'));
        image.src = '/assets/previews/' + file;
      });
      cache.set(file, pending);
      // A failed fetch can be retried on the next visit to the link.
      pending.catch(() => cache.delete(file));
    }
    return cache.get(file);
  }

  function close() {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    sequence++;
    active = null;
    delete preview.dataset.open;
  }

  function leave() {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    sequence++;
    if (!preview.hasAttribute('data-open')) active = null;
    // Enough time to cross from a link to the card without losing it.
    hideTimer = setTimeout(close, 320);
  }

  function position(link) {
    const rects = [...link.getClientRects()];
    const rect = (point && rects.find(r => point.y >= r.top && point.y <= r.bottom)) || link.getBoundingClientRect();
    const gap = 20;
    const edge = 14;
    const width = Math.min(326, window.innerWidth - edge * 2);
    preview.style.width = width + 'px';
    const height = preview.getBoundingClientRect().height;
    const column = link.closest('.copy')?.getBoundingClientRect();
    const right = column ? column.right : rect.right;
    let x, y;
    if (right + gap + width <= window.innerWidth - edge) {
      x = right + gap;
      y = rect.top - 45;
    } else if (rect.left - gap - width >= edge) {
      x = rect.left - gap - width;
      y = rect.top - 45;
    } else {
      x = rect.left;
      y = rect.bottom + gap;
      if (y + height > window.innerHeight - edge) y = rect.top - gap - height;
    }
    preview.style.left = Math.max(edge, Math.min(x, window.innerWidth - width - edge)) + 'px';
    preview.style.top = Math.max(edge, Math.min(y, window.innerHeight - height - edge)) + 'px';
  }

  async function show(link, ticket) {
    const entry = previews.get(keyFor(link.href));
    let image;
    try {
      image = await load(entry.file);
    } catch {
      try { image = await load('projects.svg'); } catch { return; }
    }
    // A late response must never reopen a card for a link already left.
    if (ticket !== sequence || active !== link || !link.isConnected) return;
    const artwork = image.cloneNode();
    artwork.alt = '';
    artwork.width = 640;
    artwork.height = 400;
    media.replaceChildren(artwork);
    media.dataset.cover = entry.file.startsWith('modular-systems') ? 'album' : 'landscape';
    title.textContent = entry.title;
    subtitle.textContent = entry.subtitle;
    preview.dataset.colour = entry.colour;
    const [x, y, rotation, scale] = entry.motion;
    preview.style.setProperty('--preview-x', x + 'px');
    preview.style.setProperty('--preview-y', y + 'px');
    preview.style.setProperty('--preview-rotation', rotation + 'deg');
    preview.style.setProperty('--preview-scale', scale);
    position(link);
    // Restart the short entrance, including when moving directly between links.
    delete preview.dataset.open;
    void card.offsetWidth;
    preview.dataset.open = '';
  }

  function enter(link, immediate = false) {
    clearTimeout(hideTimer);
    if (dismissed === link || (active === link && preview.hasAttribute('data-open'))) return;
    clearTimeout(showTimer);
    active = link;
    const ticket = ++sequence;
    delete preview.dataset.open;
    if (immediate) show(link, ticket);
    else showTimer = setTimeout(() => show(link, ticket), 110);
  }

  document.addEventListener('pointerover', event => {
    if (!hover.matches || !fine.matches || !['mouse', 'pen'].includes(event.pointerType)) return;
    const link = eligible(event.target);
    if (!link || link.contains(event.relatedTarget)) return;
    point = { x: event.clientX, y: event.clientY };
    enter(link);
  });
  document.addEventListener('pointerout', event => {
    const link = eligible(event.target);
    if (!link || link.contains(event.relatedTarget)) return;
    if (dismissed === link) dismissed = null;
    if (active === link) leave();
  });
  document.addEventListener('focusin', event => {
    const link = eligible(event.target);
    if (!link || !link.matches(':focus-visible')) return;
    point = null;
    enter(link, true);
  });
  document.addEventListener('focusout', event => {
    if (event.target === dismissed) dismissed = null;
    if (event.target === active) close();
  });
  preview.addEventListener('pointerenter', () => clearTimeout(hideTimer));
  preview.addEventListener('pointerleave', leave);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && active) {
      dismissed = active;
      close();
    }
  });
  document.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') close();
  }, { passive: true });
  document.addEventListener('toggle', close, true);
  document.addEventListener('visibilitychange', close);
  window.addEventListener('scroll', () => {
    // Tabbing to a link can scroll it into view; keep its keyboard preview.
    if (active === document.activeElement && active?.matches(':focus-visible')) {
      if (preview.hasAttribute('data-open')) position(active);
    } else close();
  }, { passive: true, capture: true });
  window.addEventListener('resize', close, { passive: true });
  hover.addEventListener('change', close);
  fine.addEventListener('change', close);
})();
