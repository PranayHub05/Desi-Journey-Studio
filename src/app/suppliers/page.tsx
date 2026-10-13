'use client';

import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  IndianRupee,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  Clock,
  X,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Supplier, SupplierPaymentEntry } from '../../types';
import { formatINR, formatIndianDate } from '../../lib/calculations';

export default function SuppliersPage() {
  const {
    suppliers,
    supplierPayments,
    recordSupplierPayment,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState<Supplier | null>(null);

  // Payment Form
  const [payForm, setPayForm] = useState({
    amount: 15000,
    paymentDate: '2026-10-14',
    paymentMode: 'NEFT / RTGS' as SupplierPaymentEntry['paymentMode'],
    referenceUtr: 'HDFCR20261014099',
    tripTitle: 'Himachal Tour Settlement',
    notes: 'Advance room hold payout',
  });

  const totalPayableAll = suppliers.reduce((s, x) => s + x.totalAgreedPayable, 0);
  const totalPaidAll = suppliers.reduce((s, x) => s + x.totalPaid, 0);
  const totalBalanceAll = suppliers.reduce((s, x) => s + x.balanceOutstanding, 0);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.cityOrRegion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForPayment) return;

    recordSupplierPayment({
      supplierId: selectedSupplierForPayment.id,
      supplierName: selectedSupplierForPayment.name,
      amount: Number(payForm.amount),
      paymentDate: payForm.paymentDate,
      paymentMode: payForm.paymentMode,
      referenceUtr: payForm.referenceUtr,
      tripTitle: payForm.tripTitle,
      status: 'Completed',
      notes: payForm.notes,
    });

    setIsPaymentModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-forest-900 tracking-tight">
              Suppliers & Accounts Ledger
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Vendor accounts, fleet unions, hotel contracts, advance deposits, and UTR settlement records.
          </p>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
            Total Contracted Payable
          </span>
          <div className="text-2xl font-bold text-forest-900 mt-1 tabular-nums">
            {formatINR(totalPayableAll)}
          </div>
          <span className="text-[11px] text-stone-500">Across {suppliers.length} vendors</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
            Total Settled / Paid
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1 tabular-nums">
            {formatINR(totalPaidAll)}
          </div>
          <span className="text-[11px] text-emerald-800 font-medium">Bank & UPI transfers</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
            Outstanding Supplier Dues
          </span>
          <div className="text-2xl font-bold text-rose-600 mt-1 tabular-nums">
            {formatINR(totalBalanceAll)}
          </div>
          <span className="text-[11px] text-rose-700 font-medium">Payable upon trip check-in</span>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendor name or region..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-forest-900 outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Supplier / Vendor</th>
                <th className="py-3 px-4">Category & Region</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Total Contracted</th>
                <th className="py-3 px-4">Total Paid</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredSuppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-stone-50/70">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-forest-900">{sup.name}</div>
                    <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                      {sup.bankAccountDetails?.split(',')[0] || sup.upiId}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 font-semibold text-[10px]">
                      {sup.category}
                    </span>
                    <div className="text-[11px] text-stone-500 mt-1">{sup.cityOrRegion}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-stone-800">{sup.contactPerson}</div>
                    <div className="text-[11px] text-stone-500">{sup.phone}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-forest-900 tabular-nums">
                    {formatINR(sup.totalAgreedPayable)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-700 font-semibold tabular-nums">
                    {formatINR(sup.totalPaid)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-rose-600 font-bold tabular-nums">
                    {formatINR(sup.balanceOutstanding)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedSupplierForPayment(sup);
                        setIsPaymentModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-semibold text-[11px] shadow-2xs"
                    >
                      Record Payout
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History Ledger */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6 space-y-4">
        <h3 className="font-bold text-forest-900 text-sm">Recent Supplier Settlements & UTR Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-y border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Supplier Name</th>
                <th className="py-2.5 px-3">Trip Reference</th>
                <th className="py-2.5 px-3">Mode & UTR Reference</th>
                <th className="py-2.5 px-3 text-right">Amount Settled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {supplierPayments.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/50">
                  <td className="py-3 px-3 text-stone-600">{formatIndianDate(p.paymentDate)}</td>
                  <td className="py-3 px-3 font-semibold text-forest-900">{p.supplierName}</td>
                  <td className="py-3 px-3 text-stone-500">{p.tripTitle || 'General Settlement'}</td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-stone-700">{p.referenceUtr}</span>
                    <span className="text-[10px] text-stone-400 block">{p.paymentMode}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-forest-900 tabular-nums">
                    {formatINR(p.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Record Supplier Payout */}
      {isPaymentModalOpen && selectedSupplierForPayment && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-sm font-bold text-forest-900">
                Record Payout to {selectedSupplierForPayment.name}
              </h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-3.5">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Amount to Pay (₹) *</label>
                <input
                  type="number"
                  required
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-sm font-bold text-forest-900 tabular-nums"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Payment Mode</label>
                <select
                  value={payForm.paymentMode}
                  onChange={(e) => setPayForm({ ...payForm, paymentMode: e.target.value as any })}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                >
                  <option value="NEFT / RTGS">NEFT / RTGS</option>
                  <option value="UPI">UPI Transfer</option>
                  <option value="Cheque">Bank Cheque</option>
                  <option value="Cash">Cash Voucher</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Bank UTR / Transaction Reference *</label>
                <input
                  type="text"
                  required
                  value={payForm.referenceUtr}
                  onChange={(e) => setPayForm({ ...payForm, referenceUtr: e.target.value })}
                  placeholder="e.g. UTR-HDFC-9918231"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Payment Date</label>
                <input
                  type="date"
                  value={payForm.paymentDate}
                  onChange={(e) => setPayForm({ ...payForm, paymentDate: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-semibold"
                >
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
