import {
  CostingCalculation,
  CostingItem,
  Hotel,
  ItineraryDay,
  MealPlanCode,
  Quotation,
  QuotationCustomization,
  Vehicle,
} from '../types';

/**
 * Format numbers according to the Indian numbering system standard (e.g. ₹1,57,500).
 */
export function formatINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  const isNegative = amount < 0;
  const rounded = Math.round(Math.abs(amount));
  const s = rounded.toString();

  if (s.length <= 3) {
    return `${isNegative ? '-' : ''}₹${s}`;
  }

  const lastThree = s.substring(s.length - 3);
  const otherNumbers = s.substring(0, s.length - 3);
  const withCommas = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');

  return `${isNegative ? '-' : ''}₹${withCommas},${lastThree}`;
}

/**
 * Standard Indian date formatter: DD Mon YYYY (e.g. 18 Oct 2026)
 */
export function formatIndianDate(dateString: string | undefined): string {
  if (!dateString) return '';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Validate and calculate dates & nights duration.
 * Rule: 5 Nights = 6 Days
 */
export function calculateTripDuration(
  startDateStr: string,
  endDateStr: string
): { nights: number; days: number; isValid: boolean; error?: string } {
  if (!startDateStr || !endDateStr) {
    return { nights: 0, days: 0, isValid: false, error: 'Start and end dates are required' };
  }

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { nights: 0, days: 0, isValid: false, error: 'Invalid date format' };
  }

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      nights: 0,
      days: 0,
      isValid: false,
      error: 'End date cannot be earlier than start date',
    };
  }

  // Same day trip is 0 nights, 1 day. Multi-day trip: N nights, N+1 days.
  const nights = diffDays;
  const days = nights === 0 ? 1 : nights + 1;

  return { nights, days, isValid: true };
}

/**
 * Add days to a YYYY-MM-DD date string.
 */
export function addDaysToDate(dateStr: string, daysToAdd: number): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + daysToAdd);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Calculate estimated hotel accommodation wholesale cost for an itinerary day.
 */
export function calculateHotelDayCost(
  hotel: Hotel | undefined,
  roomCategory: string,
  mealPlan: MealPlanCode,
  roomsCount: number,
  adultsCount: number,
  extraBedsCount: number = 0
): { cost: number; isCustomRate: boolean; description: string } {
  if (!hotel) {
    return {
      cost: 0,
      isCustomRate: true,
      description: 'No hotel selected',
    };
  }

  const matchingRate = hotel.rates.find(
    (r) =>
      r.roomCategory.toLowerCase() === roomCategory.toLowerCase() &&
      r.mealPlan === mealPlan
  ) || hotel.rates.find((r) => r.mealPlan === mealPlan) || hotel.rates[0];

  if (!matchingRate) {
    // Default estimated rate fallback
    const fallbackRate = 3500;
    return {
      cost: fallbackRate * roomsCount,
      isCustomRate: true,
      description: `Estimated custom rate for ${roomCategory} (${mealPlan})`,
    };
  }

  // Base double occupancy for each room
  let totalForDay = matchingRate.doubleOccupancyRate * roomsCount;

  // Extra bed charges for extra adults
  if (extraBedsCount > 0) {
    const extraBedRate = matchingRate.extraBedAdultRate || matchingRate.doubleOccupancyRate * 0.35;
    totalForDay += extraBedRate * extraBedsCount;
  }

  return {
    cost: totalForDay,
    isCustomRate: false,
    description: `${hotel.name} - ${matchingRate.roomCategory} (${mealPlan}) x ${roomsCount} Room(s)`,
  };
}

/**
 * Calculate estimated transport cost for a tour.
 */
export function calculateVehicleTourCost(
  vehicle: Vehicle | undefined,
  durationDays: number,
  totalEstimatedKm: number = 0,
  manualRateOverride?: number
): { cost: number; breakdownNote: string } {
  if (!vehicle) {
    return { cost: 0, breakdownNote: 'No vehicle selected' };
  }

  if (manualRateOverride !== undefined && manualRateOverride > 0) {
    return {
      cost: manualRateOverride,
      breakdownNote: `Manual transport package override: ${vehicle.displayName}`,
    };
  }

  let totalCost = 0;
  let note = '';

  switch (vehicle.pricingModel) {
    case 'per_day': {
      const rentalCost = vehicle.baseRate * durationDays;
      const driverAllowance = vehicle.driverAllowancePerDay * durationDays;
      const tollsTaxes = vehicle.tollsStateTaxEstimate;
      totalCost = rentalCost + driverAllowance + tollsTaxes;
      note = `${vehicle.displayName} @ ₹${vehicle.baseRate}/day x ${durationDays} days + Driver allowance (₹${driverAllowance}) + Tolls/State tax (₹${tollsTaxes})`;
      break;
    }
    case 'per_km': {
      const minKm = (vehicle.minKmPerDay || 250) * durationDays;
      const billedKm = Math.max(minKm, totalEstimatedKm);
      const kmCost = billedKm * (vehicle.perKmRate || 18);
      const driverAllowance = vehicle.driverAllowancePerDay * durationDays;
      const tollsTaxes = vehicle.tollsStateTaxEstimate;
      totalCost = kmCost + driverAllowance + tollsTaxes;
      note = `${vehicle.displayName} @ ₹${vehicle.perKmRate}/km x ${billedKm} km (min ${minKm} km) + Driver (₹${driverAllowance}) + Tolls (₹${tollsTaxes})`;
      break;
    }
    case 'route_package': {
      totalCost = vehicle.baseRate + vehicle.tollsStateTaxEstimate;
      note = `${vehicle.displayName} Fixed Route Package Rate + Tolls/Permits (₹${vehicle.tollsStateTaxEstimate})`;
      break;
    }
    case 'manual_override':
    default: {
      totalCost = vehicle.baseRate;
      note = `${vehicle.displayName} Standard package base cost`;
      break;
    }
  }

  return { cost: Math.round(totalCost), breakdownNote: note };
}

/**
 * Comprehensive Tour Costing Engine:
 * Evaluates itemized supplier wholesale costs, calculates agency gross margin,
 * computes Tour Operator GST (5% SAC 998555 or custom), applies discount,
 * and derives Per-Adult sharing price and advance deposit.
 */
export function calculateTourCosting(
  items: CostingItem[],
  options: {
    markupType: 'percentage' | 'fixed_inr';
    markupValue: number;
    gstEnabled: boolean;
    gstRatePercentage?: number;
    discountAmount?: number;
    adultsCount: number;
    advancePercentage?: number;
  }
): CostingCalculation {
  const {
    markupType,
    markupValue,
    gstEnabled,
    gstRatePercentage = 5,
    discountAmount = 0,
    adultsCount,
    advancePercentage = 30,
  } = options;

  const totalSupplierCost = items.reduce((sum, item) => sum + (Number(item.supplierCost) || 0), 0);

  let grossProfitAmount = 0;
  if (markupType === 'percentage') {
    grossProfitAmount = Math.round((totalSupplierCost * markupValue) / 100);
  } else {
    grossProfitAmount = Math.round(markupValue);
  }

  const basePackageSellingPrice = totalSupplierCost + grossProfitAmount;

  let gstAmount = 0;
  if (gstEnabled) {
    gstAmount = Math.round((basePackageSellingPrice * gstRatePercentage) / 100);
  }

  const finalSellingPrice = Math.max(0, basePackageSellingPrice + gstAmount - discountAmount);

  const safeAdults = Math.max(1, adultsCount);
  const pricePerAdult = Math.round(finalSellingPrice / safeAdults);

  const advancePercentageRequired = advancePercentage;
  const advanceAmountRequired = Math.round((finalSellingPrice * advancePercentageRequired) / 100);
  const balanceDueAmount = finalSellingPrice - advanceAmountRequired;

  return {
    totalSupplierCost,
    markupType,
    markupValue,
    grossProfitAmount,
    basePackageSellingPrice,
    gstEnabled,
    gstRatePercentage,
    gstAmount,
    discountAmount,
    finalSellingPrice,
    pricePerAdult,
    advancePercentageRequired,
    advanceAmountRequired,
    balanceDueAmount,
  };
}

/**
 * Apply privacy and disclosure masking rules to create a client proposal snapshot.
 *
 * Pre-advance quotation mode:
 * - Hides explicit hotel names; replaces with e.g. "Selected 4-Star Premium Resort, Mall Road Area or Similar"
 * - Hides driver details and vehicle registration numbers
 * - Completely hides wholesale supplier costs and internal agency margins
 *
 * Confirmed trip mode:
 * - When enabled by staff, reveals confirmed hotel names and vehicle/chauffeur details.
 */
export function sanitizeQuotationForCustomer(
  quote: Quotation,
  hotelsMaster: Hotel[] = []
): {
  sanitizedQuote: Quotation;
  isPreAdvanceMasked: boolean;
} {
  const isPreAdvance = quote.customization.disclosureMode === 'masked';
  const showExactHotels = !isPreAdvance && quote.customization.showExactHotelNames;
  const showDriverDetails = !isPreAdvance && quote.customization.showDriverVehicleDetails;

  const sanitizedDays: ItineraryDay[] = quote.days.map((day) => {
    let displayHotelName = day.customHotelName;

    if (!showExactHotels) {
      const hotelObj = hotelsMaster.find((h) => h.id === day.hotelId);
      if (hotelObj?.maskedCategoryName) {
        displayHotelName = hotelObj.maskedCategoryName;
      } else if (hotelObj?.starCategory) {
        displayHotelName = `${hotelObj.starCategory} Luxury Property or Similar (${day.hotelDestination})`;
      } else {
        displayHotelName = `Comfortable 3-Star / 4-Star Selected Hotel or Similar (${day.hotelDestination})`;
      }
    }

    return {
      ...day,
      customHotelName: displayHotelName,
      confidentialOpsNotes: undefined, // Always stripped from customer documents
    };
  });

  let sanitizedVehicleName = quote.vehicleName;
  if (!showDriverDetails) {
    // If vehicle has specific license or driver name, sanitize to general class
    sanitizedVehicleName = quote.customVehicleName || quote.vehicleName || 'Private AC Tourist Vehicle';
  }

  // Costing items wholesale rates are strictly excluded; only final selling price and GST are disclosed
  const clientSafeCosting: CostingCalculation = {
    ...quote.costing,
    totalSupplierCost: 0,
    grossProfitAmount: 0,
    markupValue: 0,
  };

  const sanitizedQuote: Quotation = {
    ...quote,
    days: sanitizedDays,
    vehicleName: sanitizedVehicleName,
    costingItems: [], // Internal wholesale line items never passed to customer
    costing: clientSafeCosting,
  };

  return {
    sanitizedQuote,
    isPreAdvanceMasked: isPreAdvance,
  };
}

/**
 * Helper to build prefilled WhatsApp message for customer sharing.
 */
export function generateWhatsAppMessage(
  quote: Quotation,
  publicQuoteUrl: string,
  agencyName: string = 'Desi Journey'
): string {
  const greeting = `Namaste ${quote.guestName}! 🙏`;
  const intro = `Here is your customized travel proposal for *${quote.tripTitle}* curated by ${agencyName}.`;
  const highlights = [
    `📍 *Route:* ${quote.destinationsSummary}`,
    `🗓️ *Dates:* ${formatIndianDate(quote.startDate)} to ${formatIndianDate(quote.endDate)} (${quote.durationNights}N / ${quote.durationDays}D)`,
    `👥 *Travellers:* ${quote.adults} Adults${quote.children > 0 ? `, ${quote.children} Children` : ''}`,
    `🚗 *Vehicle:* ${quote.vehicleName}`,
    `💰 *Package Total:* ${formatINR(quote.costing.finalSellingPrice)} ${quote.costing.gstEnabled ? '(incl. 5% GST)' : '(excl. GST)'}`,
    `👉 *Per Adult:* ${formatINR(quote.costing.pricePerAdult)}`,
    `📌 *Advance to Confirm:* ${formatINR(quote.costing.advanceAmountRequired)} (${quote.costing.advancePercentageRequired}%)`,
  ].join('\n');

  const link = `🔗 *View Complete Interactive Itinerary & Quote:* \n${publicQuoteUrl}`;
  const closing = `Feel free to reply here if you'd like any modifications in hotels or sightseeing. We look forward to hosting your journey! ✨\n— *Team ${agencyName}*`;

  return `${greeting}\n\n${intro}\n\n${highlights}\n\n${link}\n\n${closing}`;
}
