export const formatPrice = (amount, currency = 'PKR') => {
  return `PKR ${new Intl.NumberFormat('en-PK').format(amount)}`
}

export const formatCompact = (num) => {
  if (num >= 1000000) return `${(num/1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num/1000).toFixed(1)}K`
  return String(num)
}
