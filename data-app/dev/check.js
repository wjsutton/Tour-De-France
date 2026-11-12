// node dev/check.js : asserts the CSV parser on edge cases and on the real CSV.
const fs = require('fs'), path = require('path'), assert = require('assert');
require('../Packages/com.tableau.mcp.the-toughest-tour-story/content/src/data.js');
const { parseCsv } = globalThis.TDF;
assert.deepStrictEqual(parseCsv('a,b\r\n1,"x, ""y""\nz"\n'), [{ a: '1', b: 'x, "y"\nz' }]);
const rows = parseCsv(fs.readFileSync(path.join(__dirname, '../../data/the_toughest_tour.csv'), 'utf8'));
assert.strictEqual(rows.length % 5, 0);
assert.ok(rows.every(r => Object.keys(r).length === 5 && r.tooltip && isFinite(+r.Value)));
console.log('ok', rows.length, 'rows');
