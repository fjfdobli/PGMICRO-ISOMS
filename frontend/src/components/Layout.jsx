import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { authAPI } from '../lib/api'
import Button from './Button'

const NavItem = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block px-3 py-2 rounded-xl ${isActive ? 'bg-blue-50 text-[var(--color-brand)] font-semibold' : 'text-gray-700 hover:bg-gray-50'}`
    }
  >
    {label}
  </NavLink>
)

export default function Layout({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  // Initialize sidebar as open on desktop, closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' && window.innerWidth >= 768)
  
  // Get current theme from Redux - check multiple possible state structures
  const settings = useSelector((state) => state.settings || {})
  const theme = settings.appearance?.theme || settings.theme || 'light'
  const isDark = theme === 'dark'
  const [buttonKey, setButtonKey] = useState(0)
  
  console.log('🎨 Layout theme:', theme, 'isDark:', isDark)

  useEffect(() => {
    loadUserProfile()
  }, [])
  
  // Force button re-render when theme changes
  useEffect(() => {
    console.log('🔄 Theme changed, forcing button update')
    setButtonKey(prev => prev + 1)
  }, [theme, isDark])

  const loadUserProfile = async () => {
    try {
      const data = await authAPI.getCurrentUser()
      setUser(data.user)
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
      setUser(null)
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      localStorage.removeItem('authToken')
      setUser(null)
      navigate('/')
    }
  }

  const isAdmin = user?.account_type === 'admin'
  const userDisplayName = user ? `${user.first_name} ${user.last_name}` : ''
  const toggleSidebar = () => {
    console.log('🍔 Toggle sidebar clicked! Current state:', isSidebarOpen, '→ New state:', !isSidebarOpen)
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    console.log('❌ Close sidebar clicked!')
    setIsSidebarOpen(false)
  }

  // Debug: Log sidebar state
  useEffect(() => {
    console.log('📊 Sidebar state changed:', isSidebarOpen ? 'OPEN' : 'CLOSED')
  }, [isSidebarOpen])

  return (
    <div className="body-shell">
      <div className="flex">
        {/* Sidebar Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeSidebar}
          ></div>
        )}

        {/* Sidebar */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-50
          w-[var(--sidebar-w)] shrink-0 border-r bg-white
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="px-4 py-4 flex items-center justify-between border-b">
            <div className="text-xl font-bold text-[var(--color-brand)]">PG Micro ISOMS</div>
            {/* CLOSE BUTTON - Always visible in sidebar */}
            <button 
              key={`close-${buttonKey}`}
              className="p-3 rounded-lg transition-all border-2"
              onClick={closeSidebar}
              aria-label="Close sidebar"
              title="Close sidebar"
              style={{
                backgroundColor: isDark ? '#1a1f2e' : '#fef2f2',
                borderColor: isDark ? '#2d3748' : '#ef4444'
              }}
              onMouseEnter={(e) => {
                const bg = isDark ? '#252d3d' : '#fee2e2'
                e.currentTarget.style.backgroundColor = bg
              }}
              onMouseLeave={(e) => {
                const bg = isDark ? '#1a1f2e' : '#fef2f2'
                e.currentTarget.style.backgroundColor = bg
              }}
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke={isDark ? '#ffffff' : '#dc2626'}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="px-3 space-y-1" onClick={closeSidebar}>
            <NavItem to="/" label="Dashboard" />
            <NavItem to="/sales" label="Sales" />
            <NavItem to="/purchase-orders" label="Purchase Orders" />
            <NavItem to="/returns" label="Return/Warranty" />
            <NavItem to="/inventory" label="Inventory" />
            <NavItem to="/customers" label="Customers" />
            <NavItem to="/suppliers" label="Suppliers" />
            {isAdmin && <NavItem to="/users" label="Users" />}
            {isAdmin && <NavItem to="/api-docs" label="API Docs" />}
            <div className="px-3 py-2 text-xs text-gray-400">v2.0</div>
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
              {/* OPEN BUTTON - Visible when sidebar closed */}
              {!isSidebarOpen && (
                <button 
                  key={`open-${buttonKey}`}
                  className="p-3 -ml-2 mr-3 rounded-lg transition-all border-2"
                  onClick={toggleSidebar}
                  aria-label="Open sidebar"
                  title="Open sidebar"
                  style={{
                    backgroundColor: isDark ? '#1a1f2e' : '#eff6ff',
                    borderColor: isDark ? '#2d3748' : '#3b82f6'
                  }}
                  onMouseEnter={(e) => {
                    const bg = isDark ? '#252d3d' : '#dbeafe'
                    e.currentTarget.style.backgroundColor = bg
                  }}
                  onMouseLeave={(e) => {
                    const bg = isDark ? '#1a1f2e' : '#eff6ff'
                    e.currentTarget.style.backgroundColor = bg
                  }}
                >
                  <svg 
                    className="w-6 h-6" 
                    fill="none" 
                    stroke={isDark ? '#ffffff' : '#2563eb'}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <div className="font-bold text-[var(--color-brand)]">PG Micro ISOMS</div>
              <div className="flex items-center gap-3 ml-auto">
                {user?.account_type && (
                  <span className="badge capitalize">
                    {user.account_type === 'admin' ? 'Administrator' : 'Employee'}
                  </span>
                )}
                {userDisplayName && <span className="text-sm text-gray-600">{userDisplayName}</span>}
                {isAdmin && (
                  <Link to="/users">
                    <Button className="!py-1 !px-3">Add user</Button>
                  </Link>
                )}
                <button className="btn-ghost" onClick={logout}>Logout</button>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto p-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}