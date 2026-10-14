'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { GlobalSearchModal } from './GlobalSearchModal';

export const AppLayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isStandalone = pathname === '/login';

  if (isStandalone) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-stone-canvas">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <TopNavbar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Quick Search Modal */}
      <GlobalSearchModal />
    </div>
  );
};
