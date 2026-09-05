/* Hiên Biển | Vanilla JavaScript, no external requests or runtime dependencies. */
(() => {
  'use strict';
  const content = window.HIEN_BIEN_CONTENT;
  if (!content || !Array.isArray(content.slides)) return;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const slides = $$('.slide');
  const total = slides.length;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STORE_KEY = 'hien-bien-meeting-v1';
  let current = 0;
  let mode = window.matchMedia('(max-width: 760px)').matches ? 'read' : 'deck';
  let readingObserver = null;
  let scrollLockUntil = 0;
  let toastTimer;
  let cashView = 'ebitda';
  let currentScenario = 'base';
  const number = (value, decimals = 1) => new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: decimals, maximumFractionDigits: decimals
  }).format(value);
  const compact = value => number(value, Math.abs(value - Math.round(value)) < 0.00001 ? 0 : 1);
  const signed = (value, decimals = 1) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${number(Math.abs(value), decimals)}`;
  const escape = text => String(text).replace(/[&<>"']/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[ch]));
  const toast = message => {
    const box = $('#toast');
    box.textContent = message;
    box.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.classList.remove('show'), 3800);
  };

  // Navigation and two reading modes.
  const indexFromHash = () => {
    const key = decodeURIComponent(window.location.hash.slice(1));
    return Math.max(0, content.slides.findIndex(slide => slide.key === key));
  };
  function setAddress(index, push = true) {
    const hash = '#' + content.slides[index].key;
    if (window.location.hash === hash) return;
    try { window.history[push ? 'pushState' : 'replaceState'](null, '', hash); }
    catch (_) { /* Navigation remains functional where the file viewer blocks history. */ }
  }
  function updateChrome(announce = false) {
    $('#slide-number').textContent = String(current + 1).padStart(2, '0');
    $('#footer-chapter').textContent = content.slides[current].chapter;
    $('#previous-slide').disabled = current === 0;
    $('#next-slide').disabled = current === total - 1;
    $$('#progress-segments button').forEach((button, i) => {
      button.classList.toggle('active', i === current);
      button.classList.toggle('seen', i < current);
      if (i === current) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    $$('.chapter-nav button').forEach(button => {
      const active = button.dataset.chapter === content.slides[current].chapter;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    document.title = `Hiên Biển | ${String(current + 1).padStart(2, '0')}. ${content.slides[current].title}`;
    if (announce) $('#slide-announcer').textContent = `Phần ${current + 1} trên ${total}. ${content.slides[current].title}`;
  }
  function observeReading() {
    if (readingObserver) readingObserver.disconnect();
    if (mode !== 'read' || !('IntersectionObserver' in window)) return;
    readingObserver = new IntersectionObserver(entries => {
      if (Date.now() < scrollLockUntil) return;
      const entry = entries.filter(item => item.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top - 150) - Math.abs(b.boundingClientRect.top - 150))[0];
      if (entry) {
        current = Number(entry.target.dataset.index);
        updateChrome();
        setAddress(current, false);
      }
    }, { rootMargin: '-18% 0px -65% 0px', threshold: 0 });
    slides.forEach(slide => readingObserver.observe(slide));
  }
  function goTo(index, { push = true, behavior = 'smooth', focus = false } = {}) {
    index = Math.max(0, Math.min(total - 1, Math.round(Number(index) || 0)));
    current = index;
    scrollLockUntil = Date.now() + 700;
    if (mode === 'deck') {
      slides.forEach((slide, i) => { slide.hidden = i !== current; });
      slides[current].scrollTop = 0;
      if (focus) {
        const heading = $('h2, h1', slides[current]);
        if (heading) heading.focus({ preventScroll: true });
      }
    } else {
      slides[current].scrollIntoView({ behavior: reduceMotion ? 'auto' : behavior, block: 'start' });
    }
    updateChrome(true);
    setAddress(current, push);
  }
  function applyMode(newMode, initial = false) {
    mode = newMode === 'read' ? 'read' : 'deck';
    document.body.dataset.mode = mode;
    slides.forEach((slide, i) => { slide.hidden = mode === 'deck' && i !== current; });
    $('#view-mode').setAttribute('aria-label', mode === 'deck' ? 'Chuyển sang đọc liên tục' : 'Chuyển sang trình chiếu');
    $('#view-mode').setAttribute('title', mode === 'deck' ? 'Đọc liên tục' : 'Trình chiếu từng phần');
    $('#view-mode').setAttribute('aria-pressed', mode === 'read' ? 'true' : 'false');
    if (mode === 'deck') window.scrollTo({ top: 0, behavior: 'instant' });
    observeReading();
    if (!initial) {
      requestAnimationFrame(() => goTo(current, { push: false, behavior: 'auto' }));
      toast(mode === 'read' ? 'Chế độ đọc liên tục. Cuộn để xem toàn bộ nội dung.' : 'Chế độ trình chiếu. Dùng ← → để chuyển phần.');
    }
  }
  $('#progress-segments').innerHTML = content.slides.map((slide, i) =>
    `<button type="button" data-jump="${i}" title="${i + 1}. ${escape(slide.title)}" aria-label="Phần ${i + 1}: ${escape(slide.title)}"></button>`).join('');
  document.addEventListener('click', event => {
    const target = event.target.closest('[data-jump]');
    if (!target) return;
    if (target.closest('dialog')) target.closest('dialog').close();
    goTo(Number(target.dataset.jump));
  });
  $('#previous-slide').addEventListener('click', () => goTo(current - 1));
  $('#next-slide').addEventListener('click', () => goTo(current + 1));
  $('#view-mode').addEventListener('click', () => applyMode(mode === 'deck' ? 'read' : 'deck'));
  window.addEventListener('popstate', () => goTo(indexFromHash(), { push: false, behavior: 'auto' }));
  window.addEventListener('hashchange', () => {
    if (indexFromHash() !== current) goTo(indexFromHash(), { push: false, behavior: 'auto' });
  });
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else toast('Trình duyệt này chưa hỗ trợ toàn màn hình. Dùng chế độ trình chiếu hoặc mở trên máy tính.');
    } catch (_) { toast('Không bật được toàn màn hình trong trình xem này. Mở file bằng trình duyệt để sử dụng.'); }
  }
  $('#fullscreen').addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', () => {
    $('#fullscreen').setAttribute('aria-label', document.fullscreenElement ? 'Thoát toàn màn hình' : 'Toàn màn hình');
    $('#fullscreen').setAttribute('aria-pressed', document.fullscreenElement ? 'true' : 'false');
  });

  // Accessible native dialogs handle focus containment and Escape.
  const normalize = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  function drawOverview(query = '') {
    const needle = normalize(query).trim();
    const list = content.slides.map((slide, i) => ({ ...slide, i }))
      .filter(slide => normalize(`${slide.title} ${slide.chapter} ${slide.notes.join(' ')}`).includes(needle));
    $('#overview-list').innerHTML = list.length ? list.map(slide =>
      `<button class="overview-item ${slide.i === current ? 'active' : ''}" data-jump="${slide.i}" ${slide.i === current ? 'aria-current="page"' : ''}><span class="overview-num">${String(slide.i + 1).padStart(2, '0')}</span><div><small>${escape(slide.chapter)}</small><strong>${escape(slide.title)}</strong></div></button>`).join('')
      : '<p class="overview-empty">Không có phần phù hợp. Thử từ khóa khác.</p>';
  }
  function openOverview() {
    $('#overview-search').value = '';
    drawOverview();
    $('#overview-dialog').showModal();
    $('#overview-search').focus();
  }
  function openNotes() {
    const slide = content.slides[current];
    $('#notes-label').textContent = `GHI CHÚ THUYẾT TRÌNH / ${String(current + 1).padStart(2, '0')} / ${slide.chapter}`;
    $('#notes-title').textContent = slide.title;
    $('#notes-body').innerHTML = slide.notes.map(text => `<p>${escape(text)}</p>`).join('');
    $('#notes-dialog').showModal();
    $('#notes-body').scrollTop = 0;
  }
  $('#open-overview').addEventListener('click', openOverview);
  $('#overview-search').addEventListener('input', event => drawOverview(event.target.value));
  $('#open-notes').addEventListener('click', openNotes);
  $('#notes-to-source').addEventListener('click', () => { $('#notes-dialog').close(); goTo(25); });
  $$('[data-close]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()));
  $$('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  }));
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return;
    if ($$('dialog').some(dialog => dialog.open)) return;
    const interactive = event.target.closest('input,textarea,select,[contenteditable="true"]');
    if (interactive) return;
    if (['ArrowRight', 'PageDown'].includes(event.key)) { event.preventDefault(); goTo(current + 1); }
    else if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); goTo(current - 1); }
    else if (event.key === 'Home') { event.preventDefault(); goTo(0); }
    else if (event.key === 'End') { event.preventDefault(); goTo(total - 1); }
    else if (event.key === ' ' && !event.target.closest('button,a,summary')) { event.preventDefault(); goTo(current + (event.shiftKey ? -1 : 1)); }
    else if (event.key.toLowerCase() === 'm') { event.preventDefault(); openOverview(); }
    else if (event.key.toLowerCase() === 'n') { event.preventDefault(); openNotes(); }
    else if (event.key.toLowerCase() === 'f') { event.preventDefault(); toggleFullscreen(); }
  });
  let touchOrigin = null;
  $('#deck').addEventListener('touchstart', event => {
    if (mode !== 'deck' || event.touches.length !== 1 || event.target.closest('input,button,a,textarea,details,.table-wrap,.cash-chart')) { touchOrigin = null; return; }
    touchOrigin = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  $('#deck').addEventListener('touchend', event => {
    if (!touchOrigin || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchOrigin.x;
    const dy = event.changedTouches[0].clientY - touchOrigin.y;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8) goTo(current + (dx < 0 ? 1 : -1));
    touchOrigin = null;
  }, { passive: true });

  // Activity schedule.
  const schedules = {
    morning: { range: '08:30–11:00', items: [
      ['08:30', 'Đón tiếp & làm quen', 'Chào đón, trò chuyện và sẵn sàng cho buổi sinh hoạt.'],
      ['08:45', 'Vận động phù hợp', 'Lựa chọn ngồi hoặc đứng, theo khả năng tham gia.'],
      ['09:20', 'Trà & trò chuyện', 'Một khoảng nghỉ để gặp gỡ trong nhóm nhỏ.'],
      ['09:45', 'Hoạt động sở thích', 'Học hỏi, sáng tạo hoặc chia sẻ theo chủ đề.'],
      ['10:45', 'Phản hồi & hẹn lần tới', 'Trao đổi cảm nhận, kết thúc buổi lúc 11:00.']
    ]},
    afternoon: { range: '14:00–16:30', items: [
      ['14:00', 'Đón tiếp & kết nối', 'Gặp lại nhóm, giới thiệu hội viên mới.'],
      ['14:15', 'Vận động nhẹ', 'Khởi động phù hợp khả năng, không phải trị liệu.'],
      ['14:50', 'Nghỉ trà', 'Thư giãn và trò chuyện theo nhóm nhỏ.'],
      ['15:15', 'Học hỏi & sáng tạo', 'Nhóm sách, âm nhạc, công nghệ hoặc hội họa.'],
      ['16:15', 'Chia sẻ & kết thúc', 'Phản hồi, thống nhất buổi tiếp theo, kết thúc 16:30.']
    ]}
  };
  function setSession(key) {
    const data = schedules[key] || schedules.morning;
    $('#session-range').textContent = data.range;
    $('#session-timeline').innerHTML = data.items.map(([time, title, description]) =>
      `<div class="session-event"><time>${time}</time><div><h3>${title}</h3><p>${description}</p></div></div>`).join('');
    $$('[data-session]').forEach(button => {
      button.classList.toggle('active', button.dataset.session === key);
      button.setAttribute('aria-pressed', String(button.dataset.session === key));
    });
  }
  $$('[data-session]').forEach(button => button.addEventListener('click', () => setSession(button.dataset.session)));
  setSession('morning');

  // Space allocation is conceptual, not a technical drawing.
  $$('[data-zone]').forEach(button => button.addEventListener('click', () => {
    const zone = content.zones.find(item => item.key === button.dataset.zone);
    if (!zone) return;
    $('#zone-area').textContent = zone.area;
    $('#zone-name').textContent = zone.name;
    $('#zone-title').textContent = zone.title;
    $('#zone-description').textContent = zone.description;
    $$('[data-zone]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
  }));

  // Financial formulas correspond to the input workbook (million VND per month).
  function calculateModel({ members, arpu, rent, payroll, extra = 20 }) {
    const valid = [members, arpu, rent, payroll, extra].every(value => Number.isFinite(value) && value >= 0);
    if (!valid) throw new TypeError('Inputs must be finite, non-negative numbers.');
    const variablePerMember = 10 * 0.02;
    const variable = members * variablePerMember + extra * 0.45;
    const revenue = members * arpu + extra;
    const fixed = payroll + rent + 50;
    const cost = variable + fixed;
    const ebitda = revenue - cost;
    const contribution = arpu - variablePerMember;
    const breakEven = contribution > 0 ? Math.max(0, Math.ceil((fixed - extra * 0.55) / contribution - 1e-9)) : null;
    return { members, arpu, rent, payroll, extra, variable, revenue, fixed, cost, ebitda,
      margin: revenue > 0 ? ebitda / revenue : null, breakEven };
  }
  const scenarios = {
    low: { members: 100, arpu: 1.6, rent: 60, payroll: 95, extra: 10 },
    base: { members: 160, arpu: 1.6, rent: 60, payroll: 110, extra: 20 },
    high: { members: 200, arpu: 1.6, rent: 60, payroll: 125, extra: 30 }
  };
  function renderScenario(key) {
    const data = calculateModel(scenarios[key] || scenarios.base);
    currentScenario = key;
    $('#scenario-ebitda').innerHTML = signed(data.ebitda, Number.isInteger(data.ebitda) ? 0 : 1) + '<span>triệu</span>';
    $('#scenario-margin').textContent = `Biên ${number(data.margin * 100, 1)}%`;
    $('#scenario-revenue').textContent = compact(data.revenue);
    const comments = { low: 'Chưa đủ quy mô bù chi phí. Không dùng kịch bản này để cam kết đầu tư lớn.', base: 'Dương nhưng mỏng. Cần xem lại tiền thuê, giá thu và tổng vốn đầu tư.', high: 'Khả quan hơn, nhưng cần chứng minh 200 hội viên, giá thu và năng lực vận hành.' };
    $('#scenario-comment').textContent = comments[key] || comments.base;
    const items = [
      { label: 'Biến phí', value: data.variable, color: '#b5c7a0' },
      { label: 'Nhân sự', value: data.payroll, color: '#58764c' },
      { label: 'Thuê mặt bằng', value: data.rent, color: '#d2ae77' },
      { label: 'Cố định khác', value: 50, color: '#d7dac5' }
    ];
    const stackItems = data.ebitda > 0 ? [...items, { label: 'EBITDA', value: data.ebitda, color: '#9fb89b' }] : items;
    const denominator = stackItems.reduce((sum, item) => sum + item.value, 0);
    $('#scenario-stack').innerHTML = stackItems.map(item => `<span style="width:${item.value / denominator * 100}%;background:${item.color}" title="${item.label}: ${compact(item.value)} triệu"></span>`).join('');
    $('#scenario-stack').setAttribute('aria-label', `${data.ebitda < 0 ? 'Cơ cấu chi phí, tổng chi phí cao hơn doanh thu' : 'Cơ cấu doanh thu trừ chi phí và EBITDA'}: ${items.map(item => item.label + ' ' + compact(item.value)).join(', ')}; EBITDA ${compact(data.ebitda)} triệu.`);
    $('#scenario-legend').innerHTML = items.map(item => `<div class="legend-row"><span class="swatch" style="background:${item.color}"></span><span>${item.label}</span><strong>${compact(item.value)}</strong></div>`).join('');
    $('#scenario-equation').innerHTML = `${compact(data.revenue)} − ${compact(data.variable)} − ${compact(data.payroll)} − 60 − 50 = <b>${compact(data.ebitda)}</b>`;
    $$('[data-scenario]').forEach(button => {
      const active = button.dataset.scenario === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  $$('[data-scenario]').forEach(button => button.addEventListener('click', () => renderScenario(button.dataset.scenario)));
  renderScenario('base');
  function getSimulatorInputs() {
    const input = {};
    $$('[data-sim]').forEach(slider => { input[slider.dataset.sim] = Number(slider.value); });
    input.extra = Math.max(0, Math.min(100, Number($('#sim-extra').value) || 0));
    return input;
  }
  function updateSimulator() {
    const inputs = getSimulatorInputs();
    const result = calculateModel(inputs);
    $$('[data-sim]').forEach(slider => {
      const key = slider.dataset.sim;
      const unit = key === 'members' ? 'người' : 'triệu';
      const decimals = key === 'arpu' ? (Math.round(inputs[key] * 100) % 10 === 0 ? 1 : 2) : 0;
      $(`#out-${key}`).innerHTML = `${number(inputs[key], decimals)} <small>${unit}</small>`;
      slider.style.setProperty('--range-progress', `${(Number(slider.value) - Number(slider.min)) / (Number(slider.max) - Number(slider.min)) * 100}%`);
      slider.setAttribute('aria-valuetext', `${number(inputs[key], decimals)} ${unit}`);
    });
    $('#sim-ebitda').innerHTML = `${signed(result.ebitda, 1)}<small>triệu đồng</small>`;
    $('#sim-revenue').textContent = number(result.revenue);
    $('#sim-cost').textContent = number(result.cost);
    $('#sim-margin').textContent = result.margin === null ? 'Không xác định' : `${number(result.margin * 100)}%`;
    $('#sim-breakeven').textContent = result.breakEven === null ? 'Không đạt' : number(result.breakEven, 0);
    const status = result.ebitda < 0 ? 'Chưa hòa vốn vận hành' : result.margin < .1 ? 'Dương nhưng biên mỏng' : 'Kết quả giả định khả quan hơn';
    $('#sim-status').innerHTML = `<span class="status-dot"></span> ${status}`;
    $('.sim-output').classList.toggle('is-negative', result.ebitda < 0);
    $('#sim-message').textContent = result.breakEven === null ? 'Lãi đóng góp mỗi hội viên không dương; mô hình không có điểm hòa vốn hữu hạn ở cấu trúc này.' : `Cần khoảng ${number(result.breakEven, 0)} hội viên để hòa vốn với cơ cấu chi phí đang chọn.`;
  }
  $$('[data-sim]').forEach(slider => slider.addEventListener('input', updateSimulator));
  $('#sim-extra').addEventListener('input', updateSimulator);
  $('#sim-extra').addEventListener('blur', () => { $('#sim-extra').value = getSimulatorInputs().extra; updateSimulator(); });
  $('#sim-reset').addEventListener('click', () => {
    $$('[data-sim]').forEach(slider => { slider.value = scenarios.base[slider.dataset.sim]; });
    $('#sim-extra').value = 20;
    updateSimulator();
  });
  updateSimulator();

  // Twelve-month ramp-up, matching the workbook's rounding of retained members.
  function calculateRampUp() {
    const targets = [40, 60, 80, 100, 120, 140, 150, 160, 170, 180, 190, 200];
    const extras = [5, 8, 10, 12, 15, 17, 18, 20, 22, 25, 28, 30];
    let previous = 0;
    let cumulative = 0;
    return targets.map((target, i) => {
      const retained = Math.round(previous * .95 + 1e-9);
      const newMembers = target - retained;
      const equivalent = retained + newMembers * .5;
      const payroll = i < 4 ? 95 : i < 9 ? 110 : 125;
      const result = calculateModel({ members: equivalent, arpu: 1.6, rent: 60, payroll, extra: extras[i] });
      cumulative += result.ebitda;
      previous = target;
      return { month: i + 1, target, retained, newMembers, equivalent, ...result,
        cumulative, cash: 1100 + cumulative, buffer: result.fixed * 2 };
    });
  }
  const rampUp = calculateRampUp();
  function cashTable() {
    $('#cash-table').innerHTML = `<table><caption class="sr-only">Dữ liệu dòng tiền giản lược 12 tháng, đơn vị triệu đồng</caption><thead><tr><th>Tháng</th><th>HV cuối tháng</th><th>Khách mới</th><th>Doanh thu</th><th>EBITDA</th><th>Lũy kế</th><th>Tiền mặt</th><th>Đệm nội bộ</th></tr></thead><tbody>${rampUp.map(row => `<tr><td>T${row.month}</td><td>${row.target}</td><td>${row.newMembers}</td><td>${number(row.revenue)}</td><td>${number(row.ebitda)}</td><td>${number(row.cumulative)}</td><td>${number(row.cash)}</td><td>${row.buffer}</td></tr>`).join('')}</tbody></table>`;
  }
  function renderCashChart(view) {
    cashView = view;
    const W = 1040, H = 218, left = 57, right = 17, top = 22, bottom = 186;
    const step = (W - left - right) / 12;
    const x = i => left + step * (i + .5);
    const isCash = view === 'cash';
    const min = isCash ? 350 : -200, max = isCash ? 1100 : 75;
    const y = value => top + (max - value) / (max - min) * (bottom - top);
    const grid = isCash ? [400,600,800,1000] : [-150,-100,-50,0,50];
    const gridLines = grid.map(value => `<line x1="${left}" y1="${y(value)}" x2="${W-right}" y2="${y(value)}" stroke="${value===0?'#bdcdb0':'#e2e6d8'}" stroke-width="1"/><text class="chart-axis" x="${left-12}" y="${y(value)+4}" text-anchor="end">${value}</text>`).join('');
    const labels = rampUp.map((row, i) => `<text class="chart-label" x="${x(i)}" y="${H-9}" text-anchor="middle">T${row.month}</text>`).join('');
    let graph;
    if (isCash) {
      const points = rampUp.map((row, i) => `${x(i)},${y(row.cash)}`).join(' ');
      const area = `M ${x(0)} ${bottom} L ${rampUp.map((row,i)=>`${x(i)} ${y(row.cash)}`).join(' L ')} L ${x(11)} ${bottom} Z`;
      const buffer = rampUp.map((row,i) => `${x(i)},${y(row.buffer)}`).join(' ');
      graph = `<path d="${area}" fill="#dce7d1" opacity=".65"/><polyline points="${buffer}" fill="none" stroke="#b68c55" stroke-width="1.6" stroke-dasharray="5 5"/><polyline points="${points}" fill="none" stroke="#67874e" stroke-width="2.5"/>${rampUp.map((row,i) => `<circle cx="${x(i)}" cy="${y(row.cash)}" r="4" fill="#67874e"/><text class="chart-number" x="${x(i)}" y="${y(row.cash)-12}" text-anchor="middle">${number(row.cash,1)}</text>`).join('')}`;
      $('#cash-chart-note').textContent = 'Đường liền: tiền mặt giản lược; nét đứt: đệm nội bộ 2 tháng cố định. Vốn đầu kỳ 1.100 triệu; chưa tính VAT, công nợ, CAPEX bổ sung, thuế và lãi vay.';
    } else {
      const barWidth = Math.min(43, step * .58);
      graph = rampUp.map((row,i) => {
        const positive = row.ebitda >= 0;
        const barTop = positive ? y(row.ebitda) : y(0);
        const height = Math.max(2, Math.abs(y(row.ebitda)-y(0)));
        const labelY = positive ? y(row.ebitda)-9 : y(row.ebitda)+15;
        return `<rect x="${x(i)-barWidth/2}" y="${barTop}" width="${barWidth}" height="${height}" rx="3" fill="${positive?'#769665':'#c8a47a'}"/><text class="chart-number" x="${x(i)}" y="${labelY}" text-anchor="middle">${number(row.ebitda,1)}</text>`;
      }).join('');
      $('#cash-chart-note').textContent = 'Giả định 5% không gia hạn/tháng; khách mới chỉ tạo nửa tháng doanh thu trung bình. Tuyển mới bù khách rời đi. Đây là mô phỏng, không phải dự báo mùa vụ.';
    }
    $('#cash-chart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="cash-chart-title cash-chart-description"><title id="cash-chart-title">${isCash?'Tiền mặt giản lược 12 tháng':'EBITDA từng tháng trong năm đầu'}</title><desc id="cash-chart-description">${isCash?'Tiền mặt thấp nhất 508,85 triệu ở tháng 7, kết thúc năm 628,9 triệu.':'EBITDA từ âm 174,25 triệu tháng 1 đến dương 48,2 triệu tháng 12; lũy kế năm âm 471,1 triệu.'} Dữ liệu đầy đủ có trong bảng số liệu.</desc>${gridLines}${graph}${labels}</svg>`;
    $$('[data-cash-view]').forEach(button => {
      const active = button.dataset.cashView === view;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  $$('[data-cash-view]').forEach(button => button.addEventListener('click', () => renderCashChart(button.dataset.cashView)));
  $('#cash-table-toggle').addEventListener('click', () => {
    const table = $('#cash-table');
    table.hidden = !table.hidden;
    $('#cash-table-toggle').setAttribute('aria-expanded', String(!table.hidden));
    $('#cash-table-toggle').firstChild.textContent = table.hidden ? 'Xem bảng số liệu ' : 'Ẩn bảng số liệu ';
    if (!table.hidden) table.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  });
  cashTable(); renderCashChart('ebitda');

  // Local-only meeting notes. No personal or health data is required.
  function loadMeeting() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      $$('[data-check]').forEach(input => { input.checked = !!(saved.checks && saved.checks[input.dataset.check]); });
      $('#meeting-notes').value = typeof saved.notes === 'string' ? saved.notes : '';
    } catch (_) { /* Storage can be unavailable inside file viewers or privacy modes. */ }
    refreshMeetingCount();
  }
  function meetingData() {
    const checks = {};
    $$('[data-check]').forEach(input => { checks[input.dataset.check] = input.checked; });
    return { checks, notes: $('#meeting-notes').value.slice(0, 20000) };
  }
  function refreshMeetingCount() {
    const count = $$('[data-check]').filter(input => input.checked).length;
    $('#decision-count').textContent = `${count} / 6`;
  }
  let storageWarningShown = false;
  function saveMeeting() {
    refreshMeetingCount();
    try { localStorage.setItem(STORE_KEY, JSON.stringify(meetingData())); }
    catch (_) { if (!storageWarningShown) { toast('Trình duyệt không cho lưu cục bộ. Dùng Xuất ghi chú trước khi đóng trang.'); storageWarningShown = true; } }
  }
  $$('[data-check]').forEach(input => input.addEventListener('change', saveMeeting));
  $('#meeting-notes').addEventListener('input', saveMeeting);
  $('#meeting-notes').maxLength = 20000;
  $('#reset-meeting').addEventListener('click', () => {
    const exists = $$('[data-check]').some(input => input.checked) || $('#meeting-notes').value.length > 0;
    if (exists && !window.confirm('Xóa toàn bộ dấu chọn và ghi chú thảo luận đang lưu trên trình duyệt này?')) return;
    $$('[data-check]').forEach(input => { input.checked = false; });
    $('#meeting-notes').value = '';
    try { localStorage.removeItem(STORE_KEY); } catch (_) { /* Nothing persisted. */ }
    refreshMeetingCount();
    toast('Đã xóa dấu chọn và ghi chú trên trình duyệt này.');
  });
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  }
  $('#export-meeting').addEventListener('click', () => {
    const state = meetingData();
    const time = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
    const lines = [
      '# Hiên Biển | Ghi chú thảo luận',
      '', `Xuất lúc: ${time} (Asia/Ho_Chi_Minh)`,
      'Nội dung nền: bản tiền khả thi 05.09.2026.',
      '', '## Phạm vi',
      'Đây là ghi chú và dấu chọn do người dùng tự nhập. Không phải phê duyệt đầu tư, biên bản có chữ ký, xác nhận hồ sơ pháp lý hoặc kết quả thẩm định.',
      '', '## Checklist trong buổi thảo luận',
      ...content.checks.map(item => `- [${state.checks[item.key] ? 'x' : ' '}] ${item.title}: ${item.description}`),
      '', '## Ghi chú', state.notes || '(Chưa nhập ghi chú.)',
      '', '## Kịch bản đang chọn trên slide tài chính', JSON.stringify(scenarios[currentScenario], null, 2),
      '', '## Các giả định đang chọn trong bộ mô phỏng',
      `Đơn vị tiền: triệu đồng/tháng. ${Object.entries(getSimulatorInputs()).map(([key,value])=>`${key}=${value}`).join('; ')}`,
      `EBITDA giả định: ${number(calculateModel(getSimulatorInputs()).ebitda)} triệu/tháng.`,
      'Biến phí 10 lượt × 0,02 triệu/hội viên; bổ sung 45%; cố định khác 50 triệu. Chưa tính khấu hao, lãi vay, thuế và VAT.',
      '', '## Bước đi đề xuất',
      'Xác minh mặt bằng → thử nghiệm trả phí → duyệt đầu tư theo bằng chứng. Không triển khai bán trú khi chưa xác nhận đủ điều kiện.'
    ];
    downloadBlob(new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/markdown;charset=utf-8' }), 'Hien-Bien_Ghi-chu-thao-luan.md');
    toast('Đã xuất ghi chú thảo luận. Không có dữ liệu gửi lên máy chủ.');
  });
  loadMeeting();

  function downloadWorkbook() {
    const embedded = $('#embedded-workbook');
    const filename = 'Mo_hinh_CLB_nguoi_cao_tuoi_Da_Nang.xlsx';
    if (embedded) {
      try {
        const binary = atob(embedded.textContent.trim());
        const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
        downloadBlob(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
      } catch (_) { toast('Không trích xuất được bảng tính. Sử dụng file Excel gốc trong bộ bàn giao.'); }
    } else {
      const link = document.createElement('a');
      link.href = 'data/' + filename;
      link.download = filename;
      document.body.appendChild(link); link.click(); link.remove();
    }
  }
  $$('.download-workbook').forEach(button => button.addEventListener('click', downloadWorkbook));

  // Deliberately small public surface for deterministic financial and navigation checks.
  window.HienBienModel = Object.freeze({ calculateModel, calculateRampUp, scenarios: JSON.parse(JSON.stringify(scenarios)) });
  window.HienBienPresentation = Object.freeze({ goTo, getState: () => ({ current, mode, total }), applyMode });
  current = indexFromHash();
  applyMode(mode, true);
  updateChrome();
  setAddress(current, false);
  if (mode === 'read' && current > 0) requestAnimationFrame(() => goTo(current, { push: false, behavior: 'auto' }));
})();
