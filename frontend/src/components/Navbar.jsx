import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { authAPI } from '../lib/api'
import Button from './Button'

const tabs = [
  { to: '/', label: 'Dashboard', module: 'dashboard' },
  { to: '/customers', label: 'Customers', module: 'customers' },
  { to: '/suppliers', label: 'Suppliers', module: 'suppliers' },
  { to: '/sales', label: 'Sales', module: 'sales' },
  { to: '/purchase-orders', label: 'Purchase Orders', module: 'purchase-orders' },
  { to: '/returns', label: 'Return/Warranty', module: 'returns' },
  { to: '/inventory', label: 'Inventory', module: 'inventory' },
]

export default function Navbar() {
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

  const isAdmin = user?.account_type === 'admin'
  
  const userModules = user?.allowed_modules || []
  console.log('User modules in navbar:', userModules)
  
  const allowedTabs = tabs.filter(tab => {
    if (isAdmin) return true 
    return userModules.includes(tab.module)
  })

  const onLogout = async () => {
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

  return (
    <div className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="font-bold text-[var(--color-brand)]">PG Micro ISOMS</Link>
          <nav className="flex gap-4 items-center">
            {allowedTabs.map(t => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) => `px-2 py-1 rounded ${isActive ? 'text-[var(--color-brand)] font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {t.label}
              </NavLink>
            ))}
            {isAdmin && (
              <>
                <NavLink
                  to="/users"
                  className={({ isActive }) => `px-2 py-1 rounded ${isActive ? 'text-[var(--color-brand)] font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Users
                </NavLink>
                <NavLink
                  to="/api-docs"
                  className={({ isActive }) => `px-2 py-1 rounded ${isActive ? 'text-[var(--color-brand)] font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  API Docs
                </NavLink>
                <Link to="/users">
                  <Button className="ml-2">Add user</Button>
                </Link>
              </>
            )}
            <button onClick={onLogout} className="px-2 py-1 rounded text-gray-600 hover:text-gray-900">Log out</button>
          </nav>
        </div>
      </div>
    </div>
  )
}