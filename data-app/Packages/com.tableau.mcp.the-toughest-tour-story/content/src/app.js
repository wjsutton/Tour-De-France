// The Toughest Tour: sticky SVG wheels driven by scroll steps. Data comes from TDF.getRows() (data.js),
// which hides whether we are in Tableau or on the blog. Data values only ever reach the DOM via
// textContent / setAttribute.
(function () {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';
  // tdf.R geometry: metric k spans (k-4.75)..(k-3.75) * 72deg, abandons (k=3) centred at 12 o'clock.
  var METRICS = ['winners_avg_speed', 'total_distance_in_km', 'percent_abandons', 'led_percent', 'highest_elevation_in_m'];
  var NAMES = { winners_avg_speed: 'Pace', total_distance_in_km: 'Distance', percent_abandons: 'Abandons',
    led_percent: 'Competition', highest_elevation_in_m: 'Elevation' };
  var TYRE = 6.198; // outer tyre radius in wheel units; wedge radius = Value/100*5.4 + 0.27
  var FULL = 5.67;  // radius of a 100 wedge
  var ERAS = [[0, 1939, 'Survive'], [1947, 1989, 'Race'], [1990, 9999, 'Speed']];
  // ponytail: 1919 never changes; 69 starters, 10 finishers (letour.fr). Riders 0-9 finish.
  var STARTERS = 69, FINISHERS = 10, HOOK = 1919;
  var DEP_ZONE = [0.035, 0.4, 0.44, 0.84]; // Départ graphics: left column, under the pinned headline
  var BAR_ZONE = [0.035, 0.38, 0.5, 0.95], WHEEL_ZONE = [0.035, 0.38, 0.47, 0.95], GRID_ZONE = [0.035, 0.36, 0.52, 0.97];
  var BARS = { percent_abandons: 'Riders who abandoned, % of starters', total_distance_in_km: 'Total distance, km',
    highest_elevation_in_m: 'Highest point of the race, m', led_percent: 'Share of stages the winner did not lead',
    winners_avg_speed: "Winner's average speed, km/h" };
  var METRICS_CW = ['percent_abandons', 'total_distance_in_km', 'highest_elevation_in_m', 'led_percent', 'winners_avg_speed'];
  var NOW = null, NOW_YEAR = 2019; // a century after 1919, as riders: { y, n starters, f finishers }, from the abandons tooltip

  var svg = document.getElementById('chart');
  var desc = document.getElementById('chart-desc');
  var stage = document.getElementById('stage');
  var tip = document.getElementById('tip');
  var born = document.getElementById('born');
  var barLayer = el('g', { 'class': 'bars', 'aria-hidden': 'true' });
  var wheelLayer = el('g', { 'class': 'wheels' });
  var motif = el('g', { 'class': 'motif off', 'aria-hidden': 'true' });
  var riderLayer = el('g', { 'class': 'riders', 'aria-hidden': 'true' });
  var notes = el('g', { 'class': 'notes', 'aria-hidden': 'true' });
  var frame = el('g', { 'class': 'frame' }); // shifted into a step's panel; every layout below works in its own W x H
  svg.appendChild(frame);
  [barLayer, wheelLayer, riderLayer, notes, motif].forEach(function (l) { frame.appendChild(l); });

  var rows = [], byYear = {}, years = [], keys = [], wheels = {}, states = {}, current = 'd-start', W = 0, H = 0, roving = 0;
  var lastRace = null, score = {}, ranked = [], eraInfo = {}, riders = [], bars = {}, youYear = 1990, sortBy = 'year', lead = '';

  function el(name, attrs, text) {
    var n = document.createElementNS(SVGNS, name);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text != null) { n.textContent = text; }
    return n;
  }
  function html(name, cls, text) {
    var n = document.createElement(name);
    if (cls) { n.className = cls; }
    if (text != null) { n.textContent = text; }
    return n;
  }
  function angle(k, f) { return ((k + 1 - 4.75 + f) * 2 * Math.PI) / 5; } // k is 0-based here
  function cw(k) { return (k + 3) % 5; } // clockwise position from 12 o'clock: abandons 0 ... distance 4
  function sector(k) {
    var a0 = angle(k, 0), a1 = angle(k, 1);
    return 'M0,0L' + Math.cos(a0).toFixed(4) + ',' + Math.sin(a0).toFixed(4) +
      'A1,1 0 0 1 ' + Math.cos(a1).toFixed(4) + ',' + Math.sin(a1).toFixed(4) + 'Z';
  }
  function mean(a) { return a.reduce(function (s, v) { return s + v; }, 0) / a.length; }
  function listJoin(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function has(list, k) { return !!list && list.some(function (f) { return String(f) === String(k); }); }

  // Short direct label for one factor of one Tour, from the data (numbers live on the chart, not only in tooltips).
  function short(y, m) {
    var d = byYear[y] && byYear[y][m], x;
    if (!d) { return ''; }
    if (m === 'percent_abandons') { return Math.round(d.raw_value * 100) + '% quit'; }
    if (m === 'led_percent') {
      x = /for (\d+) stages? out of (\d+)/.exec(d.tooltip);
      if (x) { return 'Led ' + x[1] + ' of ' + x[2] + ' stages'; }
      return d.raw_value === 0 ? 'Led no stage' : 'Led ' + Math.round(d.raw_value * 100) + '% of stages';
    }
    if (m === 'highest_elevation_in_m') { return Math.round(d.raw_value).toLocaleString('en-GB') + ' m'; }
    if (m === 'winners_avg_speed') { return (d.raw_value + 1e-9).toFixed(1) + ' km/h'; } // 41.65 -> 41.7, not float 41.6
    return Math.round(d.raw_value).toLocaleString('en-GB') + ' km';
  }

  // ---- data -> wheels ------------------------------------------------------------------------
  function makeWheel(key, value, label, interactive) {
    var g = el('g', { 'class': 'wheel', role: 'img', tabindex: '-1', 'aria-label': label });
    g.appendChild(el('circle', { r: 5.661, 'class': 'hub' }));
    METRICS.forEach(function (m, k) {
      if (value(m) == null) { return; }
      var p = el('path', { d: sector(k), 'class': 'wedge m-' + m, 'data-cw': cw(k) });
      p.style.transform = 'scale(' + (value(m) / 100 * 5.4 + 0.27) + ')';
      g.appendChild(p);
    });
    g.appendChild(el('circle', { r: 6.022, 'class': 'tyre' }));
    g.appendChild(el('circle', { r: 5.772, 'class': 'rim' }));
    g.appendChild(el('circle', { r: 6.4, 'class': 'hit' }));
    if (interactive) {
      g.addEventListener('pointerenter', function () { showTip(key, g); });
      g.addEventListener('pointerleave', hideTip);
      g.addEventListener('focus', function () { showTip(key, g); });
      g.addEventListener('blur', hideTip);
    }
    g.classList.add('off');
    wheelLayer.appendChild(g);
    wheels[key] = g;
    keys.push(key);
  }

  function build(data) {
    rows = data;
    rows.forEach(function (r) {
      if (!byYear[r.year]) { byYear[r.year] = {}; years.push(r.year); }
      byYear[r.year][r.Metric] = r;
    });
    years.forEach(function (y) {
      var label = [String(y)].concat(METRICS.filter(function (m) { return byYear[y][m]; }).map(function (m) { return byYear[y][m].tooltip; }));
      makeWheel(y, function (m) { return byYear[y][m] ? byYear[y][m].Value : null; }, label.join(' '), true);
      score[y] = mean(METRICS.map(function (m) { return byYear[y][m] ? byYear[y][m].Value : 0; }));
    });
    ranked = years.slice().sort(function (a, b) { return score[b] - score[a] || a - b; });
    ERAS.forEach(function (e, i) {
      var ys = years.filter(function (y) { return y >= e[0] && y <= e[1]; }), v = {};
      METRICS.forEach(function (m) { v[m] = mean(ys.map(function (y) { return byYear[y][m] ? byYear[y][m].Value : 0; })); });
      var key = 'era' + i, info = { name: e[2], span: ys[0] + '–' + ys[ys.length - 1], v: v, score: mean(METRICS.map(function (m) { return v[m]; })) };
      eraInfo[key] = info;
      makeWheel(key, function (m) { return v[m]; }, info.name + ' era, ' + info.span + ', average toughness ' + Math.round(info.score), false);
    });
    var L = byYear[NOW_YEAR] ? NOW_YEAR : years[years.length - 1], ab = byYear[L].percent_abandons;
    var fin = ab && +((/leaving (\d+) riders/.exec(ab.tooltip) || [])[1]);
    if (fin && ab.raw_value < 1) { NOW = { y: L, f: fin, n: Math.round(fin / (1 - ab.raw_value)) }; }
    for (var i = 0; i < STARTERS + (NOW ? NOW.n : 0); i++) { // 1919 field first, then the comparison year's
      var c = el('circle', { 'class': 'rider off', r: 5 });
      riderLayer.appendChild(c);
      riders.push(c);
    }
    years.forEach(function (y) { bars[y] = el('rect', { 'class': 'bar off' }); barLayer.appendChild(bars[y]); });
    METRICS.forEach(function (m, k) { motif.appendChild(el('path', { d: sector(k), 'class': 'm-' + m, 'data-m': m })); });
    motif.appendChild(el('circle', { r: 1.1, 'class': 'tyre-o' }));
  }

  function facts() {
    var latest = years[years.length - 1], r = function (y) { return String(Math.round(score[y])); };
    roving = years[0];
    var maxElev = Math.max.apply(null, years.map(function (y) { return byYear[y].highest_elevation_in_m.raw_value; }));
    var bonette = years.filter(function (y) { return byYear[y].highest_elevation_in_m.raw_value === maxElev; });
    var fastest = years.slice().sort(function (a, b) {
      return byYear[b].winners_avg_speed.raw_value - byYear[a].winners_avg_speed.raw_value; })[0];
    var range = function (a, b) { return years.filter(function (y) { return y >= a && y <= b; }); };
    var pct = function (ys) { return String(Math.round(mean(ys.map(function (y) { return byYear[y].percent_abandons.raw_value; })) * 100)); };
    var last = ranked[ranked.length - 1], e = function (i, m) { return String(Math.round(eraInfo['era' + i].v[m])); };
    var f = {
      latestYear: String(latest),
      tours: String(years.length),
      bonetteRepeats: listJoin(bonette.slice(1).map(String)),
      fastest: fastest + ' averaged ' + byYear[fastest].winners_avg_speed.raw_value.toFixed(1) + ' kph, the fastest Tour ever',
      top1: String(ranked[0]), top1Score: r(ranked[0]),
      runnersUp: ranked[1] + ' (' + r(ranked[1]) + ') and ' + ranked[2] + ' (' + r(ranked[2]) + ')',
      last: String(last), lastScore: r(last),
      eraScores: [0, 1, 2].map(function (i) { return String(Math.round(eraInfo['era' + i].score)); }).join(', '),
      abThen: e(0, 'percent_abandons'), abNow: e(2, 'percent_abandons'), paceNow: e(2, 'winners_avg_speed'),
      abEarly: pct(range(0, 1914)), abRecent: pct(range(2000, latest))
    };
    if (NOW) { f.nowYear = String(NOW.y); f.nowStarters = String(NOW.n); f.nowFinishers = String(NOW.f); f.nowQuit = String(NOW.n - NOW.f); f.nowShare = String(Math.round(NOW.f / NOW.n * 100)); }
    Array.prototype.forEach.call(document.querySelectorAll('[data-fact]'), function (n) {
      if (f[n.dataset.fact]) { n.textContent = f[n.dataset.fact]; }
    });
    born.max = String(latest);
    born.min = String(years[0]);
    var seen = function (n) { return { seen: METRICS_CW.slice(0, n), hi: METRICS_CW[n - 1] }; };
    states = {
      // zone: where the graphics sit over the full-frame photo (viewport fractions x0,y0,x1,y1; desktop),
      // picked to stay clear of each photo's subject
      // zone: the graphics sit in the left column under the pinned text (viewport fractions x0,y0,x1,y1; desktop)
      'd-start': { riders: 'start', ov: true, zone: DEP_ZONE },
      'd-win': { riders: 'start', follow: true, ov: true, zone: DEP_ZONE },
      'd-out': { riders: 'out', follow: true, ov: true, zone: DEP_ZONE },
      'd-now': { riders: NOW ? 'now' : 'out', follow: true, ov: true, zone: DEP_ZONE },
      'd-both': { riders: NOW ? 'both' : 'out', follow: true, ov: true, zone: [0.035, 0.38, 0.56, 0.8] },
      ab: { bars: 'percent_abandons', focus: [HOOK, NOW ? NOW.y : latest], label: [HOOK, NOW ? NOW.y : latest], motif: seen(1), ov: true, zone: BAR_ZONE },
      'ab-more': { motif: { seen: ['percent_abandons'], hi: 'percent_abandons', big: true }, ov: true, zone: WHEEL_ZONE },
      distance: { bars: 'total_distance_in_km', focus: [1926, latest], label: [1926, latest], motif: seen(2), ov: true, zone: BAR_ZONE },
      elevation: { bars: 'highest_elevation_in_m', focus: bonette, label: [bonette[0]], motif: seen(3), ov: true, zone: BAR_ZONE },
      competition: { bars: 'led_percent', focus: [1947, 1968], label: [1947, 1968], motif: seen(4), ov: true, zone: BAR_ZONE },
      merckx: { bars: 'led_percent', focus: range(1969, 1975), label: [1970, 1975], motif: seen(4), ov: true, zone: BAR_ZONE },
      pace: { bars: 'winners_avg_speed', focus: [years[0], 2005, fastest], label: [years[0], 2005, fastest], motif: seen(5), ov: true, zone: BAR_ZONE },
      wheel: { items: [HOOK], labels: true, ov: true, zone: WHEEL_ZONE },
      compare: { items: [HOOK, latest], ov: true, zone: WHEEL_ZONE },
      rank: { rank: true, focus: ranked.slice(0, 3), ov: true, zone: GRID_ZONE },
      'rank-last': { rank: true, focus: [ranked[0], last], ov: true, zone: GRID_ZONE },
      eras: { items: ['era0', 'era1', 'era2'], row: true, ov: true, zone: GRID_ZONE },
      you: { you: true, ov: true, zone: WHEEL_ZONE },
      explore: { grid: true, interactive: true }
    };
    youText();
  }

  // ---- layouts (pixel coordinates; the SVG viewBox tracks the chart size) ---------------------
  function placeRow(s) {
    var items = s.items.filter(function (it) { return typeof it === 'object' || wheels[it]; });
    var n = items.length, wide = W / H > 1.15 || s.row;
    var cols = wide ? n : Math.min(n, n > 4 ? 3 : 2), rows = Math.ceil(n / cols);
    var pad = s.labels ? 0.62 : 1, cell = Math.min(W / cols, (H * (s.row ? 0.62 : 0.9)) / rows) * pad;
    if (n === 1) { cell = Math.min(W, H) * (s.labels ? 0.56 : 0.8); }
    var scale = (cell * 0.4) / TYRE, out = [];
    items.forEach(function (it, i) {
      var c = i % cols, r = Math.floor(i / cols), rowN = Math.min(cols, n - r * cols);
      var x = W / 2 + (c - (rowN - 1) / 2) * (n === 1 ? 0 : Math.min(W / cols, cell * 1.15));
      var y = H / 2 + (r - (rows - 1) / 2) * cell;
      out.push({ item: it, x: x, y: y, s: scale });
    });
    return out;
  }
  function placeGrid() {
    var portrait = W / H < 1, decades = 13;
    var cols = portrait ? 10 : decades, rows = portrait ? decades : 10;
    var cell = Math.min(W / (cols + (portrait ? 1.6 : 0.4)), H / (rows + (portrait ? 0.4 : 1.2)));
    var x0 = (W - cell * cols) / 2 + (portrait ? cell * 0.5 : 0), y0 = (H - cell * rows) / 2 + (portrait ? 0 : cell * 0.5);
    return {
      cell: cell, portrait: portrait,
      at: function (y) {
        var d = Math.floor(y / 10) - 190, u = y % 10;
        var c = portrait ? u : d, r = portrait ? d : u;
        return { x: x0 + (c + 0.5) * cell, y: y0 + (r + 0.5) * cell };
      }
    };
  }
  function placeRank() { // same marks, read left to right from toughest to easiest
    var portrait = W / H < 1, cols = portrait ? 10 : 15, rows = Math.ceil(ranked.length / cols);
    var cell = Math.min(W / (cols + 0.4), H / (rows + 1.4));
    var x0 = (W - cell * cols) / 2, y0 = (H - cell * rows) / 2;
    return { cell: cell, portrait: portrait, at: function (i) { return { x: x0 + (i % cols + 0.5) * cell, y: y0 + (Math.floor(i / cols) + 0.5) * cell }; } };
  }
  // Riders: indices 0-68 are the 1919 field, the rest the comparison year's. 'start' and 'out' are 1919,
  // 'now' the comparison year, 'both' the two fields side by side. Out/now race left to right: quitters
  // drop off along the road (order illustrative, counts exact) and the finishers reach Paris last.
  // b is the box to lay out in (chart pixels): the whole chart, or a zone over the photo.
  function placeRiders(mode, b) {
    var A = { off: 0, n: STARTERS, f: FINISHERS, y: HOOK }, B = NOW ? { off: STARTERS, n: NOW.n, f: NOW.f, y: NOW.y } : A;
    var pos = riders.map(function () { return null; }), out = pos.slice(), delay = pos.map(function () { return 0; });
    if (mode === 'both') {
      var wide = b.w >= 560, cols = 16, pw = wide ? b.w * 0.44 : b.w * 0.86, ph = wide ? b.h - 80 : b.h * 0.3;
      var g = Math.min(pw / cols, ph / Math.ceil(B.n / cols)), labels = [];
      [A, B].forEach(function (F, k) {
        var cx = b.x + (wide ? b.w * (k ? 0.75 : 0.25) : b.w / 2), x0 = cx - (cols - 1) * g / 2;
        var top = b.y + (wide ? 34 : b.h * (k ? 0.56 : 0.14));
        var frow = Math.ceil(F.f / cols); // abandons start on a fresh row, after a gap
        for (var i = 0; i < F.n; i++) {
          var fin = i < F.f, rr = fin ? Math.floor(i / cols) : frow + Math.floor((i - F.f) / cols);
          pos[F.off + i] = { x: x0 + ((fin ? i : i - F.f) % cols) * g, y: top + rr * g + (fin ? 0 : g * 0.8), r: g / 2.7 };
          out[F.off + i] = !fin;
        }
        labels.push({ F: F, x: cx, top: top, bottom: top + (frow + Math.ceil((F.n - F.f) / cols) - 1) * g + g * 1.3 });
      });
      return { pos: pos, out: out, delay: delay, both: labels, box: b };
    }
    var F = mode === 'now' ? B : A, n = F.n, f = F.f, q = n - f;
    var r = Math.max(2.2, Math.min(7, b.w / (n > 100 ? 95 : 40), b.h / (n > 100 ? 55 : 30))), gap = r * 2.7, roadY = b.y + b.h * 0.6;
    var x1 = b.x + b.w * 0.94, x0 = b.x + b.w * 0.04, fcols = Math.max(1, Math.floor((x1 - gap - x0) / gap));
    var qper = Math.max(1, Math.floor((x1 - x0) * 0.62 / gap)), qrows = Math.ceil(q / qper);
    var scols = Math.max(4, Math.min(n > 100 ? 26 : 14, Math.floor((x1 - x0) / gap) - 1)), start = pos.slice();
    for (var i = 0; i < n; i++) {
      var k = F.off + i, slot = (i * 37) % n; // shuffled so the finishers start spread through the peloton
      start[k] = { x: x0 + gap + (slot % scols) * gap, y: roadY - r - 3 - Math.floor(slot / scols) * gap, r: r };
      if (mode === 'start') { pos[k] = start[k]; continue; }
      if (i < f) { // finishers queue back from the Paris line, arriving last
        pos[k] = { x: x1 - gap - (i % fcols) * gap, y: roadY - r - 3 - Math.floor(i / fcols) * gap, r: r };
        delay[k] = 1;
      } else { // abandons fall out of the race into their own block, below the road on the start side
        var j = i - f, col = j % qper, row = Math.floor(j / qper);
        pos[k] = { x: x0 + r + col * gap, y: roadY + gap * 1.9 + row * gap, r: r };
        out[k] = true;
        delay[k] = 0.9 * col / qper;
      }
    }
    return { pos: pos, out: out, delay: delay, start: start, roadY: roadY, r: r, gap: gap, n: n, f: f, x0: x0, x1: x1, box: b,
      frows: Math.ceil(f / fcols), qrows: qrows, year: F.y };
  }
  // A zone in viewport fractions -> chart pixels (the chart may draw outside its own column).
  function zoneBox(z) { // measured against where the chart sits once its stage is pinned (top 0), not mid-scroll
    var rc = svg.getBoundingClientRect(), top = rc.top - stage.getBoundingClientRect().top;
    return { x: z[0] * innerWidth - rc.left, y: z[1] * innerHeight - top, w: (z[2] - z[0]) * innerWidth, h: (z[3] - z[1]) * innerHeight };
  }

  // Bars: one per Tour on a year axis (war gaps stay empty). Height is the scaled Value, so the record reaches the top.
  function renderBars(s) {
    var m = s.bars, y0 = years[0], y1 = years[years.length - 1], left = 8, right = W - 8, top = 118, bottom = H - 34;
    var slot = (right - left) / (y1 - y0 + 1), bw = Math.max(1.5, slot * 0.72), ph = bottom - top;
    var xOf = function (y) { return left + (y - y0) * slot + (slot - bw) / 2; };
    years.forEach(function (y) {
      var b = bars[y], d = byYear[y][m];
      b.setAttribute('x', xOf(y).toFixed(1)); b.setAttribute('y', top); b.setAttribute('width', bw.toFixed(1)); b.setAttribute('height', ph.toFixed(1));
      b.setAttribute('class', 'bar m-' + m + (s.focus && !has(s.focus, y) ? ' dim' : ''));
      b.style.transform = 'scaleY(' + (d ? Math.max(0.002, d.Value / 100) : 0.002).toFixed(4) + ')';
    });
    notes.appendChild(el('line', { 'class': 'road', x1: left, x2: right, y1: bottom, y2: bottom }));
    for (var t = 1910; t <= y1; t += W < 600 ? 40 : 20) { note(xOf(t) + bw / 2, bottom + 18, String(t), 'axis'); }
    [[1916, 'WW1'], [1943, 'WW2']].forEach(function (w) { note(xOf(w[0]) + bw / 2, bottom - 8, w[1], 'gap-label'); });
    note(left + 54, 36, BARS[m], 'bartitle', 'start');
    note(left + 54, 54, 'Tallest bar = the record', 'gap-label', 'start');
    (s.label || []).forEach(function (y) {
      if (!byYear[y] || !byYear[y][m]) { return; }
      var x = xOf(y) + bw / 2, h = byYear[y][m].Value / 100 * ph, anchor = x > W * 0.8 ? 'end' : x < W * 0.2 ? 'start' : 'middle';
      note(x, bottom - h - 24, String(y), 'year', anchor);
      note(x, bottom - h - 8, short(y, m), 'value', anchor);
    });
    return 'Bar chart: ' + BARS[m].toLowerCase() + ', one bar per Tour from ' + y0 + ' to ' + y1 + '. ' +
      (s.label || []).map(function (y) { return y + ': ' + short(y, m); }).join('; ') + '.';
  }
  function hideBars() { years.forEach(function (y) { bars[y].setAttribute('class', 'bar off'); bars[y].style.transform = 'scaleY(0.002)'; }); }

  // The wheel motif: five equal wedges, filled in as each measure is introduced.
  function renderMotif(s) {
    var mo = s.motif;
    motif.classList.toggle('off', !mo);
    if (!mo) { return ''; }
    var R = mo.big ? Math.min(W, H) * 0.3 : 20, x = mo.big ? W / 2 : 30, y = mo.big ? H / 2 : 40;
    motif.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + R.toFixed(2) + ')';
    Array.prototype.forEach.call(motif.querySelectorAll('path'), function (p) {
      p.classList.toggle('seen', has(mo.seen, p.dataset.m));
      p.classList.toggle('hi', p.dataset.m === mo.hi);
    });
    if (!mo.big) { return ''; }
    METRICS.forEach(function (m, k) {
      var a = angle(k, 0.5), r = R * 1.1 + 18, cx = Math.cos(a), cy = Math.sin(a);
      note(x + cx * r, y + cy * r + (cy > 0.3 ? 14 : cy < -0.3 ? -4 : 5), NAMES[m], has(mo.seen, m) ? 'factor' : 'factor dim',
        cx > 0.3 ? 'start' : cx < -0.3 ? 'end' : 'middle');
    });
    return 'A wheel of five wedges: abandons, competition, elevation, pace and distance. Only abandons is filled in so far.';
  }

  function note(x, y, text, cls, anchor) {
    notes.appendChild(el('text', { x: x.toFixed(1), y: y.toFixed(1), 'class': cls, 'text-anchor': anchor || 'middle' }, text));
  }
  function winnerName(y) { var t = byYear[y] && byYear[y].winners_avg_speed; return ((t && /^(.+?) (?:\(.*\) )?won/.exec(t.tooltip)) || [])[1] || ''; }

  // A step with a zone draws in a box over its photo (desktop): lay out at the box's size, then move the frame there.
  function render(name) {
    var s = states[name];
    if (!s || !W) { return; }
    var z = s.zone && innerWidth > 832 ? zoneBox(s.zone) : null, W0 = W, H0 = H;
    frame.style.transform = z ? 'translate(' + z.x.toFixed(1) + 'px,' + z.y.toFixed(1) + 'px)' : '';
    if (z) { W = z.w; H = z.h; }
    try { draw(name, s); } finally { W = W0; H = H0; }
  }
  function draw(name, s) {
    current = name;
    if (s.you) { s = { items: [youYear], labels: true, ov: s.ov, zone: s.zone }; }
    notes.textContent = '';
    hideTip();
    svg.dataset.hi = s.hi || '';
    var shown = {}, summary, labelled = null;

    if (s.grid || s.rank) {
      var byRank = s.rank || sortBy === 'rank', g = byRank ? placeRank() : placeGrid(), sc = (g.cell * 0.44) / TYRE;
      if (byRank) {
        ranked.forEach(function (y, i) {
          var p = g.at(i), lastI = ranked.length - 1;
          shown[y] = { x: p.x, y: p.y, s: sc };
          if (i < 3 || i === lastI) {
            var full = !g.portrait || i === 0 || i === lastI;
            note(p.x, p.y + g.cell * 0.5 + 8, '#' + (i + 1) + (full ? ' ' + y : ''), i === 0 || i === lastI ? 'rankno strong' : 'rankno');
          }
        });
        summary = 'All ' + years.length + ' Tours ordered from toughest, ' + ranked[0] + ', to easiest, ' + ranked[ranked.length - 1] + '.';
      } else {
        years.forEach(function (y) { var p = g.at(y); shown[y] = { x: p.x, y: p.y, s: sc }; });
        for (var d = 1900; d <= 2020; d += 10) {
          var h = g.at(d);
          if (g.portrait) { note(h.x - g.cell * 0.62, h.y + 4, String(d) + 's', 'axis', 'end'); }
          else { note(h.x, h.y - g.cell * 0.66, String(d) + 's', 'axis'); }
        }
        [[1915, 'WW1'], [1940, 'WW2']].forEach(function (w) { var p = g.at(w[0]); note(p.x, p.y + 4, w[1], 'gap-label'); });
        summary = 'All ' + years.length + ' Tours as wheels in a grid by decade' +
          (s.hi ? ', highlighting ' + NAMES[s.hi].toLowerCase() : '') + '.';
      }
    } else if (s.items) {
      placeRow(s).forEach(function (p) {
        if (typeof p.item === 'object') {
          notes.appendChild(el('circle', { cx: p.x, cy: p.y, r: TYRE * p.s, 'class': 'ghost' }));
          note(p.x, p.y - 2, p.item.gap, 'gap-year');
          note(p.x, p.y + 16, p.item.note, 'gap-label');
          return;
        }
        shown[p.item] = p;
        var R = TYRE * p.s, era = eraInfo[p.item];
        if (era) {
          note(p.x, p.y - R - 34, era.span, 'gap-label');
          note(p.x, p.y - R - 12, era.name, 'eraname');
          note(p.x, p.y + R + 26, 'Score ' + Math.round(era.score), 'year');
          note(p.x, p.y + R + 46, 'Abandons ' + Math.round(era.v.percent_abandons) + ' · Pace ' + Math.round(era.v.winners_avg_speed), 'gap-label');
          return;
        }
        var lit = !s.focus || has(s.focus, p.item);
        note(p.x, p.y + R + 24 + (s.labels ? 22 : 0), String(p.item), lit ? 'year' : 'year dim');
      });
      if (s.labels || s.build) { labelled = shown[s.items[0]]; }
      if (labelled) {
        METRICS.forEach(function (m, k) {
          var built = s.build == null || cw(k) < s.build;
          if (!built) {
            notes.appendChild(el('path', { d: sector(k), 'class': 'ghost', transform: 'translate(' + labelled.x.toFixed(1) + ',' + labelled.y.toFixed(1) + ') scale(' + (FULL * labelled.s).toFixed(2) + ')' }));
            return;
          }
          if (!s.labels) { return; }
          var a = angle(k, 0.5), r = TYRE * labelled.s + 18, cx = Math.cos(a), cy = Math.sin(a);
          var anchor = cx > 0.3 ? 'start' : cx < -0.3 ? 'end' : 'middle';
          var x = labelled.x + cx * r, y = labelled.y + cy * r + (cy > 0.3 ? 14 : cy < -0.3 ? -4 : 5);
          note(x, y, NAMES[m], 'factor', anchor);
          note(x, cy > 0.3 ? y + 17 : y - 19, short(s.items[0], m), 'value', anchor);
        });
      }
      summary = (s.items[0] && eraInfo[s.items[0]] ? 'Average wheels for three eras.' : 'Wheels for ' + listJoin(Object.keys(shown)) + '.') +
        (s.build ? ' ' + s.build + ' of 5 wedges drawn.' : '') + (s.hi ? ' Highlighting ' + NAMES[s.hi].toLowerCase() + '.' : '');
    }

    if (s.bars) { summary = renderBars(s); } else { hideBars(); }
    summary = renderMotif(s) || summary;

    // riders: one dot per starter. Entering a race state replays the race from the start line.
    var box = s.ov && !(s.zone && innerWidth > 832) ? { x: 0, y: H * 0.1, w: W, h: H * 0.85 } : { x: 0, y: 0, w: W, h: H };
    var rp = s.riders ? placeRiders(s.riders, box) : null, tr = function (p) { return 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px)'; };
    if (rp && rp.start && s.riders !== lastRace) {
      riders.forEach(function (c, i) {
        var p0 = rp.start[i];
        if (!p0) { return; }
        c.style.transition = 'none';
        c.classList.remove('off', 'out');
        c.setAttribute('r', p0.r.toFixed(1));
        c.style.transform = tr(p0);
      });
      riderLayer.getBoundingClientRect(); // commit the start line before racing off it
      riders.forEach(function (c) { c.style.transition = ''; });
    }
    lastRace = s.riders || null;
    // the winner of each field is its rider 0, drawn yellow (the leader's jersey) once the story names him
    var showWinner = !!rp && !!s.follow, wins = [0, STARTERS];
    riders.forEach(function (c, i) {
      var p = rp && rp.pos[i], w = showWinner && !!p && wins.indexOf(i) >= 0;
      c.classList.toggle('off', !p);
      c.classList.toggle('out', !!(p && rp.out[i]));
      c.classList.toggle('winner', w);
      c.style.transitionDelay = p && rp.delay[i] ? rp.delay[i] + 's' : '';
      if (p) {
        c.setAttribute('r', (p.r * (w ? 1.4 : 1)).toFixed(1));
        c.style.transform = tr(p);
      }
    });
    if (rp && rp.both) {
      rp.both.forEach(function (b) {
        note(b.x, b.top - 22, String(b.F.y), 'yearlabel');
        note(b.x, b.bottom + 22, b.F.f + ' finished · ' + (b.F.n - b.F.f) + ' abandoned', 'value');
      });
      summary = rp.both.map(function (b) { return 'in ' + b.F.y + ', ' + b.F.f + ' of ' + b.F.n + ' starters finished (' + Math.round(b.F.f / b.F.n * 100) + '%)'; }).join('; ') + '.';
      summary = summary.charAt(0).toUpperCase() + summary.slice(1);
    } else if (rp) {
      var bx = rp.box;
      if (!s.zone || innerWidth <= 832) { note(bx.x + 4, bx.y + 22, String(rp.year), 'yearlabel', 'start'); } // desktop: the year heads the text
      notes.appendChild(el('line', { 'class': 'road', x1: bx.x, x2: bx.x + bx.w, y1: rp.roadY, y2: rp.roadY }));
      if (s.riders !== 'start') {
        var fin = rp.r * 2 + (rp.frows - 1) * rp.gap + 14, fx = rp.x1, fh = Math.max(rp.gap * (rp.frows + 4), fin + 36), quit = rp.n - rp.f;
        notes.appendChild(el('line', { 'class': 'road', x1: fx, x2: fx, y1: rp.roadY - fh, y2: rp.roadY }));
        note(fx, rp.roadY - fh - 8, 'Paris', 'factor', 'end');
        if (s.follow) { note(fx - 6, rp.roadY - fh + 14, winnerName(rp.year) + ' wins', 'winlabel', 'end'); }
        note(fx - rp.gap * 1.5, rp.roadY - fin, rp.f + ' finished', 'grouplabel', 'end');
        note(rp.x0, rp.roadY + rp.gap * 1.9 + rp.qrows * rp.gap + 10, quit + ' abandoned · ' + Math.round(quit / rp.n * 100) + '%', 'grouplabel quitlabel', 'start');
        summary = quit + ' of the ' + rp.n + ' riders who started in ' + rp.year + ' abandoned; ' + rp.f + ' finished in Paris.';
      } else {
        note(rp.x0, rp.roadY + 24, rp.n + ' starters', 'gap-label', 'start');
        summary = rp.n + ' dots, one for each rider who started the ' + rp.year + ' Tour.' +
          (s.follow ? ' The yellow dot is ' + winnerName(rp.year) + ', who will win.' : '');
      }
    }
    desc.textContent = (lead ? lead + ' ' : '') + summary;

    keys.forEach(function (y) {
      var w = wheels[y], p = shown[y];
      if (p && w.classList.contains('off')) { // appear in place, don't fly in from the old spot
        w.style.transition = 'none';
        w.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px) scale(' + p.s.toFixed(3) + ')';
        w.getBoundingClientRect();
        w.style.transition = '';
      }
      w.classList.toggle('off', !p);
      w.classList.toggle('muted', !!(p && s.focus && !has(s.focus, y)));
      w.setAttribute('tabindex', p && s.interactive && y === roving ? '0' : '-1');
      if (p) {
        w.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px) scale(' + p.s.toFixed(3) + ')';
        Array.prototype.forEach.call(w.querySelectorAll('.wedge'), function (n) { n.classList.toggle('pending', s.build != null && +n.dataset.cw >= s.build); });
      }
    });
  }

  // ---- find your Tour -------------------------------------------------------------------------
  function youText() {
    var out = document.getElementById('you-out'), latest = years[years.length - 1], want = parseInt(born.value, 10);
    if (!(want >= years[0] && want <= latest)) { out.textContent = 'Pick a year from ' + years[0] + ' to ' + latest + '.'; return; }
    var y = byYear[want] ? want : years.filter(function (z) { return z > want; })[0];
    var pre = y !== want ? 'No Tour in ' + want + ': the race stopped for the war. The next one was ' + y + '. ' : '';
    var winner = (/^(.+?) won/.exec(byYear[y].winners_avg_speed ? byYear[y].winners_avg_speed.tooltip : '') || [])[1];
    var big = METRICS.filter(function (m) { return byYear[y][m]; }).sort(function (a, b) { return byYear[y][b].Value - byYear[y][a].Value; })[0];
    var b = short(y, big);
    youYear = y;
    out.textContent = pre + (winner ? winner + ' won in ' + y + '. ' : '') + 'It ranks #' + (ranked.indexOf(y) + 1) + ' of ' + years.length +
      ' for toughness, scoring ' + Math.round(score[y]) + '. Its biggest wedge is ' + NAMES[big].toLowerCase() + ' (' + b.charAt(0).toLowerCase() + b.slice(1) + ').';
    if (current === 'you') { render('you'); }
  }
  born.addEventListener('input', function () { if (born.value.length === 4) { youText(); } });
  born.addEventListener('change', youText);

  // ---- tooltip --------------------------------------------------------------------------------
  function showTip(y, g) {
    if (g.classList.contains('off')) { return; }
    tip.textContent = '';
    tip.appendChild(html('strong', '', String(y) + '  ·  #' + (ranked.indexOf(y) + 1)));
    METRICS.forEach(function (m) {
      var d = byYear[y][m];
      if (!d) { return; }
      var line = html('p', 'tip-line');
      line.appendChild(html('span', 'sw sw-' + m));
      line.appendChild(document.createTextNode(d.tooltip));
      tip.appendChild(line);
    });
    tip.hidden = false;
    var b = g.getBoundingClientRect(), sb = stage.getBoundingClientRect();
    var left = b.right - sb.left + 8, top = b.top - sb.top;
    if (left + tip.offsetWidth > sb.width) { left = b.left - sb.left - tip.offsetWidth - 8; }
    tip.style.left = Math.max(4, left) + 'px';
    tip.style.top = Math.max(4, Math.min(top, sb.height - tip.offsetHeight - 4)) + 'px';
  }
  function hideTip() { tip.hidden = true; }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { hideTip(); } });

  // Explorer keyboard: one tab stop (roving tabindex); arrows step a year / a decade.
  var STEP_KEYS = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 10, ArrowUp: -10 };
  wheelLayer.addEventListener('keydown', function (e) {
    var by = STEP_KEYS[e.key], from = roving;
    if (!by || !states[current].interactive) { return; }
    e.preventDefault();
    var want = from + by, next = years.reduce(function (best, y) {
      return Math.abs(y - want) < Math.abs(best - want) ? y : best; }, from);
    if (next === from) { next = years[Math.min(years.length - 1, Math.max(0, years.indexOf(from) + Math.sign(by)))]; }
    wheels[from].setAttribute('tabindex', '-1');
    roving = next;
    wheels[next].setAttribute('tabindex', '0');
    wheels[next].focus();
  });

  // Explorer order: same wheels, re-sorted (they slide, so you can follow one).
  Array.prototype.forEach.call(document.querySelectorAll('[data-sort]'), function (b) {
    b.addEventListener('click', function () {
      sortBy = b.dataset.sort;
      Array.prototype.forEach.call(document.querySelectorAll('[data-sort]'), function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      if (current === 'explore') { render('explore'); }
    });
  });

  // ---- title: each line scaled to the h1's width, so THE / TOUGHEST / TOUR stack as a square ----
  // TOUGHEST and TOUR are scaled to the block's width; THE sits small above them.
  function fitTitle() {
    var h = document.querySelector('.masthead h1');
    if (!h) { return; }
    var t = h.clientWidth, ln = h.querySelectorAll('.ln'), fit = function (s) {
      s.style.fontSize = '100px';
      return 100 * t / s.getBoundingClientRect().width;
    };
    var big = fit(ln[1]);
    ln[1].style.fontSize = big.toFixed(2) + 'px';
    ln[2].style.fontSize = fit(ln[2]).toFixed(2) + 'px';
    ln[0].style.fontSize = (big * 0.55).toFixed(2) + 'px';
  }
  fitTitle();
  if (document.fonts) { document.fonts.ready.then(fitTitle); }
  addEventListener('resize', fitTitle);

  // ---- motion toggle (on top of prefers-reduced-motion, which always wins in CSS) -------------
  var motionBtn = document.getElementById('motion');
  function setMotion(on, save) {
    document.documentElement.classList.toggle('still', !on);
    motionBtn.setAttribute('aria-pressed', String(on));
    if (save) { try { localStorage.setItem('tt-motion', on ? 'on' : 'off'); } catch (e) { /* storage blocked */ } }
    var a = document.querySelector('.step.active');
    if (a && typeof photo === 'function') { photo(a); } // play or pause the backdrop clip
    var hv = document.getElementById('hero-video');
    if (hv) { if (on) { hv.play().catch(function () {}); } else { hv.pause(); } }
  }
  (function () {
    var saved = null;
    try { saved = localStorage.getItem('tt-motion'); } catch (e) { /* storage blocked */ }
    setMotion(saved ? saved === 'on' : !matchMedia('(prefers-reduced-motion: reduce)').matches, false);
  })();
  motionBtn.addEventListener('click', function () { setMotion(motionBtn.getAttribute('aria-pressed') !== 'true', true); });

  // ---- scroll ---------------------------------------------------------------------------------
  var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
  // ponytail: wrap each step's content in a card so it can sit on paper over a full-screen photo
  steps.forEach(function (n) { var c = html('div', 'card'); while (n.firstChild) { c.appendChild(n.firstChild); } n.appendChild(c); });
  var story = document.getElementById('story'), backdrop = document.getElementById('backdrop');
  // A photo step plays in order: its photos (headline over them), then the chart with just the headline, then the text.
  steps.forEach(function (n) {
    var k = n.querySelectorAll('figure.media').length;
    var hasBody = !!n.querySelector('p:not(.km):not(.yr):not(.hl), p.hl ~ p');
    // Départ steps (data-bg) keep their graphics on screen throughout: one screen per photo, plus one for the text
    var segs = n.dataset.bg ? k + (hasBody ? 1 : 0) : (k ? k + (hasBody ? 2 : 1) : 0);
    if (segs > 1) { n.style.setProperty('--n', segs); n.classList.add('multi'); }
    var hl = n.querySelector('h2') || n.querySelector('p:not(.km):not(.yr)');
    if (hl) { hl.classList.add('hl'); }
  });
  function photo(step) {
    var figs = Array.prototype.filter.call(step.querySelectorAll('figure.media'), function (f) { return f.querySelector('img, video'); });
    var i = 0, dep = !!step.dataset.bg, body = step.querySelector('.card > p:not(.km):not(.yr):not(.hl)');
    // other photo steps: photos, then the chart alone, then chart and text.
    // Départ steps: each photo with the graphics already on screen, then the text joins.
    var segs = dep ? figs.length + (body ? 1 : 0) : (figs.length ? figs.length + (body ? 2 : 1) : 0);
    if (segs > 1) {
      var r = step.getBoundingClientRect();
      i = Math.max(0, Math.min(segs - 1, Math.floor((innerHeight * 0.58 - r.top) / r.height * segs)));
    }
    var slot = i < figs.length ? figs[i].dataset.slot : '';
    if (dep && !slot) { slot = step.dataset.bg; } // text screen: the step's own photo stays behind the graphics
    figs.forEach(function (f, j) { f.classList.toggle('now', j === i); });
    story.classList.toggle('photo', !!slot && !dep);
    story.classList.toggle('overlay', dep);
    story.classList.toggle('intro', dep && i < figs.length && !!body); // headline and caption only, body text waits
    story.classList.toggle('datafirst', !dep && figs.length > 0 && i === figs.length);
    var cap = document.getElementById('bgcap'), c = slot && caps[slot];
    if (cap.dataset.slot !== slot) {
      cap.dataset.slot = slot;
      cap.textContent = c ? (c.caption || '') : '';
      if (c && c.credit) { cap.appendChild(html('span', 'credit', c.credit.author + ' / ' + c.credit.source + ', ' + c.credit.licence)); }
    }
    cap.classList.toggle('on', !!c);
    var still = document.documentElement.classList.contains('still');
    Array.prototype.forEach.call(backdrop.children, function (b) {
      var on = b.dataset.slot === slot;
      b.classList.toggle('on', on);
      if (b.tagName === 'VIDEO') { if (on && !still) { b.play().catch(function () {}); } else { b.pause(); } }
    });
  }
  var ticking = false;
  addEventListener('scroll', function () {
    if (ticking) { return; }
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      story.classList.toggle('pinned', story.getBoundingClientRect().top <= 1); // pinned text waits for a full-screen photo
      var a = document.querySelector('.step.active');
      if (a && a.classList.contains('multi')) { photo(a); }
    });
  }, { passive: true });
  function watchSteps() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) { return; }
        steps.forEach(function (n) { n.classList.remove('active'); });
        e.target.classList.add('active');
        var h = e.target.querySelector('h2') || e.target.querySelector('p');
        lead = h ? h.textContent.trim() : '';
        photo(e.target);
        render(e.target.dataset.step);
      });
    }, { rootMargin: '-58% 0px -40% 0px' }); // a line just under the mobile stage; fine on desktop too
    steps.forEach(function (n) { io.observe(n); });
  }
  function resize() {
    var r = svg.getBoundingClientRect();
    W = r.width; H = r.height;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    render(current);
  }

  // ---- appendix: data table, CSV, media, credits ----------------------------------------------
  function table() {
    var t = document.getElementById('table');
    var cols = [['Year'], ['Pace (kph)', 'winners_avg_speed', 1, 1], ['Distance (km)', 'total_distance_in_km', 1, 0],
      ['Abandons (%)', 'percent_abandons', 100, 0], ['Highest point (m)', 'highest_elevation_in_m', 1, 0],
      ['Winner led (% of stages)', 'led_percent', 100, 0], ['Score'], ['Rank']];
    var head = t.createTHead().insertRow();
    cols.forEach(function (c) { var th = html('th', '', c[0]); th.scope = 'col'; head.appendChild(th); });
    var body = t.createTBody();
    years.forEach(function (y) {
      var tr = body.insertRow(), th = html('th', '', String(y));
      th.scope = 'row';
      tr.appendChild(th);
      cols.slice(1, -2).forEach(function (c) {
        var d = byYear[y][c[1]];
        tr.insertCell().textContent = d ? (d.raw_value * c[2]).toFixed(c[3]) : '';
      });
      tr.insertCell().textContent = String(Math.round(score[y]));
      tr.insertCell().textContent = String(ranked.indexOf(y) + 1);
    });
  }
  document.getElementById('csv').addEventListener('click', function () {
    var q = function (v) { v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var text = 'year,Metric,Value,raw_value,tooltip\n' + rows.map(function (r) {
      return [r.year, r.Metric, r.Value, r.raw_value, r.tooltip].map(q).join(','); }).join('\n') + '\n';
    var a = html('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
    a.download = 'the_toughest_tour.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  });

  function media() {
    // Tableau Cloud sandboxes the extension (opaque origin, no CORS), so fetch() of its own files fails there;
    // build.py package bakes media.json into media/media.js as window.TDF_MEDIA.
    (window.TDF_MEDIA ? Promise.resolve(window.TDF_MEDIA)
      : fetch('media/media.json').then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }))
      .then(function (m) {
        var credits = document.getElementById('credits');
        Array.prototype.forEach.call(document.querySelectorAll('figure.media'), function (fig) {
          var e = m[fig.dataset.slot];
          if (!e) { fig.remove(); return; }
          fill(fig, e);
        });
        Object.keys(m).forEach(function (k) {
          var c = m[k].credit;
          if (!m[k].src && !m[k].youtube) { return; }
          if (!c) { return; }
          var li = html('li');
          var a = html('a', '', c.title);
          if (/^https:\/\//.test(c.url)) { a.href = c.url; a.rel = 'noopener'; a.target = '_blank'; }
          li.appendChild(a);
          li.appendChild(document.createTextNode(' by ' + c.author + ', ' + c.source + ', ' + c.licence + '.'));
          credits.appendChild(li);
        });
      });
  }
  function placeholder(fig, e) {
    fig.textContent = '';
    var p = html('div', 'placeholder');
    p.setAttribute('role', 'img');
    p.setAttribute('aria-label', e.alt || 'Media placeholder');
    p.appendChild(html('span', 'ph-tag', (e.type || 'image') + ' slot'));
    p.appendChild(html('span', 'ph-want', e.wanted || e.alt || ''));
    fig.appendChild(p);
  }
  // Packaged file name, or a full https URL (Cloud won't serve packaged video, so the clip is hosted elsewhere)
  function mediaUrl(f) { return /^https:\/\//.test(f) ? f : 'media/' + f; }
  var caps = {}; // slot -> media entry, for the on-screen photo source
  function fill(fig, e) {
    caps[fig.dataset.slot] = e;
    if (e.youtube) {
      // ponytail: privacy-enhanced embed; needs https://www.youtube-nocookie.com in requestedOrigins for the data app.
      var f = html('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(e.youtube);
      f.title = e.alt || 'Video';
      f.loading = 'lazy';
      f.allow = 'encrypted-media; picture-in-picture';
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      fig.appendChild(f);
    } else if (e.src) {
      var m, bg;
      if (e.type === 'video') {
        // ponytail: silent clips only (no audio track, so no captions needed); add e.captions for one with speech
        m = html('video');
        m.controls = true; m.muted = true; m.loop = true; m.playsInline = true; m.preload = 'none';
        m.setAttribute('aria-label', e.alt || 'Video');
        if (e.poster) { m.poster = mediaUrl(e.poster); }
        if (e.captions) {
          var tr = html('track');
          tr.kind = 'captions'; tr.srclang = 'en'; tr.label = 'English'; tr.default = true;
          tr.src = mediaUrl(e.captions);
          m.appendChild(tr);
        }
        bg = html('video');
        bg.muted = true; bg.loop = true; bg.playsInline = true; bg.preload = 'none';
        if (e.poster) { bg.poster = m.poster; }
      } else {
        m = html('img');
        m.alt = e.alt || '';
        m.loading = 'lazy';
        bg = html('img');
        bg.alt = ''; bg.loading = 'lazy';
      }
      // one retry first: Tableau Cloud's package host drops the odd request with a 500
      m.addEventListener('error', function () {
        if (!m.dataset.retried) { m.dataset.retried = '1'; m.src = mediaUrl(e.src) + (/\?/.test(e.src) ? '&' : '?') + 'retry=1'; return; }
        placeholder(fig, e);
      });
      m.src = mediaUrl(e.src);
      if (e.pos) { m.style.objectPosition = e.pos; bg.style.objectPosition = e.pos; }
      fig.appendChild(m);
      // full-screen copy behind the story (desktop); the in-step copy keeps the alt text for screen readers
      bg.dataset.slot = fig.dataset.slot; bg.src = m.src;
      backdrop.appendChild(bg);
      var act = document.querySelector('.step.active');
      if (act) { photo(act); }
    } else {
      placeholder(fig, e);
      return;
    }
    if (e.caption || e.credit) {
      var cap = html('figcaption', '', e.caption || '');
      if (e.credit) { cap.appendChild(html('span', 'credit', ' ' + e.credit.author + ' / ' + e.credit.source + ', ' + e.credit.licence)); }
      fig.appendChild(cap);
    }
  }

  // ---- boot -----------------------------------------------------------------------------------
  TDF.getRows().then(function (data) {
    build(data);
    facts();
    table();
    new ResizeObserver(resize).observe(svg);
    watchSteps();
  }).catch(function (err) {
    var p = html('p', 'error', 'Data unavailable: ' + ((err && (err.message || err.errorCode)) || err));
    stage.textContent = '';
    stage.appendChild(p);
  });
  media();
})();
