import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import { Sidebar } from '../components/layout/Sidebar';
import { TopNavbar } from '../components/layout/TopNavbar';
import { GlobalSearchModal } from '../components/layout/GlobalSearchModal';

export const metadata: Metadata = {
  title: 'Desi Journey Studio — Bespoke Travel CRM & Itinerary Operations',
  description:
    'Production-grade itinerary builder, wholesale rate engine, proposal generator, and tour operations platform for Indian travel agencies.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-stone-canvas text-forest-900 min-h-screen flex antialiased">
        <AppProvider>
          {/* Persistent Left Sidebar */}
          <Sidebar />

          {/* Main App Container */}
          <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
            <TopNavbar />
            <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>

          {/* Global Search Dialog */}
          <GlobalSearchModal />
        </AppProvider>
      </body>
    </html>
  );
}
