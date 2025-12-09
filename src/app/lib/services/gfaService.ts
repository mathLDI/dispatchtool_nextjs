/**
 * GFA Service - Fetch GFA (Graphic Forecast Area) data for airports
 * Supports CLDWX (Clouds & Weather) and TURBC (Icing, Turbulence, Freezing Level)
 */

const GFA_PRODUCTS = {
  CLDWX: 'gfacn31_cldwx',  // Clouds & Weather
  TURBC: 'gfacn31_turbc',  // Icing, Turbulence, Freezing Level
};

interface GFACacheEntry {
  data: any;
  timestamp: number;
}

const gfaCache = new Map<string, GFACacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const REQUEST_TIMEOUT = 10 * 1000; // 10 seconds
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Fetch GFA data from NavCanada API
 */
async function fetchGFAFromAPI(gfaType: string = 'CLDWX'): Promise<any> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    // Use our own API route instead of calling NavCanada directly
    const response = await fetch(`/api/gfa?type=${encodeURIComponent(gfaType)}&t=${Date.now()}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`GFA fetch failed for ${gfaType}:`, error.message);
    }
    throw error;
  }
}

/**
 * Get GFA data with intelligent caching and deduplication
 */
export async function getGFA(gfaType: string = 'CLDWX', forceRefresh: boolean = false): Promise<any> {
  const cacheKey = gfaType.toUpperCase();

  // Check if we have a valid cached result (skip if forceRefresh is true)
  const cached = gfaCache.get(cacheKey);
  if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[GFA] Cache hit for ${cacheKey}`);
    return cached.data;
  }

  // Prevent duplicate in-flight requests
  if (inFlightRequests.has(cacheKey)) {
    console.log(`[GFA] Returning in-flight request for ${cacheKey}`);
    return inFlightRequests.get(cacheKey);
  }

  // Fetch fresh data
  console.log(`[GFA] Fetching fresh data for ${cacheKey}`);
  const fetchPromise = fetchGFAFromAPI(gfaType);

  // Track in-flight request
  inFlightRequests.set(cacheKey, fetchPromise);

  try {
    const data = await fetchPromise;

    // Update cache
    gfaCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  } finally {
    // Remove from in-flight tracking
    inFlightRequests.delete(cacheKey);
  }
}

/**
 * Clear GFA cache
 */
export function clearGFACache(gfaType?: string): void {
  if (gfaType) {
    const cacheKey = gfaType.toUpperCase();
    gfaCache.delete(cacheKey);
    console.log(`[GFA] Cleared cache for ${cacheKey}`);
  } else {
    gfaCache.clear();
    console.log('[GFA] Cleared all cache');
  }
}
