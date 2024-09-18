'use client';

import React, { useState } from 'react';
import SideNav from '@/app/ui/dashboard/sidenav';
import { RccProvider } from './RccCalculatorContext';
import { createPortal } from 'react-dom';
import GlobalModalContent from '../lib/component/GlobalModalContent';
import { LockClosedIcon, LockOpenIcon, CalculatorIcon } from '@heroicons/react/outline';
import { inter, lusitana, roboto } from '../ui/fonts';

interface LayoutProps {
  children: React.ReactNode;
  // ... other properties
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isXWindModalOpen, setIsXWindModalOpen] = useState(false);
  const [isRccNotProvidedModalOpen, setIsRccNotProvidedModalOpen] = useState(false);
  const [isRccProvidedModalOpen, setIsRccProvidedModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(true); // New state for pinning the SideNav

  const togglePin = () => setIsPinned(!isPinned);

  const sideNavStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    bottom: 0,
    width: '200px',
    backgroundColor: 'white',
    transition: 'transform 0.3s ease',
    transform: isHovered || isPinned ? 'translateX(0)' : `translateX(-${200 - 20}px)`,
  };

  const pinIconStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    cursor: 'pointer',
    color: 'white', // This will ensure SVG icons inherit this color as their fill
  };

  const mainContentStyle: React.CSSProperties = {
    marginLeft: isHovered || isPinned ? '200px' : '20px',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px',
    overflow: 'auto',
    fontFamily: 'Roboto, sans-serif',
    fontSize: '10px', // Add this line to reduce the font size
    lineHeight: '1.0', // Reduce line spacing

  };
  

  return (
    <RccProvider>
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
            onDeleteRouting={() => { /* handle delete */ }}  // Add a suitable function for routing deletion
            airportCategories={{}} // Pass a valid categories object or array
          />
          <div style={pinIconStyle} onClick={togglePin}>
            {isPinned ? (
              <LockClosedIcon className="h-6 w-6" />
            ) : (
              <LockOpenIcon className="h-6 w-6" />
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
          </div>
        </div>
      </div>

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
    </RccProvider>
  );
};

export default Layout;
