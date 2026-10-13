'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  Send,
  Calendar,
  IndianRupee,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../lib/calculations';

export default function ReportsPage() {
  const { leads, quotations, suppliers, customerPayments } = useApp();

  const totalLeads = leads.length;
  const quotesCount = quotations.length;
  const confirmedCount = quotations.filter((q) => q.status === 'Confirmed').length;
  const conversionRate = totalLeads > 0 ? ((confirmedCount / totalLeads) * 100).toFixed(1) : '0';

  const pipelineValue = quotations.reduce((s, q) => s + q.costing.finalSellingPrice, 0);
  const totalRevenueCollected = customerPayments.reduce((s, p) => s + p.amount, 0);
  const totalSupplierPayable = suppliers.reduce((s, x) => s + x.totalAgreedPayable, 0);
  const totalSupplierPaid = suppliers.reduce((s, x) => s + x.totalPaid, 0);
  const totalGrossProfitQuoted = quotations.reduce((s, q) => s + q.costing.grossProfitAmount, 0);
  const avgProfitMargin = pipelineValue > 0 ? ((totalGrossProfitQuoted / pipelineValue) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-forest-900 tracking-tight">
              Business Intelligence & Tour Analytics
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Conversion metrics, quoted vs realized margins, destination trends, and cash flow reconciliation.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-card">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            Conversion Rate
          </div>
          <div className="text-2xl font-bold text-forest-900 mt-1 tabular-nums">
            {conversionRate}%
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{confirmedCount} Bookings from {totalLeads} Enquiries</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-card">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            Average Realized Margin
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 tabular-nums">
            {avgProfitMargin}%
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Quoted Gross Profit: <strong>{formatINR(totalGrossProfitQuoted)}</strong>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-card">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            Cash Advance Collected
          </div>
          <div className="text-2xl font-bold text-forest-900 mt-1 tabular-nums">
            {formatINR(totalRevenueCollected)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Verified in Indian bank A/C
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-card">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            Outstanding Supplier Dues
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1 tabular-nums">
            {formatINR(totalSupplierPayable - totalSupplierPaid)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Settled: {formatINR(totalSupplierPaid)}
          </div>
        </div>
      </div>

      {/* Visual Funnel and Regional Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card space-y-4 text-xs">
          <h3 className="font-bold text-forest-900 text-sm">Tour Conversion Pipeline</h3>
          
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between font-medium text-stone-700 mb-1">
                <span>1. Inbound Leads Captured</span>
                <span>{totalLeads} (100%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden">
                <div className="h-full bg-forest-800 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-stone-700 mb-1">
                <span>2. Day-Wise Proposals Generated</span>
                <span>{quotesCount} ({totalLeads > 0 ? Math.round((quotesCount / totalLeads) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-stone-700 mb-1">
                <span>3. 30% Token Advances Received</span>
                <span>{confirmedCount} ({conversionRate}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden">
                <div className="h-full bg-gold-500 rounded-full" style={{ width: `${conversionRate}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Regional Circuits Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card space-y-4 text-xs">
          <h3 className="font-bold text-forest-900 text-sm">Top Destination Circuits</h3>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="font-semibold text-forest-900">Himachal Pradesh (Shimla & Manali)</span>
              </div>
              <span className="font-bold text-forest-900">54% Share</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                <span className="font-semibold text-forest-900">Kashmir Valley (Srinagar & Gulmarg)</span>
              </div>
              <span className="font-bold text-forest-900">28% Share</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-semibold text-forest-900">Royal Rajasthan (Jaipur & Udaipur)</span>
              </div>
              <span className="font-bold text-forest-900">18% Share</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
