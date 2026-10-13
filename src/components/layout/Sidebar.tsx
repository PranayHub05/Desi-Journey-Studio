'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  LayoutDashboard,
  Users,
  Map,
  Hotel as HotelIcon,
  Car,
  MapPin,
  Truck,
  CalendarDays,
  BarChart3,
  Settings,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { leads, quotations, currentUser } = useApp();

  const urgentFollowUpsCount = leads.filter(
    (l) => l.status === 'Follow-up' || l.status === 'New'
  ).length;

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Leads & Guests',
      href: '/leads',
      icon: Users,
      badge: urgentFollowUpsCount > 0 ? `${urgentFollowUpsCount}` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      label: 'Itineraries & Quotes',
      href: '/itineraries',
      icon: Map,
      badge: `${quotations.length}`,
      badgeColor: 'bg-forest-100 text-forest-800',
    },
    {
      label: 'Hotel Database',
      href: '/hotels',
      icon: HotelIcon,
      badge: null,
    },
    {
      label: 'Vehicles & Fleet',
      href: '/vehicles',
      icon: Car,
      badge: null,
    },
    {
      label: 'Destinations & Sights',
      href: '/destinations',
      icon: MapPin,
      badge: null,
    },
    {
      label: 'Suppliers & Ledger',
      href: '/suppliers',
      icon: Truck,
      badge: null,
    },
    {
      label: 'Tour Calendar & Ops',
      href: '/calendar',
      icon: CalendarDays,
      badge: null,
    },
    {
      label: 'Reports & Revenue',
      href: '/reports',
      icon: BarChart3,
      badge: null,
    },
    {
      label: 'Settings & Profile',
      href: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="no-print w-64 min-h-screen bg-forest-900 text-stone-100 flex flex-col border-r border-forest-800/40 select-none flex-shrink-0 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-forest-800/60 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-forest-600 flex items-center justify-center shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">Desi Journey</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-400 border border-gold-500/30">
                Studio
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-medium">Bespoke Travel OS</p>
          </div>
        </Link>
      </div>

      {/* Quick Action Button */}
      <div className="px-4 pt-4 pb-2">
        <Link
          href="/itineraries/builder"
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs tracking-wide shadow-md transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Itinerary Studio</span>
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
          Core Workspaces
        </div>
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-forest-800 text-white border-l-4 border-gold-500 pl-2 shadow-sm'
                  : 'text-stone-300 hover:bg-forest-800/40 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <item.icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-gold-400' : 'text-stone-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Card & Active Role */}
      {/* User Card & Active Role */}
      <div className="p-3.5 border-t border-forest-800/60 bg-forest-900/60">
        {currentUser ? (
          <div className="p-2 rounded-lg bg-forest-800/40 border border-forest-700/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-forest-700 flex items-center justify-center text-xs font-bold text-gold-400 border border-gold-500/20">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{currentUser.name}</p>
                  <div className="flex items-center gap-1 text-[10px] text-stone-400 capitalize">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{currentUser.role === 'admin' ? 'Admin: Full Access' : `${currentUser.role} Role`}</span>
                  </div>
                </div>
              </div>
              <Link
                href="/settings"
                title="Configure settings"
                className="text-stone-400 hover:text-white p-1 rounded"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="pt-1.5 border-t border-forest-700/30 flex justify-between items-center text-[10px]">
              <span className="text-stone-400">{currentUser.title || 'Staff'}</span>
              <Link
                href="/login"
                className="text-gold-400 hover:text-gold-300 font-semibold"
                title="Switch team member"
              >
                Switch Portal →
              </Link>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-forest-800 text-gold-400 text-xs font-bold"
          >
            Log In to Studio
          </Link>
        )}
      </div>
    </aside>
  );
};
