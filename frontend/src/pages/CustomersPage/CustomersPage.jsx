import React from 'react'
import { useEffect, useState } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone_number: '', 
    customer_type: 'Walk-in',
    address: '',
    city: '',
    country: 'Philippines',
    notes: ''
  })
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [viewMode, setViewMode] = useState('table') // 'table' or 'cards'

  const loadCustomers = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call when backend route is ready
      // const response = await fetch('/api/customers', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   }
      // })
      // 
      // if (!response.ok) {
      //   const error = await response.json()
      //   throw new Error(error.message || 'Failed to load customers')
      // }
      // 
      // const data = await response.json()
      // setCustomers(data.data || [])

      // Temporary mock data - remove when API is ready
      setCustomers([])
      
      console.log('loadCustomers called - ready for API integration')
    } catch (error) {
      console.error('Error loading customers:', error)
      alert('Error loading customers: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchTerm || 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !typeFilter || customer.customer_type === typeFilter
    
    return matchesSearch && matchesType
  })

  const resetForm = () => {
    setForm({ 
      name: '', 
      email: '', 
      phone_number: '', 
      customer_type: 'Walk-in',
      address: '',
      city: '',
      country: 'Philippines',
      notes: ''
    })
    setEditingCustomer(null)
    setShowAddForm(false)
  }

  const validateForm = () => {
    if (!form.name.trim()) {
      alert('Customer name is required')
      return false
    }
    if (!form.email.trim()) {
      alert('Email is required')
      return false
    }
    if (!form.phone_number.trim()) {
      alert('Phone number is required')
      return false
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      alert('Please enter a valid email address')
      return false
    }
    
    return true
  }

  const saveCustomer = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setSaving(true)
    try {
      if (editingCustomer) {
        // TODO: Replace with actual API call when backend route is ready
        // const response = await fetch(`/api/customers/${editingCustomer.id}`, {
        //   method: 'PUT',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        //   },
        //   body: JSON.stringify(form)
        // })
        // 
        // if (!response.ok) {
        //   const error = await response.json()
        //   throw new Error(error.message || 'Failed to update customer')
        // }
        
        console.log('Update customer:', editingCustomer.id, form)
        alert('Customer updated successfully!')
      } else {
        // TODO: Replace with actual API call when backend route is ready
        // const response = await fetch('/api/customers', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        //   },
        //   body: JSON.stringify(form)
        // })
        // 
        // if (!response.ok) {
        //   const error = await response.json()
        //   throw new Error(error.message || 'Failed to add customer')
        // }
        
        console.log('Add new customer:', form)
        alert('Customer added successfully!')
      }
      
      resetForm()
      await loadCustomers()
    } catch (error) {
      console.error('Error saving customer:', error)
      alert('Error saving customer: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const editCustomer = (customer) => {
    setForm({
      name: customer.name,
      email: customer.email,
      phone_number: customer.phone_number,
      customer_type: customer.customer_type,
      address: customer.address || '',
      city: customer.city || '',
      country: customer.country || 'Philippines',
      notes: customer.notes || ''
    })
    setEditingCustomer(customer)
    setShowAddForm(true)
  }

  const deleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return
    }
    
    try {
      // TODO: Replace with actual API call when backend route is ready
      // const response = await fetch(`/api/customers/${customerId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   }
      // })
      // 
      // if (!response.ok) {
      //   const error = await response.json()
      //   throw new Error(error.message || 'Failed to delete customer')
      // }
      
      console.log('Delete customer:', customerId)
      alert('Customer deleted successfully!')
      await loadCustomers()
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Error deleting customer: ' + error.message)
    }
  }

  const getCustomerStats = (customer) => {
    const orders = customer.orders || []
    const totalOrders = orders.length
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
    const completedOrders = orders.filter(order => order.status === 'Completed').length
    
    return { totalOrders, totalSpent, completedOrders }
  }

  const getCustomerTypeColor = (type) => {
    switch (type) {
      case 'Contract': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Walk-in': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Calculate overall stats
  const totalCustomers = customers.length
  const contractCustomers = customers.filter(c => c.customer_type === 'Contract').length
  const walkInCustomers = customers.filter(c => c.customer_type === 'Walk-in').length
  const totalRevenue = customers.reduce((sum, customer) => {
    const customerRevenue = (customer.orders || []).reduce((orderSum, order) => 
      orderSum + Number(order.total || 0), 0)
    return sum + customerRevenue
  }, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
              <p className="text-gray-600">Manage your customer database and relationships</p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-3">
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {viewMode === 'table' ? (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Card View
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 6h18M3 14h18M3 18h18" />
                    </svg>
                    Table View
                  </div>
                )}
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add Customer
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₱{totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Contract Customers</p>
                <p className="text-2xl font-bold text-gray-900">{contractCustomers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Walk-in Customers</p>
                <p className="text-2xl font-bold text-gray-900">{walkInCustomers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Customers</label>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">All Types</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setTypeFilter('')
                }}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Customer Display */}
        {viewMode === 'table' ? (
          <Card title="Customer List">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        {searchTerm || typeFilter ? 'No customers match your filters' : 'No customers found'}
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => {
                      const stats = getCustomerStats(customer)
                      return (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                              {customer.address && (
                                <div className="text-sm text-gray-500">{customer.city || customer.address}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer.email}</div>
                            <div className="text-sm text-gray-500">{customer.phone_number}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getCustomerTypeColor(customer.customer_type)}`}>
                              {customer.customer_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {stats.totalOrders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₱{stats.totalSpent.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => editCustomer(customer)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteCustomer(customer.id)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || typeFilter ? 'Try adjusting your filters' : 'Get started by adding your first customer'}
                </p>
                {!searchTerm && !typeFilter && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Add First Customer
                  </button>
                )}
              </div>
            ) : (
              filteredCustomers.map((customer) => {
                const stats = getCustomerStats(customer)
                return (
                  <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-lg">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getCustomerTypeColor(customer.customer_type)}`}>
                            {customer.customer_type}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {customer.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {customer.phone_number}
                      </div>
                      {customer.address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {customer.city ? `${customer.city}, ${customer.country}` : customer.address}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-900">{stats.totalOrders}</div>
                        <div className="text-gray-500">Orders</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-900">₱{stats.totalSpent.toFixed(2)}</div>
                        <div className="text-gray-500">Total Spent</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editCustomer(customer)}
                        className="flex-1 text-blue-600 border border-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCustomer(customer.id)}
                        className="flex-1 text-red-600 border border-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Add/Edit Customer Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-full overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={saveCustomer} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter customer name"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="Enter email address"
                        value={form.email}
                        onChange={e => setForm({...form, email: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Enter phone number"
                        value={form.phone_number}
                        onChange={e => setForm({...form, phone_number: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.customer_type}
                        onChange={e => setForm({...form, customer_type: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        <option value="Walk-in">Walk-in</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      placeholder="Enter street address"
                      value={form.address}
                      onChange={e => setForm({...form, address: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        placeholder="Enter city"
                        value={form.city}
                        onChange={e => setForm({...form, city: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        placeholder="Enter postal code"
                        value={form.postal_code}
                        onChange={e => setForm({...form, postal_code: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        placeholder="Enter country"
                        value={form.country}
                        onChange={e => setForm({...form, country: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Additional notes about the customer..."
                      value={form.notes}
                      onChange={e => setForm({...form, notes: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {saving ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {editingCustomer ? 'Updating...' : 'Adding...'}
                        </div>
                      ) : (
                        editingCustomer ? 'Update Customer' : 'Add Customer'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
