export const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds/60)}m`
  if (seconds < 86400) return `${Math.floor(seconds/3600)}h`
  if (seconds < 2592000) return `${Math.floor(seconds/86400)}d`
  return new Date(date).toLocaleDateString()
}
