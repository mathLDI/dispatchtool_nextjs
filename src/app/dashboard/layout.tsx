'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import SideNav from '@/app/ui/dashboard/sidenav';
import GlobalModalContent from '../lib/component/GlobalModalContent';
import { ChevronDoubleRightIcon, ChevronDoubleLeftIcon, CalculatorIcon } from '@heroicons/react/outline'; // Import the new icons
import { Analytics } from "@vercel/analytics/react";
import { roboto } from '../ui/fonts';
import { useRccContext } from './RccCalculatorContext';


interface LayoutProps {
  children: React.ReactNode;
}

interface AirportCategory {
  category: 'VFR' | 'MVFR' | 'IFR' | 'LIFR' | 'Unknown';
  color: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { airportCategories,
    changedAirports,
    setChangedAirports

  } = useRccContext();

  const [isXWindModalOpen, setIsXWindModalOpen] = useState(false);
  const [isRccNotProvidedModalOpen, setIsRccNotProvidedModalOpen] = useState(false);
  const [isRccProvidedModalOpen, setIsRccProvidedModalOpen] = useState(false);
  const [isQuickSearchModalOpen, setIsQuickSearchModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(true);
  const [hasShownWarning, setHasShownWarning] = useState(false);
  const previousCategoriesRef = useRef<Record<string, AirportCategory>>({});

  const togglePin = () => setIsPinned(!isPinned);

  const sideNavStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    bottom: 0,
    width: '200px',
    backgroundColor: 'white',
    transition: 'transform 0.3s ease',
    transform: isHovered || isPinned ? 'translateX(0)' : `translateX(-${200 - 20}px)`,
    overflowY: 'auto',
  };

  const pinIconStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    cursor: 'pointer',
    color: 'white',
  };

  const mainContentStyle: React.CSSProperties = {
    marginLeft: isHovered || isPinned ? '200px' : '20px',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '5px',
    fontFamily: 'Roboto, sans-serif',
    fontSize: '12px',
    lineHeight: '1.25',
  };




  // Detect specific category changes in airportCategories

  // Add timestamp tracking ref
  const categoryTimestampsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    // Guard clauses for empty states
    if (Object.keys(airportCategories).length === 0) return;
    if (Object.keys(previousCategoriesRef.current).length === 0) {
      previousCategoriesRef.current = { ...airportCategories };
      return;
    }

    const currentTime = Date.now();
    const fiftyNineMinutes = 59 * 60 * 1000; // 59 minutes in milliseconds

    const updatedAirports = Object.keys(airportCategories).filter(airportCode => {
      const prevCategory = previousCategoriesRef.current[airportCode]?.category;
      const newCategory = airportCategories[airportCode]?.category;
      const lastChangeTime = categoryTimestampsRef.current[airportCode] || 0;
      const timeSinceLastChange = currentTime - lastChangeTime;

      if (!prevCategory || !newCategory) return false;
      if (changedAirports.includes(airportCode)) return false;
      if (timeSinceLastChange < fiftyNineMinutes) return false;

      const hasChanged = (
        prevCategory !== newCategory &&
        (prevCategory === 'VFR' || prevCategory === 'MVFR') &&
        (newCategory === 'IFR' || newCategory === 'LIFR')
      );

      if (hasChanged) {
        categoryTimestampsRef.current[airportCode] = currentTime;
      }

      return hasChanged;
    });

    if (updatedAirports.length > 0) {
      setChangedAirports(Array.from(new Set([...changedAirports, ...updatedAirports])));
      setHasShownWarning(true);
    }

    previousCategoriesRef.current = { ...airportCategories };
  }, [airportCategories, changedAirports, setChangedAirports]);

  const handleCloseModal = () => {
    setChangedAirports([]);
    setHasShownWarning(false);
  };

  // UseEffect to listen for CTRL + Q shortcut to open/close Quick Search Modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if CTRL + Q is pressed
      if (event.ctrlKey && event.key === 'q') {
        event.preventDefault(); // Prevent the default action
        setIsQuickSearchModalOpen((prevState) => !prevState); // Toggle the Quick Search modal
      }
    };

    // Attach the event listener to the document
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Empty dependency array ensures this effect runs only once when the component mounts

  useEffect(() => {
    if (changedAirports.length > 0 && !hasShownWarning) {
      setHasShownWarning(true);
    }
  }, [changedAirports, hasShownWarning]);

  return (
    <div className={`flex min-h-screen ${roboto.className}`}>
      <div
        style={sideNavStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <SideNav
          showWeatherAndRcam={true}
          showLogo={true}
          savedRoutings={[]}
          onDeleteRouting={() => { /* handle delete */ }}
          airportCategories={airportCategories}
        />

        <div style={pinIconStyle} onClick={togglePin}>
          {isPinned ? (
            <ChevronDoubleRightIcon className="h-6 w-6" />
          ) : (
            <ChevronDoubleLeftIcon className="h-6 w-6" />
          )}
        </div>
      </div>

      <div style={mainContentStyle}>
        {children}
        <div className="fixed bottom-4 right-4 flex space-x-4">
          <button
            onClick={() => setIsXWindModalOpen(!isXWindModalOpen)}
            className={`px-4 py-2 rounded ${isXWindModalOpen ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
          >
            <span className="flex items-center">
              X-Wind
              <CalculatorIcon className="h-5 w-5 text-white ml-2" />
            </span>
          </button>
          <button
            onClick={() => setIsRccNotProvidedModalOpen(!isRccNotProvidedModalOpen)}
            className={`px-4 py-2 rounded ${isRccNotProvidedModalOpen ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
          >
            <span className="flex items-center">
              RCC Not Provided
              <CalculatorIcon className="h-5 w-5 text-white ml-2" />
            </span>
          </button>
          <button
            onClick={() => setIsRccProvidedModalOpen(!isRccProvidedModalOpen)}
            className={`px-4 py-2 rounded ${isRccProvidedModalOpen ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
          >
            <span className="flex items-center">
              RCC Provided
              <CalculatorIcon className="h-5 w-5 text-white ml-2" />
            </span>
          </button>
          {/* New Quick Search Button */}
          <button
            onClick={() => setIsQuickSearchModalOpen(!isQuickSearchModalOpen)}
            className={`px-4 py-2 rounded ${isQuickSearchModalOpen ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
          >
            <span className="flex items-center">
              Quick Search
              <CalculatorIcon className="h-5 w-5 text-white ml-2" />
            </span>
          </button>
        </div>
      </div>

      {/* Portal for modals */}
      {isXWindModalOpen && createPortal(
        <GlobalModalContent onClose={() => setIsXWindModalOpen(false)} contentType="x-wind" />,
        document.body
      )}

      {isRccNotProvidedModalOpen && createPortal(
        <GlobalModalContent onClose={() => setIsRccNotProvidedModalOpen(false)} contentType="rcc-not-provided" />,
        document.body
      )}

      {isRccProvidedModalOpen && createPortal(
        <GlobalModalContent onClose={() => setIsRccProvidedModalOpen(false)} contentType="rcc-provided" />,
        document.body
      )}

      {isQuickSearchModalOpen && createPortal(
        <GlobalModalContent onClose={() => setIsQuickSearchModalOpen(false)} contentType='Quick Search' />,
        document.body
      )}

      {/* Changed Airport Modal */}
      {changedAirports.length > 0 && hasShownWarning && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg space-y-4">
            <h2 className="text-lg font-bold mb-4">Airport Category Changes</h2>
            {changedAirports.map(code => (
              <p key={code}>
                {code} is now{' '}
                <span className={airportCategories[code]?.color || ''}>
                  {airportCategories[code]?.category || 'Unknown'}
                </span>
              </p>
            ))}
            <button
              onClick={handleCloseModal}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}

      <Analytics />
    </div>
  );
};

export default Layout;
