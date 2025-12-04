/**
 * Weather Service - Optimized weather fetching with caching and polling
 * Features: Request deduplication, intelligent caching, background polling
 */

const WEATHER_API_URL = 'https://plan.navcanada.ca/weather/api/alpha/';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes (fast refresh for aviation data)
const POLL_INTERVAL = 3 * 60 * 1000; // 3 minutes for background updates
const REQUEST_TIMEOUT = 10 * 1000; // 10 seconds

interface CacheEntry {
  data: any;
  timestamp: number;
  pollInterval?: NodeJS.Timeout;
}

interface FetchOptions {
  includeNotam?: boolean;
  includeMetar?: boolean;
  includeTaf?: boolean;
  autoRefresh?: boolean;
}

// In-memory cache
const weatherCache = new Map<string, CacheEntry>();

// Track in-flight requests to prevent duplicates
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Fetch weather data from NavCanada API
 * Handles deduplication, caching, and timeout
 */
async function fetchWeatherFromAPI(
  location: string,
  options: FetchOptions = {}
): Promise<any> {
  const {
    includeNotam = true,
    includeMetar = true,
    includeTaf = true,
  } = options;

  // Build query params
  const params = new URLSearchParams({
    site: location.toUpperCase(),
  });

  if (includeNotam) params.append('alpha', 'notam');
  if (includeMetar) params.append('alpha', 'metar');
  if (includeTaf) params.append('alpha', 'taf');

  // Aviation-specific params
  params.append('notam_choice', 'english');
  params.append('metar_choice', '4'); // Includes SPECI and METAR

  const apiUrl = `${WEATHER_API_URL}?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(apiUrl, {
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
      console.error(`Weather fetch failed for ${location}:`, error.message);
    }
    throw error;
  }
}

/**
 * Get weather with intelligent caching and deduplication
 */
export async function getWeather(
  location: string,
  options: FetchOptions = {}
): Promise<any> {
  const normalizedLocation = location.toUpperCase();
  const cacheKey = normalizedLocation;

  // Check if we have a valid cached result
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[Weather] Cache hit for ${normalizedLocation}`);
    return cached.data;
  }

  // Prevent duplicate in-flight requests
  if (inFlightRequests.has(cacheKey)) {
    console.log(`[Weather] Returning in-flight request for ${normalizedLocation}`);
    return inFlightRequests.get(cacheKey);
  }

  // Fetch fresh data
  console.log(`[Weather] Fetching fresh data for ${normalizedLocation}`);
  const fetchPromise = fetchWeatherFromAPI(normalizedLocation, options);

  // Track in-flight request
  inFlightRequests.set(cacheKey, fetchPromise);

  try {
    const data = await fetchPromise;

    // Update cache
    weatherCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    // Set up auto-refresh if requested
    if (options.autoRefresh) {
      scheduleAutoRefresh(normalizedLocation, options);
    }

    return data;
  } finally {
    // Remove from in-flight tracking
    inFlightRequests.delete(cacheKey);
  }
}

/**
 * Schedule automatic weather updates in the background
 * Perfect for keeping data fresh without user interaction
 */
function scheduleAutoRefresh(location: string, options: FetchOptions): void {
  const cacheKey = location.toUpperCase();
  const cached = weatherCache.get(cacheKey);

  // Clear any existing poll interval
  if (cached?.pollInterval) {
    clearInterval(cached.pollInterval);
  }

  console.log(`[Weather] Scheduling auto-refresh for ${cacheKey} every ${POLL_INTERVAL}ms`);

  const pollInterval = setInterval(async () => {
    try {
      // Fetch fresh data without using cache
      const data = await fetchWeatherFromAPI(cacheKey, options);

      // Update cache with new timestamp
      weatherCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        pollInterval: cached?.pollInterval,
      });

      console.log(`[Weather] Auto-refresh completed for ${cacheKey}`);
    } catch (error) {
      console.error(`[Weather] Auto-refresh failed for ${cacheKey}:`, error);
      // Continue polling even on failure
    }
  }, POLL_INTERVAL);

  // Store poll interval reference
  if (cached) {
    cached.pollInterval = pollInterval;
  } else {
    weatherCache.set(cacheKey, {
      data: null,
      timestamp: 0,
      pollInterval,
    });
  }
}

/**
 * Stop auto-refresh for a location
 */
export function stopAutoRefresh(location: string): void {
  const cacheKey = location.toUpperCase();
  const cached = weatherCache.get(cacheKey);

  if (cached?.pollInterval) {
    clearInterval(cached.pollInterval);
    cached.pollInterval = undefined;
    console.log(`[Weather] Stopped auto-refresh for ${cacheKey}`);
  }
}

/**
 * Clear cache for a specific location or all
 */
export function clearWeatherCache(location?: string): void {
  if (location) {
    const cacheKey = location.toUpperCase();
    const cached = weatherCache.get(cacheKey);
    if (cached?.pollInterval) {
      clearInterval(cached.pollInterval);
    }
    weatherCache.delete(cacheKey);
    console.log(`[Weather] Cleared cache for ${cacheKey}`);
  } else {
    // Clear all
    weatherCache.forEach((entry) => {
      if (entry.pollInterval) {
        clearInterval(entry.pollInterval);
      }
    });
    weatherCache.clear();
    console.log('[Weather] Cleared all cache');
  }
}

/**
 * Get cache stats (useful for debugging)
 */
export function getWeatherCacheStats(): {
  size: number;
  locations: string[];
  ages: Record<string, number>;
} {
  const locations: string[] = [];
  const ages: Record<string, number> = {};

  weatherCache.forEach((entry, key) => {
    locations.push(key);
    ages[key] = Date.now() - entry.timestamp;
  });

  return {
    size: weatherCache.size,
    locations,
    ages,
  };
}

/**
 * Prefetch weather for multiple locations (useful for known flight routes)
 */
export async function prefetchWeatherForLocations(
  locations: string[],
  options: FetchOptions = {}
): Promise<Record<string, any>> {
  const results: Record<string, any> = {};

  const promises = locations.map(async (location) => {
    try {
      const data = await getWeather(location, options);
      results[location.toUpperCase()] = data;
    } catch (error) {
      console.error(`Failed to prefetch ${location}:`, error);
      results[location.toUpperCase()] = null;
    }
  });

  await Promise.all(promises);
  return results;
}

export default {
  getWeather,
  stopAutoRefresh,
  clearWeatherCache,
  getWeatherCacheStats,
  prefetchWeatherForLocations,
};
