const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getReportIssueTime,
  sortReportsByIssueTime,
  getLatestReport,
  getTafValidityPeriod,
  getTafReports,
} = require('./weatherReportUtils');

test('sorts reports chronologically across a month boundary', () => {
  const reports = [
    { text: 'METAR CYUL 311800Z 22010KT' },
    { text: 'METAR CYUL 030600Z 22010KT' },
  ];

  assert.deepEqual(
    sortReportsByIssueTime(reports, new Date('2026-11-03T12:00:00Z')),
    [reports[1], reports[0]]
  );
});

test('resolves report dates across a year boundary', () => {
  const reportTime = getReportIssueTime(
    'TAF CYVR 010100Z 0101/0201',
    new Date('2027-01-01T02:00:00Z')
  );

  assert.equal(reportTime, Date.parse('2027-01-01T01:00:00Z'));
});

test('keeps a report issued later on the current UTC day in the current month', () => {
  assert.equal(
    getReportIssueTime('METAR CYUL 031200Z 22010KT', new Date('2026-11-03T11:49:00Z')),
    Date.parse('2026-11-03T12:00:00Z')
  );
});

test('selects the newest TAF regardless of source order', () => {
  const older = { text: 'TAF CYUL 311800Z 3118/0118' };
  const newer = { text: 'TAF CYUL 030600Z 0306/0406' };

  assert.equal(
    getLatestReport([older, newer], new Date('2026-11-03T12:00:00Z')),
    newer
  );
});

test('keeps reports with missing or invalid timestamps after valid reports', () => {
  const invalid = { text: 'METAR CYUL NIL' };
  const valid = { text: 'METAR CYUL 030600Z 22010KT' };

  assert.deepEqual(
    sortReportsByIssueTime([invalid, valid], new Date('2026-11-03T12:00:00Z')),
    [valid, invalid]
  );
  assert.equal(getReportIssueTime('TAF CYUL 321200Z'), null);
});

test('resolves TAF validity periods across month and year boundaries', () => {
  assert.deepEqual(
    getTafValidityPeriod(
      'TAF CYUL 311800Z 3120/0106',
      new Date('2026-11-01T03:00:00Z')
    ),
    {
      startTimestamp: Date.parse('2026-10-31T20:00:00Z'),
      endTimestamp: Date.parse('2026-11-01T06:00:00Z'),
    }
  );
  assert.notEqual(
    getTafValidityPeriod(
      'TAF CYVR 311800Z 3120/0106',
      new Date('2027-01-01T02:00:00Z')
    ),
    null
  );
});

test('selects the currently valid TAF and preserves the latest issued TAF separately', () => {
  const current = { text: 'TAF CYUL 022300Z 0300/0400' };
  const upcoming = { text: 'TAF AMD CYUL 030100Z 0315/0415' };

  assert.deepEqual(
    getTafReports([current, upcoming], new Date('2026-11-03T01:10:00Z')),
    { current, latest: upcoming }
  );
});

test('does not classify expired TAF periods as current', () => {
  const expired = { text: 'TAF CYUL 020000Z 0200/0300' };

  assert.deepEqual(
    getTafReports([expired], new Date('2026-11-03T01:00:00Z')),
    { current: null, latest: expired }
  );
});
