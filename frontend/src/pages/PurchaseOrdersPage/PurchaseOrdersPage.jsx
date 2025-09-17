import React from 'react'
import { useEffect, useState, useMemo } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'

export default function PurchaseOrdersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [supplierId, setSupplierId] = useState('')
  const [items, setItems] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expectedDelivery, setExpectedDelivery] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API calls when backend endpoints are ready
      // Example:
      // const [suppliersRes, productsRes] = await Promise.all([
      //   fetch('http://localhost:3002/api/suppliers', {
      //     headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      //   }),
      //   fetch('http://localhost:3002/api/products', {
      //     headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      //   })
      // ])
      // const suppliers = await suppliersRes.json()
      // const products = await productsRes.json()
      // setSuppliers(suppliers.data || [])
      // setProducts(products.data || [])
      
      // For now, initialize with empty arrays
      setSuppliers([])
      setProducts([])
    } catch (error) {
      console.error('Error fetching data:', error)
      setSuppliers([])
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [products, searchTerm])

  const selectedSupplier = suppliers.find(s => s.id === supplierId)

  const addToItems = (p) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === p.id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx].quantity += 1
        return copy
      }
      return [...prev, { ...p, quantity: 1 }]
    })
  }

  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      removeFromItems(id)
      return
    }
    setItems(prev => prev.map(x => x.id === id ? {...x, quantity: newQty} : x))
  }

  const removeFromItems = (id) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const clearItems = () => {
    setItems([])
  }

  const total = useMemo(() => items.reduce((s, i) => s + i.quantity * Number(i.price), 0), [items])

  const save = async () => {
    if (!supplierId) {
      alert('Please select a supplier')
      return
    }
    if (items.length === 0) {
      alert('Please add at least one product to the purchase order')
      return
    }
    
    setSaving(true)
    try {
      // TODO: Replace with actual API call when backend endpoint is ready
      // Example:
      // const poData = {
      //   supplier_id: supplierId,
      //   status: 'Pending',
      //   total,
      //   expected_delivery: expectedDelivery || null,
      //   notes: notes || null,
      //   items: items.map(i => ({
      //     product_id: i.id,
      //     quantity: i.quantity,
      //     unit_price: i.price,
      //     line_total: i.quantity * Number(i.price)
      //   }))
      // }
      // 
      // const response = await fetch('http://localhost:3002/api/purchase-orders', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   },
      //   body: JSON.stringify(poData)
      // })
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to create purchase order')
      // }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Reset form
      setItems([])
      setSupplierId('')
      setExpectedDelivery('')
      setNotes('')
      alert('Purchase Order created successfully!')
    } catch (error) {
      alert('Error creating purchase order: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Orders</h1>
          <p className="text-gray-600">Create purchase orders and manage supplier procurement</p>
        </div>
        
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Sidebar - Supplier & Products */}
          <div className="lg:col-span-2 space-y-6">
            {/* Supplier Selection */}
            <Card title="Supplier Information">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Supplier <span className="text-red-500">*</span>
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    value={supplierId}
                    onChange={e => setSupplierId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Choose a supplier...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {selectedSupplier && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-purple-800">
                        Supplier Selected
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-purple-700">
                      <div className="font-semibold">{selectedSupplier.name}</div>
                      {selectedSupplier.contact_email && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {selectedSupplier.contact_email}
                        </div>
                      )}
                      {selectedSupplier.contact_phone && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {selectedSupplier.contact_phone}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Product Catalog */}
            <Card title="Product Catalog">
              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Products
                  </label>
                  <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {/* Product List */}
                <div className="max-h-96 overflow-auto border border-gray-200 rounded-lg">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading products...</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      {searchTerm ? 'No products found matching your search' : 
                       products.length === 0 ? 'No products available. Product data will load when API is connected.' : 
                       'No products available'}
                    </div>
                  ) : (
                    filteredProducts.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{p.name}</div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                              {p.sku}
                            </span>
                            {p.minimum_stock && (
                              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                                Min Stock: {p.minimum_stock}
                              </span>
                            )}
                          </div>
                          <div className="text-lg font-semibold text-purple-600 mt-1">
                            ₱{Number(p.price).toFixed(2)}
                          </div>
                        </div>
                        <Button 
                          onClick={() => addToItems(p)}
                          className="ml-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Add
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Section - Purchase Order Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Order Details Form */}
            <Card title="Order Details">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    value={expectedDelivery}
                    onChange={e => setExpectedDelivery(e.target.value)}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Special instructions or notes..."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {/* Purchase Order Items */}
            <Card title="Purchase Order Items">
              <div className="space-y-6">
                {/* Items Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Items to Order</h3>
                    <p className="text-sm text-gray-600">{items.length} items in order</p>
                  </div>
                  {items.length > 0 && (
                    <Button 
                      onClick={clearItems}
                      className="text-red-600 hover:text-red-800 text-sm underline bg-transparent border-none p-0"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Items Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {items.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No items selected</h4>
                      <p className="text-gray-600">Add products from the catalog to create a purchase order</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Line Total</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {items.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4">
                                <div>
                                  <div className="font-medium text-gray-900">{item.name}</div>
                                  <div className="text-sm text-gray-500">{item.sku}</div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={e => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                  className="w-20 text-center border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                              </td>
                              <td className="px-4 py-4 text-right font-medium">
                                ₱{Number(item.price).toFixed(2)}
                              </td>
                              <td className="px-4 py-4 text-right font-semibold text-gray-900">
                                ₱{(item.quantity * Number(item.price)).toFixed(2)}
                              </td>
                              <td className="px-4 py-4 text-center">
                                <button
                                  onClick={() => removeFromItems(item.id)}
                                  className="text-red-600 hover:text-red-800 transition-colors"
                                  title="Remove item"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                {items.length > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="text-lg font-medium text-gray-900">Total Order Value:</div>
                      <div className="text-2xl font-bold text-purple-600">₱{total.toFixed(2)}</div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        onClick={save}
                        disabled={saving || !supplierId || items.length === 0}
                        className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        {saving ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Purchase Order...
                          </div>
                        ) : (
                          'Create Purchase Order'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// TODO: Move this to a proper API service when backend is ready
export async function markPOReceived(poId) {
  try {
    // Example API call:
    // const response = await fetch(`http://localhost:3002/api/purchase-orders/${poId}/receive`, {
    //   method: 'PATCH',
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    //   }
    // })
    // if (!response.ok) throw new Error('Failed to mark PO as received')
    alert('PO marking functionality will be available when backend API is implemented')
  } catch (error) {
    alert('Error marking PO as received: ' + error.message)
  }
}
