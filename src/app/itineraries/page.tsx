'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Map,
  Plus,
  Search,
  FileText,
  Sparkles,
  Share2,
  Trash2,
  Copy,
  CheckCircle2,
  Lock,
  Unlock,
  IndianRupee,
  Calendar,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatIndianDate } from '../../lib/calculations';

export default function ItinerariesListPage() {
  const {
    quotations,
    deleteQuotation,
    saveQuotationAsNewVersion,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredQuotes = quotations.filter((q) => {
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tripTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.destinationsSummary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || q.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-forest-700" />
            <h1 className="text-xl font-bold text-forest-900 tracking-tight">
              Itineraries & Quotations Ledger
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Curated day-wise proposals, wholesale cost sheets, margin calculators, and version history.
          </p>
        </div>

        <Link
          href="/itineraries/builder"
          className="px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Itinerary Studio</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-card flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by quote number, guest, or route..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-forest-900 outline-hidden focus:border-forest-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
          <span className="text-[11px] text-stone-400 font-medium mr-1 hidden md:inline">Status:</span>
          {['All', 'Draft', 'Sent', 'Confirmed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-forest-800 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Quotation Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredQuotes.map((quote) => {
          const isMasked = quote.customization.disclosureMode === 'masked';
          const balanceDue = quote.costing.finalSellingPrice - quote.advanceReceived;

          return (
            <div
              key={quote.id}
              className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card hover:border-emerald-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Left Column: Details */}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-forest-900 px-2 py-0.5 rounded bg-stone-100">
                    {quote.quoteNumber}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-forest-100 text-forest-800">
                    Version {quote.version}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      quote.status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : quote.status === 'Sent'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {quote.status}
                  </span>

                  {/* Mode Pill */}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isMasked
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-teal-100 text-teal-800 border border-teal-200'
                    }`}
                  >
                    {isMasked ? (
                      <>
                        <Lock className="w-2.5 h-2.5" />
                        <span>Pre-Advance (Suppliers Masked)</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-2.5 h-2.5" />
                        <span>Confirmed (Hotels Disclosed)</span>
                      </>
                    )}
                  </span>
                </div>

                <div>
                  <h2 className="text-base font-bold text-forest-900">
                    {quote.tripTitle}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {quote.destinationsSummary}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-stone-600 flex-wrap pt-1">
                  <div className="flex items-center gap-1.5 font-medium text-stone-800">
                    <Users className="w-3.5 h-3.5 text-forest-600" />
                    <span>{quote.guestName} ({quote.guestPhone})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>
                      {formatIndianDate(quote.startDate)} → {formatIndianDate(quote.endDate)} (
                      {quote.durationNights}N/{quote.durationDays}D)
                    </span>
                  </div>
                  <div>
                    <span>{quote.adults} Adults {quote.children > 0 ? `+ ${quote.children} Chd` : ''}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Vehicle:</span> {quote.vehicleName}
                  </div>
                </div>
              </div>

              {/* Right Column: Costing & Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
                <div className="text-left md:text-right">
                  <div className="text-xs text-stone-500">Selling Price</div>
                  <div className="text-lg font-bold text-forest-900 tabular-nums">
                    {formatINR(quote.costing.finalSellingPrice)}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Advance: {formatINR(quote.advanceReceived)} / Due: {formatINR(balanceDue)}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => saveQuotationAsNewVersion(quote.id)}
                    className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs flex items-center gap-1"
                    title="Clone as New Version (e.g. v2)"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">New Ver</span>
                  </button>

                  <Link
                    href={`/itineraries/${quote.id}/preview`}
                    className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-forest-50 text-forest-800 font-medium text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Preview & Share</span>
                  </Link>

                  <Link
                    href={`/itineraries/builder?edit=${quote.id}`}
                    className="px-3 py-1.5 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                    <span>Studio Editor</span>
                  </Link>

                  <button
                    onClick={() => deleteQuotation(quote.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete quote"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredQuotes.length === 0 && (
          <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center text-xs text-stone-400">
            No itineraries found. Click &ldquo;New Itinerary Studio&rdquo; to build your first proposal!
          </div>
        )}
      </div>
    </div>
  );
}
