// The only file that knows where data comes from. Everything else calls TDF.getRows() and gets
// [{ year, Metric, Value, raw_value, tooltip }] with year/Value/raw_value as numbers.
//   Tableau: tableau.extensions present (and no ?csv=) -> live queryAsync on the bound datasource.
//   Blog/dev: fetch the CSV copied next to the page (or the same-origin path given in ?csv=).
(function (root) {
  'use strict';

  var FIELDS = ['year', 'Metric', 'Value', 'raw_value', 'tooltip'];
  var DEFAULT_CSV = 'data/the_toughest_tour.csv';
  // Desktop scaffolding can stamp the Extensions API DataSource.id here; empty = first datasource.
  var BOUND_DATASOURCE_ID = '';

  // RFC 4180-ish: quoted fields, "" escapes, commas/newlines inside quotes.
  function parseCsv(text) {
    var rows = [], row = [], field = '', q = false, i, c;
    text = text.replace(/^﻿/, '');
    for (i = 0; i < text.length; i++) {
      c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (c === '"') { q = false; }
        else { field += c; }
      } else if (c === '"') { q = true; }
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') { i++; }
        row.push(field); field = '';
        if (row.length > 1 || row[0] !== '') { rows.push(row); }
        row = [];
      } else { field += c; }
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    var head = rows.shift() || [];
    return rows.map(function (r) {
      var o = {};
      head.forEach(function (h, j) { o[h] = r[j]; });
      return o;
    });
  }

  function normalise(rows) {
    return rows.map(function (r) {
      return {
        year: Number(r.year),
        Metric: String(r.Metric),
        Value: Number(r.Value),
        raw_value: Number(r.raw_value),
        tooltip: r.tooltip == null ? '' : String(r.tooltip)
      };
    }).filter(function (r) { return isFinite(r.year) && isFinite(r.Value); })
      .sort(function (a, b) { return a.year - b.year; });
  }

  // Only same-origin relative paths: ?csv= must not be able to point the page at another host.
  function csvUrl() {
    var p = new URLSearchParams(root.location.search).get('csv');
    return p && !/^[a-z][a-z0-9+.-]*:|^\/\/|\\/i.test(p) ? p : null;
  }

  function fromCsv(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) { throw new Error('CSV ' + url + ' returned ' + res.status); }
      return res.text();
    }).then(parseCsv);
  }

  function fromTableau() {
    var ext = root.tableau.extensions;
    return ext.initializeAsync().then(function () {
      var wb = ext.workbook, wc = ext.worksheetContent;
      if (wb && typeof wb.getAllDataSourcesAsync === 'function') { return wb.getAllDataSourcesAsync(); }
      if (wc && wc.worksheet) { return wc.worksheet.getDataSourcesAsync(); }
      return [];
    }).then(function (list) {
      list = list || [];
      var ds = BOUND_DATASOURCE_ID
        ? list.filter(function (d) { return d && d.id === BOUND_DATASOURCE_ID; })[0]
        : list[0];
      if (!ds) { throw new Error('data source ' + (BOUND_DATASOURCE_ID || '(first)') + ' not found in the workbook'); }
      // Publishing can re-case captions (Desktop turned Metric/Value into metric/value), so match
      // FIELDS to the datasource's real captions case-insensitively, then rename keys back.
      var meta = typeof ds.readMetadataAsync === 'function'
        ? ds.readMetadataAsync().catch(function () { return null; })
        : Promise.resolve(null);
      return meta.then(function (m) {
        var list = (m && (m.data || m.fields)) || [];
        var byLower = {};
        list.forEach(function (f) {
          var c = f && (f.fieldCaption || f.caption || f.name);
          if (c) { byLower[String(c).toLowerCase()] = String(c); }
        });
        var captions = FIELDS.map(function (f) { return byLower[f.toLowerCase()] || f; });
        // No aggregation function: (year, Metric) is unique, so each row comes back as-is.
        return ds.queryAsync({ fields: captions.map(function (c) { return { fieldCaption: c }; }) })
          .then(function (result) {
            var rows = result && Array.isArray(result.data) ? result.data : [];
            return rows.map(function (r) {
              var o = {};
              FIELDS.forEach(function (f, i) { o[f] = r[captions[i]]; });
              return o;
            });
          });
      });
    });
  }

  function getRows() {
    var forced = csvUrl();
    var live = !forced && root.tableau && root.tableau.extensions;
    return (live ? fromTableau() : fromCsv(forced || DEFAULT_CSV)).then(normalise);
  }

  root.TDF = { getRows: getRows, parseCsv: parseCsv };
})(typeof window !== 'undefined' ? window : globalThis);
