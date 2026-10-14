import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
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
};

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
    await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
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
    const q = query(collection(db, COLLECTIONS.LEADS), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Lead);
  } catch (err) {
    console.warn('Could not read leads from Firestore:', err);
    return null;
  }
}

export async function saveLeadToFirestore(lead: Lead): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await setDoc(doc(db, COLLECTIONS.LEADS, lead.id), lead, { merge: true });
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

// -----------------------------------------------------------------------------
// Quotations & Proposals
// -----------------------------------------------------------------------------
export async function getQuotationsFromFirestore(): Promise<Quotation[] | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const q = query(collection(db, COLLECTIONS.QUOTATIONS), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Quotation);
  } catch (err) {
    console.warn('Could not read quotations from Firestore:', err);
    return null;
  }
}

export async function saveQuotationToFirestore(quote: Quotation): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await setDoc(doc(db, COLLECTIONS.QUOTATIONS, quote.id), quote, { merge: true });
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
    await setDoc(doc(db, COLLECTIONS.HOTELS, hotel.id), hotel, { merge: true });
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
    await setDoc(doc(db, COLLECTIONS.VEHICLES, vehicle.id), vehicle, { merge: true });
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
    await setDoc(doc(db, COLLECTIONS.TRIP_TEMPLATES, template.id), template, { merge: true });
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
    await setDoc(doc(db, COLLECTIONS.CLAUSE_PRESETS, preset.id), preset, { merge: true });
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
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), user, { merge: true });
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
  leads?: Lead[];
  quotations?: Quotation[];
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

    // 7. Leads (if any)
    if (params.leads && params.leads.length > 0) {
      for (const l of params.leads) {
        await saveLeadToFirestore(l);
      }
      collectionsWritten.push(COLLECTIONS.LEADS);
    }

    // 8. Quotations (if any)
    if (params.quotations && params.quotations.length > 0) {
      for (const q of params.quotations) {
        await saveQuotationToFirestore(q);
      }
      collectionsWritten.push(COLLECTIONS.QUOTATIONS);
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
