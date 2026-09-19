/* ==========================================================================
   Jagriti Mattress — shared front-end behaviour
   Plain vanilla JS. Bootstrap handles the navbar collapse and the dropdown
   toggle; everything below covers the bits it does not.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Small helpers --------------------------------------------- */

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Footer year ----------------------------------------------- */

  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- Sticky nav shadow ----------------------------------------- */

  const nav = $('#siteNav');
  if (nav) {
    const setStuck = () => nav.classList.toggle('is-stuck', window.scrollY > 8);
    setStuck();
    window.addEventListener('scroll', setStuck, { passive: true });
  }

  /* ---------- Bag counter (persisted per browser) ------------------------ */

  const BAG_KEY = 'jagriti:bag-count';

  const readBag = () => {
    try { return parseInt(window.localStorage.getItem(BAG_KEY), 10) || 0; }
    catch (err) { return 0; }
  };

  const writeBag = (value) => {
    try { window.localStorage.setItem(BAG_KEY, String(value)); }
    catch (err) { /* private browsing — the count simply resets on reload */ }
  };

  const paintBag = (value) => {
    $$('[data-bag-count]').forEach((el) => { el.textContent = value; });
  };

  let bagCount = readBag();
  paintBag(bagCount);

  /* ---------- Toast ------------------------------------------------------ */

  const toast = $('[data-bag-toast]');
  const toastText = $('[data-bag-toast-text]');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    if (toastText) toastText.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
  }

  /* ======================================================================
     Order form
     The "+" on a product card opens the order modal with that mattress
     filled in. Submitting hands the order to WhatsApp — there is no back
     end, so nothing is stored or charged on the site itself.
     ====================================================================== */

  const WHATSAPP_NUMBER = '9779744464491';

  const orderModalEl = $('#orderModal');
  const orderForm = $('#orderForm');
  const orderModal = orderModalEl && window.bootstrap
    ? window.bootstrap.Modal.getOrCreateInstance(orderModalEl)
    : null;

  let currentProduct = { name: '', price: '', image: '', variants: [] };

  function openOrderForm(button) {
    const card = button.closest('.card') || document;

    currentProduct = {
      name: button.getAttribute('data-product-name') || 'Jagriti mattress',
      price: (($('.price', card) || {}).textContent || '').trim(),
      image: (($('.product-media img', card) || {}).getAttribute
        ? $('.product-media img', card).getAttribute('src')
        : '') || '',
      // "Normal|Pillow top|Euro top" on the lines that come in more than one finish
      variants: (button.getAttribute('data-variants') || '').split('|').filter(Boolean)
    };

    const nameEl = $('[data-order-product]', orderModalEl);
    const priceEl = $('[data-order-price]', orderModalEl);
    const imageEl = $('[data-order-image]', orderModalEl);
    const note = $('[data-order-message]', orderModalEl);

    if (nameEl) nameEl.textContent = currentProduct.name;
    if (priceEl) priceEl.textContent = currentProduct.price ? 'Starting from ' + currentProduct.price : '';
    if (imageEl && currentProduct.image) {
      imageEl.setAttribute('src', currentProduct.image);
      imageEl.setAttribute('alt', currentProduct.name);
    }
    if (note) { note.classList.add('d-none'); note.innerHTML = ''; }

    // Top finish: only the products that carry data-variants show the field
    const variantField = $('[data-order-variant-field]', orderModalEl);
    const variantSelect = $('[data-order-variant]', orderModalEl);
    if (variantField && variantSelect) {
      variantSelect.innerHTML = '';
      currentProduct.variants.forEach((label) => {
        const option = document.createElement('option');
        option.textContent = label;
        variantSelect.appendChild(option);
      });
      variantField.classList.toggle('d-none', currentProduct.variants.length === 0);
      variantSelect.disabled = currentProduct.variants.length === 0;
    }

    orderModal.show();
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-order-button]');
    if (!button) return;

    button.classList.add('is-added');
    window.setTimeout(() => button.classList.remove('is-added'), 900);

    if (orderModal) {
      openOrderForm(button);
    } else {
      showToast(button.getAttribute('data-product-name') + ' — open the shop to order');
    }
  });

  if (orderForm) {
    orderForm.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!orderForm.checkValidity()) {
        orderForm.reportValidity();
        return;
      }

      const data = new FormData(orderForm);
      const get = (key) => (data.get(key) || '').toString().trim();

      const lines = [
        'Hello Jagriti Mattress! I would like to place an order.',
        '',
        'Product: ' + currentProduct.name
      ];
      if (currentProduct.variants.length) lines.push('Top finish: ' + get('variant'));
      lines.push(
        'Size: ' + get('size'),
        'Quantity: ' + get('quantity'),
        '',
        'Name: ' + get('name'),
        'Phone: ' + get('phone')
      );
      if (get('email')) lines.push('Email: ' + get('email'));
      lines.push('City / area: ' + get('city'));
      lines.push('Address: ' + get('address'));
      if (get('notes')) lines.push('Notes: ' + get('notes'));
      lines.push('', 'Please confirm the price and delivery time.');

      const link = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(link, '_blank', 'noopener');

      bagCount += 1;
      writeBag(bagCount);
      paintBag(bagCount);

      const note = $('[data-order-message]', orderForm);
      if (note) {
        note.innerHTML = 'Your order is ready in WhatsApp — press send there and we will confirm by phone. ' +
          'If WhatsApp did not open, <a href="' + link + '" target="_blank" rel="noopener">tap here</a>.';
        note.classList.remove('d-none');
      }

      showToast('Order for ' + currentProduct.name + ' prepared');
    });
  }

  /* ======================================================================
     Dealership application (dealership.html)
     Same idea as the order form: no back end, the application is handed to
     WhatsApp and the applicant presses send.
     ====================================================================== */

  $$('[data-dealer-form]').forEach((dealerForm) => {
    dealerForm.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!dealerForm.checkValidity()) {
        dealerForm.reportValidity();
        return;
      }

      const data = new FormData(dealerForm);
      const get = (key) => (data.get(key) || '').toString().trim();

      const lines = [
        'Hello Jagriti Mattress! I would like to apply for a dealership.',
        '',
        'Name: ' + get('name'),
        'Contact number: ' + get('phone'),
        'Address: ' + get('address'),
        'Business start date: ' + get('started'),
        'Wholesale or retail: ' + get('trade')
      ];
      if (get('notes')) lines.push('Notes: ' + get('notes'));
      lines.push('', 'Please send the dealer price list and terms.');

      const link = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(link, '_blank', 'noopener');

      const note = $('[data-dealer-message]', dealerForm);
      if (note) {
        note.innerHTML = 'Your application is ready in WhatsApp — press send there and we will reply within two working days. ' +
          'If WhatsApp did not open, <a href="' + link + '" target="_blank" rel="noopener">tap here</a>.';
        note.classList.remove('d-none');
      }

      showToast('Dealership application prepared');
    });
  });

  $$('[data-bag-button]').forEach((button) => {
    button.addEventListener('click', () => {
      showToast(bagCount === 0
        ? 'No orders started yet — pick a mattress to open the order form'
        : bagCount + (bagCount === 1 ? ' order' : ' orders') + ' started from this device');
    });
  });

  /* ---------- Demo forms (contact, newsletter, order lookup) -------------
     These pages have no back end. Each form shows its own confirmation
     message and, where it has one, reveals a result panel.               */

  $$('[data-demo-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const primary = $('[data-primary-input]', form);
      const value = primary ? primary.value.trim() : '';

      const note = $('[data-demo-message]', form);
      if (note) {
        note.textContent = form.getAttribute('data-success') || 'Thank you — we will be in touch.';
        note.classList.remove('d-none');
      }

      const panel = form.getAttribute('data-reveal') && $(form.getAttribute('data-reveal'));
      if (panel) {
        $$('[data-order-ref]', panel).forEach((el) => { el.textContent = value.toUpperCase(); });
        panel.classList.remove('d-none');
        panel.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }

      const hidden = form.getAttribute('data-hide') && $(form.getAttribute('data-hide'));
      if (hidden) hidden.classList.add('d-none');

      form.reset();
    });
  });

  /* ======================================================================
     Product rail
     Four cards to a row; anything past that scrolls sideways. The arrows
     move one card at a time and grey out at either end, and a rail whose
     cards already fit is centred and left alone.
     ====================================================================== */

  $$('[data-rail]').forEach((rail) => {
    const section = rail.closest('section') || document;
    const nav  = $('[data-rail-nav]', section);
    const prev = $('[data-rail-prev]', section);
    const next = $('[data-rail-next]', section);

    const step = () => {
      const item = rail.firstElementChild;
      if (!item) return rail.clientWidth;
      const gap = parseFloat(window.getComputedStyle(rail).columnGap) || 0;
      return item.getBoundingClientRect().width + gap;
    };

    const paint = () => {
      // .is-static only changes justify-content, so this stays stable to measure.
      const scrollable = rail.scrollWidth - rail.clientWidth > 2;
      const end = rail.scrollWidth - rail.clientWidth - 2;

      rail.classList.toggle('is-static', !scrollable);
      if (nav) nav.hidden = !scrollable;
      if (prev) prev.disabled = !scrollable || rail.scrollLeft <= 2;
      if (next) next.disabled = !scrollable || rail.scrollLeft >= end;
    };

    if (prev) prev.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));

    rail.addEventListener('scroll', paint, { passive: true });
    window.addEventListener('resize', paint);

    // Photos land after the first paint and can change the height, not the
    // width — but a late webfont can shift it, so re-measure once settled.
    window.addEventListener('load', paint);
    paint();
  });

  /* ---------- Product card photo gallery ---------------------------------
     Cards with more than one photo carry a thumbnail strip; clicking a
     thumb swaps the main image (and so what the order form shows).      */

  document.addEventListener('click', (event) => {
    const thumb = event.target.closest('.product-thumb');
    if (!thumb) return;

    const card = thumb.closest('.card');
    const main = card && $('[data-gallery-main]', card);
    const src = thumb.getAttribute('data-gallery-src');
    if (!main || !src) return;

    main.setAttribute('src', src);
    $$('.product-thumb', card).forEach((other) => {
      other.classList.toggle('is-active', other === thumb);
    });
  });

  /* ======================================================================
     Shop page: search, and the filter / pagination controls when present
     ====================================================================== */

  const grid = $('[data-product-grid]');
  if (!grid) return;

  const PAGE_SIZE = 12;

  const cards       = $$('[data-product]', grid);
  const pills       = $$('[data-filter]');
  const usePills    = $$('[data-filter-use]');
  // Scoped to the dropdown: the product cards also carry data-comfort.
  const comfortOpts = $$('.dropdown-menu [data-comfort]');
  const comfortBtn  = $('[data-comfort-label]');
  const searchInput = $('[data-search-input]');
  const countEl     = $('[data-result-count]');
  const emptyState  = $('[data-empty-state]');
  const pagination  = $('[data-pagination]');

  const COMFORT_LABELS = {
    'all': 'All',
    'soft': 'Soft',
    'medium': 'Medium',
    'firm': 'Firm',
    'extra-firm': 'Extra firm'
  };

  const state = { category: 'all', use: 'all', comfort: 'all', query: '', page: 1 };

  // Cache the searchable text once, rather than on every keystroke. The top
  // finishes are an attribute rather than copy, so fold them in by hand —
  // otherwise "pillow top" would not find Core Plus or Royal.
  cards.forEach((card) => {
    const finishes = $$('[data-variants]', card)
      .map((button) => button.getAttribute('data-variants').replace(/\|/g, ' '))
      .join(' ');
    card.dataset.haystack = ((card.textContent || '') + ' ' + finishes)
      .toLowerCase().replace(/\s+/g, ' ');
  });

  // data-use holds one or more tokens ("home hotel"), so a piece can be sold
  // for more than one setting.
  const usedFor = (card, use) =>
    (card.dataset.use || '').split(/\s+/).indexOf(use) !== -1;

  const matches = (card) => {
    const okCategory = state.category === 'all' || card.dataset.category === state.category;
    const okUse      = state.use      === 'all' || usedFor(card, state.use);
    const okComfort  = state.comfort  === 'all' || card.dataset.comfort  === state.comfort;
    const okQuery    = !state.query || card.dataset.haystack.indexOf(state.query) !== -1;
    return okCategory && okUse && okComfort && okQuery;
  };

  function buildPagination(totalPages) {
    if (!pagination) return;
    pagination.innerHTML = '';
    if (totalPages <= 1) return;

    const addItem = (label, page, opts = {}) => {
      const li = document.createElement('li');
      li.className = 'page-item' + (opts.disabled ? ' disabled' : '') + (opts.active ? ' active' : '');

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'page-link';
      btn.textContent = label;
      if (opts.disabled) btn.setAttribute('aria-disabled', 'true');
      if (opts.active) btn.setAttribute('aria-current', 'page');
      if (opts.label) btn.setAttribute('aria-label', opts.label);

      btn.addEventListener('click', () => {
        if (opts.disabled || opts.active) return;
        state.page = page;
        render();
        const top = grid.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top, behavior: 'smooth' });
      });

      li.appendChild(btn);
      pagination.appendChild(li);
    };

    addItem('Previous', state.page - 1, { disabled: state.page === 1, label: 'Previous page' });
    for (let page = 1; page <= totalPages; page += 1) {
      addItem(String(page), page, { active: page === state.page });
    }
    addItem('Next', state.page + 1, { disabled: state.page === totalPages, label: 'Next page' });
  }

  function render() {
    const visible = cards.filter(matches);
    const total = visible.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    if (state.page > totalPages) state.page = totalPages;

    const start = (state.page - 1) * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, total);
    const pageItems = visible.slice(start, end);

    cards.forEach((card) => { card.classList.add('d-none'); });
    pageItems.forEach((card) => { card.classList.remove('d-none'); });

    if (countEl) {
      countEl.textContent = total === 0
        ? 'No pieces match those filters'
        : 'Showing ' + (start + 1) + '–' + end + ' of ' + total + (total === 1 ? ' piece' : ' pieces');
    }

    if (emptyState) emptyState.classList.toggle('d-none', total !== 0);

    buildPagination(totalPages);
  }

  /* ---------- Filter pills ----------------------------------------------- */

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      state.category = pill.getAttribute('data-filter');
      state.page = 1;
      pills.forEach((other) => {
        const isActive = other === pill;
        other.classList.toggle('btn-dark', isActive);
        other.classList.toggle('btn-outline-dark', !isActive);
      });
      render();
    });
  });

  /* ---------- Use pills ----------------------------------------------------- */

  usePills.forEach((pill) => {
    pill.addEventListener('click', () => {
      state.use = pill.getAttribute('data-filter-use');
      state.page = 1;
      usePills.forEach((other) => {
        const isActive = other === pill;
        other.classList.toggle('btn-dark', isActive);
        other.classList.toggle('btn-outline-dark', !isActive);
      });
      render();
    });
  });

  /* ---------- Comfort dropdown -------------------------------------------- */

  comfortOpts.forEach((option) => {
    option.addEventListener('click', () => {
      const value = option.getAttribute('data-comfort');
      state.comfort = value;
      state.page = 1;
      comfortOpts.forEach((other) => other.classList.toggle('active', other === option));
      if (comfortBtn) comfortBtn.textContent = 'Comfort: ' + (COMFORT_LABELS[value] || 'All');
      render();
    });
  });

  /* ---------- Search ------------------------------------------------------- */

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      state.query = searchInput.value.trim().toLowerCase();
      state.page = 1;
      render();
    });
    searchInput.addEventListener('search', () => {
      state.query = searchInput.value.trim().toLowerCase();
      state.page = 1;
      render();
    });
  }

  $$('[data-focus-search]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!searchInput) return;
      searchInput.focus();
      searchInput.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  });

  /* ---------- Reset --------------------------------------------------------- */

  $$('[data-reset-filters]').forEach((button) => {
    button.addEventListener('click', () => {
      state.category = 'all';
      state.use = 'all';
      state.comfort = 'all';
      state.query = '';
      state.page = 1;

      if (searchInput) searchInput.value = '';
      pills.forEach((pill) => {
        const isAll = pill.getAttribute('data-filter') === 'all';
        pill.classList.toggle('btn-dark', isAll);
        pill.classList.toggle('btn-outline-dark', !isAll);
      });
      usePills.forEach((pill) => {
        const isAll = pill.getAttribute('data-filter-use') === 'all';
        pill.classList.toggle('btn-dark', isAll);
        pill.classList.toggle('btn-outline-dark', !isAll);
      });
      comfortOpts.forEach((option) => {
        option.classList.toggle('active', option.getAttribute('data-comfort') === 'all');
      });
      if (comfortBtn) comfortBtn.textContent = 'Comfort: All';

      render();
    });
  });

  /* ---------- Presets from the URL (?category=premium&q=pillow) ---------- */

  const params = new URLSearchParams(window.location.search);
  const urlCategory = (params.get('category') || '').trim().toLowerCase();
  const urlQuery = (params.get('q') || '').trim();

  const urlUse = (params.get('use') || '').trim().toLowerCase();

  if (['coir', 'rebonded', 'spring', 'foam', 'bedding'].indexOf(urlCategory) !== -1) {
    state.category = urlCategory;
    pills.forEach((pill) => {
      const isActive = pill.getAttribute('data-filter') === urlCategory;
      pill.classList.toggle('btn-dark', isActive);
      pill.classList.toggle('btn-outline-dark', !isActive);
    });
  }

  if (['home', 'hotel', 'personal', 'kids', 'hostel'].indexOf(urlUse) !== -1) {
    state.use = urlUse;
    usePills.forEach((pill) => {
      const isActive = pill.getAttribute('data-filter-use') === urlUse;
      pill.classList.toggle('btn-dark', isActive);
      pill.classList.toggle('btn-outline-dark', !isActive);
    });
  }

  if (urlQuery) {
    state.query = urlQuery.toLowerCase();
    if (searchInput) searchInput.value = urlQuery;
  }

  render();
})();
