'use strict';
const common = require('../common');
const assert = require('assert');
function createURL(mime, body) {
  return `data:${mime},${body}`;
}
function createBase64URL(mime, body) {
  return `data:${mime};base64,${Buffer.from(body).toString('base64')}`;
}
(async () => {
  {
    const body = 'export default {a:"aaa"};';
    const plainESMURL = createURL('text/javascript', body);
    const ns = await import(plainESMURL);
    assert.deepStrictEqual(Object.keys(ns), ['default']);
    assert.deepStrictEqual(ns.default.a, 'aaa');
    const importerOfURL = createURL(
      'text/javascript',
      `export {default as default} from ${JSON.stringify(plainESMURL)}`
    );
    assert.strictEqual(
      (await import(importerOfURL)).default,
      ns.default
    );
    const base64ESMURL = createBase64URL('text/javascript', body);
    assert.notStrictEqual(
      await import(base64ESMURL),
      ns
    );
  }
  {
    const body = 'export default import.meta.url;';
    const plainESMURL = createURL('text/javascript', body);
    const ns = await import(plainESMURL);
    assert.deepStrictEqual(Object.keys(ns), ['default']);
    assert.deepStrictEqual(ns.default, plainESMURL);
  }
  {
    const body = '{"x": 1}';
    const plainESMURL = createURL('application/json', body);
    const ns = await import(plainESMURL);
    assert.deepStrictEqual(Object.keys(ns), ['default']);
    assert.deepStrictEqual(ns.default.x, 1);
  }
  {
    const body = '{"default": 2}';
    const plainESMURL = createURL('application/json', body);
    const ns = await import(plainESMURL);
    assert.deepStrictEqual(Object.keys(ns), ['default']);
    assert.deepStrictEqual(ns.default.default, 2);
  }
  {
    const body = 'null';
    const plainESMURL = createURL('invalid', body);
    try {
      await import(plainESMURL);
      common.mustNotCall()();
    } catch (e) {
      assert.strictEqual(e.code, 'ERR_INVALID_RETURN_PROPERTY_VALUE');
    }
  }
})().then(common.mustCall());
