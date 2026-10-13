'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Sparkles,
  Plus,
  Search,
  Clock,
  Compass,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Edit2,
  Trash2,
  X,
  Save,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Destination, Attraction } from '../../types';

export default function DestinationsPage() {
  const {
    destinations,
    addDestination,
    updateDestination,
    deleteDestination,
    addAttraction,
    updateAttraction,
    deleteAttraction,
    tripTemplates,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');

  // Modals state
  const [isAddDestModalOpen, setIsAddDestModalOpen] = useState(false);
  const [isEditDestModalOpen, setIsEditDestModalOpen] = useState(false);
  const [selectedDestToEdit, setSelectedDestToEdit] = useState<Destination | null>(null);

  const [isAddAttrModalOpen, setIsAddAttrModalOpen] = useState(false);
  const [isEditAttrModalOpen, setIsEditAttrModalOpen] = useState(false);
  const [targetDestForAttr, setTargetDestForAttr] = useState<Destination | null>(null);
  const [selectedAttrToEdit, setSelectedAttrToEdit] = useState<Attraction | null>(null);

  // Destination Form State
  const [destForm, setDestForm] = useState({
    name: '',
    stateOrRegion: 'Himachal Pradesh',
    overview: '',
    imageUrl: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1000&q=80',
    suggestedNights: 2,
    bestKnownForText: 'Hill Stations, Snow View, Heritage',
  });

  // Attraction Form State
  const [attrForm, setAttrForm] = useState({
    name: '',
    destination: '',
    category: 'Nature & Viewpoint' as Attraction['category'],
    description: '',
    suggestedDurationHours: 2,
    openingHoursNotes: '09:00 AM - 05:00 PM',
    entryFeePerAdult: 0,
    isVerified: true,
  });

  const regions = Array.from(new Set(destinations.map((d) => d.stateOrRegion)));

  const filteredDestinations = destinations.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.stateOrRegion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.attractions.some((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRegion =
      selectedRegion === 'All' || d.stateOrRegion === selectedRegion;

    return matchesSearch && matchesRegion;
  });

  // Handle Destination Save
  const handleOpenAddDest = () => {
    setDestForm({
      name: '',
      stateOrRegion: 'Himachal Pradesh',
      overview: '',
      imageUrl: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1000&q=80',
      suggestedNights: 2,
      bestKnownForText: 'Mountains, Nature, Heritage',
    });
    setIsAddDestModalOpen(true);
  };

  const handleOpenEditDest = (dest: Destination) => {
    setSelectedDestToEdit(dest);
    setDestForm({
      name: dest.name,
      stateOrRegion: dest.stateOrRegion,
      overview: dest.overview,
      imageUrl: dest.imageUrl,
      suggestedNights: dest.suggestedNights,
      bestKnownForText: dest.bestKnownFor.join(', '),
    });
    setIsEditDestModalOpen(true);
  };

  const handleSaveAddDest = (e: React.FormEvent) => {
    e.preventDefault();
    addDestination({
      id: `dest-${Date.now()}`,
      name: destForm.name,
      stateOrRegion: destForm.stateOrRegion,
      overview: destForm.overview,
      imageUrl: destForm.imageUrl,
      suggestedNights: Number(destForm.suggestedNights),
      bestKnownFor: destForm.bestKnownForText.split(',').map((s) => s.trim()).filter(Boolean),
      attractions: [],
    });
    setIsAddDestModalOpen(false);
  };

  const handleSaveEditDest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDestToEdit) return;
    updateDestination(selectedDestToEdit.id, {
      name: destForm.name,
      stateOrRegion: destForm.stateOrRegion,
      overview: destForm.overview,
      imageUrl: destForm.imageUrl,
      suggestedNights: Number(destForm.suggestedNights),
      bestKnownFor: destForm.bestKnownForText.split(',').map((s) => s.trim()).filter(Boolean),
    });
    setIsEditDestModalOpen(false);
  };

  // Handle Attraction Save
  const handleOpenAddAttr = (dest: Destination) => {
    setTargetDestForAttr(dest);
    setAttrForm({
      name: '',
      destination: dest.name,
      category: 'Nature & Viewpoint',
      description: '',
      suggestedDurationHours: 2,
      openingHoursNotes: '09:00 AM - 05:00 PM',
      entryFeePerAdult: 0,
      isVerified: true,
    });
    setIsAddAttrModalOpen(true);
  };

  const handleOpenEditAttr = (dest: Destination, attr: Attraction) => {
    setTargetDestForAttr(dest);
    setSelectedAttrToEdit(attr);
    setAttrForm({
      name: attr.name,
      destination: dest.name,
      category: attr.category,
      description: attr.description,
      suggestedDurationHours: attr.suggestedDurationHours,
      openingHoursNotes: attr.openingHoursNotes || '',
      entryFeePerAdult: attr.entryFeePerAdult || 0,
      isVerified: attr.isVerified,
    });
    setIsEditAttrModalOpen(true);
  };

  const handleSaveAddAttr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDestForAttr) return;
    addAttraction(targetDestForAttr.id, {
      id: `att-${Date.now()}`,
      name: attrForm.name,
      destination: targetDestForAttr.name,
      category: attrForm.category,
      description: attrForm.description,
      suggestedDurationHours: Number(attrForm.suggestedDurationHours),
      openingHoursNotes: attrForm.openingHoursNotes,
      entryFeePerAdult: Number(attrForm.entryFeePerAdult),
      isVerified: attrForm.isVerified,
    });
    setIsAddAttrModalOpen(false);
  };

  const handleSaveEditAttr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDestForAttr || !selectedAttrToEdit) return;
    updateAttraction(targetDestForAttr.id, selectedAttrToEdit.id, {
      name: attrForm.name,
      category: attrForm.category,
      description: attrForm.description,
      suggestedDurationHours: Number(attrForm.suggestedDurationHours),
      openingHoursNotes: attrForm.openingHoursNotes,
      entryFeePerAdult: Number(attrForm.entryFeePerAdult),
      isVerified: attrForm.isVerified,
    });
    setIsEditAttrModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-forest-900 tracking-tight">
              Destinations & Sightseeing Knowledge Base
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Curated regional repositories, verified attractions, duration estimates, and full visual editor for sightseeing spots.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleOpenAddDest}
            className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Destination</span>
          </button>
        </div>
      </div>

      {/* Suggested Regional Circuits Carousel */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-forest-900 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-emerald-600" />
          <span>Curated Regional Holiday Templates</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tripTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card hover:border-emerald-300 transition-colors flex flex-col justify-between text-xs space-y-3"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-forest-50 text-forest-800">
                  {tmpl.region} • {tmpl.durationNights}N/{tmpl.durationDays}D
                </span>
                <h3 className="font-bold text-forest-900 text-sm mt-1.5">{tmpl.title}</h3>
                <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                  {tmpl.overview}
                </p>

                <div className="mt-3 p-2.5 rounded-lg bg-stone-50 text-[11px] font-medium text-stone-700 flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-forest-900">Route:</span>
                  <span>{tmpl.suggestedRoute.join(' → ')}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 flex justify-between items-center">
                <span className="text-[10px] text-stone-400 italic">Ideal: {tmpl.idealFor}</span>
                <Link
                  href={`/itineraries/builder?tmpl=${tmpl.id}`}
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <span>Build →</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Region Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between bg-white p-4 rounded-xl border border-stone-200 shadow-card text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destination or attraction name..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-forest-900 outline-hidden focus:border-forest-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <span className="text-[11px] text-stone-400 font-medium mr-1 hidden md:inline">Region:</span>
          {['All', ...regions].map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedRegion === reg
                  ? 'bg-forest-800 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* Destination Cards List */}
      <div className="space-y-6">
        {filteredDestinations.map((dest) => (
          <div
            key={dest.id}
            className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden text-xs"
          >
            <div className="flex flex-col md:flex-row">
              {/* Photo & Overview Side */}
              <div className="md:w-72 h-56 md:h-auto bg-stone-100 relative flex-shrink-0">
                <img
                  src={dest.imageUrl}
                  alt={dest.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
                    {dest.stateOrRegion}
                  </span>
                  <h3 className="text-xl font-bold">{dest.name}</h3>
                  <span className="text-[11px] text-stone-300">
                    Suggested Stay: {dest.suggestedNights} Nights
                  </span>
                </div>
              </div>

              {/* Sights Grid & Action Controls */}
              <div className="p-6 flex-1 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-forest-900 text-xs mb-1">Regional Overview</h4>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      {dest.overview}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleOpenEditDest(dest)}
                      className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs flex items-center gap-1"
                      title="Edit Destination Info"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleOpenAddAttr(dest)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-[11px] flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Attraction</span>
                    </button>
                    <button
                      onClick={() => deleteDestination(dest.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                      title="Delete Destination"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Attractions List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-forest-900 text-xs uppercase tracking-wider">
                      Sightseeing Points ({dest.attractions.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {dest.attractions.map((att) => (
                      <div
                        key={att.id}
                        className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2 hover:border-emerald-300 transition-colors relative group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-forest-900 text-xs">
                            {att.name}
                          </span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Verified</span>
                            </span>
                            <button
                              onClick={() => handleOpenEditAttr(dest, att)}
                              className="text-stone-400 hover:text-forest-800 p-0.5"
                              title="Edit attraction"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteAttraction(dest.id, att.id)}
                              className="text-stone-400 hover:text-rose-600 p-0.5"
                              title="Delete attraction"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-stone-600 leading-relaxed">
                          {att.description}
                        </p>

                        <div className="text-[10px] text-stone-500 pt-1.5 border-t border-stone-200/60 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            <span>Duration: ~{att.suggestedDurationHours} hrs</span>
                          </span>
                          {att.openingHoursNotes && (
                            <span className="text-stone-400 truncate max-w-[150px]">
                              {att.openingHoursNotes}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {dest.attractions.length === 0 && (
                      <div className="col-span-2 p-6 rounded-xl border border-dashed border-stone-300 text-center text-stone-400 text-xs">
                        No attractions added yet. Click &ldquo;Add Attraction&rdquo; above to record sightseeing spots.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD / EDIT DESTINATION */}
      {(isAddDestModalOpen || isEditDestModalOpen) && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-sm font-bold text-forest-900">
                {isEditDestModalOpen ? `Edit ${destForm.name}` : 'Add New Destination'}
              </h3>
              <button
                onClick={() => {
                  setIsAddDestModalOpen(false);
                  setIsEditDestModalOpen(false);
                }}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isEditDestModalOpen ? handleSaveEditDest : handleSaveAddDest} className="space-y-3.5">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Destination Name *</label>
                <input
                  type="text"
                  required
                  value={destForm.name}
                  onChange={(e) => setDestForm({ ...destForm, name: e.target.value })}
                  placeholder="e.g. Kasol, Dalhousie, Munnar"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">State / Region *</label>
                  <input
                    type="text"
                    required
                    value={destForm.stateOrRegion}
                    onChange={(e) => setDestForm({ ...destForm, stateOrRegion: e.target.value })}
                    placeholder="e.g. Himachal Pradesh"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Suggested Stay Nights</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={destForm.suggestedNights}
                    onChange={(e) => setDestForm({ ...destForm, suggestedNights: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Overview & Highlights</label>
                <textarea
                  rows={3}
                  value={destForm.overview}
                  onChange={(e) => setDestForm({ ...destForm, overview: e.target.value })}
                  placeholder="Describe location, terrain, and traveler appeal..."
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 leading-relaxed"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Image URL</label>
                <input
                  type="text"
                  value={destForm.imageUrl}
                  onChange={(e) => setDestForm({ ...destForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Best Known For (Tags, comma separated)</label>
                <input
                  type="text"
                  value={destForm.bestKnownForText}
                  onChange={(e) => setDestForm({ ...destForm, bestKnownForText: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddDestModalOpen(false);
                    setIsEditDestModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-semibold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Destination</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT ATTRACTION */}
      {(isAddAttrModalOpen || isEditAttrModalOpen) && targetDestForAttr && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-sm font-bold text-forest-900">
                {isEditAttrModalOpen ? `Edit ${attrForm.name}` : `Add Attraction to ${targetDestForAttr.name}`}
              </h3>
              <button
                onClick={() => {
                  setIsAddAttrModalOpen(false);
                  setIsEditAttrModalOpen(false);
                }}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isEditAttrModalOpen ? handleSaveEditAttr : handleSaveAddAttr} className="space-y-3.5">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Attraction Name *</label>
                <input
                  type="text"
                  required
                  value={attrForm.name}
                  onChange={(e) => setAttrForm({ ...attrForm, name: e.target.value })}
                  placeholder="e.g. Solang Valley Excursion, Jogini Falls Hike"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Category</label>
                  <select
                    value={attrForm.category}
                    onChange={(e) => setAttrForm({ ...attrForm, category: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                  >
                    <option value="Nature & Viewpoint">Nature & Viewpoint</option>
                    <option value="Heritage & Temple">Heritage & Temple</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Cultural / Market">Cultural / Market</option>
                    <option value="Monastery / Fort">Monastery / Fort</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Suggested Duration (Hrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    value={attrForm.suggestedDurationHours}
                    onChange={(e) => setAttrForm({ ...attrForm, suggestedDurationHours: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Description & Experience</label>
                <textarea
                  rows={3}
                  required
                  value={attrForm.description}
                  onChange={(e) => setAttrForm({ ...attrForm, description: e.target.value })}
                  placeholder="Describe sightseeing features, viewpoints, activity options..."
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Opening Hours / Timing Notes</label>
                  <input
                    type="text"
                    value={attrForm.openingHoursNotes}
                    onChange={(e) => setAttrForm({ ...attrForm, openingHoursNotes: e.target.value })}
                    placeholder="e.g. 09:00 AM - 05:30 PM"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Entry Fee (₹ per adult)</label>
                  <input
                    type="number"
                    value={attrForm.entryFeePerAdult}
                    onChange={(e) => setAttrForm({ ...attrForm, entryFeePerAdult: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="verifiedAttr"
                  checked={attrForm.isVerified}
                  onChange={(e) => setAttrForm({ ...attrForm, isVerified: e.target.checked })}
                  className="rounded text-forest-800"
                />
                <label htmlFor="verifiedAttr" className="font-medium text-stone-700 cursor-pointer">
                  Mark as Verified Regional Point (Safe for automated itinerary formulas)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddAttrModalOpen(false);
                    setIsEditAttrModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-semibold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Attraction</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
