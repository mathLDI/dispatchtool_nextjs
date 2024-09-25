export const dynamic = 'force-dynamic'; // Apply to weather page too


import ClientComponent from './client-component';
import { handleFetchWeather, handleFetchGFA } from './server-actions'; // Import from the new server-actions file

export default function Page() {
  return (
    <div className="h-full w-full flex">
      <div className="h-full w-full">
        {/* Pass the server actions directly to the ClientComponent */}
        <ClientComponent fetchWeather={handleFetchWeather} fetchGFA={handleFetchGFA} />
      </div>
    </div>
  );
}
