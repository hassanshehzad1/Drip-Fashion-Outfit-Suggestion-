/**
 * @fileoverview Price formatting utilities.
 */

/**
 * Format a number as Pakistani Rupees or specified currency.
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: PKR)
 * @returns {string} Formatted price string
 */
export const formatPrice = (amount, currency = 'PKR') => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: currency === 'PKR' ? 'PKR' : currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format large numbers in compact notation (1K, 1M).
 * @param {number} num - The number to format
 * @returns {string} Compact number string
 */
export const formatCompact = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return String(num)
}
