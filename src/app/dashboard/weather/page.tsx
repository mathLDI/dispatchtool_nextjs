// src/app/dashboard/weather/page.tsx
import ClientComponent from './client-component';
import { handleFetchWeather, handleFetchGFA } from '../../lib/api/weatherActions'; // Correct relative path

export default function Page() {
  return (
    <div className="h-full w-full flex">
      <div className="h-full w-full">
        <ClientComponent fetchWeather={handleFetchWeather} fetchGFA={handleFetchGFA} />
      </div>
    </div>
  );
}
