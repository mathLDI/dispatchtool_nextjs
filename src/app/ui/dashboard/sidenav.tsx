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
    <div className="flex flex-col px-1 py-1 md:px-1 overflow-y-auto" style={{ lineHeight: '1.0' }}> {/* Reduced line spacing */}
      <div>

        {showLogo && (
          <Link
            className="mb-1 flex  items-end justify-start rounded-md bg-blue-600  md:h-32"
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
        <div className="flex-1 overflow-y-auto max-h-screen"> {/* Added overflow-y-auto and max-height constraint */}
          {[...savedRoutings].reverse().map((routing, reverseIndex) => {
            const originalIndex = savedRoutings.length - 1 - reverseIndex; // Calculate the original index

            return (
              <div
                key={originalIndex}
                className={clsx(
                  ' bg-gray-100 rounded-md mb-1 flex justify-between items-center cursor-pointer hover:bg-sky-100 hover:text-blue-600',
                  {
                    'bg-sky-100 text-blue-600': selectedRouting === routing,
                  }
                )}
                onClick={() => handleRoutingClick(routing)}
              >
                <div>
                  <p className="font-bold mb-0">
                    Flight: {routing.flightNumber}
                  </p>


                  {/* Display ICAO airports list in a responsive row/column layout with max-width */}
                  {Array.isArray(routing.icaoAirports) && routing.icaoAirports.length > 0 && (
                    <div className="flex flex-col">
                      <div className="flex flex-wrap gap-1" style={{ maxWidth: '100px' }}> {/* Add maxWidth here */}
                        {routing.icaoAirports.map((icao, idx) => (
                          <div key={idx} className="flex items-center ">

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

                  {/* Display ICAO Alternate airports list in a responsive row/column layout with max-width */}
                  {Array.isArray(routing.icaoAirportALTN) && routing.icaoAirportALTN.length > 0 && (
                    <div className="flex flex-col ">
                      <span>Alternate Airports:</span>
                      <div className="flex flex-wrap " style={{ maxWidth: '100px' }}> {/* Add maxWidth here */}
                        {routing.icaoAirportALTN.map((icao, idx) => (
                          <div key={idx} className="flex items-center ">
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
                  <div className='shadow-sm border hover:scale-110 transition-transform duration-150 '>
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
