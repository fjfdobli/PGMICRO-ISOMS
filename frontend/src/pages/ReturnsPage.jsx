import React from 'react'
import { useEffect, useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'

export default function ReturnsPage() {
  const [orders, setOrders] = useState([])
  const [returns, setReturns] = useState([])
  const [orderId, setOrderId] = useState('')
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [returnType, setReturnType] = useState('return') 
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('normal')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState('create')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API calls when backend routes are ready
      // const ordersResponse = await fetch('/api/orders?status=Completed')
      // const ordersData = await ordersResponse.json()
      // setOrders(ordersData.data || [])

      // const returnsResponse = await fetch('/api/returns')
      // const returnsData = await returnsResponse.json()
      // setReturns(returnsData.data || [])

      // Temporary mock data - remove when API is ready
      setOrders([])
      setReturns([])
      
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      order.id.toLowerCase().includes(searchLower) ||
      order.customers?.name?.toLowerCase().includes(searchLower) ||
      order.order_items?.some(item => 
        item.products?.name?.toLowerCase().includes(searchLower) ||
        item.products?.sku?.toLowerCase().includes(searchLower)
      )
    )
  })

  const filteredReturns = returns.filter(returnItem => {
    if (!statusFilter) return true
    return returnItem.status === statusFilter
  })

  const submitReturn = async () => {
    if (!orderId) {
      alert('Please select an order')
      return
    }
    
    const finalReason = reason === 'Other' ? customReason.trim() : reason
    
    if (!finalReason) {
      alert('Please provide a reason for the return')
      return
    }

    setSaving(true)
    try {
      const returnData = {
        order_id: orderId,
        reason: finalReason,
        return_type: returnType,
        description: description.trim(),
        priority,
        status: 'Pending'
      }

      // TODO: Replace with actual API call when backend route is ready
      // const response = await fetch('/api/returns', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   },
      //   body: JSON.stringify(returnData)
      // })
      // 
      // if (!response.ok) {
      //   const error = await response.json()
      //   throw new Error(error.message || 'Failed to submit return')
      // }

      console.log('Return data ready for submission:', returnData)

      // Reset form
      setOrderId('')
      setReason('')
      setCustomReason('')
      setDescription('')
      setReturnType('return')
      setPriority('normal')
      setSelectedOrder(null)
      
      // Reload data
      await loadData()
      
      alert('Return request submitted successfully!')
    } catch (error) {
      console.error('Error submitting return:', error)
      alert('Error submitting return: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const updateReturnStatus = async (returnId, newStatus) => {
    try {
      // TODO: Replace with actual API call when backend route is ready
      // const response = await fetch(`/api/returns/${returnId}/status`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   },
      //   body: JSON.stringify({ status: newStatus })
      // })
      // 
      // if (!response.ok) {
      //   const error = await response.json()
      //   throw new Error(error.message || 'Failed to update return status')
      // }
      
      console.log(`Update return ${returnId} to status: ${newStatus}`)
      
      await loadData()
      alert(`Return ${newStatus.toLowerCase()} successfully!`)
    } catch (error) {
      console.error('Error updating return status:', error)
      alert('Error updating return status: ' + error.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'normal': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warranty':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'exchange':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
          </svg>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading returns data...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Returns & Warranty</h1>
              <p className="text-gray-600">Manage product returns, warranties, and exchanges</p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-3">
              <button
                onClick={() => setViewMode('create')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'create' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Create Return
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                View Returns
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {returns.filter(r => r.status === 'Pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {returns.filter(r => r.status === 'Processing').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {returns.filter(r => r.status === 'Approved').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold text-gray-900">{returns.length}</p>
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'create' ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Selection */}
            <Card title="Select Order">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Orders
                  </label>
                  <input
                    type="text"
                    placeholder="Search by order ID, customer, or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div className="max-h-96 overflow-auto border border-gray-200 rounded-lg">
                  {filteredOrders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      {searchTerm ? 'No orders found matching your search' : 'No completed orders available for returns'}
                    </div>
                  ) : (
                    filteredOrders.map(order => (
                      <div 
                        key={order.id} 
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          orderId === order.id ? 'bg-orange-50 border-orange-200' : ''
                        }`}
                        onClick={() => {
                          setOrderId(order.id)
                          setSelectedOrder(order)
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              Order #{order.id.slice(0, 8)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Customer: {order.customers?.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-orange-600">
                              ₱{Number(order.total).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.order_items?.length || 0} items
                            </div>
                          </div>
                        </div>
                        
                        {selectedOrder?.id === order.id && order.order_items && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-sm font-medium text-gray-700 mb-2">Order Items:</div>
                            <div className="space-y-1">
                              {order.order_items.map(item => (
                                <div key={item.id} className="text-xs text-gray-600 flex justify-between">
                                  <span>{item.products?.name} ({item.products?.sku})</span>
                                  <span>Qty: {item.quantity} × ₱{Number(item.unit_price).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>

            {/* Return Form */}
            <Card title="Return Details">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={returnType}
                    onChange={(e) => setReturnType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  >
                    <option value="return">Product Return</option>
                    <option value="warranty">Warranty Claim</option>
                    <option value="exchange">Product Exchange</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  >
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Return <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value)
                      if (e.target.value !== 'Other') {
                        setCustomReason('')
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select a reason...</option>
                    <option value="Defective Product">Defective Product</option>
                    <option value="Wrong Item Shipped">Wrong Item Shipped</option>
                    <option value="Damaged During Shipping">Damaged During Shipping</option>
                    <option value="Not as Described">Not as Described</option>
                    <option value="Customer Changed Mind">Customer Changed Mind</option>
                    <option value="Product Not Compatible">Product Not Compatible</option>
                    <option value="Quality Issues">Quality Issues</option>
                    <option value="Warranty Claim">Warranty Claim</option>
                    <option value="Other">Other</option>
                  </select>
                  
                  {reason === 'Other' && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Please specify the reason <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your reason..."
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Description
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Provide additional details about the return..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    onClick={submitReturn}
                    disabled={saving || !orderId || (!reason || (reason === 'Other' && !customReason.trim()))}
                    className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {saving ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting Return...
                      </div>
                    ) : (
                      'Submit Return Request'
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filters */}
            <Card title="Filter Returns">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setStatusFilter('')}
                    className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear Filter
                  </button>
                </div>
              </div>
            </Card>

            {/* Returns List */}
            <Card title="Returns Management">
              <div className="space-y-4">
                {filteredReturns.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No returns found</h3>
                    <p className="text-gray-600">
                      {statusFilter ? 'No returns match the selected filter' : 'No return requests have been submitted yet'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReturns.map(returnItem => (
                      <div key={returnItem.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                {getTypeIcon(returnItem.return_type)}
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  Return #{returnItem.id.slice(0, 8)}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Order #{returnItem.orders?.id?.slice(0, 8)} • {returnItem.orders?.customers?.name}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Type:</span>
                                <span className="ml-2 font-medium capitalize">{returnItem.return_type}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Date:</span>
                                <span className="ml-2 font-medium">
                                  {new Date(returnItem.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Reason:</span>
                                <span className="ml-2 font-medium">{returnItem.reason}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-gray-500">Priority:</span>
                                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(returnItem.priority)}`}>
                                  {returnItem.priority}
                                </span>
                              </div>
                            </div>
                            
                            {returnItem.description && (
                              <div className="text-sm">
                                <span className="text-gray-500">Description:</span>
                                <p className="mt-1 text-gray-700">{returnItem.description}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col items-end space-y-3">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(returnItem.status)}`}>
                              {returnItem.status}
                            </span>
                            
                            {returnItem.status === 'Pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => updateReturnStatus(returnItem.id, 'Approved')}
                                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateReturnStatus(returnItem.id, 'Rejected')}
                                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            
                            {returnItem.status === 'Approved' && (
                              <button
                                onClick={() => updateReturnStatus(returnItem.id, 'Processing')}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Start Processing
                              </button>
                            )}
                            
                            {returnItem.status === 'Processing' && (
                              <button
                                onClick={() => updateReturnStatus(returnItem.id, 'Completed')}
                                className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                              >
                                Mark Complete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}