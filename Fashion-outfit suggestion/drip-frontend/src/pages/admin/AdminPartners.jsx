/**
 * @fileoverview Admin Partners management page.
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Check, X, Shield, ShieldAlert, MoreVertical, X as CloseIcon } from 'lucide-react'
import { getAdminPartners, getAdminPartnerDetail, approvePartner, rejectPartner, banPartner, unbanPartner } from '../../api/admin.api'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

const AdminPartners = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedPartnerId, setSelectedPartnerId] = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminPartners', searchQuery, filterStatus],
    queryFn: async () => {
      const params = {}
      if (searchQuery) params.q = searchQuery
      if (filterStatus === 'approved') params.isApproved = 'true'
      if (filterStatus === 'pending') params.isApproved = 'false'
      if (filterStatus === 'active') params.isActive = 'true'
      if (filterStatus === 'inactive') params.isActive = 'false'
      const response = await getAdminPartners(params)
      return response.data
    }
  })

  const approveMutation = useMutation({
    mutationFn: approvePartner,
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPartners'])
    }
  })

  const rejectMutation = useMutation({
    mutationFn: ({ partnerId, reason }) => rejectPartner(partnerId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPartners'])
    }
  })

  const banMutation = useMutation({
    mutationFn: banPartner,
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPartners'])
    }
  })

  const unbanMutation = useMutation({
    mutationFn: unbanPartner,
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPartners'])
    }
  })

  const handleApprove = (partnerId) => {
    if (window.confirm('Are you sure you want to approve this partner?')) {
      approveMutation.mutate(partnerId)
    }
  }

  const handleReject = (partnerId) => {
    const reason = window.prompt('Please enter the reason for rejection:')
    if (reason) {
      rejectMutation.mutate({ partnerId, reason })
    }
  }

  const handleBan = (partnerId) => {
    const reason = window.prompt('Please enter the reason for banning (optional):')
    banMutation.mutate(partnerId)
  }

  const handleUnban = (partnerId) => {
    if (window.confirm('Are you sure you want to unban this partner?')) {
      unbanMutation.mutate(partnerId)
    }
  }

  const partners = data?.data?.partners || []
  const pagination = data?.pagination || {}

  const { data: partnerDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['adminPartnerDetail', selectedPartnerId],
    queryFn: async () => {
      const response = await getAdminPartnerDetail(selectedPartnerId)
      return response.data
    },
    enabled: !!selectedPartnerId
  })

  const handleRowClick = (partnerId) => {
    setSelectedPartnerId(partnerId)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Error loading partners: {error.message}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Partners Management</h1>
        
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="all">All Partners</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="text-sm text-gray-500">
          Showing {partners.length} of {pagination.total || 0} partners
        </div>
      </div>

      {partners.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No partners found
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {partners.map((partner) => (
                <tr 
                  key={partner._id}
                  onClick={() => handleRowClick(partner._id)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {partner.logo ? (
                          <img src={partner.logo} alt={partner.brandName} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-gray-500 font-medium">
                            {partner.brandName?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{partner.brandName}</div>
                        <div className="text-sm text-gray-500">{partner.followersCount || 0} followers</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {partner.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                      {partner.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {partner.isApproved ? (
                        <Badge variant="success" size="sm">Approved</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">Pending</Badge>
                      )}
                      {partner.isActive ? (
                        <Badge variant="default" size="sm">Active</Badge>
                      ) : (
                        <Badge variant="danger" size="sm">Inactive</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{partner.outfitsCount || 0} outfits</div>
                    <div>{partner.ordersCount || 0} orders</div>
                    <div>${partner.totalRevenue?.toFixed(2) || 0} revenue</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {!partner.isApproved && (
                        <>
                          <button
                            onClick={() => handleApprove(partner._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReject(partner._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {partner.isActive ? (
                        <button
                          onClick={() => handleBan(partner._id)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Ban"
                        >
                          <ShieldAlert className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnban(partner._id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Unban"
                        >
                          <Shield className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Partner Detail Modal */}
      {selectedPartnerId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Partner Details</h2>
              <button
                onClick={() => setSelectedPartnerId(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : partnerDetail?.data?.partner ? (
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {partnerDetail.data.partner.logo?.url ? (
                      <img src={partnerDetail.data.partner.logo.url} alt={partnerDetail.data.partner.brandName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-gray-500 font-medium text-2xl">
                        {partnerDetail.data.partner.brandName?.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{partnerDetail.data.partner.brandName}</h3>
                    <p className="text-gray-500">{partnerDetail.data.partner.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={partnerDetail.data.partner.isApproved ? 'success' : 'warning'}>
                        {partnerDetail.data.partner.isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                      <Badge variant={partnerDetail.data.partner.isActive ? 'default' : 'danger'}>
                        {partnerDetail.data.partner.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-semibold capitalize">{partnerDetail.data.partner.category}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-semibold">{partnerDetail.data.partner.phone || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-semibold">{partnerDetail.data.partner.address || 'Not set'}</p>
                  </div>
                </div>

                {partnerDetail.data.partner.description && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">Description</p>
                    <p className="text-gray-700">{partnerDetail.data.partner.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Followers</p>
                    <p className="text-2xl font-bold">{partnerDetail.data.partner.followersCount || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Outfits</p>
                    <p className="text-2xl font-bold">{partnerDetail.data.stats?.outfits || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Orders</p>
                    <p className="text-2xl font-bold">{partnerDetail.data.stats?.orders || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="text-2xl font-bold">${partnerDetail.data.stats?.revenue?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  <p>Joined: {new Date(partnerDetail.data.partner.createdAt).toLocaleDateString()}</p>
                  <p>Last Login: {partnerDetail.data.partner.lastLogin ? new Date(partnerDetail.data.partner.lastLogin).toLocaleString() : 'Never'}</p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                Failed to load partner details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPartners
