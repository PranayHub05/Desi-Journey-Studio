export type UserRole = 'admin' | 'sales' | 'ops' | 'finance';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Quotation Draft'
  | 'Quotation Sent'
  | 'Follow-up'
  | 'Negotiation'
  | 'Advance Received'
  | 'Confirmed'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export type LeadSource =
  | 'Website Form'
  | 'WhatsApp'
  | 'Instagram'
  | 'Google Ad'
  | 'Referral / Repeat Guest'
  | 'Direct Call'
  | 'B2B Partner';

export type TripStyle = 'Family Holiday' | 'Honeymoon / Couple' | 'Luxury & Heritage' | 'Adventure & Trek' | 'Corporate / Group';

export interface Lead {
  id: string;
  guestName: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  city?: string;
  source: LeadSource;
  status: LeadStatus;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  durationNights: number;
  durationDays: number;
  adults: number;
  children: number;
  infants?: number;
  childAges?: number[];
  budgetPreference?: string;
  tripStyle?: TripStyle;
  specialRequests?: string;
  assignedTo: string;
  assignedUserName: string;
  nextFollowUpDate?: string;
  nextFollowUpNote?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  notes?: string;
}

export type MealPlanCode = 'EP' | 'CP' | 'MAP' | 'AP';

export interface MealPlanDefinition {
  code: MealPlanCode;
  label: string;
  description: string;
}

export interface HotelRoomRate {
  roomCategory: string; // Deluxe, Super Deluxe, Luxury Valley View, Suite
  mealPlan: MealPlanCode;
  doubleOccupancyRate: number; // Base room tariff (2 adults)
  tripleOccupancyRate?: number; // 3 adults sharing room
  extraBedAdultRate: number;
  childWithBedRate?: number;
  childNoBedRate?: number;
  validFrom?: string;
  validTo?: string;
}

export interface Hotel {
  id: string;
  name: string;
  destination: string;
  starCategory: '2-Star' | '3-Star' | '4-Star' | '5-Star' | 'Boutique / Heritage';
  address: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  imageUrl: string;
  galleryUrls?: string[];
  rates: HotelRoomRate[];
  supplierId?: string;
  supplierName?: string;
  notes?: string;
  maskedCategoryName: string; // e.g. "Selected 4-Star Premium Resort, Mall Road Area or Similar"
  updatedAt: string;
}

export type VehiclePricingModel = 'per_day' | 'per_km' | 'route_package' | 'manual_override';

export interface Vehicle {
  id: string;
  displayName: string; // e.g. Toyota Innova Crysta, Maruti Ertiga, Force Tempo Traveller
  category: 'Sedan' | 'Premium SUV' | 'MUV' | 'Tempo Traveller' | 'Mini Bus' | 'Luxury Coach';
  seatingCapacity: number;
  luggageCapacityNotes: string;
  imageUrl: string;
  pricingModel: VehiclePricingModel;
  baseRate: number; // Per day rate or route package rate
  minKmPerDay?: number; // e.g. 250 km/day
  perKmRate?: number; // e.g. ₹18/km
  driverAllowancePerDay: number; // e.g. ₹400/day
  tollsStateTaxEstimate: number; // State border permits, tolls, green tax
  supplierId?: string;
  supplierName?: string;
  supplierPhone?: string;
  defaultDriverName?: string;
  defaultDriverPhone?: string;
  defaultRegistrationNumber?: string;
  notes?: string;
}

export interface Attraction {
  id: string;
  name: string;
  destination: string;
  category: 'Nature & Viewpoint' | 'Heritage & Temple' | 'Adventure' | 'Cultural / Market' | 'Monastery / Fort';
  description: string;
  suggestedDurationHours: number;
  openingHoursNotes?: string;
  entryFeePerAdult?: number;
  imageUrl?: string;
  isVerified: boolean;
}

export interface Destination {
  id: string;
  name: string;
  stateOrRegion: string;
  overview: string;
  imageUrl: string;
  bestKnownFor: string[];
  attractions: Attraction[];
  suggestedNights: number;
}

export interface RouteConnection {
  from: string;
  to: string;
  distanceKm: number;
  driveTimeHours: number;
  roadConditionNotes?: string;
  isVerified: boolean;
}

export interface TripTemplate {
  id: string;
  title: string;
  region: string;
  suggestedRoute: string[];
  durationNights: number;
  durationDays: number;
  overview: string;
  idealFor: string;
}

export type DayType =
  | 'Arrival & Transfer'
  | 'Local Sightseeing'
  | 'Scenic Transfer'
  | 'Leisure / Free Day'
  | 'Adventure / Excursion'
  | 'Departure';

export interface DayActivity {
  id: string;
  timeSlot?: string; // e.g. "09:30 AM"
  title: string;
  description: string;
  location?: string;
  estimatedDurationHours?: number;
  type: 'Transit' | 'Sightseeing' | 'Activity' | 'Hospitality' | 'Leisure' | 'Adventure' | 'Cultural / Market';
  isEstimate: boolean;
  imageUrl?: string;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  date: string; // YYYY-MM-DD
  dayType: DayType;
  title: string;
  routeTitle: string; // e.g. "Chandigarh to Shimla (115 km / 3.5 hrs)"
  distanceKm?: number;
  driveTimeHours?: number;
  isTravelEstimate: boolean;
  pickupPointNotes?: string;
  hotelDestination: string;
  hotelId?: string;
  customHotelName?: string;
  roomCategory?: string;
  mealPlan: MealPlanCode;
  activities: DayActivity[];
  breakfastIncluded: boolean;
  lunchIncluded: boolean;
  dinnerIncluded: boolean;
  confidentialOpsNotes?: string; // Internal chauffeur notes, permit instructions
  imageUrl?: string;
}

export interface CostingItem {
  id: string;
  category: 'Accommodation' | 'Transport' | 'Activities' | 'Guide / Escort' | 'Permits & Tolls' | 'Miscellaneous';
  title: string;
  supplierCost: number; // Wholesale net cost to agency
  notes?: string;
}

export interface CostingCalculation {
  totalSupplierCost: number;
  markupType: 'percentage' | 'fixed_inr';
  markupValue: number; // e.g. 20% or ₹15,000
  grossProfitAmount: number;
  basePackageSellingPrice: number; // Net cost + markup
  gstEnabled: boolean;
  gstRatePercentage: number; // Default 5% for tour operator SAC 998555
  gstAmount: number;
  discountAmount: number;
  finalSellingPrice: number; // Base selling + GST - discount
  pricePerAdult: number;
  advancePercentageRequired: number; // e.g. 30% or 40%
  advanceAmountRequired: number;
  balanceDueAmount: number;
}

export type DisclosureMode = 'masked' | 'disclosed';

export interface QuotationCustomization {
  disclosureMode: DisclosureMode;
  showExactHotelNames: boolean;
  showDriverVehicleDetails: boolean;
  showDayWiseDistanceEstimate: boolean;
  showDetailedDayTimings: boolean;
  showInclusionsExclusions: boolean;
  showTermsAndPaymentSchedule: boolean;
  showBankDetails: boolean;
  showContactBar: boolean;
  templateStyle: 'alpine_classic' | 'modern_compact' | 'heritage_editorial';
}

export interface Quotation {
  id: string;
  quoteNumber: string; // e.g. "DJ-2026-1042"
  version: number;
  leadId?: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  tripTitle: string;
  destinationsSummary: string;
  routeStops: string[];
  startDate: string;
  endDate: string;
  durationNights: number;
  durationDays: number;
  adults: number;
  children: number;
  infants: number;
  roomsCount: number;
  vehicleId?: string;
  vehicleName: string;
  customVehicleName?: string;
  days: ItineraryDay[];
  costingItems: CostingItem[];
  costing: CostingCalculation;
  inclusions: string[];
  exclusions: string[];
  termsAndConditions: string[];
  paymentScheduleText: string[];
  customization: QuotationCustomization;
  status: 'Draft' | 'Sent' | 'Revised' | 'Confirmed' | 'Archived';
  advanceReceived: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ShareEvent {
  id: string;
  quoteId: string;
  quoteNumber: string;
  channel: 'WhatsApp' | 'PDF Download' | 'Email';
  recipient: string;
  disclosureMode: DisclosureMode;
  version: number;
  timestamp: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: 'Hotel' | 'Transport Fleet' | 'Local Guide' | 'Adventure / Activity' | 'DMC Partner';
  contactPerson: string;
  phone: string;
  email?: string;
  cityOrRegion: string;
  bankAccountDetails?: string;
  upiId?: string;
  notes?: string;
  totalAgreedPayable: number;
  totalPaid: number;
  balanceOutstanding: number;
}

export interface SupplierPaymentEntry {
  id: string;
  supplierId: string;
  supplierName: string;
  quoteId?: string;
  quoteNumber?: string;
  tripTitle?: string;
  amount: number;
  paymentDate: string;
  paymentMode: 'NEFT / RTGS' | 'UPI' | 'Cheque' | 'Cash' | 'Credit Card';
  referenceUtr?: string;
  status: 'Initiated' | 'Completed' | 'Pending Verification';
  notes?: string;
}

export interface CustomerPayment {
  id: string;
  quoteId: string;
  quoteNumber: string;
  guestName: string;
  guestPhone: string;
  amount: number;
  stage: 'Booking Advance (30%)' | 'Second Instalment (40%)' | 'Final Settlement (30%)' | 'Custom';
  paymentDate: string;
  paymentMode: 'UPI' | 'Net Banking / NEFT' | 'Credit / Debit Card' | 'Cash / POS';
  transactionReference: string;
  receiptNumber: string;
  notes?: string;
}

export interface CompanySettings {
  agencyName: string;
  tagline: string;
  logoUrl: string;
  phone: string;
  whatsappSupport: string;
  email: string;
  website: string;
  headOfficeAddress: string;
  gstin: string;
  panNumber: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  upiVpa: string;
  defaultMarkupPercent: number;
  defaultGstPercent: number;
  gstCalculationType: 'exclusive_added' | 'inclusive';
  defaultAdvancePercent: number;
  defaultInclusions: string[];
  defaultExclusions: string[];
  defaultTerms: string[];
}
