import ClientComponent from './client-component';

export default function Page() {

  const handleFetchWeather = async (location: string) => {
    
    'use server';
    const apiUrl = `https://plan.navcanada.ca/weather/api/alpha/?site=${location}&alpha=metar&_=1719605788106`;
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






