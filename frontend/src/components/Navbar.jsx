import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { authAPI } from '../lib/api'
import Button from './Button'

const tabs = [
  { to: '/customers', label: 'Customers' },
  { to: '/suppliers', label: 'Suppliers' },
  { to: '/', label: 'Dashboard' },
  { to: '/sales', label: 'Sales' },
  { to: '/purchase-orders', label: 'Purchase Orders' },
  { to: '/returns', label: 'Return/Warranty' },
  { to: '/inventory', label: 'Inventory' },
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

  const onLogout = async () => {
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

  return (
    <div className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="font-bold text-[var(--color-brand)]">PG Micro ISOMS</Link>
          <nav className="flex gap-4 items-center">
            {tabs.map(t => (
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