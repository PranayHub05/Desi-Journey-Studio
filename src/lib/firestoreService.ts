import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import {
  CompanySettings,
  Lead,
  Quotation,
  Hotel,
  Vehicle,
  AuthUser,
  TripClausePreset,
  TripTemplate,
  Destination,
  Supplier,
  CustomerPayment,
  SupplierPaymentEntry,
  ShareEvent,
} from '../types';

export const COLLECTIONS = {
  SETTINGS: 'agency_settings',
  LEADS: 'leads',
  QUOTATIONS: 'quotations',
  HOTELS: 'hotels',
  VEHICLES: 'vehicles',
  USERS: 'users',
  CLAUSE_PRESETS: 'clause_presets',
  TRIP_TEMPLATES: 'trip_templates',
  DESTINATIONS: 'destinations',
  SUPPLIERS: 'suppliers',
  CUSTOMER_PAYMENTS: 'customer_payments',
  SUPPLIER_PAYMENTS: 'supplier_payments',
  SHARE_EVENTS: 'share_events',
};

/**
 * Deep sanitization helper that strips all `undefined` values recursively.
 * Firebase Firestore setDoc/updateDoc strictly crashes if any key has an undefined value.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

// -----------------------------------------------------------------------------
// Agency Settings
// -----------------------------------------------------------------------------
export async function getCompanySettingsFromFirestore(): Promise<CompanySettings | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'default');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CompanySettings;
    }
  } catch (err) {
    console.warn('Could not read agency settings from Firestore:', err);
  }
  return null;
}

export async function saveCompanySettingsToFirestore(settings: CompanySettings): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'default');
    const cleaned = sanitizeForFirestore({ ...settings, updatedAt: new Date().toISOString() });
    await setDoc(docRef, cleaned, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save settings to Firestore:', err);
    return false;
  }
}

// -----------------------------------------------------------------------------
// Leads / Enquiries
// -----------------------------------------------------------------------------
export async function getLeadsFromFirestore(): Promise<Lead[] | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.LEADS));
    const leads = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Lead);
    return leads.sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  } catch (err) {
    console.warn('Could not read leads from Firestore:', err);
    return null;
  }
}

export async function saveLeadToFirestore(lead: Lead): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const cleaned = sanitizeForFirestore(lead);
    await setDoc(doc(db, COLLECTIONS.LEADS, lead.id), cleaned, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save lead to Firestore:', err);
    return false;
  }
}

export async function deleteLeadFromFirestore(id: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await deleteDoc(doc(db, COLLECTIONS.LEADS, id));
    return true;
  } catch (err) {
    console.error('Failed to delete lead from Firestore:', err);
    return false;
  }
}

/**
 * Real-time listener for leads across all agency devices.
 */
export function subscribeToLeads(
  callback: (leads: Lead[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!isFirebaseConfigured || !db) return () => {};
  try {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.LEADS),
      (snap) => {
        const leads = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Lead);
        const sorted = leads.sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        callback(sorted);
      },
      (err) => {
        console.warn('Realtime leads snapshot listener error:', err);
        if (onError) onError(err);
      }
    );
    return unsub;
  } catch (err: any) {
    console.warn('Could not subscribe to leads:', err);
    return () => {};
  }
}

// -----------------------------------------------------------------------------
// Quotations & Proposals
// -----------------------------------------------------------------------------
export async function getQuotationsFromFirestore(): Promise<Quotation[] | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.QUOTATIONS));
    const quotes = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Quotation);
    return quotes.sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  } catch (err) {
    console.warn('Could not read quotations from Firestore:', err);
    return null;
  }
}

export async function saveQuotationToFirestore(quote: Quotation): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const cleaned = sanitizeForFirestore(quote);
    await setDoc(doc(db, COLLECTIONS.QUOTATIONS, quote.id), cleaned, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save quotation to Firestore:', err);
    return false;
  }
}

export async function deleteQuotationFromFirestore(id: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await deleteDoc(doc(db, COLLECTIONS.QUOTATIONS, id));
    return true;
  } catch (err) {
    console.error('Failed to delete quotation from Firestore:', err);
    return false;
  }
}

/**
 * Real-time listener for quotations across all agency devices.
 * Automatically synchronizes changes from any laptop in real time.
 */
export function subscribeToQuotations(
  callback: (quotes: Quotation[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!isFirebaseConfigured || !db) return () => {};
  try {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.QUOTATIONS),
      (snap) => {
        const quotes = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Quotation);
        const sorted = quotes.sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        callback(sorted);
      },
      (err) => {
        console.warn('Realtime quotations snapshot listener error:', err);
        if (onError) onError(err);
      }
    );
    return unsub;
  } catch (err: any) {
    console.warn('Could not subscribe to quotations:', err);
    return () => {};
  }
}

// -----------------------------------------------------------------------------
// Hotels & Properties
// -----------------------------------------------------------------------------
export async function getHotelsFromFirestore(): Promise<Hotel[] | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.HOTELS));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Hotel);
  } catch (err) {
    console.warn('Could not read hotels from Firestore:', err);
    return null;
  }
}

export async function saveHotelToFirestore(hotel: Hotel): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const cleaned = sanitizeForFirestore(hotel);
    await setDoc(doc(db, COLLECTIONS.HOTELS, hotel.id), cleaned, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save hotel to Firestore:', err);
    return false;
  }
}

export async function deleteHotelFromFirestore(id: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await deleteDoc(doc(db, COLLECTIONS.HOTELS, id));
    return true;
  } catch (err) {
    console.error('Failed to delete hotel from Firestore:', err);
    return false;
  }
}

// -----------------------------------------------------------------------------
// Vehicles & Fleet
// -----------------------------------------------------------------------------
export async function getVehiclesFromFirestore(): Promise<Vehicle[] | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.VEHICLES));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Vehicle);
  } catch (err) {
    console.warn('Could not read vehicles from Firestore:', err);
    return null;
  }
}

export async function saveVehicleToFirestore(vehicle: Vehicle): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const cleaned = sanitizeForFirestore(vehicle);
    await setDoc(doc(db, COLLECTIONS.VEHICLES, vehicle.id), cleaned, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save vehicle to Firestore:', err);
    return false;
  }
}

export async function deleteVehicleFromFirestore(id: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await deleteDoc(doc(db, COLLECTIONS.VEHICLES, id));
    return true;
  } catch (err) {
    console.error('Failed to delete vehicle from Firestore:', err);
    return false;
  }
}

// -----------------------------------------------------------------------------
// Pre-Made Trip Templates
// -----------------------------------------------------------------------------
export async function getTripTemplatesFromFirestore(): Promise<TripTemplate[] | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.TRIP_TEMPLATES));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TripTemplate);
  } catch (err) {
    console.warn('Could not read trip templates from Firestore:', err);
    return null;
  }
}

export async function saveTripTemplateToFirestore(template: TripTemplate): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const cleaned = sanitizeForFirestore(template);
    await setDoc(doc(db, COLLECTIONS.TRIP_TEMPLATES, template.id), cleaned, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save trip template to Firestore:', err);
    return false;
  }
}

export async function deleteTripTemplateFromFirestore(id: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await deleteDoc(doc(db, COLLECTIONS.TRIP_TEMPLATES, id));
    return true;
  } catch (err) {
    console.error('Failed to delete trip template from Firestore:', err);
    return false;
  }
}

// -----------------------------------------------------------------------------
// Clause Presets
// -----------------------------------------------------------------------------
export async function getClausePresetsFromFirestore(): Promise<TripClausePreset[] | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.CLAUSE_PRESETS));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TripClausePreset);
  } catch (err) {
    console.warn('Could not read clause presets from Firestore:', err);
    return null;
  }
}

export async function saveClausePresetToFirestore(preset: TripClausePreset): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const cleaned = sanitizeForFirestore(preset);
    await setDoc(doc(db, COLLECTIONS.CLAUSE_PRESETS, preset.id), cleaned, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save clause preset to Firestore:', err);
    return false;
  }
}

export async function deleteClausePresetFromFirestore(id: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await deleteDoc(doc(db, COLLECTIONS.CLAUSE_PRESETS, id));
    return true;
  } catch (err) {
    console.error('Failed to delete clause preset from Firestore:', err);
    return false;
  }
}

// -----------------------------------------------------------------------------
// Destinations & Sightseeing
// -----------------------------------------------------------------------------
export async function getDestinationsFromFirestore(): Promise<Destination[] | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.DESTINATIONS));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Destination);
  } catch (err) {
    console.warn('Could not read destinations from Firestore:', err);
    return null;
  }
}

export async function saveDestinationToFirestore(dest: Destination): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const cleaned = sanitizeForFirestore(dest);
    await setDoc(doc(db, COLLECTIONS.DESTINATIONS, dest.id), cleaned, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save destination to Firestore:', err);
    return false;
  }
}

export async function deleteDestinationFromFirestore(id: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await deleteDoc(doc(db, COLLECTIONS.DESTINATIONS, id));
    return true;
  } catch (err) {
    console.error('Failed to delete destination from Firestore:', err);
    return false;
  }
}

// -----------------------------------------------------------------------------
// Team / Auth Users
// -----------------------------------------------------------------------------
export async function getAuthUsersFromFirestore(): Promise<AuthUser[] | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.USERS));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AuthUser);
  } catch (err) {
    console.warn('Could not read users from Firestore:', err);
    return null;
  }
}

export async function saveAuthUserToFirestore(user: AuthUser): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const cleaned = sanitizeForFirestore(user);
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), cleaned, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save user to Firestore:', err);
    return false;
  }
}

export async function deleteAuthUserFromFirestore(id: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await deleteDoc(doc(db, COLLECTIONS.USERS, id));
    return true;
  } catch (err) {
    console.error('Failed to delete user from Firestore:', err);
    return false;
  }
}

// -----------------------------------------------------------------------------
// Suppliers
// -----------------------------------------------------------------------------
export async function getSuppliersFromFirestore(): Promise<Supplier[] | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.SUPPLIERS));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Supplier);
  } catch (err) {
    console.warn('Could not read suppliers from Firestore:', err);
    return null;
  }
}

export async function saveSupplierToFirestore(supplier: Supplier): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const cleaned = sanitizeForFirestore(supplier);
    await setDoc(doc(db, COLLECTIONS.SUPPLIERS, supplier.id), cleaned, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save supplier to Firestore:', err);
    return false;
  }
}

export async function deleteSupplierFromFirestore(id: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await deleteDoc(doc(db, COLLECTIONS.SUPPLIERS, id));
    return true;
  } catch (err) {
    console.error('Failed to delete supplier from Firestore:', err);
    return false;
  }
}

// -----------------------------------------------------------------------------
// Customer Payments
// -----------------------------------------------------------------------------
export async function getCustomerPaymentsFromFirestore(): Promise<CustomerPayment[] | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.CUSTOMER_PAYMENTS));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CustomerPayment);
  } catch (err) {
    console.warn('Could not read customer payments from Firestore:', err);
    return null;
  }
}

export async function saveCustomerPaymentToFirestore(payment: CustomerPayment): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const cleaned = sanitizeForFirestore(payment);
    await setDoc(doc(db, COLLECTIONS.CUSTOMER_PAYMENTS, payment.id), cleaned, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save customer payment to Firestore:', err);
    return false;
  }
}

// -----------------------------------------------------------------------------
// Supplier Payments
// -----------------------------------------------------------------------------
export async function getSupplierPaymentsFromFirestore(): Promise<SupplierPaymentEntry[] | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.SUPPLIER_PAYMENTS));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SupplierPaymentEntry);
  } catch (err) {
    console.warn('Could not read supplier payments from Firestore:', err);
    return null;
  }
}

export async function saveSupplierPaymentToFirestore(entry: SupplierPaymentEntry): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const cleaned = sanitizeForFirestore(entry);
    await setDoc(doc(db, COLLECTIONS.SUPPLIER_PAYMENTS, entry.id), cleaned, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save supplier payment to Firestore:', err);
    return false;
  }
}

// -----------------------------------------------------------------------------
// Share Events Tracker
// -----------------------------------------------------------------------------
export async function getShareEventsFromFirestore(): Promise<ShareEvent[] | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.SHARE_EVENTS));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ShareEvent);
  } catch (err) {
    console.warn('Could not read share events from Firestore:', err);
    return null;
  }
}

export async function saveShareEventToFirestore(event: ShareEvent): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const cleaned = sanitizeForFirestore(event);
    await setDoc(doc(db, COLLECTIONS.SHARE_EVENTS, event.id), cleaned, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save share event to Firestore:', err);
    return false;
  }
}

// -----------------------------------------------------------------------------
// ONE-CLICK SYNC ALL MASTER DATA TO FIRESTORE
// Automatically creates all collections on-the-fly!
// -----------------------------------------------------------------------------
export async function syncAllMasterDataToFirestore(params: {
  companySettings: CompanySettings;
  authUsers: AuthUser[];
  hotels: Hotel[];
  vehicles: Vehicle[];
  tripTemplates: TripTemplate[];
  clausePresets: TripClausePreset[];
  destinations?: Destination[];
  suppliers?: Supplier[];
  leads?: Lead[];
  quotations?: Quotation[];
  customerPayments?: CustomerPayment[];
  supplierPayments?: SupplierPaymentEntry[];
}): Promise<{
  success: boolean;
  message: string;
  collectionsWritten: string[];
  error?: string;
}> {
  if (!isFirebaseConfigured || !db) {
    return {
      success: false,
      message: 'Firebase is not initialized. Please verify your environment variables.',
      collectionsWritten: [],
    };
  }

  const collectionsWritten: string[] = [];

  try {
    // 1. Settings (collection: agency_settings, doc: default)
    await saveCompanySettingsToFirestore(params.companySettings);
    collectionsWritten.push(COLLECTIONS.SETTINGS);

    // 2. Users (collection: users)
    for (const u of params.authUsers) {
      await saveAuthUserToFirestore(u);
    }
    if (params.authUsers.length > 0) collectionsWritten.push(COLLECTIONS.USERS);

    // 3. Hotels (collection: hotels)
    for (const h of params.hotels) {
      await saveHotelToFirestore(h);
    }
    if (params.hotels.length > 0) collectionsWritten.push(COLLECTIONS.HOTELS);

    // 4. Vehicles (collection: vehicles)
    for (const v of params.vehicles) {
      await saveVehicleToFirestore(v);
    }
    if (params.vehicles.length > 0) collectionsWritten.push(COLLECTIONS.VEHICLES);

    // 5. Trip Templates (collection: trip_templates)
    for (const t of params.tripTemplates) {
      await saveTripTemplateToFirestore(t);
    }
    if (params.tripTemplates.length > 0) collectionsWritten.push(COLLECTIONS.TRIP_TEMPLATES);

    // 6. Clause Presets (collection: clause_presets)
    for (const p of params.clausePresets) {
      await saveClausePresetToFirestore(p);
    }
    if (params.clausePresets.length > 0) collectionsWritten.push(COLLECTIONS.CLAUSE_PRESETS);

    // 7. Destinations (collection: destinations)
    if (params.destinations && params.destinations.length > 0) {
      for (const d of params.destinations) {
        await saveDestinationToFirestore(d);
      }
      collectionsWritten.push(COLLECTIONS.DESTINATIONS);
    }

    // 8. Suppliers (collection: suppliers)
    if (params.suppliers && params.suppliers.length > 0) {
      for (const s of params.suppliers) {
        await saveSupplierToFirestore(s);
      }
      collectionsWritten.push(COLLECTIONS.SUPPLIERS);
    }

    // 9. Leads (if any)
    if (params.leads && params.leads.length > 0) {
      for (const l of params.leads) {
        await saveLeadToFirestore(l);
      }
      collectionsWritten.push(COLLECTIONS.LEADS);
    }

    // 10. Quotations (if any)
    if (params.quotations && params.quotations.length > 0) {
      for (const q of params.quotations) {
        await saveQuotationToFirestore(q);
      }
      collectionsWritten.push(COLLECTIONS.QUOTATIONS);
    }

    // 11. Customer Payments (if any)
    if (params.customerPayments && params.customerPayments.length > 0) {
      for (const cp of params.customerPayments) {
        await saveCustomerPaymentToFirestore(cp);
      }
      collectionsWritten.push(COLLECTIONS.CUSTOMER_PAYMENTS);
    }

    // 12. Supplier Payments (if any)
    if (params.supplierPayments && params.supplierPayments.length > 0) {
      for (const sp of params.supplierPayments) {
        await saveSupplierPaymentToFirestore(sp);
      }
      collectionsWritten.push(COLLECTIONS.SUPPLIER_PAYMENTS);
    }

    return {
      success: true,
      message: `Successfully synchronized ${collectionsWritten.length} collections to Cloud Firestore!`,
      collectionsWritten,
    };
  } catch (err: any) {
    console.error('Error during Firestore batch sync:', err);
    return {
      success: false,
      message: err.message || 'Firestore write failed. Check your Firebase Security Rules.',
      collectionsWritten,
      error: err.code || err.message,
    };
  }
}
