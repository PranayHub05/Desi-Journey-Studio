'use client';

import React, { useState } from 'react';
import {
  Hotel as HotelIcon,
  Plus,
  Search,
  Download,
  Upload,
  Star,
  MapPin,
  Trash2,
  Edit2,
  X,
  Phone,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Hotel, MealPlanCode } from '../../types';
import { formatINR } from '../../lib/calculations';

export default function HotelsPage() {
  const { hotels, addHotel, deleteHotel } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [hotelForm, setHotelForm] = useState({
    name: '',
    destination: 'Shimla',
    starCategory: '4-Star' as Hotel['starCategory'],
    address: '',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
    maskedCategoryName: 'Selected 4-Star Premium Resort, Mall Road Area or Similar',
    contactPerson: '',
    phone: '',
    email: '',
    rates: [
      { roomCategory: 'Deluxe Room', mealPlan: 'CP' as MealPlanCode, doubleOccupancyRate: 4500, extraBedAdultRate: 1500 },
      { roomCategory: 'Deluxe Room', mealPlan: 'MAP' as MealPlanCode, doubleOccupancyRate: 5500, extraBedAdultRate: 1800 },
    ],
  });

  const destinationsList = Array.from(new Set(hotels.map((h) => h.destination)));

  const filteredHotels = hotels.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDest =
      selectedDestination === 'All' || h.destination === selectedDestination;

    return matchesSearch && matchesDest;
  });

  const handleCreateHotel = (e: React.FormEvent) => {
    e.preventDefault();
    addHotel({
      name: hotelForm.name,
      destination: hotelForm.destination,
      starCategory: hotelForm.starCategory,
      address: hotelForm.address,
      imageUrl: hotelForm.imageUrl,
      maskedCategoryName: hotelForm.maskedCategoryName || `Selected ${hotelForm.starCategory} Property, ${hotelForm.destination} or Similar`,
      contactPerson: hotelForm.contactPerson,
      phone: hotelForm.phone,
      email: hotelForm.email,
      rates: hotelForm.rates,
    });
    setIsAddModalOpen(false);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Hotel Name', 'Destination', 'Star Category', 'Address', 'Masked Name', 'Phone', 'Deluxe CP Rate', 'Deluxe MAP Rate'];
    const rows = hotels.map((h) => [
      `"${h.name}"`,
      `"${h.destination}"`,
      `"${h.starCategory}"`,
      `"${h.address}"`,
      `"${h.maskedCategoryName}"`,
      `"${h.phone || ''}"`,
      h.rates.find((r) => r.mealPlan === 'CP')?.doubleOccupancyRate || '',
      h.rates.find((r) => r.mealPlan === 'MAP')?.doubleOccupancyRate || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'DesiJourney_Hotels_Database.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <HotelIcon className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-forest-900 tracking-tight">
              Hotel & Accommodation Database
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Property directory, room tariff schedules (EP, CP, MAP, AP), and pre-advance privacy mask designations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-card flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hotel name, area, or destination..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-forest-900 outline-hidden focus:border-forest-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
          <span className="text-[11px] text-stone-400 font-medium mr-1 hidden md:inline">Destination:</span>
          {['All', ...destinationsList].map((dest) => (
            <button
              key={dest}
              onClick={() => setSelectedDestination(dest)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedDestination === dest
                  ? 'bg-forest-800 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {dest}
            </button>
          ))}
        </div>
      </div>

      {/* Hotel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden hover:border-emerald-300 transition-colors flex flex-col justify-between text-xs"
          >
            <div>
              {/* Photo & Badge */}
              <div className="relative h-44 bg-stone-100">
                <img
                  src={hotel.imageUrl}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-forest-900/80 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1">
                  <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
                  <span>{hotel.starCategory}</span>
                </div>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-forest-900 text-[10px] font-bold">
                  {hotel.destination}
                </div>
              </div>

              {/* Info Body */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-bold text-forest-900 text-sm">{hotel.name}</h3>
                  <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-stone-400 flex-shrink-0" />
                    <span className="truncate">{hotel.address}</span>
                  </div>
                </div>

                {/* Pre-Advance Mask Label */}
                <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/80 text-[11px] text-purple-900">
                  <div className="flex items-center gap-1 font-semibold text-purple-800 mb-0.5">
                    <ShieldAlert className="w-3 h-3 text-purple-600" />
                    <span>Pre-Advance Mask Name:</span>
                  </div>
                  <span className="italic">&ldquo;{hotel.maskedCategoryName}&rdquo;</span>
                </div>

                {/* Rate Plans List */}
                <div className="space-y-1.5 pt-1">
                  <span className="font-semibold text-stone-700 text-[11px] block">
                    Room Rate Cards ({hotel.rates.length})
                  </span>
                  {hotel.rates.map((rate, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-2 rounded-lg bg-stone-50 border border-stone-200 flex justify-between items-center text-[11px]"
                    >
                      <div>
                        <span className="font-semibold text-forest-900">{rate.roomCategory}</span>
                        <span className="text-[10px] text-stone-500 ml-1.5 font-bold px-1.5 py-0.5 rounded bg-white">
                          {rate.mealPlan}
                        </span>
                      </div>
                      <div className="text-right">
                        <strong className="text-forest-900 tabular-nums">
                          {formatINR(rate.doubleOccupancyRate)}
                        </strong>
                        <span className="text-[10px] text-stone-400 block">/room/night</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
              <span className="text-[11px] text-stone-500 truncate">
                Contact: {hotel.phone || 'Standard Desk'}
              </span>
              <button
                onClick={() => deleteHotel(hotel.id)}
                className="text-stone-400 hover:text-rose-600 p-1 rounded"
                title="Delete hotel"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Property */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h2 className="text-base font-bold text-forest-900">Add Hotel Property</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHotel} className="mt-4 space-y-4">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Hotel / Property Name *</label>
                <input
                  type="text"
                  required
                  value={hotelForm.name}
                  onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                  placeholder="e.g. Radisson Blu Resort"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Destination *</label>
                  <input
                    type="text"
                    required
                    value={hotelForm.destination}
                    onChange={(e) => setHotelForm({ ...hotelForm, destination: e.target.value })}
                    placeholder="e.g. Shimla"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Star Category</label>
                  <select
                    value={hotelForm.starCategory}
                    onChange={(e) => setHotelForm({ ...hotelForm, starCategory: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                  >
                    <option value="3-Star">3-Star</option>
                    <option value="4-Star">4-Star</option>
                    <option value="5-Star">5-Star</option>
                    <option value="Boutique / Heritage">Boutique / Heritage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={hotelForm.address}
                  onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
                  placeholder="e.g. The Mall Road, Lower Bazaar"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Pre-Advance Masked Category Designation *
                </label>
                <input
                  type="text"
                  required
                  value={hotelForm.maskedCategoryName}
                  onChange={(e) => setHotelForm({ ...hotelForm, maskedCategoryName: e.target.value })}
                  placeholder="e.g. Selected 4-Star Premium Resort, Mall Road Area or Similar"
                  className="w-full px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50/40 text-purple-900 outline-hidden focus:border-purple-600 font-medium"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  This description is shown on proposals prior to booking advance token receipt.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={hotelForm.phone}
                    onChange={(e) => setHotelForm({ ...hotelForm, phone: e.target.value })}
                    placeholder="+91 98160 00000"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Photo URL</label>
                  <input
                    type="text"
                    value={hotelForm.imageUrl}
                    onChange={(e) => setHotelForm({ ...hotelForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
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
                  Save Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
