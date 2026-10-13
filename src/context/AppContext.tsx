'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CompanySettings,
  CustomerPayment,
  Destination,
  Hotel,
  Lead,
  LeadStatus,
  Quotation,
  ShareEvent,
  Supplier,
  SupplierPaymentEntry,
  TripTemplate,
  UserProfile,
  UserRole,
  Vehicle,
} from '../types';
import {
  initialCompanySettings,
  sampleCustomerPayments,
  sampleDestinations,
  sampleHotels,
  sampleLeads,
  sampleQuotations,
  sampleSupplierPayments,
  sampleSuppliers,
  sampleTripTemplates,
  sampleVehicles,
} from '../lib/mockData';

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUserRole: (role: UserRole) => void;
  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
  
  // Leads
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  updateLeadStatus: (id: string, status: LeadStatus, note?: string) => void;

  // Hotels
  hotels: Hotel[];
  addHotel: (hotel: Omit<Hotel, 'id' | 'updatedAt'>) => Hotel;
  updateHotel: (id: string, updates: Partial<Hotel>) => void;
  deleteHotel: (id: string) => void;

  // Vehicles
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Vehicle;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  // Destinations & Templates
  destinations: Destination[];
  addDestination: (dest: Destination) => void;
  tripTemplates: TripTemplate[];

  // Quotations
  quotations: Quotation[];
  getQuotationById: (id: string) => Quotation | undefined;
  createQuotation: (quote: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt' | 'quoteNumber' | 'version'>) => Quotation;
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;
  saveQuotationAsNewVersion: (id: string) => Quotation;
  deleteQuotation: (id: string) => void;

  // Sharing Events
  shareEvents: ShareEvent[];
  recordShareEvent: (event: Omit<ShareEvent, 'id' | 'timestamp'>) => void;

  // Suppliers & Ledger
  suppliers: Supplier[];
  supplierPayments: SupplierPaymentEntry[];
  recordSupplierPayment: (entry: Omit<SupplierPaymentEntry, 'id'>) => void;

  // Customer Payments
  customerPayments: CustomerPayment[];
  recordCustomerPayment: (payment: Omit<CustomerPayment, 'id'>) => void;

  // Global actions
  resetDemoData: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'dj_company_settings_v1',
  LEADS: 'dj_leads_v1',
  HOTELS: 'dj_hotels_v1',
  VEHICLES: 'dj_vehicles_v1',
  DESTINATIONS: 'dj_destinations_v1',
  QUOTATIONS: 'dj_quotations_v1',
  SHARE_EVENTS: 'dj_share_events_v1',
  SUPPLIERS: 'dj_suppliers_v1',
  SUPPLIER_PAYMENTS: 'dj_supplier_payments_v1',
  CUSTOMER_PAYMENTS: 'dj_customer_payments_v1',
  USER_ROLE: 'dj_user_role_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'user-rohit',
    name: 'Rohit Sharma',
    email: 'rohit@desijourney.in',
    role: 'admin', // Full administrative access by default for complete feature exploration
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>(initialCompanySettings);
  const [leads, setLeads] = useState<Lead[]>(sampleLeads);
  const [hotels, setHotels] = useState<Hotel[]>(sampleHotels);
  const [vehicles, setVehicles] = useState<Vehicle[]>(sampleVehicles);
  const [destinations, setDestinations] = useState<Destination[]>(sampleDestinations);
  const [tripTemplates] = useState<TripTemplate[]>(sampleTripTemplates);
  const [quotations, setQuotations] = useState<Quotation[]>(sampleQuotations);
  const [shareEvents, setShareEvents] = useState<ShareEvent[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(sampleSuppliers);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPaymentEntry[]>(sampleSupplierPayments);
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>(sampleCustomerPayments);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) setCompanySettings(JSON.parse(savedSettings));

      const savedLeads = localStorage.getItem(STORAGE_KEYS.LEADS);
      if (savedLeads) setLeads(JSON.parse(savedLeads));

      const savedHotels = localStorage.getItem(STORAGE_KEYS.HOTELS);
      if (savedHotels) setHotels(JSON.parse(savedHotels));

      const savedVehicles = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      if (savedVehicles) setVehicles(JSON.parse(savedVehicles));

      const savedDestinations = localStorage.getItem(STORAGE_KEYS.DESTINATIONS);
      if (savedDestinations) setDestinations(JSON.parse(savedDestinations));

      const savedQuotations = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
      if (savedQuotations) setQuotations(JSON.parse(savedQuotations));

      const savedShares = localStorage.getItem(STORAGE_KEYS.SHARE_EVENTS);
      if (savedShares) setShareEvents(JSON.parse(savedShares));

      const savedSuppliers = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));

      const savedSpayments = localStorage.getItem(STORAGE_KEYS.SUPPLIER_PAYMENTS);
      if (savedSpayments) setSupplierPayments(JSON.parse(savedSpayments));

      const savedCpayments = localStorage.getItem(STORAGE_KEYS.CUSTOMER_PAYMENTS);
      if (savedCpayments) setCustomerPayments(JSON.parse(savedCpayments));

      const savedRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE) as UserRole | null;
      if (savedRole) {
        setCurrentUser((u) => ({ ...u, role: savedRole }));
      }
    } catch (e) {
      console.warn('Failed to hydrate from localStorage, fallback to initial state', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to LocalStorage whenever state updates
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(companySettings));
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
      localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(hotels));
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
      localStorage.setItem(STORAGE_KEYS.DESTINATIONS, JSON.stringify(destinations));
      localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations));
      localStorage.setItem(STORAGE_KEYS.SHARE_EVENTS, JSON.stringify(shareEvents));
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
      localStorage.setItem(STORAGE_KEYS.SUPPLIER_PAYMENTS, JSON.stringify(supplierPayments));
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_PAYMENTS, JSON.stringify(customerPayments));
    } catch (e) {
      console.error('Failed to sync to localStorage', e);
    }
  }, [
    isHydrated,
    companySettings,
    leads,
    hotels,
    vehicles,
    destinations,
    quotations,
    shareEvents,
    suppliers,
    supplierPayments,
    customerPayments,
  ]);

  const setCurrentUserRole = (role: UserRole) => {
    setCurrentUser((prev) => ({ ...prev, role }));
    try {
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
    } catch {}
  };

  const updateCompanySettings = (settings: Partial<CompanySettings>) => {
    setCompanySettings((prev) => ({ ...prev, ...settings }));
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);
    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l))
    );
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLeadStatus = (id: string, status: LeadStatus, note?: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        return {
          ...l,
          status,
          nextFollowUpNote: note || l.nextFollowUpNote,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const addHotel = (hotelData: Omit<Hotel, 'id' | 'updatedAt'>) => {
    const newHotel: Hotel = {
      ...hotelData,
      id: `hotel-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setHotels((prev) => [newHotel, ...prev]);
    return newHotel;
  };

  const updateHotel = (id: string, updates: Partial<Hotel>) => {
    setHotels((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h))
    );
  };

  const deleteHotel = (id: string) => {
    setHotels((prev) => prev.filter((h) => h.id !== id));
  };

  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`,
    };
    setVehicles((prev) => [newVehicle, ...prev]);
    return newVehicle;
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const deleteVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const addDestination = (dest: Destination) => {
    setDestinations((prev) => [dest, ...prev]);
  };

  const getQuotationById = (id: string) => {
    return quotations.find((q) => q.id === id);
  };

  const createQuotation = (
    quoteData: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt' | 'quoteNumber' | 'version'>
  ) => {
    const quoteNum = `DJ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newQuote: Quotation = {
      ...quoteData,
      id: `quote-${Date.now()}`,
      quoteNumber: quoteNum,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setQuotations((prev) => [newQuote, ...prev]);
    return newQuote;
  };

  const updateQuotation = (id: string, updates: Partial<Quotation>) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q))
    );
  };

  const saveQuotationAsNewVersion = (id: string) => {
    const target = quotations.find((q) => q.id === id);
    if (!target) throw new Error('Quotation not found');

    const newVersion: Quotation = {
      ...target,
      id: `quote-${Date.now()}`,
      version: target.version + 1,
      updatedAt: new Date().toISOString(),
    };

    setQuotations((prev) => [newVersion, ...prev]);
    return newVersion;
  };

  const deleteQuotation = (id: string) => {
    setQuotations((prev) => prev.filter((q) => q.id !== id));
  };

  const recordShareEvent = (eventData: Omit<ShareEvent, 'id' | 'timestamp'>) => {
    const newEvent: ShareEvent = {
      ...eventData,
      id: `share-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setShareEvents((prev) => [newEvent, ...prev]);
  };

  const recordSupplierPayment = (entryData: Omit<SupplierPaymentEntry, 'id'>) => {
    const newEntry: SupplierPaymentEntry = {
      ...entryData,
      id: `spay-${Date.now()}`,
    };
    setSupplierPayments((prev) => [newEntry, ...prev]);

    // Update supplier balance
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id !== entryData.supplierId) return s;
        const totalPaid = s.totalPaid + entryData.amount;
        const balanceOutstanding = Math.max(0, s.totalAgreedPayable - totalPaid);
        return { ...s, totalPaid, balanceOutstanding };
      })
    );
  };

  const recordCustomerPayment = (paymentData: Omit<CustomerPayment, 'id'>) => {
    const newPayment: CustomerPayment = {
      ...paymentData,
      id: `cpay-${Date.now()}`,
    };
    setCustomerPayments((prev) => [newPayment, ...prev]);

    // Update quotation advance received and status
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id !== paymentData.quoteId) return q;
        const newAdvance = q.advanceReceived + paymentData.amount;
        return {
          ...q,
          advanceReceived: newAdvance,
          status: newAdvance >= q.costing.advanceAmountRequired ? 'Confirmed' : q.status,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const resetDemoData = () => {
    localStorage.clear();
    setCompanySettings(initialCompanySettings);
    setLeads(sampleLeads);
    setHotels(sampleHotels);
    setVehicles(sampleVehicles);
    setDestinations(sampleDestinations);
    setQuotations(sampleQuotations);
    setShareEvents([]);
    setSuppliers(sampleSuppliers);
    setSupplierPayments(sampleSupplierPayments);
    setCustomerPayments(sampleCustomerPayments);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUserRole,
        companySettings,
        updateCompanySettings,
        leads,
        addLead,
        updateLead,
        deleteLead,
        updateLeadStatus,
        hotels,
        addHotel,
        updateHotel,
        deleteHotel,
        vehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        destinations,
        addDestination,
        tripTemplates,
        quotations,
        getQuotationById,
        createQuotation,
        updateQuotation,
        saveQuotationAsNewVersion,
        deleteQuotation,
        shareEvents,
        recordShareEvent,
        suppliers,
        supplierPayments,
        recordSupplierPayment,
        customerPayments,
        recordCustomerPayment,
        resetDemoData,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
