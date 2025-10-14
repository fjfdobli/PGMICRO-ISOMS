import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { authAPI } from './lib/api'
import { markAsRead } from './lib/slices/notificationSlice'
import DashboardPage from './pages/DashboardPage/DashboardPage'
import SalesPage from './pages/SalesPage/SalesPage'
import PurchaseOrdersPage from './pages/PurchaseOrdersPage/PurchaseOrdersPage'
import ReturnsPage from './pages/ReturnsPage/ReturnsPage'
import InventoryPage from './pages/InventoryPage/InventoryPage'
import CustomersPage from './pages/CustomersPage/CustomersPage'
import SuppliersPage from './pages/SuppliersPage/SuppliersPage'
import UsersPage from './pages/UsersPage/UsersPage'
import ProfileSettingsPage from './pages/ProfileSettingsPage/ProfileSettingsPage'
import SystemSettingsPage from './pages/SystemSettingsPage/SystemSettingsPage'
import HelpSupportPage from './pages/HelpSupportPage/HelpSupportPage'
import AuthContainer from './pages/AuthContainer/AuthContainer'

// Protected Route component
function ProtectedRoute({ children, requiredModule, user }) {
  const navigate = useNavigate()

  useEffect(() => {
    // Admin can access everything
    if (user?.account_type === 'admin') {
      return
    }

    // Special case for users module - admin only
    if (requiredModule === 'users') {
      navigate('/')
      return
    }

    // Check if user has access to this module
    const userModules = user?.allowed_modules || []
    if (requiredModule && !userModules.includes(requiredModule)) {
      // Redirect to dashboard or first available module
      const firstAvailableModule = userModules[0]
      if (firstAvailableModule === 'dashboard') {
        navigate('/')
      } else {
        // Map module to route
        const moduleRoutes = {
          'sales': '/sales',
          'purchase-orders': '/purchase-orders',
          'returns': '/returns',
          'inventory': '/inventory',
          'customers': '/customers',
          'suppliers': '/suppliers'
        }
        navigate(moduleRoutes[firstAvailableModule] || '/')
      }
    }
  }, [user, requiredModule, navigate])

  // Admin can access everything
  if (user?.account_type === 'admin') {
    return children
  }

  // Special case for users module - admin only
  if (requiredModule === 'users') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5C2.57 17.333 3.53 19 5.07 19z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Only administrators can manage users.</p>
        </div>
      </div>
    )
  }

  // Check if user has access to this module
  const userModules = user?.allowed_modules || []
  console.log('ProtectedRoute check:', { requiredModule, userModules, hasAccess: userModules.includes(requiredModule) })
  
  if (requiredModule && !userModules.includes(requiredModule)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5C2.57 17.333 3.53 19 5.07 19z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this module. Contact your administrator to request access.</p>
        </div>
      </div>
    )
  }

  return children
}

function Layout({ children, user: userProp, onLogout }) {
  const dispatch = useDispatch()
  const { items: notifications, unreadCount } = useSelector(state => state.notifications)
  const [sidebarOpen, setSidebarOpen] = useState(true) // Start open by default
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if clicking outside the entire header area
      const header = document.querySelector('header')
      if (header && !header.contains(event.target)) {
        setShowNotifications(false)
        setShowProfileMenu(false)
      }
    }

    if (showNotifications || showProfileMenu) {
      // Add a small delay to prevent immediate closing
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 100)
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [showNotifications, showProfileMenu])

  // No need for loadNotifications - Redux handles notification state

  // Define all available navigation items
  const allNavigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      module: 'dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10z" />
        </svg>
      ),
      badge: null,
      color: 'slate'
    },
    {
      name: 'Sales',
      href: '/sales',
      module: 'sales',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      badge: null,
      color: 'blue'
    },
    {
      name: 'Purchase Orders',
      href: '/purchase-orders',
      module: 'purchase-orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      badge: null,
      color: 'purple'
    },
    {
      name: 'Inventory',
      href: '/inventory',
      module: 'inventory',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      badge: notifications.filter(n => n.type === 'low_stock' && n.unread).length || null,
      badgeColor: 'bg-red-500',
      color: 'green'
    },
    {
      name: 'Returns & Warranty',
      href: '/returns',
      module: 'returns',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
        </svg>
      ),
      badge: notifications.filter(n => n.type === 'return_request' && n.unread).length || null,
      badgeColor: 'bg-yellow-500',
      color: 'orange'
    },
    {
      name: 'Customers',
      href: '/customers',
      module: 'customers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      badge: null,
      color: 'blue'
    },
    {
      name: 'Suppliers',
      href: '/suppliers',
      module: 'suppliers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      badge: null,
      color: 'indigo'
    },
    {
      name: 'Users',
      href: '/users',
      module: 'users', // Special case - only admins can access
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      badge: null,
      color: 'gray'
    }
  ]

  // Filter navigation items based on user permissions
  const getNavigationItems = () => {
    const currentUser = userProp || user
    if (!currentUser) return []

    // Admin can see all modules
    if (currentUser.account_type === 'admin') {
      return allNavigationItems
    }

    // Employee can only see modules they have access to
    const userModules = currentUser.allowed_modules || ['dashboard']
    return allNavigationItems.filter(item => 
      userModules.includes(item.module) && item.module !== 'users' // Users module is admin-only
    )
  }

  const navigationItems = getNavigationItems()

  const handleSignOut = async () => {
    if (onLogout) {
      await onLogout()
    } else {
      // Fallback in case onLogout is not provided
      try {
        await authAPI.logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        localStorage.removeItem('authToken')
        navigate('/')
        window.location.reload()
      }
    }
  }

  const getCurrentPageName = () => {
    const currentItem = navigationItems.find(item => item.href === location.pathname)
    return currentItem ? currentItem.name : 'Dashboard'
  }

  const isCurrentPage = (href) => {
    return location.pathname === href
  }

  // Unread count comes from Redux store

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reorder':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-sm">🚨</span>
          </div>
        )
      case 'low_stock':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5C2.57 17.333 3.53 19 5.07 19z" />
            </svg>
          </div>
        )
      case 'new_order':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        )
      case 'return_request':
        return (
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
            </svg>
          </div>
        )
      case 'purchase_order':
        return (
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
    }
  }

  const markNotificationAsRead = (notificationId) => {
    dispatch(markAsRead(notificationId))
  }

  // Display user role properly
  const getUserRole = () => {
    const currentUser = userProp || user
    if (!currentUser) return 'User'
    return currentUser.account_type === 'admin' ? 'Administrator' : 'Employee'
  }

  return (
    <div className="h-screen flex bg-gray-50 relative">
      {/* Floating Open Button - Shows when sidebar is closed on desktop */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="hidden lg:flex fixed top-24 left-2 z-50 items-center justify-center w-8 h-12 bg-white border-2 border-blue-500 rounded-r-lg shadow-xl hover:bg-blue-50 hover:border-blue-600 transition-all duration-200"
          title="Open sidebar"
        >
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} fixed inset-y-0 left-0 z-40 bg-white shadow-xl transform transition-all duration-300 ease-in-out lg:static overflow-hidden`}>
        {/* Desktop Toggle Button - Shows when sidebar is open */}
        {sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="hidden lg:flex absolute top-24 -right-4 z-50 items-center justify-center w-8 h-12 bg-white border-2 border-blue-500 rounded-r-lg shadow-xl hover:bg-blue-50 hover:border-blue-600 transition-all duration-200 group"
            title="Close sidebar"
          >
            <svg 
              className="w-5 h-5 text-blue-600 group-hover:text-blue-700" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Logo */}
        <div className={`flex items-center justify-between h-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700 ${sidebarOpen ? '' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="text-white">
              <div className="text-lg font-bold whitespace-nowrap">PG Micro ISOMS</div>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className={`mt-8 px-4 pb-4 ${sidebarOpen ? '' : 'opacity-0 pointer-events-none'}`}>
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.href)
                  // Only close sidebar on mobile (screen width < 1024px)
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false)
                  }
                }}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isCurrentPage(item.href)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                }`}
              >
                <span className={`mr-3 transition-colors duration-200 ${isCurrentPage(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                  {item.icon}
                </span>
                <span className="flex-1 text-left whitespace-nowrap">{item.name}</span>
                {item.badge && (
                  <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white rounded-full ${item.badgeColor || 'bg-red-500'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* User Info Footer */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200 ${sidebarOpen ? '' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {userProp?.first_name?.charAt(0).toUpperCase() || userProp?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {userProp ? `${userProp.first_name} ${userProp.last_name}` : 'User'}
              </div>
              <div className="text-xs text-gray-500">{getUserRole()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 backdrop-blur-sm bg-white/95 relative z-40">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center">
              {/* Mobile menu button - Only show when sidebar is closed */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden -ml-2 mr-3 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}

              {/* Page title */}
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{getCurrentPageName()}</h1>
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative" data-dropdown="notifications">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowNotifications(!showNotifications)
                    setShowProfileMenu(false)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-all duration-200 relative hover:shadow-md"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5V17zM10.607 2.586a2 2 0 112.828 2.828l-8.485 8.485a2 2 0 01-1.414.586H1v-2.536a2 2 0 01.586-1.414L10.607 2.586z" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                        <span className="text-sm text-gray-500">{unreadCount} unread</span>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5V17zM10.607 2.586a2 2 0 112.828 2.828l-8.485 8.485a2 2 0 01-1.414.586H1v-2.536a2 2 0 01.586-1.414L10.607 2.586z" />
                            </svg>
                          </div>
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${notification.unread ? 'bg-blue-50' : ''}`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <div className="flex items-start">
                              {getNotificationIcon(notification.type)}
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                                {notification.description && (
                                  <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.timestamp ? new Date(notification.timestamp).toLocaleString() : notification.time}
                                </p>
                              </div>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile menu */}
              <div className="relative" data-dropdown="profile">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowProfileMenu(!showProfileMenu)
                    setShowNotifications(false)
                  }}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:shadow-md transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {userProp?.first_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </button>

                {/* Profile dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]" style={{pointerEvents: 'auto'}}>
                    <div className="p-4 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-900">
                        {userProp ? `${userProp.first_name} ${userProp.last_name}` : 'Loading...'}
                      </div>
                      <div className="text-xs text-gray-500">{getUserRole()}</div>
                    </div>
                    <div className="py-2">
                      <button 
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setShowProfileMenu(false)
                          navigate('/profile-settings')
                        }}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 cursor-pointer group"
                        type="button"
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile Settings
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setShowProfileMenu(false)
                          navigate('/system-settings')
                        }}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 cursor-pointer group"
                        type="button"
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          System Settings
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setShowProfileMenu(false)
                          navigate('/help-support')
                        }}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 cursor-pointer group"
                        type="button"
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Help & Support
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    <div className="border-t border-gray-200">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleSignOut()
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer"
                        type="button"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function Shell() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        console.log('No auth token found')
        setLoading(false)
        return
      }

      console.log('Checking auth status with token')
      const data = await authAPI.getCurrentUser()
      console.log('Auth check response:', data)
      console.log('User data from auth check:', data.user)
      console.log('User modules from auth check:', data.user?.allowed_modules)
      
      setUser(data.user)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('authToken')
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authAPI.logout()
      console.log('Logout successful, clearing auth state')
    } catch (error) {
      console.error('Logout API error:', error)
      // Continue with logout even if API fails
    } finally {
      // Always clear local state regardless of API response
      localStorage.removeItem('authToken')
      setUser(null)
      setIsAuthenticated(false)
      console.log('Auth state cleared, user should be redirected to login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) return <AuthContainer onLogin={checkAuthStatus} />

  return (
    <Layout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute requiredModule="dashboard" user={user}>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/sales" element={
          <ProtectedRoute requiredModule="sales" user={user}>
            <SalesPage />
          </ProtectedRoute>
        } />
        <Route path="/purchase-orders" element={
          <ProtectedRoute requiredModule="purchase-orders" user={user}>
            <PurchaseOrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/returns" element={
          <ProtectedRoute requiredModule="returns" user={user}>
            <ReturnsPage />
          </ProtectedRoute>
        } />
        <Route path="/inventory" element={
          <ProtectedRoute requiredModule="inventory" user={user}>
            <InventoryPage />
          </ProtectedRoute>
        } />
        <Route path="/customers" element={
          <ProtectedRoute requiredModule="customers" user={user}>
            <CustomersPage />
          </ProtectedRoute>
        } />
        <Route path="/suppliers" element={
          <ProtectedRoute requiredModule="suppliers" user={user}>
            <SuppliersPage />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute requiredModule="users" user={user}>
            <UsersPage />
          </ProtectedRoute>
        } />
        <Route path="/profile-settings" element={<ProfileSettingsPage />} />
        <Route path="/system-settings" element={<SystemSettingsPage />} />
        <Route path="/help-support" element={<HelpSupportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Shell />
    </BrowserRouter>
  )
}