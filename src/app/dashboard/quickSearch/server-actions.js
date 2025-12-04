'use server';

import { getWeather } from '@/app/lib/services/weatherService';

/**
 * Server action for fetching weather
 * Uses optimized weather service with caching and deduplication
 * @param location ICAO airport code (e.g., 'CYUL')
 * @returns Weather data including METAR, TAF, and NOTAMs
 */
export const handleFetchWeather = async (location) => {
  if (!location || typeof location !== 'string') {
    throw new Error('Invalid location provided');
  }

  try {
    const data = await getWeather(location.toUpperCase(), {
      includeNotam: true,
      includeMetar: true,
      includeTaf: true,
      autoRefresh: false, // Client will handle polling
    });

    return data;
  } catch (error) {
    console.error(`Error fetching weather for ${location}:`, error);
    throw new Error(`Failed to fetch weather for ${location}`);
  }
};
