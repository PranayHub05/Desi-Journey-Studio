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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const TopNavbar: React.FC = () => {
  const {
    currentUser,
    setCurrentUserRole,
    resetDemoData,
    setIsSearchOpen,
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

        {/* Right Controls: IST Clock, Role Switcher, Quick Create, Reset Demo */}
        <div className="flex items-center gap-3">
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

          {/* Role Switcher Pill (Persona Tester) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs text-stone-700 transition-colors"
              title="Switch user perspective for permissions test"
            >
              <UserCheck className="w-3.5 h-3.5 text-forest-600" />
              <span className="capitalize font-medium">{currentUser ? (currentUser.role === 'admin' ? 'Admin: Full Access' : currentUser.role) : 'Login'}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {showRoleDropdown && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowRoleDropdown(false)}
                />
                <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-elevated border border-stone-200 p-2 z-30 text-xs animate-in fade-in slide-in-from-top-1">
                  <div className="px-2 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex justify-between items-center">
                    <span>Simulate Team Role</span>
                    <Link
                      href="/login"
                      onClick={() => setShowRoleDropdown(false)}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Login Portal →
                    </Link>
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        setCurrentUserRole(r.role);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg flex items-start justify-between transition-colors ${
                        currentUser?.role === r.role
                          ? 'bg-forest-50 text-forest-900 font-medium'
                          : 'hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs">{r.label}</div>
                        <div className="text-[10px] text-stone-500">{r.desc}</div>
                      </div>
                      {currentUser?.role === r.role && (
                        <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                  <div className="pt-2 mt-1 border-t border-stone-100 px-1">
                    <Link
                      href="/login"
                      onClick={() => setShowRoleDropdown(false)}
                      className="w-full block text-center py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[11px]"
                    >
                      🚪 Switch User / Login Screen
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            title="Reset to fresh demo dataset"
            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Confirmation Modal for Demo Data Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-4">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Reset Sample Data?</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              This will restore all pre-configured demo leads, hotels, vehicles, itineraries, and settings
              back to the initial clean showcase state. Any local modifications will be replaced.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium shadow-xs"
              >
                Reset Demo Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
