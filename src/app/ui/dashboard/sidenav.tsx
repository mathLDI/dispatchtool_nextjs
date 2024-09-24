import { useState } from 'react';
import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { useRccContext } from '@/app/dashboard/RccCalculatorContext';
import clsx from 'clsx';

type Routing = {
  flightNumber: string;
  departure: string;
  destination: string;
  icaoAirports?: string[]; // Existing ICAO airport list
  icaoAirportALTN?: string[]; // New ICAO alternate airport list
};

interface SideNavProps {
  savedRoutings: Routing[];
  showWeatherAndRcam?: boolean;
  showLogo?: boolean;
  showPrinterIcon?: boolean;
  onDeleteRouting: (index: number) => void;
  airportCategories: Record<string, { category: string; color: string }>; // Add this prop to receive the categories
}

export default function SideNav({
  savedRoutings = [],
  showWeatherAndRcam = true,
  showLogo = true,
  onDeleteRouting,
  airportCategories, // Destructure the new prop
}: SideNavProps) {
  const { setFlightDetails } = useRccContext();
  const [selectedRouting, setSelectedRouting] = useState<Routing | null>(null);


  const handleRoutingClick = (routing: Routing) => {
    setFlightDetails({
      flightNumber: routing.flightNumber,
      departure: routing.departure,
      destination: routing.destination,
      icaoAirports: Array.isArray(routing.icaoAirports) ? routing.icaoAirports : [],
      icaoAirportALTN: Array.isArray(routing.icaoAirportALTN) ? routing.icaoAirportALTN : [], // Add this line
    });
    setSelectedRouting(routing);
  };






  return (
    <div className="flex h-full flex-col px-2 py-2 md:px-1 overflow-y-auto">
      <div>

        {showLogo && (
          <Link
            className="mb-1 flex h-16 items-end justify-start rounded-md bg-blue-600 p-2 md:h-32"
            href="/"
          >
            <div className="w-24 text-white md:w-32">
              <AcmeLogo />
            </div>
          </Link>
        )}
        <div className="flex grow flex-row justify-between space-x-1 md:flex-col md:space-x-0 md:space-y-1">
          {showWeatherAndRcam && <NavLinks />}

        </div>


        {/* Display saved routings */}
        <div className="flex-1">
  {[...savedRoutings].reverse().map((routing, reverseIndex) => {
    const originalIndex = savedRoutings.length - 1 - reverseIndex; // Calculate the original index

    return (
      <div
        key={originalIndex}
        className={clsx(
          'p-2 bg-gray-100 rounded-md mb-2 flex justify-between items-center cursor-pointer hover:bg-sky-100 hover:text-blue-600',
          {
            'bg-sky-100 text-blue-600': selectedRouting === routing,
          }
        )}
        onClick={() => handleRoutingClick(routing)}
      >
        <div>
          <p className="font-bold">
            Flight: {routing.flightNumber}
          </p>

          {/* Display ICAO airports list in a row with both airport names and color dots */}
          {Array.isArray(routing.icaoAirports) && routing.icaoAirports.length > 0 && (
            <div className="flex flex-col">
              <div className="flex flex-row">
                {routing.icaoAirports.map((icao, idx) => (
                  <div key={idx} className="flex items-center space-x-1">
                    <span
                      className={`ml-2 ${airportCategories?.[icao]?.color || 'text-gray-500'}`}
                      style={{ fontSize: '1.5rem' }}
                    >
                      &#9679;
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Display ICAO Alternate airports list in a row with both airport names and color dots */}
          {Array.isArray(routing.icaoAirportALTN) && routing.icaoAirportALTN.length > 0 && (
            <div className="flex flex-col mt-1">
              <span>Alternate Airports:</span>
              <div className="flex flex-row space-x-1">
                {routing.icaoAirportALTN.map((icao, idx) => (
                  <div key={idx} className="flex items-center space-x-1">
                    <span>{icao}</span>
                    <span
                      className={`${airportCategories?.[icao]?.color || 'text-gray-500'}`}
                      style={{ fontSize: '1.5rem' }}
                    >
                      &#9679;
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the routing click
            onDeleteRouting(originalIndex); // Use the original index to delete the correct routing
          }}
          className="flex items-center ml-1 relative"
        >
          <div className='shadow-sm border hover:scale-110 transition-transform duration-150 px-1'>
            x
          </div>
        </button>
      </div>
    );
  })}
</div>



      </div>
    </div>
  );
}
