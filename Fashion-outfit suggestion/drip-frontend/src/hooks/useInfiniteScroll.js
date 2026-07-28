/**
 * @fileoverview Infinite scroll hook using Intersection Observer.
 */

import { useEffect, useRef } from 'react'

/**
 * Hook to trigger a callback when user scrolls near the end of content.
 * @param {Function} onIntersect - Callback when intersection occurs
 * @param {boolean} hasNextPage - Whether there's more content to load
 * @param {boolean} isFetching - Whether data is currently being fetched
 */
export const useInfiniteScroll = (onIntersect, hasNextPage, isFetching) => {
  const observerRef = useRef(null)
  const targetRef = useRef(null)

  useEffect(() => {
    if (isFetching || !hasNextPage) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersect()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    if (targetRef.current) {
      observerRef.current.observe(targetRef.current)
    }

    return () => observerRef.current?.disconnect()
  }, [onIntersect, hasNextPage, isFetching])

  return targetRef
}
