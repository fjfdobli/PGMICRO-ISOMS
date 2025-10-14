import React from 'react'
import { useEffect, useMemo, useState } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Toast from '../../components/Toast'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SalesPage() {
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [cart, setCart] = useState([])
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [modalProduct, setModalProduct] = useState(null)
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' })
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [showCartModal, setShowCartModal] = useState(false)
  const [orderStatus, setOrderStatus] = useState('Pending')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(1) // 1: Customer, 2: Billing, 3: Payment, 4: Confirmation
  const [billingInfo, setBillingInfo] = useState({ address: '', city: '', zip: '', phone: '' })
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [orderConfirmation, setOrderConfirmation] = useState(null)
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone_number: '',
    customer_type: 'Walk-in',
    address: '',
    city: '',
    country: 'Philippines',
    notes: ''
  })
  
  // Recent orders - to be fetched from API
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API call when backend endpoint is ready
        // Fetch available products from inventory
        // const response = await fetch('http://localhost:3002/api/inventory?status=available', {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        //   }
        // })
        // const inventoryData = await response.json()
        // const availableProducts = inventoryData.map(item => ({
        //   id: item.id,
        //   name: item.productDescription,
        //   sku: item.serialNumber,
        //   price: item.sellingPrice,
        //   stock: 1,
        //   description: `${item.brand} ${item.model} (${item.category})\nLocation: ${item.location}`
        // }))
        
        // Fetch customers
        // const customersResponse = await fetch('http://localhost:3002/api/customers', {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        //   }
        // })
        // const customersData = await customersResponse.json()
        
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

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) setCart(JSON.parse(savedCart))
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = products.map(p => p.description?.split('(')[1]?.split(')')[0] || 'Other')
    return ['All', ...Array.from(new Set(cats))]
  }, [products])
  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    let filtered = products
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.description?.includes(selectedCategory))
    }
    if (!searchTerm) return filtered
    return filtered.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [products, searchTerm, selectedCategory])

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type })
  }

  const addToCart = (p) => {
    if (p.stock <= 0) {
      showToast('Product is out of stock', 'error')
      return
    }
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === p.id)
      if (idx >= 0) {
        const currentQty = prev[idx].quantity
        if (currentQty >= p.stock) {
          showToast('Cannot add more items than available stock', 'error')
          return prev
        }
        const copy = [...prev]
        copy[idx].quantity += 1
        showToast('Increased quantity in cart', 'success')
        return copy
      }
      showToast('Added to cart', 'success')
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

  const discountedTotal = useMemo(() => {
    return total * (1 - discount)
  }, [total, discount])

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
      alert(`Order saved successfully!\nStatus: ${orderStatus}`)
    } catch (error) {
      alert('Error saving order: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const clearCart = () => {
    setCart([])
  }

  const addNewCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) {
      showToast('Name and email are required', 'error')
      return
    }
    const customer = {
      id: Date.now().toString(),
      ...newCustomer
    }
    setCustomers(prev => [...prev, customer])
    setSelectedCustomer(customer.id)
    setNewCustomer({
      name: '',
      email: '',
      phone_number: '',
      customer_type: 'Walk-in',
      address: '',
      city: '',
      country: 'Philippines',
      notes: ''
    })
    setShowAddCustomerModal(false)
    showToast('Customer added successfully', 'success')
  }

  const openProductModal = (product) => {
    setModalProduct(product)
    setShowProductModal(true)
  }

  // Simple coupon logic: 'DISCOUNT10' gives 10% off
  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'DISCOUNT10') {
      setDiscount(0.1)
      showToast('10% discount applied!', 'success')
    } else {
      setDiscount(0)
      showToast('Invalid coupon code', 'error')
    }
  }

  const navigate = useNavigate()

  const customerFields = ['name', 'email', 'phone_number', 'customer_type', 'address', 'city', 'country', 'notes']
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone_number: '',
    customer_type: 'Walk-in',
    address: '',
    city: '',
    country: 'Philippines',
    notes: ''
  })
  // When selectedCustomer changes, auto-fill form if found
  useEffect(() => {
    const found = customers.find(c => c.id === selectedCustomer)
    if (found) {
      setCustomerForm({
        name: found.name || '',
        email: found.email || '',
        phone_number: found.phone_number || '',
        customer_type: found.customer_type || 'Walk-in',
        address: found.address || '',
        city: found.city || '',
        country: found.country || 'Philippines',
        notes: found.notes || ''
      })
    } else {
      setCustomerForm({
        name: '',
        email: '',
        phone_number: '',
        customer_type: 'Walk-in',
        address: '',
        city: '',
        country: 'Philippines',
        notes: ''
      })
    }
  }, [selectedCustomer, customers])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(t => ({ ...t, isVisible: false }))}
        duration={2500}
      />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Order</h1>
          <p className="text-gray-600">Create new sales orders and manage customer purchases</p>
          </div>
          <Button
            onClick={() => setShowCartModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Cart ({cart.length})
          </Button>
        </div>

        {/* In the main layout, change the grid to two columns: left (customer info + recent orders), right (product catalog) */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Sidebar - Customer & Recent Orders */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <Card title="Customer Information">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Customer <span className="text-red-500">*</span>
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors mb-2"
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
                {/* All customer fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={customerForm.name}
                    onChange={e => setCustomerForm(f => ({ ...f, name: e.target.value }))}
                    className="border border-gray-300 rounded-lg p-3"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={customerForm.email}
                    onChange={e => setCustomerForm(f => ({ ...f, email: e.target.value }))}
                    className="border border-gray-300 rounded-lg p-3"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={customerForm.phone_number}
                    onChange={e => setCustomerForm(f => ({ ...f, phone_number: e.target.value }))}
                    className="border border-gray-300 rounded-lg p-3"
                  />
        <select
          value={customerForm.customer_type}
          onChange={e => setCustomerForm(f => ({ ...f, customer_type: e.target.value }))}
          className="border border-gray-300 rounded-lg p-3"
        >
          <option value="Walk-in">Walk-in</option>
          <option value="Contract">Contract</option>
        </select>
                  <input
                    type="text"
                    placeholder="Address"
                    value={customerForm.address}
                    onChange={e => setCustomerForm(f => ({ ...f, address: e.target.value }))}
                    className="border border-gray-300 rounded-lg p-3"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={customerForm.city}
                    onChange={e => setCustomerForm(f => ({ ...f, city: e.target.value }))}
                    className="border border-gray-300 rounded-lg p-3"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={customerForm.country}
                    onChange={e => setCustomerForm(f => ({ ...f, country: e.target.value }))}
                    className="border border-gray-300 rounded-lg p-3"
                  />
                  <input
                    type="text"
                    placeholder="Notes"
                    value={customerForm.notes}
                    onChange={e => setCustomerForm(f => ({ ...f, notes: e.target.value }))}
                    className="border border-gray-300 rounded-lg p-3"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => setShowAddCustomerModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium ml-2"
                  >
                    Add New Customer
                  </Button>
                </div>
              </div>
            </Card>
            {/* Recent Orders */}
            <Card title="Recent Orders">
              <div className="space-y-2">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex justify-between items-center border-b last:border-b-0 py-2">
                    <div>
                      <div className="font-medium text-gray-900">{order.id}</div>
                      <div className="text-xs text-gray-500">{order.date}</div>
                    </div>
                    <div className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                      order.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      order.status === 'Declined' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </div>
                    <div className="text-sm font-bold text-blue-600">₱{order.total.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          {/* Product Catalog on the right */}
          <div className="lg:col-span-3">
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
                {/* Category Dropdown above product table */}
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm font-medium text-gray-700">Category:</label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                    </div>
                {/* Product Table */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-[520px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Add</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-900 cursor-pointer" onClick={() => openProductModal(p)}>{p.name}</div>
                            <div className="text-xs text-gray-500">{p.sku}</div>
                            <div className="text-xs text-gray-400">{p.description}</div>
                          </td>
                          <td className="px-4 py-4 text-right font-semibold text-blue-600">₱{Number(p.price).toFixed(2)}</td>
                          <td className="px-4 py-4 text-center">{p.stock} in stock</td>
                          <td className="px-4 py-4 text-center">
                            <input
                              type="number"
                              min="1"
                              max={p.stock}
                              value={cart.find(i => i.id === p.id)?.quantity || 1}
                              onChange={e => updateQuantity(p.id, parseInt(e.target.value) || 1)}
                              className="w-16 text-center border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </td>
                          <td className="px-4 py-4 text-center">
                        <Button 
                          onClick={() => addToCart(p)}
                          disabled={p.stock <= 0}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          {p.stock <= 0 ? 'Out of Stock' : 'Add'}
                        </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        </div>
                  </div>
      {/* Product Details Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title={modalProduct?.name || 'Product Details'}
        size="md"
      >
        {modalProduct && (
          <div className="space-y-4">
            <div className="text-gray-700 text-sm">SKU: {modalProduct.sku}</div>
            <div className="text-gray-700 text-sm">Stock: {modalProduct.stock}</div>
            <div className="text-lg font-semibold text-blue-600">₱{Number(modalProduct.price).toFixed(2)}</div>
            {modalProduct.description && (
              <div className="text-gray-600 text-sm">{modalProduct.description}</div>
            )}
                    <Button 
              onClick={() => {
                addToCart(modalProduct)
                setShowProductModal(false)
              }}
              disabled={modalProduct.stock <= 0}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {modalProduct.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
          </div>
        )}
      </Modal>
      {/* Cart Modal: add order status dropdown above Save Order */}
      <Modal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        title="Order Details"
        size="lg"
      >
        <div className="space-y-6">
          {/* Cart Items Table (reuse previous order summary table) */}
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
                                  <div className="font-medium text-gray-900">{item.name}</div>
                                  <div className="text-sm text-gray-500">{item.sku}</div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <input
                                  type="number"
                                  min="1"
                                  max={item.stock}
                                  value={item.quantity}
                            onChange={e => updateQuantity(item.id, parseInt(e.target.value) || 1)}
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
          {/* Order Summary and Coupon */}
                {cart.length > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="text-lg font-medium text-gray-900">Order Total:</div>
                <div className="text-2xl font-bold text-blue-600">₱{discountedTotal.toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  onClick={applyCoupon}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Apply
                </Button>
                {discount > 0 && (
                  <span className="ml-2 text-green-600 font-medium">{Math.round(discount * 100)}% off</span>
                )}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-medium text-gray-700">Order Status:</label>
                <select
                  value={orderStatus}
                  onChange={e => setOrderStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Pending">Pending</option>
                  <option value="Declined">Declined</option>
                  <option value="Approved">Approved</option>
                </select>
                    </div>
                    <div className="flex gap-4">
                      <Button 
                  onClick={() => { setShowCartModal(false); setShowCheckoutModal(true); setCheckoutStep(selectedCustomer ? 2 : 1); }}
                  disabled={cart.length === 0}
                  className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium mt-4"
                >
                  Proceed to Checkout
                      </Button>
                    </div>
                  </div>
                )}
              </div>
      </Modal>
      {/* Step-by-step Checkout Modal */}
      <Modal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        title={
          checkoutStep === 1 ? 'Customer Information' :
          checkoutStep === 2 ? 'Billing Information' :
          checkoutStep === 3 ? 'Payment' :
          checkoutStep === 4 ? 'Order Confirmation' : ''
        }
        size="md"
      >
        {/* Step 1: Customer Selection/Creation */}
        {checkoutStep === 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer <span className="text-red-500">*</span></label>
            <select
              className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors mb-4"
              value={selectedCustomer}
              onChange={e => { const v = e.target.value; setSelectedCustomer(v); if (v) setCheckoutStep(2); }}
            >
              <option value="">Choose a customer...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <Button
              onClick={() => setShowAddCustomerModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium mb-4"
            >
              Add New Customer
            </Button>
            <Button
              onClick={() => setCheckoutStep(2)}
              disabled={!selectedCustomer}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium ml-2"
            >
              Next
            </Button>
          </div>
        )}
        {/* Step 2: Billing Information */}
        {checkoutStep === 2 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
            <input
              type="text"
              placeholder="Address"
              value={billingInfo.address}
              onChange={e => setBillingInfo({ ...billingInfo, address: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 mb-2"
            />
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="City"
                value={billingInfo.city}
                onChange={e => setBillingInfo({ ...billingInfo, city: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg p-3"
              />
              <input
                type="text"
                placeholder="ZIP Code"
                value={billingInfo.zip}
                onChange={e => setBillingInfo({ ...billingInfo, zip: e.target.value })}
                className="w-32 border border-gray-300 rounded-lg p-3"
              />
            </div>
            <input
              type="text"
              placeholder="Phone Number"
              value={billingInfo.phone}
              onChange={e => setBillingInfo({ ...billingInfo, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4"
            />
            <Button
              onClick={() => setCheckoutStep(3)}
              disabled={!billingInfo.address || !billingInfo.city || !billingInfo.zip || !billingInfo.phone}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Next
            </Button>
          </div>
        )}
        {/* Step 3: Payment (simulate) */}
        {checkoutStep === 3 && (
          <div className="text-center">
            {/* Order items summary */}
            <div className="text-left mb-4 border border-gray-200 rounded-lg overflow-hidden">
              {cart.length === 0 ? (
                <div className="p-4 text-gray-600 text-sm">No items in cart.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cart.map(item => (
                        <tr key={item.id}>
                          <td className="px-4 py-2">
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.sku}</div>
                          </td>
                          <td className="px-4 py-2 text-center">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">₱{Number(item.price).toFixed(2)}</td>
                          <td className="px-4 py-2 text-right font-semibold">₱{(item.quantity * Number(item.price)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="mb-4">
              <div className="text-lg font-semibold">Order Total:</div>
              <div className="text-2xl font-bold text-blue-600 mb-2">₱{discountedTotal.toFixed(2)}</div>
            </div>
            <Button
              onClick={async () => {
                setPaymentProcessing(true)
                await new Promise(res => setTimeout(res, 1500))
                setPaymentProcessing(false)
                setOrderConfirmation({
                  customer: customers.find(c => c.id === selectedCustomer),
                  billing: billingInfo,
                  total: discountedTotal,
                  items: cart
                })
                setCart([])
                setCheckoutStep(4)
              }}
              disabled={paymentProcessing}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {paymentProcessing ? 'Processing Payment...' : 'Pay'}
            </Button>
          </div>
        )}
        {/* Step 4: Confirmation */}
        {checkoutStep === 4 && orderConfirmation && (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-green-600 mb-2">Order Placed!</h3>
            <p className="mb-4">Thank you, {orderConfirmation.customer?.name || 'Customer'}.</p>
            <div className="mb-4">
              <div className="font-semibold">Order Summary:</div>
              <ul className="mb-2">
                {orderConfirmation.items.map(item => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.name} x {item.quantity}</span>
                    <span>₱{(item.quantity * Number(item.price)).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>₱{orderConfirmation.total.toFixed(2)}</span>
              </div>
              <div className="mt-2 text-left text-sm text-gray-700">
                <div><b>Billing Address:</b> {orderConfirmation.billing.address}, {orderConfirmation.billing.city}, {orderConfirmation.billing.zip}</div>
                <div><b>Phone:</b> {orderConfirmation.billing.phone}</div>
        </div>
      </div>
            <Button
              onClick={() => setShowCheckoutModal(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Close
            </Button>
          </div>
        )}
        </Modal>
        
        {/* Add Customer Modal */}
        <Modal
          isOpen={showAddCustomerModal}
          onClose={() => setShowAddCustomerModal(false)}
          title="Add New Customer"
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name *"
                value={newCustomer.name}
                onChange={e => setNewCustomer(f => ({ ...f, name: e.target.value }))}
                className="border border-gray-300 rounded-lg p-3"
              />
              <input
                type="email"
                placeholder="Email *"
                value={newCustomer.email}
                onChange={e => setNewCustomer(f => ({ ...f, email: e.target.value }))}
                className="border border-gray-300 rounded-lg p-3"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newCustomer.phone_number}
                onChange={e => setNewCustomer(f => ({ ...f, phone_number: e.target.value }))}
                className="border border-gray-300 rounded-lg p-3"
              />
              <select
                value={newCustomer.customer_type}
                onChange={e => setNewCustomer(f => ({ ...f, customer_type: e.target.value }))}
                className="border border-gray-300 rounded-lg p-3"
              >
                <option value="Walk-in">Walk-in</option>
                <option value="Contract">Contract</option>
              </select>
              <input
                type="text"
                placeholder="Address"
                value={newCustomer.address}
                onChange={e => setNewCustomer(f => ({ ...f, address: e.target.value }))}
                className="border border-gray-300 rounded-lg p-3"
              />
              <input
                type="text"
                placeholder="City"
                value={newCustomer.city}
                onChange={e => setNewCustomer(f => ({ ...f, city: e.target.value }))}
                className="border border-gray-300 rounded-lg p-3"
              />
              <input
                type="text"
                placeholder="Country"
                value={newCustomer.country}
                onChange={e => setNewCustomer(f => ({ ...f, country: e.target.value }))}
                className="border border-gray-300 rounded-lg p-3"
              />
              <input
                type="text"
                placeholder="Notes"
                value={newCustomer.notes}
                onChange={e => setNewCustomer(f => ({ ...f, notes: e.target.value }))}
                className="border border-gray-300 rounded-lg p-3"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setShowAddCustomerModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={addNewCustomer}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add Customer
              </Button>
            </div>
          </div>
        </Modal>
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

