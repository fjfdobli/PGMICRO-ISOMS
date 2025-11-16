import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { createNotification } from '../../lib/slices/notificationSlice'

export default function InventoryPage() {
  const dispatch = useDispatch()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [viewingItem, setViewingItem] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [viewMode, setViewMode] = useState('table') 
  const [filters, setFilters] = useState({ search: '', category: '', showDamagedOnly: false })
  const [showWorkflowInfo, setShowWorkflowInfo] = useState(false)
  const [newItem, setNewItem] = useState({
    productDescription: '',
    categoryId: '',
    purchasePrice: 0,
    sellingPrice: 0,
    reorderPoint: 0,
    warrantyDuration: '',
    model: '',
    brand: '',
    damage: false,
    serialNumber: '',
    dateReceived: '',
    itemStatus: 'available',
    location: '',
    expirationDate: '',
    damageProductId: null,
    dateReported: '',
    damageType: '',
    damageDescription: '',
    warrantyStartDate: '',
    warrantyEndDate: '',
    warrantyUse: 0,
    soldDate: '',
    soldTo: '',
    salePrice: 0
  })

  useEffect(() => {
    fetchInventory()
  }, [])

  // Note: Reorder alerts are now handled by backend triggers or manual actions
  // to avoid spamming notifications on every render. Consider implementing
  // backend logic to create low_stock notifications when items fall below reorder point. 

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
        productDescription: '',
        categoryId: '',
        purchasePrice: 0,
        sellingPrice: 0,
        reorderPoint: 0,
        warrantyDuration: '',
        model: '',
        brand: '',
        damage: false,
        serialNumber: '',
        dateReceived: '',
        itemStatus: 'available',
        location: '',
        expirationDate: '',
        damageProductId: null,
        dateReported: '',
        damageType: '',
        damageDescription: '',
        warrantyStartDate: '',
        warrantyEndDate: '',
        warrantyUse: 0,
        soldDate: '',
        soldTo: '',
        salePrice: 0
      })
      setShowAddForm(false)
      await fetchInventory()
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
    
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setEditingItem(null)
      await fetchInventory() 
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
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        await fetchInventory()
      } catch (error) {
        console.error('Failed to delete item:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleViewDetails = (item) => {
    setViewingItem(item)
    setShowDetailsModal(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setNewItem(item)
    setShowAddForm(true)
  }

  const handleProcessReturn = async (item) => {
    if (!window.confirm(`🔄 PROCESS RETURN: ${item.productDescription}\n\n✅ This is the standard process for sealed products damaged during audit.\n\n📤 Action: Return item to supplier\n📍 Status: Move to Returns Processing Area\n\nProceed with return process?`)) return
    
    try {
      setLoading(true)
      console.log('Processing return for item:', item.id)
      await new Promise(resolve => setTimeout(resolve, 1000))
      const updatedItems = items.map(i => 
        i.id === item.id 
          ? { ...i, itemStatus: 'return-processing', location: '📤 Returns Processing Area', returnDate: new Date().toISOString() }
          : i
      )
      setItems(updatedItems)
      
      alert('Return process initiated successfully!')
    } catch (error) {
      console.error('Failed to process return:', error)
      setError('Failed to process return')
    } finally {
      setLoading(false)
    }
  }


  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
  }

  const handleCategoryFilter = (category) => {
    setFilters(prev => ({ ...prev, category }))
  }

  const categories = [...new Set(items.map(item => item.category).filter(Boolean))]
  const totalItems = items.length
  const availableItems = items.filter(item => item.itemStatus === 'available' || (!item.itemStatus && !item.soldDate))
  const soldItems = items.filter(item => item.itemStatus === 'sold' || item.soldDate)
  const damagedItems = items.filter(item => item.itemStatus === 'damaged' || item.damage)
  const totalValue = availableItems.reduce((sum, item) => {
    const price = item.sellingPrice || item.price || 0
    return sum + price
  }, 0)
  const categoryStats = items.reduce((acc, item) => {
    const category = item.categoryName || item.category || 'Uncategorized'
    const productKey = `${category}-${item.brand}-${item.model}`
    
    if (!acc[productKey]) {
      acc[productKey] = {
        category,
        brand: item.brand,
        model: item.model,
        total: 0,
        available: 0,
        sold: 0,
        damaged: 0,
        reorderPoint: item.reorderPoint || 5
      }
    }
    
    acc[productKey].total++
    if (item.itemStatus === 'available' || (!item.itemStatus && !item.soldDate)) {
      acc[productKey].available++
    } else if (item.itemStatus === 'sold' || item.soldDate) {
      acc[productKey].sold++
    } else if (item.itemStatus === 'damaged' || item.damage) {
      acc[productKey].damaged++
    }
    
    return acc
  }, {})
  
  const lowStockCategories = Object.values(categoryStats).filter(cat => 
    cat.available <= cat.reorderPoint
  )

  const filteredItems = items.filter(item => {
    const searchTerm = filters.search.toLowerCase()
    const matchesSearch = !filters.search || 
      (item.productDescription && item.productDescription.toLowerCase().includes(searchTerm)) ||
      (item.name && item.name.toLowerCase().includes(searchTerm)) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm)) ||
      (item.model && item.model.toLowerCase().includes(searchTerm)) ||
      (item.serialNumber && item.serialNumber.toLowerCase().includes(searchTerm)) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm)) ||
      (item.description && item.description.toLowerCase().includes(searchTerm)) ||
      (item.location && item.location.toLowerCase().includes(searchTerm))

    const matchesCategory = !filters.category ||
      item.category === filters.category ||
      item.categoryName === filters.category

    const isDamaged = item.itemStatus === 'damaged' || item.damage
    const matchesDamagedFilter = !filters.showDamagedOnly || isDamaged

    return matchesSearch && matchesCategory && matchesDamagedFilter
  })

  const getStockStatus = (item) => {
    const quantity = item.quantityAvailable || item.quantity || 0
    const reorderPoint = item.reorderPoint || item.minimum_stock || 5
    
    if (quantity === 0) return 'out-of-stock'
    if (quantity <= reorderPoint) return 'low-stock'
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
                <p className="text-xs text-gray-500">Individual units tracked</p>
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
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{availableItems.length}</p>
                <p className="text-xs text-gray-500">Ready for sale</p>
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
                <p className="text-sm font-medium text-gray-600">Low Stock Categories</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockCategories.length}</p>
                <p className="text-xs text-gray-500">Need reordering</p>
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
                <p className="text-sm font-medium text-gray-600">Damaged Items</p>
                <p className="text-2xl font-bold text-gray-900">{damagedItems.length}</p>
                <p className="text-xs text-gray-500">Need attention</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4 mb-4">
            <button
              onClick={() => setFilters(prev => ({ ...prev, showDamagedOnly: false }))}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                !filters.showDamagedOnly 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              📦 All Items ({items.length})
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, showDamagedOnly: true, category: '' }))}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filters.showDamagedOnly 
                  ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse' 
                  : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              🔧 Damaged Items ({damagedItems.length})
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {filters.showDamagedOnly ? 'Search Damaged Items' : 'Search Items'}
              </label>
              <input
                type="text"
                  placeholder={filters.showDamagedOnly ? "Search damaged products..." : "Search by product, serial number, brand, model..."}
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>
              {!filters.showDamagedOnly && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                    <option value="">All Categories ({availableItems.length} available)</option>
                    {categories.map(category => {
                      const categoryData = categoryStats[category] || { available: 0, total: 0, reorderPoint: 5 }
                      const isLowStock = categoryData.available <= categoryData.reorderPoint
                      return (
                        <option 
                          key={category} 
                          value={category}
                          className={isLowStock ? 'text-red-600 font-bold' : ''}
                        >
                          {category} ({categoryData.available} available{isLowStock ? ' - LOW STOCK!' : ''})
                        </option>
                      )
                    })}
              </select>
            </div>
              )}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ search: '', category: '', showDamagedOnly: false })}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {filters.showDamagedOnly && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">🔧</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-red-800">Damaged Items Audit Workflow</h3>
                  <button
                    onClick={() => setShowWorkflowInfo(!showWorkflowInfo)}
                    className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-100"
                    title={showWorkflowInfo ? "Hide workflow details" : "Show workflow details"}
                  >
                    <svg className={`w-4 h-4 transition-transform ${showWorkflowInfo ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                {showWorkflowInfo && (
                  <div className="mt-2">
                    <p className="text-xs text-red-700">
                      <strong>Purchase Order → Audit → Inventory:</strong> Process damaged items found during audit phase.
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="bg-orange-50 border border-orange-200 rounded p-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-3 h-3 bg-orange-400 rounded-full"></span>
                          <span className="text-orange-800 font-medium text-xs">📤 Process Return (Primary)</span>
                        </div>
                        <p className="text-xs text-orange-700 ml-5 mt-1">
                          <strong>Sealed products damaged during audit → Automatic return to supplier</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {!showWorkflowInfo && (
                  <p className="text-xs text-red-600 mt-1">
                    Click to view workflow details and processing options
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'table' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
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
                            <div className="text-sm font-medium text-gray-900">{item.productDescription || item.name}</div>
                            <div className="text-xs text-gray-500">ID: {item.itemId || item.id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.brand || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.model || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {(() => {
                              const status = item.itemStatus || (item.soldDate ? 'sold' : 'available')
                              const isDamaged = item.itemStatus === 'damaged' || item.damage
                              
                              if (isDamaged) {
                                return (
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="inline-flex px-2 py-1 text-xs font-bold rounded-full border-2 bg-red-100 text-red-800 border-red-300 animate-pulse">
                                        🔧 DAMAGED
                          </span>
                                    </div>
                                    <div className="text-xs text-red-700 font-medium bg-red-50 px-2 py-1 rounded border border-red-200">
                                      Location: {item.location}
                                    </div>
                                    {item.damageType && (
                                      <div className="text-xs text-red-600">
                                        Type: {item.damageType}
                                      </div>
                                    )}
                                  </div>
                                )
                              }
                              
                              const statusColors = {
                                'available': 'bg-green-100 text-green-800 border-green-200',
                                'sold': 'bg-blue-100 text-blue-800 border-blue-200',
                                'returned': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                                'reserved': 'bg-purple-100 text-purple-800 border-purple-200',
                                'return-processing': 'bg-orange-100 text-orange-800 border-orange-200'
                              }
                              return (
                                <div className="space-y-1">
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${statusColors[status] || statusColors.available}`}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </span>
                                  {item.soldDate && (
                                    <div className="text-xs text-blue-600">
                                      Sold: {new Date(item.soldDate).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              )
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {(() => {
                            const isDamaged = item.itemStatus === 'damaged' || item.damage
                            
                            if (isDamaged && filters.showDamagedOnly) {
                              return (
                                <div className="space-y-2">
                          <div className="flex space-x-2">
                            <button
                                      onClick={() => handleViewDetails(item)}
                                      className="text-blue-600 hover:text-blue-900 transition-colors text-xs"
                                      disabled={loading}
                                    >
                                      Details
                                    </button>
                                    <button
                                      onClick={() => handleEdit(item)}
                                      className="text-green-600 hover:text-green-900 transition-colors text-xs"
                                      disabled={loading}
                                    >
                                      Edit
                                    </button>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <button
                                      onClick={() => handleProcessReturn(item)}
                                      className="w-full px-3 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded text-xs font-bold transition-colors border-2 border-orange-600"
                                      disabled={loading}
                                    >
                                      📤 PROCESS RETURN
                                    </button>
                                    
                                  </div>
                                </div>
                              )
                            }
                            
                            return (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewDetails(item)}
                                  className="text-blue-600 hover:text-blue-900 transition-colors"
                                  disabled={loading}
                                >
                                  Details
                                </button>
                                <button
                                  onClick={() => handleEdit(item)}
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
                            )
                          })()}
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
                      onClick={() => handleViewDetails(item)}
                      className="flex-1 text-blue-600 border border-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                      disabled={loading}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
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

        {(showAddForm || editingItem) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-full overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h2>
                <form onSubmit={handleAddItem} className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Product Information</h3>
                    <div className="space-y-3">
                  <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Description *</label>
                    <input
                      type="text"
                      required
                          value={newItem.productDescription}
                          onChange={(e) => setNewItem({...newItem, productDescription: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                      <div className="grid grid-cols-2 gap-4">
                  <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input
                      type="text"
                            value={newItem.brand}
                            onChange={(e) => setNewItem({...newItem, brand: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                          <input
                            type="text"
                            value={newItem.model}
                            onChange={(e) => setNewItem({...newItem, model: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price *</label>
                      <input
                        type="number"
                        required
                        min="0"
                            step="0.01"
                            value={newItem.purchasePrice}
                            onChange={(e) => setNewItem({...newItem, purchasePrice: parseFloat(e.target.value) || 0})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                            value={newItem.sellingPrice}
                            onChange={(e) => setNewItem({...newItem, sellingPrice: parseFloat(e.target.value) || 0})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point</label>
                        <input
                          type="number"
                          min="0"
                          value={newItem.reorderPoint}
                          onChange={(e) => setNewItem({...newItem, reorderPoint: parseInt(e.target.value) || 0})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Individual Item Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number *</label>
                    <input
                      type="text"
                          required
                          placeholder="e.g., ABC123456789, SN-2024-001"
                          value={newItem.serialNumber}
                          onChange={(e) => setNewItem({...newItem, serialNumber: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1">Each computer/device must have a unique serial number</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date Received</label>
                          <input
                            type="date"
                            value={newItem.dateReceived}
                            onChange={(e) => setNewItem({...newItem, dateReceived: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Item Status</label>
                          <select
                            value={newItem.itemStatus}
                            onChange={(e) => setNewItem({...newItem, itemStatus: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="available">Available</option>
                            <option value="sold">Sold</option>
                            <option value="damaged">Damaged</option>
                            <option value="returned">Returned</option>
                            <option value="reserved">Reserved</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <input
                            type="text"
                            placeholder="e.g., Warehouse A, Shelf B-3"
                            value={newItem.location}
                            onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                          <input
                            type="date"
                            value={newItem.expirationDate}
                            onChange={(e) => setNewItem({...newItem, expirationDate: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      {newItem.itemStatus === 'sold' && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 mb-2">Sales Information</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-blue-700 mb-1">Sold Date</label>
                              <input
                                type="date"
                                value={newItem.soldDate}
                                onChange={(e) => setNewItem({...newItem, soldDate: e.target.value})}
                                className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-blue-700 mb-1">Sale Price</label>
                    <input
                      type="number"
                      min="0"
                                step="0.01"
                                value={newItem.salePrice}
                                onChange={(e) => setNewItem({...newItem, salePrice: parseFloat(e.target.value) || 0})}
                                className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-blue-700 mb-1">Sold To</label>
                              <input
                                type="text"
                                placeholder="Customer name or company"
                                value={newItem.soldTo}
                                onChange={(e) => setNewItem({...newItem, soldTo: e.target.value})}
                                className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Warranty Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Duration</label>
                        <input
                          type="text"
                          placeholder="e.g., 1 year, 6 months"
                          value={newItem.warrantyDuration}
                          onChange={(e) => setNewItem({...newItem, warrantyDuration: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                      <div className="grid grid-cols-2 gap-4">
                  <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Start Date</label>
                          <input
                            type="date"
                            value={newItem.warrantyStartDate}
                            onChange={(e) => setNewItem({...newItem, warrantyStartDate: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Warranty End Date</label>
                          <input
                            type="date"
                            value={newItem.warrantyEndDate}
                            onChange={(e) => setNewItem({...newItem, warrantyEndDate: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Damage Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="damage"
                          checked={newItem.damage}
                          onChange={(e) => setNewItem({...newItem, damage: e.target.checked})}
                          className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <label htmlFor="damage" className="ml-2 block text-sm text-gray-700">
                          Mark as Damaged
                        </label>
                      </div>
                      {newItem.damage && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date Reported</label>
                            <input
                              type="date"
                              value={newItem.dateReported}
                              onChange={(e) => setNewItem({...newItem, dateReported: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Damage Type</label>
                              <select
                                value={newItem.damageType}
                                onChange={(e) => setNewItem({...newItem, damageType: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              >
                                <option value="">Select damage type</option>
                                <option value="Physical">Physical Damage</option>
                                <option value="Water">Water Damage</option>
                                <option value="Electrical">Electrical Damage</option>
                                <option value="Software">Software Issue</option>
                                <option value="Hardware">Hardware Failure</option>
                                <option value="Screen">Screen Damage</option>
                                <option value="Battery">Battery Issue</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Date Reported</label>
                              <input
                                type="date"
                                value={newItem.dateReported}
                                onChange={(e) => setNewItem({...newItem, dateReported: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Damage Description</label>
                    <textarea
                              rows="2"
                              placeholder="Describe the damage in detail..."
                              value={newItem.damageDescription}
                              onChange={(e) => setNewItem({...newItem, damageDescription: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                          </div>
                        </>
                      )}
                    </div>
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
                          productDescription: '',
                          categoryId: '',
                          purchasePrice: 0,
                          sellingPrice: 0,
                          reorderPoint: 0,
                          warrantyDuration: '',
                          model: '',
                          brand: '',
                          damage: false,
                          serialNumber: '',
                          dateReceived: '',
                          itemStatus: 'available',
                          location: '',
                          expirationDate: '',
                          damageProductId: null,
                          dateReported: '',
                          damageType: '',
                          damageDescription: '',
                          warrantyStartDate: '',
                          warrantyEndDate: '',
                          warrantyUse: 0,
                          soldDate: '',
                          soldTo: '',
                          salePrice: 0
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

        {showDetailsModal && viewingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-full overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Product Details</h2>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      setViewingItem(null)
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
      </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Product Description</label>
                        <p className="text-sm text-gray-900 font-medium">{viewingItem.productDescription || viewingItem.name || 'N/A'}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">Category</label>
                        <p className="text-sm text-gray-900">{viewingItem.category || viewingItem.categoryName || 'N/A'}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">Serial Number</label>
                        <p className="text-sm font-mono bg-blue-50 px-3 py-2 rounded border text-blue-800">
                          {viewingItem.serialNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Pricing & Stock</h3>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Purchase Price</label>
                          <p className="text-sm text-gray-900 font-medium">₱{(viewingItem.purchasePrice || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Selling Price</label>
                          <p className="text-sm text-gray-900 font-medium">₱{(viewingItem.sellingPrice || viewingItem.price || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">Status</label>
                        <div className="mt-1">
                          {(() => {
                            const status = viewingItem.itemStatus || (viewingItem.soldDate ? 'sold' : 'available')
                            const statusColors = {
                              'available': 'bg-green-100 text-green-800 border-green-200',
                              'sold': 'bg-blue-100 text-blue-800 border-blue-200',
                              'damaged': 'bg-red-100 text-red-800 border-red-200',
                              'returned': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                              'reserved': 'bg-purple-100 text-purple-800 border-purple-200'
                            }
                            return (
                              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${statusColors[status] || statusColors.available}`}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                            )
                          })()}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">Location</label>
                        <p className="text-sm text-gray-900">{viewingItem.location || 'N/A'}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">Reorder Point</label>
                        <p className="text-sm text-gray-900">{viewingItem.reorderPoint || 'N/A'} units</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Dates & Warranty</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Date Received</label>
                        <p className="text-sm text-gray-900">
                          {viewingItem.dateReceived ? new Date(viewingItem.dateReceived).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">Warranty Duration</label>
                        <p className="text-sm text-gray-900">{viewingItem.warrantyDuration || 'N/A'}</p>
                      </div>

                      {viewingItem.warrantyStartDate && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Warranty Start</label>
                            <p className="text-sm text-gray-900">
                              {new Date(viewingItem.warrantyStartDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Warranty End</label>
                            <p className="text-sm text-gray-900">
                              {viewingItem.warrantyEndDate ? new Date(viewingItem.warrantyEndDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      )}

                      {viewingItem.expirationDate && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Expiration Date</label>
                          <p className="text-sm text-gray-900">
                            {new Date(viewingItem.expirationDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Additional Information</h3>
                    
                    <div className="space-y-3">
                      {(viewingItem.soldDate || viewingItem.soldTo || viewingItem.salePrice) && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 mb-2">Sales Information</h4>
                          <div className="space-y-2">
                            {viewingItem.soldDate && (
                              <div>
                                <label className="block text-xs font-medium text-blue-700">Date Sold</label>
                                <p className="text-sm text-blue-900">
                                  {new Date(viewingItem.soldDate).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                            {viewingItem.soldTo && (
                              <div>
                                <label className="block text-xs font-medium text-blue-700">Sold To</label>
                                <p className="text-sm text-blue-900">{viewingItem.soldTo}</p>
                              </div>
                            )}
                            {viewingItem.salePrice && (
                              <div>
                                <label className="block text-xs font-medium text-blue-700">Sale Price</label>
                                <p className="text-sm text-blue-900 font-medium">₱{viewingItem.salePrice.toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {(viewingItem.damage || viewingItem.damageDescription || viewingItem.damageType) && (
                        <div className="bg-red-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-red-900 mb-2">Damage Information</h4>
                          <div className="space-y-2">
                            {viewingItem.damageType && (
                              <div>
                                <label className="block text-xs font-medium text-red-700">Damage Type</label>
                                <p className="text-sm text-red-900">{viewingItem.damageType}</p>
                              </div>
                            )}
                            {viewingItem.dateReported && (
                              <div>
                                <label className="block text-xs font-medium text-red-700">Date Reported</label>
                                <p className="text-sm text-red-900">
                                  {new Date(viewingItem.dateReported).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                            {viewingItem.damageDescription && (
                              <div>
                                <label className="block text-xs font-medium text-red-700">Description</label>
                                <p className="text-sm text-red-900">{viewingItem.damageDescription}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {viewingItem.notes && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Notes</label>
                          <p className="text-sm text-gray-900">{viewingItem.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      handleEdit(viewingItem)
                    }}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Edit Item
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      setViewingItem(null)
                    }}
                    className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
