import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Package, Users, ShoppingCart, Activity, DollarSign, AlertTriangle, CheckCircle, TrendingDown, ArrowUpRight, ArrowDownRight, Clock, UserPlus, PackagePlus, RefreshCw } from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue", loading = false, onClick, subtitle, prefix = "" }) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-500",
      text: "text-white",
      cardBg: "bg-blue-50",
      border: "border-blue-200",
      hover: "hover:bg-blue-600"
    },
    green: {
      bg: "bg-green-500",
      text: "text-white", 
      cardBg: "bg-green-50",
      border: "border-green-200",
      hover: "hover:bg-green-600"
    },
    purple: {
      bg: "bg-purple-500",
      text: "text-white",
      cardBg: "bg-purple-50",
      border: "border-purple-200",
      hover: "hover:bg-purple-600"
    },
    orange: {
      bg: "bg-orange-500",
      text: "text-white",
      cardBg: "bg-orange-50",
      border: "border-orange-200",
      hover: "hover:bg-orange-600"
    },
    red: {
      bg: "bg-red-500",
      text: "text-white",
      cardBg: "bg-red-50",
      border: "border-red-200",
      hover: "hover:bg-red-600"
    },
    indigo: {
      bg: "bg-indigo-500",
      text: "text-white",
      cardBg: "bg-indigo-50",
      border: "border-indigo-200",
      hover: "hover:bg-indigo-600"
    }
  }

  const currentColor = colorClasses[color]

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border ${currentColor.border} group ${onClick ? 'cursor-pointer hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:border-opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${currentColor.bg} ${currentColor.hover} group-hover:scale-110 transition-all duration-300 shadow-sm`}>
          <Icon className={`w-6 h-6 ${currentColor.text}`} />
        </div>
        {trend && trendValue !== null && (
          <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? (
              <ArrowUpRight className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDownRight className="w-4 h-4 mr-1" />
            )}
            {trendValue}%
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</h3>
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            {subtitle && <div className="h-4 bg-gray-200 rounded w-16"></div>}
          </div>
        ) : (
          <>
            <p className="text-3xl font-bold text-gray-900">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const QuickAction = ({ icon: Icon, label, onClick, color = "gray", badge }) => {
  const colorClasses = {
    gray: "hover:bg-gray-50 text-gray-700 border-gray-200",
    blue: "hover:bg-blue-50 text-blue-700 border-blue-200",
    green: "hover:bg-green-50 text-green-700 border-green-200",
    purple: "hover:bg-purple-50 text-purple-700 border-purple-200",
    orange: "hover:bg-orange-50 text-orange-700 border-orange-200"
  }

  return (
    <button 
      onClick={onClick}
      className={`relative flex flex-col items-center p-4 rounded-lg border transition-all duration-200 ${colorClasses[color]} hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:border-opacity-50`}
    >
      <Icon className="w-6 h-6 mb-2" />
      <span className="text-sm font-medium text-center">{label}</span>
      {badge && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  )
}

const ActivityItem = ({ type, message, time, status = "info", onClick }) => {
  const statusColors = {
    info: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800", 
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800"
  }

  const statusIcons = {
    info: Activity,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertTriangle
  }

  const StatusIcon = statusIcons[status]

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${onClick ? 'hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' : ''}`}
    >
      <div className={`p-1.5 rounded-full ${statusColors[status]}`}>
        <StatusIcon className="w-3 h-3" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{message}</p>
        <p className="text-xs text-gray-500 flex items-center mt-1">
          <Clock className="w-3 h-3 mr-1" />
          {time}
        </p>
      </div>
    </div>
  )
}

const AlertCard = ({ title, message, type, count, onClick }) => {
  const alertTypes = {
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: AlertTriangle,
      iconColor: "text-yellow-600",
      titleColor: "text-yellow-800"
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200", 
      icon: AlertTriangle,
      iconColor: "text-red-600",
      titleColor: "text-red-800"
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: Activity,
      iconColor: "text-blue-600",
      titleColor: "text-blue-800"
    }
  }

  const config = alertTypes[type]
  const Icon = config.icon

  return (
    <div 
      onClick={onClick}
      className={`${config.bg} ${config.border} border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]`}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5`} />
        <div className="flex-1">
          <h4 className={`font-medium ${config.titleColor}`}>{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{message}</p>
          {count && (
            <p className="text-xs text-gray-500 mt-2">{count} items need attention</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Initialize with zero values - will be populated when API endpoints are created
  const [stats] = useState({ 
    orders: 0, 
    products: 0, 
    suppliers: 0, 
    customers: 0,
    revenue: 0,
    lowStock: 0,
    pendingReturns: 0,
    pendingPOs: 0
  })

  const [trends] = useState({ 
    orders: null, 
    products: null, 
    suppliers: null, 
    customers: null,
    revenue: null
  })

  const [recentActivities] = useState([])

  const refreshData = async () => {
    setRefreshing(true)
    // TODO: Add API calls here when backend dashboard endpoints are created
    // Example:
    // try {
    //   const response = await fetch('http://localhost:3002/api/dashboard/stats')
    //   const data = await response.json()
    //   setStats(data.stats)
    //   setTrends(data.trends)
    // } catch (error) {
    //   console.error('Error fetching dashboard data:', error)
    // }
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  useEffect(() => {
    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      clearInterval(timeInterval)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-gray-600 mt-1">Monitor your business performance and key metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-900">{currentTime.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={stats.revenue}
            prefix="₱"
            subtitle="Completed orders"
            icon={DollarSign}
            trend={trends.revenue?.direction}
            trendValue={trends.revenue?.percentage}
            color="green"
            loading={loading}
            onClick={() => navigate('/sales')}
          />
          <StatCard
            title="Total Orders"
            value={stats.orders}
            subtitle="All time"
            icon={ShoppingCart}
            trend={trends.orders?.direction}
            trendValue={trends.orders?.percentage}
            color="blue"
            loading={loading}
            onClick={() => navigate('/sales')}
          />
          <StatCard
            title="Inventory Items"
            value={stats.products}
            subtitle="Total products"
            icon={Package}
            trend={trends.products?.direction}
            trendValue={trends.products?.percentage}
            color="purple"
            loading={loading}
            onClick={() => navigate('/inventory')}
          />
          <StatCard
            title="Active Customers"
            value={stats.customers}
            subtitle="Registered users"
            icon={Users}
            trend={trends.customers?.direction}
            trendValue={trends.customers?.percentage}
            color="indigo"
            loading={loading}
            onClick={() => navigate('/customers')}
          />
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-gray-600" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <QuickAction
                  icon={ShoppingCart}
                  label="New Sale"
                  color="blue"
                  onClick={() => navigate('/sales')}
                />
                <QuickAction
                  icon={PackagePlus}
                  label="Add Product"
                  color="green"
                  onClick={() => navigate('/inventory')}
                />
                <QuickAction
                  icon={UserPlus}
                  label="New Customer"
                  color="purple"
                  onClick={() => navigate('/customers')}
                />
                <QuickAction
                  icon={TrendingUp}
                  label="Purchase Order"
                  color="orange"
                  onClick={() => navigate('/purchase-orders')}
                />
                <QuickAction
                  icon={Users}
                  label="Suppliers"
                  color="gray"
                  onClick={() => navigate('/suppliers')}
                  badge={stats.suppliers > 0 ? stats.suppliers : null}
                />
                <QuickAction
                  icon={AlertTriangle}
                  label="Returns"
                  color="orange"
                  onClick={() => navigate('/returns')}
                  badge={stats.pendingReturns > 0 ? stats.pendingReturns : null}
                />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-gray-600" />
                  Recent Activity
                </h2>
                <button
                  onClick={() => navigate('/sales')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                >
                  View all →
                </button>
              </div>
              
              <div className="space-y-2">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <ActivityItem
                      key={index}
                      {...activity}
                      onClick={() => {
                        if (activity.type === 'order') navigate('/sales')
                        else if (activity.type === 'product') navigate('/inventory')
                        else if (activity.type === 'customer') navigate('/customers')
                        else if (activity.type === 'return') navigate('/returns')
                      }}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activities</h3>
                    <p>Activity feed will appear here when dashboard API is implemented</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics Row */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Low Stock Items"
            value={stats.lowStock}
            subtitle="Need restocking"
            icon={AlertTriangle}
            color="red"
            loading={loading}
            onClick={() => navigate('/inventory')}
          />
          <StatCard
            title="Pending Returns"
            value={stats.pendingReturns}
            subtitle="Awaiting approval"
            icon={RefreshCw}
            color="orange"
            loading={loading}
            onClick={() => navigate('/returns')}
          />
          <StatCard
            title="Active Suppliers"
            value={stats.suppliers}
            subtitle="Total suppliers"
            icon={Users}
            trend={trends.suppliers?.direction}
            trendValue={trends.suppliers?.percentage}
            color="indigo"
            loading={loading}
            onClick={() => navigate('/suppliers')}
          />
          <StatCard
            title="Pending POs"
            value={stats.pendingPOs}
            subtitle="Purchase orders"
            icon={Package}
            color="purple"
            loading={loading}
            onClick={() => navigate('/purchase-orders')}
          />
        </div>
      </div>
    </div>
  )
}