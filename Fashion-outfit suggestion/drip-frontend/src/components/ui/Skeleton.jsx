/**
 * @fileoverview Skeleton loading placeholder component.
 * @param {Object} props
 * @param {string} [props.variant='rectangle'] - Skeleton shape
 * @param {string} [props.width] - Custom width
 * @param {string} [props.height] - Custom height
 * @param {string} [props.className] - Additional classes
 */

const Skeleton = ({
  variant = 'rectangle',
  width,
  height,
  className = '',
}) => {
  const baseStyles = 'animate-pulse bg-gray-200 dark:bg-dark-card'

  const variants = {
    rectangle: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded',
  }

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

export default Skeleton
