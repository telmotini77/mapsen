import assert from 'node:assert/strict';
import test from 'node:test';
import { reserveTarget } from '../src/lib/reserveSelection.ts';

test('reserve mode opens existing NAP and every MANGA subtype', () => {
  for (const target of [{ kind: 'NAP' }, { kind: 'MANGA', type: 'EMPALME' }, { kind: 'MANGA', type: 'PASO' }]) {
    assert.equal(reserveTarget('reserve', target), target);
  }
});

test('reserve mode consumes empty map, cable, pole and ODF clicks without selecting a target', () => {
  for (const target of [null, { kind: 'ODF' }, { kind: 'CABLE' }, { kind: 'POLE' }]) {
    assert.equal(reserveTarget('reserve', target), null);
  }
});

test('other tools retain their own click handling', () => {
  for (const tool of ['select', 'add-nap', 'add-manga', 'add-cable']) {
    assert.equal(reserveTarget(tool, { kind: 'NAP' }), undefined);
  }
});
