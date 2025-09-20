import React, { useEffect, useState, useMemo } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'

export default function PurchaseOrdersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [inventoryProducts, setInventoryProducts] = useState([]) // Products from inventory
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [cart, setCart] = useState([]) // Shopping cart for selected products
  const [supplierId, setSupplierId] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [expectedDelivery, setExpectedDelivery] = useState('')
  const [notes, setNotes] = useState('')
  const [viewMode, setViewMode] = useState('suppliers') // 'suppliers', 'products', 'cart', 'history'
  const [selectedPO, setSelectedPO] = useState(null)
  const [showPOModal, setShowPOModal] = useState(false)
  const [showSupplierForm, setShowSupplierForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    address: '',
    contactNumber: '',
    email: '',
    contactPerson: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API calls when backend endpoints are ready
      // Example:
      // const [suppliersRes, inventoryRes] = await Promise.all([
      //   fetch('http://localhost:3002/api/suppliers'),
      //   fetch('http://localhost:3002/api/inventory')
      // ])
      
      // For now, using static data for visualization
      const staticSuppliers = [
        {
          id: 1,
          name: "TechSource Philippines Inc.",
          email: "orders@techsource.ph",
          contactNumber: "+63 2 8123 4567",
          address: "123 Tech Street, Makati City, Metro Manila 1200",
          contactPerson: "Maria Santos",
          specialties: ["Processors", "Motherboards", "Networking"],
          status: "active"
        },
        {
          id: 2,
          name: "Computer Depot Manila",
          email: "procurement@computerdepot.com.ph",
          contactNumber: "+63 2 8987 6543",
          address: "456 Hardware Ave, Quezon City, Metro Manila 1100",
          contactPerson: "John Rodriguez",
          specialties: ["Video Cards", "Monitors"],
          status: "active"
        },
        {
          id: 3,
          name: "Digital Solutions Corp",
          email: "sales@digitalsolutions.ph",
          contactNumber: "+63 2 8555 7777",
          address: "789 Innovation Blvd, BGC Taguig, Metro Manila 1634",
          contactPerson: "Anna Cruz",
          specialties: ["Laptops", "DSLR Camera"],
          status: "active"
        },
        {
          id: 4,
          name: "Office Supplies Plus",
          email: "orders@officesupplies.ph",
          contactNumber: "+63 2 8444 3333",
          address: "321 Business Park, Ortigas Center, Pasig 1605",
          contactPerson: "Robert Tan",
          specialties: ["Printers", "Toners", "Inks"],
          status: "active"
        }
      ]

      // Inventory products (from your existing inventory data)
      const staticInventoryProducts = [
        // Processors
        { id: 1, productDescription: "Intel Core i9-14900K Processor", brand: "Intel", model: "Core i9-14900K", category: "Processor", purchasePrice: 28000, sellingPrice: 35000, itemStatus: "available", reorderPoint: 2, supplier_id: 1 },
        { id: 2, productDescription: "AMD Ryzen 9 7950X Processor", brand: "AMD", model: "Ryzen 9 7950X", category: "Processor", purchasePrice: 32000, sellingPrice: 38000, itemStatus: "available", reorderPoint: 2, supplier_id: 1 },
        
        // Motherboards  
        { id: 3, productDescription: "ASUS ROG STRIX Z790-E Gaming WiFi", brand: "ASUS", model: "ROG STRIX Z790-E", category: "Motherboards", purchasePrice: 18000, sellingPrice: 24000, itemStatus: "available", reorderPoint: 2, supplier_id: 1 },
        { id: 4, productDescription: "MSI MAG B650 TOMAHAWK WiFi", brand: "MSI", model: "MAG B650 TOMAHAWK", category: "Motherboards", purchasePrice: 12000, sellingPrice: 16000, itemStatus: "available", reorderPoint: 3, supplier_id: 1 },
        
        // Video Cards
        { id: 5, productDescription: "NVIDIA GeForce RTX 4090 24GB", brand: "NVIDIA", model: "GeForce RTX 4090", category: "Video Cards", purchasePrice: 85000, sellingPrice: 95000, itemStatus: "available", reorderPoint: 1, supplier_id: 2 },
        { id: 6, productDescription: "AMD Radeon RX 7800 XT", brand: "AMD", model: "Radeon RX 7800 XT", category: "Video Cards", purchasePrice: 32000, sellingPrice: 38000, itemStatus: "available", reorderPoint: 2, supplier_id: 2 },
        
        // Monitors
        { id: 7, productDescription: "ASUS ROG Swift PG27AQN 27inch 360Hz", brand: "ASUS", model: "ROG Swift PG27AQN", category: "Monitors", purchasePrice: 45000, sellingPrice: 52000, itemStatus: "available", reorderPoint: 1, supplier_id: 2 },
        { id: 8, productDescription: "LG UltraGear 27GP950-B 4K 144Hz", brand: "LG", model: "UltraGear 27GP950-B", category: "Monitors", purchasePrice: 35000, sellingPrice: 42000, itemStatus: "available", reorderPoint: 2, supplier_id: 2 },
        
        // Laptops
        { id: 9, productDescription: "ASUS ROG Zephyrus G16 Gaming Laptop", brand: "ASUS", model: "ROG Zephyrus G16", category: "Laptops", purchasePrice: 95000, sellingPrice: 110000, itemStatus: "available", reorderPoint: 1, supplier_id: 3 },
        { id: 10, productDescription: "MacBook Pro 16inch M3 Max", brand: "Apple", model: "MacBook Pro 16 M3 Max", category: "Laptops", purchasePrice: 150000, sellingPrice: 165000, itemStatus: "available", reorderPoint: 1, supplier_id: 3 },
        
        // Printers
        { id: 11, productDescription: "HP LaserJet Pro M404dw Wireless", brand: "HP", model: "LaserJet Pro M404dw", category: "Printers", purchasePrice: 12000, sellingPrice: 16000, itemStatus: "available", reorderPoint: 3, supplier_id: 4 },
        { id: 12, productDescription: "Canon PIXMA G6020 MegaTank", brand: "Canon", model: "PIXMA G6020", category: "Printers", purchasePrice: 15000, sellingPrice: 19000, itemStatus: "available", reorderPoint: 3, supplier_id: 4 },
        
        // Toners & Inks
        { id: 13, productDescription: "HP 414A Black Toner Cartridge", brand: "HP", model: "414A Black", category: "Toners", purchasePrice: 3500, sellingPrice: 4800, itemStatus: "available", reorderPoint: 10, supplier_id: 4 },
        { id: 14, productDescription: "Canon PGI-280XL Black Ink", brand: "Canon", model: "PGI-280XL Black", category: "Inks", purchasePrice: 1200, sellingPrice: 1800, itemStatus: "available", reorderPoint: 20, supplier_id: 4 }
      ]

      const staticPurchaseOrders = []

      setSuppliers(staticSuppliers)
      setInventoryProducts(staticInventoryProducts)
      setPurchaseOrders(staticPurchaseOrders)
    } catch (error) {
      console.error('Error fetching data:', error)
      setSuppliers([])
      setInventoryProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Get unique categories from inventory
  const categories = [...new Set(inventoryProducts.map(p => p.category))]

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    let filtered = inventoryProducts
    
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.productDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.model.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return filtered
  }, [inventoryProducts, selectedCategory, searchTerm])

  const selectedSupplier = suppliers.find(s => s.id === supplierId)

  // Cart management functions - Serial number based (no quantities)
  const addToCart = (product) => {
    setCart(prev => {
      // Check if product already exists (each product should be unique)
      const existingItem = prev.find(item => item.id === product.id)
      if (existingItem) {
        // Product already in cart, don't add duplicate
        return prev
      }
      // Add product as unique item (no quantity needed for serial-based products)
      return [...prev, { ...product }]
    })
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  const cartTotal = useMemo(() => 
    cart.reduce((sum, item) => sum + item.purchasePrice, 0), 
    [cart]
  )

  // Supplier management functions
  const handleAddSupplier = async () => {
    try {
      setSaving(true)
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/suppliers', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newSupplier)
      // })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const supplierWithId = {
        ...newSupplier,
        id: suppliers.length + 1,
        status: 'active'
      }
      
      setSuppliers(prev => [...prev, supplierWithId])
      setNewSupplier({ name: '', address: '', contactNumber: '', email: '', contactPerson: '' })
      setShowSupplierForm(false)
      alert('Supplier added successfully!')
    } catch (error) {
      alert('Error adding supplier: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateSupplier = async () => {
    try {
      setSaving(true)
      
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSuppliers(prev => prev.map(s => 
        s.id === editingSupplier.id ? { ...newSupplier, id: editingSupplier.id } : s
      ))
      
      setEditingSupplier(null)
      setNewSupplier({ name: '', address: '', contactNumber: '', email: '', contactPerson: '' })
      setShowSupplierForm(false)
      alert('Supplier updated successfully!')
    } catch (error) {
      alert('Error updating supplier: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  // SMTP Email sending function
  const sendPurchaseOrderEmail = async (purchaseOrder) => {
    try {
      // TODO: Replace with actual API call to backend email service
      // const response = await fetch('/api/purchase-orders/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     purchaseOrder,
      //     supplier: selectedSupplier
      //   })
      // })
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log('Email sent to supplier:', selectedSupplier.email)
      console.log('Purchase Order:', purchaseOrder)
      
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      throw error
    }
  }

  const handleCheckout = async () => {
    if (!supplierId) {
      alert('Please select a supplier first')
      return
    }
    if (cart.length === 0) {
      alert('Please add at least one product to your cart')
      return
    }
    
    if (!window.confirm(`Send purchase order to ${selectedSupplier.name} (${selectedSupplier.email})?`)) {
      return
    }
    
    setSaving(true)
    try {
      // Generate PO ID
      const poId = `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`
      
      // Create new PO object
      const newPO = {
        id: poId,
        supplier_id: supplierId,
        supplier_name: selectedSupplier.name,
        supplier_email: selectedSupplier.email,
        status: 'Pending',
        total: cartTotal,
        created_date: new Date().toISOString().split('T')[0],
        expected_delivery: expectedDelivery || null,
        notes: notes || null,
        items: cart.map(item => ({
          product_name: item.productDescription,
          brand: item.brand,
          model: item.model,
          category: item.category,
          quantity: 1, // Each product is unique (serial-based)
          unit_price: item.purchasePrice,
          line_total: item.purchasePrice
        }))
      }

      // Send email to supplier
      await sendPurchaseOrderEmail(newPO)

      // Add to purchase orders list
      setPurchaseOrders(prev => [newPO, ...prev])

      // Reset cart and form
      clearCart()
      setSupplierId('')
      setExpectedDelivery('')
      setNotes('')
      
      alert(`✅ Purchase Order ${newPO.id} sent successfully to ${selectedSupplier.name}!\n\n📧 Email sent to: ${selectedSupplier.email}`)
      
      // Switch to history view to see the new PO
      setViewMode('history')
    } catch (error) {
      alert('❌ Error sending purchase order: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Modern Design */}
        <div className="mb-10">
          <div className="relative">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl opacity-5"></div>
            
            <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                {/* Title Section */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Purchase Orders</h1>
                    <p className="text-gray-600 text-lg">Smart procurement system with automated supplier communication</p>
                  </div>
                </div>
                
                {/* Enhanced Navigation Tabs */}
                <div className="flex flex-wrap gap-2">
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-2 flex flex-wrap gap-1">
                    <button
                      onClick={() => setViewMode('suppliers')}
                      className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${
                        viewMode === 'suppliers'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md transform scale-105'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <span className="text-lg">🏢</span>
                      <span>Suppliers</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        viewMode === 'suppliers' ? 'bg-white bg-opacity-20 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {suppliers.length}
                      </span>
                    </button>
                    
                    <button
                      onClick={() => setViewMode('products')}
                      className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${
                        viewMode === 'products'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md transform scale-105'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <span className="text-lg">📦</span>
                      <span>Products</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        viewMode === 'products' ? 'bg-white bg-opacity-20 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {inventoryProducts.length}
                      </span>
                    </button>
                    
                    <button
                      onClick={() => setViewMode('cart')}
                      className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-2 relative ${
                        viewMode === 'cart'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md transform scale-105'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <span className="text-lg">🛒</span>
                      <span>Cart</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        viewMode === 'cart' ? 'bg-white bg-opacity-20 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {cart.length}
                      </span>
                      {cart.length > 0 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setViewMode('history')}
                      className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${
                        viewMode === 'history'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md transform scale-105'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <span className="text-lg">📋</span>
                      <span>History</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        viewMode === 'history' ? 'bg-white bg-opacity-20 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {purchaseOrders.length}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Suppliers Management View */}
        {viewMode === 'suppliers' && (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-5"></div>
              <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Supplier Management</h2>
                    <p className="text-gray-600">Manage your supplier network and contact information</p>
                  </div>
                    <button
                      onClick={() => {
                        setNewSupplier({ name: '', address: '', contactNumber: '', email: '', contactPerson: '' })
                        setEditingSupplier(null)
                        setShowSupplierForm(true)
                      }}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      Add Supplier
                    </button>
                </div>
              </div>
            </div>

            {/* Enhanced Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {suppliers.map(supplier => (
                <div key={supplier.id} className="group bg-white rounded-2xl border border-gray-100 hover:border-purple-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  {/* Supplier Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-blue-200 transition-colors">
                        <span className="text-2xl">🏢</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-900 transition-colors">
                          {supplier.name}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">{supplier.contactPerson}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                      supplier.status === 'active' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {supplier.status}
                    </span>
                  </div>
                  
                  {/* Contact Information */}
                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">{supplier.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">{supplier.contactNumber}</span>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium leading-relaxed">{supplier.address}</span>
                    </div>
                  </div>

                  {/* Specialties */}
                  {supplier.specialties && (
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Specialties</p>
                      <div className="flex flex-wrap gap-2">
                        {supplier.specialties.map(specialty => (
                          <span key={specialty} className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full border border-purple-200">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setNewSupplier(supplier)
                        setEditingSupplier(supplier)
                        setShowSupplierForm(true)
                      }}
                      className="flex-1 text-sm bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSupplierId(supplier.id)
                        setViewMode('products')
                      }}
                      className="flex-1 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      Order
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {suppliers.length === 0 && (
              <div className="text-center py-16">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🏢</span>
                  </div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full opacity-50 -z-10"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No suppliers yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">Add your first supplier to start creating purchase orders</p>
                <button
                  onClick={() => {
                    setNewSupplier({ name: '', address: '', contactNumber: '', email: '', contactPerson: '' })
                    setEditingSupplier(null)
                    setShowSupplierForm(true)
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  Add Your First Supplier
                </button>
              </div>
            )}
          </div>
        )}

        {/* Products Catalog View - Modern Card Design */}
        {viewMode === 'products' && (
          <div className="space-y-8">
            {/* Enhanced Header with Supplier Info */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-10"></div>
              <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Product Catalog</h2>
                    <p className="text-gray-600">Browse and add products to your purchase order</p>
                  </div>
                  {selectedSupplier && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl px-6 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 text-lg">🏢</span>
                        </div>
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Ordering for</p>
                          <p className="text-purple-900 font-semibold">{selectedSupplier.name}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!selectedSupplier && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl opacity-10"></div>
                <div className="relative bg-white rounded-2xl border border-yellow-200 p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 text-xl">⚠️</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-900 mb-1">Select a supplier first</h3>
                      <p className="text-yellow-700">Go to Suppliers tab and click "Order" for a supplier to start browsing products</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedSupplier && (
              <>
                {/* Enhanced Filters with Modern Design */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Filter Products</h3>
                    <p className="text-gray-600 text-sm">Find exactly what you need</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Search Products</label>
                      <input
                        type="text"
                        placeholder="Search by name, brand, model..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setSearchTerm('')
                          setSelectedCategory('')
                        }}
                        className="w-full px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Products Grid with Modern Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="group bg-white rounded-2xl border border-gray-200 hover:border-purple-300 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full">
                      {/* Product Header */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="inline-flex px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
                            {product.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-900 transition-colors text-lg">
                          {product.productDescription}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          <span className="font-semibold">{product.brand}</span> • {product.model}
                        </p>
                      
                        {/* Price Section */}
                        <div className="mb-6">
                          <div className="flex items-baseline space-x-2 mb-2">
                            <span className="text-3xl font-bold text-purple-600">
                              ₱{product.purchasePrice.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            Reorder at {product.reorderPoint} units
                          </div>
                        </div>
                      </div>
                      
                      {/* Add to Cart Button - Always Visible */}
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        {cart.find(item => item.id === product.id) ? (
                          <button
                            disabled
                            className="w-full bg-green-100 text-green-700 px-6 py-4 rounded-xl font-semibold border-2 border-green-200 text-lg"
                          >
                            ✓ Added to Cart
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              addToCart(product)
                              // Create a more elegant notification
                              const notification = document.createElement('div')
                              notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
                              notification.innerHTML = `Added ${product.brand} ${product.model} to cart!`
                              document.body.appendChild(notification)
                              setTimeout(() => document.body.removeChild(notification), 3000)
                            }}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
                          >
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Empty State */}
                {filteredProducts.length === 0 && (
                  <div className="text-center py-16">
                    <div className="relative">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-4xl">📦</span>
                      </div>
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full opacity-50 -z-10"></div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">We couldn't find any products matching your criteria. Try adjusting your search terms or filters.</p>
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCategory('')
                      }}
                      className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Shopping Cart View - Clean Design */}
        {viewMode === 'cart' && (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-5"></div>
              <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Shopping Cart</h2>
                    <p className="text-gray-600">Review your selected products before sending to supplier</p>
                  </div>
                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors font-medium"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🛒</span>
                  </div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full opacity-50 -z-10"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">Add products from the catalog to create a purchase order</p>
                <button
                  onClick={() => setViewMode('products')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items - Clean List Design */}
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-gray-900 mb-1">{item.productDescription}</h3>
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">{item.brand}</span> {item.model}
                              </p>
                              <span className="inline-block px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                                {item.category}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-purple-600 mb-1">
                                ₱{item.purchasePrice.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500">per unit</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="text-sm text-gray-600">
                              Serial-based product • Unique item
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout Section - Clean Design */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Checkout & Send to Supplier</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Select Supplier <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={supplierId}
                        onChange={(e) => setSupplierId(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      >
                        <option value="">Choose supplier...</option>
                        {suppliers.map(supplier => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name} ({supplier.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Expected Delivery Date
                      </label>
                      <input
                        type="date"
                        value={expectedDelivery}
                        onChange={(e) => setExpectedDelivery(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Notes for Supplier
                    </label>
                    <textarea
                      rows="4"
                      placeholder="Special instructions, delivery notes, etc..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                    />
                  </div>

                  {selectedSupplier && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6 mb-8">
                      <h4 className="text-sm font-semibold text-purple-800 mb-4">Email will be sent to:</h4>
                      <div className="space-y-2 text-sm text-purple-700">
                        <p className="font-semibold text-lg">{selectedSupplier.name}</p>
                        <p>{selectedSupplier.email}</p>
                        <p>{selectedSupplier.contactNumber}</p>
                        <p>Contact: {selectedSupplier.contactPerson}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-8 border-t border-gray-200 space-y-4 md:space-y-0">
                    <div>
                      <div className="text-lg font-medium text-gray-600">Total Order Value</div>
                      <div className="text-3xl font-bold text-purple-600">₱{cartTotal.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{cart.length} unique product{cart.length !== 1 ? 's' : ''}</div>
                    </div>
                    
                    <button
                      onClick={handleCheckout}
                      disabled={saving || !supplierId || cart.length === 0}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {saving ? 'Sending Email...' : 'Send Purchase Order'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Purchase Order History View */}
        {viewMode === 'history' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Purchase Order History</h2>
            
            {purchaseOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No purchase orders yet</h3>
                <p className="text-gray-600 mb-4">Create your first purchase order to get started</p>
                <button
                  onClick={() => setViewMode('suppliers')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {purchaseOrders.map((po) => (
                        <tr key={po.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-purple-600">{po.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{po.supplier_name}</div>
                              <div className="text-sm text-gray-500">📧 {po.supplier_email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              po.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              po.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                              po.status === 'Received' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {po.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">₱{po.total.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{po.created_date}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedPO(po)
                                setShowPOModal(true)
                              }}
                              className="text-purple-600 hover:text-purple-900 transition-colors"
                            >
                              👁️ View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Supplier Form Modal */}
        {showSupplierForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Company name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="supplier@company.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={newSupplier.contactNumber}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, contactNumber: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+63 2 1234 5678"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={newSupplier.contactPerson}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, contactPerson: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    rows="3"
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Complete business address"
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex space-x-3">
                <button
                  onClick={() => setShowSupplierForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingSupplier ? handleUpdateSupplier : handleAddSupplier}
                  disabled={saving || !newSupplier.name || !newSupplier.email}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : (editingSupplier ? 'Update' : 'Add Supplier')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Order Details Modal */}
        {showPOModal && selectedPO && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPO.id}</h2>
                    <p className="text-gray-600">{selectedPO.supplier_name}</p>
                    <p className="text-sm text-gray-500">📧 Sent to: {selectedPO.supplier_email}</p>
                  </div>
                  <button
                    onClick={() => setShowPOModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      selectedPO.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedPO.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      selectedPO.status === 'Received' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedPO.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total Amount</h3>
                    <p className="text-lg font-bold text-purple-600">₱{selectedPO.total.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedPO.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                              <div className="text-xs text-gray-500">{item.brand} {item.model}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">₱{item.unit_price.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">₱{item.line_total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
