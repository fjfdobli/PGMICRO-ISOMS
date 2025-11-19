import React, { useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import Card from '../../components/Card'
import Button from '../../components/Button'

export default function PurchaseOrdersPage() {
  const { user: reduxUser, isAuthenticated } = useSelector(state => state.auth)
  const [currentUser, setCurrentUser] = useState(null)
  const [userLoading, setUserLoading] = useState(false)
  
  useEffect(() => {
    const authToken = localStorage.getItem('authToken')
    
    if (reduxUser) {
      setCurrentUser(reduxUser)
    } else if (authToken && !currentUser && !userLoading) {
      fetchCurrentUser()
    }
  }, [reduxUser, isAuthenticated, currentUser, userLoading])
  
  const fetchCurrentUser = async () => {
    setUserLoading(true)
    try {
      const response = await fetch('http://localhost:3002/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setUserLoading(false)
    }
  }
  
  const user = reduxUser || currentUser
  const [suppliers, setSuppliers] = useState([])
  const [inventoryProducts, setInventoryProducts] = useState([]) 
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [cart, setCart] = useState([]) 
  const [supplierId, setSupplierId] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [expectedDelivery, setExpectedDelivery] = useState('')
  const [notes, setNotes] = useState('')
  const [viewMode, setViewMode] = useState('suppliers')
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
  
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPOForPayment, setSelectedPOForPayment] = useState(null)
  const [paymentData, setPaymentData] = useState({
    paymentDate: '',
    amount: '',
    paymentMethod: '',
    bankDetails: {
      accountNumber: '',
      bankName: '',
      referenceNumber: ''
    },
    checkDetails: {
      checkNumber: '',
      bankName: '',
      checkDate: ''
    },
    cardDetails: {
      cardNumber: '',
      cardHolderName: '',
      transactionId: ''
    },
    onlineDetails: {
      platform: '',
      transactionId: '',
      accountEmail: ''
    },
    cashDetails: {
      receivedBy: '',
      receiptNumber: ''
    }
  })

  const [showExpensesModal, setShowExpensesModal] = useState(false)
  const [expenses, setExpenses] = useState([])
  const [expenseFilters, setExpenseFilters] = useState({
    dateFrom: '',
    dateTo: '',
    type: '',
    minAmount: '',
    maxAmount: '',
    search: ''
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
    
      const staticPurchaseOrders = []
      const savedSuppliers = localStorage.getItem('purchaseOrder_suppliers')
      if (savedSuppliers) {
        try {
          const parsedSuppliers = JSON.parse(savedSuppliers)
          setSuppliers(parsedSuppliers)
        } catch (error) {
          console.error('Error parsing saved suppliers:', error)
      setSuppliers([])
        }
      } else {
        setSuppliers([])
      }
      
      setInventoryProducts(staticInventoryProducts)
      setPurchaseOrders(staticPurchaseOrders)
      const savedExpenses = localStorage.getItem('company_expenses')
      if (savedExpenses) {
        try {
          const parsedExpenses = JSON.parse(savedExpenses)
          setExpenses(parsedExpenses)
        } catch (error) {
          console.error('Error parsing saved expenses:', error)
          setExpenses([])
        }
      } else {
        setExpenses([])
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
      setSuppliers([])
      setInventoryProducts([])
    } finally {
      setLoading(false)
    }
  }

  const categories = [...new Set(inventoryProducts.map(p => p.category))]

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

  const addToCart = (product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id)
      if (existingItem) {
        return prev
      }
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

  const handleAddSupplier = async () => {
    try {
      setSaving(true)
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/suppliers', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newSupplier)
      // })
      
      await new Promise(resolve => setTimeout(resolve, 500))
      const maxId = suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) : 0
      
      const supplierWithId = {
        ...newSupplier,
        id: maxId + 1,
        status: 'active',
        specialties: [] 
      }
      
      const updatedSuppliers = [...suppliers, supplierWithId]
      setSuppliers(updatedSuppliers)
      localStorage.setItem('purchaseOrder_suppliers', JSON.stringify(updatedSuppliers))
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
      await new Promise(resolve => setTimeout(resolve, 500))
      const updatedSuppliers = suppliers.map(s => 
        s.id === editingSupplier.id ? { ...newSupplier, id: editingSupplier.id } : s
      )
      setSuppliers(updatedSuppliers)
      localStorage.setItem('purchaseOrder_suppliers', JSON.stringify(updatedSuppliers))
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

  const handleRemoveSupplier = async (supplierId, supplierName) => {
    const hasOrders = purchaseOrders.some(po => po.supplier_id === supplierId)
    
    if (hasOrders) {
      alert(`Cannot remove ${supplierName}. This supplier has existing purchase orders. Please complete or cancel all orders first.`)
      return
    }

    if (!window.confirm(`Are you sure you want to remove "${supplierName}"?\n\nThis action cannot be undone.`)) {
      return
    }
    
    try {
    setSaving(true)
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/suppliers/${supplierId}`, {
      //   method: 'DELETE'
      // })
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const updatedSuppliers = suppliers.filter(s => s.id !== supplierId)
      setSuppliers(updatedSuppliers)
      localStorage.setItem('purchaseOrder_suppliers', JSON.stringify(updatedSuppliers))
      alert(`${supplierName} has been removed successfully!`)
    } catch (error) {
      alert('Error removing supplier: ' + error.message)
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
      
      // TODO: Replace with actual SMTP service
      
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      throw error
    }
  }

  // Payment handling functions
  const handleAddPayment = async () => {
    if (!paymentData.paymentDate || !paymentData.amount || !paymentData.paymentMethod) {
      alert('Please fill in all payment fields')
      return
    }

    if (parseFloat(paymentData.amount) <= 0) {
      alert('Payment amount must be greater than 0')
      return
    }

    try {
      setSaving(true)
      
      // TODO: Replace with actual API call to record payment
      // const response = await fetch(`/api/purchase-orders/${selectedPOForPayment.id}/payment`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(paymentData)
      // })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update the purchase order with payment information
      const updatedPOs = purchaseOrders.map(po => 
        po.id === selectedPOForPayment.id 
          ? { 
              ...po, 
              paymentDate: paymentData.paymentDate,
              paidAmount: parseFloat(paymentData.amount),
              paymentMethod: paymentData.paymentMethod,
              status: parseFloat(paymentData.amount) >= po.total ? 'Paid' : 'Partially Paid'
            }
          : po
      )
      
      setPurchaseOrders(updatedPOs)
      localStorage.setItem('purchaseOrders', JSON.stringify(updatedPOs))
      recordPOPaymentAsExpense(selectedPOForPayment, paymentData)

      setPaymentData({ 
        paymentDate: '', 
        amount: '', 
        paymentMethod: '',
        bankDetails: { accountNumber: '', bankName: '', referenceNumber: '' },
        checkDetails: { checkNumber: '', bankName: '', checkDate: '' },
        cardDetails: { cardNumber: '', cardHolderName: '', transactionId: '' },
        onlineDetails: { platform: '', transactionId: '', accountEmail: '' },
        cashDetails: { receivedBy: '', receiptNumber: '' }
      })
      setShowPaymentModal(false)
      setSelectedPOForPayment(null)
      
      alert('Payment recorded successfully!')
    } catch (error) {
      alert('Error recording payment: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const openPaymentModal = (po) => {
    setSelectedPOForPayment(po)
    setPaymentData({
      paymentDate: new Date().toISOString().split('T')[0],
      amount: po.total.toString(), 
      paymentMethod: '',
      bankDetails: {
        accountNumber: '',
        bankName: '',
        referenceNumber: ''
      },
      checkDetails: {
        checkNumber: '',
        bankName: '',
        checkDate: ''
      },
      cardDetails: {
        cardNumber: '',
        cardHolderName: '',
        transactionId: ''
      },
      onlineDetails: {
        platform: '',
        transactionId: '',
        accountEmail: ''
      },
      cashDetails: {
        receivedBy: '',
        receiptNumber: ''
      }
    })
    setShowPaymentModal(true)
  }

  const addExpense = (expenseData) => {
    const newExpense = {
      id: `EXP-${new Date().getFullYear()}-${String(expenses.length + 1).padStart(4, '0')}`,
      expenseDate: expenseData.date,
      expenseType: expenseData.type,
      expenseAmount: parseFloat(expenseData.amount),
      description: expenseData.description,
      paymentMethod: expenseData.paymentMethod,
      supplier: expenseData.supplier || null,
      purchaseOrderId: expenseData.purchaseOrderId || null,
      createdAt: new Date().toISOString(),
      createdBy: user ? `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() || user.email : 'System User'
    }

    const updatedExpenses = [newExpense, ...expenses]
    setExpenses(updatedExpenses)
    localStorage.setItem('company_expenses', JSON.stringify(updatedExpenses))
    return newExpense
  }

  const recordPOPaymentAsExpense = (poData, paymentData) => {
    const expenseData = {
      date: paymentData.paymentDate,
      type: 'Purchase Order Payment',
      amount: paymentData.amount,
      description: `Payment for PO ${poData.id} - ${poData.supplier_name}`,
      paymentMethod: paymentData.paymentMethod,
      supplier: poData.supplier_name,
      purchaseOrderId: poData.id
    }
    
    return addExpense(expenseData)
  }

  const getFilteredExpenses = () => {
    let filtered = expenses

    if (expenseFilters.dateFrom) {
      filtered = filtered.filter(exp => exp.expenseDate >= expenseFilters.dateFrom)
    }
    
    if (expenseFilters.dateTo) {
      filtered = filtered.filter(exp => exp.expenseDate <= expenseFilters.dateTo)
    }
    
    if (expenseFilters.type) {
      filtered = filtered.filter(exp => exp.expenseType.toLowerCase().includes(expenseFilters.type.toLowerCase()))
    }
    
    if (expenseFilters.minAmount) {
      filtered = filtered.filter(exp => exp.expenseAmount >= parseFloat(expenseFilters.minAmount))
    }
    
    if (expenseFilters.maxAmount) {
      filtered = filtered.filter(exp => exp.expenseAmount <= parseFloat(expenseFilters.maxAmount))
    }
    
    if (expenseFilters.search) {
      const searchLower = expenseFilters.search.toLowerCase()
      filtered = filtered.filter(exp => 
        exp.description.toLowerCase().includes(searchLower) ||
        exp.expenseType.toLowerCase().includes(searchLower) ||
        (exp.supplier && exp.supplier.toLowerCase().includes(searchLower)) ||
        exp.id.toLowerCase().includes(searchLower)
      )
    }

    return filtered.sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate))
  }

  const getExpensesSummary = () => {
    const filtered = getFilteredExpenses()
    const total = filtered.reduce((sum, exp) => sum + exp.expenseAmount, 0)
    const byType = filtered.reduce((acc, exp) => {
      acc[exp.expenseType] = (acc[exp.expenseType] || 0) + exp.expenseAmount
      return acc
    }, {})
    
    return { total, count: filtered.length, byType }
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
      
      // Determine employee information based on current user
      let employeeInfo = {
        handled_by_employee_id: null,
        handled_by_employee_name: 'System User',
        handled_by_employee_email: 'system@company.com'
      }

      if (user) {
        const firstName = user.first_name || user.firstName || user.fname || ''
        const lastName = user.last_name || user.lastName || user.lname || ''
        const email = user.email || user.emailAddress || ''
        const fullName = `${firstName} ${lastName}`.trim()
        
        employeeInfo = {
          handled_by_employee_id: user.id,
          handled_by_employee_name: fullName || email || 'Unknown User',
          handled_by_employee_email: email || 'no-email@company.com'
        }
      }
      
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
        ...employeeInfo,
        created_at: new Date().toISOString(),
        items: cart.map(item => ({
          product_name: item.productDescription,
          brand: item.brand,
          model: item.model,
          category: item.category,
          quantity: 1, 
          unit_price: item.purchasePrice,
          line_total: item.purchasePrice
        }))
      }

      await sendPurchaseOrderEmail(newPO)
      newPO.status = 'Sent'
      setPurchaseOrders(prev => [newPO, ...prev])
      clearCart()
      setSupplierId('')
      setExpectedDelivery('')
      setNotes('')
      
      alert(`Purchase Order ${newPO.id} sent successfully to ${selectedSupplier.name}!\n\nEmail sent to: ${selectedSupplier.email}\n👤 Handled by: ${newPO.handled_by_employee_name}`)
      
      setViewMode('history')
    } catch (error) {
      alert('Error sending purchase order: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl opacity-5"></div>
            <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Purchase Orders</h1>
                    <p className="text-gray-600 text-lg">Smart procurement system with automated supplier communication</p>
                    {user && (
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-xs font-semibold">
                            {user.first_name?.[0] || user.firstName?.[0] || ''}{user.last_name?.[0] || user.lastName?.[0] || ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Current user: <span className="font-medium text-gray-700">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}` 
                              : user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.email || 'Unknown User'
                            }
                          </span>
                          {user.account_type === 'admin' && (
                            <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                              Administrator
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
        </div>
        
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

                    <button
                      onClick={() => setShowExpensesModal(true)}
                      className="px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm"
                    >
                      <span className="text-lg">💰</span>
                      <span>Expenses</span>
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
                        {expenses.length}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {viewMode === 'suppliers' && (
          <div className="space-y-8">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {suppliers.map(supplier => (
                <div key={supplier.id} className="group bg-white rounded-2xl border border-gray-100 hover:border-purple-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
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
                  
                  <div className="flex space-x-2">
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
                    <button
                      onClick={() => handleRemoveSupplier(supplier.id, supplier.name)}
                      disabled={saving}
                      className="text-sm bg-red-100 text-red-600 px-4 py-3 rounded-xl hover:bg-red-200 hover:text-red-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove supplier"
                    >
                      🗑️
                    </button>
                    </div>
                </div>
              ))}
            </div>

            {suppliers.length === 0 && (
              <div className="text-center py-16">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🏢</span>
                  </div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full opacity-50 -z-10"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No suppliers added yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">Start by adding your first supplier using the "Add Supplier" button above to begin creating purchase orders and managing your procurement process.</p>
                  </div>
                )}
              </div>
        )}

        {viewMode === 'products' && (
          <div className="space-y-8">
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="group bg-white rounded-2xl border border-gray-200 hover:border-purple-300 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full">
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handled By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
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
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-blue-600 text-sm font-semibold">
                                  {po.handled_by_employee_name ? po.handled_by_employee_name.split(' ').map(n => n[0]).join('') : '?'}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {po.handled_by_employee_name || 'Unknown Employee'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {po.handled_by_employee_email || 'No email'}
                                </div>
                              </div>
                            </div>
                              </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              po.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              po.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                              po.status === 'Processing' ? 'bg-indigo-100 text-indigo-800' :
                              po.status === 'Received' ? 'bg-green-100 text-green-800' :
                              po.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                              po.status === 'Partially Paid' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {po.status}
                            </span>
                              </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">₱{po.total.toLocaleString()}</div>
                              </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {po.paidAmount ? (
                              <div>
                                <div className="text-sm font-medium text-green-600">₱{po.paidAmount.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">{po.paymentMethod}</div>
                                <div className="text-xs text-gray-500">{po.paymentDate}</div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Not paid</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{po.created_date}</div>
                              </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button
                              onClick={() => {
                                setSelectedPO(po)
                                setShowPOModal(true)
                              }}
                              className="text-purple-600 hover:text-purple-900 transition-colors"
                            >
                              View
                                </button>
                            {po.status === 'Received' && (!po.paidAmount || po.paidAmount < po.total) && (
                              <button
                                onClick={() => openPaymentModal(po)}
                                className="text-green-600 hover:text-green-900 transition-colors ml-3"
                              >
                                Pay
                              </button>
                            )}
                            {(po.status === 'Sent' || po.status === 'Processing') && (
                              <button
                                onClick={() => {
                                  setPurchaseOrders(prev => prev.map(p => 
                                    p.id === po.id ? { ...p, status: 'Received' } : p
                                  ))
                                  alert('Order marked as received! You can now process payment.')
                                }}
                                className="text-blue-600 hover:text-blue-900 transition-colors ml-3"
                              >
                                Mark Received
                              </button>
                            )}
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

        {showPaymentModal && selectedPOForPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Record Payment</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      PO: {selectedPOForPayment.id} • {selectedPOForPayment.supplier_name}
                    </p>
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-800">
                        💡 <strong>Payment Process:</strong> Payments are processed only after products are received and verified
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                  </button>
                          </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={paymentData.paymentDate}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, paymentDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₱</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={selectedPOForPayment.total}
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl pl-8 pr-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Order Total: ₱{selectedPOForPayment.total.toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={() => setPaymentData(prev => ({ ...prev, amount: selectedPOForPayment.total.toString() }))}
                      className="text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Pay Full Amount
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select payment method...</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Check">Check</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Online Payment">Online Payment</option>
                  </select>
                </div>

                {paymentData.paymentMethod === 'Bank Transfer' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-4">
                    <h4 className="text-sm font-semibold text-blue-800 mb-3">Bank Transfer Details</h4>
                    <div>
                      <label className="block text-xs font-medium text-blue-700 mb-1">Bank Name *</label>
                      <input
                        type="text"
                        value={paymentData.bankDetails.bankName}
                        onChange={(e) => setPaymentData(prev => ({ 
                          ...prev, 
                          bankDetails: { ...prev.bankDetails, bankName: e.target.value }
                        }))}
                        className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., BPI, BDO, Metrobank"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-700 mb-1">Account Number *</label>
                      <input
                        type="text"
                        value={paymentData.bankDetails.accountNumber}
                        onChange={(e) => setPaymentData(prev => ({ 
                          ...prev, 
                          bankDetails: { ...prev.bankDetails, accountNumber: e.target.value }
                        }))}
                        className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="Account number used for transfer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-700 mb-1">Reference Number</label>
                      <input
                        type="text"
                        value={paymentData.bankDetails.referenceNumber}
                        onChange={(e) => setPaymentData(prev => ({ 
                          ...prev, 
                          bankDetails: { ...prev.bankDetails, referenceNumber: e.target.value }
                        }))}
                        className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="Transaction reference number"
                      />
                    </div>
                  </div>
                )}

                {paymentData.paymentMethod === 'Check' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-4">
                    <h4 className="text-sm font-semibold text-green-800 mb-3">Check Details</h4>
                    <div>
                      <label className="block text-xs font-medium text-green-700 mb-1">Check Number *</label>
                      <input
                        type="text"
                        value={paymentData.checkDetails.checkNumber}
                        onChange={(e) => setPaymentData(prev => ({ 
                          ...prev, 
                          checkDetails: { ...prev.checkDetails, checkNumber: e.target.value }
                        }))}
                        className="w-full border border-green-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                        placeholder="Check number"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-green-700 mb-1">Bank Name *</label>
                      <input
                        type="text"
                        value={paymentData.checkDetails.bankName}
                        onChange={(e) => setPaymentData(prev => ({ 
                          ...prev, 
                          checkDetails: { ...prev.checkDetails, bankName: e.target.value }
                        }))}
                        className="w-full border border-green-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                        placeholder="Issuing bank name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-green-700 mb-1">Check Date</label>
                      <input
                        type="date"
                        value={paymentData.checkDetails.checkDate}
                        onChange={(e) => setPaymentData(prev => ({ 
                          ...prev, 
                          checkDetails: { ...prev.checkDetails, checkDate: e.target.value }
                        }))}
                        className="w-full border border-green-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                )}

                {paymentData.paymentMethod === 'Credit Card' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-4">
                    <h4 className="text-sm font-semibold text-purple-800 mb-3">Credit Card Details</h4>
                    <div>
                      <label className="block text-xs font-medium text-purple-700 mb-1">Card Number (Last 4 digits) *</label>
                      <input
                        type="text"
                        maxLength="4"
                        value={paymentData.cardDetails.cardNumber}
                        onChange={(e) => setPaymentData(prev => ({ 
                          ...prev, 
                          cardDetails: { ...prev.cardDetails, cardNumber: e.target.value }
                        }))}
                        className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                        placeholder="Last 4 digits (e.g., 1234)"
                      />
              </div>
                    <div>
                      <label className="block text-xs font-medium text-purple-700 mb-1">Cardholder Name *</label>
                      <input
                        type="text"
                        value={paymentData.cardDetails.cardHolderName}
                        onChange={(e) => setPaymentData(prev => ({ 
                          ...prev, 
                          cardDetails: { ...prev.cardDetails, cardHolderName: e.target.value }
                        }))}
                        className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                        placeholder="Name on card"
                      />
          </div>
                    <div>
                      <label className="block text-xs font-medium text-purple-700 mb-1">Transaction ID</label>
                      <input
                        type="text"
                        value={paymentData.cardDetails.transactionId}
                        onChange={(e) => setPaymentData(prev => ({ 
                          ...prev, 
                          cardDetails: { ...prev.cardDetails, transactionId: e.target.value }
                        }))}
                        className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                        placeholder="Transaction reference ID"
                      />
        </div>
                  </div>
                )}

                {paymentData.paymentMethod === 'Online Payment' && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-4">
                    <h4 className="text-sm font-semibold text-indigo-800 mb-3">Online Payment Details</h4>
                    <div>
                      <label className="block text-xs font-medium text-indigo-700 mb-1">Platform *</label>
                      <select
                        value={paymentData.onlineDetails.platform}
                        onChange={(e) => setPaymentData(prev => ({ 
                          ...prev, 
                          onlineDetails: { ...prev.onlineDetails, platform: e.target.value }
                        }))}
                        className="w-full border border-indigo-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select platform...</option>
                        <option value="GCash">GCash</option>
                        <option value="PayMaya">PayMaya</option>
                        <option value="PayPal">PayPal</option>
                        <option value="Grab Pay">Grab Pay</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-indigo-700 mb-1">Transaction ID *</label>
                      <input
                        type="text"
                        value={paymentData.onlineDetails.transactionId}
                        onChange={(e) => setPaymentData(prev => ({ 
                          ...prev, 
                          onlineDetails: { ...prev.onlineDetails, transactionId: e.target.value }
                        }))}
                        className="w-full border border-indigo-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                        placeholder="Transaction ID from platform"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-indigo-700 mb-1">Account Email</label>
                      <input
                        type="email"
                        value={paymentData.onlineDetails.accountEmail}
                        onChange={(e) => setPaymentData(prev => ({ 
                          ...prev, 
                          onlineDetails: { ...prev.onlineDetails, accountEmail: e.target.value }
                        }))}
                        className="w-full border border-indigo-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                        placeholder="Email used for payment"
                      />
                    </div>
                  </div>
                )}

                {paymentData.paymentMethod === 'Cash' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-yellow-800 mb-2">Cash Payment</h4>
                    <p className="text-xs text-yellow-700">
                      Cash payment selected. No additional details required.
                    </p>
                  </div>
                )}

                {/* Payment Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-purple-800 mb-2">Payment Summary</h4>
                  <div className="space-y-1 text-sm text-purple-700">
                    <div className="flex justify-between">
                      <span>Order Total:</span>
                      <span className="font-medium">₱{selectedPOForPayment.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Amount:</span>
                      <span className="font-medium">₱{paymentData.amount ? parseFloat(paymentData.amount).toLocaleString() : '0'}</span>
                    </div>
                    <div className="flex justify-between border-t border-purple-200 pt-1 font-semibold">
                      <span>Remaining Balance:</span>
                      <span className={`${
                        paymentData.amount && parseFloat(paymentData.amount) >= selectedPOForPayment.total 
                          ? 'text-green-600' 
                          : 'text-orange-600'
                      }`}>
                        ₱{paymentData.amount ? Math.max(0, selectedPOForPayment.total - parseFloat(paymentData.amount)).toLocaleString() : selectedPOForPayment.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPayment}
                  disabled={saving || !paymentData.paymentDate || !paymentData.amount || !paymentData.paymentMethod}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                >
                  {saving ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showPOModal && selectedPO && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPO.id}</h2>
                    <p className="text-gray-600">{selectedPO.supplier_name}</p>
                    <p className="text-sm text-gray-500">Sent to: {selectedPO.supplier_email}</p>
                    {selectedPO.handled_by_employee_name && (
                      <div className="mt-2 flex items-center">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-blue-600 text-xs font-semibold">
                            {selectedPO.handled_by_employee_name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Handled by: <span className="font-medium">{selectedPO.handled_by_employee_name}</span>
                        </p>
                      </div>
                    )}
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
                      selectedPO.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                      selectedPO.status === 'Processing' ? 'bg-indigo-100 text-indigo-800' :
                      selectedPO.status === 'Received' ? 'bg-green-100 text-green-800' :
                      selectedPO.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                      selectedPO.status === 'Partially Paid' ? 'bg-orange-100 text-orange-800' :
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

                {selectedPO.paidAmount && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                    <h3 className="text-sm font-semibold text-green-800 mb-3">Payment Information</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-green-600 font-medium">Amount Paid:</span>
                        <p className="text-green-800 font-bold">₱{selectedPO.paidAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-green-600 font-medium">Payment Method:</span>
                        <p className="text-green-800 font-semibold">{selectedPO.paymentMethod}</p>
                      </div>
                      <div>
                        <span className="text-green-600 font-medium">Payment Date:</span>
                        <p className="text-green-800 font-semibold">{selectedPO.paymentDate}</p>
                      </div>
                    </div>
                    {selectedPO.paidAmount < selectedPO.total && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <span className="text-orange-600 font-medium">Remaining Balance: </span>
                        <span className="text-orange-800 font-bold">₱{(selectedPO.total - selectedPO.paidAmount).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}

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

        {showExpensesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-10"></div>
                <div className="relative bg-white border-b border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Company Expenses</h2>
                      <p className="text-gray-600 mt-1">Financial overview and expense tracking</p>
                    </div>
                    <button
                      onClick={() => setShowExpensesModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(() => {
                      const summary = getExpensesSummary()
                      return (
                        <>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
                            <div className="relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                                  <p className="text-2xl font-bold text-gray-900 mt-1">₱{summary.total.toLocaleString()}</p>
                                  <p className="text-xs text-gray-500 mt-1">All time</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                                  <span className="text-2xl">💰</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
                            <div className="relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                                  <p className="text-2xl font-bold text-gray-900 mt-1">{summary.count}</p>
                                  <p className="text-xs text-gray-500 mt-1">Expense entries</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                                  <span className="text-2xl">📊</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
                            <div className="relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">PO Payments</p>
                                  <p className="text-2xl font-bold text-gray-900 mt-1">₱{(summary.byType['Purchase Order Payment'] || 0).toLocaleString()}</p>
                                  <p className="text-xs text-gray-500 mt-1">Purchase orders</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                                  <span className="text-2xl">🛒</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
                            <div className="relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">This Month</p>
                                  <p className="text-2xl font-bold text-gray-900 mt-1">₱{getFilteredExpenses().filter(exp => {
                                    const expDate = new Date(exp.expenseDate)
                                    const now = new Date()
                                    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
                                  }).reduce((sum, exp) => sum + exp.expenseAmount, 0).toLocaleString()}</p>
                                  <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                                  <span className="text-2xl">📅</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-5"></div>
                  <div className="relative bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <span className="mr-2">🔍</span>
                        Filter & Search
                      </h3>
                      <button
                        onClick={() => setExpenseFilters({
                          dateFrom: '', dateTo: '', type: '', minAmount: '', maxAmount: '', search: ''
                        })}
                        className="text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                        <input
                          type="date"
                          value={expenseFilters.dateFrom}
                          onChange={(e) => setExpenseFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                        <input
                          type="date"
                          value={expenseFilters.dateTo}
                          onChange={(e) => setExpenseFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <input
                          type="text"
                          placeholder="Filter by type..."
                          value={expenseFilters.type}
                          onChange={(e) => setExpenseFilters(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={expenseFilters.minAmount}
                          onChange={(e) => setExpenseFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
                        <input
                          type="number"
                          placeholder="999999"
                          value={expenseFilters.maxAmount}
                          onChange={(e) => setExpenseFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input
                          type="text"
                          placeholder="Search expenses..."
                          value={expenseFilters.search}
                          onChange={(e) => setExpenseFilters(prev => ({ ...prev, search: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-5"></div>
                  <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <span className="mr-2">📋</span>
                          Expense Records
                        </h3>
                        <div className="text-sm text-gray-600">
                          {getFilteredExpenses().length} of {expenses.length} records
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getFilteredExpenses().length === 0 ? (
                            <tr>
                              <td colSpan="8" className="px-6 py-16 text-center">
                                <div className="flex flex-col items-center">
                                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-3xl">💰</span>
                                  </div>
                                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Expenses Found</h3>
                                  <p className="text-gray-500 max-w-md">
                                    {expenses.length === 0 
                                      ? "No expenses have been recorded yet. Make a purchase order payment to see expenses here."
                                      : "No expenses match your current filters. Try adjusting your search criteria."
                                    }
                                  </p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            getFilteredExpenses().map((expense, index) => (
                              <tr key={expense.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{expense.id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{new Date(expense.expenseDate).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                    expense.expenseType === 'Purchase Order Payment'
                                      ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {expense.expenseType}
                                  </span>
                                </td>
                                <td className="px-6 py-4 max-w-xs">
                                  <div className="text-sm text-gray-900 truncate">{expense.description}</div>
                                  {expense.purchaseOrderId && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                        🛒 {expense.purchaseOrderId}
                                      </span>
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{expense.supplier || '-'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{expense.paymentMethod}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <div className="text-sm font-bold text-gray-900">₱{expense.expenseAmount.toLocaleString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-xs font-semibold text-purple-700">
                                        {expense.createdBy.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{expense.createdBy}</div>
                                      <div className="text-xs text-gray-500">{new Date(expense.createdAt).toLocaleDateString()}</div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
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
