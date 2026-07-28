/**
 * @fileoverview Authentication hook for protected data fetching.
 */

import { useQuery } from '@tanstack/react-query'
import { getMe, getPartnerMe } from '../api/auth.api'
import useAuthStore from '../stores/authStore'

export const useUser = () => {
  const { isUser, isPartner } = useAuthStore()

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      if (isUser()) {
        const { data } = await getMe()
        return data.data.user
      }
      if (isPartner()) {
        const { data } = await getPartnerMe()
        return data.data.partner
      }
      return null
    },
    enabled: isUser() || isPartner(),
    staleTime: 5 * 60 * 1000,
  })
}
