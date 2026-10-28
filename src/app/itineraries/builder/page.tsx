'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  Hotel as HotelIcon,
  Car,
  DollarSign,
  CheckSquare,
  Eye,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Copy,
  Clock,
  Sparkles,
  Lock,
  Unlock,
  ShieldAlert,
  ArrowRight,
  Save,
  CheckCircle2,
  Share2,
  Download,
  AlertTriangle,
  Loader2,
  Bot,
  Wand2,
  RefreshCw,
  X,
  FileText,
  Layers,
  Bookmark,
  Package,
  BookmarkPlus,
  ArrowLeftRight,
  Search,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  CostingItem,
  DayActivity,
  DayType,
  ItineraryDay,
  MealPlanCode,
  Quotation,
  QuotationCustomization,
  TripTemplate,
  Attraction,
} from '../../../types';
import {
  formatINR,
  formatIndianDate,
  calculateTripDuration,
  addDaysToDate,
  calculateTourCosting,
  calculateHotelDayCost,
  calculateVehicleTourCost,
  sanitizeQuotationForCustomer,
  generateWhatsAppMessage,
  groupItineraryDaysByLocation,
  GroupedDaySection,
} from '../../../lib/calculations';

function ItineraryBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editQuoteId = searchParams.get('edit');
  const fromLeadId = searchParams.get('leadId');

  const {
    quotations,
    leads,
    hotels,
    vehicles,
    destinations,
    tripTemplates,
    addTripTemplate,
    companySettings,
    createQuotation,
    updateQuotation,
    recordShareEvent,
    clausePresets,
    addClausePreset,
  } = useApp();

  // Wizard Step: 1 to 8
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Core Form State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [tripTitle, setTripTitle] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [nights, setNights] = useState<number>(5);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);
  const [roomsCount, setRoomsCount] = useState<number>(1);
  const [leadId, setLeadId] = useState<string | undefined>(undefined);

  // Auto-calculated End Date strictly derived from Start Date + Nights
  const endDate = useMemo(() => {
    return addDaysToDate(startDate, nights);
  }, [startDate, nights]);

  // Duration derivation: N nights = N+1 days
  const duration = useMemo(() => {
    return {
      nights,
      days: nights === 0 ? 1 : nights + 1,
      isValid: nights >= 1 && Boolean(startDate),
      error: !startDate ? 'Start date is required' : nights < 1 ? 'Nights must be at least 1' : undefined,
    };
  }, [startDate, nights]);

  // AI Assist / Gemini State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTripStyle, setAiTripStyle] = useState('Family Holiday');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiGeneratedData, setAiGeneratedData] = useState<any>(null);
  const [aiSourceBadge, setAiSourceBadge] = useState<string | null>(null);
  const [aiNoticeMessage, setAiNoticeMessage] = useState<string | null>(null);

  // Route & Stops
  const [routeStops, setRouteStops] = useState<string[]>([]);
  // Pre-made trip template states
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [newTemplateRegion, setNewTemplateRegion] = useState('South India');
  const [newTemplateIdealFor, setNewTemplateIdealFor] = useState('Families & Leisure');
  const [newTemplateOverview, setNewTemplateOverview] = useState('');
  const [templateFilterCategory, setTemplateFilterCategory] = useState<string>('All');
  const [sightseeingFilter, setSightseeingFilter] = useState('');
  const [selectedAttractionDayTarget, setSelectedAttractionDayTarget] = useState<number>(1);
  const [newStopInput, setNewStopInput] = useState('');

  // Selected Fleet
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    vehicles[0]?.id || ''
  );
  const [manualVehicleCost, setManualVehicleCost] = useState<number>(0);

  // Day-wise Itinerary
  const [days, setDays] = useState<ItineraryDay[]>([]);

  // Costing State
  const [costingItems, setCostingItems] = useState<CostingItem[]>([]);
  const [markupType, setMarkupType] = useState<'percentage' | 'fixed_inr'>('percentage');
  const [markupValue, setMarkupValue] = useState<number>(22);
  const [gstEnabled, setGstEnabled] = useState<boolean>(true);
  const [gstRate, setGstRate] = useState<number>(5);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [advancePercent, setAdvancePercent] = useState<number>(30);

  // Inclusions & Terms
  const [inclusions, setInclusions] = useState<string[]>(companySettings.defaultInclusions);
  const [exclusions, setExclusions] = useState<string[]>(companySettings.defaultExclusions);
  const [terms, setTerms] = useState<string[]>(companySettings.defaultTerms);

  // Preset rules state
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-himachal');
  const [presetApplyMode, setPresetApplyMode] = useState<'replace' | 'append'>('replace');
  const [showSavePresetModal, setShowSavePresetModal] = useState<boolean>(false);
  const [newPresetTitle, setNewPresetTitle] = useState<string>('');
  const [newPresetDesc, setNewPresetDesc] = useState<string>('');
  const [newPresetCategory, setNewPresetCategory] = useState<string>('Custom Trip');
  const [clauseFeedbackMsg, setClauseFeedbackMsg] = useState<string | null>(null);

  const handleApplyPreset = () => {
    const preset = clausePresets.find((p) => p.id === selectedPresetId);
    if (!preset) return;
    if (presetApplyMode === 'replace') {
      setInclusions([...preset.inclusions]);
      setExclusions([...preset.exclusions]);
      setTerms([...preset.termsAndConditions]);
      setClauseFeedbackMsg(`Applied "${preset.title}" rules (replaced previous clauses).`);
    } else {
      setInclusions((prev) => Array.from(new Set([...prev, ...preset.inclusions])));
      setExclusions((prev) => Array.from(new Set([...prev, ...preset.exclusions])));
      setTerms((prev) => Array.from(new Set([...prev, ...preset.termsAndConditions])));
      setClauseFeedbackMsg(`Appended "${preset.title}" rules to current clauses.`);
    }
    setTimeout(() => setClauseFeedbackMsg(null), 3000);
  };

  const handleSaveCurrentAsPreset = () => {
    if (!newPresetTitle.trim()) {
      alert('Please enter a title for the rule preset.');
      return;
    }
    addClausePreset({
      title: newPresetTitle.trim(),
      description: newPresetDesc.trim() || 'Custom trip policy rules saved from itinerary builder.',
      category: newPresetCategory.trim() || 'Custom',
      inclusions: [...inclusions],
      exclusions: [...exclusions],
      termsAndConditions: [...terms],
      isBuiltIn: false,
    });
    setShowSavePresetModal(false);
    setNewPresetTitle('');
    setNewPresetDesc('');
    setClauseFeedbackMsg(`Saved "${newPresetTitle}" as a reusable custom trip rule preset!`);
    setTimeout(() => setClauseFeedbackMsg(null), 3500);
  };

  // Customer Customization Settings
  const [customization, setCustomization] = useState<QuotationCustomization>({
    disclosureMode: 'masked',
    showExactHotelNames: false,
    showDriverVehicleDetails: false,
    showDayWiseDistanceEstimate: true,
    showDetailedDayTimings: true,
    showInclusionsExclusions: true,
    showTermsAndPaymentSchedule: true,
    showBankDetails: true,
    showContactBar: true,
    groupMultiDayStays: true,
    templateStyle: 'alpine_classic',
  });

  // Step 3 View Mode: 'individual' (editable cards) vs 'grouped' (consolidated multi-day view)
  const [builderStep3View, setBuilderStep3View] = useState<'individual' | 'grouped'>('individual');

  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Start Date change handler: updates all existing day dates sequentially
  const handleStartDateChange = (newDate: string) => {
    setStartDate(newDate);
    setDays((prev) =>
      prev.map((d, i) => ({
        ...d,
        date: addDaysToDate(newDate, i),
      }))
    );
  };

  // Nights change handler: adjusts days array dynamically
  const handleNightsChange = (newNights: number) => {
    const validNights = Math.max(1, Math.min(45, newNights));
    setNights(validNights);
    const targetDays = validNights + 1;

    setDays((prev) => {
      if (prev.length === 0) return prev;
      if (targetDays > prev.length) {
        const added: ItineraryDay[] = [];
        for (let i = prev.length + 1; i <= targetDays; i++) {
          const isLast = i === targetDays;
          const dayDate = addDaysToDate(startDate, i - 1);
          const destName = routeStops[Math.min(i - 1, routeStops.length - 1)] || 'Himalayan Leisure';
          const matchingHotel = hotels.find((h) => h.destination.toLowerCase() === destName.toLowerCase());

          added.push({
            id: `day-${i}-${Date.now()}`,
            dayNumber: i,
            date: dayDate,
            dayType: isLast ? 'Departure' : 'Local Sightseeing',
            title: isLast ? `Departure from ${destName} with Fond Memories` : `${destName} Guided Exploration`,
            routeTitle: isLast ? `${destName} to Airport / Railway Station` : `${destName} Local Circuit`,
            distanceKm: isLast ? 120 : 35,
            driveTimeHours: isLast ? 3.5 : 1.5,
            isTravelEstimate: true,
            hotelDestination: destName,
            hotelId: matchingHotel?.id,
            customHotelName: matchingHotel?.name || 'Curated 4-Star Resort',
            roomCategory: matchingHotel?.rates[0]?.roomCategory || 'Deluxe Room',
            mealPlan: 'MAP',
            breakfastIncluded: true,
            lunchIncluded: false,
            dinnerIncluded: !isLast,
            activities: [
              {
                id: `act-${i}-1`,
                timeSlot: '10:00 AM',
                title: isLast ? 'Chauffeur Departure Transfer' : `Sightseeing in ${destName}`,
                description: isLast ? 'Assistance with check-out and airport transit.' : `Curated visit to viewpoints in ${destName}.`,
                type: isLast ? 'Transit' : 'Sightseeing',
                isEstimate: false,
              },
            ],
          });
        }
        return [...prev, ...added];
      } else if (targetDays < prev.length) {
        const trimmed = prev.slice(0, targetDays);
        const lastIdx = trimmed.length - 1;
        if (lastIdx >= 0) {
          trimmed[lastIdx] = {
            ...trimmed[lastIdx],
            dayType: 'Departure',
            title: trimmed[lastIdx].title.includes('Departure')
              ? trimmed[lastIdx].title
              : `Departure with Cherished Memories`,
            routeTitle: trimmed[lastIdx].routeTitle.includes('Airport')
              ? trimmed[lastIdx].routeTitle
              : `${trimmed[lastIdx].hotelDestination} to Airport / Station Transfer`,
            dinnerIncluded: false,
          };
        }
        return trimmed;
      }
      return prev;
    });
  };

  // AI Assist Generation Handler
  const handleGenerateAiItinerary = async () => {
    setIsGeneratingAi(true);
    setAiNoticeMessage(null);
    try {
      const res = await fetch('/api/ai/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: routeStops.slice(1, -1).join(' & ') || routeStops[0] || 'Shimla & Manali',
          nights,
          routeStops,
          tripStyle: aiTripStyle,
          adults,
          apiKey: companySettings.geminiApiKey,
          model: companySettings.geminiModel,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAiGeneratedData(data.data);
        setAiSourceBadge(data.source);
        if (data.notice) {
          setAiNoticeMessage(data.notice);
        }
      } else {
        setAiNoticeMessage(data.error || 'Failed to generate itinerary with AI.');
      }
    } catch (err: any) {
      setAiNoticeMessage(err.message || 'Network error while contacting AI service.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleApplyAiSchedule = () => {
    if (!aiGeneratedData || !aiGeneratedData.days) return;

    if (aiGeneratedData.tripTitle) {
      setTripTitle(aiGeneratedData.tripTitle);
    }

    const newDays: ItineraryDay[] = aiGeneratedData.days.map((aiDay: any, idx: number) => {
      const isFirst = idx === 0;
      const isLast = idx === aiGeneratedData.days.length - 1;
      const dayDate = addDaysToDate(startDate, idx);
      const stopName = routeStops[Math.min(idx, routeStops.length - 1)] || 'Himalayas';
      const matchingHotel = hotels.find((h) =>
        h.destination.toLowerCase().includes(stopName.toLowerCase()) ||
        stopName.toLowerCase().includes(h.destination.toLowerCase())
      );

      return {
        id: `day-ai-${idx + 1}-${Date.now()}`,
        dayNumber: aiDay.dayNumber || idx + 1,
        date: dayDate,
        dayType: aiDay.dayType || (isFirst ? 'Arrival & Transfer' : isLast ? 'Departure' : 'Local Sightseeing'),
        title: aiDay.title || `Day ${idx + 1} Tour`,
        routeTitle: aiDay.routeTitle || `${stopName} Excursion`,
        distanceKm: isFirst ? 115 : isLast ? 140 : 40,
        driveTimeHours: isFirst ? 3.5 : isLast ? 4.0 : 1.5,
        isTravelEstimate: true,
        hotelDestination: stopName,
        hotelId: matchingHotel?.id,
        customHotelName: matchingHotel?.name || 'Curated 4-Star Mountain View Resort',
        roomCategory: matchingHotel?.rates[0]?.roomCategory || 'Deluxe Room',
        mealPlan: 'MAP',
        breakfastIncluded: !isFirst,
        lunchIncluded: false,
        dinnerIncluded: !isLast,
        activities: (aiDay.activities || []).map((act: any, actIdx: number) => ({
          id: `act-ai-${idx + 1}-${actIdx + 1}`,
          timeSlot: act.timeSlot || '10:00 AM',
          title: act.title || 'Sightseeing Tour',
          description: act.description || 'Guided visit to top spots.',
          type: act.type || 'Sightseeing',
          isEstimate: false,
        })),
      };
    });

    setDays(newDays);
    setNights(newDays.length - 1);
    setIsAiModalOpen(false);
    setSavedSuccessMsg('✨ Day timeline auto-generated by AI successfully applied!');
    setTimeout(() => setSavedSuccessMsg(null), 4000);
  };

  // Load from existing quotation if editQuoteId is passed
  useEffect(() => {
    if (editQuoteId) {
      const q = quotations.find((quote) => quote.id === editQuoteId);
      if (q) {
        setGuestName(q.guestName);
        setGuestPhone(q.guestPhone);
        setGuestEmail(q.guestEmail || '');
        setTripTitle(q.tripTitle);
        setStartDate(q.startDate);
        const calculatedNights = q.durationNights || (q.endDate ? calculateTripDuration(q.startDate, q.endDate).nights : 5);
        setNights(calculatedNights);
        setAdults(q.adults);
        setChildren(q.children);
        setInfants(q.infants);
        setRoomsCount(q.roomsCount);
        setRouteStops(q.routeStops);
        setSelectedVehicleId(q.vehicleId || vehicles[0]?.id || '');
        setDays(q.days);
        setCostingItems(q.costingItems);
        setMarkupType(q.costing.markupType);
        setMarkupValue(q.costing.markupValue);
        setGstEnabled(q.costing.gstEnabled);
        setGstRate(q.costing.gstRatePercentage);
        setDiscountAmount(q.costing.discountAmount);
        setAdvancePercent(q.costing.advancePercentageRequired);
        setInclusions(q.inclusions);
        setExclusions(q.exclusions);
        setTerms(q.termsAndConditions);
        setCustomization(q.customization);
        setLeadId(q.leadId);
      }
    } else if (fromLeadId) {
      const lead = leads.find((l) => l.id === fromLeadId);
      if (lead) {
        setLeadId(lead.id);
        setGuestName(lead.guestName);
        setGuestPhone(lead.phone);
        setGuestEmail(lead.email || '');
        setStartDate(lead.startDate);
        const calculatedNights = lead.durationNights || (lead.endDate ? calculateTripDuration(lead.startDate, lead.endDate).nights : 5);
        setNights(calculatedNights);
        setAdults(lead.adults);
        setChildren(lead.children);
        setInfants(lead.infants || 0);
        setRoomsCount(Math.ceil(lead.adults / 2));
        setTripTitle(`${lead.destination} Tailored Holiday`);
        if (lead.startDate) {
          setDays((prev) =>
            prev.map((d, i) => ({
              ...d,
              date: addDaysToDate(lead.startDate, i),
            }))
          );
        }
      }
    }
  }, [editQuoteId, fromLeadId, quotations, leads, vehicles]);

  // Auto-load template if templateId is in query params
  const templateQueryParam = searchParams.get('templateId') || searchParams.get('template');
  useEffect(() => {
    if (templateQueryParam && tripTemplates.length > 0) {
      const foundTmpl = tripTemplates.find((t) => t.id === templateQueryParam);
      if (foundTmpl) {
        handleApplyTemplate(foundTmpl);
      }
    }
  }, [templateQueryParam, tripTemplates]);


  // If days are empty, seed days based on duration
  useEffect(() => {
    if (days.length === 0 && duration.isValid) {
      const initialDays: ItineraryDay[] = [];
      for (let i = 1; i <= duration.days; i++) {
        const isFirst = i === 1;
        const isLast = i === duration.days;
        const dayDate = addDaysToDate(startDate, i - 1);
        const currentStop = routeStops[Math.min(i - 1, Math.max(0, routeStops.length - 1))] || 'Destination';
        const destName = isLast ? 'Departure' : currentStop;
        const matchingHotel = hotels.find((h) => h.destination.toLowerCase() === destName.toLowerCase());

        initialDays.push({
          id: `day-${i}-${Date.now()}`,
          dayNumber: i,
          date: dayDate,
          dayType: isFirst ? 'Arrival & Transfer' : isLast ? 'Departure' : 'Local Sightseeing',
          title: isFirst ? `Arrival & Welcome to ${destName}` : isLast ? 'Departure with Cherished Memories' : `${destName} Guided Sightseeing & Exploration`,
          routeTitle: isFirst ? `Arrival Transfer to ${destName}` : isLast ? `${destName} to Airport / Station Transfer` : `${destName} Sightseeing Circuit`,
          distanceKm: isFirst ? 115 : isLast ? 290 : 35,
          driveTimeHours: isFirst ? 3.5 : isLast ? 8.0 : 1.5,
          isTravelEstimate: false,
          hotelDestination: destName,
          hotelId: matchingHotel?.id,
          customHotelName: matchingHotel?.name || 'Curated 4-Star Resort',
          roomCategory: matchingHotel?.rates[0]?.roomCategory || 'Deluxe Room',
          mealPlan: 'MAP',
          breakfastIncluded: !isFirst,
          lunchIncluded: false,
          dinnerIncluded: !isLast,
          activities: [
            {
              id: `act-${i}-1`,
              timeSlot: isFirst ? '11:00 AM' : '09:30 AM',
              title: isFirst ? 'Chauffeur Meet & Greet' : 'Morning Sightseeing Tour',
              description: isFirst
                ? 'Welcome at airport/station with comfortable transfer.'
                : `Explore top attractions in ${destName} with ample photo stops.`,
              type: isFirst ? 'Transit' : 'Sightseeing',
              isEstimate: false,
            },
          ],
        });
      }
      setDays(initialDays);
    }
  }, [days.length, duration, startDate, hotels]);

  // Recalculate costing items when hotels, days, vehicle change
  useEffect(() => {
    const items: CostingItem[] = [];

    // 1. Hotel accommodations
    days.forEach((day, index) => {
      if (index === days.length - 1 && day.dayType === 'Departure') return; // Last day check-out
      const hotelObj = hotels.find((h) => h.id === day.hotelId);
      const dayHotelCost = calculateHotelDayCost(
        hotelObj,
        day.roomCategory || 'Deluxe',
        day.mealPlan,
        roomsCount,
        adults
      );
      items.push({
        id: `cost-hotel-${day.id}`,
        category: 'Accommodation',
        title: `Day ${day.dayNumber} Stay: ${hotelObj ? hotelObj.name : day.hotelDestination} (${day.mealPlan} - ${roomsCount} Room)`,
        supplierCost: dayHotelCost.cost,
        notes: dayHotelCost.description,
      });
    });

    // 2. Transport vehicle
    const vehicleObj = vehicles.find((v) => v.id === selectedVehicleId);
    const vehicleCostRes = calculateVehicleTourCost(
      vehicleObj,
      duration.days,
      duration.days * 200,
      manualVehicleCost > 0 ? manualVehicleCost : undefined
    );

    if (vehicleObj) {
      items.push({
        id: `cost-transport-${vehicleObj.id}`,
        category: 'Transport',
        title: `Private Vehicle: ${vehicleObj.displayName} (${duration.days} Days)`,
        supplierCost: vehicleCostRes.cost,
        notes: vehicleCostRes.breakdownNote,
      });
    }

    // 3. Permits / Activities buffer
    items.push({
      id: `cost-permits`,
      category: 'Permits & Tolls',
      title: 'Green Cess, State Border Entry Taxes & Parking Passes',
      supplierCost: 2500,
      notes: 'Included in wholesale package cost',
    });

    setCostingItems(items);
  }, [days, hotels, vehicles, selectedVehicleId, duration.days, roomsCount, adults, manualVehicleCost]);

  // Derived live calculations
  const liveCosting = useMemo(() => {
    return calculateTourCosting(costingItems, {
      markupType,
      markupValue,
      gstEnabled,
      gstRatePercentage: gstRate,
      discountAmount,
      adultsCount: adults,
      advancePercentage: advancePercent,
    });
  }, [
    costingItems,
    markupType,
    markupValue,
    gstEnabled,
    gstRate,
    discountAmount,
    adults,
    advancePercent,
  ]);

  // Construct draft quotation object
  const currentQuoteObject: Quotation = useMemo(() => {
    const selectedVeh = vehicles.find((v) => v.id === selectedVehicleId);
    const alignedDays = days.map((d, i) => ({
      ...d,
      date: startDate
        ? addDaysToDate(startDate, typeof d.dayNumber === 'number' && d.dayNumber > 0 ? d.dayNumber - 1 : i)
        : d.date,
    }));
    return {
      id: editQuoteId || `quote-preview`,
      quoteNumber: editQuoteId ? (quotations.find((q) => q.id === editQuoteId)?.quoteNumber || 'DJ-2026-DRAFT') : 'DJ-2026-PREVIEW',
      version: 1,
      leadId,
      guestName,
      guestPhone,
      guestEmail,
      tripTitle,
      destinationsSummary: routeStops.join(' → '),
      routeStops,
      startDate,
      endDate,
      durationNights: duration.nights,
      durationDays: duration.days,
      adults,
      children,
      infants,
      roomsCount,
      vehicleId: selectedVehicleId,
      vehicleName: selectedVeh ? selectedVeh.displayName : 'Private AC Vehicle',
      days: alignedDays,
      costingItems,
      costing: liveCosting,
      inclusions,
      exclusions,
      termsAndConditions: terms,
      paymentScheduleText: [
        `Token Booking Advance (${advancePercent}%): ${formatINR(liveCosting.advanceAmountRequired)} to lock room holds and private chauffeur allotment.`,
        `Second Instalment (40%): ${formatINR(Math.round(liveCosting.finalSellingPrice * 0.4))} due 15 days prior to travel.`,
        `Final Remaining Balance: ${formatINR(liveCosting.balanceDueAmount - Math.round(liveCosting.finalSellingPrice * 0.4))} due on arrival in destination.`,
      ],
      customization,
      status: 'Draft',
      advanceReceived: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Rohit Sharma',
    };
  }, [
    editQuoteId,
    quotations,
    leadId,
    guestName,
    guestPhone,
    guestEmail,
    tripTitle,
    routeStops,
    startDate,
    endDate,
    duration,
    adults,
    children,
    infants,
    roomsCount,
    selectedVehicleId,
    vehicles,
    days,
    costingItems,
    liveCosting,
    inclusions,
    exclusions,
    terms,
    advancePercent,
    customization,
  ]);

  // Customer proposal snapshot (sanitized according to Pre-Advance or Disclosed mode)
  const { sanitizedQuote, isPreAdvanceMasked } = useMemo(() => {
    return sanitizeQuotationForCustomer(currentQuoteObject, hotels);
  }, [currentQuoteObject, hotels]);

  // Save Quotation Handler
  const handleSaveQuotation = () => {
    if (editQuoteId) {
      updateQuotation(editQuoteId, currentQuoteObject);
      setSavedSuccessMsg('Quotation successfully updated!');
    } else {
      const created = createQuotation(currentQuoteObject);
      setSavedSuccessMsg(`Quotation saved with ID: ${created.quoteNumber}`);
      router.push(`/itineraries/${created.id}/preview`);
      return;
    }
    setTimeout(() => setSavedSuccessMsg(null), 3000);
  };

  // Day mutation helpers
  const handleUpdateDay = (index: number, updates: Partial<ItineraryDay>) => {
    setDays((prev) =>
      prev.map((d, i) => (i === index ? { ...d, ...updates } : d))
    );
  };

  const handleAddActivity = (dayIndex: number) => {
    const newAct: DayActivity = {
      id: `act-${Date.now()}`,
      timeSlot: '03:00 PM',
      title: 'Afternoon Sightseeing Point',
      description: 'Visit to viewpoint and local handicraft markets.',
      type: 'Sightseeing',
      isEstimate: false,
    };
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex ? { ...d, activities: [...d.activities, newAct] } : d
      )
    );
  };

  const handleRemoveActivity = (dayIndex: number, actId: string) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? { ...d, activities: d.activities.filter((a) => a.id !== actId) }
          : d
      )
    );
  };

  // Consolidated multi-day stay groups for consecutive days at the same destination
  const stayGroups = useMemo(() => {
    return groupItineraryDaysByLocation(days);
  }, [days]);

  const handleDuplicateDay = (dayIndex: number) => {
    const target = days[dayIndex];
    const newDay: ItineraryDay = {
      ...target,
      id: `day-${Date.now()}`,
      dayNumber: days.length + 1,
      date: addDaysToDate(target.date, 1),
      title: `${target.title} (Extended)`,
    };
    setDays([...days, newDay]);
  };

  const handleApplyTemplate = (tmpl: TripTemplate) => {
    setTripTitle(tmpl.title);
    if (tmpl.suggestedRoute && tmpl.suggestedRoute.length > 0) {
      setRouteStops([...tmpl.suggestedRoute]);
    }
    if (tmpl.durationNights) {
      setNights(tmpl.durationNights);
    }
    if (tmpl.vehicleId) {
      setSelectedVehicleId(tmpl.vehicleId);
    }
    if (tmpl.inclusions && tmpl.inclusions.length > 0) {
      setInclusions([...tmpl.inclusions]);
    }
    if (tmpl.exclusions && tmpl.exclusions.length > 0) {
      setExclusions([...tmpl.exclusions]);
    }
    if (tmpl.termsAndConditions && tmpl.termsAndConditions.length > 0) {
      setTerms([...tmpl.termsAndConditions]);
    }
    if (tmpl.days && tmpl.days.length > 0) {
      const remappedDays: ItineraryDay[] = tmpl.days.map((d: any, idx: number) => ({
        ...d,
        id: `day-tmpl-${idx + 1}-${Date.now()}`,
        date: addDaysToDate(startDate, idx),
        dayNumber: idx + 1,
      }));
      setDays(remappedDays);
      setNights(remappedDays.length - 1);
    }
    setIsTemplatePickerOpen(false);
    setSavedSuccessMsg(`✨ Successfully loaded "${tmpl.title}" pre-made package!`);
    setTimeout(() => setSavedSuccessMsg(null), 3500);
  };

  const handleSaveCurrentAsTemplate = () => {
    if (!tripTitle.trim()) {
      alert('Please enter a title for this trip package.');
      return;
    }
    addTripTemplate({
      title: tripTitle.trim(),
      region: newTemplateRegion || 'Custom',
      durationNights: nights,
      durationDays: duration.days,
      suggestedRoute: routeStops.length > 0 ? routeStops : ['Custom Route'],
      overview: newTemplateOverview.trim() || `${nights}N/${duration.days}D bespoke tour package covering ${routeStops.join(' - ')}.`,
      idealFor: newTemplateIdealFor.trim() || 'Families, Couples, Leisure Seekers',
      vehicleId: selectedVehicleId,
      vehicleName: vehicles.find((v) => v.id === selectedVehicleId)?.displayName,
      days: days.map((d, i) => ({ ...d, dayNumber: i + 1 })),
      inclusions: [...inclusions],
      exclusions: [...exclusions],
      termsAndConditions: [...terms],
      isCustom: true,
    });
    setIsSaveTemplateModalOpen(false);
    setSavedSuccessMsg(`🎉 Saved "${tripTitle}" into Pre-Made Trips library!`);
    setTimeout(() => setSavedSuccessMsg(null), 4000);
  };

  const handleMoveStop = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= routeStops.length) return;
    const nextStops = [...routeStops];
    const temp = nextStops[index];
    nextStops[index] = nextStops[targetIdx];
    nextStops[targetIdx] = temp;
    setRouteStops(nextStops);
  };

  const handleInjectAttraction = (att: Attraction, dayNum: number) => {
    const targetIdx = dayNum - 1;
    if (targetIdx < 0 || targetIdx >= days.length) {
      alert(`Please choose a valid day between Day 1 and Day ${days.length}`);
      return;
    }
    const newAct: DayActivity = {
      id: `act-kb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timeSlot: '02:30 PM',
      title: att.name,
      description: att.description || `Visit to ${att.name} in ${att.destination}.`,
      location: att.destination,
      type: 'Sightseeing',
      isEstimate: false,
    };
    setDays((prev) =>
      prev.map((d, idx) =>
        idx === targetIdx ? { ...d, activities: [...d.activities, newAct] } : d
      )
    );
    setSavedSuccessMsg(`✓ Added "${att.name}" to Day ${dayNum} timeline!`);
    setTimeout(() => setSavedSuccessMsg(null), 3000);
  };

  const steps = [
    { num: 1, label: 'Guest & Trip', icon: Users },
    { num: 2, label: 'Route & Stops', icon: MapPin },
    { num: 3, label: 'Day Builder', icon: Calendar },
    { num: 4, label: 'Hotels', icon: HotelIcon },
    { num: 5, label: 'Vehicles', icon: Car },
    { num: 6, label: 'Live Costing', icon: DollarSign },
    { num: 7, label: 'Terms & Clauses', icon: CheckSquare },
    { num: 8, label: 'Proposal Preview', icon: Eye },
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top Banner & Stepper Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-forest-100 text-forest-800">
                Itinerary Studio
              </span>
              <h1 className="text-lg font-bold text-forest-900 tracking-tight">
                {tripTitle || 'Tailored Itinerary Formulation'}
              </h1>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Guest: <strong className="text-forest-900">{guestName}</strong> • {duration.nights}N/{duration.days}D • {adults} Adults
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {savedSuccessMsg && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
                ✓ {savedSuccessMsg}
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsTemplatePickerOpen(true)}
              className="px-3 py-2 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-200 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Browse & load curated pre-made packages"
            >
              <Package className="w-3.5 h-3.5 text-gold-600" />
              <span>Pre-Made Trips</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSaveTemplateModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Save current configuration as a reusable pre-made trip"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-amber-600" />
              <span>Save as Template</span>
            </button>
            <button
              onClick={handleSaveQuotation}
              className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Proposal</span>
            </button>
          </div>
        </div>

        {/* 8-Step Interactive Progress Stepper */}
        <div className="pt-4 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] gap-2">
            {steps.map((s) => {
              const isActive = currentStep === s.num;
              const isPast = currentStep > s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => setCurrentStep(s.num)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-forest-800 text-white shadow-sm'
                      : isPast
                      ? 'bg-forest-50 text-forest-800 hover:bg-forest-100'
                      : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? 'bg-gold-500 text-forest-900'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {isPast ? '✓' : s.num}
                  </div>
                  <span className="whitespace-nowrap">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* STEP CONTENT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Work Area (Left 2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: Guest & Trip Setup */}
          {currentStep === 1 && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card space-y-5 text-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <Users className="w-4 h-4 text-forest-600" />
                <h2 className="text-sm font-bold text-forest-900">Step 1: Guest & Passenger Configuration</h2>
              </div>

              {/* Pre-Made Trip Quick Starter Callout */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-forest-50 via-forest-50/70 to-amber-50/60 border border-forest-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-forest-800 text-gold-400 flex items-center justify-center shrink-0 shadow-2xs">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-forest-900 text-xs">Starting from a Curated Route Circuit?</div>
                    <div className="text-[11px] text-stone-600">
                      Select pre-made packages like Kerala & Tamil Nadu 12N/13D, Himachal, or Kashmir to auto-populate days, hotels & terms.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTemplatePickerOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs whitespace-nowrap self-start sm:self-auto transition-colors"
                >
                  <Package className="w-3.5 h-3.5 text-gold-400" />
                  <span>Browse Pre-Made Trips</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Trip / Proposal Title</label>
                  <input
                    type="text"
                    value={tripTitle}
                    onChange={(e) => setTripTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-medium outline-hidden focus:border-forest-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Guest / Family Name *</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-medium outline-hidden focus:border-forest-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Primary Mobile / WhatsApp *</label>
                  <input
                    type="text"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-medium outline-hidden focus:border-forest-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-medium outline-hidden focus:border-forest-600"
                  />
                </div>
              </div>

              {/* Dates & Duration with validation */}
              <div className="p-4 rounded-xl bg-forest-50/60 border border-forest-100 space-y-3">
                <div className="font-semibold text-forest-900 text-xs flex items-center justify-between">
                  <span>Travel Window & Duration Consistency</span>
                  {duration.isValid && (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✓ Valid: {duration.nights} Nights / {duration.days} Days
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs outline-hidden focus:border-forest-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Number of Nights *</label>
                    <input
                      type="number"
                      min="1"
                      max="45"
                      value={nights}
                      onChange={(e) => handleNightsChange(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs outline-hidden focus:border-forest-600 font-bold text-forest-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 block mb-1 flex items-center justify-between">
                      <span>End Date (Calculated)</span>
                      <span className="text-[10px] text-emerald-700 font-bold">Auto</span>
                    </label>
                    <div className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-100/90 text-xs font-semibold text-forest-900 flex items-center justify-between">
                      <span>{formatIndianDate(endDate)}</span>
                      <span className="text-[10px] text-stone-500 font-normal">({duration.days} Days)</span>
                    </div>
                  </div>
                </div>

                {/* Quick Selection Chips for Nights */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-stone-500 mr-1">Quick Select Duration:</span>
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleNightsChange(n)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                        nights === n
                          ? 'bg-forest-800 text-gold-400 shadow-2xs'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-forest-50 hover:text-forest-800'
                      }`}
                    >
                      {n}N / {n + 1}D
                    </button>
                  ))}
                </div>

                <div className="text-[10px] text-stone-500 flex items-center gap-1.5">
                  <span className="text-forest-700 font-bold">ℹ️ Duration Logic:</span>
                  <span>End date is automatically calculated from Start Date + Number of Nights. All timeline days and hotel nights adapt automatically.</span>
                </div>

                {!duration.isValid && (
                  <p className="text-[11px] text-rose-600 font-medium">⚠️ {duration.error}</p>
                )}
              </div>

              {/* Passengers Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Adults (12+ yrs)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={adults}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setAdults(val);
                      setRoomsCount(Math.ceil(val / 2));
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs outline-hidden focus:border-forest-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Children (5-11 yrs)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs outline-hidden focus:border-forest-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Infants (&lt;5 yrs)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={infants}
                    onChange={(e) => setInfants(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs outline-hidden focus:border-forest-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Hotel Rooms Required</label>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    value={roomsCount}
                    onChange={(e) => setRoomsCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs outline-hidden focus:border-forest-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Route & Destinations */}
          {currentStep === 2 && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card space-y-5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-forest-600" />
                  <h2 className="text-sm font-bold text-forest-900">Step 2: Destination Sequencing & Route Stops</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAiModalOpen(true);
                      setAiGeneratedData(null);
                    }}
                    className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>✨ AI Assist (Gemini Flash)</span>
                  </button>

                  <span className="text-[11px] text-stone-400">Load Template:</span>
                  <select
                    onChange={(e) => {
                      const t = tripTemplates.find((x) => x.id === e.target.value);
                      if (t) handleApplyTemplate(t);
                    }}
                    className="px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 text-[11px] font-medium outline-hidden"
                  >
                    <option value="">Select Route Circuit...</option>
                    {tripTemplates.map((tmpl) => (
                      <option key={tmpl.id} value={tmpl.id}>
                        {tmpl.title} ({tmpl.durationNights}N/{tmpl.durationDays}D)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sequence Ribbon */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-stone-700 block">Sequence of Destinations / En-route Stops</label>
                  <span className="text-[11px] text-stone-500">
                    Use <strong className="text-forest-800">←</strong> / <strong className="text-forest-800">→</strong> arrows to reorder route stops
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-stone-50 border border-stone-200 min-h-[56px]">
                  {routeStops.length === 0 ? (
                    <div className="text-stone-400 italic text-xs py-1">
                      No stops added yet. Type a destination stop below or pick a pre-made trip.
                    </div>
                  ) : (
                    routeStops.map((stop, idx) => (
                      <React.Fragment key={idx}>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 shadow-2xs font-semibold text-forest-900 group">
                          <span className="w-4 h-4 rounded-full bg-forest-800 text-gold-400 text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span>{stop}</span>

                          <div className="flex items-center gap-0.5 ml-1 border-l border-stone-200 pl-1.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveStop(idx, -1)}
                              title="Move left / earlier"
                              className="p-0.5 text-stone-400 hover:text-forest-800 disabled:opacity-20 hover:bg-stone-100 rounded"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === routeStops.length - 1}
                              onClick={() => handleMoveStop(idx, 1)}
                              title="Move right / later"
                              className="p-0.5 text-stone-400 hover:text-forest-800 disabled:opacity-20 hover:bg-stone-100 rounded"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setRouteStops(routeStops.filter((_, i) => i !== idx))}
                              title="Remove stop"
                              className="p-0.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded ml-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {idx < routeStops.length - 1 && (
                          <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        )}
                      </React.Fragment>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="text"
                    value={newStopInput}
                    onChange={(e) => setNewStopInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newStopInput.trim()) {
                        e.preventDefault();
                        setRouteStops([...routeStops, newStopInput.trim()]);
                        setNewStopInput('');
                      }
                    }}
                    placeholder="Add en-route stop (e.g. Varkala, Kovalam, Manali, Gulmarg, Udaipur)..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newStopInput.trim()) {
                        setRouteStops([...routeStops, newStopInput.trim()]);
                        setNewStopInput('');
                      }
                    }}
                    className="px-4 py-1.5 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-semibold text-xs whitespace-nowrap"
                  >
                    + Add Stop
                  </button>
                </div>
              </div>

              {/* Verified Knowledge Base Sightseeing Suggestions */}
              <div className="p-4 rounded-xl bg-forest-50/70 border border-forest-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-forest-900 text-xs">
                    <Sparkles className="w-4 h-4 text-gold-500" />
                    <span>Verified Destination Sightseeing Knowledge Base</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-500">Inject into:</span>
                    <select
                      value={selectedAttractionDayTarget}
                      onChange={(e) => setSelectedAttractionDayTarget(Number(e.target.value))}
                      className="px-2 py-1 rounded-md border border-stone-200 bg-white text-xs font-semibold text-forest-900"
                    >
                      {days.map((d) => (
                        <option key={d.dayNumber} value={d.dayNumber}>
                          Day {d.dayNumber} ({d.hotelDestination || 'Stop'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={sightseeingFilter}
                    onChange={(e) => setSightseeingFilter(e.target.value)}
                    placeholder="Search verified attractions by name, destination, or category..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs outline-hidden focus:border-forest-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {destinations
                    .flatMap((d) => d.attractions)
                    .filter((att) => {
                      if (sightseeingFilter.trim()) {
                        const q = sightseeingFilter.toLowerCase();
                        return (
                          att.name.toLowerCase().includes(q) ||
                          att.destination.toLowerCase().includes(q) ||
                          att.category.toLowerCase().includes(q)
                        );
                      }
                      if (routeStops.length > 0) {
                        return routeStops.some(
                          (s) =>
                            s.toLowerCase().includes(att.destination.toLowerCase()) ||
                            att.destination.toLowerCase().includes(s.toLowerCase())
                        );
                      }
                      return true;
                    })
                    .map((att) => (
                      <div
                        key={att.id}
                        className="p-3 rounded-xl bg-white border border-stone-200 hover:border-forest-300 transition-all shadow-2xs flex flex-col justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-forest-900">{att.name}</span>
                            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                              Verified
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-500 mt-0.5">
                            📍 {att.destination} • 🏷️ {att.category} • ⏱️ ~{att.suggestedDurationHours} hrs
                          </div>
                          {att.description && (
                            <p className="text-[11px] text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                              {att.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() => handleInjectAttraction(att, selectedAttractionDayTarget)}
                            className="w-full py-1.5 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add to Day {selectedAttractionDayTarget}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Day-wise Itinerary Editor */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-card">
                <div>
                  <h2 className="text-sm font-bold text-forest-900">
                    Step 3: Day-wise Travel Timeline & Milestone Editor
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    Customize titles, transfer routes, excursions, meals, and confidential agent notes for each day.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Segmented View Switcher: Day-by-Day vs Grouped Stays */}
                  <div className="flex items-center p-0.5 rounded-lg bg-stone-100 border border-stone-200">
                    <button
                      type="button"
                      onClick={() => setBuilderStep3View('individual')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        builderStep3View === 'individual'
                          ? 'bg-forest-800 text-white shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Day Editor ({days.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuilderStep3View('grouped')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                        builderStep3View === 'grouped'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                      title="View consolidated multi-day stay sections"
                    >
                      <Layers className="w-3 h-3" />
                      <span>Grouped Stays ({stayGroups.length})</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAiModalOpen(true);
                      setAiGeneratedData(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>✨ AI Generate</span>
                  </button>

                  <button
                    onClick={() => {
                      const newDayNumber = days.length + 1;
                      const lastDay = days[days.length - 1];
                      const nextDate = lastDay ? addDaysToDate(lastDay.date, 1) : startDate;
                      const newDay: ItineraryDay = {
                        id: `day-${Date.now()}`,
                        dayNumber: newDayNumber,
                        date: nextDate,
                        dayType: 'Local Sightseeing',
                        title: `Day ${newDayNumber} Exploration`,
                        routeTitle: 'Local Sightseeing Excursion',
                        hotelDestination: 'Shimla',
                        mealPlan: 'MAP',
                        breakfastIncluded: true,
                        lunchIncluded: false,
                        dinnerIncluded: true,
                        isTravelEstimate: true,
                        activities: [],
                      };
                      setDays([...days, newDay]);
                      setNights(newDayNumber - 1);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-medium text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Day</span>
                  </button>
                </div>
              </div>

              {builderStep3View === 'grouped' ? (
                <div className="space-y-4">
                  <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>
                        <strong>Consolidated Multi-Day Stay Preview:</strong> Consecutive days in the same destination are consolidated into one unified section with day-wise sightseeing details.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBuilderStep3View('individual')}
                      className="text-[11px] font-bold text-amber-800 underline hover:text-amber-900 whitespace-nowrap self-start sm:self-auto"
                    >
                      Edit Individual Days →
                    </button>
                  </div>

                  {stayGroups.map((grp, gIdx) => (
                    <div
                      key={`builder-stay-${gIdx}`}
                      className="bg-white rounded-2xl border-2 border-stone-200 hover:border-forest-600/40 transition-all p-5 shadow-card space-y-4 text-xs"
                    >
                      {/* Section Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1.5 rounded-xl bg-forest-800 text-gold-400 font-bold text-xs shadow-2xs whitespace-nowrap">
                            {grp.isMultiDay ? `Day ${grp.startDay} – Day ${grp.endDay}` : `Day ${grp.startDay}`}
                          </span>
                          <div>
                            <h3 className="font-bold text-forest-900 text-sm flex items-center gap-2 flex-wrap">
                              <span>{grp.destination} {grp.isMultiDay ? 'Stay & Exploration' : grp.dayType}</span>
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                {grp.daysCount} {grp.daysCount === 1 ? 'Day' : 'Days'} • {grp.nightsCount} {grp.nightsCount === 1 ? 'Night' : 'Nights'} Stay
                              </span>
                            </h3>
                            <div className="text-[11px] text-stone-500 mt-0.5">
                              {formatIndianDate(grp.startDate)} {grp.isMultiDay ? `to ${formatIndianDate(grp.endDate)}` : ''}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {grp.mealPlan && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                              Meal Plan: {grp.mealPlan}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Day wise activities inside stay */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                          Day-Wise Sightseeing &amp; Schedule Details:
                        </span>
                        {grp.days.map((day) => (
                          <div key={day.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-forest-900 text-xs">
                                  Day {day.dayNumber}: {day.title}
                                </span>
                                <span className="text-[10px] text-stone-500 font-medium">({formatIndianDate(day.date)})</span>
                              </div>
                              <span className="text-[11px] text-stone-600 font-medium">{day.routeTitle}</span>
                            </div>

                            {day.activities.length > 0 ? (
                              <div className="space-y-1 pl-2">
                                {day.activities.map((act) => (
                                  <div key={act.id} className="text-[11px] text-stone-700 flex items-start gap-1.5">
                                    <span className="text-emerald-700 font-bold mt-0.5">✓</span>
                                    <div>
                                      <strong>{act.title}: </strong>
                                      <span>{act.description}</span>
                                      {act.timeSlot && <span className="text-stone-400 font-mono ml-1">({act.timeSlot})</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[11px] text-stone-400 italic pl-2">Leisure exploration &amp; sightseeing at own pace.</p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Hotel Stay Accommodation Tag */}
                      {grp.hotelName && (
                        <div className="p-3 rounded-xl bg-forest-900/5 border border-forest-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <HotelIcon className="w-4 h-4 text-forest-800" />
                            <span className="text-xs text-stone-800">
                              Overnight Accommodation ({grp.nightsCount}N): <strong className="text-forest-900">{grp.hotelName}</strong> ({grp.destination})
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-stone-600">
                            {grp.roomCategory || 'Deluxe Room'} • {grp.mealPlan}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Day Cards List (Individual Editor) */
                <div className="space-y-4">
                  {days.map((day, dayIndex) => {
                    const grp = stayGroups.find((g) => g.days.some((d) => d.id === day.id));
                    const isMulti = grp && grp.isMultiDay;
                    const idxInGrp = grp ? grp.days.findIndex((d) => d.id === day.id) + 1 : 1;

                    return (
                      <div
                        key={day.id}
                        className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden text-xs"
                      >
                        {/* Day Header Ribbon */}
                        <div className="bg-stone-50 p-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-forest-800 text-gold-400 font-bold text-xs flex items-center justify-center shadow-2xs">
                              D{day.dayNumber}
                            </span>
                            <div>
                              <div className="font-bold text-forest-900 text-xs flex items-center gap-2 flex-wrap">
                                <input
                                  type="date"
                                  value={day.date}
                                  onChange={(e) => {
                                    const newD = e.target.value;
                                    if (!newD) return;
                                    if (dayIndex === 0) {
                                      handleStartDateChange(newD);
                                    } else {
                                      handleUpdateDay(dayIndex, { date: newD });
                                    }
                                  }}
                                  className="px-2 py-0.5 rounded-md border border-stone-300 bg-white text-xs font-semibold text-forest-900 shadow-2xs outline-hidden focus:border-forest-600"
                                  title={dayIndex === 0 ? 'Changing Day 1 date shifts the entire trip timeline sequentially' : `Set date for Day ${day.dayNumber}`}
                                />
                                <span className="text-stone-400">•</span>
                                <span className="text-emerald-700">{day.dayType}</span>
                                {isMulti && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] flex items-center gap-1 shadow-2xs">
                                    <HotelIcon className="w-3 h-3 text-amber-700" />
                                    <span>{grp.destination} Stay (Day {idxInGrp} of {grp.daysCount})</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-stone-500">{day.routeTitle}</div>
                            </div>
                          </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={day.dayType}
                          onChange={(e) => handleUpdateDay(dayIndex, { dayType: e.target.value as DayType })}
                          className="px-2 py-1 rounded-lg border border-stone-200 bg-white text-[11px] font-medium"
                        >
                          <option value="Arrival & Transfer">Arrival & Transfer</option>
                          <option value="Local Sightseeing">Local Sightseeing</option>
                          <option value="Scenic Transfer">Scenic Transfer</option>
                          <option value="Leisure / Free Day">Leisure / Free Day</option>
                          <option value="Adventure / Excursion">Adventure / Excursion</option>
                          <option value="Departure">Departure</option>
                        </select>

                        <button
                          onClick={() => handleDuplicateDay(dayIndex)}
                          title="Duplicate this day"
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const updated = days.filter((_, i) => i !== dayIndex);
                            setDays(updated);
                            setNights(Math.max(1, updated.length - 1));
                          }}
                          title="Remove day"
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Day Content Body */}
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">Day Heading / Title</label>
                          <input
                            type="text"
                            value={day.title}
                            onChange={(e) => handleUpdateDay(dayIndex, { title: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600 font-medium"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">
                            Route & Estimated Distance / Drive Time
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={day.routeTitle}
                              onChange={(e) => handleUpdateDay(dayIndex, { routeTitle: e.target.value })}
                              placeholder="e.g. Chandigarh to Shimla (115 km / 3.5 hrs)"
                              className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600"
                            />
                            <div className="flex items-center gap-1 text-[11px] text-stone-500 whitespace-nowrap">
                              <input
                                type="checkbox"
                                id={`est-${day.id}`}
                                checked={day.isTravelEstimate}
                                onChange={(e) => handleUpdateDay(dayIndex, { isTravelEstimate: e.target.checked })}
                              />
                              <label htmlFor={`est-${day.id}`}>Estimate</label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Meals Tag Strip */}
                      <div className="flex items-center gap-4 p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                        <span className="font-semibold text-stone-700 text-[11px]">Included Meals:</span>
                        <label className="flex items-center gap-1.5 text-[11px] text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={day.breakfastIncluded}
                            onChange={(e) => handleUpdateDay(dayIndex, { breakfastIncluded: e.target.checked })}
                          />
                          <span>Breakfast</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-[11px] text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={day.lunchIncluded}
                            onChange={(e) => handleUpdateDay(dayIndex, { lunchIncluded: e.target.checked })}
                          />
                          <span>Lunch</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-[11px] text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={day.dinnerIncluded}
                            onChange={(e) => handleUpdateDay(dayIndex, { dinnerIncluded: e.target.checked })}
                          />
                          <span>Dinner</span>
                        </label>
                      </div>

                      {/* Chronological Milestones / Activities */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-stone-700 text-[11px]">
                            Timeline Events & Excursions ({day.activities.length})
                          </span>
                          <button
                            onClick={() => handleAddActivity(dayIndex)}
                            className="text-[11px] text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Event</span>
                          </button>
                        </div>

                        {day.activities.map((act) => (
                          <div
                            key={act.id}
                            className="p-3 rounded-xl bg-stone-50/70 border border-stone-200 space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={act.timeSlot || ''}
                                onChange={(e) => {
                                  const updated = day.activities.map((a) =>
                                    a.id === act.id ? { ...a, timeSlot: e.target.value } : a
                                  );
                                  handleUpdateDay(dayIndex, { activities: updated });
                                }}
                                placeholder="Time (e.g. 10:00 AM)"
                                className="w-24 px-2 py-1 rounded border border-stone-200 bg-white font-mono text-[11px]"
                              />
                              <input
                                type="text"
                                value={act.title}
                                onChange={(e) => {
                                  const updated = day.activities.map((a) =>
                                    a.id === act.id ? { ...a, title: e.target.value } : a
                                  );
                                  handleUpdateDay(dayIndex, { activities: updated });
                                }}
                                placeholder="Activity title..."
                                className="flex-1 px-2 py-1 rounded border border-stone-200 bg-white font-medium text-xs"
                              />
                              <button
                                onClick={() => handleRemoveActivity(dayIndex, act.id)}
                                className="text-stone-400 hover:text-rose-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <textarea
                              rows={2}
                              value={act.description}
                              onChange={(e) => {
                                const updated = day.activities.map((a) =>
                                  a.id === act.id ? { ...a, description: e.target.value } : a
                                );
                                handleUpdateDay(dayIndex, { activities: updated });
                              }}
                              placeholder="Describe experience, route viewpoints, highlights..."
                              className="w-full px-2.5 py-1.5 rounded border border-stone-200 bg-white text-[11px]"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Agent Confidential Ops Box */}
                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px] mb-1">
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Confidential Agent Ops Box (Internal Only — Hidden from Customer)</span>
                        </div>
                        <input
                          type="text"
                          value={day.confidentialOpsNotes || ''}
                          onChange={(e) => handleUpdateDay(dayIndex, { confidentialOpsNotes: e.target.value })}
                          placeholder="e.g. Chauffeur gate pass #991, permit slip with driver Ramesh, emergency manager cell..."
                          className="w-full px-2.5 py-1 rounded-lg border border-amber-200 bg-white text-[11px] outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

          {/* STEP 4: Hotels & Accommodation */}
          {currentStep === 4 && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card space-y-5 text-xs">
              <div className="pb-3 border-b border-stone-100">
                <h2 className="text-sm font-bold text-forest-900">Step 4: Accommodation & Hotel Allocation</h2>
                <p className="text-[11px] text-stone-500">
                  Select hand-picked hotels for each stay night, pick meal plan (EP, CP, MAP, AP), and view calculated wholesale rates.
                </p>
              </div>

              <div className="space-y-4">
                {days.map((day, idx) => {
                  if (idx === days.length - 1 && day.dayType === 'Departure') return null;
                  const selectedHotelObj = hotels.find((h) => h.id === day.hotelId);

                  return (
                    <div
                      key={day.id}
                      className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-forest-900 text-xs">
                          Night {day.dayNumber} ({formatIndianDate(day.date)}): {day.hotelDestination} Stay
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-forest-100 text-forest-800">
                          {roomsCount} Room(s)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="font-medium text-stone-700 block mb-1">Hotel Property</label>
                          <select
                            value={day.hotelId || ''}
                            onChange={(e) => {
                              const hObj = hotels.find((h) => h.id === e.target.value);
                              handleUpdateDay(idx, {
                                hotelId: e.target.value,
                                customHotelName: hObj?.name,
                                roomCategory: hObj?.rates[0]?.roomCategory || 'Deluxe Room',
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs outline-hidden focus:border-forest-600"
                          >
                            <option value="">Select Property...</option>
                            {hotels.map((h) => (
                              <option key={h.id} value={h.id}>
                                {h.name} ({h.destination} • {h.starCategory})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="font-medium text-stone-700 block mb-1">Room Category</label>
                          <input
                            type="text"
                            value={day.roomCategory || ''}
                            onChange={(e) => handleUpdateDay(idx, { roomCategory: e.target.value })}
                            placeholder="e.g. Deluxe Valley View"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs outline-hidden focus:border-forest-600"
                          />
                        </div>

                        <div>
                          <label className="font-medium text-stone-700 block mb-1">Meal Plan</label>
                          <select
                            value={day.mealPlan}
                            onChange={(e) => handleUpdateDay(idx, { mealPlan: e.target.value as MealPlanCode })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs outline-hidden focus:border-forest-600 font-semibold text-forest-900"
                          >
                            <option value="EP">EP — Room Only</option>
                            <option value="CP">CP — Room + Breakfast</option>
                            <option value="MAP">MAP — Room + Breakfast + Dinner</option>
                            <option value="AP">AP — All Meals (B + L + D)</option>
                          </select>
                        </div>
                      </div>

                      {/* Property Preview & Redaction Tag */}
                      {selectedHotelObj && (
                        <div className="p-3 rounded-lg bg-white border border-stone-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-10 rounded bg-stone-100 overflow-hidden flex-shrink-0">
                              <img
                                src={selectedHotelObj.imageUrl}
                                alt={selectedHotelObj.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-forest-900">{selectedHotelObj.name}</div>
                              <div className="text-[10px] text-stone-500">
                                Pre-Advance Mask: &ldquo;{selectedHotelObj.maskedCategoryName}&rdquo;
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-stone-400 block">Estimated Wholesale Rate:</span>
                            <span className="font-bold text-forest-900 tabular-nums">
                              {formatINR(
                                calculateHotelDayCost(selectedHotelObj, day.roomCategory || 'Deluxe', day.mealPlan, roomsCount, adults).cost
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Vehicles & Transport */}
          {currentStep === 5 && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card space-y-5 text-xs">
              <div className="pb-3 border-b border-stone-100">
                <h2 className="text-sm font-bold text-forest-900">Step 5: Dedicated Vehicle & Transport Allotment</h2>
                <p className="text-[11px] text-stone-500">
                  Select fleet tier, specify pricing model, driver allowances, and state border toll allowances.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {vehicles.map((veh) => {
                  const isSelected = selectedVehicleId === veh.id;
                  const costPreview = calculateVehicleTourCost(veh, duration.days, duration.days * 200);

                  return (
                    <div
                      key={veh.id}
                      onClick={() => setSelectedVehicleId(veh.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-forest-800 bg-forest-50/50 shadow-sm ring-1 ring-forest-800'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="h-28 rounded-lg overflow-hidden mb-3 bg-stone-100">
                        <img
                          src={veh.imageUrl}
                          alt={veh.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="font-bold text-forest-900 text-xs">{veh.displayName}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {veh.category} • {veh.seatingCapacity} Seater
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1 line-clamp-2">
                        {veh.luggageCapacityNotes}
                      </div>

                      <div className="mt-3 pt-2 border-t border-stone-200 flex justify-between items-center">
                        <span className="text-[10px] text-stone-500">Calculated Transport:</span>
                        <span className="font-bold text-forest-900 tabular-nums">
                          {formatINR(costPreview.cost)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Manual Override */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="font-semibold text-stone-700">Manual Transport Cost Override (Optional)</div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={manualVehicleCost || ''}
                    onChange={(e) => setManualVehicleCost(Number(e.target.value))}
                    placeholder="Enter fixed amount in ₹ to override standard rate card..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs outline-hidden"
                  />
                  {manualVehicleCost > 0 && (
                    <button
                      onClick={() => setManualVehicleCost(0)}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Reset to Auto Rate Card
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Live Costing & Profit Margins */}
          {currentStep === 6 && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card space-y-5 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h2 className="text-sm font-bold text-forest-900">Step 6: Live Costing Engine & Profit Margins</h2>
                  <p className="text-[11px] text-stone-500">
                    Transparent internal wholesale sheet. Internal supplier cost and margins are strictly hidden from customers.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Confidential Internal View</span>
                </span>
              </div>

              {/* Itemized Line Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] border-y border-stone-200">
                    <tr>
                      <th className="py-2.5 px-3">Item Category</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Wholesale Net Cost (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {costingItems.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/50">
                        <td className="py-2.5 px-3 font-semibold text-forest-900">
                          {item.category}
                        </td>
                        <td className="py-2.5 px-3 text-stone-600">
                          <div>{item.title}</div>
                          {item.notes && <div className="text-[10px] text-stone-400">{item.notes}</div>}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-forest-900 tabular-nums">
                          {formatINR(item.supplierCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-stone-200 bg-stone-50 font-bold">
                    <tr>
                      <td colSpan={2} className="py-2.5 px-3 text-stone-800">
                        Total Wholesale Net Cost:
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-forest-900 tabular-nums text-sm">
                        {formatINR(liveCosting.totalSupplierCost)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Margins, GST & Discount Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-forest-50/70 border border-forest-100">
                {/* Markup */}
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Agency Margin / Markup
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={markupType}
                      onChange={(e) => setMarkupType(e.target.value as any)}
                      className="px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
                    >
                      <option value="percentage">% Percent</option>
                      <option value="fixed_inr">₹ Fixed</option>
                    </select>
                    <input
                      type="number"
                      value={markupValue}
                      onChange={(e) => setMarkupValue(Number(e.target.value))}
                      className="w-24 px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-semibold"
                    />
                  </div>
                  <div className="text-[10px] text-emerald-800 mt-1">
                    Estimated Profit: <strong>{formatINR(liveCosting.grossProfitAmount)}</strong>
                  </div>
                </div>

                {/* GST Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-stone-700">Tour Operator GST</label>
                    <input
                      type="checkbox"
                      id="gstToggle"
                      checked={gstEnabled}
                      onChange={(e) => setGstEnabled(e.target.checked)}
                      className="w-4 h-4 text-forest-800 rounded"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={gstRate}
                      disabled={!gstEnabled}
                      onChange={(e) => setGstRate(Number(e.target.value))}
                      className="w-20 px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-semibold disabled:opacity-50"
                    />
                    <span className="text-xs text-stone-500">% (SAC 998555)</span>
                  </div>
                  <div className="text-[10px] text-stone-500 mt-1">
                    {gstEnabled ? `GST Tax: ${formatINR(liveCosting.gstAmount)}` : 'GST Not Included in Price'}
                  </div>
                </div>

                {/* Discount */}
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Agency Goodwill Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-semibold"
                  />
                  <div className="text-[10px] text-stone-500 mt-1">
                    Advance Deposit Req: {advancePercent}% ({formatINR(liveCosting.advanceAmountRequired)})
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Inclusions, Exclusions & Terms */}
          {currentStep === 7 && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card space-y-6 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div>
                  <h2 className="text-sm font-bold text-forest-900">
                    Step 7: Inclusions, Exclusions, Terms & Ready-Made Policy Presets
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    Apply standardized Indian regional trip rules (Himachal, Kashmir, Ladakh, Rajasthan, Extreme Weather, MICE) or customize and save as trip rule presets.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSavePresetModal(true)}
                  className="px-3 py-1.5 rounded-lg border border-forest-700 text-forest-800 hover:bg-forest-50 font-semibold flex items-center gap-1.5 text-xs transition-colors shrink-0"
                >
                  <Bookmark className="w-3.5 h-3.5 text-forest-600" />
                  <span>Save as Trip Rule Preset</span>
                </button>
              </div>

              {/* Ready-Made Preset Selector Banner */}
              <div className="p-4 bg-gradient-to-r from-amber-50/70 via-stone-50 to-forest-50/50 rounded-xl border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-700" />
                  <span className="font-bold text-forest-900 text-xs">
                    Ready-Made Regional Rule Presets & Circuit Templates
                  </span>
                  <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                    {clausePresets.length} Presets Available
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-6">
                    <select
                      value={selectedPresetId}
                      onChange={(e) => setSelectedPresetId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white font-medium text-xs focus:border-forest-600 outline-hidden"
                    >
                      {clausePresets.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          [{preset.category}] {preset.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3 flex items-center gap-2 text-[11px] font-medium text-stone-700">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="presetMode"
                        checked={presetApplyMode === 'replace'}
                        onChange={() => setPresetApplyMode('replace')}
                        className="text-forest-700 focus:ring-forest-600"
                      />
                      <span>Replace All</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="presetMode"
                        checked={presetApplyMode === 'append'}
                        onChange={() => setPresetApplyMode('append')}
                        className="text-forest-700 focus:ring-forest-600"
                      />
                      <span>Append</span>
                    </label>
                  </div>

                  <div className="sm:col-span-3">
                    <button
                      type="button"
                      onClick={handleApplyPreset}
                      className="w-full px-3 py-2 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                      <span>Insert Preset Rules</span>
                    </button>
                  </div>
                </div>

                {/* Selected Preset Details Note */}
                {(() => {
                  const currentPreset = clausePresets.find((p) => p.id === selectedPresetId);
                  return currentPreset ? (
                    <p className="text-[11px] text-stone-600 bg-white/70 p-2 rounded-lg border border-stone-200/60 leading-relaxed">
                      <strong className="text-forest-900 font-semibold">{currentPreset.title}:</strong>{' '}
                      {currentPreset.description} ({currentPreset.inclusions.length} Inclusions,{' '}
                      {currentPreset.exclusions.length} Exclusions, {currentPreset.termsAndConditions.length} T&C Clauses)
                    </p>
                  ) : null;
                })()}

                {clauseFeedbackMsg && (
                  <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{clauseFeedbackMsg}</span>
                  </div>
                )}
              </div>

              {/* Inclusions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-forest-900 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span>Package Inclusions ({inclusions.length})</span>
                  </label>
                  <span className="text-[10px] text-stone-400">Printed with green checkmarks on proposal</span>
                </div>
                <div className="space-y-1.5">
                  {inclusions.map((inc, i) => (
                    <div key={i} className="flex items-center gap-2 group">
                      <span className="text-emerald-600 font-bold w-4 text-center">✓</span>
                      <input
                        type="text"
                        value={inc}
                        onChange={(e) => {
                          const updated = [...inclusions];
                          updated[i] = e.target.value;
                          setInclusions(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs focus:border-forest-600 bg-stone-50/50 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setInclusions(inclusions.filter((_, idx) => idx !== i))}
                        className="text-stone-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                        title="Remove inclusion"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setInclusions([...inclusions, 'Special customized inclusion clause'])}
                    className="text-[11px] font-semibold text-emerald-700 hover:underline mt-1.5 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Inclusion Clause</span>
                  </button>
                </div>
              </div>

              {/* Exclusions */}
              <div className="pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-forest-900 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center text-[10px] font-bold">✕</span>
                    <span>Package Exclusions ({exclusions.length})</span>
                  </label>
                  <span className="text-[10px] text-stone-400">Printed with red cross marks on proposal</span>
                </div>
                <div className="space-y-1.5">
                  {exclusions.map((exc, i) => (
                    <div key={i} className="flex items-center gap-2 group">
                      <span className="text-rose-600 font-bold w-4 text-center">✕</span>
                      <input
                        type="text"
                        value={exc}
                        onChange={(e) => {
                          const updated = [...exclusions];
                          updated[i] = e.target.value;
                          setExclusions(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs focus:border-forest-600 bg-stone-50/50 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setExclusions(exclusions.filter((_, idx) => idx !== i))}
                        className="text-stone-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                        title="Remove exclusion"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setExclusions([...exclusions, 'Personal adventure gear, tipping, and union taxi fares'])}
                    className="text-[11px] font-semibold text-rose-700 hover:underline mt-1.5 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Exclusion Clause</span>
                  </button>
                </div>
              </div>

              {/* Terms & Conditions and Payment Policies */}
              <div className="pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-forest-900 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-bold">§</span>
                    <span>Terms & Conditions, Cancellation & Payment Policies ({terms.length})</span>
                  </label>
                  <span className="text-[10px] text-stone-400">Legal trip policies displayed on final proposal & PDF</span>
                </div>
                <div className="space-y-2">
                  {terms.map((term, i) => (
                    <div key={i} className="flex items-start gap-2 group">
                      <span className="text-amber-700 font-bold w-4 text-center mt-1.5">§</span>
                      <textarea
                        rows={2}
                        value={term}
                        onChange={(e) => {
                          const updated = [...terms];
                          updated[i] = e.target.value;
                          setTerms(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs focus:border-forest-600 bg-stone-50/50 focus:bg-white leading-relaxed resize-y"
                      />
                      <button
                        type="button"
                        onClick={() => setTerms(terms.filter((_, idx) => idx !== i))}
                        className="text-stone-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors mt-1"
                        title="Remove term"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTerms([...terms, 'Any unutilized services due to natural closures are non-refundable.'])}
                    className="text-[11px] font-semibold text-amber-800 hover:underline mt-1.5 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Terms & Conditions Clause</span>
                  </button>
                </div>
              </div>

              {/* Proposal Presentation & Stay Grouping Preferences */}
              <div className="pt-4 border-t border-stone-100 space-y-3">
                <div className="font-bold text-forest-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-forest-600" />
                  <span>Proposal Layout &amp; Multi-Day Stay Display Preference</span>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <strong className="text-forest-900 text-xs block">
                      Consolidate Multi-Day Stays in Itinerary
                    </strong>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      When enabled, consecutive days in the same destination (e.g., 2 or 3 days in Manali) are displayed as a single unified section with all sightseeing details rather than separate day cards.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomization((prev) => ({
                        ...prev,
                        groupMultiDayStays: prev.groupMultiDayStays === false ? true : false,
                      }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all shrink-0 ${
                      customization.groupMultiDayStays !== false
                        ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                        : 'bg-white text-stone-600 border-stone-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-700" />
                    <span>{customization.groupMultiDayStays !== false ? 'Enabled (Grouped)' : 'Disabled (Split)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Customer Proposal Preview & Sharing */}
          {currentStep === 8 && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card space-y-6 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                <div>
                  <h2 className="text-base font-bold text-forest-900">
                    Step 8: Customer Proposal Preview & Disclosure Controls
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Review exactly what the guest will see on mobile and PDF before sending.
                  </p>
                </div>

                {/* DUAL MODE DISCLOSURE SWITCHER */}
                <div className="flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200">
                  <button
                    onClick={() =>
                      setCustomization({
                        ...customization,
                        disclosureMode: 'masked',
                        showExactHotelNames: false,
                        showDriverVehicleDetails: false,
                      })
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      customization.disclosureMode === 'masked'
                        ? 'bg-purple-700 text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pre-Advance (Masked)</span>
                  </button>

                  <button
                    onClick={() =>
                      setCustomization({
                        ...customization,
                        disclosureMode: 'disclosed',
                        showExactHotelNames: true,
                        showDriverVehicleDetails: true,
                      })
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      customization.disclosureMode === 'disclosed'
                        ? 'bg-teal-700 text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Confirmed (Disclosed)</span>
                  </button>
                </div>
              </div>

              {/* Mode Notice Banner */}
              {isPreAdvanceMasked ? (
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-purple-900 text-xs">
                      Pre-Advance Quotation Protection Active
                    </div>
                    <p className="text-[11px] text-purple-800 leading-relaxed mt-0.5">
                      Exact hotel properties are automatically masked to category descriptions (e.g., &ldquo;Selected 4-Star Premium Resort, Mall Road Area or Similar&rdquo;).
                      Driver contact details and license numbers are redacted. Wholesale supplier costs and profit margins remain strictly internal.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-teal-900 text-xs">
                      Confirmed Post-Advance Voucher View Active
                    </div>
                    <p className="text-[11px] text-teal-800 leading-relaxed mt-0.5">
                      Confirmed hotel property names and vehicle details are disclosed for the guest&apos;s departure manifest. Internal agency margins remain hidden.
                    </p>
                  </div>
                </div>
              )}

              {/* Proposal Document Preview Container */}
              <div className="p-6 rounded-2xl bg-stone-canvas border border-stone-300 space-y-6 shadow-inner">
                {/* Header with Agency Branding */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-300">
                  <div>
                    <div className="flex items-center gap-2">
                      <Compass className="w-6 h-6 text-emerald-700" />
                      <span className="text-base font-bold text-forest-900 tracking-tight">
                        {companySettings.agencyName}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">{companySettings.tagline}</p>
                  </div>
                  <div className="text-left sm:text-right text-[11px] text-stone-600">
                    <div className="font-bold text-forest-900">{companySettings.phone}</div>
                    <div>{companySettings.email}</div>
                    <div>{companySettings.website}</div>
                  </div>
                </div>

                {/* Proposal Title Banner */}
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        Bespoke Tour Proposal
                      </span>
                      <h3 className="text-base font-bold text-forest-900 mt-1">
                        {sanitizedQuote.tripTitle}
                      </h3>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Route: {sanitizedQuote.destinationsSummary}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-stone-500">Proposal ID</div>
                      <div className="font-mono font-bold text-forest-900 text-xs">
                        {sanitizedQuote.quoteNumber}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-stone-100 text-[11px]">
                    <div>
                      <span className="text-stone-400 block">Lead Guest:</span>
                      <strong className="text-forest-900">{sanitizedQuote.guestName}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Travel Dates:</span>
                      <strong className="text-forest-900">
                        {formatIndianDate(sanitizedQuote.startDate)} ({sanitizedQuote.durationNights}N/{sanitizedQuote.durationDays}D)
                      </strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Travellers:</span>
                      <strong className="text-forest-900">
                        {sanitizedQuote.adults} Adults {sanitizedQuote.children > 0 ? `+ ${sanitizedQuote.children} Chd` : ''}
                      </strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Vehicle:</span>
                      <strong className="text-forest-900">{sanitizedQuote.vehicleName}</strong>
                    </div>
                  </div>
                </div>

                {/* Day-by-Day Proposal List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <h4 className="font-bold text-forest-900 text-xs uppercase tracking-wider">
                      Day-Wise Curated Itinerary
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        setCustomization((prev) => ({
                          ...prev,
                          groupMultiDayStays: prev.groupMultiDayStays === false ? true : false,
                        }))
                      }
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                        customization.groupMultiDayStays !== false
                          ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                      title="Toggle consolidating consecutive stays in the same destination into one section"
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-600" />
                      <span>{customization.groupMultiDayStays !== false ? 'Multi-Day Stays Grouped' : 'Day-by-Day Split'}</span>
                    </button>
                  </div>

                  {customization.groupMultiDayStays !== false ? (
                    groupItineraryDaysByLocation(sanitizedQuote.days).map((group, grpIdx) => {
                      if (group.isMultiDay) {
                        return (
                          <div
                            key={`preview-grp-${grpIdx}`}
                            className="bg-white p-4 rounded-xl border-2 border-stone-200 shadow-2xs space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
                              <div className="flex items-center gap-2.5">
                                <span className="px-2.5 py-1 rounded-lg bg-forest-800 text-gold-400 font-bold text-xs shadow-2xs">
                                  Day {group.startDay} – Day {group.endDay}
                                </span>
                                <div>
                                  <strong className="text-forest-900 text-xs">
                                    {group.destination} Stay &amp; Exploration
                                  </strong>
                                  <div className="text-[10px] text-stone-500">
                                    {formatIndianDate(group.startDate)} to {formatIndianDate(group.endDate)} • {group.daysCount} Days / {group.nightsCount} Nights
                                  </div>
                                </div>
                              </div>
                              {group.mealPlan && (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                  {group.mealPlan} Plan
                                </span>
                              )}
                            </div>

                            {/* Sightseeing details for each day */}
                            <div className="space-y-2">
                              {group.days.map((day) => (
                                <div key={day.id} className="p-2.5 rounded-lg bg-stone-50/80 border border-stone-200/60 space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-bold text-stone-900">
                                      Day {day.dayNumber}: {day.title}
                                    </span>
                                    <span className="text-stone-500 font-medium">
                                      {formatIndianDate(day.date)}
                                    </span>
                                  </div>
                                  {day.routeTitle && (
                                    <div className="text-[10px] text-stone-500">{day.routeTitle}</div>
                                  )}
                                  {day.activities.length > 0 && (
                                    <div className="space-y-1 pt-1">
                                      {day.activities.map((a) => (
                                        <div key={a.id} className="text-[11px] text-stone-600 pl-2.5 border-l-2 border-emerald-500">
                                          <span className="font-semibold text-stone-800">{a.timeSlot ? `${a.timeSlot} — ` : ''}{a.title}: </span>
                                          <span>{a.description}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Stay accommodation details */}
                            {group.hotelName && (
                              <div className="p-2.5 rounded-lg bg-stone-50 text-[11px] flex items-center justify-between text-stone-800">
                                <div className="flex items-center gap-2">
                                  <HotelIcon className="w-3.5 h-3.5 text-forest-600 flex-shrink-0" />
                                  <span>
                                    Stay ({group.nightsCount} Nights): <strong>{group.hotelName}</strong> ({group.destination})
                                  </span>
                                </div>
                                <span className="text-[10px] font-semibold text-stone-500">
                                  {group.roomCategory || 'Deluxe Room'} • {group.mealPlan}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      }

                      // Single day
                      const single = group.days[0];
                      return (
                        <div
                          key={single.id}
                          className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded bg-forest-800 text-gold-400 text-[10px] font-bold flex items-center justify-center">
                                D{single.dayNumber}
                              </span>
                              <span className="font-bold text-forest-900 text-xs">{single.title}</span>
                            </div>
                            <span className="text-[10px] text-stone-500 font-medium">{formatIndianDate(single.date)}</span>
                          </div>

                          <div className="text-[11px] text-stone-600">{single.routeTitle}</div>

                          {single.customHotelName && single.dayType !== 'Departure' && (
                            <div className="p-2 rounded bg-stone-50 text-[11px] flex items-center gap-2 font-medium text-forest-900">
                              <HotelIcon className="w-3.5 h-3.5 text-forest-600 flex-shrink-0" />
                              <span>
                                Stay: <strong>{single.customHotelName}</strong> ({single.mealPlan})
                              </span>
                            </div>
                          )}

                          {single.activities.length > 0 && (
                            <div className="space-y-1 pt-1">
                              {single.activities.map((a) => (
                                <div key={a.id} className="text-[11px] text-stone-600 pl-3 border-l-2 border-emerald-500">
                                  <span className="font-semibold text-stone-800">{a.timeSlot ? `${a.timeSlot} — ` : ''}{a.title}: </span>
                                  <span>{a.description}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    sanitizedQuote.days.map((d) => (
                      <div
                        key={d.id}
                        className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-forest-800 text-gold-400 text-[10px] font-bold flex items-center justify-center">
                              D{d.dayNumber}
                            </span>
                            <span className="font-bold text-forest-900 text-xs">{d.title}</span>
                          </div>
                          <span className="text-[10px] text-stone-500 font-medium">{formatIndianDate(d.date)}</span>
                        </div>

                        <div className="text-[11px] text-stone-600">{d.routeTitle}</div>

                        {/* Display Hotel Name (Masked or Disclosed) */}
                        {d.customHotelName && d.dayType !== 'Departure' && (
                          <div className="p-2 rounded bg-stone-50 text-[11px] flex items-center gap-2 font-medium text-forest-900">
                            <HotelIcon className="w-3.5 h-3.5 text-forest-600 flex-shrink-0" />
                            <span>
                              Stay: <strong>{d.customHotelName}</strong> ({d.mealPlan})
                            </span>
                          </div>
                        )}

                        {/* Activities */}
                        {d.activities.length > 0 && (
                          <div className="space-y-1 pt-1">
                            {d.activities.map((a) => (
                              <div key={a.id} className="text-[11px] text-stone-600 pl-3 border-l-2 border-emerald-500">
                                <span className="font-semibold text-stone-800">{a.timeSlot ? `${a.timeSlot} — ` : ''}{a.title}: </span>
                                <span>{a.description}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Customer Price & Payment Box */}
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[11px] text-stone-500 block">Package Total Price</span>
                    <div className="text-xl font-bold text-forest-900 tabular-nums">
                      {formatINR(sanitizedQuote.costing.finalSellingPrice)}
                    </div>
                    <div className="text-[11px] text-emerald-800 font-medium">
                      {sanitizedQuote.costing.gstEnabled ? '✓ Inclusive of 5% Tour Operator GST' : 'Excluding GST'} • {formatINR(sanitizedQuote.costing.pricePerAdult)} per adult
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-stone-500 block">Advance Deposit Required (30%)</span>
                    <div className="text-base font-bold text-gold-600 tabular-nums">
                      {formatINR(sanitizedQuote.costing.advanceAmountRequired)}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      Balance Due on Arrival: {formatINR(sanitizedQuote.costing.balanceDueAmount)}
                    </div>
                  </div>
                </div>

                {/* Bank / UPI Details */}
                <div className="bg-white p-4 rounded-xl border border-stone-200 text-[11px] text-stone-700 space-y-1">
                  <div className="font-bold text-forest-900">Official Payment & Booking Deposit Instructions</div>
                  <div>Bank: <strong>{companySettings.bankName}</strong> ({companySettings.branchName})</div>
                  <div>Account: <strong>{companySettings.accountNumber}</strong> • IFSC: <strong>{companySettings.ifscCode}</strong></div>
                  <div>UPI VPA: <strong className="text-emerald-700">{companySettings.upiVpa}</strong></div>
                </div>
              </div>

              {/* Action Sharing Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 flex-wrap">
                <a
                  href={`https://wa.me/${guestPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    generateWhatsAppMessage(sanitizedQuote, `${typeof window !== 'undefined' ? window.location.origin : ''}/itineraries/${sanitizedQuote.id}/preview`, companySettings.agencyName)
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    recordShareEvent({
                      quoteId: sanitizedQuote.id,
                      quoteNumber: sanitizedQuote.quoteNumber,
                      channel: 'WhatsApp',
                      recipient: guestPhone,
                      disclosureMode: customization.disclosureMode,
                      version: sanitizedQuote.version,
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Send via WhatsApp</span>
                </a>

                <button
                  onClick={() => {
                    recordShareEvent({
                      quoteId: sanitizedQuote.id,
                      quoteNumber: sanitizedQuote.quoteNumber,
                      channel: 'PDF Download',
                      recipient: guestName,
                      disclosureMode: customization.disclosureMode,
                      version: sanitizedQuote.version,
                    });
                    window.print();
                  }}
                  className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Proposal PDF</span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Navigation Buttons (Next / Prev) */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>

            <span className="text-xs text-stone-400 font-medium">
              Step {currentStep} of 8
            </span>

            <button
              onClick={() => setCurrentStep(Math.min(8, currentStep + 1))}
              disabled={currentStep === 8}
              className="px-4 py-2 rounded-lg bg-forest-800 hover:bg-forest-700 text-white text-xs font-semibold flex items-center gap-1 disabled:opacity-40"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Persistent Live Costing & Summary Drawer (Right Column) */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card space-y-4 text-xs sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="font-bold text-forest-900 text-xs">Live Costing Summary</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            {/* Price Cards */}
            <div className="p-3.5 rounded-xl bg-forest-900 text-white space-y-2">
              <span className="text-[10px] text-stone-300 block">Package Selling Total</span>
              <div className="text-2xl font-bold text-gold-400 tabular-nums">
                {formatINR(liveCosting.finalSellingPrice)}
              </div>
              <div className="text-[11px] text-stone-200 flex justify-between pt-1 border-t border-forest-800">
                <span>Per Adult ({adults} Pax):</span>
                <strong className="text-white">{formatINR(liveCosting.pricePerAdult)}</strong>
              </div>
            </div>

            {/* Internal Wholesale breakdown (Visible to staff) */}
            <div className="space-y-2 pt-1 border-t border-stone-100 text-[11px]">
              <div className="flex justify-between text-stone-600">
                <span>Wholesale Supplier Cost:</span>
                <span className="font-mono text-forest-900 font-medium">
                  {formatINR(liveCosting.totalSupplierCost)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Agency Margin ({markupValue}%):</span>
                <span>+{formatINR(liveCosting.grossProfitAmount)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>GST (5% SAC 998555):</span>
                <span>{liveCosting.gstEnabled ? `+${formatINR(liveCosting.gstAmount)}` : 'Excl.'}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}
            </div>

            {/* Advance Deposit */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] space-y-1">
              <div className="flex justify-between text-amber-900 font-bold">
                <span>Advance Required ({advancePercent}%):</span>
                <span>{formatINR(liveCosting.advanceAmountRequired)}</span>
              </div>
              <div className="flex justify-between text-amber-800">
                <span>Balance on Arrival:</span>
                <span>{formatINR(liveCosting.balanceDueAmount)}</span>
              </div>
            </div>

            {/* Disclosure state indicator */}
            <div className="pt-2 border-t border-stone-100">
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                {isPreAdvanceMasked ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-purple-600" />
                    <span>Mode: Pre-Advance (Hotels Masked)</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-teal-600" />
                    <span>Mode: Confirmed (Disclosed)</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* GEMINI FLASH AI SYNTHESIS MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-forest-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 text-xs overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-forest-900 to-forest-800 text-white flex items-center justify-between border-b border-forest-700">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-forest-950 flex items-center justify-center font-bold shadow-2xs">
                  <Sparkles className="w-4 h-4 text-forest-950" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                    <span>Google Gemini Flash Neural Day Generator</span>
                    <span className="text-[10px] bg-amber-400/20 text-gold-300 border border-gold-400/30 px-2 py-0.5 rounded-full font-mono">
                      {companySettings.geminiModel || 'gemini-1.5-flash'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-stone-300 mt-0.5">
                    Generate balanced Himalayan routes, realistic driving estimates & day-by-day sightseeing.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-forest-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <div>
                  <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                    Circuit & Destinations
                  </label>
                  <div className="font-bold text-forest-900 text-xs">
                    {routeStops.join(' → ')}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                    Duration & Passengers
                  </label>
                  <div className="font-bold text-forest-900 text-xs">
                    {nights} Nights ({duration.days} Days) • {adults} Adults
                  </div>
                </div>
              </div>

              {/* Trip Style Selection */}
              <div>
                <label className="font-semibold text-stone-700 block mb-1.5">
                  Trip Style & Guest Pace Preference
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Family Holiday',
                    'Honeymoon & Romantic',
                    'Adventure & Trekking',
                    'Heritage & Culture',
                    'Leisure & Scenic',
                    'Senior Citizen Comfort',
                  ].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setAiTripStyle(style)}
                      className={`px-3 py-2 rounded-xl text-left border text-xs font-semibold transition-all ${
                        aiTripStyle === style
                          ? 'border-forest-800 bg-forest-50 text-forest-900 shadow-2xs ring-1 ring-forest-800'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generation Notice */}
              {companySettings.geminiApiKey ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Gemini Flash API key detected. Will perform live generative synthesis with custom timings.</span>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span>Using built-in Desi Journey Regional Knowledge Base. (To activate live Google Gemini neural models, configure your API key in <Link href="/settings" className="underline font-bold text-forest-800">Settings</Link>).</span>
                  </div>
                </div>
              )}

              {aiNoticeMessage && (
                <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl text-[11px] text-stone-700">
                  {aiNoticeMessage}
                </div>
              )}

              {/* Generated Result Preview */}
              {aiGeneratedData && (
                <div className="space-y-3 pt-2 border-t border-stone-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Generated via {aiSourceBadge || 'Gemini Flash'}
                      </span>
                      <h4 className="text-xs font-bold text-forest-900 mt-1">
                        {aiGeneratedData.tripTitle}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        {aiGeneratedData.overview}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {aiGeneratedData.days?.map((day: any, dIdx: number) => (
                      <div
                        key={dIdx}
                        className="p-2.5 rounded-lg border border-stone-200 bg-stone-50/70 text-xs"
                      >
                        <div className="flex items-center gap-2 font-bold text-forest-900">
                          <span className="px-1.5 py-0.5 rounded bg-forest-800 text-gold-400 text-[10px]">
                            Day {day.dayNumber || dIdx + 1}
                          </span>
                          <span>{day.title}</span>
                          <span className="text-[10px] text-stone-400 font-normal">
                            ({day.dayType})
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-600 mt-0.5">
                          Route: <em>{day.routeTitle}</em>
                        </div>
                        {day.activities && day.activities.length > 0 && (
                          <div className="mt-1.5 space-y-1 pl-2 border-l-2 border-forest-300">
                            {day.activities.map((act: any, aIdx: number) => (
                              <div key={aIdx} className="text-[10px] text-stone-600">
                                <strong className="text-forest-800">{act.timeSlot}:</strong> {act.title}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 font-semibold text-xs"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isGeneratingAi}
                  onClick={handleGenerateAiItinerary}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing Days...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{aiGeneratedData ? 'Regenerate Schedule' : 'Generate with Gemini'}</span>
                    </>
                  )}
                </button>

                {aiGeneratedData && (
                  <button
                    type="button"
                    onClick={handleApplyAiSchedule}
                    className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" />
                    <span>Apply to Itinerary Builder</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Made Trip Packages Picker Modal */}
      {isTemplatePickerOpen && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 text-xs">
            {/* Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-forest-800 text-gold-400 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-forest-900">
                    Pre-Made Trip Packages & Signature Circuits
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Select a curated circuit to populate route stops, day timelines, hotels, vehicle, and terms.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplatePickerOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Region Filter Chips */}
            <div className="px-5 pt-3 pb-2 border-b border-stone-100 flex items-center gap-2 overflow-x-auto bg-stone-50/50">
              {['All', 'South India', 'Himachal', 'Kashmir', 'Rajasthan', 'Custom'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setTemplateFilterCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    templateFilterCategory === cat
                      ? 'bg-forest-800 text-white shadow-2xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {cat === 'South India' ? 'Kerala & South India' : cat}
                </button>
              ))}
            </div>

            {/* List of Templates */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {tripTemplates
                .filter((t) => {
                  if (templateFilterCategory === 'All') return true;
                  if (templateFilterCategory === 'Custom') return t.isCustom;
                  return t.region.toLowerCase().includes(templateFilterCategory.toLowerCase());
                })
                .map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="p-4 rounded-xl border border-stone-200 hover:border-forest-300 transition-all bg-white shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-forest-900">{tmpl.title}</span>
                        <span className="text-[10px] font-bold text-gold-900 bg-gold-100 px-2 py-0.5 rounded-full border border-gold-200">
                          {tmpl.durationNights}N / {tmpl.durationDays}D
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {tmpl.region}
                        </span>
                        {tmpl.isCustom && (
                          <span className="text-[10px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            Custom Built
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplyTemplate(tmpl)}
                        className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap transition-colors self-start sm:self-auto"
                      >
                        <Check className="w-3.5 h-3.5 text-gold-400" />
                        <span>Apply to Studio</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-600 leading-relaxed">{tmpl.overview}</p>

                    {/* Route Flow */}
                    <div>
                      <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                        Route Circuit:
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {tmpl.suggestedRoute.map((stop, sIdx) => (
                          <React.Fragment key={sIdx}>
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-semibold text-[11px]">
                              {stop}
                            </span>
                            {sIdx < tmpl.suggestedRoute.length - 1 && (
                              <ArrowRight className="w-3 h-3 text-stone-400" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                      <span>🚐 Vehicle: <strong className="text-forest-900">{tmpl.vehicleName || 'Private AC Vehicle'}</strong></span>
                      <span>📅 Timeline: <strong className="text-forest-900">{tmpl.days?.length || 0} Days Mapped</strong></span>
                      {tmpl.idealFor && (
                        <span>✨ Ideal for: <strong className="text-forest-900">{tmpl.idealFor}</strong></span>
                      )}
                    </div>
                  </div>
                ))}

              {tripTemplates.length === 0 && (
                <div className="text-center py-12 text-stone-400 italic">
                  No pre-made trip packages found.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <span className="text-[11px] text-stone-500">
                Total <strong>{tripTemplates.length}</strong> signature packages available in library.
              </span>
              <button
                type="button"
                onClick={() => setIsTemplatePickerOpen(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 font-medium text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save as Pre-Made Trip Modal */}
      {isSaveTemplateModalOpen && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-forest-900">
                  Save as Pre-Made Trip Package
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveTemplateModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-stone-600 mb-4 leading-relaxed">
              Save this <strong className="text-forest-900">{nights}N / {duration.days}D</strong> itinerary with all its{' '}
              <strong className="text-forest-900">{days.length} day timelines</strong>, route stops, hotel allotments, and policy clauses into the studio&apos;s reusable Pre-Made Trips catalog.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Trip Package Title *
                </label>
                <input
                  type="text"
                  required
                  value={tripTitle}
                  onChange={(e) => setTripTitle(e.target.value)}
                  placeholder="e.g. Kerala & Tamil Nadu Coastal Splendor"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Region / Sector
                  </label>
                  <select
                    value={newTemplateRegion}
                    onChange={(e) => setNewTemplateRegion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium text-xs bg-white"
                  >
                    <option value="South India">South India / Kerala</option>
                    <option value="Himachal">Himachal Pradesh</option>
                    <option value="Kashmir">Kashmir & Ladakh</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="North East">North East</option>
                    <option value="Goa & Coastal">Goa & Coastal</option>
                    <option value="Golden Triangle">Golden Triangle</option>
                    <option value="Custom">Custom Circuit</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Ideal For
                  </label>
                  <input
                    type="text"
                    value={newTemplateIdealFor}
                    onChange={(e) => setNewTemplateIdealFor(e.target.value)}
                    placeholder="e.g. Families, Honeymooners"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Package Overview / Highlights
                </label>
                <textarea
                  rows={3}
                  value={newTemplateOverview}
                  onChange={(e) => setNewTemplateOverview(e.target.value)}
                  placeholder="e.g. 12-night luxury grand circuit covering Trivandrum, Varkala cliff, Kovalam beach, Kanyakumari cape, and Madurai temples."
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium text-xs leading-relaxed"
                />
              </div>

              {/* Summary pills */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5 text-[11px] text-stone-600">
                <div className="font-bold text-forest-900">Package Blueprint Snapshot:</div>
                <div>• Route: <strong className="text-forest-900">{routeStops.join(' → ') || 'Custom Route'}</strong></div>
                <div>• Schedule: <strong className="text-forest-900">{days.length} Days</strong> with hotels &amp; activities mapped</div>
                <div>• Policies: <strong className="text-forest-900">{inclusions.length} Inclusions</strong>, <strong className="text-forest-900">{exclusions.length} Exclusions</strong></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsSaveTemplateModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCurrentAsTemplate}
                className="px-4 py-2 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-gold-400" />
                <span>Save to Pre-Made Trips</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Custom Trip Rule Preset Modal */}
      {showSavePresetModal && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-forest-700" />
                <h3 className="text-sm font-bold text-forest-900">
                  Save as Custom Trip Rule Template
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSavePresetModal(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-stone-600 mb-4 leading-relaxed">
              Save the current set of <strong className="text-forest-900">{inclusions.length} Inclusions</strong>,{' '}
              <strong className="text-forest-900">{exclusions.length} Exclusions</strong>, and{' '}
              <strong className="text-forest-900">{terms.length} Terms & Policies</strong> as a reusable preset template for future itineraries.
            </p>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Preset Title *
                </label>
                <input
                  type="text"
                  required
                  value={newPresetTitle}
                  onChange={(e) => setNewPresetTitle(e.target.value)}
                  placeholder="e.g. Manali Honeymoon Luxury Rules"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Circuit / Region Category
                </label>
                <input
                  type="text"
                  value={newPresetCategory}
                  onChange={(e) => setNewPresetCategory(e.target.value)}
                  placeholder="e.g. Himachal / Honeymoon"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Description / Application Context
                </label>
                <textarea
                  rows={2}
                  value={newPresetDesc}
                  onChange={(e) => setNewPresetDesc(e.target.value)}
                  placeholder="e.g. Special clauses for high-altitude passes, union taxi policy, and couple candlelight dinner inclusions."
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowSavePresetModal(false)}
                className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCurrentAsPreset}
                className="px-4 py-2 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Preset Template</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ItineraryBuilderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">Loading Studio Workspace...</div>}>
      <ItineraryBuilderContent />
    </Suspense>
  );
}
