'use client';

import React, { useState } from 'react';
import {
  Settings,
  Building,
  CreditCard,
  Percent,
  CheckSquare,
  ShieldCheck,
  RotateCcw,
  Download,
  Save,
  CheckCircle2,
  Compass,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  Cpu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SettingsPage() {
  const {
    companySettings,
    updateCompanySettings,
    resetDemoData,
    currentUser,
    setCurrentUserRole,
  } = useApp();

  const [formData, setFormData] = useState(companySettings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestGeminiKey = async () => {
    if (!formData.geminiApiKey || formData.geminiApiKey.trim().length < 5) {
      setApiTestResult({ success: false, message: 'Please enter a valid Gemini API key first.' });
      return;
    }
    setIsTestingApi(true);
    setApiTestResult(null);
    const startTime = Date.now();
    try {
      const res = await fetch('/api/ai/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: formData.geminiApiKey.trim(),
          model: formData.geminiModel || 'gemini-1.5-flash',
          isTestPing: true,
        }),
      });
      const data = await res.json();
      const latency = Date.now() - startTime;
      if (res.ok && data.success) {
        setApiTestResult({
          success: true,
          message: `Connected successfully to ${formData.geminiModel || 'gemini-1.5-flash'} (${latency}ms)!`,
        });
      } else {
        setApiTestResult({
          success: false,
          message: data.error || 'Connection failed. Please verify your Google Gemini API key.',
        });
      }
    } catch (err: any) {
      setApiTestResult({
        success: false,
        message: err.message || 'Network error while contacting Gemini endpoint.',
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Export JSON Backup
  const handleExportAllBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      companySettings: formData,
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `DesiJourney_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-forest-900 tracking-tight">
              Agency Settings & Master Templates
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Configure branding, official GST & HDFC bank instructions, default margins, and template policies.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Settings Saved!</span>
            </span>
          )}
          <button
            onClick={handleExportAllBackup}
            className="px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Section 1: Agency Branding & Contact */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Building className="w-4 h-4 text-forest-600" />
            <h2 className="text-sm font-bold text-forest-900">1. Desi Journey Agency Branding & Contact Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Agency Name *</label>
              <input
                type="text"
                required
                value={formData.agencyName}
                onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Tagline / Mission</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Primary Helpline (Phone)</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">WhatsApp Customer Support</label>
              <input
                type="text"
                value={formData.whatsappSupport}
                onChange={(e) => setFormData({ ...formData, whatsappSupport: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Public Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Website URL</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Registered Office Address</label>
            <input
              type="text"
              value={formData.headOfficeAddress}
              onChange={(e) => setFormData({ ...formData, headOfficeAddress: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-200"
            />
          </div>
        </div>

        {/* Section 2: Indian Banking, UPI & GST Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <CreditCard className="w-4 h-4 text-forest-600" />
            <h2 className="text-sm font-bold text-forest-900">2. Indian Banking, UPI & GST Legal Configuration</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">GSTIN Number</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Company PAN</label>
              <input
                type="text"
                value={formData.panNumber}
                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Settlement Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Account Holder Name</label>
              <input
                type="text"
                value={formData.accountHolderName}
                onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Current Account Number</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">IFSC Code & Branch</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                  placeholder="IFSC"
                  className="w-32 px-3 py-2 rounded-lg border border-stone-200 font-mono"
                />
                <input
                  type="text"
                  value={formData.branchName}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  placeholder="Branch Name"
                  className="flex-1 px-3 py-2 rounded-lg border border-stone-200"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Official UPI VPA / Handle</label>
              <input
                type="text"
                value={formData.upiVpa}
                onChange={(e) => setFormData({ ...formData, upiVpa: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 font-mono text-emerald-800 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Default Business Margins & Tax Rules */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Percent className="w-4 h-4 text-forest-600" />
            <h2 className="text-sm font-bold text-forest-900">3. Default Business Margins & Pricing Rules</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Default Agency Margin (%)</label>
              <input
                type="number"
                value={formData.defaultMarkupPercent}
                onChange={(e) => setFormData({ ...formData, defaultMarkupPercent: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 font-semibold text-forest-900"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Tour Operator GST Rate (%)</label>
              <input
                type="number"
                value={formData.defaultGstPercent}
                onChange={(e) => setFormData({ ...formData, defaultGstPercent: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 font-semibold text-forest-900"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Booking Advance Deposit (%)</label>
              <input
                type="number"
                value={formData.defaultAdvancePercent}
                onChange={(e) => setFormData({ ...formData, defaultAdvancePercent: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 font-semibold text-forest-900"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Google Gemini Flash AI Engine Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-forest-900">
                4. Google Gemini Flash AI Engine Configuration
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 w-fit">
              ✨ Neural Itinerary Generator
            </span>
          </div>

          <p className="text-stone-600 text-[11px] leading-relaxed">
            Desi Journey Studio uses Google Gemini Flash models to automatically draft realistic day-by-day travel schedules, calculate realistic Himalayan driving hours, suggest regional sightseeing stops, and synthesize guest proposals.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={formData.geminiApiKey || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, geminiApiKey: e.target.value })
                  }
                  placeholder="AIzaSy..."
                  className="w-full pl-3 pr-10 py-2 rounded-lg border border-stone-200 font-mono text-xs focus:border-forest-600 outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-stone-400 mt-1">
                Get an API key from <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-forest-700 underline font-medium">Google AI Studio</a>. Saved securely in local state.
              </p>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Preferred AI Model
              </label>
              <select
                value={formData.geminiModel || 'gemini-1.5-flash'}
                onChange={(e) =>
                  setFormData({ ...formData, geminiModel: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white font-medium text-xs focus:border-forest-600 outline-hidden"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended: Ultra-fast & High Limits)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Next-Generation Low Latency)</option>
                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Experimental</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Complex Reasoning)</option>
              </select>
              <p className="text-[10px] text-stone-400 mt-1">
                Sub-second generation latency optimized for rapid travel quotation workflows.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={isTestingApi || !formData.geminiApiKey}
              onClick={handleTestGeminiKey}
              className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                !formData.geminiApiKey
                  ? 'border-stone-200 text-stone-400 cursor-not-allowed bg-stone-50'
                  : 'border-amber-400 text-amber-900 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              {isTestingApi ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                  <span>Testing Connection...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Test API Connection</span>
                </>
              )}
            </button>

            {apiTestResult && (
              <div
                className={`text-[11px] font-semibold px-3 py-1 rounded-lg border flex items-center gap-1.5 ${
                  apiTestResult.success
                    ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                    : 'text-rose-700 bg-rose-50 border-rose-200'
                }`}
              >
                {apiTestResult.success ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                )}
                <span>{apiTestResult.message}</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-forest-50/70 border border-forest-100 rounded-xl flex items-start gap-2.5 text-[11px] text-forest-900">
            <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-forest-900">Always-On Offline Fallback:</strong> If no API key is specified or during network disconnects, the Itinerary Builder will seamlessly generate itineraries using Desi Journey's built-in Himalayan Knowledge Base with verified driving hours and route circuits.
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-card">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save All Configuration</span>
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 text-xs">
            <h3 className="text-base font-bold text-forest-900">Restore Default Demo Dataset?</h3>
            <p className="text-stone-600 mt-2 leading-relaxed">
              This will restore all sample leads, hotels, vehicles, itineraries, and settings back to the initial showcase baseline.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
