/**
 * @fileoverview Utility functions for formatting data
 */

/**
 * Format price with currency symbol
 * @param {number} price - Price value
 * @returns {string} Formatted price with Rs prefix
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined || isNaN(price)) {
    return 'Rs 0'
  }
  return `Rs ${Number(price).toLocaleString('en-IN')}`
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
