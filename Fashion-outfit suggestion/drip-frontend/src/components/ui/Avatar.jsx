/**
 * @fileoverview Avatar component with fallback initials.
 * Checks for valid URL before rendering image to prevent broken image flash.
 * @param {Object} props
 * @param {string} [props.src] - Image URL
 * @param {string} [props.alt] - Alt text
 * @param {string} [props.name] - Name for fallback initials
 * @param {string} [props.size='md'] - Avatar size
 */

const Avatar = ({
  src,
  alt = '',
  name = '',
  size = 'md',
  className = '',
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  }

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Check if src is a valid non-empty string before rendering image
  const hasValidImage = src && typeof src === 'string' && src.trim() !== ''

  return (
    <div
      className={`
        ${sizes[size]}
        rounded-full flex items-center justify-center
        bg-gradient-to-br from-brand to-brand-dark text-white font-medium
        overflow-hidden flex-shrink-0
        ${className}
      `}
    >
      {hasValidImage ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials || '?'}</span>
      )}
    </div>
  )
}

export default Avatar
