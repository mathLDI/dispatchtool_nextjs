"use client"

// src/app/dashboard/layout.tsx

import React from 'react';
import SideNav from '@/app/ui/dashboard/sidenav';
import { RccProvider } from './RccCalculatorContext'; // Use relative path

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <RccProvider>
      <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
        <div className="w-full flex-none md:w-64">
          <SideNav />
        </div>
        <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
      </div>
    </RccProvider>
  );
};

export default Layout;
