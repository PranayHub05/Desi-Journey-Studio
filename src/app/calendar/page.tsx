'use client';

import React, { useState } from 'react';
import {
  CalendarDays,
  Car,
  Hotel as HotelIcon,
  Users,
  Printer,
  FileCheck,
  CheckCircle2,
  Clock,
  Compass,
  X,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Quotation } from '../../types';
import { formatIndianDate, formatINR } from '../../lib/calculations';

export default function TourCalendarPage() {
  const { quotations, companySettings } = useApp();

  const [selectedQuoteForVoucher, setSelectedQuoteForVoucher] = useState<Quotation | null>(null);
  const [voucherType, setVoucherType] = useState<'hotel' | 'driver' | 'guest'>('hotel');

  const departures = quotations.filter(
    (q) => q.status === 'Confirmed' || q.status === 'Sent'
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-forest-900 tracking-tight">
              Tour Operations & Movement Chart
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Dispatch movement calendar, assigned chauffeurs, rooming lists, and one-click printable vouchers.
          </p>
        </div>
      </div>

      {/* Movement Chart Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex justify-between items-center">
          <span className="font-bold text-forest-900 text-xs">Upcoming Tour Departures Manifest</span>
          <span className="text-[11px] text-stone-500">{departures.length} Trips Scheduled</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Departure Date</th>
                <th className="py-3 px-4">Guest & Pax</th>
                <th className="py-3 px-4">Route & Destination</th>
                <th className="py-3 px-4">Assigned Chauffeur & Vehicle</th>
                <th className="py-3 px-4">Voucher Status</th>
                <th className="py-3 px-4 text-right">Generate Vouchers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {departures.map((q) => (
                <tr key={q.id} className="hover:bg-stone-50/70">
                  <td className="py-3.5 px-4 font-semibold text-forest-900 whitespace-nowrap">
                    {formatIndianDate(q.startDate)}
                    <span className="text-[10px] text-stone-400 block font-normal">
                      {q.durationNights}N/{q.durationDays}D
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-forest-900">{q.guestName}</div>
                    <div className="text-[11px] text-stone-500">{q.adults} Adults {q.children > 0 ? `+ ${q.children} Chd` : ''}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-stone-800">{q.destinationsSummary}</div>
                    <div className="text-[10px] text-stone-400">Quote #{q.quoteNumber}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <Car className="w-3.5 h-3.5 text-forest-600 flex-shrink-0" />
                      <span>{q.vehicleName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {q.status === 'Confirmed' ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ready to Issue</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 w-fit">
                        Awaiting Advance
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedQuoteForVoucher(q);
                          setVoucherType('hotel');
                        }}
                        className="px-2.5 py-1 rounded bg-stone-100 hover:bg-forest-50 text-forest-900 text-[11px] font-medium transition-colors"
                      >
                        Hotel Voucher
                      </button>
                      <button
                        onClick={() => {
                          setSelectedQuoteForVoucher(q);
                          setVoucherType('driver');
                        }}
                        className="px-2.5 py-1 rounded bg-forest-800 hover:bg-forest-700 text-white text-[11px] font-medium transition-colors"
                      >
                        Duty Slip
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Voucher Modal (Printable) */}
      {selectedQuoteForVoucher && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto text-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-forest-900">
                  {voucherType === 'hotel'
                    ? 'Official Hotel Reservation Voucher'
                    : 'Chauffeur Vehicle Duty Slip & Dispatch Voucher'}
                </h2>
              </div>
              <button
                onClick={() => setSelectedQuoteForVoucher(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Voucher Document Box */}
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-300 space-y-4">
              <div className="flex justify-between items-start border-b border-stone-200 pb-4">
                <div>
                  <h3 className="text-base font-bold text-forest-900">{companySettings.agencyName}</h3>
                  <p className="text-[10px] text-stone-500">{companySettings.headOfficeAddress}</p>
                  <p className="text-[10px] text-stone-500">24x7 Helpline: {companySettings.phone}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    CONFIRMED BOOKING
                  </span>
                  <div className="font-mono text-xs font-bold text-forest-900 mt-1">
                    VCHR-{selectedQuoteForVoucher.quoteNumber}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-stone-400 block">Lead Guest:</span>
                  <strong className="text-forest-900 text-xs">{selectedQuoteForVoucher.guestName}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block">Contact Phone:</span>
                  <strong className="text-forest-900">{selectedQuoteForVoucher.guestPhone}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block">Check-in / Travel Date:</span>
                  <strong className="text-forest-900">{formatIndianDate(selectedQuoteForVoucher.startDate)}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block">Party Size:</span>
                  <strong className="text-forest-900">
                    {selectedQuoteForVoucher.adults} Adults {selectedQuoteForVoucher.children > 0 ? `, ${selectedQuoteForVoucher.children} Children` : ''}
                  </strong>
                </div>
              </div>

              {voucherType === 'hotel' ? (
                <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-2">
                  <span className="font-bold text-forest-900 block text-xs">Hotel Accommodations Manifest:</span>
                  {selectedQuoteForVoucher.days
                    .filter((d) => d.dayType !== 'Departure')
                    .map((d) => (
                      <div key={d.id} className="flex justify-between items-center text-[11px] border-b border-stone-100 pb-1">
                        <div>
                          <span className="font-semibold text-forest-900">Night {d.dayNumber}: </span>
                          <span>{d.customHotelName} ({d.hotelDestination})</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-700">{d.mealPlan} Plan</span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-2">
                  <span className="font-bold text-forest-900 block text-xs">Chauffeur & Fleet Dispatch Slip:</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>Vehicle: <strong>{selectedQuoteForVoucher.vehicleName}</strong></div>
                    <div>Reporting Time: <strong>10:00 AM at Arrival Station</strong></div>
                    <div>Tolls & Parking: <strong>Covered by Agency Slip</strong></div>
                    <div>Route: <strong>{selectedQuoteForVoucher.destinationsSummary}</strong></div>
                  </div>
                </div>
              )}

              <div className="text-[10px] text-stone-500 pt-2 border-t border-stone-200">
                Notice: All payments and billing settled directly with Desi Journey accounts. Guest must present valid Govt Photo ID at check-in.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedQuoteForVoucher(null)}
                className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
