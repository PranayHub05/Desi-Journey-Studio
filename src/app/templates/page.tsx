'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Plus,
  Search,
  MapPin,
  Calendar,
  Car,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Eye,
  Edit,
  X,
  Sparkles,
  FileText,
  Copy,
  Sliders,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TripTemplate, ItineraryDay, DayActivity } from '../../types';

export default function TripTemplatesPage() {
  const router = useRouter();
  const { tripTemplates, addTripTemplate, updateTripTemplate, deleteTripTemplate, vehicles, hotels } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [previewTemplate, setPreviewTemplate] = useState<TripTemplate | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Form State for Create / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formRegion, setFormRegion] = useState('South India');
  const [formNights, setFormNights] = useState(5);
  const [formIdealFor, setFormIdealFor] = useState('Couples, Families & Leisure');
  const [formOverview, setFormOverview] = useState('');
  const [formRouteStops, setFormRouteStops] = useState<string[]>(['Kochi', 'Munnar', 'Alleppey']);
  const [newStopInput, setNewStopInput] = useState('');
  const [formVehicleId, setFormVehicleId] = useState(vehicles[0]?.id || '');
  const [formDays, setFormDays] = useState<ItineraryDay[]>([]);
  const [formInclusions, setFormInclusions] = useState<string[]>([
    'Accommodation on twin/triple sharing basis',
    'Daily buffet breakfast and dinner (MAP plan)',
    'Exclusive private air-conditioned vehicle as per itinerary',
    'Chauffeur allowances, toll taxes, and parking fees',
  ]);
  const [formExclusions, setFormExclusions] = useState<string[]>([
    'Airfare / Train tickets to and from destination',
    'Monument entry fees, camera passes, and activity charges',
    'Any personal expenses like laundry, tips, room heater',
    'Mandatory Gala dinner supplements during peak festive dates',
  ]);
  const [formTerms, setFormTerms] = useState<string[]>([
    '30% token advance required to confirm bookings.',
    'Balance 70% payment due 15 days prior to travel date.',
    'Standard hotel check-in time is 14:00 hrs and check-out is 11:00 hrs.',
  ]);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const resetForm = () => {
    setEditingTemplateId(null);
    setFormTitle('');
    setFormRegion('South India');
    setFormNights(5);
    setFormIdealFor('Couples, Families & Leisure');
    setFormOverview('');
    setFormRouteStops(['Kochi', 'Munnar', 'Alleppey']);
    setNewStopInput('');
    setFormVehicleId(vehicles[0]?.id || '');
    setFormDays([]);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    // Pre-populate days for default 5 nights
    const generatedDays: ItineraryDay[] = [];
    const stops = ['Kochi', 'Munnar', 'Alleppey'];
    for (let i = 1; i <= 6; i++) {
      const isFirst = i === 1;
      const isLast = i === 6;
      const stop = stops[Math.min(i - 1, stops.length - 1)];
      generatedDays.push({
        id: `day-draft-${i}-${Date.now()}`,
        dayNumber: i,
        date: new Date().toISOString().split('T')[0],
        dayType: isFirst ? 'Arrival & Transfer' : isLast ? 'Departure' : 'Local Sightseeing',
        title: isFirst ? `Arrival at ${stop}` : isLast ? `Departure from ${stop}` : `${stop} Scenic Excursion`,
        routeTitle: `${stop} Circuit`,
        hotelDestination: stop,
        mealPlan: 'MAP',
        breakfastIncluded: !isFirst,
        lunchIncluded: false,
        dinnerIncluded: !isLast,
        isTravelEstimate: true,
        activities: [
          {
            id: `act-${i}-1`,
            timeSlot: '10:00 AM',
            title: `Guided Exploration in ${stop}`,
            description: `Visit top viewpoints and attractions in ${stop}.`,
            type: 'Sightseeing',
            isEstimate: false,
          },
        ],
      });
    }
    setFormDays(generatedDays);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (tmpl: TripTemplate) => {
    setEditingTemplateId(tmpl.id);
    setFormTitle(tmpl.title);
    setFormRegion(tmpl.region);
    setFormNights(tmpl.durationNights);
    setFormIdealFor(tmpl.idealFor || '');
    setFormOverview(tmpl.overview);
    setFormRouteStops([...tmpl.suggestedRoute]);
    setFormVehicleId(tmpl.vehicleId || vehicles[0]?.id || '');
    setFormDays(tmpl.days ? [...tmpl.days] : []);
    setFormInclusions(tmpl.inclusions ? [...tmpl.inclusions] : []);
    setFormExclusions(tmpl.exclusions ? [...tmpl.exclusions] : []);
    setFormTerms(tmpl.termsAndConditions ? [...tmpl.termsAndConditions] : []);
    setIsCreateModalOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!formTitle.trim()) {
      alert('Please enter a trip package title.');
      return;
    }
    const selectedVeh = vehicles.find((v) => v.id === formVehicleId);

    const fallbackDay: ItineraryDay = {
      id: `day-1-${Date.now()}`,
      dayNumber: 1,
      date: new Date().toISOString().split('T')[0],
      dayType: 'Arrival & Transfer',
      title: 'Arrival & Welcome',
      routeTitle: 'Airport to Hotel Transfer',
      hotelDestination: formRouteStops[0] || 'Destination',
      mealPlan: 'MAP',
      breakfastIncluded: false,
      lunchIncluded: false,
      dinnerIncluded: true,
      isTravelEstimate: true,
      activities: [],
    };

    const templateData: Omit<TripTemplate, 'id'> = {
      title: formTitle.trim(),
      region: formRegion,
      durationNights: formNights,
      durationDays: formNights + 1,
      suggestedRoute: formRouteStops.length > 0 ? formRouteStops : ['Custom Destination'],
      overview: formOverview.trim() || `${formNights}N / ${formNights + 1}D curated package covering ${formRouteStops.join(' - ')}.`,
      idealFor: formIdealFor.trim(),
      vehicleId: formVehicleId,
      vehicleName: selectedVeh?.displayName || 'Private AC Vehicle',
      days: formDays.length > 0 ? formDays : [fallbackDay],
      inclusions: formInclusions,
      exclusions: formExclusions,
      termsAndConditions: formTerms,
      isCustom: true,
    };

    if (editingTemplateId) {
      updateTripTemplate(editingTemplateId, templateData);
      setFeedbackMsg(`✓ Updated "${formTitle}" successfully!`);
    } else {
      addTripTemplate(templateData);
      setFeedbackMsg(`✓ Created "${formTitle}" package in library!`);
    }

    setIsCreateModalOpen(false);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleDeleteTemplate = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the pre-made trip package "${title}"?`)) {
      deleteTripTemplate(id);
      setFeedbackMsg(`Removed "${title}".`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const filteredTemplates = tripTemplates.filter((t) => {
    const matchesRegion =
      selectedRegion === 'All'
        ? true
        : selectedRegion === 'Custom'
        ? t.isCustom
        : t.region.toLowerCase().includes(selectedRegion.toLowerCase());

    const matchesSearch =
      searchQuery.trim() === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.suggestedRoute.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesRegion && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-forest-100 text-forest-800">
              Master Catalog
            </span>
            <h1 className="text-xl font-bold text-forest-900 tracking-tight">
              Pre-Made Trips & Signature Circuits
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Build, edit, and maintain ready-to-quote holiday packages. Planners can load any package into Itinerary Studio with 1 click.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {feedbackMsg && (
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
              {feedbackMsg}
            </span>
          )}
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>Create Pre-Made Trip</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by package name, destination, route stops (e.g. Varkala, Kovalam, Manali)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs font-medium outline-hidden focus:border-forest-600 bg-stone-50/50"
            />
          </div>

          <div className="text-xs text-stone-500 font-medium">
            Showing <strong className="text-forest-900">{filteredTemplates.length}</strong> of{' '}
            <strong className="text-forest-900">{tripTemplates.length}</strong> Packages
          </div>
        </div>

        {/* Region Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          {['All', 'South India', 'Himachal', 'Kashmir', 'Rajasthan', 'Custom'].map((reg) => (
            <button
              key={reg}
              type="button"
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedRegion === reg
                  ? 'bg-forest-800 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {reg === 'South India' ? 'Kerala & South India' : reg}
            </button>
          ))}
        </div>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="bg-white rounded-2xl border border-stone-200 hover:border-forest-300 transition-all shadow-card hover:shadow-card-hover flex flex-col justify-between overflow-hidden group"
          >
            {/* Card Header & Badges */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-gold-900 bg-gold-100 px-2.5 py-0.5 rounded-full border border-gold-300">
                  {tmpl.durationNights}N / {tmpl.durationDays}D
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {tmpl.region}
                  </span>
                  {tmpl.isCustom && (
                    <span className="text-[10px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      Custom
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-forest-900 group-hover:text-forest-700 transition-colors line-clamp-1">
                  {tmpl.title}
                </h3>
                <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                  {tmpl.overview}
                </p>
              </div>

              {/* Route Circuit Pills */}
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Route Circuit:
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {tmpl.suggestedRoute.map((stop, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200 font-semibold text-[10px] text-forest-900 shadow-2xs">
                        {stop}
                      </span>
                      {sIdx < tmpl.suggestedRoute.length - 1 && (
                        <ArrowRight className="w-2.5 h-2.5 text-stone-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Meta information */}
              <div className="space-y-1 text-[11px] text-stone-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-stone-400" />
                  <span>Fleet: <strong className="text-forest-900">{tmpl.vehicleName || 'Private AC Chauffeur'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Daily Itinerary: <strong className="text-forest-900">{tmpl.days?.length || 0} Days Mapped</strong></span>
                </div>
                {tmpl.idealFor && (
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                    <span className="line-clamp-1">Ideal for: <strong className="text-forest-900">{tmpl.idealFor}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-4 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(tmpl)}
                  className="p-1.5 text-stone-500 hover:text-forest-800 hover:bg-stone-100 rounded-lg text-xs font-medium flex items-center gap-1"
                  title="View Itinerary Preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Preview</span>
                </button>

                {tmpl.isCustom && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(tmpl)}
                      className="p-1.5 text-stone-500 hover:text-forest-800 hover:bg-stone-100 rounded-lg text-xs font-medium flex items-center gap-1"
                      title="Edit package details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(tmpl.id, tmpl.title)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                      title="Delete package"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => router.push(`/itineraries/builder?templateId=${tmpl.id}`)}
                className="px-3.5 py-1.5 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-semibold text-xs flex items-center gap-1 shadow-2xs transition-colors"
              >
                <span>Customize in Studio</span>
                <ChevronRight className="w-3.5 h-3.5 text-gold-400" />
              </button>
            </div>
          </div>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
            <Package className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-bold text-forest-900 text-sm">No packages found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Try adjusting your search keywords or sector filters, or click &quot;Create Pre-Made Trip&quot; to build a new package.
            </p>
          </div>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 text-xs">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gold-900 bg-gold-100 px-2 py-0.5 rounded-full">
                    {previewTemplate.durationNights}N / {previewTemplate.durationDays}D
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {previewTemplate.region}
                  </span>
                </div>
                <h3 className="text-base font-bold text-forest-900 mt-1">{previewTemplate.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              <p className="text-xs text-stone-600 leading-relaxed">{previewTemplate.overview}</p>

              {/* Day Schedules */}
              <div className="space-y-3">
                <div className="font-bold text-forest-900 text-xs">Day-by-Day Travel Schedule:</div>
                {previewTemplate.days?.map((d) => (
                  <div
                    key={d.dayNumber}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-forest-900 text-xs flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-forest-800 text-gold-400 text-[10px] flex items-center justify-center font-bold">
                          D{d.dayNumber}
                        </span>
                        <span>{d.title}</span>
                      </div>
                      <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                        {d.dayType}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-500">
                      Route: <em>{d.routeTitle}</em> {d.hotelDestination ? `• Stay: ${d.hotelDestination}` : ''}
                    </div>

                    {d.activities && d.activities.length > 0 && (
                      <div className="mt-2 space-y-1 pl-3 border-l-2 border-forest-300">
                        {d.activities.map((act) => (
                          <div key={act.id} className="text-[11px] text-stone-600">
                            <strong className="text-forest-800">{act.timeSlot}:</strong> {act.title}
                            {act.description && <span className="text-stone-500"> — {act.description}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
                  <div className="font-bold text-emerald-900 text-xs">Included Services:</div>
                  <ul className="space-y-1 text-[11px] text-emerald-950">
                    {(previewTemplate.inclusions || []).map((inc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 space-y-1.5">
                  <div className="font-bold text-rose-900 text-xs">Excluded Services:</div>
                  <ul className="space-y-1 text-[11px] text-rose-950">
                    {(previewTemplate.exclusions || []).map((exc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <X className="w-3 h-3 text-rose-600 shrink-0 mt-0.5" />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 font-medium text-xs"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => router.push(`/itineraries/builder?templateId=${previewTemplate.id}`)}
                className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Package className="w-4 h-4 text-gold-400" />
                <span>Customize in Studio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PRE-MADE TRIP MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 text-xs">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-forest-700" />
                <h3 className="text-sm font-bold text-forest-900">
                  {editingTemplateId ? 'Edit Pre-Made Trip Package' : 'Create New Pre-Made Trip Package'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Package Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Royal Rajasthan Grand Circuit"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium text-xs outline-hidden focus:border-forest-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Sector / Region</label>
                  <select
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium text-xs bg-white"
                  >
                    <option value="South India">South India / Kerala</option>
                    <option value="Himachal">Himachal Pradesh</option>
                    <option value="Kashmir">Kashmir & Ladakh</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="North East">North East</option>
                    <option value="Goa & Coastal">Goa & Coastal</option>
                    <option value="Golden Triangle">Golden Triangle</option>
                    <option value="Custom">Custom Region</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Duration (Nights)</label>
                  <input
                    type="number"
                    min="1"
                    max="45"
                    value={formNights}
                    onChange={(e) => setFormNights(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium text-xs outline-hidden focus:border-forest-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Dedicated Fleet</label>
                  <select
                    value={formVehicleId}
                    onChange={(e) => setFormVehicleId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium text-xs bg-white"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Ideal For / Target Audience</label>
                <input
                  type="text"
                  value={formIdealFor}
                  onChange={(e) => setFormIdealFor(e.target.value)}
                  placeholder="e.g. Couples, Families, Heritage Lovers"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium text-xs outline-hidden focus:border-forest-600"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Package Narrative Overview</label>
                <textarea
                  rows={2}
                  value={formOverview}
                  onChange={(e) => setFormOverview(e.target.value)}
                  placeholder="Summarize the core appeal, highlights, and route experience..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 font-medium text-xs leading-relaxed outline-hidden focus:border-forest-600"
                />
              </div>

              {/* Route Stops Ribbon */}
              <div>
                <label className="font-semibold text-stone-700 block mb-1.5">Route Stops Sequence</label>
                <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-stone-50 border border-stone-200">
                  {formRouteStops.map((stop, sIdx) => (
                    <div
                      key={sIdx}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-stone-200 text-xs font-semibold text-forest-900 shadow-2xs"
                    >
                      <span>{stop}</span>
                      <button
                        type="button"
                        onClick={() => setFormRouteStops(formRouteStops.filter((_, i) => i !== sIdx))}
                        className="text-stone-400 hover:text-rose-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={newStopInput}
                    onChange={(e) => setNewStopInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newStopInput.trim()) {
                        e.preventDefault();
                        setFormRouteStops([...formRouteStops, newStopInput.trim()]);
                        setNewStopInput('');
                      }
                    }}
                    placeholder="Add en-route stop..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 text-xs outline-hidden focus:border-forest-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newStopInput.trim()) {
                        setFormRouteStops([...formRouteStops, newStopInput.trim()]);
                        setNewStopInput('');
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-semibold text-xs"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 font-medium text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveTemplate}
                className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5 text-gold-400" />
                <span>{editingTemplateId ? 'Save Changes' : 'Create Package'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
