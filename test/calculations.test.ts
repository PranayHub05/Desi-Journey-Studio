import assert from 'node:assert';
import test from 'node:test';
import {
  formatINR,
  calculateTripDuration,
  calculateTourCosting,
  sanitizeQuotationForCustomer,
  formatIndianDate,
} from '../src/lib/calculations.js';
import { Quotation, Hotel } from '../src/types/index.js';

test('formatINR formats numbers with Indian comma grouping', () => {
  assert.strictEqual(formatINR(0), '₹0');
  assert.strictEqual(formatINR(500), '₹500');
  assert.strictEqual(formatINR(1500), '₹1,500');
  assert.strictEqual(formatINR(157500), '₹1,57,500');
  assert.strictEqual(formatINR(1250000), '₹12,50,000');
});

test('calculateTripDuration correctly ensures nights and days consistency', () => {
  // 5 Nights = 6 Days
  const res = calculateTripDuration('2026-10-18', '2026-10-23');
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.nights, 5);
  assert.strictEqual(res.days, 6);

  // Invalid inverted dates
  const invalid = calculateTripDuration('2026-10-23', '2026-10-18');
  assert.strictEqual(invalid.isValid, false);
  assert.strictEqual(invalid.error, 'End date cannot be earlier than start date');
});

test('calculateTourCosting handles supplier sum, markup %, GST toggle, and advance required', () => {
  const mockItems = [
    { id: '1', category: 'Accommodation' as const, title: 'Shimla Hotel 2N', supplierCost: 10000 },
    { id: '2', category: 'Accommodation' as const, title: 'Manali Hotel 3N', supplierCost: 18000 },
    { id: '3', category: 'Transport' as const, title: 'Innova Crysta 6 Days', supplierCost: 22000 },
  ];

  // Total wholesale cost = 50,000
  // 20% markup = 10,000 => base selling = 60,000
  // 5% GST on 60,000 = 3,000
  // Final selling price = 63,000
  // 2 Adults => Per Adult = 31,500
  // 30% advance required = 18,900
  const result = calculateTourCosting(mockItems, {
    markupType: 'percentage',
    markupValue: 20,
    gstEnabled: true,
    gstRatePercentage: 5,
    discountAmount: 0,
    adultsCount: 2,
    advancePercentage: 30,
  });

  assert.strictEqual(result.totalSupplierCost, 50000);
  assert.strictEqual(result.grossProfitAmount, 10000);
  assert.strictEqual(result.basePackageSellingPrice, 60000);
  assert.strictEqual(result.gstAmount, 3000);
  assert.strictEqual(result.finalSellingPrice, 63000);
  assert.strictEqual(result.pricePerAdult, 31500);
  assert.strictEqual(result.advanceAmountRequired, 18900);
  assert.strictEqual(result.balanceDueAmount, 44100);
});

test('calculateTourCosting handles GST disabled and fixed INR markup', () => {
  const mockItems = [
    { id: '1', category: 'Accommodation' as const, title: 'Hotel', supplierCost: 40000 },
  ];

  const result = calculateTourCosting(mockItems, {
    markupType: 'fixed_inr',
    markupValue: 8000,
    gstEnabled: false,
    discountAmount: 1000,
    adultsCount: 2,
    advancePercentage: 25,
  });

  assert.strictEqual(result.totalSupplierCost, 40000);
  assert.strictEqual(result.grossProfitAmount, 8000);
  assert.strictEqual(result.basePackageSellingPrice, 48000);
  assert.strictEqual(result.gstAmount, 0);
  assert.strictEqual(result.finalSellingPrice, 47000); // 48000 - 1000 discount
  assert.strictEqual(result.pricePerAdult, 23500);
});

test('sanitizeQuotationForCustomer redacts exact hotel names in Pre-Advance mode', () => {
  const mockHotel: Hotel = {
    id: 'h-1',
    name: 'Wildflower Hall, An Oberoi Resort',
    destination: 'Shimla',
    starCategory: '5-Star',
    address: 'Chharabra, Shimla',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    maskedCategoryName: 'Selected 5-Star Luxury Heritage Resort, Shimla or Similar',
    rates: [],
    updatedAt: new Date().toISOString(),
  };

  const rawQuote: Quotation = {
    id: 'q-1',
    quoteNumber: 'DJ-2026-101',
    version: 1,
    guestName: 'Kapoor Family',
    guestPhone: '9876543210',
    tripTitle: 'Himachal Delight',
    destinationsSummary: 'Shimla - Manali',
    routeStops: ['Chandigarh', 'Shimla', 'Manali'],
    startDate: '2026-10-18',
    endDate: '2026-10-23',
    durationNights: 5,
    durationDays: 6,
    adults: 2,
    children: 0,
    infants: 0,
    roomsCount: 1,
    vehicleName: 'Innova Crysta - Driver Ramesh (HP-01-AA-1234)',
    days: [
      {
        id: 'd-1',
        dayNumber: 1,
        date: '2026-10-18',
        dayType: 'Arrival & Transfer',
        title: 'Arrival in Shimla',
        routeTitle: 'Chandigarh to Shimla',
        hotelDestination: 'Shimla',
        hotelId: 'h-1',
        customHotelName: 'Wildflower Hall, An Oberoi Resort',
        mealPlan: 'MAP',
        activities: [],
        breakfastIncluded: false,
        lunchIncluded: false,
        dinnerIncluded: true,
        confidentialOpsNotes: 'Driver secret gate clearance pass #991',
        isTravelEstimate: false,
      },
    ],
    costingItems: [
      { id: 'c-1', category: 'Accommodation', title: 'Wildflower Wholesale', supplierCost: 45000 },
    ],
    costing: {
      totalSupplierCost: 45000,
      markupType: 'fixed_inr',
      markupValue: 15000,
      grossProfitAmount: 15000,
      basePackageSellingPrice: 60000,
      gstEnabled: true,
      gstRatePercentage: 5,
      gstAmount: 3000,
      discountAmount: 0,
      finalSellingPrice: 63000,
      pricePerAdult: 31500,
      advancePercentageRequired: 30,
      advanceAmountRequired: 18900,
      balanceDueAmount: 44100,
    },
    inclusions: [],
    exclusions: [],
    termsAndConditions: [],
    paymentScheduleText: [],
    customization: {
      disclosureMode: 'masked',
      showExactHotelNames: false,
      showDriverVehicleDetails: false,
      showDayWiseDistanceEstimate: true,
      showDetailedDayTimings: true,
      showInclusionsExclusions: true,
      showTermsAndPaymentSchedule: true,
      showBankDetails: true,
      showContactBar: true,
      templateStyle: 'alpine_classic',
    },
    status: 'Draft',
    advanceReceived: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Rohit Sharma',
  };

  const { sanitizedQuote, isPreAdvanceMasked } = sanitizeQuotationForCustomer(rawQuote, [mockHotel]);

  assert.strictEqual(isPreAdvanceMasked, true);
  // Exact hotel name masked
  assert.strictEqual(
    sanitizedQuote.days[0].customHotelName,
    'Selected 5-Star Luxury Heritage Resort, Shimla or Similar'
  );
  // Confidential ops note stripped
  assert.strictEqual(sanitizedQuote.days[0].confidentialOpsNotes, undefined);
  // Supplier wholesale cost array stripped from customer view
  assert.strictEqual(sanitizedQuote.costingItems.length, 0);
  // Internal supplier cost and profit margin zeroed out
  assert.strictEqual(sanitizedQuote.costing.totalSupplierCost, 0);
  assert.strictEqual(sanitizedQuote.costing.grossProfitAmount, 0);
  // But customer price preserved
  assert.strictEqual(sanitizedQuote.costing.finalSellingPrice, 63000);
});
