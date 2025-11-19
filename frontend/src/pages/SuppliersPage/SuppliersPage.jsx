import React from 'react'
import { useEffect, useState } from 'react'
import { Edit2, Trash2, Plus, Users, Mail, Phone, MapPin, Search, Filter, MoreVertical, Save, X, AlertTriangle, CheckCircle, Building, Globe, Calendar, DollarSign, Package, TrendingUp, Eye, Star } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

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

const SupplierForm = ({ supplier, onSubmit, onCancel }) => {
  const [form, setForm] = useState(
    supplier || { 
      name: '', 
      email: '', 
      phone: '', 
      address_line_1: '',
      address_line_2: '',
      city: '',
      postal_code: '',
      country: 'Philippines',
      website: '',
      contact_person: '',
      tax_id: '',
      payment_terms: '30',
      category: '',
      notes: '',
      rating: 5,
      status: 'active'
    }
  )
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Company name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email is invalid'
    if (!form.phone.trim()) newErrors.phone = 'Phone is required'
    if (!form.address_line_1.trim()) newErrors.address_line_1 = 'Address Line 1 is required'
    if (!form.contact_person.trim()) newErrors.contact_person = 'Contact person is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      setLoading(true)
      try {
        await onSubmit(form)
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
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Supplier company name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Person <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
              errors.contact_person ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Primary contact name"
            value={form.contact_person}
            onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
          />
          {errors.contact_person && <p className="text-red-500 text-xs mt-1">{errors.contact_person}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="supplier@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+63 123 456 7890"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address Line 1 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
            errors.address_line_1 ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Street address, building name, etc."
          value={form.address_line_1}
          onChange={(e) => setForm({ ...form, address_line_1: e.target.value })}
        />
        {errors.address_line_1 && <p className="text-red-500 text-xs mt-1">{errors.address_line_1}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address Line 2
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          placeholder="Apartment, suite, unit, floor, etc. (optional)"
          value={form.address_line_2}
          onChange={(e) => setForm({ ...form, address_line_2: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Postal/ZIP Code"
            value={form.postal_code}
            onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Country"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <input
            type="url"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="https://company.com"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Tax identification number"
            value={form.tax_id}
            onChange={(e) => setForm({ ...form, tax_id: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms (Days)</label>
          <select
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            value={form.payment_terms}
            onChange={(e) => setForm({ ...form, payment_terms: e.target.value })}
          >
            <option value="15">15 Days</option>
            <option value="30">30 Days</option>
            <option value="45">45 Days</option>
            <option value="60">60 Days</option>
            <option value="90">90 Days</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            value={form.category}
            onChange={(e) => {
              setForm({ ...form, category: e.target.value })
              if (e.target.value !== 'Other') {
                setForm(prev => ({ ...prev, custom_category: '' }))
              }
            }}
          >
            <option value="">Select category</option>
            <option value="Materials">Raw Materials</option>
            <option value="Equipment">Equipment</option>
            <option value="Services">Services</option>
            <option value="Technology">Technology</option>
            <option value="Office">Office Supplies</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {form.category === 'Other' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Please specify the category <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter custom category..."
            value={form.custom_category}
            onChange={(e) => setForm({ ...form, custom_category: e.target.value })}
            className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
              errors.custom_category ? 'border-red-500' : 'border-gray-300'
            }`}
            autoFocus
          />
          {errors.custom_category && <p className="text-red-500 text-xs mt-1">{errors.custom_category}</p>}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Supplier Rating
        </label>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setForm({ ...form, rating: star })}
              className={`p-1 rounded ${form.rating >= star ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
            >
              <Star className="w-6 h-6 fill-current" />
            </button>
          ))}
          <span className="text-sm text-gray-600 ml-2">{form.rating}/5 stars</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
          placeholder="Additional notes about the supplier..."
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>

      <div className="flex space-x-3 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {supplier ? 'Update' : 'Create'} Supplier
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

const SupplierDetailModal = ({ supplier, isOpen, onClose, onEdit, onDelete }) => {
  if (!supplier) return null

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Supplier Details" size="lg">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
              <Building className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{supplier.name}</h3>
              <p className="text-gray-600">{supplier.contact_person}</p>
              <div className="flex items-center mt-1">
                {getRatingStars(supplier.rating || 5)}
                <span className="text-sm text-gray-500 ml-2">{supplier.rating || 5}/5</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(supplier)}
              className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium"
            >
              <Edit2 className="w-4 h-4 mr-2 inline" />
              Edit
            </button>
            <button
              onClick={() => onDelete(supplier)}
              className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4 mr-2 inline" />
              Delete
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-gray-600" />
              Contact Information
            </h4>
            <div className="space-y-3 pl-7">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                <span className="text-gray-900">{supplier.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-gray-400" />
                <span className="text-gray-900">{supplier.phone}</span>
              </div>
              {supplier.website && (
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-3 text-gray-400" />
                  <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    {supplier.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-gray-600" />
              Address Information
            </h4>
            <div className="space-y-3 pl-7">
              <div className="text-gray-900">
                <div>{supplier.address_line_1}</div>
                {supplier.address_line_2 && (
                  <div className="text-sm text-gray-500">{supplier.address_line_2}</div>
                )}
                {supplier.city && <div>{supplier.city}</div>}
                {supplier.postal_code && <div>{supplier.postal_code}</div>}
                {supplier.country && <div>{supplier.country}</div>}
              </div>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Building className="w-5 h-5 mr-2 text-gray-600" />
              Business Information
            </h4>
            <div className="space-y-3 pl-7">
              {supplier.tax_id && (
                <div>
                  <span className="text-sm text-gray-500">Tax ID:</span>
                  <div className="text-gray-900">{supplier.tax_id}</div>
                </div>
              )}
              {supplier.category && (
                <div>
                  <span className="text-sm text-gray-500">Category:</span>
                  <div className="text-gray-900">{supplier.category}</div>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-500">Payment Terms:</span>
                <div className="text-gray-900">{supplier.payment_terms || 30} days</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-600" />
              Account Information
            </h4>
            <div className="space-y-3 pl-7">
              <div>
                <span className="text-sm text-gray-500">Created:</span>
                <div className="text-gray-900">
                  {supplier.created_at ? new Date(supplier.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Status:</span>
                <div className="text-gray-900">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                    supplier.status === 'active' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {supplier.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {supplier.notes && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Notes</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">{supplier.notes}</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

const SupplierRow = ({ supplier, onEdit, onDelete, onView }) => {
  const [showActions, setShowActions] = useState(false)

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ))
  }

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
            <Building className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{supplier.name}</div>
            <div className="text-sm text-gray-500">{supplier.contact_person}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          <span className="truncate max-w-xs">{supplier.email}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center text-gray-600">
          <Phone className="w-4 h-4 mr-2" />
          {supplier.phone}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="text-gray-600">
          <div className="max-w-xs truncate">{supplier.address_line_1}</div>
          {supplier.address_line_2 && (
            <div className="max-w-xs truncate text-sm text-gray-500">{supplier.address_line_2}</div>
          )}
          {(supplier.city || supplier.postal_code) && (
            <div className="text-sm text-gray-500">
              {supplier.city}{supplier.city && supplier.postal_code && ', '}{supplier.postal_code}
            </div>
          )}
        </div>
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
          supplier.status === 'active' 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-red-100 text-red-800 border-red-200'
        }`}>
          {supplier.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center">
          {getRatingStars(supplier.rating || 5)}
          <span className="text-sm text-gray-500 ml-1">{supplier.rating || 5}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
              <button
                onClick={() => {
                  onView(supplier)
                  setShowActions(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </button>
              <button
                onClick={() => {
                  onEdit(supplier)
                  setShowActions(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(supplier)
                  setShowActions(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [filteredSuppliers, setFilteredSuppliers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [viewingSupplier, setViewingSupplier] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadSuppliers = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call when backend route is ready
      // const response = await fetch('/api/suppliers', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   }
      // })
      // 
      // if (!response.ok) {
      //   const error = await response.json()
      //   throw new Error(error.message || 'Failed to load suppliers')
      // }
      // 
      // const data = await response.json()
      // setSuppliers(data.data || [])

      // Temporary mock data - remove when API is ready
      setSuppliers([])
      
      console.log('loadSuppliers called - ready for API integration')
    } catch (error) {
      console.error('Error loading suppliers:', error)
      alert('Error loading suppliers: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSuppliers()
  }, [])

  useEffect(() => {
    const filtered = suppliers.filter(supplier => {
      const matchesSearch = !searchTerm || 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.phone.includes(searchTerm) ||
        supplier.address_line_1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.address_line_2?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.postal_code?.includes(searchTerm) ||
        supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = !categoryFilter || supplier.category === categoryFilter
      const matchesStatus = !statusFilter || supplier.status === statusFilter
      
      return matchesSearch && matchesCategory && matchesStatus
    })
    setFilteredSuppliers(filtered)
  }, [searchTerm, categoryFilter, statusFilter, suppliers])

  const handleAdd = async (formData) => {
    try {
      // TODO: Replace with actual API call when backend route is ready
      // const response = await fetch('/api/suppliers', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   },
      //   body: JSON.stringify(formData)
      // })
      // 
      // if (!response.ok) {
      //   const error = await response.json()
      //   throw new Error(error.message || 'Failed to add supplier')
      // }
      // 
      // const data = await response.json()
      // setSuppliers(prev => [data.data, ...prev])
      
      console.log('Add supplier:', formData)
      setShowAddModal(false)
      alert('Supplier added successfully!')
      await loadSuppliers()
    } catch (error) {
      console.error('Error adding supplier:', error)
      alert('Error adding supplier: ' + error.message)
    }
  }

  const handleEdit = async (formData) => {
    try {
      // TODO: Replace with actual API call when backend route is ready
      // const response = await fetch(`/api/suppliers/${editingSupplier.id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   },
      //   body: JSON.stringify(formData)
      // })
      // 
      // if (!response.ok) {
      //   const error = await response.json()
      //   throw new Error(error.message || 'Failed to update supplier')
      // }
      // 
      // const data = await response.json()
      // setSuppliers(prev => prev.map(s => s.id === data.data.id ? data.data : s))
      
      console.log('Update supplier:', editingSupplier.id, formData)
      setEditingSupplier(null)
      alert('Supplier updated successfully!')
      await loadSuppliers()
    } catch (error) {
      console.error('Error updating supplier:', error)
      alert('Error updating supplier: ' + error.message)
    }
  }

  const handleDelete = async (supplier) => {
    try {
      // TODO: Replace with actual API call when backend route is ready
      // const response = await fetch(`/api/suppliers/${supplier.id}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   }
      // })
      // 
      // if (!response.ok) {
      //   const error = await response.json()
      //   throw new Error(error.message || 'Failed to delete supplier')
      // }
      // 
      // setSuppliers(prev => prev.filter(s => s.id !== supplier.id))
      
      console.log('Delete supplier:', supplier.id)
      setDeleteConfirm(null)
      setViewingSupplier(null)
      alert('Supplier deleted successfully!')
      await loadSuppliers()
    } catch (error) {
      console.error('Error deleting supplier:', error)
      alert('Error deleting supplier: ' + error.message)
    }
  }

  const categories = [...new Set(suppliers.map(supplier => supplier.category).filter(Boolean))]
  const totalSuppliers = suppliers.length
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length
  const inactiveSuppliers = suppliers.filter(s => s.status === 'inactive').length
  const averageRating = suppliers.length > 0 ? (suppliers.reduce((sum, s) => sum + (s.rating || 5), 0) / suppliers.length).toFixed(1) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading suppliers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
              <p className="text-gray-600 mt-1">Manage supplier relationships and procurement partnerships</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center shadow-sm"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Supplier
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                <p className="text-2xl font-bold text-gray-900">{totalSuppliers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
                <p className="text-2xl font-bold text-gray-900">{activeSuppliers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{averageRating}/5</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Search Results</p>
                <p className="text-2xl font-bold text-gray-900">{filteredSuppliers.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Suppliers</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, contact, email, phone, address, city, or postal code..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Filter</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {filteredSuppliers.length} of {totalSuppliers} suppliers
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setCategoryFilter('')
                    setStatusFilter('')
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear Filters
                </button>
                <button
                  onClick={loadSuppliers}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Supplier</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Email</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Phone</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Address</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Rating</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-gray-500">
                      <Building className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm || categoryFilter || statusFilter ? 'Try adjusting your search or filters' : 'Get started by adding your first supplier'}
                      </p>
                      {!searchTerm && !categoryFilter && !statusFilter && (
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                          Add First Supplier
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <SupplierRow
                      key={supplier.id}
                      supplier={supplier}
                      onEdit={setEditingSupplier}
                      onDelete={(supplier) => setDeleteConfirm(supplier)}
                      onView={setViewingSupplier}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Supplier"
        size="lg"
      >
        <SupplierForm
          onSubmit={handleAdd}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingSupplier}
        onClose={() => setEditingSupplier(null)}
        title="Edit Supplier"
        size="lg"
      >
        <SupplierForm
          supplier={editingSupplier}
          onSubmit={handleEdit}
          onCancel={() => setEditingSupplier(null)}
        />
      </Modal>

      <SupplierDetailModal
        supplier={viewingSupplier}
        isOpen={!!viewingSupplier}
        onClose={() => setViewingSupplier(null)}
        onEdit={setEditingSupplier}
        onDelete={(supplier) => setDeleteConfirm(supplier)}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete Supplier"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        type="danger"
      />
    </div>
  )
}
