'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Share2,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  Tag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Lead, LeadStatus, LeadSource, TripStyle } from '../../types';
import { formatIndianDate, calculateTripDuration, addDaysToDate } from '../../lib/calculations';

export default function LeadsPage() {
  const { leads, addLead, updateLeadStatus, deleteLead } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<Lead | null>(null);

  // New Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    guestName: '',
    phone: '',
    email: '',
    city: '',
    source: 'Website Form' as LeadSource,
    destination: 'Shimla & Manali',
    startDate: '2026-11-01',
    nights: 5,
    endDate: '2026-11-06',
    adults: 2,
    children: 0,
    infants: 0,
    childAges: [] as number[],
    budgetPreference: '₹75,000 - ₹90,000',
    tripStyle: 'Family Holiday' as TripStyle,
    specialRequests: '',
    assignedUserName: 'Rohit Sharma (Senior Planner)',
    nextFollowUpDate: '2026-10-15',
    nextFollowUpNote: 'Discuss custom hotel preferences and flight timings.',
    tagsText: 'High Intent, Family',
  });

  const statuses: LeadStatus[] = [
    'New',
    'Contacted',
    'Quotation Draft',
    'Quotation Sent',
    'Follow-up',
    'Negotiation',
    'Advance Received',
    'Confirmed',
    'In Progress',
    'Completed',
    'Cancelled',
  ];

  // Filtering
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      l.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.email && l.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      selectedStatusFilter === 'All' || l.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    const nights = Number(newLeadForm.nights) || 5;
    const durationDays = nights + 1;
    const calculatedEndDate = newLeadForm.endDate || addDaysToDate(newLeadForm.startDate, nights);

    addLead({
      guestName: newLeadForm.guestName,
      phone: newLeadForm.phone,
      whatsappNumber: newLeadForm.phone,
      email: newLeadForm.email,
      city: newLeadForm.city,
      source: newLeadForm.source,
      status: 'New',
      destination: newLeadForm.destination,
      startDate: newLeadForm.startDate,
      endDate: calculatedEndDate,
      durationNights: nights,
      durationDays: durationDays,
      adults: Number(newLeadForm.adults),
      children: Number(newLeadForm.children),
      infants: Number(newLeadForm.infants),
      budgetPreference: newLeadForm.budgetPreference,
      tripStyle: newLeadForm.tripStyle,
      specialRequests: newLeadForm.specialRequests,
      assignedTo: 'user-rohit',
      assignedUserName: newLeadForm.assignedUserName,
      nextFollowUpDate: newLeadForm.nextFollowUpDate,
      nextFollowUpNote: newLeadForm.nextFollowUpNote,
      tags: newLeadForm.tagsText.split(',').map((t) => t.trim()).filter(Boolean),
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-forest-900 tracking-tight">
              Leads & Guests CRM
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Capture inbound tour inquiries, track follow-up SLAs, and launch tailored itineraries in one click.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Enquiry</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-card flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, or destination..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-forest-900 outline-hidden focus:border-forest-600"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
          <span className="text-[11px] text-stone-400 font-medium mr-1 hidden sm:inline">Status:</span>
          {['All', 'New', 'Quotation Sent', 'Follow-up', 'Advance Received', 'Confirmed'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setSelectedStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedStatusFilter === status
                    ? 'bg-forest-800 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Guest Contact</th>
                <th className="py-3 px-4">Trip Specs</th>
                <th className="py-3 px-4">Dates & Duration</th>
                <th className="py-3 px-4">Stage / Status</th>
                <th className="py-3 px-4">Next Follow-up</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-stone-50/70 transition-colors">
                  {/* Guest Contact */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-forest-900 text-xs">
                      {lead.guestName}
                    </div>
                    <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-stone-600">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        {lead.phone}
                      </span>
                      {lead.city && <span>• {lead.city}</span>}
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5">
                      Source: {lead.source}
                    </div>
                  </td>

                  {/* Trip Specs */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-stone-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-forest-600" />
                      <span>{lead.destination}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {lead.adults} Adults {lead.children > 0 ? `, ${lead.children} Chd` : ''}
                      {lead.tripStyle ? ` • ${lead.tripStyle}` : ''}
                    </div>
                    {lead.budgetPreference && (
                      <div className="text-[10px] text-stone-400">
                        Budget: {lead.budgetPreference}
                      </div>
                    )}
                  </td>

                  {/* Dates */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-medium text-stone-700">
                      {formatIndianDate(lead.startDate)}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {lead.durationNights}N / {lead.durationDays}D
                    </div>
                  </td>

                  {/* Status Progression */}
                  <td className="py-3.5 px-4">
                    <select
                      value={lead.status}
                      onChange={(e) =>
                        updateLeadStatus(lead.id, e.target.value as LeadStatus)
                      }
                      className={`text-[11px] font-semibold px-2 py-1 rounded-lg border outline-hidden transition-colors ${
                        lead.status === 'Confirmed' || lead.status === 'Advance Received'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : lead.status === 'Quotation Sent'
                          ? 'bg-sky-50 text-sky-800 border-sky-200'
                          : lead.status === 'Follow-up'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Next Follow-up */}
                  <td className="py-3.5 px-4 max-w-xs">
                    {lead.nextFollowUpDate ? (
                      <div>
                        <div className="font-medium text-amber-700 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatIndianDate(lead.nextFollowUpDate)}</span>
                        </div>
                        {lead.nextFollowUpNote && (
                          <div className="text-[11px] text-stone-500 truncate" title={lead.nextFollowUpNote}>
                            {lead.nextFollowUpNote}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-stone-400">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* WhatsApp trigger */}
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <Share2 className="w-4 h-4" />
                      </a>

                      {/* Open in Itinerary Studio */}
                      <Link
                        href={`/itineraries/builder?leadId=${lead.id}`}
                        className="px-2.5 py-1.5 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-medium text-[11px] flex items-center gap-1 shadow-2xs"
                        title="Pre-populate in 8-step Itinerary Studio"
                      >
                        <Sparkles className="w-3 h-3 text-gold-400" />
                        <span>Open Studio</span>
                      </Link>

                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete lead"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400 text-xs">
                    No leads found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create New Lead Enquiry */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-forest-900">Capture Inbound Enquiry</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.guestName}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, guestName: e.target.value })
                    }
                    placeholder="e.g. Vikramaditya Sharma"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Mobile Phone (WhatsApp) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.phone}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, phone: e.target.value })
                    }
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newLeadForm.email}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, email: e.target.value })
                    }
                    placeholder="guest@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    City / Origin
                  </label>
                  <input
                    type="text"
                    value={newLeadForm.city}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, city: e.target.value })
                    }
                    placeholder="e.g. Mumbai, New Delhi"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Destination *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.destination}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, destination: e.target.value })
                    }
                    placeholder="e.g. Shimla & Manali"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Enquiry Source
                  </label>
                  <select
                    value={newLeadForm.source}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, source: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600 bg-white"
                  >
                    <option value="Website Form">Website Form</option>
                    <option value="WhatsApp">WhatsApp Direct</option>
                    <option value="Instagram">Instagram Campaign</option>
                    <option value="Google Ad">Google Ads</option>
                    <option value="Referral / Repeat Guest">Referral / Repeat Guest</option>
                    <option value="Direct Call">Direct Phone Call</option>
                  </select>
                </div>
              </div>

              {/* Dates & Duration with Auto-calculated End Date */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">
                      Travel Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={newLeadForm.startDate}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        const newEnd = addDaysToDate(newStart, newLeadForm.nights);
                        setNewLeadForm({ ...newLeadForm, startDate: newStart, endDate: newEnd });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">
                      Number of Nights *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="45"
                      required
                      value={newLeadForm.nights}
                      onChange={(e) => {
                        const n = Math.max(1, Number(e.target.value));
                        const newEnd = addDaysToDate(newLeadForm.startDate, n);
                        setNewLeadForm({ ...newLeadForm, nights: n, endDate: newEnd });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600 bg-white font-bold text-forest-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 block mb-1 flex items-center justify-between">
                      <span>End Date (Calculated)</span>
                      <span className="text-[10px] text-emerald-700 font-bold">Auto</span>
                    </label>
                    <div className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-100/90 text-xs font-semibold text-forest-900 flex items-center justify-between">
                      <span>{formatIndianDate(newLeadForm.endDate)}</span>
                      <span className="text-[10px] text-stone-500 font-normal">({newLeadForm.nights + 1} Days)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] font-semibold text-stone-400 mr-1">Quick Select:</span>
                  {[3, 4, 5, 6, 7, 8, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        const newEnd = addDaysToDate(newLeadForm.startDate, n);
                        setNewLeadForm({ ...newLeadForm, nights: n, endDate: newEnd });
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                        newLeadForm.nights === n
                          ? 'bg-forest-800 text-gold-400 shadow-2xs'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {n}N / {n + 1}D
                    </button>
                  ))}
                </div>
              </div>

              {/* Pax breakdown */}
              <div className="grid grid-cols-3 gap-3.5">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Adults (12+ yrs) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={newLeadForm.adults}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, adults: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Children (5-11 yrs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={newLeadForm.children}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, children: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Infants (&lt;5 yrs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={newLeadForm.infants}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, infants: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600"
                  />
                </div>
              </div>

              {/* Style & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Trip Style
                  </label>
                  <select
                    value={newLeadForm.tripStyle}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, tripStyle: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600 bg-white"
                  >
                    <option value="Family Holiday">Family Holiday</option>
                    <option value="Honeymoon / Couple">Honeymoon / Couple</option>
                    <option value="Luxury & Heritage">Luxury & Heritage</option>
                    <option value="Adventure & Trek">Adventure & Trek</option>
                    <option value="Corporate / Group">Corporate / Group</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Budget Preference
                  </label>
                  <input
                    type="text"
                    value={newLeadForm.budgetPreference}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, budgetPreference: e.target.value })
                    }
                    placeholder="e.g. ₹80,000"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600"
                  />
                </div>
              </div>

              {/* Special Notes & Follow-up */}
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Special Notes & Requests
                </label>
                <textarea
                  rows={2}
                  value={newLeadForm.specialRequests}
                  onChange={(e) =>
                    setNewLeadForm({ ...newLeadForm, specialRequests: e.target.value })
                  }
                  placeholder="e.g. Valley view rooms, candle light dinner request, ground floor for senior citizens"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Next Follow-up Due Date
                  </label>
                  <input
                    type="date"
                    value={newLeadForm.nextFollowUpDate}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, nextFollowUpDate: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600 bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={newLeadForm.tagsText}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, tagsText: e.target.value })
                    }
                    placeholder="High Intent, Honeymoon, VIP"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-semibold shadow-xs"
                >
                  Save Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
