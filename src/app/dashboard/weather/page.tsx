// src/app/page.tsx
import ClientComponent from './client-component';

export default function Page() {
  // Define the server-side function to fetch weather data
  const handleFetchWeather = async (location: string) => {
    'use server';
    const apiUrl = `https://plan.navcanada.ca/weather/api/alpha/?site=${location}&alpha=notam&alpha=metar&alpha=taf&notam_choice=english&metar_choice=4&_=1719878376376`;
    console.log(`Weather API URL: ${apiUrl}`); // Log the API URL to confirm it's correct

    const response = await fetch(apiUrl, {
      next: { revalidate: 300 } // Revalidate every 5 minutes (300 seconds)
    });

    const data = await response.json();
    return data;
  };

  // Define the server-side function to fetch GFA data
  const handleFetchGFA = async (location: string, type: string) => {
    'use server';
    const apiUrl = `https://plan.navcanada.ca/gfa/images/?site=${location}&image=GFA/${type}`;
    console.log(`GFA API URL: ${apiUrl}`); // Log the API URL to confirm it's correct

    const response = await fetch(apiUrl, {
      next: { revalidate: 300 } // Revalidate every 5 minutes (300 seconds)
    });

    const data = await response.json();
    return data;
  };

  return (
    <div className="h-full w-full flex">
      <div className="h-full w-full">
        <ClientComponent fetchWeather={handleFetchWeather} fetchGFA={handleFetchGFA} />
      </div>
    </div>
  );
}
