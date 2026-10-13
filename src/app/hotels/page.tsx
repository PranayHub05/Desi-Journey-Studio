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
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Hotel, HotelRoomRate, MealPlanCode } from '../../types';
import { formatINR } from '../../lib/calculations';

export default function HotelsPage() {
  const { hotels, addHotel, updateHotel, deleteHotel, importHotelsCSV } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedHotelToEdit, setSelectedHotelToEdit] = useState<Hotel | null>(null);

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreviewRows, setCsvPreviewRows] = useState<Hotel[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formState, setFormState] = useState<{
    id?: string;
    name: string;
    destination: string;
    starCategory: string;
    address: string;
    imageUrl: string;
    maskedCategoryName: string;
    contactPerson: string;
    phone: string;
    email: string;
    rates: HotelRoomRate[];
  }>({
    name: '',
    destination: 'Shimla',
    starCategory: '4-Star',
    address: '',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
    maskedCategoryName: 'Selected 4-Star Premium Resort, Mall Road Area or Similar',
    contactPerson: '',
    phone: '',
    email: '',
    rates: [
      {
        roomCategory: 'Deluxe Room',
        mealPlan: 'CP',
        doubleOccupancyRate: 4500,
        extraBedAdultRate: 1500,
        childWithBedRate: 1100,
        childNoBedRate: 600,
      },
      {
        roomCategory: 'Deluxe Room',
        mealPlan: 'MAP',
        doubleOccupancyRate: 5500,
        extraBedAdultRate: 1800,
        childWithBedRate: 1400,
        childNoBedRate: 800,
      },
    ],
  });

  const destinationsList = Array.from(new Set(hotels.map((h) => h.destination)));

  const filteredHotels = hotels.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.starCategory.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDest =
      selectedDestination === 'All' || h.destination === selectedDestination;

    return matchesSearch && matchesDest;
  });

  // Open Edit Modal
  const handleOpenEdit = (hotel: Hotel) => {
    setSelectedHotelToEdit(hotel);
    setFormState({
      id: hotel.id,
      name: hotel.name,
      destination: hotel.destination,
      starCategory: hotel.starCategory,
      address: hotel.address,
      imageUrl: hotel.imageUrl,
      maskedCategoryName: hotel.maskedCategoryName,
      contactPerson: hotel.contactPerson || '',
      phone: hotel.phone || '',
      email: hotel.email || '',
      rates: hotel.rates && hotel.rates.length > 0 ? [...hotel.rates] : [
        {
          roomCategory: 'Standard Room',
          mealPlan: 'CP',
          doubleOccupancyRate: 3500,
          extraBedAdultRate: 1200,
          childWithBedRate: 900,
          childNoBedRate: 500,
        },
      ],
    });
    setIsEditModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormState({
      name: '',
      destination: 'Shimla',
      starCategory: '4-Star',
      address: '',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
      maskedCategoryName: 'Selected 4-Star Premium Resort, Mall Road Area or Similar',
      contactPerson: '',
      phone: '',
      email: '',
      rates: [
        {
          roomCategory: 'Deluxe Room',
          mealPlan: 'CP',
          doubleOccupancyRate: 4500,
          extraBedAdultRate: 1500,
          childWithBedRate: 1100,
          childNoBedRate: 600,
        },
        {
          roomCategory: 'Deluxe Room',
          mealPlan: 'MAP',
          doubleOccupancyRate: 5500,
          extraBedAdultRate: 1800,
          childWithBedRate: 1400,
          childNoBedRate: 800,
        },
      ],
    });
    setIsAddModalOpen(true);
  };

  // Save Add
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addHotel({
      name: formState.name,
      destination: formState.destination,
      starCategory: formState.starCategory,
      address: formState.address,
      imageUrl: formState.imageUrl,
      maskedCategoryName:
        formState.maskedCategoryName ||
        `Selected ${formState.starCategory} Property, ${formState.destination} or Similar`,
      contactPerson: formState.contactPerson,
      phone: formState.phone,
      email: formState.email,
      rates: formState.rates,
    });
    setIsAddModalOpen(false);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotelToEdit) return;
    updateHotel(selectedHotelToEdit.id, {
      name: formState.name,
      destination: formState.destination,
      starCategory: formState.starCategory,
      address: formState.address,
      imageUrl: formState.imageUrl,
      maskedCategoryName: formState.maskedCategoryName,
      contactPerson: formState.contactPerson,
      phone: formState.phone,
      email: formState.email,
      rates: formState.rates,
    });
    setIsEditModalOpen(false);
  };

  // Rate sheet row helpers for modal
  const handleAddRateRow = () => {
    setFormState({
      ...formState,
      rates: [
        ...formState.rates,
        {
          roomCategory: 'Deluxe Room',
          mealPlan: 'MAP',
          doubleOccupancyRate: 5000,
          extraBedAdultRate: 1500,
          childWithBedRate: 1200,
          childNoBedRate: 700,
        },
      ],
    });
  };

  const handleUpdateRateRow = (index: number, updates: Partial<HotelRoomRate>) => {
    const updatedRates = formState.rates.map((r, i) =>
      i === index ? { ...r, ...updates } : r
    );
    setFormState({ ...formState, rates: updatedRates });
  };

  const handleRemoveRateRow = (index: number) => {
    setFormState({
      ...formState,
      rates: formState.rates.filter((_, i) => i !== index),
    });
  };

  // CSV Export with Child With Bed (CWB) and Child Without Bed (CNB)
  const handleExportCSV = () => {
    const headers = [
      'Hotel Name',
      'Destination',
      'Star Category',
      'Address',
      'Masked Category Name',
      'Phone',
      'Room Category',
      'Meal Plan (EP/CP/MAP/AP)',
      'Double Occupancy Rate',
      'Extra Bed Adult Rate',
      'Child With Bed (CWB) Rate',
      'Child No Bed (CNB) Rate',
    ];

    const rows: (string | number)[][] = [];

    hotels.forEach((h) => {
      if (h.rates.length === 0) {
        rows.push([
          `"${h.name}"`,
          `"${h.destination}"`,
          `"${h.starCategory}"`,
          `"${h.address}"`,
          `"${h.maskedCategoryName}"`,
          `"${h.phone || ''}"`,
          '"Deluxe Room"',
          'MAP',
          4500,
          1500,
          1100,
          600,
        ]);
      } else {
        h.rates.forEach((r) => {
          rows.push([
            `"${h.name}"`,
            `"${h.destination}"`,
            `"${h.starCategory}"`,
            `"${h.address}"`,
            `"${h.maskedCategoryName}"`,
            `"${h.phone || ''}"`,
            `"${r.roomCategory}"`,
            r.mealPlan,
            r.doubleOccupancyRate,
            r.extraBedAdultRate,
            r.childWithBedRate || 0,
            r.childNoBedRate || 0,
          ]);
        });
      }
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'DesiJourney_Hotels_RateSheets.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Template Download
  const handleDownloadTemplate = () => {
    const headers = [
      'Hotel Name',
      'Destination',
      'Star Category',
      'Address',
      'Masked Category Name',
      'Phone',
      'Room Category',
      'Meal Plan (EP/CP/MAP/AP)',
      'Double Occupancy Rate',
      'Extra Bed Adult Rate',
      'Child With Bed (CWB) Rate',
      'Child No Bed (CNB) Rate',
    ];
    const sampleRows = [
      [
        '"Wildflower Mountain Resort"',
        '"Shimla"',
        '"5-Star"',
        '"Chharabra, The Ridge Area"',
        '"Selected 5-Star Luxury Resort, Shimla or Similar"',
        '"+91 98160 11223"',
        '"Luxury Valley View"',
        '"MAP"',
        '8500',
        '2500',
        '1800',
        '900',
      ],
      [
        '"Snow Crest Heights"',
        '"Manali"',
        '"4-Star"',
        '"Log Huts Area, Old Manali"',
        '"Selected 4-Star Valley View Resort, Manali or Similar"',
        '"+91 98055 44332"',
        '"Super Deluxe"',
        '"CP"',
        '4800',
        '1600',
        '1200',
        '650',
      ],
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...sampleRows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'Sample_Hotels_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle File Upload and Parse CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setCsvError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);

        if (lines.length < 2) {
          setCsvError('CSV file is empty or missing headers.');
          return;
        }

        const hotelsMap = new Map<string, Hotel>();

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          // CSV regex parser handling quotes
          const cols = line
            .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
            .map((c) => c.trim().replace(/^"|"$/g, ''));

          if (cols.length < 5) continue;

          const name = cols[0] || 'Imported Hotel';
          const destination = cols[1] || 'Himachal';
          const starCategory = cols[2] || '4-Star';
          const address = cols[3] || 'Central Area';
          const maskedName = cols[4] || `Selected ${starCategory} Property, ${destination} or Similar`;
          const phone = cols[5] || '';
          const roomCategory = cols[6] || 'Standard Deluxe';
          const mealPlanRaw = (cols[7] || 'MAP').toUpperCase().replace('CPM', 'CP');
          const mealPlan = ['EP', 'CP', 'MAP', 'AP'].includes(mealPlanRaw)
            ? (mealPlanRaw as MealPlanCode)
            : 'MAP';
          const doubleRate = Number(cols[8]) || 4000;
          const extraBedRate = Number(cols[9]) || 1400;
          const cwbRate = Number(cols[10]) || 1000;
          const cnbRate = Number(cols[11]) || 500;

          const rateCard: HotelRoomRate = {
            roomCategory,
            mealPlan,
            doubleOccupancyRate: doubleRate,
            extraBedAdultRate: extraBedRate,
            childWithBedRate: cwbRate,
            childNoBedRate: cnbRate,
          };

          const key = `${name.toLowerCase()}-${destination.toLowerCase()}`;
          if (hotelsMap.has(key)) {
            hotelsMap.get(key)!.rates.push(rateCard);
          } else {
            hotelsMap.set(key, {
              id: `hotel-csv-${Date.now()}-${i}`,
              name,
              destination,
              starCategory,
              address,
              imageUrl:
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
              maskedCategoryName: maskedName,
              phone,
              rates: [rateCard],
              updatedAt: new Date().toISOString(),
            });
          }
        }

        const parsedHotels = Array.from(hotelsMap.values());
        if (parsedHotels.length === 0) {
          setCsvError('Could not parse any valid hotel records from the file.');
        } else {
          setCsvPreviewRows(parsedHotels);
        }
      } catch (err) {
        setCsvError('Failed to parse CSV file. Please ensure standard comma separation.');
      }
    };
    reader.readAsText(file);
  };

  // Commit CSV Import
  const handleCommitImport = () => {
    if (csvPreviewRows.length === 0) return;
    importHotelsCSV(csvPreviewRows);
    setImportSuccessMsg(`Successfully imported ${csvPreviewRows.length} hotel properties!`);
    setIsImportModalOpen(false);
    setCsvFile(null);
    setCsvPreviewRows([]);
    setTimeout(() => setImportSuccessMsg(null), 4000);
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
            Editable room categories (Standard, Deluxe, Suites), meal plans (EP, CP/CPM, MAP, AP), Child with Bed (CWB), Child without Bed (CNB), and CSV import/export.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {importSuccessMsg && (
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{importSuccessMsg}</span>
            </span>
          )}

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-forest-700" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
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
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-forest-900 text-sm">{hotel.name}</h3>
                    <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-stone-400 flex-shrink-0" />
                      <span className="truncate">{hotel.address}</span>
                    </div>
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

                {/* Rate Plans List with CWB / CNB details */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-stone-700 text-[11px]">
                      Room Rate Cards ({hotel.rates.length})
                    </span>
                    <button
                      onClick={() => handleOpenEdit(hotel)}
                      className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Rates</span>
                    </button>
                  </div>

                  {hotel.rates.map((rate, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1 text-[11px]"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-forest-900">{rate.roomCategory}</span>
                          <span className="text-[10px] text-forest-800 font-bold px-1.5 py-0.5 rounded bg-forest-100 ml-1.5">
                            {rate.mealPlan}
                          </span>
                        </div>
                        <div className="text-right">
                          <strong className="text-forest-900 tabular-nums">
                            {formatINR(rate.doubleOccupancyRate)}
                          </strong>
                          <span className="text-[10px] text-stone-400 ml-1">/room</span>
                        </div>
                      </div>

                      {/* Extra Bed & Child Rates */}
                      <div className="grid grid-cols-3 gap-1 pt-1 border-t border-stone-200/60 text-[10px] text-stone-500">
                        <div>
                          <span>Extra Bed (Adult): </span>
                          <strong className="text-stone-800">{formatINR(rate.extraBedAdultRate)}</strong>
                        </div>
                        <div>
                          <span>CWB (Child Bed): </span>
                          <strong className="text-emerald-700">{formatINR(rate.childWithBedRate || 0)}</strong>
                        </div>
                        <div>
                          <span>CNB (No Bed): </span>
                          <strong className="text-stone-800">{formatINR(rate.childNoBedRate || 0)}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
              <span className="text-[11px] text-stone-500 truncate">
                {hotel.phone ? `Phone: ${hotel.phone}` : 'Standard Desk'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(hotel)}
                  className="px-2.5 py-1 rounded bg-stone-200 hover:bg-forest-800 hover:text-white text-stone-700 text-[11px] font-semibold transition-colors"
                >
                  Edit Property & Rates
                </button>
                <button
                  onClick={() => deleteHotel(hotel.id)}
                  className="text-stone-400 hover:text-rose-600 p-1 rounded"
                  title="Delete hotel"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD / EDIT HOTEL WITH MULTI-RATE TABLE */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto text-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <HotelIcon className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-forest-900">
                  {isEditModalOpen ? `Edit ${formState.name} & Rate Cards` : 'Add New Hotel Property & Rates'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isEditModalOpen ? handleSaveEdit : handleSaveAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Hotel / Property Name *</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="e.g. Radisson Blu Resort"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600 font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Destination *</label>
                  <input
                    type="text"
                    required
                    value={formState.destination}
                    onChange={(e) => setFormState({ ...formState, destination: e.target.value })}
                    placeholder="e.g. Shimla, Manali, Srinagar"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Property Category / Star Rating (Editable) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.starCategory}
                    onChange={(e) => setFormState({ ...formState, starCategory: e.target.value })}
                    placeholder="e.g. 4-Star, 5-Star Luxury, Heritage Boutique, Deluxe Resort"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 outline-hidden focus:border-forest-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    placeholder="+91 98160 00000"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={formState.address}
                  onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                  placeholder="e.g. Near Mall Road, The Ridge, Shimla"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Pre-Advance Masked Category Designation (Hidden until advance received) *
                </label>
                <input
                  type="text"
                  required
                  value={formState.maskedCategoryName}
                  onChange={(e) => setFormState({ ...formState, maskedCategoryName: e.target.value })}
                  placeholder="e.g. Selected 4-Star Premium Resort, Mall Road Area or Similar"
                  className="w-full px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50/40 text-purple-900 outline-hidden focus:border-purple-600 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Image URL</label>
                <input
                  type="text"
                  value={formState.imageUrl}
                  onChange={(e) => setFormState({ ...formState, imageUrl: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200"
                />
              </div>

              {/* MULTI-RATE SHEET TABLE EDITOR */}
              <div className="pt-2 border-t border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-forest-900 text-xs">
                      Room Types & Tariff Schedules ({formState.rates.length})
                    </h3>
                    <p className="text-[10px] text-stone-500">
                      Customize room types (Standard, Deluxe, Suites), meal plans (EP, CP/CPM, MAP, AP), CWB, and CNB tariffs.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRateRow}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-[11px] flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Rate Card</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formState.rates.map((rate, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3 relative group"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                        <span className="font-bold text-forest-800 text-[11px]">
                          Rate Card #{rIdx + 1}
                        </span>
                        {formState.rates.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRateRow(rIdx)}
                            className="text-stone-400 hover:text-rose-600 text-[11px] font-semibold flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-medium text-stone-700 block mb-0.5 text-[11px]">
                            Room Type / Category (Customizable)
                          </label>
                          <input
                            type="text"
                            value={rate.roomCategory}
                            onChange={(e) =>
                              handleUpdateRateRow(rIdx, { roomCategory: e.target.value })
                            }
                            placeholder="e.g. Standard, Deluxe, Super Deluxe, Cottage, Suite"
                            className="w-full px-2.5 py-1.5 rounded border border-stone-200 bg-white font-medium"
                          />
                        </div>

                        <div>
                          <label className="font-medium text-stone-700 block mb-0.5 text-[11px]">
                            Meal Plan (EP, CP/CPM, MAP, AP)
                          </label>
                          <select
                            value={rate.mealPlan}
                            onChange={(e) =>
                              handleUpdateRateRow(rIdx, {
                                mealPlan: e.target.value as MealPlanCode,
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded border border-stone-200 bg-white font-semibold text-forest-900"
                          >
                            <option value="EP">EP — Room Only (No Meals)</option>
                            <option value="CP">CP / CPM — Room + Breakfast</option>
                            <option value="MAP">MAP — Room + Breakfast + Dinner</option>
                            <option value="AP">AP — All Meals (B + L + D)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                        <div>
                          <label className="font-medium text-stone-700 block mb-0.5 text-[10px]">
                            Double Occupancy (₹) *
                          </label>
                          <input
                            type="number"
                            required
                            value={rate.doubleOccupancyRate}
                            onChange={(e) =>
                              handleUpdateRateRow(rIdx, {
                                doubleOccupancyRate: Number(e.target.value),
                              })
                            }
                            className="w-full px-2 py-1 rounded border border-stone-200 bg-white font-bold text-forest-900 tabular-nums"
                          />
                        </div>

                        <div>
                          <label className="font-medium text-stone-700 block mb-0.5 text-[10px]">
                            Extra Bed Adult (₹)
                          </label>
                          <input
                            type="number"
                            value={rate.extraBedAdultRate}
                            onChange={(e) =>
                              handleUpdateRateRow(rIdx, {
                                extraBedAdultRate: Number(e.target.value),
                              })
                            }
                            className="w-full px-2 py-1 rounded border border-stone-200 bg-white tabular-nums"
                          />
                        </div>

                        <div>
                          <label className="font-medium text-emerald-800 block mb-0.5 text-[10px] font-bold">
                            Child with Bed (CWB ₹)
                          </label>
                          <input
                            type="number"
                            value={rate.childWithBedRate || 0}
                            onChange={(e) =>
                              handleUpdateRateRow(rIdx, {
                                childWithBedRate: Number(e.target.value),
                              })
                            }
                            className="w-full px-2 py-1 rounded border border-emerald-300 bg-emerald-50/40 text-emerald-900 font-semibold tabular-nums"
                          />
                        </div>

                        <div>
                          <label className="font-medium text-stone-700 block mb-0.5 text-[10px]">
                            Child No Bed (CNB ₹)
                          </label>
                          <input
                            type="number"
                            value={rate.childNoBedRate || 0}
                            onChange={(e) =>
                              handleUpdateRateRow(rIdx, {
                                childNoBedRate: Number(e.target.value),
                              })
                            }
                            className="w-full px-2 py-1 rounded border border-stone-200 bg-white tabular-nums"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isEditModalOpen ? 'Save Changes & Rates' : 'Save Hotel Property'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CSV IMPORT WITH PREVIEW */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto text-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-forest-900">
                  Import Hotels & Rate Cards from CSV
                </h2>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="font-semibold text-stone-800">
                  Select CSV File from your computer:
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV Template</span>
                </button>
              </div>

              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="w-full p-2 border border-stone-300 rounded-xl bg-white text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-forest-800 file:text-white hover:file:bg-forest-700 cursor-pointer"
              />

              <p className="text-[11px] text-stone-500 leading-relaxed">
                Supported columns: Hotel Name, Destination, Star Category, Address, Masked Category Name, Phone, Room Category, Meal Plan (EP/CP/MAP/AP), Double Occupancy Rate, Extra Bed Adult Rate, Child With Bed (CWB), Child No Bed (CNB).
              </p>
            </div>

            {csvError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{csvError}</span>
              </div>
            )}

            {/* Preview of Parsed Rows */}
            {csvPreviewRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-forest-900 text-xs">
                    Preview of Parsed Properties ({csvPreviewRows.length})
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Validation Passed
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto border border-stone-200 rounded-xl">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] sticky top-0">
                      <tr>
                        <th className="p-2">Property Name</th>
                        <th className="p-2">Destination</th>
                        <th className="p-2">Room Type</th>
                        <th className="p-2">Plan</th>
                        <th className="p-2 text-right">Double Rate</th>
                        <th className="p-2 text-right">CWB</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {csvPreviewRows.map((h, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50">
                          <td className="p-2 font-semibold text-forest-900">{h.name}</td>
                          <td className="p-2 text-stone-600">{h.destination}</td>
                          <td className="p-2 text-stone-700">{h.rates[0]?.roomCategory || 'Deluxe'}</td>
                          <td className="p-2 font-semibold text-forest-800">{h.rates[0]?.mealPlan || 'MAP'}</td>
                          <td className="p-2 text-right font-mono font-bold text-forest-900">
                            {formatINR(h.rates[0]?.doubleOccupancyRate || 0)}
                          </td>
                          <td className="p-2 text-right font-mono text-emerald-700">
                            {formatINR(h.rates[0]?.childWithBedRate || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={csvPreviewRows.length === 0}
                onClick={handleCommitImport}
                className="px-5 py-2 rounded-lg bg-forest-800 hover:bg-forest-700 text-white font-bold disabled:opacity-50 shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Commit & Import {csvPreviewRows.length} Properties</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
