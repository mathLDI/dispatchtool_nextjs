import { useState } from 'react';
import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { PrinterIcon } from '@heroicons/react/outline';
import { useRccContext } from '@/app/dashboard/RccCalculatorContext';
import clsx from 'clsx';

type Routing = {
  flightNumber: string;
  departure: string;
  destination: string;
  alternate1?: string;
  alternate2?: string;
  icaoAirports?: string[]; // Add this line to include icaoAirports
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
  showPrinterIcon = true,
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
      alternate1: routing.alternate1 || '',
      alternate2: routing.alternate2 || '',
      icaoAirports: Array.isArray(routing.icaoAirports) ? routing.icaoAirports : [], // Ensure icaoAirports is an array
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
        <div className="mt-4">
          {savedRoutings.map((routing, index) => (
            <div
              key={index}
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
                <div className="flex items-center space-x-1">
                  <span>{routing.departure}</span>
                  {/* Display the color dot for the departure airport */}
                  <span
                    className={`ml-2 ${airportCategories?.[routing.departure]?.color || 'text-gray-500'}`}
                    style={{ fontSize: '1.5rem' }}
                  >
                    &#9679;
                  </span>
                  <span>→</span>
                  <span>{routing.destination}</span>
                  {/* Display the color dot for the destination airport */}
                  <span
                    className={`ml-2 ${airportCategories?.[routing.destination]?.color || 'text-gray-500'}`}
                    style={{ fontSize: '1.5rem' }}
                  >
                    &#9679;
                  </span>
                </div>
                {routing.alternate1 && (
                  <div className="flex items-center space-x-1 mt-2">
                    <span>ALTN 1:</span>
                    <span>{routing.alternate1}</span>
                    {/* Display the color dot for the alternate1 airport */}
                    <span
                      className={`ml-2 ${airportCategories?.[routing.alternate1]?.color || 'text-gray-500'}`}
                      style={{ fontSize: '1.5rem' }}
                    >
                      &#9679;
                    </span>
                  </div>
                )}
                {routing.alternate2 && (
                  <div className="flex items-center space-x-1 mt-2">
                    <span>ALTN 2:</span>
                    <span>{routing.alternate2}</span>
                    {/* Display the color dot for the alternate2 airport */}
                    <span
                      className={`ml-2 ${airportCategories?.[routing.alternate2]?.color || 'text-gray-500'}`}
                      style={{ fontSize: '1.5rem' }}
                    >
                      &#9679;
                    </span>
                  </div>
                )}


                {/* Display ICAO airports list */}
                {Array.isArray(routing.icaoAirports) && routing.icaoAirports.length > 0 && (
                  <div className="flex flex-col mt-2">
                    <span>ICAO Airports:</span>
                    {routing.icaoAirports.map((icao, idx) => (
                      <div key={idx} className="flex items-center space-x-1 bg-red-300">
                        <span>{icao}</span>
                        {/* Display the color dot for each ICAO airport */}
                        <span
                          className={`ml-2 ${airportCategories?.[icao]?.color || 'text-gray-500'}`}
                          style={{ fontSize: '1.5rem' }}
                        >
                          &#9679;
                        </span>
                        <span className="text-sm">{airportCategories?.[icao]?.category || 'Unknown'}</span> {/* Add category display */}
                      </div>
                    ))}
                  </div>
                )}





              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the routing click
                  onDeleteRouting(index); // Call the delete function
                }}
                className="flex items-center ml-1 relative"
              >
                <div className='shadow-sm border hover:scale-110 transition-transform duration-150 px-1'>
                  x
                </div>
              </button>
            </div>
          ))}
        </div>


      </div>
    </div>
  );
}
