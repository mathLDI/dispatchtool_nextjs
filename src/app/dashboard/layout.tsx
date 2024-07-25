'use client';

import React, { useState } from 'react';
import SideNav from '@/app/ui/dashboard/sidenav';
import { RccProvider } from './RccCalculatorContext';
import { createPortal } from 'react-dom';
import GlobalModalContent from '../lib/component/GlobalModalContent';
import { LockClosedIcon, LockOpenIcon, CalculatorIcon } from '@heroicons/react/outline';
import { inter, lusitana, roboto } from '../ui/fonts';
interface LayoutProps {/*...*/}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
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
    marginLeft: isHovered || isPinned ? '200px' : '20px', // Adjust marginLeft based on SideNav state
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px',
    overflow: 'auto',
    fontFamily: 'Roboto, sans-serif', // Set Roboto as the main font
  };

  return (
    <RccProvider>
      <div className={`flex min-h-screen ${roboto.className}`}>
        <div
          style={sideNavStyles}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <SideNav />
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
          <button onClick={() => setShowModal(!showModal)} className="fixed bottom-4 right-4 px-4 py-2 bg-blue-500 text-white rounded flex items-center">
            X-Wind
            <CalculatorIcon className="h-5 w-5 text-white ml-2" />
          </button>
        </div>
      </div>
      {showModal && createPortal(
        <GlobalModalContent onClose={() => setShowModal(false)} />,
        document.body
      )}
    </RccProvider>
  );
};

export default Layout;