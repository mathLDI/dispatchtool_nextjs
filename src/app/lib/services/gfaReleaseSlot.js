const RELEASE_MINUTES = [
  5 * 60 + 30,
  11 * 60 + 30,
  17 * 60 + 30,
  23 * 60 + 30,
];

function startOfUtcDay(date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function toReleaseSlot(dayStart, minutes) {
  const issuedAt = new Date(dayStart + minutes * 60 * 1000);
  return {
    key: issuedAt.toISOString().replace('.000Z', 'Z'),
    issuedAt,
  };
}

export function getGfaReleaseSlot(now = new Date()) {
  const currentTime = now.getTime();
  const dayStart = startOfUtcDay(now);

  for (let index = RELEASE_MINUTES.length - 1; index >= 0; index -= 1) {
    const slot = toReleaseSlot(dayStart, RELEASE_MINUTES[index]);
    if (slot.issuedAt.getTime() <= currentTime) {
      const nextIndex = index + 1;
      const nextIssuedAt = nextIndex < RELEASE_MINUTES.length
        ? toReleaseSlot(dayStart, RELEASE_MINUTES[nextIndex]).issuedAt
        : toReleaseSlot(dayStart + 24 * 60 * 60 * 1000, RELEASE_MINUTES[0]).issuedAt;

      return { ...slot, nextIssuedAt };
    }
  }

  const previousDayStart = dayStart - 24 * 60 * 60 * 1000;
  const previousSlot = toReleaseSlot(previousDayStart, RELEASE_MINUTES[RELEASE_MINUTES.length - 1]);

  return {
    ...previousSlot,
    nextIssuedAt: toReleaseSlot(dayStart, RELEASE_MINUTES[0]).issuedAt,
  };
}

export function getGfaReleaseSlotKey(now = new Date()) {
  return getGfaReleaseSlot(now).key;
}

export const GFA_RELEASE_DELAY_MS = 10 * 60 * 1000;
