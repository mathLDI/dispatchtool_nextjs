// src/app/dashboard/quickSearch/page.jsx
import ClientComponent from './client-component';
import { handleFetchWeather, handleFetchGFA } from '../../lib/api/weatherActions'; // Correct relative path

export default function Page() {
  return (
    <div className="h-full w-full flex">
      <div className="h-full w-full">
        {/* Rename fetchWeather to fetchQuickWeather for quick search */}
        <ClientComponent  fetchQuickWeather={handleFetchWeather} fetchGFA={handleFetchGFA} />
      </div>
    </div>
  );
}
