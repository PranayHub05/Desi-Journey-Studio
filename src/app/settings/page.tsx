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
  Cpu,
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Shield,
  Lock,
  X,
  Loader2,
  AlertTriangle,
  Cloud,
  Database,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuthUser } from '../../types';

export default function SettingsPage() {
  const {
    companySettings,
    updateCompanySettings,
    resetDemoData,
    currentUser,
    setCurrentUserRole,
    authUsers,
    updateAuthUser,
    createAuthUser,
    deleteAuthUser,
    firestoreStatus,
    firestoreError,
    syncToFirestore,
    refreshFromFirestore,
    quotations,
    leads,
  } = useApp();

  const [formData, setFormData] = useState(companySettings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Cloud Firestore Sync State
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [cloudSyncMsg, setCloudSyncMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedRules, setCopiedRules] = useState(false);

  const handleSyncToCloud = async () => {
    setIsSyncingCloud(true);
    setCloudSyncMsg(null);
    try {
      const res = await syncToFirestore();
      if (res.success) {
        setCloudSyncMsg({
          type: 'success',
          text: `Success! Synced ${res.collectionsWritten?.length || 0} collections (${quotations.length} itineraries, ${leads.length} leads) to Cloud Firestore!`,
        });
      } else {
        setCloudSyncMsg({
          type: 'error',
          text: res.error || 'Failed to sync. Please ensure Firestore Security Rules allow read/write in Firebase Console.',
        });
      }
    } catch (err: any) {
      setCloudSyncMsg({
        type: 'error',
        text: err?.message || 'Sync failed. Check Firebase console rules.',
      });
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleRefreshFromCloud = async () => {
    setIsSyncingCloud(true);
    setCloudSyncMsg(null);
    try {
      await refreshFromFirestore();
      setCloudSyncMsg({
        type: 'success',
        text: 'Reloaded all latest data from Cloud Firestore successfully!',
      });
    } catch (err: any) {
      setCloudSyncMsg({
        type: 'error',
        text: err?.message || 'Failed to reload from Cloud Firestore.',
      });
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // User management state
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [userForm, setUserForm] = useState<Partial<AuthUser>>({});
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState<Partial<AuthUser>>({
    role: 'sales',
    defaultPassword: 'password123',
    password: 'password123',
  });
  const [userSaveMsg, setUserSaveMsg] = useState<string | null>(null);

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

      {/* CLOUD DATABASE & MULTI-DEVICE SYNC (FIRESTORE) */}
      <div id="cloud-sync" className="bg-white p-6 rounded-2xl border-2 border-stone-200 shadow-card space-y-5 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-800 text-gold-400 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-forest-900">
                Cloud Database &amp; Multi-Device Synchronization (Firestore)
              </h2>
              <p className="text-[11px] text-stone-500">
                Project ID: <strong className="font-mono text-forest-800">desijourneystudio</strong> • Syncs all itineraries, leads, hotels, and payments across all agency laptops.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {firestoreStatus === 'connected' ? (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px] flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Connected &amp; Synced</span>
              </span>
            ) : firestoreStatus === 'syncing' ? (
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px] flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                <span>Syncing Database...</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-300 font-bold text-[11px] flex items-center gap-1.5 shadow-2xs">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Writes Blocked (Permission Denied)</span>
              </span>
            )}
          </div>
        </div>

        {/* Why another laptop shows nothing explanation */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/90 text-amber-950 space-y-2">
          <div className="font-bold flex items-center gap-1.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Why did your itinerary show on one laptop, but nothing showed on another laptop?</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-900">
            When you create an itinerary on Laptop A, the browser saves a local copy in <strong>localStorage</strong> (so you can view it even offline), and also attempts to upload it to <strong>Cloud Firestore</strong>. If your Firestore Security Rules in Firebase Console are set to <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">allow write: if false;</code> or require Firebase Auth tokens, the cloud upload is blocked by Firestore. As a result, the itinerary exists <em>only</em> on Laptop A&apos;s local browser storage. When Laptop B opens the website, it asks Cloud Firestore for data and finds 0 records.
          </p>
        </div>

        {/* Step-by-Step Fix */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-bold text-forest-900 text-xs">
              How to Fix in 10 Seconds (Firebase Console Rules):
            </span>
            <a
              href="https://console.firebase.google.com/project/desijourneystudio/firestore/rules"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-bold text-forest-700 hover:text-forest-900 hover:underline flex items-center gap-1"
            >
              <span>Open Firebase Console Rules Tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-700">
            <li>Go to <strong>Firebase Console</strong> → Select project <strong className="font-mono">desijourneystudio</strong>.</li>
            <li>In the left menu, click <strong>Firestore Database</strong> → Click the <strong>Rules</strong> tab at the top.</li>
            <li>Replace the entire text with the 7-line rule below and click <strong>Publish</strong>:</li>
          </ol>

          {/* Code block with copy button */}
          <div className="relative rounded-xl bg-stone-900 text-stone-100 p-3.5 font-mono text-[11px] shadow-inner">
            <button
              type="button"
              onClick={() => {
                const ruleText = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`;
                navigator.clipboard.writeText(ruleText);
                setCopiedRules(true);
                setTimeout(() => setCopiedRules(false), 3000);
              }}
              className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-sans font-semibold flex items-center gap-1 border border-stone-700 transition-colors"
            >
              {copiedRules ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Rules</span>
                </>
              )}
            </button>
            <pre className="overflow-x-auto text-[11px] leading-relaxed text-amber-200">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
            </pre>
          </div>
          <p className="text-[10px] text-stone-500 italic">
            * Note: If Google shows a warning that &ldquo;Your rules are defined as public&rdquo;, this is normal because the internal staff login is managed by Desi Journey Studio instead of Firebase&apos;s consumer auth.
          </p>
        </div>

        {/* Sync Trigger Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={isSyncingCloud}
              onClick={handleSyncToCloud}
              className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              {isSyncingCloud ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-gold-400" />
              )}
              <span>Sync All Local Itineraries to Cloud Now</span>
            </button>

            <button
              type="button"
              disabled={isSyncingCloud}
              onClick={handleRefreshFromCloud}
              className="px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-50 text-stone-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-stone-600 ${isSyncingCloud ? 'animate-spin' : ''}`} />
              <span>Fetch &amp; Reload Cloud Data</span>
            </button>
          </div>

          <div className="text-[11px] text-stone-500 font-medium">
            Local Itineraries Ready to Sync: <strong className="text-forest-900">{quotations.length}</strong>
          </div>
        </div>

        {cloudSyncMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              cloudSyncMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            {cloudSyncMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{cloudSyncMsg.text}</span>
          </div>
        )}
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

          {/* Official Company Logo */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
            <label className="font-semibold text-stone-700 block mb-2">Official Company Logo & Branding Asset</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-48 h-20 bg-white rounded-lg border border-stone-200 p-2 flex items-center justify-center shadow-xs shrink-0">
                <img
                  src={formData.logoUrl || '/images/desi-journey-logo.png'}
                  alt="Desi Journey Logo"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex-1 w-full space-y-1">
                <input
                  type="text"
                  value={formData.logoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="/images/desi-journey-logo.png"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 font-mono text-xs bg-white"
                />
                <p className="text-[11px] text-stone-500">
                  Official Desi Journey insignia loaded from <code className="text-forest-700 font-semibold bg-stone-200/60 px-1 py-0.5 rounded">/images/desi-journey-logo.png</code>. Displayed across user authentication, navigation headers, and downloadable PDF proposals.
                </p>
              </div>
            </div>
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

        {/* Section 5: Team User Management & Portal Passwords */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-forest-600" />
              <div>
                <h2 className="text-sm font-bold text-forest-900">
                  5. Team User Management & Portal Passwords (Admin Access)
                </h2>
                <p className="text-[11px] text-stone-500">
                  Manage team login credentials. Admin can edit their own profile (name, email, password) and configure Planner, Sales, and Ops team credentials.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setNewUserForm({
                  name: '',
                  username: '',
                  email: '',
                  role: 'sales',
                  title: 'Travel Consultant',
                  phone: '+91 ',
                  password: 'password123',
                  defaultPassword: 'password123',
                });
                setIsAddingUser(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-semibold flex items-center gap-1.5 transition-colors text-xs shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Staff Member</span>
            </button>
          </div>

          {userSaveMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{userSaveMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {authUsers.map((user) => {
              const isCurrent = currentUser?.id === user.id;
              return (
                <div
                  key={user.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-forest-50/60 border-forest-300 ring-1 ring-forest-300'
                      : 'bg-stone-50/70 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-forest-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-forest-900 text-xs">{user.name}</h4>
                          {isCurrent && (
                            <span className="text-[10px] font-semibold bg-forest-200 text-forest-900 px-1.5 py-0.5 rounded">
                              Your Profile
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 font-medium">{user.title || user.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : user.role === 'ops'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {user.role}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUser(user);
                          setUserForm({ ...user });
                        }}
                        className="p-1.5 text-stone-600 hover:text-forest-800 hover:bg-stone-200/60 rounded-lg transition-colors ml-1"
                        title="Edit User Details & Password"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {authUsers.length > 1 && user.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove staff access for ${user.name}?`)) {
                              deleteAuthUser(user.id);
                              setUserSaveMsg(`User ${user.name} removed successfully.`);
                              setTimeout(() => setUserSaveMsg(null), 3000);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-stone-200/80 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-stone-400 block text-[10px]">Email (Login ID):</span>
                      <span className="font-mono font-medium text-stone-800 truncate block">{user.email}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Portal Password:</span>
                      <span className="font-mono font-bold text-forest-800 bg-white px-2 py-0.5 rounded border border-stone-200 inline-block shadow-2xs">
                        {user.password || user.defaultPassword}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Username:</span>
                      <span className="text-stone-700 font-medium">@{user.username}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Direct Phone:</span>
                      <span className="text-stone-700 font-medium">{user.phone || '—'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-forest-600" />
                <h3 className="text-sm font-bold text-forest-900">
                  {currentUser?.id === editingUser.id ? 'Edit Your Admin Profile & Credentials' : `Edit User: ${editingUser.name}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={userForm.name || ''}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium"
                    placeholder="e.g. Vikas Sharma"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Designation / Title</label>
                  <input
                    type="text"
                    value={userForm.title || ''}
                    onChange={(e) => setUserForm({ ...userForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium"
                    placeholder="e.g. Managing Director"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Login Email *</label>
                  <input
                    type="email"
                    required
                    value={userForm.email || ''}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium"
                    placeholder="e.g. admin@desijourney.com"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={userForm.username || ''}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium"
                    placeholder="e.g. admin"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Portal Password *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={userForm.password || userForm.defaultPassword || ''}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          password: e.target.value,
                          defaultPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 font-mono font-semibold text-forest-800"
                      placeholder="e.g. admin1044"
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 mt-0.5">Password used for login on this portal</p>
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Direct Phone</label>
                  <input
                    type="text"
                    value={userForm.phone || ''}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium"
                    placeholder="e.g. +91 98724 56789"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">System Role</label>
                <select
                  value={userForm.role || 'sales'}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium bg-white"
                >
                  <option value="admin">Admin (Full System & Financial Access)</option>
                  <option value="sales">Planner / Sales (Itinerary Builder, Leads & Quotes)</option>
                  <option value="ops">AccountOps (Suppliers, Vouchers, Payments & Ledgers)</option>
                  <option value="driver">Driver (Driver Companion View Only)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 font-medium hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!userForm.name || !userForm.email) {
                    alert('Please provide a name and email.');
                    return;
                  }
                  updateAuthUser(editingUser.id, userForm);
                  setEditingUser(null);
                  setUserSaveMsg(`Updated profile and credentials for ${userForm.name}.`);
                  setTimeout(() => setUserSaveMsg(null), 3500);
                }}
                className="px-4 py-2 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddingUser && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-forest-600" />
                <h3 className="text-sm font-bold text-forest-900">Add New Staff Member</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingUser(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.name || ''}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium"
                    placeholder="e.g. Priya Sharma"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Designation / Title</label>
                  <input
                    type="text"
                    value={newUserForm.title || ''}
                    onChange={(e) => setNewUserForm({ ...newUserForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium"
                    placeholder="e.g. Junior Travel Planner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Login Email *</label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email || ''}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium"
                    placeholder="e.g. priya@desijourney.com"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.username || ''}
                    onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium"
                    placeholder="e.g. priya"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Portal Password *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.password || ''}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        password: e.target.value,
                        defaultPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 font-mono font-semibold text-forest-800"
                    placeholder="e.g. priyadj"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Direct Phone</label>
                  <input
                    type="text"
                    value={newUserForm.phone || ''}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium"
                    placeholder="e.g. +91 98100 12345"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">System Role</label>
                <select
                  value={newUserForm.role || 'sales'}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium bg-white"
                >
                  <option value="sales">Planner / Sales (Itinerary Builder, Leads & Quotes)</option>
                  <option value="ops">AccountOps (Suppliers, Vouchers, Payments & Ledgers)</option>
                  <option value="admin">Admin (Full System & Financial Access)</option>
                  <option value="driver">Driver (Driver Companion View Only)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsAddingUser(false)}
                className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 font-medium hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newUserForm.name || !newUserForm.email || !newUserForm.username) {
                    alert('Please provide full name, email, and username.');
                    return;
                  }
                  createAuthUser({
                    name: newUserForm.name,
                    username: newUserForm.username,
                    email: newUserForm.email,
                    role: newUserForm.role || 'sales',
                    title: newUserForm.title || '',
                    phone: newUserForm.phone || '',
                    password: newUserForm.password || 'password123',
                    defaultPassword: newUserForm.password || 'password123',
                  });
                  setIsAddingUser(false);
                  setUserSaveMsg(`Added new staff member ${newUserForm.name}.`);
                  setTimeout(() => setUserSaveMsg(null), 3500);
                }}
                className="px-4 py-2 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Staff Member</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
