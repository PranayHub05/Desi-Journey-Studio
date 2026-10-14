'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  Download,
  Share2,
  Mail,
  ArrowLeft,
  Lock,
  Unlock,
  Calendar,
  Users,
  MapPin,
  Car,
  Hotel as HotelIcon,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../../../context/AppContext';
import {
  formatINR,
  formatIndianDate,
  sanitizeQuotationForCustomer,
  generateWhatsAppMessage,
} from '../../../../lib/calculations';

export default function QuotationCustomerPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;

  const {
    getQuotationById,
    hotels,
    companySettings,
    recordShareEvent,
    updateQuotation,
  } = useApp();

  const rawQuote = getQuotationById(quoteId);

  // Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState(
    rawQuote ? `Travel Proposal for ${rawQuote.tripTitle} - Desi Journey` : ''
  );
  const [emailBody, setEmailBody] = useState(
    rawQuote
      ? `Dear ${rawQuote.guestName},\n\nNamaste! We are delighted to share your tailored travel proposal for ${rawQuote.tripTitle}.\n\nPlease review the day-wise itinerary, inclusions, and payment schedule.\n\nWarm regards,\nDesi Journey Studio`
      : ''
  );

  if (!rawQuote) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
        <p className="font-semibold text-sm text-forest-900 mb-2">Proposal Not Found</p>
        <p>The requested quotation could not be located in your local session.</p>
        <Link
          href="/itineraries"
          className="mt-4 inline-block px-4 py-2 bg-forest-800 text-white rounded-lg text-xs font-semibold"
        >
          Return to Itineraries
        </Link>
      </div>
    );
  }

  // Sanitized view according to current mode
  const { sanitizedQuote, isPreAdvanceMasked } = sanitizeQuotationForCustomer(
    rawQuote,
    hotels
  );

  const toggleDisclosureMode = () => {
    const newMode = isPreAdvanceMasked ? 'disclosed' : 'masked';
    updateQuotation(rawQuote.id, {
      customization: {
        ...rawQuote.customization,
        disclosureMode: newMode,
        showExactHotelNames: newMode === 'disclosed',
        showDriverVehicleDetails: newMode === 'disclosed',
      },
    });
  };

  const shareableUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/itineraries/${rawQuote.id}/preview`
      : '';

  const whatsAppText = generateWhatsAppMessage(
    sanitizedQuote,
    shareableUrl,
    companySettings.agencyName
  );

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Top Action Ribbon (Hidden in Print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-stone-200 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/itineraries"
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-forest-900">
                {rawQuote.quoteNumber} (v{rawQuote.version})
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  rawQuote.status === 'Confirmed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-sky-100 text-sky-800'
                }`}
              >
                {rawQuote.status}
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Customer Proposal Presentation & Distribution
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Disclosure Mode Switcher */}
          <button
            onClick={toggleDisclosureMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isPreAdvanceMasked
                ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
            }`}
            title="Click to toggle Pre-Advance (Masked) vs Confirmed (Disclosed) mode"
          >
            {isPreAdvanceMasked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-purple-600" />
                <span>Masked Mode (Pre-Advance)</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-teal-600" />
                <span>Disclosed Mode (Confirmed)</span>
              </>
            )}
          </button>

          {/* WhatsApp Direct Share */}
          <a
            href={`https://wa.me/${rawQuote.guestPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsAppText)}`}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              recordShareEvent({
                quoteId: rawQuote.id,
                quoteNumber: rawQuote.quoteNumber,
                channel: 'WhatsApp',
                recipient: rawQuote.guestPhone,
                disclosureMode: rawQuote.customization.disclosureMode,
                version: rawQuote.version,
              })
            }
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp Share</span>
          </a>

          {/* Email Composer Trigger */}
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>

          {/* Print / Download PDF */}
          <button
            onClick={() => {
              recordShareEvent({
                quoteId: rawQuote.id,
                quoteNumber: rawQuote.quoteNumber,
                channel: 'PDF Download',
                recipient: rawQuote.guestName,
                disclosureMode: rawQuote.customization.disclosureMode,
                version: rawQuote.version,
              });
              window.print();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>

          <Link
            href={`/itineraries/builder?edit=${rawQuote.id}`}
            className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium text-xs"
          >
            Edit in Studio
          </Link>
        </div>
      </div>

      {/* Mode Advisory Notice (Hidden in Print) */}
      <div className="no-print">
        {isPreAdvanceMasked ? (
          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-700 flex-shrink-0" />
              <span>
                <strong>Pre-Advance Privacy Mode Active:</strong> Specific hotel names and driver contacts are masked to protect agency business. All internal margins and supplier rates are hidden.
              </span>
            </div>
            <button
              onClick={toggleDisclosureMode}
              className="text-[11px] font-bold text-purple-700 hover:underline whitespace-nowrap ml-2"
            >
              Switch to Disclosed View →
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Unlock className="w-4 h-4 text-teal-700 flex-shrink-0" />
              <span>
                <strong>Confirmed Trip Mode Active:</strong> Hotel properties and vehicle/driver details are disclosed for the customer.
              </span>
            </div>
            <button
              onClick={toggleDisclosureMode}
              className="text-[11px] font-bold text-teal-700 hover:underline whitespace-nowrap ml-2"
            >
              Switch to Masked View →
            </button>
          </div>
        )}
      </div>

      {/* ===================================================================
          PRINT-PERFECT CUSTOMER PROPOSAL DOCUMENT
          Clean page breaks, Alpine Premium design system, zero typography clipping
          =================================================================== */}
      <div className="print-container bg-white rounded-3xl border border-stone-200 shadow-elevated p-8 md:p-12 max-w-4xl mx-auto space-y-8">
        {/* ===================================================================
            BLOCK 1: COVER PAGE & EXECUTIVE SUMMARY (Ends on Page 1)
            =================================================================== */}
        <div className="page-break-after space-y-6 pb-6">
          {/* Document Header & Desi Journey Branding */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b-2 border-forest-800">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white p-1 border border-stone-200 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                  <img
                    src={companySettings.logoUrl || '/images/desi-journey-logo.png'}
                    alt={companySettings.agencyName}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-xl font-bold text-forest-900 tracking-tight block">
                    {companySettings.agencyName}
                  </span>
                  <p className="text-xs text-stone-500 font-medium">
                    {companySettings.tagline}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-stone-400 mt-1">
                GSTIN: {companySettings.gstin} • Head Office: {companySettings.headOfficeAddress} • Website: {companySettings.website || 'desijourney.com'}
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-stone-600 space-y-0.5">
              <div className="font-mono font-bold text-forest-900 text-sm">
                Proposal #{sanitizedQuote.quoteNumber}
              </div>
              <div>Date Issued: {formatIndianDate(sanitizedQuote.createdAt)}</div>
              <div className="font-medium text-emerald-800">Direct Helpline: {companySettings.phone}</div>
              <div className="text-[11px] text-stone-500">{companySettings.email}</div>
            </div>
          </div>

          {/* Hero Title & Route Ribbon */}
          <div className="bg-gradient-to-br from-forest-900 to-forest-800 text-white rounded-2xl p-6 sm:p-8 shadow-card">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400 px-2 py-0.5 rounded bg-forest-950/60 inline-block mb-2">
              Personalized Travel Itinerary & Quote
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {sanitizedQuote.tripTitle}
            </h1>

            <div className="mt-3 flex items-center gap-2 text-stone-300 text-xs font-medium flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
              <span>Route: {sanitizedQuote.destinationsSummary}</span>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-forest-700/60 text-xs">
              <div>
                <span className="text-stone-300 text-[11px] block">Prepared For:</span>
                <strong className="text-white text-sm">{sanitizedQuote.guestName}</strong>
              </div>
              <div>
                <span className="text-stone-300 text-[11px] block">Travel Period:</span>
                <strong className="text-white text-sm">
                  {formatIndianDate(sanitizedQuote.startDate)} → {formatIndianDate(sanitizedQuote.endDate)}
                </strong>
                <span className="text-[10px] text-gold-400 block font-semibold">
                  {sanitizedQuote.durationNights} Nights / {sanitizedQuote.durationDays} Days
                </span>
              </div>
              <div>
                <span className="text-stone-300 text-[11px] block">Travellers:</span>
                <strong className="text-white text-sm">
                  {sanitizedQuote.adults} Adults {sanitizedQuote.children > 0 ? `+ ${sanitizedQuote.children} Chd` : ''}
                </strong>
              </div>
              <div>
                <span className="text-stone-300 text-[11px] block">Dedicated Transport:</span>
                <strong className="text-white text-sm">{sanitizedQuote.vehicleName}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            BLOCK 2: DAY-BY-DAY CURATED ITINERARY (Ends cleanly on its page)
            =================================================================== */}
        <div className="page-break-after space-y-6 pb-6">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <h2 className="text-base font-bold text-forest-900 uppercase tracking-wider text-xs">
              Day-by-Day Curated Itinerary
            </h2>
            <span className="text-[11px] text-stone-500 font-medium">
              {sanitizedQuote.days.length} Days Planned • Verified Route Circuit
            </span>
          </div>

          <div className="space-y-5">
            {sanitizedQuote.days.map((day) => (
              <div
                key={day.id}
                className="page-break-inside-avoid border border-stone-200 rounded-2xl p-5 hover:border-emerald-300 transition-colors bg-white shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-forest-800 text-gold-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      D{day.dayNumber}
                    </span>
                    <div>
                      <h3 className="font-bold text-forest-900 text-sm">{day.title}</h3>
                      <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                        <span>{formatIndianDate(day.date)}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">{day.dayType}</span>
                        <span>•</span>
                        <span>{day.routeTitle}</span>
                      </div>
                    </div>
                  </div>

                  {/* Meal Plan Pill */}
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-forest-800 bg-forest-50 px-2.5 py-1 rounded-full">
                    <span>Meals:</span>
                    <span>{day.mealPlan}</span>
                    <span className="text-stone-400">
                      ({day.breakfastIncluded ? 'B' : ''}
                      {day.lunchIncluded ? ', L' : ''}
                      {day.dinnerIncluded ? ', D' : ''})
                    </span>
                  </div>
                </div>

                {/* Hotel Stay Card (Masked or Disclosed) */}
                {day.customHotelName && day.dayType !== 'Departure' && (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-3 text-xs">
                    <HotelIcon className="w-4 h-4 text-forest-700 flex-shrink-0" />
                    <div>
                      <span className="text-stone-400 text-[10px] block">Overnight Stay:</span>
                      <strong className="text-forest-900 font-semibold">
                        {day.customHotelName}
                      </strong>
                      <span className="text-[11px] text-stone-500 ml-2">
                        ({day.roomCategory} • {day.mealPlan} Plan)
                      </span>
                    </div>
                  </div>
                )}

                {/* Activities Timeline */}
                {day.activities.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {day.activities.map((act) => (
                      <div
                        key={act.id}
                        className="text-xs text-stone-600 pl-3.5 border-l-2 border-emerald-600 py-0.5"
                      >
                        <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                          {act.timeSlot && (
                            <span className="text-[11px] font-mono text-emerald-800">
                              [{act.timeSlot}]
                            </span>
                          )}
                          <span>{act.title}</span>
                          {act.isEstimate && (
                            <span className="text-[10px] font-normal text-stone-400 italic">
                              (Estimate — please verify)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                          {act.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ===================================================================
            BLOCK 3: PACKAGE INCLUSIONS & EXCLUSIONS (Ends cleanly on its page)
            =================================================================== */}
        <div className="page-break-after page-break-inside-avoid space-y-4 pb-6">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <h2 className="text-base font-bold text-forest-900 uppercase tracking-wider text-xs">
              Contractual Scope: Inclusions & Exclusions
            </h2>
            <span className="text-[11px] text-stone-500">Trip Policy Specifications</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Inclusions */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-2.5">
              <div className="font-bold text-forest-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Package Inclusions</span>
              </div>
              <ul className="space-y-1.5 text-stone-700 text-[11px] leading-relaxed">
                {sanitizedQuote.inclusions.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exclusions */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-2.5">
              <div className="font-bold text-forest-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-[10px]">
                  ✕
                </span>
                <span>Package Exclusions</span>
              </div>
              <ul className="space-y-1.5 text-stone-700 text-[11px] leading-relaxed">
                {sanitizedQuote.exclusions.map((exc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold mt-0.5">✕</span>
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ===================================================================
            BLOCK 4: PRICING & PAYMENT SCHEDULE (Ends cleanly on its page)
            =================================================================== */}
        <div className="page-break-after page-break-inside-avoid bg-forest-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-elevated">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-forest-800">
            <div>
              <span className="text-[11px] text-stone-300 block">Total Tour Investment</span>
              <div className="text-3xl font-bold text-gold-400 tabular-nums">
                {formatINR(sanitizedQuote.costing.finalSellingPrice)}
              </div>
              <div className="text-xs text-stone-300 mt-1">
                {sanitizedQuote.costing.gstEnabled
                  ? '✓ Inclusive of 5% Tour Operator GST (SAC 998555)'
                  : 'GST Not Included in Price'} • {formatINR(sanitizedQuote.costing.pricePerAdult)} per adult
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-stone-300 block">Required Booking Advance</span>
              <div className="text-xl font-bold text-white tabular-nums">
                {formatINR(sanitizedQuote.costing.advanceAmountRequired)} ({sanitizedQuote.costing.advancePercentageRequired}%)
              </div>
              <div className="text-xs text-stone-300 mt-0.5">
                Remaining Balance on Arrival: {formatINR(sanitizedQuote.costing.balanceDueAmount)}
              </div>
            </div>
          </div>

          {/* Staged Milestone Payment Schedule */}
          <div className="space-y-2 text-xs">
            <span className="font-bold text-gold-400 uppercase tracking-wider text-[11px]">
              Staged Milestone Payment Schedule
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-forest-950/60 border border-forest-800">
                <span className="text-[10px] text-stone-400 font-semibold block">Stage 1: 30% Advance</span>
                <strong className="text-white text-xs mt-1 block">
                  {formatINR(sanitizedQuote.costing.advanceAmountRequired)}
                </strong>
                <span className="text-[10px] text-stone-300">Locks provisional hotel and vehicle holds</span>
              </div>
              <div className="p-3 rounded-xl bg-forest-950/60 border border-forest-800">
                <span className="text-[10px] text-stone-400 font-semibold block">Stage 2: 40% Pre-Arrival</span>
                <strong className="text-white text-xs mt-1 block">
                  {formatINR(Math.round(sanitizedQuote.costing.finalSellingPrice * 0.4))}
                </strong>
                <span className="text-[10px] text-stone-300">Due 15 days prior for voucher release</span>
              </div>
              <div className="p-3 rounded-xl bg-forest-950/60 border border-forest-800">
                <span className="text-[10px] text-stone-400 font-semibold block">Stage 3: 30% Balance</span>
                <strong className="text-white text-xs mt-1 block">
                  {formatINR(sanitizedQuote.costing.balanceDueAmount - Math.round(sanitizedQuote.costing.finalSellingPrice * 0.4))}
                </strong>
                <span className="text-[10px] text-stone-300">Strictly payable on arrival at vehicle handover</span>
              </div>
            </div>
          </div>

          {/* Official Bank & UPI Transfer Details */}
          <div className="p-4 rounded-xl bg-forest-950/80 border border-gold-500/30 text-xs space-y-1">
            <div className="font-bold text-gold-400 text-xs">
              Official Desi Journey Banking & UPI Settlement Channel
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] text-stone-200">
              <div>
                <div>Bank: <strong>{companySettings.bankName}</strong> ({companySettings.branchName})</div>
                <div>Account Name: <strong>{companySettings.accountHolderName}</strong></div>
              </div>
              <div>
                <div>Current A/C: <strong>{companySettings.accountNumber}</strong></div>
                <div>IFSC: <strong>{companySettings.ifscCode}</strong> • UPI: <strong className="text-gold-400">{companySettings.upiVpa}</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            BLOCK 5: TERMS, CONDITIONS & GUEST SIGN-OFF (Ends cleanly on final page)
            =================================================================== */}
        <div className="page-break-inside-avoid space-y-6 pt-2 text-xs text-stone-600">
          <div className="space-y-3">
            <h4 className="font-bold text-forest-900 text-xs uppercase tracking-wider">
              Terms, Conditions & Cancellation Policy
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-[11px] leading-relaxed">
              {sanitizedQuote.termsAndConditions.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
          </div>

          {/* Acceptance & Authorized Signatory Block */}
          <div className="pt-6 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px] text-stone-600">
            <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-2">
              <div className="font-bold text-forest-900 text-xs">Guest Acceptance & Confirmation</div>
              <p className="text-[10px] text-stone-500 leading-tight">
                I hereby acknowledge and accept the day-wise itinerary, inclusions, exclusions, and payment milestones outlined in this proposal.
              </p>
              <div className="pt-8 border-b border-stone-300"></div>
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>Guest: {sanitizedQuote.guestName}</span>
                <span>Date: ____/____/________</span>
              </div>
            </div>

            <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-2">
              <div className="font-bold text-forest-900 text-xs">For {companySettings.agencyName}</div>
              <p className="text-[10px] text-stone-500 leading-tight">
                Authorized Travel Specialist Desk • Registered Tour Program
              </p>
              <div className="pt-8 border-b border-stone-300"></div>
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>Authorized Signatory</span>
                <span>Agency Seal</span>
              </div>
            </div>
          </div>

          {/* Document Footer */}
          <div className="pt-6 border-t border-stone-200 text-center text-[11px] text-stone-400">
            <p>© {new Date().getFullYear()} {companySettings.agencyName} • Curated with pride in India for {sanitizedQuote.guestName}.</p>
            <p className="mt-1">For modifications, contact your personal trip concierge: {companySettings.phone} • {companySettings.email}</p>
          </div>
        </div>
      </div>

      {/* Email Composer Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-forest-700" />
                <h3 className="text-sm font-bold text-forest-900">Compose Proposal Email</h3>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">To Recipient</label>
              <input
                type="email"
                value={rawQuote.guestEmail || ''}
                readOnly
                className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Subject</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-200 font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Message Body</label>
              <textarea
                rows={5}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 leading-relaxed"
              />
            </div>

            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-stone-500">
              📎 Interactive Proposal Link: <strong>{shareableUrl}</strong>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium"
              >
                Cancel
              </button>
              <a
                href={`mailto:${rawQuote.guestEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(
                  `${emailBody}\n\nView Your Interactive Itinerary:\n${shareableUrl}`
                )}`}
                onClick={() => {
                  recordShareEvent({
                    quoteId: rawQuote.id,
                    quoteNumber: rawQuote.quoteNumber,
                    channel: 'Email',
                    recipient: rawQuote.guestEmail || rawQuote.guestName,
                    disclosureMode: rawQuote.customization.disclosureMode,
                    version: rawQuote.version,
                  });
                  setIsEmailModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-semibold flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Launch Mail App</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
