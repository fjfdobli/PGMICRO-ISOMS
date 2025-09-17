import React from 'react'
import { useState, useEffect } from 'react'
import { Users, UserPlus, Edit2, Mail, Calendar, Shield, Eye, EyeOff, Plus, Search, Filter, MoreVertical, X, AlertTriangle, CheckCircle, Lock, UserCheck, UserX, Clock, Ban } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { usersAPI, authAPI } from '../../lib/api'

const AVAILABLE_MODULES = [
  { id: 'dashboard', label: 'Dashboard', description: 'View system overview and analytics' },
  { id: 'sales', label: 'Sales', description: 'Manage sales orders and transactions' },
  { id: 'purchase-orders', label: 'Purchase Orders', description: 'Handle purchase orders and procurement' },
  { id: 'returns', label: 'Returns & Warranty', description: 'Process returns and warranty claims' },
  { id: 'inventory', label: 'Inventory', description: 'Track and manage inventory levels' },
  { id: 'customers', label: 'Customers', description: 'Manage customer information and relationships' },
  { id: 'suppliers', label: 'Suppliers', description: 'Handle supplier information and contracts' }
]

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'employee', label: 'Employee' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'pending', label: 'Pending Approval' },
]

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg", 
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, type = "danger" }) => {
  const typeStyles = {
    danger: {
      icon: AlertTriangle,
      iconColor: "text-red-500",
      buttonColor: "bg-red-600 hover:bg-red-700"
    },
    success: {
      icon: CheckCircle,
      iconColor: "text-green-500",
      buttonColor: "bg-green-600 hover:bg-green-700"
    }
  }

  const style = typeStyles[type]
  const IconComponent = style.icon

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <IconComponent className={`w-12 h-12 mx-auto mb-4 ${style.iconColor}`} />
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex space-x-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${style.buttonColor}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  )
}


export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [viewingUser, setViewingUser] = useState(null)
  const [approveConfirm, setApproveConfirm] = useState(null)
  const [suspendConfirm, setSuspendConfirm] = useState(null)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [suspendingUser, setSuspendingUser] = useState(null)
  const [suspensionReason, setSuspensionReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [availableModules, setAvailableModules] = useState([])
  const [showPendingOnly, setShowPendingOnly] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [showSuspensionModal, setShowSuspensionModal] = useState(false)
  const [showUnsuspensionModal, setShowUnsuspensionModal] = useState(false)
  const [pendingActionUser, setPendingActionUser] = useState(null)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await usersAPI.getAll()
      console.log('Raw users data from API:', data.data)
      
      // Process each user's allowed_modules field
      const processedUsers = (data.data || []).map(user => {
        const processedUser = { ...user }
        
        console.log(`Processing user ${user.id}:`, user)
        console.log(`Raw allowed_modules for user ${user.id}:`, user.allowed_modules)
        console.log(`Type of allowed_modules for user ${user.id}:`, typeof user.allowed_modules)
        
        // Process allowed_modules to ensure it's an array
        if (processedUser.allowed_modules) {
          if (typeof processedUser.allowed_modules === 'string') {
            try {
              processedUser.allowed_modules = JSON.parse(processedUser.allowed_modules)
              console.log(`Parsed allowed_modules from string for user ${user.id}:`, processedUser.allowed_modules)
            } catch (e) {
              console.log(`Failed to parse allowed_modules for user ${user.id}, setting to default`)
              processedUser.allowed_modules = ['dashboard']
            }
          } else if (!Array.isArray(processedUser.allowed_modules)) {
            console.log(`allowed_modules is not array for user ${user.id}, setting to default`)
            processedUser.allowed_modules = ['dashboard']
          }
        } else {
          console.log(`No allowed_modules found for user ${user.id}, setting to default`)
          processedUser.allowed_modules = ['dashboard']
        }
        
        console.log(`Final processed allowed_modules for user ${user.id}:`, processedUser.allowed_modules)
        return processedUser
      })
      
      console.log('Final processed users array:', processedUsers)
      setUsers(processedUsers)
      setAvailableModules(data.availableModules || AVAILABLE_MODULES.map(m => m.id))
    } catch (error) {
      console.error('Error loading users:', error)
      alert('Error loading users: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadCurrentUser = async () => {
    try {
      const data = await authAPI.getCurrentUser()
      setCurrentUser(data.user)
    } catch (error) {
      console.error('Error loading current user:', error)
    }
  }

  useEffect(() => {
    loadCurrentUser()
    loadUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter(user => {
      const matchesSearch = !searchTerm || 
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRole = !roleFilter || user.account_type === roleFilter
      const matchesStatus = !statusFilter || user.status === statusFilter
      
      return matchesSearch && matchesRole && matchesStatus
    })
    setFilteredUsers(filtered)
  }, [searchTerm, roleFilter, statusFilter, users])

  const handleAdd = async (formData) => {
    try {
      console.log('Creating user with data:', formData)
      console.log('Allowed modules being sent:', formData.allowed_modules)
      const result = await usersAPI.create(formData)
      console.log('User creation result:', result)
      
      if (result.success && result.user) {
        // Process the returned user's allowed_modules the same way as edit
        const newUser = { ...result.user }
        
        console.log('Raw returned new user:', newUser)
        console.log('Raw returned allowed_modules:', newUser.allowed_modules)
        console.log('Type of returned allowed_modules:', typeof newUser.allowed_modules)
        
        // Process allowed_modules to ensure it's an array
        if (newUser.allowed_modules) {
          if (typeof newUser.allowed_modules === 'string') {
            try {
              newUser.allowed_modules = JSON.parse(newUser.allowed_modules)
              console.log('Parsed allowed_modules from string:', newUser.allowed_modules)
            } catch (e) {
              console.log('Failed to parse allowed_modules, setting to default')
              newUser.allowed_modules = ['dashboard']
            }
          } else if (!Array.isArray(newUser.allowed_modules)) {
            console.log('allowed_modules is not array, setting to default')
            newUser.allowed_modules = ['dashboard']
          }
        } else {
          console.log('No allowed_modules found, setting to default')
          newUser.allowed_modules = ['dashboard']
        }
        
        console.log('Final processed new user:', newUser)
        console.log('Final processed allowed_modules:', newUser.allowed_modules)
        
        // Add the new user to the users array
        setUsers(prevUsers => {
          console.log('Adding new user to users array')
          const newUsers = [...prevUsers, newUser]
          console.log('New users array length:', newUsers.length)
          return newUsers
        });
      }
      
      setShowAddModal(false)
      console.log('User creation completed, state should be updated')
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error creating user: ' + error.message)
    }
  }

  // Helper functions to ensure fresh user data
  const handleEditUser = (userId) => {
    console.log('=== handleEditUser called ===')
    console.log('Looking for userId:', userId)
    console.log('Current users array:', users)
    const freshUser = users.find(u => u.id === userId)
    if (freshUser) {
      console.log('Setting editing user with fresh data:', freshUser)
      console.log('Fresh user allowed_modules:', freshUser.allowed_modules)
      setEditingUser(freshUser)
      setShowEditModal(true)
    } else {
      console.log('User not found in users array!')
    }
  }

  const handleViewUser = (userId) => {
    console.log('=== handleViewUser called ===')
    console.log('Looking for userId:', userId)
    console.log('Current users array:', users)
    const freshUser = users.find(u => u.id === userId)
    if (freshUser) {
      console.log('Setting viewing user with fresh data:', freshUser)
      console.log('Fresh user allowed_modules:', freshUser.allowed_modules)
      setViewingUser(freshUser)
      setShowViewModal(true)
    } else {
      console.log('User not found in users array!')
    }
  }

  const handleEdit = async (formData) => {
    try {
      console.log('Updating user with data:', formData)
      console.log('Allowed modules being sent:', formData.allowed_modules)
      const result = await usersAPI.update(editingUser.id, formData)
      console.log('User update result:', result)
      
      if (result.success && result.user) {
        // Process the returned user's allowed_modules the same way backend does
        const updatedUser = { ...result.user }
        
        console.log('Raw returned user:', updatedUser)
        console.log('Raw returned allowed_modules:', updatedUser.allowed_modules)
        console.log('Type of returned allowed_modules:', typeof updatedUser.allowed_modules)
        
        // Process allowed_modules to ensure it's an array
        if (updatedUser.allowed_modules) {
          if (typeof updatedUser.allowed_modules === 'string') {
            try {
              updatedUser.allowed_modules = JSON.parse(updatedUser.allowed_modules)
              console.log('Parsed allowed_modules from string:', updatedUser.allowed_modules)
            } catch (e) {
              console.log('Failed to parse allowed_modules, setting to default')
              updatedUser.allowed_modules = ['dashboard']
            }
          } else if (!Array.isArray(updatedUser.allowed_modules)) {
            console.log('allowed_modules is not array, setting to default')
            updatedUser.allowed_modules = ['dashboard']
          }
        } else {
          console.log('No allowed_modules found, setting to default')
          updatedUser.allowed_modules = ['dashboard']
        }
        
        console.log('Final processed user for state update:', updatedUser)
        console.log('Final processed allowed_modules:', updatedUser.allowed_modules)
        
        // Update the users array immediately with the processed user data
        setUsers(prevUsers => {
          console.log('Before update - prevUsers:', prevUsers)
          const newUsers = prevUsers.map(user => 
            user.id === editingUser.id ? updatedUser : user
          )
          console.log('After update - newUsers:', newUsers)
          console.log('Updated user in array:', newUsers.find(u => u.id === editingUser.id))
          return newUsers
        });
      }
      
      // Clear editing state first
      setEditingUser(null)
      setShowEditModal(false)
      setViewingUser(null) // Also clear viewing state in case it's showing the same user
      setShowViewModal(false)
      
      // Don't reload users since we already updated the state with processed data
      console.log('User update completed, state should be updated')
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user: ' + error.message)
    }
  }

  const handleApproveUser = (userId) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setPendingActionUser(user)
      setShowApprovalModal(true)
      console.log('Set showApprovalModal to true')
    }
  }

  const handleSuspendUser = (userId) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setPendingActionUser(user)
      setShowSuspensionModal(true)
    }
  }

  const handleUnsuspendUser = (userId) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setPendingActionUser(user)
      setShowUnsuspensionModal(true)
    }
  }

  const handleRejectUser = (userId) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setPendingActionUser(user)
      setShowRejectionModal(true)
    }
  }

  // Confirmation handlers
  const confirmApproval = async () => {
    console.log('confirmApproval called, pendingActionUser:', pendingActionUser)
    if (!pendingActionUser) return
    
    try {
      console.log('Calling usersAPI.approve with userId:', pendingActionUser.id)
      await usersAPI.approve(pendingActionUser.id)
      console.log('Approval successful')
      setShowApprovalModal(false)
      setPendingActionUser(null)
      await loadUsers() // Refresh the users list
    } catch (error) {
      console.error('Failed to approve user:', error)
      alert('Error approving user: ' + error.message)
    }
  }

  const confirmRejection = async () => {
    console.log('confirmRejection called, pendingActionUser:', pendingActionUser)
    if (!pendingActionUser) return
    
    try {
      console.log('Calling usersAPI.reject with userId:', pendingActionUser.id)
      await usersAPI.reject(pendingActionUser.id)
      console.log('Rejection successful')
      setShowRejectionModal(false)
      setPendingActionUser(null)
      await loadUsers() // Refresh the users list
    } catch (error) {
      console.error('Failed to reject user:', error)
      alert('Error rejecting user: ' + error.message)
    }
  }

  const confirmSuspension = async () => {
    if (!pendingActionUser || !suspensionReason.trim()) return
    
    try {
      await usersAPI.suspend(pendingActionUser.id, suspensionReason)
      setShowSuspensionModal(false)
      setPendingActionUser(null)
      setSuspensionReason('')
      await loadUsers() // Refresh the users list
    } catch (error) {
      console.error('Failed to suspend user:', error)
      alert('Error suspending user: ' + error.message)
    }
  }

  const confirmUnsuspension = async () => {
    if (!pendingActionUser) return
    
    try {
      await usersAPI.unsuspend(pendingActionUser.id)
      setShowUnsuspensionModal(false)
      setPendingActionUser(null)
      await loadUsers() // Refresh the users list
    } catch (error) {
      console.error('Failed to unsuspend user:', error)
      alert('Error unsuspending user: ' + error.message)
    }
  }

  // Check if current user is admin
  const canManageUsers = currentUser?.account_type === 'admin'

  // Calculate stats
  const totalUsers = users.length
  const adminUsers = users.filter(u => u.account_type === 'admin').length
  const employeeUsers = users.filter(u => u.account_type === 'employee').length
  const activeUsers = users.filter(u => u.status === 'active').length
  const pendingUsers = users.filter(u => u.status === 'pending').length
  const suspendedUsers = users.filter(u => u.status === 'suspended').length

  if (!canManageUsers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to manage users. Only administrators can access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage user accounts and module permissions</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center shadow-sm"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add User
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Administrators</p>
                <p className="text-2xl font-bold text-gray-900">{adminUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{pendingUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <Ban className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">{suspendedUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions for Pending Requests */}
        {pendingUsers > 0 && canManageUsers && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Pending Access Requests</h3>
                  <p className="text-yellow-700 text-sm">
                    {pendingUsers} user{pendingUsers !== 1 ? 's' : ''} waiting for approval
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setStatusFilter('pending')
                  setShowPendingOnly(true)
                }}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
              >
                Review Requests
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Filter</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="employee">Employee</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending Approval</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {filteredUsers.length} of {totalUsers} users
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setRoleFilter('')
                    setStatusFilter('')
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear Filters
                </button>
                <button
                  onClick={loadUsers}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">User</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Role</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Modules</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Created</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Last Login</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-gray-500">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm || roleFilter || statusFilter ? 'Try adjusting your search or filters' : 'Get started by adding your first user'}
                      </p>
                      {!searchTerm && !roleFilter && !statusFilter && (
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Add First User
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onView={() => handleViewUser(user.id)}
                      onEdit={() => handleEditUser(user.id)}
                      onApprove={() => handleApproveUser(user.id)}
                      onReject={() => handleRejectUser(user.id)}
                      onSuspend={() => handleSuspendUser(user.id)}
                      onUnsuspend={() => handleUnsuspendUser(user.id)}
                      currentUserEmail={currentUser?.email}
                      canManageUsers={currentUser?.account_type === 'admin'}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View User Modal */}
      {showViewModal && viewingUser && (
        <UserViewModal
          user={viewingUser}
          onClose={() => {
            setViewingUser(null)
            setShowViewModal(false)
          }}
          onEdit={() => handleEditUser(viewingUser.id)}
          currentUserEmail={currentUser?.email}
        />
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
        size="lg"
      >
        <UserForm
          onSubmit={handleAdd}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal && !!editingUser}
        onClose={() => {
          setEditingUser(null)
          setShowEditModal(false)
        }}
        title="Edit User"
        size="lg"
      >
        <UserForm
          user={editingUser}
          onSubmit={handleEdit}
          onCancel={() => {
            setEditingUser(null)
            setShowEditModal(false)
          }}
        />
      </Modal>

      {/* Approval Modal */}
      {showApprovalModal && (
        <Modal isOpen={showApprovalModal} onClose={() => setShowApprovalModal(false)} title="Approve User">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600">Grant access to the system</p>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                This user will be granted access to the system and can start using their assigned modules.
              </p>
            </div>

            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmApproval}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Approve User
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <Modal isOpen={showRejectionModal} onClose={() => setShowRejectionModal(false)} title="Reject User">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-gray-600">Deny access to the system</p>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                This user's registration will be permanently rejected and they will not be able to access the system.
              </p>
            </div>

            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejection}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <UserX className="w-4 h-4 mr-2" />
                Reject User
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Suspension Modal */}
      {showSuspensionModal && (
        <Modal isOpen={showSuspensionModal} onClose={() => setShowSuspensionModal(false)} title="Suspend User">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <Ban className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-gray-600">Temporarily disable user access</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suspension Reason
              </label>
              <textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="Enter the reason for suspension..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                This user will lose access to the system until the suspension is lifted.
              </p>
            </div>

            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => {
                  setShowSuspensionModal(false)
                  setSuspensionReason('')
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSuspension}
                disabled={!suspensionReason.trim()}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Ban className="w-4 h-4 mr-2" />
                Suspend User
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Unsuspension Modal */}
      {showUnsuspensionModal && (
        <Modal isOpen={showUnsuspensionModal} onClose={() => setShowUnsuspensionModal(false)} title="Unsuspend User">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600">Restore user access</p>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                This user will regain access to the system and can resume using their assigned modules.
              </p>
            </div>

            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowUnsuspensionModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmUnsuspension}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Unsuspend User
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200'
    case 'inactive': return 'bg-red-100 text-red-800 border-red-200'
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'suspended': return 'bg-orange-100 text-orange-800 border-orange-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getModuleNames = (modules) => {
  if (!modules || modules.length === 0) return ['Dashboard']
  
  // Handle if modules is a string (JSON)
  let moduleArray = modules
  if (typeof modules === 'string') {
    try {
      moduleArray = JSON.parse(modules)
    } catch (e) {
      moduleArray = ['dashboard']
    }
  }
  
  if (!Array.isArray(moduleArray)) {
    moduleArray = ['dashboard']
  }
  
  return moduleArray.map(moduleId => {
    const module = AVAILABLE_MODULES.find(m => m.id === moduleId)
    return module ? module.label : moduleId
  })
}

const UserViewModal = ({ user, onClose, onEdit, currentUserEmail }) => {
  if (!user) return null

  const isCurrentUser = user.email === currentUserEmail
  
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'employee': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="User Details" size="lg">
      <div className="space-y-6">
        {/* User Header */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-xl">
              {user.first_name?.charAt(0).toUpperCase()}{user.last_name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">
              {user.first_name} {user.last_name}
              {isCurrentUser && <span className="text-sm text-blue-600 ml-2">(You)</span>}
            </h3>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(user.account_type)}`}>
                {user.account_type === 'admin' ? 'Administrator' : 'Employee'}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(user.status)}`}>
                {user.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Personal Information</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{user.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</label>
                <p className="mt-1 text-sm text-gray-900">{user.address || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Account Information</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account Type</label>
                <p className="mt-1 text-sm text-gray-900">{user.account_type === 'admin' ? 'Administrator' : 'Employee'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                <p className="mt-1 text-sm text-gray-900">{user.status === 'active' ? 'Active' : 'Inactive'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Member Since</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Login</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.last_login ? new Date(user.last_login).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Module Permissions */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Module Permissions</h4>
          {user.account_type === 'admin' ? (
            <div className="flex items-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-purple-900">Administrator Access</p>
                <p className="text-xs text-purple-700">Has access to all modules including user management</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(() => {
                let userModules = []
                if (Array.isArray(user.allowed_modules)) {
                  userModules = user.allowed_modules
                } else if (typeof user.allowed_modules === 'string') {
                  try {
                    userModules = JSON.parse(user.allowed_modules)
                  } catch (e) {
                    userModules = ['dashboard']
                  }
                } else {
                  userModules = ['dashboard']
                }
                
                return getModuleNames(userModules).map((moduleName, index) => (
                  <div key={index} className="flex items-center p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">{moduleName}</span>
                  </div>
                ))
              })()}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                onEdit()
                onClose()
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit User
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

const ModuleSelector = ({ selectedModules = [], onChange, accountType, disabled = false }) => {
  // Ensure selectedModules is always an array
  const safeSelectedModules = Array.isArray(selectedModules) ? selectedModules : ['dashboard']
  
  console.log('ModuleSelector props:', { selectedModules, safeSelectedModules, accountType })
  console.log('ModuleSelector AVAILABLE_MODULES:', AVAILABLE_MODULES)
  console.log('Checking each module:', AVAILABLE_MODULES.map(m => ({ 
    id: m.id, 
    label: m.label, 
    isSelected: safeSelectedModules.includes(m.id) 
  })))
  
  // Admin gets all modules automatically
  if (accountType === 'admin') {
    return (
      <div className="space-y-3">
        <div className="flex items-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <Shield className="w-5 h-5 text-purple-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-purple-900">Administrator Access</p>
            <p className="text-xs text-purple-700">Admins have access to all modules including user management</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 mb-3">
        Select which modules this employee can access:
      </div>
      <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
        {AVAILABLE_MODULES.map((module) => {
          const isChecked = safeSelectedModules.includes(module.id)
          const isDashboard = module.id === 'dashboard'
          return (
            <label
              key={module.id}
              className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                isChecked
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${(disabled || isDashboard) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => {
                  if (disabled || isDashboard) return
                  
                  let newModules = [...safeSelectedModules]
                  
                  if (e.target.checked) {
                    // Add module if not already present
                    if (!newModules.includes(module.id)) {
                      newModules.push(module.id)
                    }
                  } else {
                    // Remove module
                    newModules = newModules.filter(id => id !== module.id)
                  }
                  
                  // Ensure dashboard is always included
                  if (!newModules.includes('dashboard')) {
                    newModules.unshift('dashboard')
                  }
                  
                  // Remove duplicates
                  newModules = [...new Set(newModules)]
                  
                  console.log('Module selection changed:', { module: module.id, checked: e.target.checked, newModules })
                  onChange(newModules)
                }}
                className="mt-1 mr-3"
                disabled={disabled || isDashboard}
              />
              <div>
                <div className="font-medium text-gray-900">
                  {module.label}
                  {isDashboard && <span className="text-xs text-gray-500 ml-1">(Required)</span>}
                </div>
                <div className="text-sm text-gray-600">{module.description}</div>
              </div>
            </label>
          )
        })}
      </div>
      {safeSelectedModules.length === 0 && (
        <p className="text-sm text-red-600 mt-2">
          At least one module must be selected. Dashboard will be added automatically.
        </p>
      )}
    </div>
  )
}

const UserForm = ({ user, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    accountType: 'employee',
    phone: '',
    address: '',
    status: 'active',
    allowedModules: ['dashboard']
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (user) {
      console.log('=== UserForm useEffect - Loading user data for edit ===')
      console.log('Original user object:', user)
      console.log('User allowed_modules raw:', user.allowed_modules)
      console.log('Type of allowed_modules:', typeof user.allowed_modules)
      
      // Ensure allowed_modules is properly handled
      let userModules = ['dashboard'] // Always include dashboard as default
      
      if (user.account_type === 'admin') {
        // Admin gets all modules
        userModules = AVAILABLE_MODULES.map(m => m.id)
        console.log('Admin user - setting all modules:', userModules)
      } else if (user.allowed_modules) {
        if (Array.isArray(user.allowed_modules)) {
          userModules = [...user.allowed_modules]
          console.log('User modules already array:', userModules)
        } else if (typeof user.allowed_modules === 'string') {
          try {
            const parsed = JSON.parse(user.allowed_modules)
            if (Array.isArray(parsed)) {
              userModules = [...parsed]
              console.log('Parsed modules from string:', userModules)
            }
          } catch (e) {
            console.log('Error parsing user modules from string:', e)
            userModules = ['dashboard']
          }
        }
      } else {
        console.log('No allowed_modules found, using default')
      }
      
      // Ensure dashboard is always included for employees
      if (!userModules.includes('dashboard')) {
        userModules.unshift('dashboard')
      }
      
      // Remove duplicates
      userModules = [...new Set(userModules)]
      
      console.log('Final processed user modules for form:', userModules)
      
      setForm({
        email: user.email || '',
        password: '', // Always empty for editing
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        accountType: user.account_type || 'employee',
        phone: user.phone || '',
        address: user.address || '',
        status: user.status || 'active',
        allowedModules: userModules
      })
      
      console.log('Form state set with modules:', userModules)
      console.log('=== End UserForm useEffect ===')
    } else {
      // Reset form for new user
      console.log('Resetting form for new user')
      setForm({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        accountType: 'employee',
        phone: '',
        address: '',
        status: 'active',
        allowedModules: ['dashboard']
      })
    }
  }, [user])

  const validateForm = () => {
    const newErrors = {}
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email is invalid'
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!user && !form.password.trim()) newErrors.password = 'Password is required'
    else if (!user && form.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      setLoading(true)
      try {
        // Always include dashboard in allowed_modules for employees
        let modules = Array.isArray(form.allowedModules) ? [...form.allowedModules] : ['dashboard']
        
        if (form.accountType === 'admin') {
          // Admin gets all modules
          modules = AVAILABLE_MODULES.map(m => m.id)
        } else {
          // For employees, ensure dashboard is included
          if (!modules.includes('dashboard')) {
            modules.unshift('dashboard')
          }
          // Remove duplicates
          modules = [...new Set(modules)]
        }
        
        console.log('Submitting form with modules:', modules)
        
        const submitData = {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          accountType: form.accountType,
          phone: form.phone,
          address: form.address,
          status: form.status,
          allowed_modules: modules
        }
        
        // Only include password for new users
        if (!user && form.password) {
          submitData.password = form.password
        }
        
        console.log('Final submit data:', submitData)
        await onSubmit(submitData)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter first name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter last name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter email address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      {!user && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className={`w-full border rounded-lg p-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Type <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={form.accountType}
            onChange={(e) => {
              const newAccountType = e.target.value
              let newModules = []
              
              if (newAccountType === 'admin') {
                newModules = AVAILABLE_MODULES.map(m => m.id)
              } else {
                // For employee, preserve current modules but ensure dashboard is included
                newModules = Array.isArray(form.allowedModules) ? [...form.allowedModules] : ['dashboard']
                if (!newModules.includes('dashboard')) {
                  newModules.unshift('dashboard')
                }
                // Remove duplicates
                newModules = [...new Set(newModules)]
              }
              
              console.log('Account type changed:', { newAccountType, newModules })
              
              setForm({ 
                ...form, 
                accountType: newAccountType, 
                allowedModules: newModules 
              })
            }}
          >
            {ROLES.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {STATUS_OPTIONS.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Module Permissions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Module Permissions
        </label>
        <ModuleSelector
          selectedModules={form.allowedModules}
          onChange={(modules) => setForm({ ...form, allowedModules: modules })}
          accountType={form.accountType}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Enter phone number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          placeholder="Enter address"
          rows={3}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </div>

      <div className="flex space-x-3 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              {user ? 'Update' : 'Create'} User
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

const UserRow = ({ user, onEdit, onView, onApprove, onReject, onSuspend, onUnsuspend, currentUserEmail, canManageUsers }) => {
  const [showActions, setShowActions] = useState(false)
  const isCurrentUser = user.email === currentUserEmail

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'employee': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'suspended': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Active'
      case 'inactive': return 'Inactive'
      case 'pending': return 'Pending'
      case 'suspended': return 'Suspended'
      default: return status
    }
  }
  
  const getModuleNames = (modules) => {
    if (!modules || modules.length === 0) return ['Dashboard']
    return modules.map(moduleId => {
      const module = AVAILABLE_MODULES.find(m => m.id === moduleId)
      return module ? module.label : moduleId
    })
  }

  const handleClick = (e) => {
    // Don't trigger view if clicking on action buttons
    if (e.target.closest('button')) {
      return
    }
    onView()
  }
  
  return (
    <tr 
      className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <td className="py-4 px-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-600 font-semibold">
              {user.first_name?.charAt(0).toUpperCase()}{user.last_name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {user.first_name} {user.last_name}
              {isCurrentUser && <span className="text-xs text-blue-600 ml-2">(You)</span>}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(user.account_type)}`}>
          {user.account_type === 'admin' ? 'Admin' : 'Employee'}
        </span>
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(user.status)}`}>
          {getStatusLabel(user.status)}
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="text-sm text-gray-600">
          {user.account_type === 'admin' ? (
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-1 text-purple-600" />
              <span className="text-purple-600 font-medium">All Modules</span>
            </div>
          ) : user.status === 'pending' ? (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-yellow-600" />
              <span className="text-yellow-600 font-medium">Awaiting Approval</span>
            </div>
          ) : (
            <div className="max-w-xs">
              <div className="text-xs text-gray-500">
                {(() => {
                  let userModules = []
                  if (Array.isArray(user.allowed_modules)) {
                    userModules = user.allowed_modules
                  } else if (typeof user.allowed_modules === 'string') {
                    try {
                      userModules = JSON.parse(user.allowed_modules)
                    } catch (e) {
                      userModules = ['dashboard']
                    }
                  } else {
                    userModules = ['dashboard']
                  }
                  return getModuleNames(userModules).join(', ')
                })()}
              </div>
            </div>
          )}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="text-sm text-gray-500">
          {new Date(user.created_at).toLocaleDateString()}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="text-sm text-gray-500">
          {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center space-x-2">
          {/* Pending Status Actions */}
          {user.status === 'pending' && canManageUsers && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onApprove()
                }}
                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                title="Approve User"
              >
                <UserCheck className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onReject()
                }}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                title="Reject User"
              >
                <UserX className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Active/Inactive Status Actions */}
          {(user.status === 'active' || user.status === 'inactive') && canManageUsers && !isCurrentUser && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onView()
                }}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit User"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSuspend()
                }}
                className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                title="Suspend User"
              >
                <Ban className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Suspended Status Actions */}
          {user.status === 'suspended' && canManageUsers && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onView()
                }}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onUnsuspend()
                }}
                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                title="Unsuspend User"
              >
                <UserCheck className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Current User - Limited Actions */}
          {isCurrentUser && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onView()
                }}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit Profile"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
