import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Package, Users, ShoppingCart, Activity, DollarSign, AlertTriangle, CheckCircle, TrendingDown, ArrowUpRight, ArrowDownRight, Clock, UserPlus, PackagePlus, RefreshCw, BarChart3, Calendar, FileText, Truck, Archive, Zap, Target, Award, Eye, ArrowUp, ArrowDown, ChevronDown, LineChart as LineChartIcon, PieChart as PieChartIcon, BarChart2 } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, RadialBarChart, RadialBar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart } from 'recharts'

// Data will be fetched from API

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm text-white p-4 rounded-xl shadow-2xl border border-gray-700">
        <p className="font-bold text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Chart Card Wrapper Component
const ChartCard = ({ title, subtitle, icon: Icon, children }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-blue-600 rounded-lg">
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue", loading = false, onClick, subtitle, prefix = "" }) => {
  const colors = {
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-600', border: 'border-blue-200' },
    green: { bg: 'bg-green-50', icon: 'bg-green-600', border: 'border-green-200' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-600', border: 'border-purple-200' },
    orange: { bg: 'bg-orange-50', icon: 'bg-orange-600', border: 'border-orange-200' },
    red: { bg: 'bg-red-50', icon: 'bg-red-600', border: 'border-red-200' },
    indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-600', border: 'border-indigo-200' },
  }

  const colorScheme = colors[color]

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Icon Section */}
        <div className={`p-3 ${colorScheme.icon} rounded-lg flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-7 bg-gray-200 rounded w-24"></div>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900">
                {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
          )}
        </div>

        {/* Trend Section */}
        {trend && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md flex-shrink-0 ${trend === 'up' ? 'bg-green-50' : 'bg-red-50'}`}>
            {trend === 'up' ? <ArrowUp className="w-4 h-4 text-green-600" /> : <ArrowDown className="w-4 h-4 text-red-600" />}
            <div className="text-right">
              <p className={`text-sm font-bold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue}%
              </p>
            </div>
          </div>
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
  const [is24Hour, setIs24Hour] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState(new Date())
  
  // Revenue Chart Controls
  const [timePeriod, setTimePeriod] = useState('6-months')
  const [chartType, setChartType] = useState('combined')

  // Replace with your real API data
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
    orders: { direction: 'up', percentage: 0 }, 
    products: { direction: 'up', percentage: 0 }, 
    suppliers: { direction: 'up', percentage: 0 }, 
    customers: { direction: 'up', percentage: 0 },
    revenue: { direction: 'up', percentage: 0 }
  })

  const [recentActivities] = useState([])

  const refreshData = async () => {
    setRefreshing(true)
    
    // TODO: Replace with actual API calls
    // Example:
    // try {
    //   const [statsData, trendsData, activitiesData] = await Promise.all([
    //     fetchStats(),
    //     fetchTrends(),
    //     fetchActivities()
    //   ])
    //   setStats(statsData)
    //   setTrends(trendsData)
    //   setRecentActivities(activitiesData)
    // } catch (error) {
    //   console.error('Error refreshing data:', error)
    // } finally {
    //   setRefreshing(false)
    //   setLastSyncTime(new Date())
    // }
    
    // Simulate immediate API response (remove in production)
    await new Promise(resolve => setTimeout(resolve, 100))
    setRefreshing(false)
    setLastSyncTime(new Date())
  }

  // Clock update - every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timeInterval)
  }, [])

  // Real-time auto-sync - every 1 second
  useEffect(() => {
    // Initial data load
    refreshData()
    
    const autoSyncInterval = setInterval(() => {
      refreshData()
    }, 1000) // 1000ms = 1 second for real-time updates
    
    return () => clearInterval(autoSyncInterval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Minimal Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-[1800px] mx-auto px-8 py-5">
          <div className="flex items-center justify-between flex-wrap gap-6">
            {/* Left: Title Section */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here's your business overview</p>
            </div>
            
            {/* Right: Date, Time & Actions */}
            <div className="flex items-center gap-3">
              {/* Date & Time Combined */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-gray-300">|</span>
                <Clock className="w-4 h-4 text-gray-500" />
                <button
                  onClick={() => setIs24Hour(!is24Hour)}
                  className="text-sm font-medium text-gray-700 tabular-nums hover:text-blue-600 transition-colors"
                  title={`Click to switch to ${is24Hour ? '12-hour' : '24-hour'} format`}
                >
                  {is24Hour 
                    ? currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
                    : currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
                  }
                </button>
              </div>
              
              {/* Auto-Sync Indicator - Creative Design */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="relative">
                  <RefreshCw className={`w-4 h-4 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
                  {!refreshing && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  )}
                </div>
                <div className="text-xs font-medium">
                  {refreshing ? (
                    <span className="text-blue-700">Live</span>
                  ) : (
                    <span className="text-gray-600">Live</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-8 py-8 space-y-8">
        {/* KPI Metrics - Cinematic Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={stats.revenue}
            prefix="₱"
            subtitle="This month"
            icon={DollarSign}
            color="green"
            onClick={() => navigate('/sales')}
          />
          <StatCard
            title="Total Orders"
            value={stats.orders}
            subtitle="All transactions"
            icon={ShoppingCart}
            color="blue"
            onClick={() => navigate('/sales')}
          />
          <StatCard
            title="Active Customers"
            value={stats.customers}
            subtitle="Registered users"
            icon={Users}
            color="purple"
            onClick={() => navigate('/customers')}
          />
          <StatCard
            title="Inventory Items"
            value={stats.products}
            subtitle="Total products"
            icon={Package}
            color="indigo"
            onClick={() => navigate('/inventory')}
          />
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Trend - Large Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200">
              {/* Header with Controls */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Revenue & Orders Analysis</h3>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {timePeriod === '1-day' && 'Last 24 hours'}
                        {timePeriod === '1-week' && 'Last 7 days'}
                        {timePeriod === '2-weeks' && 'Last 14 days'}
                        {timePeriod === '1-month' && 'Last 30 days'}
                        {timePeriod === '3-months' && 'Last 3 months'}
                        {timePeriod === '6-months' && 'Last 6 months'}
                        {timePeriod === '1-year' && 'Last 12 months'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <select
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                      >
                        <option value="1-day">1 Day</option>
                        <option value="1-week">1 Week</option>
                        <option value="2-weeks">2 Weeks</option>
                        <option value="1-month">1 Month</option>
                        <option value="3-months">3 Months</option>
                        <option value="6-months">6 Months</option>
                        <option value="1-year">1 Year</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>

                    {/* Chart Type Dropdown */}
                    <div className="relative">
                      <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                      >
                        <option value="combined">Combined (Area + Bar)</option>
                        <option value="area">Area Chart</option>
                        <option value="line">Line Chart</option>
                        <option value="bar">Bar Chart</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-center h-[350px] text-gray-400">
                  <div className="text-center">
                    <p className="text-lg font-medium">No data available</p>
                    <p className="text-sm mt-2">Selected: {chartType === 'combined' ? 'Combined Chart' : chartType === 'area' ? 'Area Chart' : chartType === 'line' ? 'Line Chart' : 'Bar Chart'} | {
                      timePeriod === '1-day' ? '1 Day' :
                      timePeriod === '1-week' ? '1 Week' :
                      timePeriod === '2-weeks' ? '2 Weeks' :
                      timePeriod === '1-month' ? '1 Month' :
                      timePeriod === '3-months' ? '3 Months' :
                      timePeriod === '6-months' ? '6 Months' : '1 Year'
                    }</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <ChartCard 
              title="Sales Distribution" 
              subtitle="By product category"
              icon={Target}
            >
              <div className="flex items-center justify-center h-[250px] text-gray-400">
                <p>No data available</p>
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Secondary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inventory Health - Minimal Design */}
          <ChartCard 
            title="Inventory Health Monitor" 
            subtitle="Weekly stock status"
            icon={Package}
          >
            {/* Inventory Stats Summary - Connect to your API */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-xs text-green-700 font-medium mb-1">In Stock</p>
                <p className="text-2xl font-bold text-green-900">0</p>
                <p className="text-xs text-green-600 mt-1">0%</p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <p className="text-xs text-orange-700 font-medium mb-1">Low Stock</p>
                <p className="text-2xl font-bold text-orange-900">0</p>
                <p className="text-xs text-orange-600 mt-1">0%</p>
              </div>
              
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <p className="text-xs text-red-700 font-medium mb-1">Out Stock</p>
                <p className="text-2xl font-bold text-red-900">0</p>
                <p className="text-xs text-red-600 mt-1">0%</p>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="flex items-center justify-center h-[280px] text-gray-400">
              <p>No data available</p>
            </div>
          </ChartCard>

          {/* Top Products - Simplified */}
          <ChartCard 
            title="Top Selling Products" 
            subtitle="Best performers this month"
            icon={Award}
          >
            <div className="flex items-center justify-center h-[200px] text-gray-400">
              <p>No data available</p>
            </div>
          </ChartCard>
        </div>

        {/* Performance Metrics - Connect to your API */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[
            { metric: 'Sales Performance', value: 0, fill: '#10B981' },
            { metric: 'Customer Satisfaction', value: 0, fill: '#3B82F6' },
            { metric: 'Inventory Turnover', value: 0, fill: '#8B5CF6' },
          ].map((item, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">{item.metric}</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{item.value}%</p>
                </div>
                <div className={`p-3 rounded-lg`} style={{ backgroundColor: item.fill + '20' }}>
                  <Zap className="w-6 h-6" style={{ color: item.fill }} />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Progress</span>
                  <span>{item.value}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div 
                    className="h-2.5 rounded-full transition-all duration-1000" 
                    style={{ 
                      width: `${item.value}%`,
                      backgroundColor: item.fill 
                    }}
                  ></div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <div className="px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-700">
                    No data
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions - Minimal Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: ShoppingCart, label: 'New Sale', iconBg: 'bg-blue-600', borderColor: 'border-blue-200', onClick: () => navigate('/sales') },
            { icon: PackagePlus, label: 'Add Product', iconBg: 'bg-green-600', borderColor: 'border-green-200', onClick: () => navigate('/inventory') },
            { icon: UserPlus, label: 'New Customer', iconBg: 'bg-purple-600', borderColor: 'border-purple-200', onClick: () => navigate('/customers') },
            { icon: FileText, label: 'Purchase Order', iconBg: 'bg-orange-600', borderColor: 'border-orange-200', onClick: () => navigate('/purchase-orders') },
            { icon: Truck, label: 'Suppliers', iconBg: 'bg-indigo-600', borderColor: 'border-indigo-200', onClick: () => navigate('/suppliers') },
            { icon: AlertTriangle, label: 'Returns', iconBg: 'bg-red-600', borderColor: 'border-red-200', onClick: () => navigate('/returns'), badge: stats.pendingReturns },
            { icon: Eye, label: 'View Reports', iconBg: 'bg-gray-600', borderColor: 'border-gray-200', onClick: () => navigate('/sales') },
            { icon: Activity, label: 'System Health', iconBg: 'bg-cyan-600', borderColor: 'border-cyan-200', onClick: () => {} },
          ].map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`relative flex flex-col items-center gap-3 p-5 bg-white rounded-lg border ${action.borderColor} hover:shadow-md transition-all`}
            >
              <div className={`p-3 ${action.iconBg} rounded-lg`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">{action.label}</span>
              {action.badge && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                  {action.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
