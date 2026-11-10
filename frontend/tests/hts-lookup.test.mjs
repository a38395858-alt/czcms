import test from 'node:test'
import assert from 'node:assert/strict'
import { renderRows, renderResults, searchURL } from '../assets/js/hts-model.mjs'
test('HTS result markup preserves legal text, inherited source, notes and plain ten-digit copy values', () => {
  const html = renderRows([{ code: '8517140020', formattedCode: '8517.14.00.20', description: '<script>alert(1)</script> & phones', hierarchy: [{ code: '8517.14.00', description: 'Other cellular telephones' }], units: 'No.', generalRate: 'Free', rateSource: '8517.14.00', footnotes: ['See <chapter> 99.'] }])
  assert.ok(html.includes('From 8517.14.00') && html.includes('data-hts-copy="8517140020"'))
  assert.ok(html.includes('&lt;script&gt;') && html.includes('&lt;chapter&gt;'))
  assert.ok(!html.includes('<script>') && !html.includes('<chapter>'))
  assert.ok(html.includes('Full legal context &amp; notes'))
  assert.ok(renderRows([{ code: '0000000000', formattedCode: '0000.00.00.00', description: 'Example' }]).includes('See schedule'))
})
test('HTS pagination keeps the query encoded and empty results give a recovery action', () => {
  assert.equal(searchURL('/tools/hts-code-lookup', 'cotton & silk', 2), '/tools/hts-code-lookup?q=cotton+%26+silk&page=2')
  const empty = renderResults({ items: [], total: 0 }, '/tools/hts-code-lookup')
  assert.ok(empty.includes('No matching codes found') && empty.includes('4–6'))
})
