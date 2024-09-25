// src/app/dashboard/quickSearch/server-actions.js
'use server';

export const handleFetchWeather = async (location) => {
  const apiUrl = `https://plan.navcanada.ca/weather/api/alpha/?site=${location}&alpha=notam&alpha=metar&alpha=taf&notam_choice=english&metar_choice=4&_=1719878376376`;
  console.log(`Weather API URL: ${apiUrl}`);

  const response = await fetch(apiUrl, { next: { revalidate: 300 } });
  const data = await response.json();
  return data;
};
