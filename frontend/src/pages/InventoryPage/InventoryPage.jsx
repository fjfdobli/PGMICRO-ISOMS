import React, { useEffect, useState } from 'react'

export default function InventoryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [viewMode, setViewMode] = useState('table') // 'table' or 'cards'
  const [filters, setFilters] = useState({ search: '', category: '' })
  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    quantity: 0,
    price: 0,
    category: '',
    minimum_stock: 0,
    supplier_id: '',
    location: '',
    description: ''
  })

  useEffect(() => {
    fetchInventory()
  }, [])

  useEffect(() => {
    if (error) {
      console.error('Inventory error:', error)
      setTimeout(() => setError(null), 5000)
    }
  }, [error])

  const fetchInventory = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call when backend endpoint is ready
      // Example:
      // const response = await fetch('http://localhost:3002/api/inventory', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   }
      // })
      // if (!response.ok) throw new Error('Failed to fetch inventory')
      // const data = await response.json()
      // setItems(data.items || [])
      
      // For now, initialize with empty array
      setItems([])
    } catch (error) {
      console.error('Error fetching inventory:', error)
      setError(error.message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // TODO: Replace with actual API call when backend endpoint is ready
      // Example:
      // const response = await fetch('http://localhost:3002/api/inventory', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   },
      //   body: JSON.stringify(newItem)
      // })
      // if (!response.ok) throw new Error('Failed to add item')
      // const data = await response.json()
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setNewItem({ 
        name: '', 
        sku: '', 
        quantity: 0, 
        price: 0, 
        category: '', 
        minimum_stock: 0,
        supplier_id: '',
        location: '',
        description: ''
      })
      setShowAddForm(false)
      await fetchInventory() // Refresh the list
    } catch (error) {
      console.error('Failed to add item:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateItem = async (id, updates) => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call when backend endpoint is ready
      // Example:
      // const response = await fetch(`http://localhost:3002/api/inventory/${id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   },
      //   body: JSON.stringify(updates)
      // })
      // if (!response.ok) throw new Error('Failed to update item')
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setEditingItem(null)
      await fetchInventory() // Refresh the list
    } catch (error) {
      console.error('Failed to update item:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      setLoading(true)
      try {
        // TODO: Replace with actual API call when backend endpoint is ready
        // Example:
        // const response = await fetch(`http://localhost:3002/api/inventory/${id}`, {
        //   method: 'DELETE',
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        //   }
        // })
        // if (!response.ok) throw new Error('Failed to delete item')
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        await fetchInventory() // Refresh the list
      } catch (error) {
        console.error('Failed to delete item:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
  }

  const handleCategoryFilter = (category) => {
    setFilters(prev => ({ ...prev, category }))
  }

  // Get unique categories
  const categories = [...new Set(items.map(item => item.category).filter(Boolean))]

  // Get inventory stats
  const totalItems = items.length
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const lowStockItems = items.filter(item => item.quantity <= (item.minimum_stock || 5))
  const outOfStockItems = items.filter(item => item.quantity === 0)

  // Filter items based on current filters
  const filteredItems = items.filter(item => {
    const matchesSearch = !filters.search || 
      item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.sku.toLowerCase().includes(filters.search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(filters.search.toLowerCase()))
    
    const matchesCategory = !filters.category || item.category === filters.category
    
    return matchesSearch && matchesCategory
  })

  const getStockStatus = (item) => {
    if (item.quantity === 0) return 'out-of-stock'
    if (item.quantity <= (item.minimum_stock || 5)) return 'low-stock'
    return 'in-stock'
  }

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'out-of-stock': return 'bg-red-100 text-red-800 border-red-200'
      case 'low-stock': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getStockStatusText = (status) => {
    switch (status) {
      case 'out-of-stock': return 'Out of Stock'
      case 'low-stock': return 'Low Stock'
      default: return 'In Stock'
    }
  }

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
              <p className="text-gray-600">Track and manage your product inventory</p>
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
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                disabled={loading}
              >
                Add Item
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
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
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">₱{totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5C2.57 17.333 3.53 19 5.07 19z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">{outOfStockItems.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Items</label>
              <input
                type="text"
                placeholder="Search by name, SKU, or description..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ search: '', category: '' })}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Items Display */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => {
                    const stockStatus = getStockStatus(item)
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{item.sku}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.category || 'Uncategorized'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.quantity}</div>
                          {item.minimum_stock && (
                            <div className="text-xs text-gray-500">Min: {item.minimum_stock}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₱{Number(item.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStockStatusColor(stockStatus)}`}>
                            {getStockStatusText(stockStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const stockStatus = getStockStatus(item)
              return (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{item.name}</h3>
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{item.sku}</span>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStockStatusColor(stockStatus)}`}>
                      {getStockStatusText(stockStatus)}
                    </span>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium">{item.category || 'Uncategorized'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Stock:</span>
                      <span className="font-medium">{item.quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-medium">₱{Number(item.price).toFixed(2)}</span>
                    </div>
                    {item.minimum_stock && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Min Stock:</span>
                        <span className="font-medium">{item.minimum_stock}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="flex-1 text-green-600 border border-green-600 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="flex-1 text-red-600 border border-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filteredItems.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.category ? 'Try adjusting your filters' : 'Get started by adding your first inventory item'}
            </p>
            {!filters.search && !filters.category && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Add First Item
              </button>
            )}
          </div>
        )}

        {/* Add/Edit Item Modal */}
        {(showAddForm || editingItem) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-full overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h2>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                    <input
                      type="text"
                      required
                      value={newItem.sku}
                      onChange={(e) => setNewItem({...newItem, sku: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={newItem.price}
                        onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={newItem.category}
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={newItem.minimum_stock}
                      onChange={(e) => setNewItem({...newItem, minimum_stock: parseInt(e.target.value) || 0})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows="3"
                      value={newItem.description}
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false)
                        setEditingItem(null)
                        setNewItem({
                          name: '', 
                          sku: '', 
                          quantity: 0, 
                          price: 0, 
                          category: '', 
                          minimum_stock: 0,
                          supplier_id: '',
                          location: '',
                          description: ''
                        })
                      }}
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
