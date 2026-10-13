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
