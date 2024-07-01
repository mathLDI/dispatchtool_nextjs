"use client"

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

  return (
    <RccProvider>
      <div className="flex flex-col md:flex-row md:overflow-auto min-h-screen">
        <div className="w-full flex-none md:w-64 ">
          <SideNav />
        </div>
        <div className="flex-grow flex justify-center items-center p-6 md:overflow-y-auto md:p-12">
          {children}
          <button onClick={() => setShowModal(true)} className="fixed bottom-4 right-4 px-4 py-2 bg-blue-500 text-white rounded flex items-center">
            X-Wind
            <CalculatorIcon className="h-5 w-5 text-white ml-2" />
          </button>
        </div>
      </div>
      {showModal && createPortal(
        <>
          <div className="fixed inset-0 z-40 bg-transparent pointer-events-none"></div>
          <GlobalModalContent onClose={() => setShowModal(false)} />
        </>,
        document.body
      )}
    </RccProvider>
  );
};

export default Layout;
