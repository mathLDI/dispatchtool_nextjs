import { useState } from 'react';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { useRccContext } from '@/app/dashboard/RccCalculatorContext';
import clsx from 'clsx';

type Routing = {
  flightNumber: string;
  departure: string;
  destination: string;
  icaoAirports?: string[];
};

interface SideNavProps {
  savedRoutings: Routing[];
  showWeatherAndRcam?: boolean;
  showLogo?: boolean;
  onDeleteRouting: (index: number) => void;
  airportCategories: Record<string, { category: string; color: string }>;
}

export default function SideNav({
  savedRoutings = [],
  showWeatherAndRcam = true,
  showLogo = true,
  onDeleteRouting,
}: SideNavProps) {
  const { airportCategories } = useRccContext(); // Get from context instead 7.11.2024
  const { setFlightDetails } = useRccContext();
  const [selectedRouting, setSelectedRouting] = useState<Routing | null>(null);

  const handleRoutingClick = (routing: Routing) => {
    setFlightDetails({
      flightNumber: routing.flightNumber,
      departure: routing.departure,
      destination: routing.destination,
      icaoAirports: Array.isArray(routing.icaoAirports) ? routing.icaoAirports : [],
    });
    setSelectedRouting(routing);
  };

  return (
    <div className="flex flex-col h-full px-1 py-1 md:px-1"> {/* Make this container full height */}
      {showLogo && (
        <div className="flex mb-1 items-end justify-start rounded-md bg-blue-600 md:h-32">
          <div className="w-24 text-white md:w-32">
            <AcmeLogo />
          </div>
        </div>
      )}

      <div className="flex grow flex-row justify-between space-x-1 md:flex-col md:space-x-0 md:space-y-1">
        {showWeatherAndRcam && <NavLinks />}
      </div>

      {/* Display saved routings */}
      <div className="flex flex-col overflow-y-auto"> {/* Allow routing list to scroll */}
        {[...savedRoutings].reverse().map((routing, reverseIndex) => {
          const originalIndex = savedRoutings.length - 1 - reverseIndex;
          return (
            <div
              key={originalIndex}
              className={clsx(
                'rounded-md mb-1 flex justify-between items-center cursor-pointer',
                selectedRouting === routing
                  ? 'bg-sky-100 text-black dark:bg-sky-900 dark:text-white'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white hover:bg-sky-100 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-white'
              )}
              onClick={() => handleRoutingClick(routing)}
            >
              <div>
                <p className="font-bold mb-0">Flight: {routing.flightNumber}</p>
                {Array.isArray(routing.icaoAirports) && routing.icaoAirports.length > 0 && (
                  <div className="flex flex-wrap gap-1" style={{ maxWidth: '100px' }}>
                    {routing.icaoAirports.map((icao, idx) => (
                      <span key={idx} className={`${airportCategories?.[icao]?.color || 'text-gray-500'}`} style={{ fontSize: '1.5rem' }}>
                        &#9679;
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={(e) => { e.stopPropagation(); onDeleteRouting(originalIndex); }} className="ml-1">
                x
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
