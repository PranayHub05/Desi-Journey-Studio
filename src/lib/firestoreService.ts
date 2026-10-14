import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { CompanySettings, Lead, Quotation, Hotel, Vehicle, AuthUser, TripClausePreset } from '../types';

export const COLLECTIONS = {
  SETTINGS: 'agency_settings',
  LEADS: 'leads',
  QUOTATIONS: 'quotations',
  HOTELS: 'hotels',
  VEHICLES: 'vehicles',
  USERS: 'users',
  CLAUSE_PRESETS: 'clause_presets',
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
