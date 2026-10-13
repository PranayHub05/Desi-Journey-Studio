'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Compass,
  ShieldCheck,
  MapPin,
  Calendar,
  Lock,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Sparkles,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { systemAuthUsers } from '../../lib/mockData';
import { AuthUser } from '../../types';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();

  const [selectedUser, setSelectedUser] = useState<AuthUser>(systemAuthUsers[0]);
  const [usernameInput, setUsernameInput] = useState(systemAuthUsers[0].username);
  const [passwordInput, setPasswordInput] = useState(systemAuthUsers[0].defaultPassword || 'admin123');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectUser = (u: AuthUser) => {
    setSelectedUser(u);
    setUsernameInput(u.username);
    setPasswordInput(u.defaultPassword || 'demo123');
    setErrorMessage(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(usernameInput, passwordInput);
    if (success) {
      router.push('/');
    } else {
      setErrorMessage('Invalid User ID or credentials. Please select one of the 4 team profiles above or check your username.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-canvas text-forest-900 flex flex-col justify-between p-4 md:p-8">
      {/* Top Brand Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between pb-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-800 flex items-center justify-center text-white shadow-md">
            <Compass className="w-6 h-6 text-gold-400 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-forest-900 tracking-tight">Desi Journey</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gold-100 text-gold-600 border border-gold-500/30">
                Studio
              </span>
            </div>
            <p className="text-xs text-stone-500">Bespoke Travel OS & Operations Platform</p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Secure Staff Gateway
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto my-auto py-8 space-y-8 animate-in fade-in duration-300">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-forest-900">
            Welcome to Desi Journey Studio
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Select your agency team perspective below to authenticate into the operational CRM, Itinerary Studio, and master wholesale ledgers.
          </p>
        </div>

        {/* 4 Authentication Options (Personas) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemAuthUsers.map((u) => {
            const isSelected = selectedUser.id === u.id;
            return (
              <div
                key={u.id}
                onClick={() => handleSelectUser(u)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-forest-800 ring-2 ring-forest-800 shadow-md scale-[1.02]'
                    : 'bg-white/80 border-stone-200 hover:border-stone-300 hover:bg-white shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        u.role === 'admin'
                          ? 'bg-gold-100 text-gold-600'
                          : u.role === 'sales'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>

                  <h3 className="font-bold text-forest-900 text-sm">{u.name}</h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">{u.title}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 text-[10px] text-stone-400 font-mono">
                  User ID: <strong className="text-stone-700">{u.username}</strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* Authentication Form Card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-elevated p-6 sm:p-8 max-w-lg mx-auto space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-sm font-bold text-forest-900">
                Login as {selectedUser.name}
              </h2>
              <p className="text-[11px] text-stone-500">
                {selectedUser.role === 'admin'
                  ? 'Administrator — Full unrestricted access to all modules and financials'
                  : `Role: ${selectedUser.title}`}
              </p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                User ID / Official Email
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="e.g. admin or vikas@desijourney.in"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 font-medium text-forest-900 outline-hidden focus:border-forest-600 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 font-mono text-forest-900 outline-hidden focus:border-forest-600 text-xs"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Quick test password prefilled ({selectedUser.defaultPassword})
              </span>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px]">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              <span>Enter Desi Journey Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 space-y-1">
            <span className="font-semibold text-forest-900 block">Role Permissions Overview:</span>
            <ul className="space-y-0.5 list-disc list-inside text-[10px] text-stone-500">
              <li><strong>Admin:</strong> Master margins, bank accounts, wholesale rates, deletion controls.</li>
              <li><strong>Planner / Sales:</strong> Enquiries, itinerary formulate engine, proposal exports.</li>
              <li><strong>Operations & Accounts:</strong> Chauffeur duty slips, hotel vouchers, UTR records.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto pt-6 border-t border-stone-200 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} Desi Journey Travel Studio • All rights reserved.
      </div>
    </div>
  );
}
