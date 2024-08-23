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
}

export default function SideNav({ savedRoutings = [], showWeatherAndRcam = true, showLogo = true, showPrinterIcon = true }: SideNavProps) {
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
                'p-2 bg-gray-100 rounded-md mb-2 cursor-pointer hover:bg-sky-100 hover:text-blue-600',
                {
                  'bg-sky-100 text-blue-600': selectedRouting === routing,
                }
              )}
              onClick={() => handleRoutingClick(routing)}
            >
              <p className="font-bold">{routing.flightNumber}</p>
              <p>{routing.departure} → {routing.destination}</p>
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
