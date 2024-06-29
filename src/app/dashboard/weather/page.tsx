import ClientComponent from './client-component';

export default function Page() {

  const handleFetchWeather = async (location: string) => {
    
    'use server';
    const apiUrl = `https://plan.navcanada.ca/weather/api/alpha/?site=${location}&alpha=sigmet&alpha=airmet&alpha=notam&alpha=metar&alpha=taf&alpha=pirep&notam_choice=default&_=1719683535281`;
    console.log(`API URL: ${apiUrl}`);  // Log the API URL to confirm it's correct
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
  };

  return (
    <div>
    
      <ClientComponent fetchWeather={handleFetchWeather} />
     
    </div>
  );
}










