
'use server';

import { getWeather } from '@/app/lib/services/weatherService';

export const handleFetchWeather = async (location) => {
  return getWeather(location.toUpperCase(), {
    includeNotam: true,
    includeMetar: true,
    includeTaf: true,
  });
};

export const handleFetchGFA = async () => {
  return null;
};

