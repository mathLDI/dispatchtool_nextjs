import ClientComponent from './client-component';
import { handleFetchWeather } from './server-actions';

export default function Page() {

  return (
    <div className="h-full w-full flex b">
      <div className="h-full w-full">
        {/* ClientComponent uses weatherService.ts with intelligent caching and request deduplication */}
        <ClientComponent fetchQuickWeather={handleFetchWeather} />
      </div>
    </div>
  );
}
