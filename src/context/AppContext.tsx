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
  Attraction,
  AuthUser,
  TripClausePreset,
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
  systemAuthUsers,
  defaultClausePresets,
} from '../lib/mockData';
import {
  COLLECTIONS,
  getCompanySettingsFromFirestore,
  saveCompanySettingsToFirestore,
  getLeadsFromFirestore,
  saveLeadToFirestore,
  deleteLeadFromFirestore,
  subscribeToLeads,
  getHotelsFromFirestore,
  saveHotelToFirestore,
  deleteHotelFromFirestore,
  getVehiclesFromFirestore,
  saveVehicleToFirestore,
  deleteVehicleFromFirestore,
  getTripTemplatesFromFirestore,
  saveTripTemplateToFirestore,
  deleteTripTemplateFromFirestore,
  getClausePresetsFromFirestore,
  saveClausePresetToFirestore,
  deleteClausePresetFromFirestore,
  getQuotationsFromFirestore,
  saveQuotationToFirestore,
  deleteQuotationFromFirestore,
  subscribeToQuotations,
  getAuthUsersFromFirestore,
  saveAuthUserToFirestore,
  deleteAuthUserFromFirestore,
  getDestinationsFromFirestore,
  saveDestinationToFirestore,
  deleteDestinationFromFirestore,
  getSuppliersFromFirestore,
  saveSupplierToFirestore,
  deleteSupplierFromFirestore,
  getCustomerPaymentsFromFirestore,
  saveCustomerPaymentToFirestore,
  getSupplierPaymentsFromFirestore,
  saveSupplierPaymentToFirestore,
  getShareEventsFromFirestore,
  saveShareEventToFirestore,
  syncAllMasterDataToFirestore,
} from '../lib/firestoreService';
import { isFirebaseConfigured } from '../lib/firebase';

interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUserRole: (role: UserRole) => void;
  login: (usernameOrEmail: string, password?: string) => boolean;
  logout: () => void;
  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;

  // Cloud Firestore Status & Operations
  isHydrated: boolean;
  firestoreStatus: 'connected' | 'syncing' | 'error' | 'offline';
  firestoreError: string | null;
  syncToFirestore: () => Promise<{ success: boolean; message: string; collectionsWritten?: string[]; error?: string }>;
  refreshFromFirestore: () => Promise<void>;

  // Team & Auth Users
  authUsers: AuthUser[];
  updateAuthUser: (id: string, updates: Partial<AuthUser>) => void;
  createAuthUser: (user: Omit<AuthUser, 'id'>) => AuthUser;
  deleteAuthUser: (id: string) => void;

  // Trip Clauses Presets
  clausePresets: TripClausePreset[];
  addClausePreset: (preset: Omit<TripClausePreset, 'id'>) => TripClausePreset;
  deleteClausePreset: (id: string) => void;
  
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
  importHotelsCSV: (importedHotels: Hotel[]) => void;

  // Vehicles
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Vehicle;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  // Destinations & Templates
  destinations: Destination[];
  addDestination: (dest: Destination) => void;
  updateDestination: (id: string, updates: Partial<Destination>) => void;
  deleteDestination: (id: string) => void;
  addAttraction: (destinationId: string, attraction: Attraction) => void;
  updateAttraction: (destinationId: string, attractionId: string, updates: Partial<Attraction>) => void;
  deleteAttraction: (destinationId: string, attractionId: string) => void;
  tripTemplates: TripTemplate[];
  addTripTemplate: (template: Omit<TripTemplate, 'id'>) => TripTemplate;
  updateTripTemplate: (id: string, updates: Partial<TripTemplate>) => void;
  deleteTripTemplate: (id: string) => void;

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
  SETTINGS: 'dj_company_settings_v2',
  LEADS: 'dj_leads_v2',
  HOTELS: 'dj_hotels_v2',
  VEHICLES: 'dj_vehicles_v2',
  DESTINATIONS: 'dj_destinations_v2',
  QUOTATIONS: 'dj_quotations_v2',
  SHARE_EVENTS: 'dj_share_events_v2',
  SUPPLIERS: 'dj_suppliers_v2',
  SUPPLIER_PAYMENTS: 'dj_supplier_payments_v2',
  CUSTOMER_PAYMENTS: 'dj_customer_payments_v2',
  USER_ROLE: 'dj_user_role_v1',
  LOGGED_IN_USER: 'dj_logged_in_user_v2',
  AUTH_USERS: 'dj_auth_users_v3',
  CLAUSE_PRESETS: 'dj_clause_presets_v1',
  TRIP_TEMPLATES: 'dj_trip_templates_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUsers, setAuthUsers] = useState<AuthUser[]>(systemAuthUsers);
  // Default to null so user MUST log in when visiting the app
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [companySettings, setCompanySettings] = useState<CompanySettings>(initialCompanySettings);
  const [clausePresets, setClausePresets] = useState<TripClausePreset[]>(defaultClausePresets);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>(sampleHotels);
  const [vehicles, setVehicles] = useState<Vehicle[]>(sampleVehicles);
  const [destinations, setDestinations] = useState<Destination[]>(sampleDestinations);
  const [tripTemplates, setTripTemplates] = useState<TripTemplate[]>(sampleTripTemplates);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [shareEvents, setShareEvents] = useState<ShareEvent[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(sampleSuppliers);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPaymentEntry[]>([]);
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [firestoreStatus, setFirestoreStatus] = useState<'connected' | 'syncing' | 'error' | 'offline'>(
    isFirebaseConfigured ? 'syncing' : 'offline'
  );
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  // Load from LocalStorage and Cloud Firestore on mount
  useEffect(() => {
    let isMounted = true;

    const hydrateAppData = async () => {
      let initialSettings = initialCompanySettings;
      let initialAuthUsers = systemAuthUsers;
      let initialHotels = sampleHotels;
      let initialVehicles = sampleVehicles;
      let initialTemplates = sampleTripTemplates;
      let initialPresets = defaultClausePresets;
      let initialLeadsList = sampleLeads;
      let initialQuoteList = sampleQuotations;

      // 1. First, hydrate from localStorage if available
      try {
        const savedAuthUsers = localStorage.getItem(STORAGE_KEYS.AUTH_USERS);
        if (savedAuthUsers) {
          initialAuthUsers = JSON.parse(savedAuthUsers);
          setAuthUsers(initialAuthUsers);
        }

        const savedPresets = localStorage.getItem(STORAGE_KEYS.CLAUSE_PRESETS);
        if (savedPresets) {
          initialPresets = JSON.parse(savedPresets);
          setClausePresets(initialPresets);
        }

        const savedUser = localStorage.getItem(STORAGE_KEYS.LOGGED_IN_USER);
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }

        const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (savedSettings) {
          initialSettings = JSON.parse(savedSettings);
          setCompanySettings(initialSettings);
        }

        const savedLeads = localStorage.getItem(STORAGE_KEYS.LEADS);
        if (savedLeads) {
          initialLeadsList = JSON.parse(savedLeads);
          setLeads(initialLeadsList);
        }

        const savedHotels = localStorage.getItem(STORAGE_KEYS.HOTELS);
        if (savedHotels) {
          initialHotels = JSON.parse(savedHotels);
          setHotels(initialHotels);
        }

        const savedVehicles = localStorage.getItem(STORAGE_KEYS.VEHICLES);
        if (savedVehicles) {
          initialVehicles = JSON.parse(savedVehicles);
          setVehicles(initialVehicles);
        }

        const savedDestinations = localStorage.getItem(STORAGE_KEYS.DESTINATIONS);
        if (savedDestinations) setDestinations(JSON.parse(savedDestinations));

        const savedTemplates = localStorage.getItem(STORAGE_KEYS.TRIP_TEMPLATES);
        if (savedTemplates) {
          initialTemplates = JSON.parse(savedTemplates);
          setTripTemplates(initialTemplates);
        }

        const savedQuotations = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
        if (savedQuotations) {
          initialQuoteList = JSON.parse(savedQuotations);
          setQuotations(initialQuoteList);
        }

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
          setCurrentUser((u) => (u ? { ...u, role: savedRole } : null));
        }
      } catch (e) {
        console.warn('LocalStorage hydration issue:', e);
      } finally {
        if (isMounted) setIsHydrated(true);
      }

      // 2. Connect to Cloud Firestore in the background
      if (isFirebaseConfigured) {
        try {
          if (isMounted) setFirestoreStatus('syncing');

          const [
            fsSettings,
            fsHotels,
            fsUsers,
            fsVehicles,
            fsTemplates,
            fsPresets,
            fsDestinations,
            fsSuppliers,
            fsLeads,
            fsQuotes,
            fsCustomerPayments,
            fsSupplierPayments,
            fsShareEvents,
          ] = await Promise.all([
            getCompanySettingsFromFirestore(),
            getHotelsFromFirestore(),
            getAuthUsersFromFirestore(),
            getVehiclesFromFirestore(),
            getTripTemplatesFromFirestore(),
            getClausePresetsFromFirestore(),
            getDestinationsFromFirestore(),
            getSuppliersFromFirestore(),
            getLeadsFromFirestore(),
            getQuotationsFromFirestore(),
            getCustomerPaymentsFromFirestore(),
            getSupplierPaymentsFromFirestore(),
            getShareEventsFromFirestore(),
          ]);

          if (isMounted) {
            // Settings
            if (fsSettings) {
              setCompanySettings(fsSettings);
            } else {
              saveCompanySettingsToFirestore(initialSettings).catch(console.error);
            }

            // Hotels
            if (fsHotels && fsHotels.length > 0) {
              setHotels(fsHotels);
            } else {
              initialHotels.forEach((h) => saveHotelToFirestore(h).catch(console.error));
            }

            // Users
            if (fsUsers && fsUsers.length > 0) {
              setAuthUsers(fsUsers);
            } else {
              initialAuthUsers.forEach((u) => saveAuthUserToFirestore(u).catch(console.error));
            }

            // Vehicles
            if (fsVehicles && fsVehicles.length > 0) {
              setVehicles(fsVehicles);
            } else {
              initialVehicles.forEach((v) => saveVehicleToFirestore(v).catch(console.error));
            }

            // Trip Templates
            if (fsTemplates && fsTemplates.length > 0) {
              setTripTemplates(fsTemplates);
            } else {
              initialTemplates.forEach((t) => saveTripTemplateToFirestore(t).catch(console.error));
            }

            // Clause Presets
            if (fsPresets && fsPresets.length > 0) {
              setClausePresets(fsPresets);
            } else {
              initialPresets.forEach((p) => saveClausePresetToFirestore(p).catch(console.error));
            }

            // Destinations
            if (fsDestinations && fsDestinations.length > 0) {
              setDestinations(fsDestinations);
            } else {
              sampleDestinations.forEach((d) => saveDestinationToFirestore(d).catch(console.error));
            }

            // Suppliers
            if (fsSuppliers && fsSuppliers.length > 0) {
              setSuppliers(fsSuppliers);
            } else {
              sampleSuppliers.forEach((s) => saveSupplierToFirestore(s).catch(console.error));
            }

            // Leads (Automatic two-way reconcile & cloud sync)
            const fsLeadMap = new Map((fsLeads || []).map((l) => [l.id, l]));
            const mergedLeads = [...(fsLeads || [])];
            if (initialLeadsList && initialLeadsList.length > 0) {
              initialLeadsList.forEach((localLead) => {
                if (!fsLeadMap.has(localLead.id)) {
                  mergedLeads.push(localLead);
                  saveLeadToFirestore(localLead).catch((err) =>
                    console.warn('Auto-sync lead to Firestore error:', err)
                  );
                }
              });
            }
            mergedLeads.sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
            if (mergedLeads.length > 0) {
              setLeads(mergedLeads);
            }

            // Quotations (Automatic two-way reconcile & cloud sync)
            const fsQuoteMap = new Map((fsQuotes || []).map((q) => [q.id, q]));
            const mergedQuotes = [...(fsQuotes || [])];
            if (initialQuoteList && initialQuoteList.length > 0) {
              initialQuoteList.forEach((localQuote) => {
                if (!fsQuoteMap.has(localQuote.id)) {
                  mergedQuotes.push(localQuote);
                  saveQuotationToFirestore(localQuote).catch((err) =>
                    console.warn('Auto-sync quotation to Firestore error:', err)
                  );
                }
              });
            }
            mergedQuotes.sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
            if (mergedQuotes.length > 0) {
              setQuotations(mergedQuotes);
            }

            // Payments
            if (fsCustomerPayments && fsCustomerPayments.length > 0) {
              setCustomerPayments(fsCustomerPayments);
            }
            if (fsSupplierPayments && fsSupplierPayments.length > 0) {
              setSupplierPayments(fsSupplierPayments);
            }
            if (fsShareEvents && fsShareEvents.length > 0) {
              setShareEvents(fsShareEvents);
            }

            setFirestoreStatus('connected');
            setFirestoreError(null);
          }
        } catch (err: any) {
          console.warn('Firestore sync note:', err);
          if (isMounted) {
            setFirestoreStatus('error');
            setFirestoreError(err.message || 'Firestore connection issue');
          }
        }
      }
    };

    hydrateAppData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Automatic Real-Time Cloud Listeners across all agency devices
  useEffect(() => {
    if (!isFirebaseConfigured || !isHydrated) return;

    const unsubQuotes = subscribeToQuotations((latestQuotes) => {
      if (latestQuotes && latestQuotes.length > 0) {
        setQuotations(latestQuotes);
      }
    });

    const unsubLeads = subscribeToLeads((latestLeads) => {
      if (latestLeads && latestLeads.length > 0) {
        setLeads(latestLeads);
      }
    });

    return () => {
      unsubQuotes();
      unsubLeads();
    };
  }, [isHydrated]);

  // Save to LocalStorage whenever state updates
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(authUsers));
      localStorage.setItem(STORAGE_KEYS.CLAUSE_PRESETS, JSON.stringify(clausePresets));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(companySettings));
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
      localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(hotels));
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
      localStorage.setItem(STORAGE_KEYS.DESTINATIONS, JSON.stringify(destinations));
      localStorage.setItem(STORAGE_KEYS.TRIP_TEMPLATES, JSON.stringify(tripTemplates));
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
    authUsers,
    clausePresets,
    companySettings,
    leads,
    hotels,
    vehicles,
    destinations,
    tripTemplates,
    quotations,
    shareEvents,
    suppliers,
    supplierPayments,
    customerPayments,
  ]);

  const setCurrentUserRole = (role: UserRole) => {
    setCurrentUser((prev) => (prev ? { ...prev, role } : null));
    try {
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
    } catch {}
  };

  const login = (usernameOrEmail: string, password?: string): boolean => {
    const clean = usernameOrEmail.trim().toLowerCase();
    const matched = authUsers.find(
      (u) =>
        u.username.toLowerCase() === clean ||
        u.email.toLowerCase() === clean ||
        (clean === 'planner@desijoueney.com' && u.username === 'planner')
    );
    if (matched) {
      if (password && password.trim()) {
        const expected = matched.password || matched.defaultPassword;
        if (expected && expected !== password.trim()) {
          return false;
        }
      }
      const profile: UserProfile = {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: matched.role,
        phone: matched.phone,
        title: matched.title,
      };
      setCurrentUser(profile);
      try {
        localStorage.setItem(STORAGE_KEYS.LOGGED_IN_USER, JSON.stringify(profile));
        localStorage.setItem(STORAGE_KEYS.USER_ROLE, profile.role);
      } catch {}
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.LOGGED_IN_USER);
      localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    } catch {}
  };

  const syncToFirestore = async () => {
    setFirestoreStatus('syncing');
    setFirestoreError(null);
    const res = await syncAllMasterDataToFirestore({
      companySettings,
      authUsers,
      hotels,
      vehicles,
      tripTemplates,
      clausePresets,
      destinations,
      suppliers,
      leads,
      quotations,
      customerPayments,
      supplierPayments,
    });
    if (res.success) {
      setFirestoreStatus('connected');
    } else {
      setFirestoreStatus('error');
      setFirestoreError(res.error || res.message);
    }
    return res;
  };

  const refreshFromFirestore = async () => {
    if (!isFirebaseConfigured) return;
    setFirestoreStatus('syncing');
    try {
      const [
        fsSettings,
        fsHotels,
        fsUsers,
        fsVehicles,
        fsTemplates,
        fsPresets,
        fsDestinations,
        fsSuppliers,
        fsLeads,
        fsQuotes,
        fsCustomerPayments,
        fsSupplierPayments,
        fsShareEvents,
      ] = await Promise.all([
        getCompanySettingsFromFirestore(),
        getHotelsFromFirestore(),
        getAuthUsersFromFirestore(),
        getVehiclesFromFirestore(),
        getTripTemplatesFromFirestore(),
        getClausePresetsFromFirestore(),
        getDestinationsFromFirestore(),
        getSuppliersFromFirestore(),
        getLeadsFromFirestore(),
        getQuotationsFromFirestore(),
        getCustomerPaymentsFromFirestore(),
        getSupplierPaymentsFromFirestore(),
        getShareEventsFromFirestore(),
      ]);
      if (fsSettings) setCompanySettings(fsSettings);
      if (fsHotels && fsHotels.length > 0) setHotels(fsHotels);
      if (fsUsers && fsUsers.length > 0) setAuthUsers(fsUsers);
      if (fsVehicles && fsVehicles.length > 0) setVehicles(fsVehicles);
      if (fsTemplates && fsTemplates.length > 0) setTripTemplates(fsTemplates);
      if (fsPresets && fsPresets.length > 0) setClausePresets(fsPresets);
      if (fsDestinations && fsDestinations.length > 0) setDestinations(fsDestinations);
      if (fsSuppliers && fsSuppliers.length > 0) setSuppliers(fsSuppliers);
      if (fsLeads && fsLeads.length > 0) setLeads(fsLeads);
      if (fsQuotes && fsQuotes.length > 0) setQuotations(fsQuotes);
      if (fsCustomerPayments && fsCustomerPayments.length > 0) setCustomerPayments(fsCustomerPayments);
      if (fsSupplierPayments && fsSupplierPayments.length > 0) setSupplierPayments(fsSupplierPayments);
      if (fsShareEvents && fsShareEvents.length > 0) setShareEvents(fsShareEvents);
      setFirestoreStatus('connected');
      setFirestoreError(null);
    } catch (err: any) {
      setFirestoreStatus('error');
      setFirestoreError(err.message || 'Failed to refresh from Firestore');
    }
  };

  const updateAuthUser = (id: string, updates: Partial<AuthUser>) => {
    setAuthUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          saveAuthUserToFirestore(updated).catch(console.error);
          if (currentUser && currentUser.id === id) {
            const newProfile: UserProfile = {
              id: updated.id,
              name: updated.name,
              email: updated.email,
              role: updated.role,
              phone: updated.phone,
              title: updated.title,
            };
            setCurrentUser(newProfile);
            try {
              localStorage.setItem(STORAGE_KEYS.LOGGED_IN_USER, JSON.stringify(newProfile));
              localStorage.setItem(STORAGE_KEYS.USER_ROLE, newProfile.role);
            } catch {}
          }
          return updated;
        }
        return u;
      })
    );
  };

  const createAuthUser = (user: Omit<AuthUser, 'id'>): AuthUser => {
    const newUser: AuthUser = {
      ...user,
      id: `user-${Date.now()}`,
    };
    setAuthUsers((prev) => [...prev, newUser]);
    saveAuthUserToFirestore(newUser).catch(console.error);
    return newUser;
  };

  const deleteAuthUser = (id: string) => {
    setAuthUsers((prev) => prev.filter((u) => u.id !== id));
    deleteAuthUserFromFirestore(id).catch(console.error);
  };

  const addClausePreset = (preset: Omit<TripClausePreset, 'id'>): TripClausePreset => {
    const newPreset: TripClausePreset = {
      ...preset,
      id: `preset-${Date.now()}`,
    };
    setClausePresets((prev) => [...prev, newPreset]);
    saveClausePresetToFirestore(newPreset).catch(console.error);
    return newPreset;
  };

  const deleteClausePreset = (id: string) => {
    setClausePresets((prev) => prev.filter((p) => p.id !== id));
    deleteClausePresetFromFirestore(id).catch(console.error);
  };

  const updateCompanySettings = (settings: Partial<CompanySettings>) => {
    setCompanySettings((prev) => {
      const updated = { ...prev, ...settings };
      saveCompanySettingsToFirestore(updated).catch(console.error);
      return updated;
    });
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);
    saveLeadToFirestore(newLead).catch(console.error);
    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const updated = { ...l, ...updates, updatedAt: new Date().toISOString() };
          saveLeadToFirestore(updated).catch(console.error);
          return updated;
        }
        return l;
      })
    );
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    deleteLeadFromFirestore(id).catch(console.error);
  };

  const updateLeadStatus = (id: string, status: LeadStatus, note?: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const updated = {
          ...l,
          status,
          nextFollowUpNote: note || l.nextFollowUpNote,
          updatedAt: new Date().toISOString(),
        };
        saveLeadToFirestore(updated).catch(console.error);
        return updated;
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
    saveHotelToFirestore(newHotel).catch(console.error);
    return newHotel;
  };

  const updateHotel = (id: string, updates: Partial<Hotel>) => {
    setHotels((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const updated = { ...h, ...updates, updatedAt: new Date().toISOString() };
          saveHotelToFirestore(updated).catch(console.error);
          return updated;
        }
        return h;
      })
    );
  };

  const deleteHotel = (id: string) => {
    setHotels((prev) => prev.filter((h) => h.id !== id));
    deleteHotelFromFirestore(id).catch(console.error);
  };

  const importHotelsCSV = (importedHotels: Hotel[]) => {
    setHotels((prev) => {
      const existingNames = new Set(prev.map((h) => h.name.toLowerCase()));
      const filtered = importedHotels.filter((h) => !existingNames.has(h.name.toLowerCase()));
      for (const h of filtered) {
        saveHotelToFirestore(h).catch(console.error);
      }
      return [...filtered, ...prev];
    });
  };

  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`,
    };
    setVehicles((prev) => [newVehicle, ...prev]);
    saveVehicleToFirestore(newVehicle).catch(console.error);
    return newVehicle;
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const updated = { ...v, ...updates };
          saveVehicleToFirestore(updated).catch(console.error);
          return updated;
        }
        return v;
      })
    );
  };

  const deleteVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    deleteVehicleFromFirestore(id).catch(console.error);
  };

  const addDestination = (dest: Destination) => {
    setDestinations((prev) => [dest, ...prev]);
    saveDestinationToFirestore(dest).catch(console.error);
  };

  const updateDestination = (id: string, updates: Partial<Destination>) => {
    setDestinations((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const updated = { ...d, ...updates };
          saveDestinationToFirestore(updated).catch(console.error);
          return updated;
        }
        return d;
      })
    );
  };

  const deleteDestination = (id: string) => {
    setDestinations((prev) => prev.filter((d) => d.id !== id));
    deleteDestinationFromFirestore(id).catch(console.error);
  };

  const addAttraction = (destinationId: string, attraction: Attraction) => {
    setDestinations((prev) =>
      prev.map((d) => {
        if (d.id !== destinationId) return d;
        const updated = {
          ...d,
          attractions: [attraction, ...d.attractions],
        };
        saveDestinationToFirestore(updated).catch(console.error);
        return updated;
      })
    );
  };

  const updateAttraction = (destinationId: string, attractionId: string, updates: Partial<Attraction>) => {
    setDestinations((prev) =>
      prev.map((d) => {
        if (d.id !== destinationId) return d;
        const updated = {
          ...d,
          attractions: d.attractions.map((a) => (a.id === attractionId ? { ...a, ...updates } : a)),
        };
        saveDestinationToFirestore(updated).catch(console.error);
        return updated;
      })
    );
  };

  const deleteAttraction = (destinationId: string, attractionId: string) => {
    setDestinations((prev) =>
      prev.map((d) => {
        if (d.id !== destinationId) return d;
        const updated = {
          ...d,
          attractions: d.attractions.filter((a) => a.id !== attractionId),
        };
        saveDestinationToFirestore(updated).catch(console.error);
        return updated;
      })
    );
  };

  const addTripTemplate = (templateData: Omit<TripTemplate, 'id'>): TripTemplate => {
    const newTemplate: TripTemplate = {
      ...templateData,
      id: `tmpl-custom-${Date.now()}`,
      isCustom: true,
    };
    setTripTemplates((prev) => [newTemplate, ...prev]);
    saveTripTemplateToFirestore(newTemplate).catch(console.error);
    return newTemplate;
  };

  const updateTripTemplate = (id: string, updates: Partial<TripTemplate>) => {
    setTripTemplates((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          saveTripTemplateToFirestore(updated).catch(console.error);
          return updated;
        }
        return t;
      })
    );
  };

  const deleteTripTemplate = (id: string) => {
    setTripTemplates((prev) => prev.filter((t) => t.id !== id));
    deleteTripTemplateFromFirestore(id).catch(console.error);
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
    saveQuotationToFirestore(newQuote)
      .then((ok) => {
        if (!ok) {
          setFirestoreStatus('error');
          setFirestoreError('Itinerary saved locally, but Cloud Firestore write was rejected (Missing permissions).');
        } else {
          setFirestoreStatus('connected');
          setFirestoreError(null);
        }
      })
      .catch((err) => {
        setFirestoreStatus('error');
        setFirestoreError(err?.message || 'Itinerary saved locally, but Cloud Firestore write failed.');
      });
    return newQuote;
  };

  const updateQuotation = (id: string, updates: Partial<Quotation>) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const updated = { ...q, ...updates, updatedAt: new Date().toISOString() };
          saveQuotationToFirestore(updated)
            .then((ok) => {
              if (!ok) {
                setFirestoreStatus('error');
                setFirestoreError('Itinerary updated locally, but Cloud Firestore update was rejected.');
              } else {
                setFirestoreStatus('connected');
                setFirestoreError(null);
              }
            })
            .catch((err) => {
              setFirestoreStatus('error');
              setFirestoreError(err?.message || 'Itinerary updated locally, but Cloud Firestore update failed.');
            });
          return updated;
        }
        return q;
      })
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
    saveQuotationToFirestore(newVersion)
      .then((ok) => {
        if (!ok) {
          setFirestoreStatus('error');
          setFirestoreError('Itinerary saved locally, but Cloud Firestore write was rejected.');
        } else {
          setFirestoreStatus('connected');
          setFirestoreError(null);
        }
      })
      .catch((err) => {
        setFirestoreStatus('error');
        setFirestoreError(err?.message || 'Itinerary saved locally, but Cloud Firestore write failed.');
      });
    return newVersion;
  };

  const deleteQuotation = (id: string) => {
    setQuotations((prev) => prev.filter((q) => q.id !== id));
    deleteQuotationFromFirestore(id).catch(console.error);
  };

  const recordShareEvent = (eventData: Omit<ShareEvent, 'id' | 'timestamp'>) => {
    const newEvent: ShareEvent = {
      ...eventData,
      id: `share-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setShareEvents((prev) => [newEvent, ...prev]);
    saveShareEventToFirestore(newEvent).catch(console.error);
  };

  const recordSupplierPayment = (entryData: Omit<SupplierPaymentEntry, 'id'>) => {
    const newEntry: SupplierPaymentEntry = {
      ...entryData,
      id: `spay-${Date.now()}`,
    };
    setSupplierPayments((prev) => [newEntry, ...prev]);
    saveSupplierPaymentToFirestore(newEntry).catch(console.error);

    // Update supplier balance
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id !== entryData.supplierId) return s;
        const totalPaid = s.totalPaid + entryData.amount;
        const balanceOutstanding = Math.max(0, s.totalAgreedPayable - totalPaid);
        const updatedSupplier = { ...s, totalPaid, balanceOutstanding };
        saveSupplierToFirestore(updatedSupplier).catch(console.error);
        return updatedSupplier;
      })
    );
  };

  const recordCustomerPayment = (paymentData: Omit<CustomerPayment, 'id'>) => {
    const newPayment: CustomerPayment = {
      ...paymentData,
      id: `cpay-${Date.now()}`,
    };
    setCustomerPayments((prev) => [newPayment, ...prev]);
    saveCustomerPaymentToFirestore(newPayment).catch(console.error);

    // Update quotation advance received and status
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id !== paymentData.quoteId) return q;
        const newAdvance = q.advanceReceived + paymentData.amount;
        const updatedQuote: Quotation = {
          ...q,
          advanceReceived: newAdvance,
          status: newAdvance >= q.costing.advanceAmountRequired ? 'Confirmed' : q.status,
          updatedAt: new Date().toISOString(),
        };
        saveQuotationToFirestore(updatedQuote).catch(console.error);
        return updatedQuote;
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
    setTripTemplates(sampleTripTemplates);
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
        login,
        logout,
        companySettings,
        updateCompanySettings,
        authUsers,
        updateAuthUser,
        createAuthUser,
        deleteAuthUser,
        clausePresets,
        addClausePreset,
        deleteClausePreset,
        leads,
        addLead,
        updateLead,
        deleteLead,
        updateLeadStatus,
        hotels,
        addHotel,
        updateHotel,
        deleteHotel,
        importHotelsCSV,
        vehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        destinations,
        addDestination,
        updateDestination,
        deleteDestination,
        addAttraction,
        updateAttraction,
        deleteAttraction,
        tripTemplates,
        addTripTemplate,
        updateTripTemplate,
        deleteTripTemplate,
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
        isHydrated,
        firestoreStatus,
        firestoreError,
        syncToFirestore,
        refreshFromFirestore,
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
