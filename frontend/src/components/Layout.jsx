import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
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

  useEffect(() => {
    loadUserProfile()
  }, [])

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
      // Even if logout fails on server, clear local state
      localStorage.removeItem('authToken')
      setUser(null)
      navigate('/')
    }
  }

  const isAdmin = user?.account_type === 'admin'
  const userDisplayName = user ? `${user.first_name} ${user.last_name}` : ''

  return (
    <div className="body-shell">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-[var(--sidebar-w)] shrink-0 border-r bg-white">
          <div className="px-4 py-4">
            <div className="text-xl font-bold text-[var(--color-brand)]">PG Micro ISOMS</div>
          </div>
          <nav className="px-3 space-y-1">
            <NavItem to="/" label="Dashboard" />
            <NavItem to="/sales" label="Sales" />
            <NavItem to="/purchase-orders" label="Purchase Orders" />
            <NavItem to="/returns" label="Return/Warranty" />
            <NavItem to="/inventory" label="Inventory" />
            <NavItem to="/customers" label="Customers" />
            <NavItem to="/suppliers" label="Suppliers" />
            {isAdmin && <NavItem to="/users" label="Users" />}
          </nav>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Topbar */}
          <header className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
              <div className="md:hidden font-bold text-[var(--color-brand)]">PG Micro ISOMS</div>
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

          {/* Content */}
          <main className="max-w-7xl mx-auto p-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}