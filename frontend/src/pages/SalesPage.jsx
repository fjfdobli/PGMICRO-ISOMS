import React from 'react'
import { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'

export default function SalesPage() {
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [cart, setCart] = useState([])
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API calls when backend endpoints are ready
        // Example:
        // const [customersRes, productsRes] = await Promise.all([
        //   fetch('http://localhost:3002/api/customers'),
        //   fetch('http://localhost:3002/api/products')
        // ])
        // const customers = await customersRes.json()
        // const products = await productsRes.json()
        // setCustomers(customers.data || [])
        // setProducts(products.data || [])
        
        // For now, initialize with empty arrays
        setCustomers([])
        setProducts([])
      } catch (error) {
        console.error('Error fetching data:', error)
        setCustomers([])
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [products, searchTerm])

  const addToCart = (p) => {
    if (p.stock <= 0) {
      alert('Product is out of stock')
      return
    }
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === p.id)
      if (idx >= 0) {
        const currentQty = prev[idx].quantity
        if (currentQty >= p.stock) {
          alert('Cannot add more items than available stock')
          return prev
        }
        const copy = [...prev]
        copy[idx].quantity += 1
        return copy
      }
      return [...prev, { ...p, quantity: 1 }]
    })
  }

  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id)
      return
    }
    const product = products.find(p => p.id === id)
    if (newQty > product.stock) {
      alert('Quantity cannot exceed available stock')
      return
    }
    setCart(prev => prev.map(x => x.id === id ? {...x, quantity: newQty} : x))
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const total = useMemo(() => cart.reduce((s, i) => s + i.quantity * Number(i.price), 0), [cart])

  const saveOrder = async () => {
    if (!selectedCustomer) {
      alert('Please select a customer')
      return
    }
    if (cart.length === 0) {
      alert('Please add at least one product to the cart')
      return
    }
    
    setSaving(true)
    try {
      // TODO: Replace with actual API call when backend endpoint is ready
      // Example:
      // const orderData = {
      //   customer_id: selectedCustomer,
      //   status: 'Pending',
      //   total: total,
      //   items: cart.map(c => ({
      //     product_id: c.id,
      //     quantity: c.quantity,
      //     unit_price: c.price,
      //     line_total: c.quantity * Number(c.price)
      //   }))
      // }
      // 
      // const response = await fetch('http://localhost:3002/api/orders', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   },
      //   body: JSON.stringify(orderData)
      // })
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to save order')
      // }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setCart([])
      setSelectedCustomer('')
      alert('Order saved successfully!')
    } catch (error) {
      alert('Error saving order: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const clearCart = () => {
    setCart([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Order</h1>
          <p className="text-gray-600">Create new sales orders and manage customer purchases</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Sidebar - Customer & Products */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <Card title="Customer Information">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Customer <span className="text-red-500">*</span>
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    value={selectedCustomer}
                    onChange={e => setSelectedCustomer(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Choose a customer...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                {selectedCustomer && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-green-800">
                        Customer Selected
                      </span>
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
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {/* Product List */}
                <div className="max-h-96 overflow-auto border border-gray-200 rounded-lg">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              p.stock > 10 ? 'bg-green-100 text-green-800' :
                              p.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              Stock: {p.stock}
                            </span>
                          </div>
                          <div className="text-lg font-semibold text-blue-600 mt-1">
                            ₱{Number(p.price).toFixed(2)}
                          </div>
                        </div>
                        <Button 
                          onClick={() => addToCart(p)}
                          disabled={p.stock <= 0}
                          className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          {p.stock <= 0 ? 'Out of Stock' : 'Add'}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Section - Cart & Order Summary */}
          <div className="lg:col-span-3">
            <Card title="Order Details">
              <div className="space-y-6">
                {/* Cart Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Cart Items</h3>
                    <p className="text-sm text-gray-600">{cart.length} items in cart</p>
                  </div>
                  {cart.length > 0 && (
                    <Button 
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-800 text-sm underline bg-transparent border-none p-0"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Cart Items */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {cart.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m4.5 2a1 1 0 102 0 1 1 0 00-2 0zm8 0a1 1 0 102 0 1 1 0 00-2 0z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h4>
                      <p className="text-gray-600">Add products from the catalog to create an order</p>
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
                          {cart.map(item => (
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
                                  max={item.stock}
                                  value={item.quantity}
                                  onChange={e => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                  className="w-20 text-center border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                  onClick={() => removeFromCart(item.id)}
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
                {cart.length > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="text-lg font-medium text-gray-900">Order Total:</div>
                      <div className="text-2xl font-bold text-blue-600">₱{total.toFixed(2)}</div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        onClick={saveOrder}
                        disabled={saving || !selectedCustomer || cart.length === 0}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        {saving ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving Order...
                          </div>
                        ) : (
                          'Save Order'
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
export async function completeOrder(orderId) {
  try {
    // Example API call:
    // const response = await fetch(`http://localhost:3002/api/orders/${orderId}/complete`, {
    //   method: 'PATCH',
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    //   }
    // })
    // if (!response.ok) throw new Error('Failed to complete order')
    alert('Order completion functionality will be available when backend API is implemented')
  } catch (error) {
    alert('Error completing order: ' + error.message)
  }
}