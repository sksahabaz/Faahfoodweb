// Display formatting for values that come from the API (prices are BigDecimal numbers).
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 })

/** 229 → "₹229", 229.5 → "₹229.5"; null when the value is missing. */
export function formatPrice(value) {
  const number = Number(value)
  return value == null || Number.isNaN(number) ? null : inr.format(number)
}

export const formatRating = (rating) => (rating == null || Number.isNaN(Number(rating)) ? null : Number(rating).toFixed(1))
export const formatMinutes = (minutes) => (minutes > 0 ? `${minutes} min` : null)
