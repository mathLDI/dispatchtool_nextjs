'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import SideNav from '@/app/ui/dashboard/sidenav';
import GlobalModalContent from '../lib/component/GlobalModalContent';
import { ChevronDoubleRightIcon, ChevronDoubleLeftIcon, CalculatorIcon, MoonIcon, SunIcon } from '@heroicons/react/outline';
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
  const { airportCategories, changedAirports, setChangedAirports, darkMode, setDarkMode, flightCategoryWarningEnabled } = useRccContext();

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, [setDarkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', (!darkMode).toString());
    document.documentElement.classList.toggle('dark');
  };

  const modalContainerRef = useRef<HTMLDivElement>(null);

  const renderModal = (isOpen: boolean, content: React.ReactNode) => {
    if (!isOpen || !modalContainerRef.current) return null;
    return createPortal(content, modalContainerRef.current);
  };

  const [isXWindModalOpen, setIsXWindModalOpen] = useState(false);
  const [isRccNotProvidedModalOpen, setIsRccNotProvidedModalOpen] = useState(false);
  const [isRccProvidedModalOpen, setIsRccProvidedModalOpen] = useState(false);
  const [isQuickSearchModalOpen, setIsQuickSearchModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(true);
  const [hasShownWarning, setHasShownWarning] = useState(false);
  const previousCategoriesRef = useRef<Record<string, AirportCategory>>({});
  const warningTimestampsRef = useRef<Record<string, number>>({});

  const togglePin = () => setIsPinned(!isPinned);

  const sideNavStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    bottom: 0,
    width: '200px',
    backgroundColor: darkMode ? '#1a1a1a' : 'white',
    transition: 'transform 0.3s ease, background-color 0.3s ease',
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
    backgroundColor: darkMode ? '#121212' : '#d6dbdc',
    color: darkMode ? 'white' : 'black',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  };

  const categoryTimestampsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (Object.keys(airportCategories).length === 0) return;
    if (Object.keys(previousCategoriesRef.current).length === 0) {
      previousCategoriesRef.current = { ...airportCategories };
      return;
    }

    const currentTime = Date.now();

    const updatedAirports = Object.keys(airportCategories).filter(airportCode => {
      const prevCategory = previousCategoriesRef.current[airportCode]?.category;
      const newCategory = airportCategories[airportCode]?.category;
      // Note: we no longer gate initial warnings by elapsed time;
      // auto-dismiss is handled separately below.

      if (!prevCategory || !newCategory) return false;
      // Avoid duplicate warnings while active
      if (changedAirports.includes(airportCode)) return false;

      // Additional barrier to prevent warnings for VFR and MVFR
      if (newCategory === 'VFR' || newCategory === 'MVFR') return false;

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
      // Track when each warning was first shown
      updatedAirports.forEach(code => {
        if (!warningTimestampsRef.current[code]) {
          warningTimestampsRef.current[code] = currentTime;
        }
      });
      setChangedAirports(Array.from(new Set([...changedAirports, ...updatedAirports])));
      setHasShownWarning(true);
    }

    previousCategoriesRef.current = { ...airportCategories };
  }, [airportCategories, changedAirports, setChangedAirports]);

  // Remove warnings that have gone back to VFR
  useEffect(() => {
    if (changedAirports.length === 0) return;

    const airportsToRemove = changedAirports.filter(code => {
      const currentCategory = airportCategories[code]?.category;
      return currentCategory === 'VFR';
    });

    if (airportsToRemove.length > 0) {
      const filteredAirports = changedAirports.filter(code => !airportsToRemove.includes(code));
      setChangedAirports(filteredAirports);
      airportsToRemove.forEach(code => {
        delete warningTimestampsRef.current[code];
      });
    }
  }, [airportCategories, changedAirports, setChangedAirports]);

  // Clear warnings when flight category warning is disabled
  useEffect(() => {
    if (!flightCategoryWarningEnabled && changedAirports.length > 0) {
      setChangedAirports([]);
      setHasShownWarning(false);
      warningTimestampsRef.current = {};
    }
  }, [flightCategoryWarningEnabled, changedAirports, setChangedAirports]);

  const handleCloseModal = () => {
    setChangedAirports([]);
    setHasShownWarning(false);
    // Clear warning timestamps when modal is closed
    warningTimestampsRef.current = {};
  };

  // UseEffect to listen for CTRL + Q shortcut to open/close Quick Search Modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if CTRL + Q is pressed
      if (event.ctrlKey && event.key === 'q') {
        event.preventDefault();
        setIsQuickSearchModalOpen((prevState) => !prevState);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (changedAirports.length > 0 && !hasShownWarning) {
      setHasShownWarning(true);
    }
  }, [changedAirports, hasShownWarning]);

  // Auto-dismiss warnings older than 59 minutes
  useEffect(() => {
    if (changedAirports.length === 0) return;

    const autoDisposeTimer = setInterval(() => {
      const currentTime = Date.now();
      const fiftyNineMinutes = 59 * 60 * 1000;

      const activeWarnings = changedAirports.filter(code => {
        const warningTime = warningTimestampsRef.current[code];
        if (!warningTime) return true;
        return currentTime - warningTime < fiftyNineMinutes;
      });

      // If all warnings have expired, auto-dismiss
      if (activeWarnings.length === 0 && changedAirports.length > 0) {
        handleCloseModal();
      } else if (activeWarnings.length < changedAirports.length) {
        // Remove expired warnings from the list
        setChangedAirports(activeWarnings);
        // Clean up expired timestamps
        changedAirports.forEach(code => {
          if (!activeWarnings.includes(code)) {
            delete warningTimestampsRef.current[code];
          }
        });
      }
    }, 1000); // Check every second

    return () => clearInterval(autoDisposeTimer);
  }, [changedAirports, setChangedAirports, handleCloseModal]);

  return (
    <div className={`flex min-h-screen ${roboto.className} ${darkMode ? 'dark' : ''}`}>
      <div
        style={sideNavStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <SideNav
          showWeatherAndRcam={true}
          showLogo={true}
          savedRoutings={[]}
          onDeleteRouting={() => { }}
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
          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={() => setIsXWindModalOpen(!isXWindModalOpen)}
            className={`px-4 py-2 rounded ${isXWindModalOpen
                ? 'bg-blue-500 text-white'
                : darkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
          >
            <span className="flex items-center">
              X-Wind
              <CalculatorIcon className="h-5 w-5 ml-2" />
            </span>
          </button>


          <button
            onClick={() => setIsRccNotProvidedModalOpen(!isRccNotProvidedModalOpen)}
            className={`px-4 py-2 rounded ${isRccNotProvidedModalOpen
                ? 'bg-blue-500 text-white'
                : darkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
          >
            <span className="flex items-center">
              RCC Not Provided
              <CalculatorIcon className="h-5 w-5 ml-2" />
            </span>
          </button>





          <button
            onClick={() => setIsRccProvidedModalOpen(!isRccProvidedModalOpen)}
            className={`px-4 py-2 rounded ${isRccProvidedModalOpen
                ? 'bg-blue-500 text-white'
                : darkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
          >
            <span className="flex items-center">
              RCC Provided
              <CalculatorIcon className="h-5 w-5 ml-2" />
            </span>
          </button>

          <button
            onClick={() => setIsQuickSearchModalOpen(!isQuickSearchModalOpen)}
            className={`px-4 py-2 rounded ${isQuickSearchModalOpen
                ? 'bg-blue-500 text-white'
                : darkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
          >
            <span className="flex items-center">
              Quick Search
              <CalculatorIcon className="h-5 w-5 ml-2" />
            </span>
          </button>

        </div>
      </div>

      {/* Add modal container div */}
      <div ref={modalContainerRef} className="modal-container">
        {/* Render modals using renderModal helper */}
        {renderModal(
          isXWindModalOpen,
          <GlobalModalContent
            onClose={() => setIsXWindModalOpen(false)}
            contentType="x-wind"
          />
        )}
        {renderModal(
          isRccNotProvidedModalOpen,
          <GlobalModalContent
            onClose={() => setIsRccNotProvidedModalOpen(false)}
            contentType="rcc-not-provided"
          />
        )}
        {renderModal(
          isRccProvidedModalOpen,
          <GlobalModalContent
            onClose={() => setIsRccProvidedModalOpen(false)}
            contentType="rcc-provided"
          />
        )}
        {renderModal(
          isQuickSearchModalOpen,
          <GlobalModalContent
            onClose={() => setIsQuickSearchModalOpen(false)}
            contentType="Quick Search"
          />
        )}
        {renderModal(
          flightCategoryWarningEnabled && changedAirports.length > 0 && hasShownWarning && changedAirports.some(code =>
            airportCategories[code]?.category === 'IFR' || airportCategories[code]?.category === 'LIFR'
          ),
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded shadow-lg space-y-4`}>
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
                className={`mt-4 px-4 py-2 ${darkMode
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-500 hover:bg-blue-600'
                  } text-white rounded`}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <Analytics />
    </div>
  );
};

export default Layout;