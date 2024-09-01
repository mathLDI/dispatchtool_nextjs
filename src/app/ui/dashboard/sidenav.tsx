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
    });
    setSelectedRouting(routing);
  };

  console.log("savedrouting from sidenav", savedRoutings);
  console.log("airportCategories from sidenav:", airportCategories);

  return (
    <div className="flex h-full flex-col px-2 py-2 md:px-1 overflow-y-auto">
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

        {/* Optional printer icon and sign-out button */}
        {showPrinterIcon && (
          <form>
            <button className="flex h-[40px] w-full grow items-center justify-center gap-1 
              rounded-md bg-gray-50 p-2 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 
              md:flex-none md:justify-start md:p-1 md:px-2">
              <PrinterIcon className="w-5" />
              <div className="hidden md:block">Sign Out</div>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
