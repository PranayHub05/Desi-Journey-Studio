'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Clock,
  RotateCcw,
  UserCheck,
  MapPin,
  Check,
  ChevronDown,
  Database,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const TopNavbar: React.FC = () => {
  const {
    currentUser,
    setCurrentUserRole,
    resetDemoData,
    setIsSearchOpen,
    logout,
    firestoreStatus,
    firestoreError,
  } = useApp();

  const [istTime, setIstTime] = useState<string>('');
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Live IST Clock (Asia/Kolkata)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const dateStr = now.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
      });
      setIstTime(`${timeStr} IST • ${dateStr}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut ⌘K or Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'admin', label: 'Admin / Agency Owner', desc: 'Full access to costing, margins & master settings' },
    { role: 'sales', label: 'Sales & Itinerary Planner', desc: 'Guest CRM, day editor & proposal sharing' },
    { role: 'ops', label: 'Operations & Dispatch', desc: 'Confirmed trips, chauffeurs, vouchers & manifest' },
    { role: 'finance', label: 'Accounts & Finance', desc: 'Advances, customer receipts & supplier ledger' },
  ];

  return (
    <>
      <header className="no-print h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        {/* Left: Global Search Pill */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-stone-500 text-xs transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-stone-400 group-hover:text-forest-700" />
              <span>Search guests, quotes, hotels, routes...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-stone-400 bg-white border border-stone-200 rounded shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Controls: Firestore Status, IST Clock, Quick Create, User Account */}
        <div className="flex items-center gap-3">
          {/* Live Firestore Connection Status */}
          <Link
            href="/settings"
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors ${
              firestoreStatus === 'connected'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : firestoreStatus === 'syncing'
                ? 'bg-sky-50 border-sky-200 text-sky-800 animate-pulse'
                : firestoreStatus === 'error'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}
            title={
              firestoreStatus === 'connected'
                ? 'Cloud Firestore Connected (Project: desijourneystudio)'
                : firestoreStatus === 'error'
                ? firestoreError || 'Permission denied. Update Firestore Rules in Firebase Console.'
                : 'Firestore database status'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                firestoreStatus === 'connected'
                  ? 'bg-emerald-500'
                  : firestoreStatus === 'syncing'
                  ? 'bg-sky-500 animate-ping'
                  : firestoreStatus === 'error'
                  ? 'bg-amber-500'
                  : 'bg-stone-400'
              }`}
            />
            <span className="font-semibold">
              {firestoreStatus === 'connected'
                ? 'Firestore Live'
                : firestoreStatus === 'syncing'
                ? 'Syncing Cloud...'
                : firestoreStatus === 'error'
                ? 'Firestore Rules Lock'
                : 'Firestore Offline'}
            </span>
          </Link>

          {/* Live Indian Standard Time */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 border border-forest-100 text-[11px] font-medium text-forest-800">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="tabular-nums">{istTime}</span>
          </div>

          {/* Quick Create Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCreateDropdown(!showCreateDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-800 hover:bg-forest-700 text-white text-xs font-medium shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Quick Create</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {showCreateDropdown && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowCreateDropdown(false)}
                />
                <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-elevated border border-stone-200 py-1.5 z-30 text-xs animate-in fade-in slide-in-from-top-1">
                  <Link
                    href="/itineraries/builder"
                    onClick={() => setShowCreateDropdown(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-forest-50 text-forest-900 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>New Trip Itinerary</span>
                  </Link>
                  <Link
                    href="/leads"
                    onClick={() => setShowCreateDropdown(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-forest-50 text-forest-900 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>New Guest Enquiry</span>
                  </Link>
                  <Link
                    href="/hotels"
                    onClick={() => setShowCreateDropdown(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-forest-50 text-forest-900 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span>Add Hotel Property</span>
                  </Link>
                  <Link
                    href="/payments"
                    onClick={() => setShowCreateDropdown(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-forest-50 text-forest-900 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-gold-500" />
                    <span>Record Advance Payment</span>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* User Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-forest-800 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-forest-900 leading-tight truncate max-w-[130px]">
                  {currentUser?.name || 'Vikas Sharma'}
                </div>
                <div className="text-[10px] text-stone-400 capitalize leading-tight">
                  {currentUser?.role === 'admin' ? 'Admin' : currentUser?.title || currentUser?.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 ml-0.5" />
            </button>

            {showRoleDropdown && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowRoleDropdown(false)}
                />
                <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-elevated border border-stone-200 p-2 z-30 text-xs animate-in fade-in slide-in-from-top-1">
                  <div className="p-2 border-b border-stone-100">
                    <p className="font-bold text-forest-900 truncate">{currentUser?.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{currentUser?.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-forest-100 text-forest-800">
                      Role: {currentUser?.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/settings"
                      onClick={() => setShowRoleDropdown(false)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 text-stone-700 font-medium transition-colors"
                    >
                      <span>Agency Settings & Profile</span>
                    </Link>
                    <Link
                      href="/itineraries/builder"
                      onClick={() => setShowRoleDropdown(false)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 text-stone-700 font-medium transition-colors"
                    >
                      <span>New Itinerary Studio</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-stone-100">
                    <button
                      onClick={() => {
                        setShowRoleDropdown(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] transition-colors"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out of Studio</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
