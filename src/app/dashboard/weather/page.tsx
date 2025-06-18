// src/app/dashboard/weather/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation'; // Import redirect for server-side redirection
import ClientComponent from './client-component';
{/** removed since weather getch was cancelled* import { handleFetchWeather, handleFetchGFA } from './server-actions'; */}

export default async function Page() {
  const authToken = cookies().get('authToken');

  if (!authToken) {
    // Redirect to login if not authenticated
    redirect('/login');
  }

  return (
    <div className="h-full w-full flex">
      <div className="h-full w-full">
        {/**        <ClientComponent fetchWeather={handleFetchWeather} fetchGFA={handleFetchGFA} /> */}

        Weather and Notams have been removed.  The calculators are available below.
      </div>
    </div>
  );
}
