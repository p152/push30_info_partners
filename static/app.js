(function () {
  const boot = document.getElementById('partners-boot');
  const data = JSON.parse(boot.textContent);
  const mainPartners = data.mainPartners;
  const discountPartners = data.discountPartners;

  const serviceLabels = {
    gym: 'Тренажер',
    yoga: 'Йога',
    spa: 'Спа',
    entertainment: 'Развлечение',
    martial: 'Боевые искусства',
    dance: 'Танцы',
    pool: 'Бассейн',
  };

  const serviceRules = [
    { value: 'yoga', categories: ['yoga', 'pilates'], terms: ['йога', 'yoga', 'stretch', 'стретч', 'пилатес', 'pilates', 'gravity', 'гравити', 'здоровая спина'] },
    { value: 'gym', categories: ['gym', 'sport_shop', 'crossfit', 'running'], terms: ['тренажер', 'тренажёр', 'gym', 'кроссфит', 'crossfit', 'functional', 'fitness', 'фитнес', 'кардио', 'tabata', 'trx'] },
    { value: 'spa', categories: ['spa', 'dental'], terms: ['спа', 'spa', 'сауна', 'баня', 'хаммам', 'хамам', 'джакузи', 'массаж', 'lpg', 'космет', 'солевая', 'процедур'] },
    { value: 'entertainment', categories: ['bowling', 'climbing', 'golf', 'horse', 'ice', 'padel', 'pingpong', 'rafting', 'shooting', 'tennis'], terms: ['vr', 'картинг', 'катание', 'лед', 'конь', 'верховая', 'зиплайн', 'веревоч', 'тюбинг', 'скалодром', 'bowling', 'гольф', 'падел', 'теннис', 'пинг', 'рафтинг', 'стрельб', 'лук', 'развлеч', 'игра'] },
    { value: 'martial', categories: ['martial'], terms: ['boxing', 'бокс', 'mma', 'jiu', 'jitsu', 'джиу', 'карат', 'единобор', 'борьб', 'grappling', 'wrestling', 'боев', 'муай'] },
    { value: 'dance', categories: ['dance'], terms: ['dance', 'танц', 'зумба', 'arabic', 'латин', 'belly'] },
    { value: 'pool', categories: ['pool'], terms: ['бассейн', 'pool', 'плав', 'пляж', 'аква'] },
  ];

  const serviceFilterItems = [
    { value: 'gym', label: 'Тренажер', icon: 'dumbbell' },
    { value: 'yoga', label: 'Йога', icon: 'leaf' },
    { value: 'spa', label: 'Спа', icon: 'spark' },
    { value: 'entertainment', label: 'Развлечение', icon: 'game' },
    { value: 'martial', label: 'Боевые искусства', icon: 'shield' },
    { value: 'dance', label: 'Танцы', icon: 'music' },
    { value: 'pool', label: 'Бассейн', icon: 'waves' },
  ];

  function getPartnerText(partner, kind) {
    const parts = [partner.name || '', partner.category || ''];
    if (kind === 'main') {
      if (partner.standard) parts.push(partner.standard);
      if (partner.plus) parts.push(partner.plus);
    } else if (partner.description) parts.push(partner.description);
    return parts.filter(Boolean).join(' ').toLowerCase();
  }

  function includesAny(text, terms) {
    return terms.some((t) => text.includes(t));
  }

  function getPartnerServices(partner, kind) {
    const text = getPartnerText(partner, kind);
    const cat = partner.category || '';
    return serviceRules
      .filter((r) => r.categories.includes(cat) || includesAny(text, r.terms))
      .map((r) => r.value);
  }

  function toggleServiceFilter(filters, value) {
    return filters.includes(value) ? filters.filter((f) => f !== value) : [...filters, value];
  }

  function matchesServiceFilters(partner, kind, filters) {
    if (!filters.length) return true;
    const ps = getPartnerServices(partner, kind);
    return filters.some((f) => ps.includes(f));
  }

  const icons = {
    dumbbell: '<svg class="h-[13px] w-[13px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.931-2.931 2 2 0 0 1 2.931 2.931z"/><path d="M6.343 6.343a2 2 0 1 1 2.931 2.931 2 2 0 0 1-2.931-2.931z"/><path d="M21.485 6.343a2 2 0 1 1-2.931 2.931 2 2 0 0 1 2.931-2.931z"/><path d="M6.343 21.485a2 2 0 1 1 2.931-2.931 2 2 0 0 1-2.931 2.931z"/></svg>',
    leaf: '<svg class="h-[13px] w-[13px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 2 9.8-5.4 1.1-8.6 2.1-10 4.2Z"/><path d="M13 21c-1.354-2.58-1.75-4.89-1.5-7"/></svg>',
    spark: '<svg class="h-[13px] w-[13px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>',
    game: '<svg class="h-[13px] w-[13px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L18 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>',
    shield: '<svg class="h-[13px] w-[13px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
    music: '<svg class="h-[13px] w-[13px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    waves: '<svg class="h-[13px] w-[13px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>',
    sun: '<svg class="h-[18px] w-[18px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
    moon: '<svg class="h-[18px] w-[18px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
    rotate: '<svg class="h-[13px] w-[13px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
    x: '<svg class="h-[18px] w-[18px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    tag: '<svg class="h-[12px] w-[12px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>',
  };

  const state = {
    tab: 'main',
    search: '',
    tariffFilter: 'all',
    serviceFilters: [],
    isDark: false,
  };

  const el = {
    app: document.getElementById('app'),
    search: document.getElementById('search'),
    themeBtn: document.getElementById('themeBtn'),
    tabMain: document.getElementById('tabMain'),
    tabDiscount: document.getElementById('tabDiscount'),
    resultCount: document.getElementById('resultCount'),
    tariffRow: document.getElementById('tariffRow'),
    serviceRow: document.getElementById('serviceRow'),
    gridMount: document.getElementById('gridMount'),
    modalMount: document.getElementById('modalMount'),
  };

  function artUrl(partner, kind) {
    return `/partner-art/${kind === 'main' ? 'main' : 'discount'}/${partner.id}`;
  }

  function filteredMain() {
    const q = state.search.toLowerCase().trim();
    return mainPartners.filter((p) => {
      const okSearch = getPartnerText(p, 'main').includes(q);
      const okTariff =
        state.tariffFilter === 'all' ||
        (state.tariffFilter === 'standard' && p.standard) ||
        (state.tariffFilter === 'plus' && p.plus);
      return okSearch && okTariff && matchesServiceFilters(p, 'main', state.serviceFilters);
    });
  }

  function filteredDiscount() {
    const q = state.search.toLowerCase().trim();
    return discountPartners.filter(
      (p) => getPartnerText(p, 'discount').includes(q) && matchesServiceFilters(p, 'discount', state.serviceFilters),
    );
  }

  function activeFiltersCount() {
    return state.serviceFilters.length + (state.tab === 'main' && state.tariffFilter !== 'all' ? 1 : 0);
  }

  function syncTheme() {
    el.app.classList.toggle('dark', state.isDark);
    el.themeBtn.innerHTML = state.isDark ? icons.sun : icons.moon;
    el.themeBtn.title = state.isDark ? 'Светлая тема' : 'Тёмная тема';
    try {
      localStorage.setItem('push30-theme', state.isDark ? 'dark' : 'light');
    } catch (_) {}
  }

  function renderTabs() {
    const m = state.tab === 'main';
    el.tabMain.className =
      'rounded-lg px-4 py-2 text-sm font-bold transition ' +
      (m ? 'bg-[var(--p-logo-bd)] text-[#16180f]' : 'border border-[var(--p-btn-bd)] text-[var(--p-btn-tx)] hover:bg-[var(--p-btn-hv)]');
    if (!m) el.tabMain.classList.add('border');
    el.tabDiscount.className =
      'rounded-lg px-4 py-2 text-sm font-bold transition inline-flex items-center gap-1.5 ' +
      (!m ? 'bg-[#b76034] text-[#fff4d5]' : 'border border-[var(--p-btn-bd)] text-[var(--p-btn-tx)] hover:bg-[var(--p-btn-hv)]');
    if (m) el.tabDiscount.classList.add('border');
  }

  function renderTariffRow() {
    el.tariffRow.innerHTML = '';
    if (state.tab !== 'main') return;
    const opts = [
      { value: 'all', label: 'Все тарифы' },
      { value: 'standard', label: 'Стандарт' },
      { value: 'plus', label: 'Плюс' },
    ];
    opts.forEach((o) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.tariff = o.value;
      b.textContent = o.label;
      const on = state.tariffFilter === o.value;
      b.className =
        'rounded-full px-3 py-1.5 text-xs font-bold transition ' +
        (on ? 'bg-[#2e4c35] text-[#dff0b0]' : 'border border-[var(--p-btn-bd)] text-[var(--p-btn-tx)] hover:bg-[var(--p-btn-hv)]');
      if (!on) b.classList.add('border');
      b.addEventListener('click', () => {
        state.tariffFilter = o.value;
        renderAll();
      });
      el.tariffRow.appendChild(b);
    });
  }

  function renderServiceRow() {
    el.serviceRow.innerHTML = '';
    serviceFilterItems.forEach((item) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.service = item.value;
      const active = state.serviceFilters.includes(item.value);
      b.className =
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ' +
        (active ? 'bg-[#743f22] text-[#ffd891]' : 'border border-[var(--p-btn-bd)] text-[var(--p-btn-tx)] hover:bg-[var(--p-btn-hv)]');
      if (!active) b.classList.add('border');
      b.innerHTML = icons[item.icon] + item.label;
      b.addEventListener('click', () => {
        state.serviceFilters = toggleServiceFilter(state.serviceFilters, item.value);
        renderAll();
      });
      el.serviceRow.appendChild(b);
    });
    if (activeFiltersCount() > 0 || state.search) {
      const reset = document.createElement('button');
      reset.type = 'button';
      reset.className =
        'inline-flex items-center gap-1.5 rounded-full border border-[var(--p-btn-bd)] px-3 py-1.5 text-xs font-bold text-[var(--p-txt-1)] transition hover:bg-[var(--p-btn-hv)]';
      reset.innerHTML = icons.rotate + 'Сбросить';
      reset.addEventListener('click', () => {
        state.search = '';
        state.tariffFilter = 'all';
        state.serviceFilters = [];
        el.search.value = '';
        renderAll();
      });
      el.serviceRow.appendChild(reset);
    }
  }

  function renderGrid() {
    const list = state.tab === 'main' ? filteredMain() : filteredDiscount();
    el.resultCount.textContent = String(list.length);

    if (!list.length) {
      el.gridMount.innerHTML =
        '<div class="rounded-lg border border-[var(--p-emp-bd)] bg-[var(--p-emp-bg)] px-6 py-16 text-center text-[var(--p-emp-tx)]">Ничего не найдено</div>';
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';

    list.forEach((partner) => {
      const kind = state.tab === 'main' ? 'main' : 'discount';
      const card = document.createElement('button');
      card.type = 'button';
      card.className =
        'group overflow-hidden rounded-lg border border-[var(--p-card-bd)] bg-[var(--p-card-bg)] text-left shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition duration-200 hover:-translate-y-1 hover:border-[var(--p-card-hv-bd)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-logo-bd)]';

      const imgWrap = document.createElement('div');
      imgWrap.className = 'relative h-44 overflow-hidden';
      const img = document.createElement('img');
      img.src = artUrl(partner, kind);
      img.alt = partner.name;
      img.className = 'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105';
      const grad = document.createElement('div');
      grad.className = 'absolute inset-0 bg-gradient-to-t from-[#080a07]/70 via-transparent to-transparent';
      const badges = document.createElement('div');
      badges.className = 'absolute bottom-2 left-3 flex flex-wrap gap-1.5';

      if (kind === 'main') {
        if (partner.standard) {
          const s = document.createElement('span');
          s.className = 'rounded-full bg-[#2e4c35] px-2 py-0.5 text-[10px] font-bold text-[#dff0b0]';
          s.textContent = 'Стандарт';
          badges.appendChild(s);
        }
        if (partner.plus) {
          const s = document.createElement('span');
          s.className = 'rounded-full bg-[#743f22] px-2 py-0.5 text-[10px] font-bold text-[#ffd891]';
          s.textContent = 'Плюс';
          badges.appendChild(s);
        }
      } else {
        const s = document.createElement('span');
        s.className = 'rounded-full bg-[#743f22] px-2 py-0.5 text-[10px] font-bold text-[#ffd891]';
        s.textContent = 'Скидки';
        badges.appendChild(s);
      }

      imgWrap.appendChild(img);
      imgWrap.appendChild(grad);
      imgWrap.appendChild(badges);

      const body = document.createElement('div');
      body.className = 'p-4';
      const h3 = document.createElement('h3');
      h3.className = 'line-clamp-2 text-sm font-black leading-tight text-[#202316]';
      h3.textContent = partner.name;

      body.appendChild(h3);

      if (kind === 'main') {
        const sub = document.createElement('p');
        sub.className = 'mt-1 text-xs font-semibold text-[#676044]';
        const both = partner.standard && partner.plus;
        sub.textContent = both ? 'Стандарт и Плюс' : partner.standard ? 'Только Стандарт' : 'Только Плюс';
        body.appendChild(sub);
      } else if (partner.description) {
        const sub = document.createElement('p');
        sub.className = 'mt-1 line-clamp-2 text-xs text-[#676044]';
        sub.textContent = partner.description;
        body.appendChild(sub);
      }

      const svcs = getPartnerServices(partner, kind).slice(0, 3);
      if (svcs.length) {
        const row = document.createElement('div');
        row.className = 'mt-3 flex flex-wrap gap-1';
        svcs.forEach((s) => {
          const t = document.createElement('span');
          t.className =
            'rounded border border-[#b5a16c] bg-[#fff4d5] px-1.5 py-0.5 text-[10px] font-bold text-[#4b442b]';
          t.textContent = serviceLabels[s];
          row.appendChild(t);
        });
        body.appendChild(row);
      }

      card.appendChild(imgWrap);
      card.appendChild(body);
      card.addEventListener('click', () => openModal(partner, kind));
      grid.appendChild(card);
    });

    el.gridMount.innerHTML = '';
    el.gridMount.appendChild(grid);
  }

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function openModal(partner, kind) {
    const services = getPartnerServices(partner, kind);
    const svcHtml = services
      .map(
        (s) =>
          `<span class="rounded-full border border-[var(--p-svc-md-bd)] bg-[var(--p-svc-md-bg)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--p-svc-md-tx)]">${esc(
            serviceLabels[s],
          )}</span>`,
      )
      .join('');

    let inner = '';
    if (kind === 'main') {
      inner = `
        <div class="mb-3 flex flex-wrap gap-1.5">${svcHtml}</div>
        <h2 class="mb-4 text-2xl font-black leading-tight text-[var(--p-mod-tx)]">${esc(partner.name)}</h2>
        ${
          partner.standard
            ? `<div class="mb-5 rounded-lg border border-[var(--p-mod-std-bd)] bg-[var(--p-mod-std-bg)] p-4">
          <div class="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#2e4c35] px-3 py-1 text-xs font-bold text-[#dff0b0]">${icons.dumbbell} Стандарт</div>
          <p class="whitespace-pre-line text-sm leading-relaxed text-[var(--p-mod-tx)]">${esc(partner.standard)}</p>
        </div>`
            : ''
        }
        ${
          partner.plus
            ? `<div class="rounded-lg border border-[var(--p-mod-pls-bd)] bg-[var(--p-mod-pls-bg)] p-4">
          <div class="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#743f22] px-3 py-1 text-xs font-bold text-[#ffd891]">${icons.dumbbell} Плюс</div>
          <p class="whitespace-pre-line text-sm leading-relaxed text-[var(--p-mod-tx)]">${esc(partner.plus)}</p>
        </div>`
            : ''
        }`;
    } else {
      inner = `
        <div class="mb-3 flex flex-wrap gap-1.5">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-[#743f22] px-3 py-1 text-xs font-bold text-[#ffd891]">${icons.tag} Дискаунт-партнёр</span>
          ${svcHtml}
        </div>
        <h2 class="mb-4 text-2xl font-black leading-tight text-[var(--p-mod-tx)]">${esc(partner.name)}</h2>
        ${
          partner.description
            ? `<p class="whitespace-pre-line text-sm leading-relaxed text-[var(--p-mod-tx)]">${esc(partner.description)}</p>`
            : ''
        }`;
    }

    el.modalMount.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#080a07]/80 p-4 backdrop-blur-sm" id="modalBackdrop">
        <div class="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-[var(--p-mod-bd)] bg-[var(--p-mod-bg)] shadow-2xl" id="modalPanel">
          <img src="${artUrl(partner, kind)}" alt="${esc(partner.name)}" class="h-52 w-full rounded-t-lg object-cover" />
          <button type="button" class="absolute right-3 top-3 rounded-full border border-[var(--p-mod-cl-bd)] bg-[var(--p-mod-cl-bg)] p-1.5 text-[var(--p-mod-cl-tx)] shadow transition hover:bg-white" id="modalClose" aria-label="Закрыть">${icons.x}</button>
          <div class="p-6">${inner}</div>
        </div>
      </div>`;

    const backdrop = document.getElementById('modalBackdrop');
    const panel = document.getElementById('modalPanel');
    const close = document.getElementById('modalClose');
    function shut() {
      el.modalMount.innerHTML = '';
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) {
      if (e.key === 'Escape') shut();
    }
    backdrop.addEventListener('click', shut);
    panel.addEventListener('click', (e) => e.stopPropagation());
    close.addEventListener('click', shut);
    document.addEventListener('keydown', onKey);
  }

  function renderAll() {
    renderTabs();
    renderTariffRow();
    renderServiceRow();
    renderGrid();
  }

  el.search.addEventListener('input', () => {
    state.search = el.search.value;
    renderGrid();
    el.resultCount.textContent = String(state.tab === 'main' ? filteredMain().length : filteredDiscount().length);
  });

  el.themeBtn.addEventListener('click', () => {
    state.isDark = !state.isDark;
    syncTheme();
  });

  el.tabMain.addEventListener('click', () => {
    state.tab = 'main';
    renderAll();
  });
  el.tabDiscount.addEventListener('click', () => {
    state.tab = 'discount';
    renderAll();
  });

  try {
    if (localStorage.getItem('push30-theme') === 'dark') state.isDark = true;
  } catch (_) {}
  syncTheme();
  renderAll();
})();
