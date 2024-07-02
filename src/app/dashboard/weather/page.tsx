import ClientComponent from './client-component';

export default function Page() {

  const handleFetchWeather = async (location: string) => {
    
    'use server';
    const apiUrl = `https://plan.navcanada.ca/weather/api/alpha/?site=${location}&alpha=notam&alpha=metar&alpha=taf&notam_choice=english&metar_choice=4&_=1719878376376`;
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











