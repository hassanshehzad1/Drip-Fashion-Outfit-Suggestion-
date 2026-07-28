/**
 * @fileoverview Badge component for status indicators and labels.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} [props.variant='default'] - Badge color variant
 * @param {string} [props.size='sm'] - Badge size
 */

const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const variants = {
    default: 'bg-gray-100 dark:bg-dark-surface text-gray-800 dark:text-gray-200',
    primary: 'bg-brand/10 text-brand',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}

export default Badge
