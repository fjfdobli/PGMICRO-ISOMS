import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import api, { authAPI } from './lib/api'
import { fetchNotifications, fetchUnreadCount, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, clearReadNotifications } from './lib/slices/notificationSlice'
import { fetchUsers, fetchUnreadCount as fetchChatUnreadCount, getOrCreateConversation, setActiveConversation } from './lib/slices/chatSlice'
import { setUser as setReduxUser } from './lib/slices/authSlice'
import { fetchSettings, applyTheme, applyPrimaryColor } from './lib/slices/settingsSlice'
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
import ApiDocsPage from './pages/ApiDocsPage/ApiDocsPage'
import AuthContainer from './pages/AuthContainer/AuthContainer'
import ChatContainer from './components/Chat/ChatContainer'

function ProtectedRoute({ children, requiredModule, user }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.account_type === 'admin') {
      return
    }

    if (requiredModule === 'users') {
      navigate('/')
      return
    }

    const userModules = user?.allowed_modules || []
    if (requiredModule && !userModules.includes(requiredModule)) {
      const firstAvailableModule = userModules[0]
      if (firstAvailableModule === 'dashboard') {
        navigate('/')
      } else {
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

  if (user?.account_type === 'admin') {
    return children
  }

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
  const { notifications = [], unreadCount = 0, loading, error } = useSelector(state => state.notifications || {})
  const { unreadCount: chatUnreadCount = 0, users: chatUsers = [] } = useSelector(state => state.chat || {})
  const settings = useSelector(state => state.settings || {})
  const theme = settings.appearance?.theme || settings.theme || 'light'
  const isDark = theme === 'dark'
  const [sidebarOpen, setSidebarOpen] = useState(true) 
  const [showNotifications, setShowNotifications] = useState(false)
  const [showChatList, setShowChatList] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userStatus, setUserStatus] = useState('offline')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(applyTheme())
    dispatch(applyPrimaryColor())
  }, [settings.appearance, dispatch])

  useEffect(() => {
    if (userProp?.user_status) {
      setUserStatus(userProp.user_status)
     // console.log('Synced userStatus from userProp:', userProp.user_status)
    }
  }, [userProp?.user_status])

  useEffect(() => {
    if (userProp) {
      dispatch(fetchNotifications())
      dispatch(fetchUnreadCount())
      dispatch(fetchUsers())
      dispatch(fetchChatUnreadCount())
      
      const sendHeartbeat = async () => {
        try {
          await api.auth.heartbeat?.()
        } catch (error) {
          console.error('Heartbeat failed:', error)
        }
      }
      
      sendHeartbeat()
      
      const pollInterval = setInterval(() => {
        dispatch(fetchUnreadCount())
        dispatch(fetchNotifications({ limit: 50 }))
        dispatch(fetchUsers())
        dispatch(fetchChatUnreadCount())
        sendHeartbeat()
      }, 30000)

      return () => clearInterval(pollInterval)
    }
  }, [dispatch, userProp])

  useEffect(() => {
    const handleClickOutside = (event) => {
      const header = document.querySelector('header')
      if (header && !header.contains(event.target)) {
        setShowNotifications(false)
        setShowProfileMenu(false)
        setShowChatList(false)
      }
    }

    if (showNotifications || showProfileMenu || showChatList) {
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 100)
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [showNotifications, showProfileMenu, showChatList])

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
      badge: notifications.filter(n => n.type === 'low_stock' && !n.is_read).length || null,
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
      badge: notifications.filter(n => n.type === 'return_request' && !n.is_read).length || null,
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
      module: 'users', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      badge: null,
      color: 'gray'
    }
  ]

  const getNavigationItems = () => {
    const currentUser = userProp || user
    if (!currentUser) return []

    if (currentUser.account_type === 'admin') {
      return allNavigationItems
    }

    const userModules = currentUser.allowed_modules || ['dashboard']
    return allNavigationItems.filter(item => 
      userModules.includes(item.module) && item.module !== 'users'
    )
  }

  const navigationItems = getNavigationItems()

  const handleSignOut = async () => {
    if (onLogout) {
      await onLogout()
    } else {
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
      case 'chat_message':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId))
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead())
  }

  const handleDeleteNotification = (notificationId, event) => {
    event.stopPropagation()
    dispatch(deleteNotification(notificationId))
  }

  const handleClearRead = () => {
    dispatch(clearReadNotifications())
  }

  const getUserRole = () => {
    const currentUser = userProp || user
    if (!currentUser) return 'User'
    return currentUser.account_type === 'admin' ? 'Administrator' : 'Employee'
  }

  return (
    <div className="h-screen flex bg-gray-50 relative">
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="hidden lg:flex fixed top-32 left-0 z-[60] items-center justify-center w-10 h-10 rounded-r-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:w-12 group"
          style={{
            background: isDark ? '#1a1f2e' : 'linear-gradient(to right, #f3f4f6, #e5e7eb)',
            borderColor: isDark ? '#2d3748' : '#d1d5db',
            borderWidth: '1px',
            borderLeft: 'none'
          }}
          title="Open sidebar"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-all" fill="none" stroke={isDark ? '#ffffff' : '#374151'} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} fixed inset-y-0 left-0 z-40 bg-white shadow-xl transform transition-all duration-300 ease-in-out lg:static overflow-hidden`}>
        {sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="hidden lg:flex absolute top-32 right-4 z-50 items-center justify-center w-10 h-10 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group"
            style={{
              background: isDark ? '#1a1f2e' : 'linear-gradient(to left, #f3f4f6, #e5e7eb)',
              borderColor: isDark ? '#2d3748' : '#d1d5db',
              borderWidth: '1px'
            }}
            title="Close sidebar"
          >
            <svg 
              className="w-5 h-5 group-hover:scale-110 transition-all" 
              fill="none" 
              stroke={isDark ? '#ffffff' : '#374151'}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}

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
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className={`mt-8 px-4 pb-4 ${sidebarOpen ? '' : 'opacity-0 pointer-events-none'}`}>
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.href)
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

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 backdrop-blur-sm bg-white/95 relative z-40">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center">
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

            <div className="flex items-center space-x-4">
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

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                        <span className="text-sm text-gray-500">{unreadCount} unread</span>
                      </div>
                      {notifications.length > 0 && (
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAllAsRead()
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Mark all as read
                          </button>
                          <span className="text-gray-300">|</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleClearRead()
                            }}
                            className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                          >
                            Clear read
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {loading && notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                        </div>
                      ) : error ? (
                        <div className="p-8 text-center text-red-500">
                          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm">{error}</p>
                        </div>
                      ) : notifications.length === 0 ? (
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
                            className={`group relative p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.is_read ? 'bg-blue-50' : ''}`}
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <div className="flex items-start">
                              {getNotificationIcon(notification.type)}
                              <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                                {notification.description && (
                                  <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(notification.created_at).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                {!notification.is_read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                                <button
                                  onClick={(e) => handleDeleteNotification(notification.id, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                                  title="Delete notification"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowNotifications(false)
                          }}
                          className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative" data-dropdown="chat">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowChatList(!showChatList)
                    setShowNotifications(false)
                    setShowProfileMenu(false)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-all duration-200 relative hover:shadow-md"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {chatUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                    </span>
                  )}
                </button>

                {showChatList && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] max-h-96 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Messages</h3>
                      {chatUnreadCount > 0 && (
                        <span className="text-sm text-gray-500">{chatUnreadCount} unread</span>
                      )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                      {chatUsers.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="text-sm">No users available</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {chatUsers.map((chatUser) => {
                            // Status badge colors
                            const statusColors = {
                              online: 'bg-green-400',
                              idle: 'bg-yellow-400',
                              dnd: 'bg-red-400',
                              invisible: 'bg-gray-300',
                              offline: 'bg-gray-300'
                            }
                            const statusColor = statusColors[chatUser.status] || 'bg-gray-300'
                            
                            return (
                            <button
                              key={chatUser.id}
                              onClick={async (e) => {
                                e.stopPropagation()
                                const result = await dispatch(getOrCreateConversation(chatUser.id))
                                if (result.payload) {
                                  dispatch(setActiveConversation({ conversationId: result.payload.id, isActive: true }))
                                  setShowChatList(false)
                                }
                              }}
                              className="w-full p-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                  {chatUser.first_name?.[0]}{chatUser.last_name?.[0]}
                                </div>
                                <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ${statusColor} ring-2 ring-white`}></span>
                              </div>
                              <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-gray-900">
                                  {chatUser.first_name} {chatUser.last_name}
                                </p>
                                <p className="text-xs text-gray-500">{chatUser.activeTime || 'Offline'}</p>
                              </div>
                              {chatUser.account_type === 'admin' && (
                                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">Admin</span>
                              )}
                            </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative z-50" data-dropdown="profile">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowProfileMenu(!showProfileMenu)
                    setShowNotifications(false)
                  }}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:shadow-md transition-all duration-200"
                  id="profile-menu-button"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {userProp?.first_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="fixed top-16 right-4 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 z-[99999]" style={{pointerEvents: 'auto'}}>
                    <div className="p-4 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {userProp ? `${userProp.first_name} ${userProp.last_name}` : 'Loading...'}
                      </div>
                      <div className="text-xs text-gray-500">{getUserRole()}</div>
                      
                      {/* Status Selector */}
                      <div className="mt-3 space-y-1">
                        <div className="text-xs font-medium text-gray-700 mb-2">Status</div>
                        {[
                          { value: 'online', label: 'Online', color: 'bg-green-400', icon: '●' },
                          { value: 'idle', label: 'Idle', color: 'bg-yellow-400', icon: '○' },
                          { value: 'dnd', label: 'Do Not Disturb', color: 'bg-red-400', icon: '⊖' },
                          { value: 'invisible', label: 'Invisible', color: 'bg-gray-300', icon: '◯' },
                          { value: 'offline', label: 'Offline', color: 'bg-gray-400', icon: '○' }
                        ].map(status => (
                          <button
                            key={status.value}
                            onClick={async () => {
                              setUserStatus(status.value)
                              try {
                                const response = await api.auth.updateStatus(status.value)
                                console.log('Status updated successfully:', response)
                                dispatch(fetchUsers())
                              } catch (error) {
                                console.error('Failed to update status:', error)
                                setUserStatus(userProp?.user_status || 'offline')
                              }
                            }}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-gray-50 transition-colors ${
                              userStatus === status.value ? 'bg-blue-50 border border-blue-200' : ''
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${status.color}`}></span>
                            <span className="flex-1 text-left">{status.label}</span>
                            {userStatus === status.value && (
                              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
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
                      {userProp?.account_type === 'admin' && (
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setShowProfileMenu(false)
                            navigate('/api-docs')
                          }}
                          className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 cursor-pointer group"
                          type="button"
                        >
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            API Docs
                          </div>
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
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

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <ChatContainer />
    </div>
  )
}

function Shell() {
  const dispatch = useDispatch()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchSettings()).then(() => {
        dispatch(applyTheme())
        dispatch(applyPrimaryColor())
      })
    }
  }, [dispatch, isAuthenticated])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        console.log('No auth token found')
        setLoading(false)
        return
      }

      const data = await authAPI.getCurrentUser()
     // console.log('Auth check response:', data)
     // console.log('User data from auth check:', data.user)
     // console.log('User status from API response:', data.user?.user_status)
      
      setUser(data.user)
      setIsAuthenticated(true)
      
      if (data.user.user_status) {
       // console.log('User status loaded from database:', data.user.user_status)
      } else {
       // console.warn('No user_status in response, will use default:', 'offline')
      }
      
      dispatch(setReduxUser(data.user))
      
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
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
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
        <Route path="/api-docs" element={<ApiDocsPage />} />
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