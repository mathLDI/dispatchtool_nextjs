import React from 'react';
import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { PrinterIcon } from '@heroicons/react/outline';
import { useRccContext } from '@/app/dashboard/RccCalculatorContext';

type Routing = {
  flightNumber: string;
  departure: string;
  destination: string;
};

interface SideNavProps {
  savedRoutings: Routing[];
  showWeatherAndRcam?: boolean; // Prop to control whether to show the Weather and RCAM PDF links
  showLogo?: boolean; // New prop to control whether to show the logo
  showPrinterIcon?: boolean; // New prop to control whether to show the PrinterIcon
}

export default function SideNav({ 
  savedRoutings = [], 
  showWeatherAndRcam = true, 
  showLogo = true,
  showPrinterIcon = true // Default to true, but can be set to false in ClientComponent
}: SideNavProps) {
  const { flightDetails } = useRccContext();

  return (
    <div className="flex h-full flex-col px-2 py-2 md:px-1">
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
        
        {/* Display current flight details if any */}
        {flightDetails.flightNumber && flightDetails.departure && flightDetails.destination && (
          <div className="flex items-center justify-between space-x-2 p-2 bg-gray-100 rounded-md shadow-sm">
            <span>{flightDetails.flightNumber}</span>
            <span>{flightDetails.departure}</span>
            <span>{flightDetails.destination}</span>
          </div>
        )}
        
        {/* Display saved routings */}
        <div className="mt-4">
          {savedRoutings.map((routing, index) => (
            <div key={index} className="p-2 bg-gray-100 rounded-md mb-2">
              <p className="font-bold">{routing.flightNumber}</p>
              <p>{routing.departure} → {routing.destination}</p>
            </div>
          ))}
        </div>
        
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
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
