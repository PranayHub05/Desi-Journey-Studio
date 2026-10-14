import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import { AppLayoutShell } from '../components/layout/AppLayoutShell';

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
      <body className="bg-stone-canvas text-forest-900 min-h-screen antialiased">
        <AppProvider>
          <AppLayoutShell>{children}</AppLayoutShell>
        </AppProvider>
      </body>
    </html>
  );
}
