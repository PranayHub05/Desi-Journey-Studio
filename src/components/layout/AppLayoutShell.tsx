'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { GlobalSearchModal } from './GlobalSearchModal';
import { useApp } from '../../context/AppContext';
import { Loader2 } from 'lucide-react';

export const AppLayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isHydrated } = useApp();

  const isLoginPage = pathname === '/login';
  const isPublicPreview = pathname.includes('/preview');
  const isPublicRoute = isLoginPage || isPublicPreview;

  useEffect(() => {
    if (!isHydrated) return;

    if (!currentUser && !isPublicRoute) {
      router.replace('/login');
    } else if (currentUser && isLoginPage) {
      router.replace('/');
    }
  }, [currentUser, isHydrated, isPublicRoute, isLoginPage, router]);

  // Loading splash while checking session & hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-stone-canvas text-forest-900">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-2xl bg-white p-2 border border-stone-200 shadow-md flex items-center justify-center">
            <img
              src="/images/desi-journey-logo.png"
              alt="Desi Journey"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="flex items-center gap-2.5 text-stone-600 text-xs font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-forest-700" />
            <span>Connecting to Desi Journey Studio...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in and on a protected page: show clean redirect splash
  if (!currentUser && !isPublicRoute) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-stone-canvas text-forest-900">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-xl bg-white p-2 border border-stone-200 shadow-sm flex items-center justify-center">
            <img
              src="/images/desi-journey-logo.png"
              alt="Desi Journey"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-forest-600" />
            <span>Redirecting to Login...</span>
          </div>
        </div>
      </div>
    );
  }

  // Public standalone layout (Login screen or client Itinerary PDF preview)
  if (isPublicRoute) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-stone-canvas">
        {children}
      </div>
    );
  }

  // Authenticated workspace with full navigation & quick tools
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
