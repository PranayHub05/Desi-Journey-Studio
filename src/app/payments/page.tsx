'use client';

import React, { useState } from 'react';
import {
  IndianRupee,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  CreditCard,
  FileText,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CustomerPayment } from '../../types';
import { formatINR, formatIndianDate } from '../../lib/calculations';

export default function PaymentsPage() {
  const {
    quotations,
    customerPayments,
    recordCustomerPayment,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Form
  const [payForm, setPayForm] = useState({
    quoteId: quotations[0]?.id || '',
    amount: 25000,
    stage: 'Booking Advance (30%)' as CustomerPayment['stage'],
    paymentDate: '2026-10-14',
    paymentMode: 'UPI' as CustomerPayment['paymentMode'],
    transactionReference: 'UPI-HDFC-9918231',
    receiptNumber: `RCPT-2026-${Math.floor(100 + Math.random() * 900)}`,
    notes: 'Token advance payment to lock reservations',
  });

  const totalCollectedAll = customerPayments.reduce((s, p) => s + p.amount, 0);

  const filteredPayments = customerPayments.filter(
    (p) =>
      p.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.transactionReference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const matchingQuote = quotations.find((q) => q.id === payForm.quoteId) || quotations[0];

    recordCustomerPayment({
      quoteId: matchingQuote.id,
      quoteNumber: matchingQuote.quoteNumber,
      guestName: matchingQuote.guestName,
      guestPhone: matchingQuote.guestPhone,
      amount: Number(payForm.amount),
      stage: payForm.stage,
      paymentDate: payForm.paymentDate,
      paymentMode: payForm.paymentMode,
      transactionReference: payForm.transactionReference,
      receiptNumber: payForm.receiptNumber,
      notes: payForm.notes,
    });

    setIsRecordModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-forest-900 tracking-tight">
              Customer Collections & Payment Receipts
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Track 30% booking advances, UTR references, official receipts, and balance collections.
          </p>
        </div>

        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Customer Advance</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
            Total Advance & Receipts Collected
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1 tabular-nums">
            {formatINR(totalCollectedAll)}
          </div>
          <span className="text-[11px] text-stone-500">Across {customerPayments.length} transactions</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
            Verified Payments
          </span>
          <div className="text-2xl font-bold text-forest-900 mt-1 tabular-nums">
            100%
          </div>
          <span className="text-[11px] text-emerald-800 font-medium">No chargebacks or disputes</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
            Official GST Receipts Issued
          </span>
          <div className="text-2xl font-bold text-forest-900 mt-1 tabular-nums">
            {customerPayments.length}
          </div>
          <span className="text-[11px] text-stone-500">SAC 998555 compliant</span>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
        <div className="p-4 border-b border-stone-200">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by guest, quote number, or UTR..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-forest-900 outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Receipt & Date</th>
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">Proposal #</th>
                <th className="py-3 px-4">Milestone Stage</th>
                <th className="py-3 px-4">UTR & Payment Mode</th>
                <th className="py-3 px-4 text-right">Amount Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/70">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-forest-900">{p.receiptNumber}</div>
                    <div className="text-[11px] text-stone-500">{formatIndianDate(p.paymentDate)}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-forest-900">
                    {p.guestName}
                    <div className="text-[10px] text-stone-400 font-normal">{p.guestPhone}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-700">
                    {p.quoteNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {p.stage}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-stone-800">{p.transactionReference}</span>
                    <span className="text-[10px] text-stone-400 block">{p.paymentMode}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 text-sm tabular-nums">
                    {formatINR(p.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Record Advance */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h2 className="text-sm font-bold text-forest-900">Record Customer Payment Advance</h2>
              <button onClick={() => setIsRecordModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-3.5">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Select Quotation *</label>
                <select
                  value={payForm.quoteId}
                  onChange={(e) => setPayForm({ ...payForm, quoteId: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white font-medium"
                >
                  {quotations.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.quoteNumber} — {q.guestName} ({formatINR(q.costing.finalSellingPrice)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Amount Received (₹) *</label>
                <input
                  type="number"
                  required
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-sm font-bold text-forest-900 tabular-nums"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Milestone Stage</label>
                <select
                  value={payForm.stage}
                  onChange={(e) => setPayForm({ ...payForm, stage: e.target.value as any })}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                >
                  <option value="Booking Advance (30%)">Booking Advance (30%)</option>
                  <option value="Second Instalment (40%)">Second Instalment (40%)</option>
                  <option value="Final Settlement (30%)">Final Settlement (30%)</option>
                  <option value="Custom">Custom Token</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Payment Mode</label>
                  <select
                    value={payForm.paymentMode}
                    onChange={(e) => setPayForm({ ...payForm, paymentMode: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Net Banking / NEFT">Net Banking / NEFT</option>
                    <option value="Credit / Debit Card">Credit / Debit Card</option>
                    <option value="Cash / POS">Cash / POS</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={payForm.paymentDate}
                    onChange={(e) => setPayForm({ ...payForm, paymentDate: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Transaction Ref / UTR *</label>
                <input
                  type="text"
                  required
                  value={payForm.transactionReference}
                  onChange={(e) => setPayForm({ ...payForm, transactionReference: e.target.value })}
                  placeholder="e.g. HDFC20261014991"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-semibold"
                >
                  Confirm Advance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
