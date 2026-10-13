'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Send,
  Calendar,
  AlertCircle,
  IndianRupee,
  MapPin,
  Car,
  ChevronRight,
  TrendingUp,
  FileText,
  Calculator,
  Share2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR, formatIndianDate } from '../lib/calculations';

export default function DashboardPage() {
  const { leads, quotations, vehicles } = useApp();

  // Metrics calculation
  const activeLeadsCount = leads.filter(
    (l) => l.status !== 'Completed' && l.status !== 'Cancelled'
  ).length;

  const quotesSent = quotations.filter((q) => q.status === 'Sent');
  const totalPipelineValue = quotesSent.reduce(
    (sum, q) => sum + q.costing.finalSellingPrice,
    0
  );

  const followUpsDueToday = leads.filter(
    (l) => l.status === 'Follow-up' || l.status === 'New'
  );

  const confirmedQuotes = quotations.filter((q) => q.status === 'Confirmed');
  const pendingCollections = quotations.reduce(
    (sum, q) => sum + (q.costing.finalSellingPrice - q.advanceReceived),
    0
  );

  // Quick Estimator State
  const [estDays, setEstDays] = useState<number>(6);
  const [estPax, setEstPax] = useState<number>(2);
  const [estTier, setEstTier] = useState<'3-Star' | '4-Star' | '5-Star'>('4-Star');
  const [estVehicleId, setEstVehicleId] = useState<string>(vehicles[0]?.id || '');

  // Quick estimate calculation
  const hotelRatePerDay = estTier === '5-Star' ? 9500 : estTier === '4-Star' ? 6200 : 4200;
  const roomsCount = Math.ceil(estPax / 2);
  const totalHotelEst = hotelRatePerDay * roomsCount * Math.max(1, estDays - 1);
  const selectedVeh = vehicles.find((v) => v.id === estVehicleId) || vehicles[0];
  const vehicleEst = (selectedVeh ? selectedVeh.baseRate : 4000) * estDays;
  const baseWholesale = totalHotelEst + vehicleEst;
  const estimatedSelling = Math.round(baseWholesale * 1.25 * 1.05); // 25% margin + 5% GST

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome & Command Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-bold text-forest-900 tracking-tight">
              Desi Journey Command Center
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Real-time itinerary formulas, lead conversion SLA tracking, and tour dispatches across India.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/leads"
            className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-forest-600" />
            <span>View All Leads</span>
          </Link>
          <Link
            href="/itineraries/builder"
            className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Launch Itinerary Studio</span>
          </Link>
        </div>
      </div>

      {/* 6 Key Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Leads</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold text-forest-900 tabular-nums">{activeLeadsCount}</span>
          </div>
          <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+18% this month</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Quotes Sent</span>
            <Send className="w-4 h-4 text-sky-600" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold text-forest-900 tabular-nums">{quotesSent.length}</span>
          </div>
          <div className="text-[11px] text-stone-500 truncate">
            Pipeline: <strong className="text-forest-900">{formatINR(totalPipelineValue)}</strong>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Urgent Follow-ups</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold text-amber-600 tabular-nums">
              {followUpsDueToday.length}
            </span>
          </div>
          <div className="text-[11px] text-amber-700 font-medium">
            SLA action required
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Confirmed Tours</span>
            <Calendar className="w-4 h-4 text-forest-600" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold text-forest-900 tabular-nums">
              {confirmedQuotes.length}
            </span>
          </div>
          <div className="text-[11px] text-forest-700 font-medium">
            Next departure in 5 days
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Receivables</span>
            <IndianRupee className="w-4 h-4 text-rose-500" />
          </div>
          <div className="my-2">
            <span className="text-lg font-bold text-forest-900 tabular-nums">
              {formatINR(pendingCollections)}
            </span>
          </div>
          <div className="text-[11px] text-stone-500">
            Due across itineraries
          </div>
        </div>

        {/* Metric 6 */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Conversion</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold text-forest-900 tabular-nums">34.8%</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">
            Avg margin 23.4%
          </div>
        </div>
      </div>

      {/* Main Grid: Urgent Follow-ups & Recent Quotations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Quotations Feed & Movement */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Quotations Feed */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-forest-900">Recent Trip Quotations</h2>
                <p className="text-[11px] text-stone-500">
                  Manage active proposals, review pricing calculations, and preview customer views.
                </p>
              </div>
              <Link
                href="/itineraries"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>View All ({quotations.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {quotations.map((quote) => {
                const isMasked = quote.customization.disclosureMode === 'masked';
                return (
                  <div
                    key={quote.id}
                    className="p-4 rounded-xl border border-stone-200 hover:border-emerald-300 transition-colors bg-stone-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-forest-800">
                          {quote.quoteNumber}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-stone-200 text-stone-700">
                          v{quote.version}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            quote.status === 'Confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : quote.status === 'Sent'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {quote.status}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            isMasked
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-teal-50 text-teal-700 border border-teal-200'
                          }`}
                          title={
                            isMasked
                              ? 'Pre-advance mode: hotel and driver names are redacted'
                              : 'Post-advance confirmed: hotel and driver disclosed'
                          }
                        >
                          {isMasked ? '🔒 Pre-Advance Masked' : '🔓 Disclosed Voucher'}
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-forest-900 mt-1 truncate">
                        {quote.tripTitle}
                      </h3>

                      <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-3 flex-wrap">
                        <span className="font-medium text-stone-700">{quote.guestName}</span>
                        <span>•</span>
                        <span>
                          {formatIndianDate(quote.startDate)} ({quote.durationNights}N/{quote.durationDays}D)
                        </span>
                        <span>•</span>
                        <span>{quote.adults} Adults {quote.children > 0 ? `+ ${quote.children} Chd` : ''}</span>
                        <span>•</span>
                        <span>{quote.vehicleName.split('-')[0]}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 md:self-center">
                      <div className="text-right">
                        <div className="text-sm font-bold text-forest-900 tabular-nums">
                          {formatINR(quote.costing.finalSellingPrice)}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {quote.costing.gstEnabled ? 'Incl. 5% GST' : 'Excl. GST'}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/itineraries/${quote.id}/preview`}
                          className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-forest-50 text-forest-800 text-xs font-medium transition-colors flex items-center gap-1"
                          title="Open Customer Proposal Preview"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </Link>
                        <Link
                          href={`/itineraries/builder?edit=${quote.id}`}
                          className="px-3 py-1.5 rounded-lg bg-forest-800 hover:bg-forest-700 text-white text-xs font-medium transition-colors"
                          title="Edit in Itinerary Studio"
                        >
                          Studio
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operations Movement Chart / Departures Preview */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-forest-900">Upcoming Departures & Movement</h2>
                <p className="text-[11px] text-stone-500">
                  Assigned fleet, chauffeurs, and destination status for confirmed travellers.
                </p>
              </div>
              <Link
                href="/calendar"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Full Calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-y border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Departure Date</th>
                    <th className="py-2.5 px-3">Guest & Route</th>
                    <th className="py-2.5 px-3">Vehicle / Chauffeur</th>
                    <th className="py-2.5 px-3">Advance Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {confirmedQuotes.map((q) => (
                    <tr key={q.id} className="hover:bg-stone-50/60">
                      <td className="py-3 px-3 font-medium text-forest-900 whitespace-nowrap">
                        {formatIndianDate(q.startDate)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-forest-900">{q.guestName}</div>
                        <div className="text-[11px] text-stone-500">{q.destinationsSummary}</div>
                      </td>
                      <td className="py-3 px-3 text-stone-600">
                        <div className="flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-stone-400" />
                          <span>{q.vehicleName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Advance Received ({formatINR(q.advanceReceived)})
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href="/calendar"
                          className="text-xs font-semibold text-forest-700 hover:underline"
                        >
                          Vouchers
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {confirmedQuotes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-stone-400">
                        No confirmed trips departing this week.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Quick Rate Estimator & Urgent Follow-up Queue */}
        <div className="space-y-6">
          {/* Quick Rate Estimator Widget */}
          <div className="bg-gradient-to-br from-forest-900 to-forest-800 text-white rounded-2xl p-6 shadow-elevated">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-gold-400" />
              <h2 className="text-sm font-bold tracking-tight text-white">
                Quick Phone Rate Estimator
              </h2>
            </div>
            <p className="text-[11px] text-stone-300 mb-4 leading-relaxed">
              Instantly approximate package selling cost while on the phone with an inbound lead.
            </p>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] text-stone-300 font-medium block mb-1">
                  Trip Duration (Days)
                </label>
                <div className="flex gap-1">
                  {[4, 5, 6, 7, 8].map((d) => (
                    <button
                      key={d}
                      onClick={() => setEstDays(d)}
                      className={`flex-1 py-1.5 rounded-lg font-medium text-xs transition-colors ${
                        estDays === d
                          ? 'bg-gold-500 text-forest-900 font-bold'
                          : 'bg-forest-700/60 text-stone-300 hover:bg-forest-700'
                      }`}
                    >
                      {d}D
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-stone-300 font-medium block mb-1">
                    Adults Count
                  </label>
                  <select
                    value={estPax}
                    onChange={(e) => setEstPax(Number(e.target.value))}
                    className="w-full bg-forest-700/60 border border-forest-600 rounded-lg px-2.5 py-1.5 text-white text-xs outline-hidden"
                  >
                    {[2, 3, 4, 6, 8, 12].map((p) => (
                      <option key={p} value={p} className="bg-forest-900 text-white">
                        {p} Adults ({Math.ceil(p / 2)} Room)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-stone-300 font-medium block mb-1">
                    Hotel Tier
                  </label>
                  <select
                    value={estTier}
                    onChange={(e) => setEstTier(e.target.value as any)}
                    className="w-full bg-forest-700/60 border border-forest-600 rounded-lg px-2.5 py-1.5 text-white text-xs outline-hidden"
                  >
                    <option value="3-Star" className="bg-forest-900 text-white">3-Star Superior</option>
                    <option value="4-Star" className="bg-forest-900 text-white">4-Star Premium</option>
                    <option value="5-Star" className="bg-forest-900 text-white">5-Star Luxury</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-stone-300 font-medium block mb-1">
                  Dedicated Vehicle
                </label>
                <select
                  value={estVehicleId}
                  onChange={(e) => setEstVehicleId(e.target.value)}
                  className="w-full bg-forest-700/60 border border-forest-600 rounded-lg px-2.5 py-1.5 text-white text-xs outline-hidden"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id} className="bg-forest-900 text-white">
                      {v.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estimate Output Box */}
              <div className="mt-4 p-3.5 rounded-xl bg-forest-950/60 border border-gold-500/30">
                <div className="flex justify-between items-center text-[11px] text-stone-400">
                  <span>Suggested Selling Total:</span>
                  <span className="text-[10px] text-gold-400 font-semibold">25% Margin + 5% GST</span>
                </div>
                <div className="text-xl font-bold text-gold-400 mt-1 tabular-nums">
                  {formatINR(estimatedSelling)}
                </div>
                <div className="text-[11px] text-stone-300 mt-0.5">
                  Approx. <strong className="text-white">{formatINR(Math.round(estimatedSelling / estPax))}</strong> per adult
                </div>
              </div>

              <Link
                href="/itineraries/builder"
                className="w-full block text-center py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-forest-900 font-bold text-xs transition-colors shadow-md mt-2"
              >
                Open Studio with This Base →
              </Link>
            </div>
          </div>

          {/* Urgent Follow-up SLA Queue */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-forest-900">Follow-up SLA Queue</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {followUpsDueToday.length} Due
              </span>
            </div>

            <div className="space-y-3">
              {followUpsDueToday.map((lead) => (
                <div
                  key={lead.id}
                  className="p-3 rounded-xl border border-stone-200 hover:border-amber-300 bg-stone-50/50 transition-colors text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-forest-900">{lead.guestName}</div>
                      <div className="text-[11px] text-stone-500">{lead.phone} • {lead.destination}</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                      {lead.status}
                    </span>
                  </div>

                  {lead.nextFollowUpNote && (
                    <div className="mt-2 text-[11px] text-stone-600 bg-white p-2 rounded-lg border border-stone-200">
                      💡 {lead.nextFollowUpNote}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400">
                      Assigned: {lead.assignedUserName.split(' ')[0]}
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline text-[11px] font-medium flex items-center gap-1"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                      <Link
                        href={`/itineraries/builder?leadId=${lead.id}`}
                        className="px-2 py-1 rounded bg-forest-800 hover:bg-forest-700 text-white text-[10px] font-medium"
                      >
                        Create Quote
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
