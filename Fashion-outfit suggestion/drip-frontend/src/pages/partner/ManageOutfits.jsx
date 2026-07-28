/**
 * @fileoverview Manage outfits page for partners to view and edit their outfits.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, Trash2, Star, Eye, Plus, AlertCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getMyOutfits, updateOutfit, deleteOutfit, toggleFeatured } from '../../api/outfit.api'
import { formatPrice } from '../../utils/formatPrice'
import { parseApiError } from '../../utils/parseApiError'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'

const ManageOutfits = () => {
  const queryClient = useQueryClient()
  const [editingOutfit, setEditingOutfit] = useState(null)
  const [deletingOutfit, setDeletingOutfit] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', price: '', description: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['my-outfits'],
    queryFn: async () => {
      const response = await getMyOutfits({ limit: 100 })
      return response.data.data.outfits
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateOutfit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-outfits'])
      toast.success('Outfit updated')
      setEditingOutfit(null)
    },
    onError: (error) => {
      toast.error(parseApiError(error).message)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteOutfit,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-outfits'])
      toast.success('Outfit deleted')
      setDeletingOutfit(null)
    },
    onError: (error) => {
      toast.error(parseApiError(error).message)
    }
  })

  const featuredMutation = useMutation({
    mutationFn: toggleFeatured,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-outfits'])
      toast.success('Featured status updated')
    }
  })

  const outfits = data || []

  const handleEdit = (outfit) => {
    setEditingOutfit(outfit)
    setEditForm({
      title: outfit.title,
      price: outfit.price,
      description: outfit.description || ''
    })
  }

  const handleUpdate = () => {
    updateMutation.mutate({
      id: editingOutfit._id,
      data: editForm
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Outfits</h1>
        <Link to="/dashboard/upload">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Upload New
          </Button>
        </Link>
      </div>

      {outfits.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 mb-4">No outfits uploaded yet</p>
          <Link to="/dashboard/upload">
            <Button>Upload Your First Outfit</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {outfits.map(outfit => (
            <div
              key={outfit._id}
              className="bg-white dark:bg-dark-card rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800"
            >
              {/* Video Thumbnail */}
              <div className="relative aspect-[9/16] bg-gray-100">
                <img
                  src={outfit.video?.thumbnailUrl || outfit.images?.[0]?.url}
                  alt={outfit.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Link to={`/outfit/${outfit._id}`}>
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <Eye className="w-5 h-5" />
                    </button>
                  </Link>
                </div>
                {outfit.featured && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
                    FEATURED
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold truncate">{outfit.title}</h3>
                <p className="text-brand font-bold">{formatPrice(outfit.price)}</p>

                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <span>{outfit.likesCount || 0} likes</span>
                  <span>•</span>
                  <span>{outfit.viewsCount || 0} views</span>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(outfit)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-dark-surface rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => featuredMutation.mutate(outfit._id)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      outfit.featured
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 dark:bg-dark-surface hover:bg-gray-200'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${outfit.featured ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => setDeletingOutfit(outfit)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingOutfit}
        onClose={() => setEditingOutfit(null)}
        title="Edit Outfit"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
          />
          <Input
            label="Price (PKR)"
            type="number"
            value={editForm.price}
            onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
          />
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 bg-white dark:bg-dark-surface"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setEditingOutfit(null)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleUpdate}
              loading={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deletingOutfit}
        onClose={() => setDeletingOutfit(null)}
        title="Delete Outfit?"
      >
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete "{deletingOutfit?.title}"? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeletingOutfit(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => deleteMutation.mutate(deletingOutfit._id)}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ManageOutfits
