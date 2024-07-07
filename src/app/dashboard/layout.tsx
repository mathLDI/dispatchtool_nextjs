'use client';

import React, { useState } from 'react';
import SideNav from '@/app/ui/dashboard/sidenav';
import { RccProvider } from './RccCalculatorContext';
import { createPortal } from 'react-dom';
import GlobalModalContent from '../lib/component/GlobalModalContent';
import { CalculatorIcon } from '@heroicons/react/outline';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false); // New state for pinning the SideNav

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
  };

  const mainContentStyle: React.CSSProperties = {
    marginLeft: isHovered || isPinned ? '200px' : '20px', // Adjust marginLeft based on SideNav state
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px',
    overflow: 'auto',
  };

  return (
    <RccProvider>
      <div className="flex min-h-screen">
        <div
          style={sideNavStyles}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <SideNav />
          <div style={pinIconStyle} onClick={togglePin}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 7.75L11 6.5m0 0l1.25 1.25m0 0L15 5m-3-1.5V2m0 1.5L9.5 6m1.25 1.25l-4.75 4.75a1.5 1.5 0 000 2.121l2.122 2.122a1.5 1.5 0 002.121 0l4.75-4.75m1.25-1.25L21 9.5V15a2 2 0 01-2 2h-6a2 2 0 01-2-2v-2a2 2 0 00-2-2H5.5"/>
            </svg>
          </div>
        </div>
        <div style={mainContentStyle}>
          {children}
          <button onClick={() => setShowModal(true)} className="fixed bottom-4 right-4 px-4 py-2 bg-blue-500 text-white rounded flex items-center">
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