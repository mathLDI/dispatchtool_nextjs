import ClientComponent from './client-component';
import { handleFetchWeather } from './server-actions'; // Import server actions

export const dynamic = 'force-dynamic'; // Force dynamic rendering

export default function Page() {
  return (
    <div className="h-full w-full flex">
      <div className="h-full w-full">
        {/* Pass the server actions to the ClientComponent */}
        <ClientComponent fetchQuickWeather={handleFetchWeather} />
      </div>
    </div>
  );
}
