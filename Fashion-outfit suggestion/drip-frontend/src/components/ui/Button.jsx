/**
 * @fileoverview Reusable Button component with variants and loading state.
 * @param {Object} props
 * @param {string} [props.variant='primary'] - Button style variant
 * @param {string} [props.size='md'] - Button size
 * @param {boolean} [props.loading=false] - Show loading spinner
 * @param {boolean} [props.disabled=false] - Disable button
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 */

import { Loader2 } from 'lucide-react'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-dark shadow-lg shadow-brand/30',
    secondary: 'bg-gray-100 dark:bg-dark-surface text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-dark-card',
    outline: 'border-2 border-brand text-brand hover:bg-brand hover:text-white',
    ghost: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-surface',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  )
}

export default Button
