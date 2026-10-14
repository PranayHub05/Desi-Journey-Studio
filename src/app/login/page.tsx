'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  User,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuthUser } from '../../types';
import { auth, isFirebaseConfigured } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, authUsers, companySettings } = useApp();

  const [selectedUser, setSelectedUser] = useState<AuthUser>(authUsers[0]);
  const [usernameInput, setUsernameInput] = useState(authUsers[0]?.email || 'admin@desijourney.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectUser = (u: AuthUser) => {
    setSelectedUser(u);
    setUsernameInput(u.email || u.username);
    setPasswordInput('');
    setErrorMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // 1. If Firebase Auth is configured in environment, attempt live Firebase authentication
      if (isFirebaseConfigured && auth) {
        try {
          await signInWithEmailAndPassword(auth, usernameInput.trim(), passwordInput);
          login(usernameInput.trim(), passwordInput);
          router.push('/');
          return;
        } catch (firebaseErr: any) {
          // If Firebase account is not yet seeded, check if it matches local admin/staff credentials
          const localSuccess = login(usernameInput.trim(), passwordInput);
          if (localSuccess) {
            router.push('/');
            return;
          }
          setErrorMessage(firebaseErr.message || 'Authentication failed. Please verify credentials.');
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Standard internal authentication
      const success = login(usernameInput.trim(), passwordInput);
      if (success) {
        router.push('/');
      } else {
        setErrorMessage('Invalid credentials. Please verify your email and password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 via-stone-canvas to-stone-200 text-forest-900 flex flex-col justify-between p-4 md:p-8">
      {/* Top Brand Bar */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between pb-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white p-1.5 border border-stone-200 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
            <img
              src="/images/desi-journey-logo.png"
              alt="Desi Journey Logo"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-forest-900 tracking-tight">
                {companySettings.agencyName || 'Desi Journey'}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-forest-100 text-forest-800">
                Studio
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">desijourney.com</p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Authorized Portal</span>
          </span>
        </div>
      </div>

      {/* Main Login Workspace */}
      <div className="max-w-3xl w-full mx-auto my-auto py-10 space-y-8 animate-in fade-in duration-300">
        <div className="text-center space-y-1.5 max-w-md mx-auto">
          <h1 className="text-2xl font-bold tracking-tight text-forest-900">
            Sign In to Desi Journey Studio
          </h1>
          <p className="text-xs text-stone-500">
            Select your staff profile or enter your credentials to access the workspace.
          </p>
        </div>

        {/* 4 Role Selector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {authUsers.map((u) => {
            const isSelected = selectedUser?.id === u.id;
            return (
              <button
                type="button"
                key={u.id}
                onClick={() => handleSelectUser(u)}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-forest-800 ring-2 ring-forest-800 shadow-md'
                    : 'bg-white/80 border-stone-200 hover:border-stone-300 hover:bg-white shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'ops'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {u.role}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest-700" />
                    )}
                  </div>
                  <h3 className="font-bold text-forest-900 text-xs truncate">{u.name}</h3>
                  <p className="text-[10px] text-stone-500 truncate mt-0.5">{u.title || u.role}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-100 text-[10px] text-stone-400 font-mono truncate">
                  {u.email}
                </div>
              </button>
            );
          })}
        </div>

        {/* Credentials Form Box */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-elevated p-6 sm:p-8 max-w-md mx-auto space-y-4">
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Email / Login ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="name@desijourney.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 font-medium text-forest-900 focus:border-forest-700 outline-hidden text-xs bg-stone-50/50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-200 font-medium text-forest-900 focus:border-forest-700 outline-hidden text-xs bg-stone-50/50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl w-full mx-auto pt-6 border-t border-stone-200 text-center text-[11px] text-stone-400">
        © {new Date().getFullYear()} Desi Journey Studio • desijourney.com
      </div>
    </div>
  );
}
