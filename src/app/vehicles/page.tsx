'use client';

import React, { useState } from 'react';
import {
  Car,
  Plus,
  Search,
  Download,
  Users,
  Luggage,
  ShieldAlert,
  Trash2,
  X,
  Phone,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Vehicle, VehiclePricingModel } from '../../types';
import { formatINR } from '../../lib/calculations';

export default function VehiclesPage() {
  const { vehicles, addVehicle, deleteVehicle } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [vehForm, setVehForm] = useState({
    displayName: '',
    category: 'Premium SUV' as Vehicle['category'],
    seatingCapacity: 6,
    luggageCapacityNotes: 'Fits 4 large bags + 2 cabin bags',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    pricingModel: 'per_day' as VehiclePricingModel,
    baseRate: 4200,
    minKmPerDay: 250,
    perKmRate: 19,
    driverAllowancePerDay: 450,
    tollsStateTaxEstimate: 2000,
    defaultDriverName: 'Gurdeep Singh',
    defaultDriverPhone: '+91 98150 11998',
    defaultRegistrationNumber: 'HP-01-AA-4821',
    notes: 'Well maintained, hill-experienced chauffeur with verified credentials.',
  });

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    addVehicle({
      displayName: vehForm.displayName,
      category: vehForm.category,
      seatingCapacity: Number(vehForm.seatingCapacity),
      luggageCapacityNotes: vehForm.luggageCapacityNotes,
      imageUrl: vehForm.imageUrl,
      pricingModel: vehForm.pricingModel,
      baseRate: Number(vehForm.baseRate),
      minKmPerDay: Number(vehForm.minKmPerDay),
      perKmRate: Number(vehForm.perKmRate),
      driverAllowancePerDay: Number(vehForm.driverAllowancePerDay),
      tollsStateTaxEstimate: Number(vehForm.tollsStateTaxEstimate),
      defaultDriverName: vehForm.defaultDriverName,
      defaultDriverPhone: vehForm.defaultDriverPhone,
      defaultRegistrationNumber: vehForm.defaultRegistrationNumber,
      notes: vehForm.notes,
    });
    setIsAddModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['Vehicle Name', 'Category', 'Seating', 'Pricing Model', 'Base Rate', 'Driver Allowance', 'State Taxes'];
    const rows = vehicles.map((v) => [
      `"${v.displayName}"`,
      `"${v.category}"`,
      v.seatingCapacity,
      v.pricingModel,
      v.baseRate,
      v.driverAllowancePerDay,
      v.tollsStateTaxEstimate,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'DesiJourney_Fleet_Database.csv');
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
            <Car className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-forest-900 tracking-tight">
              Vehicles & Fleet Management
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Transport rate cards (per-day, per-km, packages), driver allowances, and confidential vehicle registration details.
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
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Fleet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((veh) => (
          <div
            key={veh.id}
            className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden hover:border-emerald-300 transition-colors flex flex-col justify-between text-xs"
          >
            <div>
              <div className="h-44 bg-stone-100 relative">
                <img
                  src={veh.imageUrl}
                  alt={veh.displayName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-forest-900/80 text-white text-[10px] font-semibold">
                  {veh.category}
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-forest-900 text-sm">{veh.displayName}</h3>
                    <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-forest-600" />
                        {veh.seatingCapacity} Seats
                      </span>
                      <span className="flex items-center gap-1">
                        <Luggage className="w-3 h-3 text-forest-600" />
                        Luggage Deck
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-stone-600 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  {veh.luggageCapacityNotes}
                </p>

                {/* Tariff Cards */}
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between p-2 rounded-lg bg-forest-50/60 border border-forest-100">
                    <span className="text-stone-600">Base Tariff ({veh.pricingModel.replace('_', ' ')}):</span>
                    <strong className="text-forest-900 font-bold tabular-nums">
                      {formatINR(veh.baseRate)}/day
                    </strong>
                  </div>
                  <div className="flex justify-between px-2 text-stone-500">
                    <span>Driver Night Allowance:</span>
                    <span className="tabular-nums font-medium">{formatINR(veh.driverAllowancePerDay)}/day</span>
                  </div>
                  <div className="flex justify-between px-2 text-stone-500">
                    <span>State Border / Tolls Budget:</span>
                    <span className="tabular-nums font-medium">{formatINR(veh.tollsStateTaxEstimate)}</span>
                  </div>
                </div>

                {/* Confidential Driver Specs */}
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] space-y-1 text-amber-900">
                  <div className="flex items-center gap-1 font-semibold text-amber-800">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Confidential Chauffeur Assignment:</span>
                  </div>
                  <div>Driver: <strong>{veh.defaultDriverName}</strong> ({veh.defaultDriverPhone})</div>
                  <div>Plate: <span className="font-mono">{veh.defaultRegistrationNumber}</span></div>
                  <div className="text-[10px] text-amber-700 italic">
                    (Disclosed on vouchers strictly post-advance confirmation)
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
              <span className="text-[11px] text-stone-500">{veh.supplierName || 'Internal Fleet'}</span>
              <button
                onClick={() => deleteVehicle(veh.id)}
                className="text-stone-400 hover:text-rose-600 p-1 rounded"
                title="Delete vehicle"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Vehicle */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h2 className="text-base font-bold text-forest-900">Add Vehicle to Fleet</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="mt-4 space-y-4">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Vehicle Display Name *</label>
                <input
                  type="text"
                  required
                  value={vehForm.displayName}
                  onChange={(e) => setVehForm({ ...vehForm, displayName: e.target.value })}
                  placeholder="e.g. Toyota Innova Crysta (AC 6+1)"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Category</label>
                  <select
                    value={vehForm.category}
                    onChange={(e) => setVehForm({ ...vehForm, category: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                  >
                    <option value="Premium SUV">Premium SUV</option>
                    <option value="MUV">MUV</option>
                    <option value="Tempo Traveller">Tempo Traveller</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Mini Bus">Mini Bus</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={vehForm.seatingCapacity}
                    onChange={(e) => setVehForm({ ...vehForm, seatingCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Daily Base Rate (₹)</label>
                  <input
                    type="number"
                    value={vehForm.baseRate}
                    onChange={(e) => setVehForm({ ...vehForm, baseRate: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Driver Daily (₹)</label>
                  <input
                    type="number"
                    value={vehForm.driverAllowancePerDay}
                    onChange={(e) => setVehForm({ ...vehForm, driverAllowancePerDay: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Tolls / State Taxes (₹)</label>
                  <input
                    type="number"
                    value={vehForm.tollsStateTaxEstimate}
                    onChange={(e) => setVehForm({ ...vehForm, tollsStateTaxEstimate: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Luggage Notes</label>
                <input
                  type="text"
                  value={vehForm.luggageCapacityNotes}
                  onChange={(e) => setVehForm({ ...vehForm, luggageCapacityNotes: e.target.value })}
                  placeholder="e.g. 4 large bags + 3 hand bags with rear carrier"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-amber-50 p-3 rounded-xl border border-amber-200">
                <div>
                  <label className="font-semibold text-amber-900 block mb-1">Default Driver Name</label>
                  <input
                    type="text"
                    value={vehForm.defaultDriverName}
                    onChange={(e) => setVehForm({ ...vehForm, defaultDriverName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-amber-900 block mb-1">Registration Plate</label>
                  <input
                    type="text"
                    value={vehForm.defaultRegistrationNumber}
                    onChange={(e) => setVehForm({ ...vehForm, defaultRegistrationNumber: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white font-mono"
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
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
