import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Trash2, Edit2, Plus, ChevronLeft, ChevronRight, Loader2, Search, X } from 'lucide-react'
import { toast } from 'sonner'

// Types
interface User {
  id: string | number
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: string
}

interface UsersResponse {
  users: User[]
  total: number
  skip: number
  limit: number
}

const fetchUsers = async (skip: number, limit: number, search: string): Promise<UsersResponse> => {
  const { data } = await axios.get(`/api/users?skip=${skip}&limit=${limit}&q=${encodeURIComponent(search)}`)
  return data
}

const deleteUser = async (id: string | number) => {
  const { data } = await axios.delete(`/api/users/${id}`)
  return data
}

const addUser = async (user: Omit<User, 'id'>) => {
  const { data } = await axios.post(`/api/users/add`, user)
  return data
}

const updateUser = async ({ id, ...user }: User) => {
  const { data } = await axios.put(`/api/users/${id}`, user)
  return data
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

export function UsersTable() {
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 400)
  const limit = 5
  const queryClient = useQueryClient()

  // Reset to page 0 on search change
  useEffect(() => { setPage(0) }, [search])

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  
  // Form states
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', gender: 'male' })

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users', page, limit, search],
    queryFn: () => fetchUsers(page * limit, limit, search),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['users', page, limit, search], (oldData: UsersResponse | undefined) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          users: oldData.users.filter(u => u.id !== deletedId),
          total: oldData.total - 1
        }
      })
      toast.success('User deleted successfully')
    },
    onError: () => toast.error('Failed to delete user'),
  })

  const addMutation = useMutation({
    mutationFn: addUser,
    onSuccess: (newUser) => {
      queryClient.setQueryData(['users', page, limit, search], (oldData: UsersResponse | undefined) => {
        if (!oldData) return oldData
        const userToAdd = { ...newUser, id: newUser.id || Date.now() }
        return {
          ...oldData,
          users: [userToAdd, ...oldData.users],
          total: oldData.total + 1
        }
      })
      setIsAddOpen(false)
      toast.success('User added successfully')
    },
    onError: () => toast.error('Failed to add user'),
  })

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['users', page, limit, search], (oldData: UsersResponse | undefined) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          users: oldData.users.map(u => u.id === updatedUser.id ? updatedUser : u)
        }
      })
      setIsEditOpen(false)
      setEditingUser(null)
      toast.success('User updated successfully')
    },
    onError: () => toast.error('Failed to update user'),
  })

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addMutation.mutate(formData)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingUser) {
      updateMutation.mutate({ ...formData, id: editingUser.id })
    }
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
    })
    setIsEditOpen(true)
  }

  if (isError) return <div className="text-red-500 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">Error loading users: {error.message}</div>

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h3 className="text-lg font-semibold shrink-0">User Directory</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setFormData({ firstName: '', lastName: '', email: '', phone: '', gender: 'male' })
              setIsAddOpen(true)
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shrink-0"
          >
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      {/* Search badge */}
      {search && (
        <div className="px-6 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30 text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
          <Search size={14} />
          Showing results for <span className="font-semibold">"{search}"</span>
          <button onClick={() => setSearchInput('')} className="ml-auto text-blue-500 hover:text-blue-700 dark:hover:text-blue-200 flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto min-h-[400px] relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        )}
        
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Phone</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {data?.users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">{user.gender}</div>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.phone}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        toast('Delete this user?', {
                          action: {
                            label: 'Confirm',
                            onClick: () => deleteMutation.mutate(user.id),
                          },
                          cancel: {
                            label: 'Cancel',
                            onClick: () => {},
                          },
                        })
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && data?.users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Search size={32} className="opacity-30" />
                    <p className="font-medium">{search ? `No users found for "${search}"` : 'No users found'}</p>
                    {search && (
                      <button onClick={() => setSearchInput('')} className="text-sm text-blue-500 hover:text-blue-600">
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="font-medium">{data?.skip ? data.skip + 1 : 1}</span> to{' '}
          <span className="font-medium">
            {data ? Math.min(data.skip + limit, data.total) : 0}
          </span>{' '}
          of <span className="font-medium">{data?.total || 0}</span> users
          {search && <span className="ml-1 text-blue-500">(filtered)</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isLoading}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 px-2">
            Page {page + 1}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data || data.skip + limit >= data.total || isLoading}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Modals */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-semibold">{isAddOpen ? 'Add New User' : 'Edit User'}</h3>
            </div>
            <form onSubmit={isAddOpen ? handleAddSubmit : handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false)
                    setIsEditOpen(false)
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending || updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {addMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
