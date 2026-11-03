function getReportIssueTime(text, referenceTime = new Date()) {
  if (typeof text !== 'string') return null;

  const match = text.match(/\b(\d{2})(\d{2})(\d{2})Z\b/);
  if (!match) return null;

  const [, dayText, hourText, minuteText] = match;
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (day < 1 || day > 31 || hour > 23 || minute > 59) return null;

  const referenceTimestamp = referenceTime.getTime();
  const year = referenceTime.getUTCFullYear();
  const month = referenceTime.getUTCMonth();
  const candidates = [];

  for (const monthOffset of [-1, 0, 1]) {
    const monthStart = new Date(Date.UTC(year, month + monthOffset, 1));
    const daysInMonth = new Date(Date.UTC(
      monthStart.getUTCFullYear(),
      monthStart.getUTCMonth() + 1,
      0
    )).getUTCDate();

    if (day > daysInMonth) continue;

    const timestamp = Date.UTC(
      monthStart.getUTCFullYear(),
      monthStart.getUTCMonth(),
      day,
      hour,
      minute
    );

    if (timestamp <= referenceTimestamp + 24 * 60 * 60 * 1000) {
      candidates.push(timestamp);
    }
  }

  return candidates.length > 0 ? Math.max(...candidates) : null;
}

function sortReportsByIssueTime(reports, referenceTime = new Date()) {
  if (!Array.isArray(reports)) return [];

  return reports
    .map((report, index) => ({
      report,
      index,
      issueTime: getReportIssueTime(report?.text, referenceTime),
    }))
    .sort((a, b) => {
      if (a.issueTime === null && b.issueTime !== null) return 1;
      if (a.issueTime !== null && b.issueTime === null) return -1;
      if (a.issueTime !== b.issueTime) return (b.issueTime || 0) - (a.issueTime || 0);
      return a.index - b.index;
    })
    .map(({ report }) => report);
}

function getLatestReport(reports, referenceTime = new Date()) {
  return sortReportsByIssueTime(reports, referenceTime)[0] || null;
}

function getTafValidityPeriod(text, referenceTime = new Date()) {
  if (typeof text !== 'string') return null;

  const match = text.match(/\b\d{6}Z\s+(\d{2})(\d{2})\/(\d{2})(\d{2})\b/);
  if (!match) return null;

  const [, startDayText, startHourText, endDayText, endHourText] = match;
  const startDay = Number(startDayText);
  const startHour = Number(startHourText);
  const endDay = Number(endDayText);
  const endHour = Number(endHourText);
  if (
    startDay < 1 || startDay > 31 || endDay < 1 || endDay > 31 ||
    startHour > 23 || endHour > 23
  ) {
    return null;
  }

  const referenceTimestamp = referenceTime.getTime();
  const year = referenceTime.getUTCFullYear();
  const month = referenceTime.getUTCMonth();
  const periods = [];

  for (const startMonthOffset of [-1, 0, 1]) {
    const startMonth = new Date(Date.UTC(year, month + startMonthOffset, 1));
    const startMonthDays = new Date(Date.UTC(
      startMonth.getUTCFullYear(),
      startMonth.getUTCMonth() + 1,
      0
    )).getUTCDate();
    if (startDay > startMonthDays) continue;

    const startTimestamp = Date.UTC(
      startMonth.getUTCFullYear(),
      startMonth.getUTCMonth(),
      startDay,
      startHour
    );

    for (const endMonthOffset of [startMonthOffset, startMonthOffset + 1]) {
      const endMonth = new Date(Date.UTC(year, month + endMonthOffset, 1));
      const endMonthDays = new Date(Date.UTC(
        endMonth.getUTCFullYear(),
        endMonth.getUTCMonth() + 1,
        0
      )).getUTCDate();
      if (endDay > endMonthDays) continue;

      const endTimestamp = Date.UTC(
        endMonth.getUTCFullYear(),
        endMonth.getUTCMonth(),
        endDay,
        endHour
      );

      if (
        endTimestamp > startTimestamp &&
        endTimestamp - startTimestamp <= 48 * 60 * 60 * 1000
      ) {
        periods.push({ startTimestamp, endTimestamp });
      }
    }
  }

  return periods.find(
    ({ startTimestamp, endTimestamp }) =>
      startTimestamp <= referenceTimestamp && referenceTimestamp < endTimestamp
  ) || null;
}

function getTafReports(reports, referenceTime = new Date()) {
  const sortedReports = sortReportsByIssueTime(reports, referenceTime);
  return {
    current: sortedReports.find(
      (report) => getTafValidityPeriod(report?.text, referenceTime) !== null
    ) || null,
    latest: sortedReports[0] || null,
  };
}

module.exports = {
  getReportIssueTime,
  sortReportsByIssueTime,
  getLatestReport,
  getTafValidityPeriod,
  getTafReports,
};
