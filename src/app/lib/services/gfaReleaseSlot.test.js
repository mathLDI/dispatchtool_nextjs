import assert from 'node:assert/strict';
import test from 'node:test';
import { getGfaReleaseSlot } from './gfaReleaseSlot.js';

const date = (value) => new Date(value);

const cases = [
  ['before 05:30Z', '2026-08-21T05:29:59Z', '2026-08-20T23:30:00Z', '2026-08-21T05:30:00Z'],
  ['at 05:30Z', '2026-08-21T05:30:00Z', '2026-08-21T05:30:00Z', '2026-08-21T11:30:00Z'],
  ['after 05:30Z', '2026-08-21T05:30:01Z', '2026-08-21T05:30:00Z', '2026-08-21T11:30:00Z'],
  ['before 11:30Z', '2026-08-21T11:29:59Z', '2026-08-21T05:30:00Z', '2026-08-21T11:30:00Z'],
  ['at 11:30Z', '2026-08-21T11:30:00Z', '2026-08-21T11:30:00Z', '2026-08-21T17:30:00Z'],
  ['before 17:30Z', '2026-08-21T17:29:59Z', '2026-08-21T11:30:00Z', '2026-08-21T17:30:00Z'],
  ['at 17:30Z', '2026-08-21T17:30:00Z', '2026-08-21T17:30:00Z', '2026-08-21T23:30:00Z'],
  ['before 23:30Z', '2026-08-21T23:29:59Z', '2026-08-21T17:30:00Z', '2026-08-21T23:30:00Z'],
  ['at 23:30Z', '2026-08-21T23:30:00Z', '2026-08-21T23:30:00Z', '2026-08-22T05:30:00Z'],
];

for (const [name, input, expectedKey, expectedNext] of cases) {
  test(name, () => {
    const slot = getGfaReleaseSlot(date(input));
    assert.equal(slot.key, expectedKey);
    assert.equal(slot.nextIssuedAt.toISOString().replace('.000Z', 'Z'), expectedNext);
  });
}
