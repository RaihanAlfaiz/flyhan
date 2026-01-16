/**
 * Refund Policy Calculator
 * Calculates refund percentage based on time before departure
 */

export interface RefundCalculation {
  originalAmount: number;
  refundPercent: number;
  refundAmount: number;
  policyDescription: string;
}

/**
 * Calculate refund amount based on departure time
 * Policy:
 * - 24+ hours before: 100% refund
 * - 12-24 hours before: 75% refund
 * - 6-12 hours before: 50% refund
 * - 0-6 hours before: 25% refund
 * - After departure: 0% refund
 */
export function calculateRefund(
  originalAmount: number,
  departureDate: Date
): RefundCalculation {
  const now = new Date();
  const departure = new Date(departureDate);
  const hoursUntilDeparture =
    (departure.getTime() - now.getTime()) / (1000 * 60 * 60);

  let refundPercent: number;
  let policyDescription: string;

  if (hoursUntilDeparture < 0) {
    // Already departed
    refundPercent = 0;
    policyDescription = "Penerbangan sudah berangkat - tidak ada refund";
  } else if (hoursUntilDeparture < 6) {
    refundPercent = 25;
    policyDescription = "Kurang dari 6 jam sebelum keberangkatan - refund 25%";
  } else if (hoursUntilDeparture < 12) {
    refundPercent = 50;
    policyDescription = "6-12 jam sebelum keberangkatan - refund 50%";
  } else if (hoursUntilDeparture < 24) {
    refundPercent = 75;
    policyDescription = "12-24 jam sebelum keberangkatan - refund 75%";
  } else {
    refundPercent = 100;
    policyDescription = "Lebih dari 24 jam sebelum keberangkatan - refund 100%";
  }

  const refundAmount = Math.floor((originalAmount * refundPercent) / 100);

  return {
    originalAmount,
    refundPercent,
    refundAmount,
    policyDescription,
  };
}

/**
 * Format currency to IDR
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
