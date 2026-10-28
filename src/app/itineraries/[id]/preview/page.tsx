'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
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
  CheckCircle2,
  Phone,
  Clock,
  Sparkles,
  Check,
  X,
  Building,
  UserCheck,
  ShieldCheck,
  Printer,
  Layers,
} from 'lucide-react';
import { useApp } from '../../../../context/AppContext';
import {
  formatINR,
  formatIndianDate,
  addDaysToDate,
  sanitizeQuotationForCustomer,
  generateWhatsAppMessage,
  groupItineraryDaysByLocation,
  GroupedDaySection,
} from '../../../../lib/calculations';

export default function QuotationCustomerPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;

  const {
    getQuotationById,
    hotels,
    vehicles,
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
      ? `Dear ${rawQuote.guestName},\n\nNamaste! We are delighted to share your tailored travel proposal for ${rawQuote.tripTitle}.\n\nPlease review the day-wise itinerary, accommodations, and inclusions.\n\nWarm regards,\nDesi Journey Studio`
      : ''
  );

  // Group sequential days into distinct hotel accommodation stays
  const hotelStays = useMemo(() => {
    if (!rawQuote) return [];
    const { sanitizedQuote } = sanitizeQuotationForCustomer(rawQuote, hotels);
    const stays: {
      destination: string;
      hotelName: string;
      roomCategory: string;
      mealPlan: string;
      nightsCount: number;
      checkInDate: string;
      checkOutDate: string;
      imageUrl?: string;
    }[] = [];

    let currentStay: (typeof stays)[0] | null = null;
    for (let idx = 0; idx < sanitizedQuote.days.length; idx++) {
      const day = sanitizedQuote.days[idx];
      if (day.dayType === 'Departure') continue;
      const hotelObj = hotels.find((h) => h.id === day.hotelId);
      const hName = day.customHotelName || hotelObj?.name || `${day.hotelDestination} Selected Property`;
      const img = hotelObj?.imageUrl || hotelObj?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

      const dayDate = day.date || (rawQuote.startDate ? addDaysToDate(rawQuote.startDate, idx) : '');

      if (currentStay && currentStay.hotelName === hName && currentStay.destination === day.hotelDestination) {
        currentStay.nightsCount += 1;
        currentStay.checkOutDate = addDaysToDate(currentStay.checkInDate, currentStay.nightsCount);
      } else {
        if (currentStay) {
          currentStay.checkOutDate = addDaysToDate(currentStay.checkInDate, currentStay.nightsCount);
          stays.push(currentStay);
        }
        currentStay = {
          destination: day.hotelDestination,
          hotelName: hName,
          roomCategory: day.roomCategory || 'Deluxe Room',
          mealPlan: day.mealPlan || 'MAP',
          nightsCount: 1,
          checkInDate: dayDate,
          checkOutDate: addDaysToDate(dayDate, 1),
          imageUrl: img,
        };
      }
    }
    if (currentStay) {
      currentStay.checkOutDate = addDaysToDate(currentStay.checkInDate, currentStay.nightsCount);
      stays.push(currentStay);
    }
    return stays;
  }, [rawQuote, hotels]);

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

  // Group Multi-Day Stays Toggle State (default to true)
  const [groupMultiDayStays, setGroupMultiDayStays] = useState<boolean>(() => {
    return rawQuote?.customization?.groupMultiDayStays !== false;
  });

  const toggleGroupMultiDayStays = () => {
    const nextVal = !groupMultiDayStays;
    setGroupMultiDayStays(nextVal);
    if (rawQuote) {
      updateQuotation(rawQuote.id, {
        customization: {
          ...rawQuote.customization,
          groupMultiDayStays: nextVal,
        },
      });
    }
  };

  // Grouped days calculation: unites consecutive days in the same destination into single sections
  const groupedDays = useMemo(() => {
    if (!sanitizedQuote?.days) return [];
    return groupItineraryDaysByLocation(sanitizedQuote.days);
  }, [sanitizedQuote]);

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

  const selectedVehicleObj = vehicles.find((v) => v.id === sanitizedQuote.vehicleId);

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
          {/* Multi-Day Stays Grouping Toggle */}
          <button
            onClick={toggleGroupMultiDayStays}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              groupMultiDayStays
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
            title="Toggle between single consolidated section for multi-day stays vs day-by-day split"
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>{groupMultiDayStays ? 'Grouped Stays (Active)' : 'Day-by-Day (Split)'}</span>
          </button>

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
            className="px-4 py-1.5 rounded-xl bg-[#102a43] hover:bg-[#0c1f32] text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-gold-400" />
            <span>Download PDF / Print</span>
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
                <strong>Pre-Advance Privacy Mode Active:</strong> Specific hotel names and driver contacts are masked. Supplier wholesale costs and internal profit margins are confidential.
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
                <strong>Confirmed Trip Mode Active:</strong> Full hotel properties and vehicle details are disclosed for the customer.
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
          AUTHENTIC DESI JOURNEY PRINTABLE PROPOSAL DOCUMENT
          Mirrors the uploaded official 10-page itinerary reference PDF:
          - Authentic Top Header with Desi Journey Logo & Slogan
          - Client Greeting & 6-cell Trip Grid
          - Dark Blue Section Header Pills
          - 2-Column Hotel Cards with Real Property Photos
          - Transportation Schedule Table
          - Day-by-Day narrative with distance and milestone points
          - Inclusions & Exclusions
          - Tour Specialist Consultant Card (Pradipta Mukherjee)
          - Persistent Blue Footer with Kolkata Office & Direct Helpline
          =================================================================== */}
      <div className="print-document bg-white rounded-3xl border border-stone-200 shadow-elevated p-6 sm:p-10 md:p-12 max-w-4xl mx-auto space-y-8 text-xs text-stone-800">
        
        {/* DOCUMENT HEADER: LOGO ON LEFT, TAGLINE ON RIGHT */}
        <div className="flex items-center justify-between pb-6 border-b-2 border-[#102a43] gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/desi-journey-logo.png"
              alt="Desi Journey Logo"
              className="h-16 w-auto object-contain"
              onError={(e) => {
                // Fallback to /logo.png if needed
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>

          <div className="text-right">
            <div className="text-base sm:text-lg font-extrabold text-[#102a43] tracking-wide uppercase">
              {companySettings.tagline || 'YOUR PERFECT TRAVEL PARTNER'}
            </div>
            <div className="text-[11px] font-semibold text-stone-500 mt-0.5">
              www.desijourney.com • Kolkata Head Office
            </div>
          </div>
        </div>

        {/* GREETING & COVER BOX */}
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-sm font-bold text-stone-900">
              Dear {sanitizedQuote.guestName ? `Mr./Ms. ${sanitizedQuote.guestName}` : 'Valued Guest'},
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Greetings from <strong>Desi Journey!</strong> Thank you for choosing us as your preferred travel specialist.
              We are thrilled to present our customized holiday proposal for your upcoming tour.
            </p>
          </div>

          {/* 6-Cell Trip Details Grid (From Reference PDF) */}
          <div className="border-2 border-[#102a43] rounded-2xl overflow-hidden shadow-2xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-stone-200 bg-white">
              <div className="p-3 bg-stone-50/80">
                <span className="text-[10px] font-bold text-[#102a43] uppercase tracking-wider block">
                  DESTINATION
                </span>
                <strong className="text-xs text-stone-900 font-bold block mt-0.5 truncate">
                  {sanitizedQuote.destinationsSummary || 'Bespoke Circuit'}
                </strong>
              </div>

              <div className="p-3 bg-stone-50/80">
                <span className="text-[10px] font-bold text-[#102a43] uppercase tracking-wider block">
                  START DATE
                </span>
                <strong className="text-xs text-stone-900 font-bold block mt-0.5">
                  {formatIndianDate(sanitizedQuote.startDate)}
                </strong>
              </div>

              <div className="p-3 bg-stone-50/80">
                <span className="text-[10px] font-bold text-[#102a43] uppercase tracking-wider block">
                  DURATION
                </span>
                <strong className="text-xs text-stone-900 font-bold block mt-0.5">
                  {sanitizedQuote.durationNights} Nights / {sanitizedQuote.durationDays} Days
                </strong>
              </div>

              <div className="p-3">
                <span className="text-[10px] font-bold text-[#102a43] uppercase tracking-wider block">
                  PAX
                </span>
                <strong className="text-xs text-stone-900 font-bold block mt-0.5">
                  {sanitizedQuote.adults} Adults {sanitizedQuote.children > 0 ? `+ ${sanitizedQuote.children} Child` : ''}
                </strong>
              </div>

              <div className="p-3">
                <span className="text-[10px] font-bold text-[#102a43] uppercase tracking-wider block">
                  TRIP ID
                </span>
                <strong className="text-xs text-stone-900 font-mono font-bold block mt-0.5">
                  {sanitizedQuote.quoteNumber}
                </strong>
              </div>

              <div className="p-3">
                <span className="text-[10px] font-bold text-[#102a43] uppercase tracking-wider block">
                  REFERENCE ID
                </span>
                <strong className="text-xs text-stone-900 font-mono font-bold block mt-0.5">
                  {sanitizedQuote.leadId ? `REF-${sanitizedQuote.leadId.slice(-6).toUpperCase()}` : 'DJ-DIRECT-2026'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            SECTION 1: HOTELS / ACCOMMODATIONS (Matching Reference PDF)
            =================================================================== */}
        <div className="space-y-4 pt-2">
          {/* Section Header Pill */}
          <div className="inline-block bg-[#102a43] text-white px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider shadow-xs">
            Hotels / Accommodations
          </div>

          <div className="space-y-4">
            {hotelStays.map((stay, sIdx) => (
              <div
                key={sIdx}
                className="page-break-inside-avoid border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-2xs hover:border-[#102a43]/40 transition-all grid grid-cols-1 md:grid-cols-3"
              >
                {/* Left 2 Cols: Hotel Details */}
                <div className="p-5 md:col-span-2 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-white bg-[#102a43] px-2 py-0.5 rounded-md">
                        Stay {sIdx + 1}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {stay.destination}
                      </span>
                      <span className="text-[11px] font-bold text-stone-700 ml-auto">
                        {stay.nightsCount} {stay.nightsCount === 1 ? 'Night' : 'Nights'}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-stone-900 mt-2">
                      {stay.hotelName}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-stone-100">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                        Room Category:
                      </span>
                      <strong className="text-stone-800 text-xs">{stay.roomCategory}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                        Meal Plan:
                      </span>
                      <strong className="text-emerald-800 font-bold text-xs">
                        {stay.mealPlan} ({stay.mealPlan === 'MAP' ? 'Breakfast & Dinner' : stay.mealPlan === 'CP' ? 'Breakfast Included' : 'Room Only'})
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                        Check-in:
                      </span>
                      <span className="text-stone-700 font-medium text-[11px]">
                        {formatIndianDate(stay.checkInDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                        Check-out:
                      </span>
                      <span className="text-stone-700 font-medium text-[11px]">
                        {formatIndianDate(stay.checkOutDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Col: Property Photo */}
                <div className="relative h-40 md:h-auto bg-stone-100 border-t md:border-t-0 md:border-l border-stone-200">
                  <img
                    src={stay.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                    alt={stay.hotelName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[9px] font-semibold">
                    Verified Accommodation
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===================================================================
            SECTION 2: TRANSPORTATION (Matching Reference PDF)
            =================================================================== */}
        <div className="space-y-4 pt-2">
          {/* Section Header Pill */}
          <div className="inline-block bg-[#102a43] text-white px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider shadow-xs">
            Transportation
          </div>

          <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#102a43] text-white text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3 font-semibold">Vehicle Allotment</th>
                  <th className="p-3 font-semibold text-center">Units</th>
                  <th className="p-3 font-semibold">Route & Usage Terms</th>
                  <th className="p-3 font-semibold">Service Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white">
                <tr>
                  <td className="p-3.5 font-bold text-stone-900">
                    {sanitizedQuote.vehicleName || selectedVehicleObj?.displayName || 'Private AC Vehicle'}
                  </td>
                  <td className="p-3.5 text-center font-bold text-stone-800">1</td>
                  <td className="p-3.5 text-stone-600 leading-relaxed">
                    Exclusive private vehicle allocated from arrival pickup to final departure drop as per itinerary schedule. Garage-to-garage basis. Includes driver allowances, toll taxes, fuel, and parking fees.
                  </td>
                  <td className="p-3.5 font-medium text-stone-700 whitespace-nowrap">
                    08:00 AM – 07:00 PM
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ===================================================================
            SECTION 3: DAY WISE ITINERARY (Matching Reference PDF)
            Supports single consolidated sections for multi-day stays in one location
            =================================================================== */}
        <div className="space-y-5 pt-2">
          {/* Section Header Pill & Controls */}
          <div className="flex items-center justify-between">
            <div className="inline-block bg-[#102a43] text-white px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider shadow-xs">
              Day Wise Itinerary
            </div>
            {groupMultiDayStays && (
              <span className="no-print text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                ✨ Consolidated Multi-Day Stay View Active
              </span>
            )}
          </div>

          <div className="space-y-4">
            {groupMultiDayStays ? (
              groupedDays.map((group, gIdx) => {
                if (group.isMultiDay) {
                  return (
                    <div
                      key={`group-${group.startDay}-${group.endDay}-${gIdx}`}
                      className="page-break-inside-avoid border-2 border-[#102a43]/20 hover:border-[#102a43]/50 rounded-2xl p-5 sm:p-6 bg-white shadow-2xs space-y-4 transition-all"
                    >
                      {/* Unified Multi-Day Section Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-stone-100">
                        <div className="flex items-center gap-3">
                          <span className="px-3.5 py-1.5 rounded-xl bg-[#102a43] text-gold-400 font-extrabold text-xs shadow-2xs tracking-wide whitespace-nowrap">
                            Day {group.startDay} – Day {group.endDay}
                          </span>
                          <div>
                            <h4 className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center gap-2 flex-wrap">
                              <span>{group.destination} Stay &amp; Exploration</span>
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                {group.daysCount} Days / {group.nightsCount} Nights
                              </span>
                            </h4>
                            <div className="text-[11px] text-stone-500 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" />
                              <span>{formatIndianDate(group.startDate)} to {formatIndianDate(group.endDate)}</span>
                              <span className="text-stone-300">•</span>
                              <span className="text-[#102a43] font-semibold">{group.destination} Base</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                          {group.mealPlan && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                              Meal Plan: {group.mealPlan}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Day-by-Day Sightseeing & Activities Details inside this Stay */}
                      <div className="space-y-3 pt-1">
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                          Day-Wise Sightseeing &amp; Excursion Details:
                        </div>
                        {group.days.map((day) => (
                          <div
                            key={day.id}
                            className="rounded-xl p-3.5 bg-stone-50/80 border border-stone-200/80 space-y-2 hover:bg-stone-50 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-stone-200/60">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-[#102a43] text-white font-bold text-[11px]">
                                  Day {day.dayNumber}
                                </span>
                                <strong className="text-xs font-bold text-stone-900">
                                  {day.title}
                                </strong>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-stone-500">
                                <span>{formatIndianDate(day.date)}</span>
                                {day.routeTitle && (
                                  <>
                                    <span className="text-stone-300">•</span>
                                    <span className="text-stone-700 font-medium">{day.routeTitle}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Activities for this day */}
                            {day.activities.length > 0 ? (
                              <div className="space-y-1.5 pt-1 pl-1">
                                {day.activities.map((act) => (
                                  <div key={act.id} className="text-xs text-stone-700 flex items-start gap-2 leading-relaxed">
                                    <span className="text-emerald-700 font-bold mt-0.5">✓</span>
                                    <div>
                                      <strong className="text-stone-900">{act.title}: </strong>
                                      <span>{act.description}</span>
                                      {act.timeSlot && (
                                        <span className="text-[10px] text-stone-400 font-mono ml-1.5">
                                          ({act.timeSlot})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-stone-400 italic text-[11px] pl-1">
                                Leisure day for relaxing and exploring local spots at your own pace.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Unified Overnight Accommodation Box for the entire stay */}
                      {group.hotelName && (
                        <div className="p-3.5 rounded-xl bg-[#102a43]/5 border border-[#102a43]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-stone-700">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#102a43] text-gold-400 flex items-center justify-center shrink-0 shadow-2xs">
                              <HotelIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                                Stay Property ({group.daysCount} Nights / {group.destination})
                              </span>
                              <strong className="text-stone-900 font-bold text-xs sm:text-sm">
                                {group.hotelName}
                              </strong>
                            </div>
                          </div>
                          <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 self-start sm:self-auto">
                            {group.roomCategory || 'Deluxe Room'} • {group.mealPlan} Plan
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // Single day card
                const singleDay = group.days[0];
                return (
                  <div
                    key={singleDay.id}
                    className="page-break-inside-avoid border border-stone-200 rounded-2xl p-5 bg-white shadow-2xs space-y-3"
                  >
                    {/* Day Header Ribbon */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-stone-200">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-lg bg-[#102a43] text-white font-bold text-xs shadow-2xs">
                          Day {singleDay.dayNumber}
                        </span>
                        <div>
                          <h4 className="font-bold text-stone-900 text-sm">{singleDay.title}</h4>
                          <div className="text-[11px] text-stone-500 font-medium mt-0.5">
                            {formatIndianDate(singleDay.date)} • {singleDay.dayType}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {singleDay.routeTitle && (
                          <span className="text-[11px] text-stone-600 font-medium px-2.5 py-0.5 rounded-md bg-stone-100">
                            {singleDay.routeTitle}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          {singleDay.mealPlan}
                        </span>
                      </div>
                    </div>

                    {/* Day Narrative / Activities */}
                    {singleDay.activities.length > 0 && (
                      <div className="space-y-2 pt-1 pl-2">
                        {singleDay.activities.map((act) => (
                          <div key={act.id} className="text-xs text-stone-700 flex items-start gap-2 leading-relaxed">
                            <span className="text-[#102a43] font-bold mt-0.5">•</span>
                            <div>
                              <strong className="text-stone-900">{act.title}: </strong>
                              <span>{act.description}</span>
                              {act.timeSlot && (
                                <span className="text-[10px] text-stone-400 font-mono ml-1.5">
                                  ({act.timeSlot})
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Overnight Stay Tag */}
                    {singleDay.customHotelName && singleDay.dayType !== 'Departure' && (
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs text-stone-700">
                        <div className="flex items-center gap-2">
                          <HotelIcon className="w-3.5 h-3.5 text-[#102a43]" />
                          <span>
                            Overnight Stay: <strong className="text-stone-900">{singleDay.customHotelName}</strong> ({singleDay.hotelDestination})
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-stone-500">
                          {singleDay.roomCategory} • {singleDay.mealPlan} Plan
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              sanitizedQuote.days.map((day) => (
                <div
                  key={day.id}
                  className="page-break-inside-avoid border border-stone-200 rounded-2xl p-5 bg-white shadow-2xs space-y-3"
                >
                  {/* Day Header Ribbon */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-stone-200">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-lg bg-[#102a43] text-white font-bold text-xs shadow-2xs">
                        Day {day.dayNumber}
                      </span>
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">{day.title}</h4>
                        <div className="text-[11px] text-stone-500 font-medium mt-0.5">
                          {formatIndianDate(day.date)} • {day.dayType}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {day.routeTitle && (
                        <span className="text-[11px] text-stone-600 font-medium px-2.5 py-0.5 rounded-md bg-stone-100">
                          {day.routeTitle}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {day.mealPlan}
                      </span>
                    </div>
                  </div>

                  {/* Day Narrative / Activities */}
                  {day.activities.length > 0 && (
                    <div className="space-y-2 pt-1 pl-2">
                      {day.activities.map((act) => (
                        <div key={act.id} className="text-xs text-stone-700 flex items-start gap-2 leading-relaxed">
                          <span className="text-[#102a43] font-bold mt-0.5">•</span>
                          <div>
                            <strong className="text-stone-900">{act.title}: </strong>
                            <span>{act.description}</span>
                            {act.timeSlot && (
                              <span className="text-[10px] text-stone-400 font-mono ml-1.5">
                                ({act.timeSlot})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Overnight Stay Tag */}
                  {day.customHotelName && day.dayType !== 'Departure' && (
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs text-stone-700">
                      <div className="flex items-center gap-2">
                        <HotelIcon className="w-3.5 h-3.5 text-[#102a43]" />
                        <span>
                          Overnight Stay: <strong className="text-stone-900">{day.customHotelName}</strong> ({day.hotelDestination})
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-stone-500">
                        {day.roomCategory} • {day.mealPlan} Plan
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ===================================================================
            SECTION 4: INCLUSIONS & EXCLUSIONS (Matching Reference PDF)
            =================================================================== */}
        <div className="page-break-inside-avoid space-y-4 pt-2">
          {/* Section Header Pill */}
          <div className="inline-block bg-[#102a43] text-white px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider shadow-xs">
            Inclusions &amp; Exclusions
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Inclusions */}
            <div className="border border-stone-200 rounded-2xl p-5 bg-white shadow-2xs space-y-2.5">
              <div className="font-bold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-stone-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Package Inclusions</span>
              </div>
              <ul className="space-y-1.5 text-stone-700 text-[11px] leading-relaxed">
                {sanitizedQuote.inclusions.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exclusions */}
            <div className="border border-stone-200 rounded-2xl p-5 bg-white shadow-2xs space-y-2.5">
              <div className="font-bold text-rose-900 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-stone-100">
                <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-[10px]">
                  ✕
                </span>
                <span>Package Exclusions</span>
              </div>
              <ul className="space-y-1.5 text-stone-700 text-[11px] leading-relaxed">
                {sanitizedQuote.exclusions.map((exc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <X className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ===================================================================
            SECTION 5: TERMS AND CONDITIONS
            =================================================================== */}
        <div className="page-break-inside-avoid space-y-3 pt-2">
          {/* Section Header Pill */}
          <div className="inline-block bg-[#102a43] text-white px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider shadow-xs">
            Terms and Conditions
          </div>

          <div className="border border-stone-200 rounded-2xl p-5 bg-white shadow-2xs space-y-2 text-stone-700 text-[11px] leading-relaxed">
            <ul className="space-y-1.5 list-disc list-inside">
              {sanitizedQuote.termsAndConditions.map((term, tIdx) => (
                <li key={tIdx}>{term}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* ===================================================================
            SECTION 6: TOUR INVESTMENT & PAYMENT SCHEDULE
            =================================================================== */}
        <div className="page-break-inside-avoid bg-[#102a43] text-white rounded-2xl p-6 sm:p-8 space-y-5 shadow-elevated">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-white/10">
            <div>
              <span className="text-[11px] text-stone-300 block uppercase tracking-wider">
                Total Tour Investment
              </span>
              <div className="text-3xl font-bold text-gold-400 tabular-nums mt-0.5">
                {formatINR(sanitizedQuote.costing.finalSellingPrice)}
              </div>
              <div className="text-xs text-stone-300 mt-1">
                {sanitizedQuote.costing.gstEnabled
                  ? '✓ Inclusive of 5% GST (Tour Operator Services SAC 998555)'
                  : 'Tariff excludes statutory GST'} • {formatINR(sanitizedQuote.costing.pricePerAdult)} per adult
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-stone-300 block uppercase tracking-wider">
                Booking Advance ({sanitizedQuote.costing.advancePercentageRequired}%)
              </span>
              <div className="text-xl font-bold text-white tabular-nums mt-0.5">
                {formatINR(sanitizedQuote.costing.advanceAmountRequired)}
              </div>
              <div className="text-xs text-stone-300 mt-0.5">
                Balance on Arrival: {formatINR(sanitizedQuote.costing.balanceDueAmount)}
              </div>
            </div>
          </div>

          {/* Bank & Settlement Details */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
            <div className="font-bold text-gold-400 text-xs uppercase tracking-wider">
              Official Desi Journey Bank Settlement Account
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-stone-200">
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
            SECTION 7: CONSULTANT CARD (PRADIPTA MUKHERJEE - From Reference PDF)
            =================================================================== */}
        <div className="page-break-inside-avoid border border-stone-200 rounded-2xl p-6 bg-stone-50/70 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#102a43] text-gold-400 font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
                PM
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">
                  {companySettings.adminName || 'Pradipta Mukherjee'}
                </h4>
                <p className="text-[11px] text-stone-500 font-medium">
                  Managing Director / Senior Tour Consultant • Desi Journey
                </p>
                <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                  Direct Line: +91 9932251044 / +91 9330343977
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right text-[11px] text-stone-600 space-y-0.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-200">
              <div className="font-bold text-[#102a43]">Registered Kolkata Office:</div>
              <div>L-51/903 Action Area III, Techno City</div>
              <div>New Town, Kolkata, PIN-700160, West Bengal</div>
              <div className="text-stone-500">Email: info@desijourney.com</div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            SECTION 8: PERSISTENT DEEP BLUE FOOTER (Matching Reference PDF)
            =================================================================== */}
        <div className="rounded-2xl bg-[#102a43] text-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] shadow-xs">
          <div className="font-bold tracking-wide uppercase">
            DESI JOURNEY | YOUR PERFECT TRAVEL PARTNER
          </div>
          <div className="text-stone-300 text-center sm:text-right">
            Email: <strong className="text-white">info@desijourney.com</strong> • Helpline: <strong className="text-white">+91 9330343977 / 9932251044</strong>
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
