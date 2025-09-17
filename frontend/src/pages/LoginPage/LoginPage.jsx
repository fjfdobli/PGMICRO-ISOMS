import React from 'react'
import { useState } from 'react'
import { authAPI } from '../../lib/api'
import Button from '../../components/Button'
import ContactAdminModal from '../../components/ContactAdminModal'
import { Eye, EyeOff, AlertTriangle, Mail, Clock, Shield } from 'lucide-react'

export default function LoginPage({ onSwitchToRegister, onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suspensionInfo, setSuspensionInfo] = useState(null)
  const [showContactModal, setShowContactModal] = useState(false)

  // Debug: Log component render and suspensionInfo state
  console.log('LoginPage rendered, suspensionInfo:', suspensionInfo)

  const handleLogin = async (e) => {
    e.preventDefault()
    
    console.log('Login button clicked') // Debug log
    console.log('onLogin callback exists:', !!onLogin) // Debug log
    
    setError('')
    setSuspensionInfo(null)

    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    setLoading(true)
    try {
      console.log('Attempting login with:', { email }) // Debug log (don't log password)
      const data = await authAPI.login(email, password)
      console.log('Login successful:', data) // Debug log
      
      // The authAPI.login already stores the token in localStorage
      // Call the onLogin callback to update parent component state
      if (onLogin) {
        console.log('Calling onLogin callback') // Debug log
        onLogin()
      } else {
        console.error('onLogin callback not provided') // Debug log
        // Temporary workaround: reload the page to trigger auth check
        console.log('Reloading page as fallback')
        window.location.reload()
      }
    } catch (error) {
      console.error('Login failed:', error)
      console.log('Error response:', error.response) // Debug log
      console.log('Error response data:', error.response?.data) // Debug log
      
      // Check if the error response includes suspension information
      if (error.response?.data?.suspended && error.response?.data?.suspensionDetails) {
        console.log('Suspension details found:', error.response.data.suspensionDetails) // Debug log
        setSuspensionInfo(error.response.data.suspensionDetails)
        setError('') // Clear any error message since we're showing suspension info
        console.log('Suspension info set successfully') // Debug log
      } else if (error.response?.data?.suspensionDetails) {
        // Sometimes suspended might not be set but suspensionDetails exists
        console.log('Suspension details found (without suspended flag):', error.response.data.suspensionDetails) // Debug log
        setSuspensionInfo(error.response.data.suspensionDetails)
        setError('') // Clear any error message since we're showing suspension info
      } else {
        // Check if the error message indicates suspension
        if (error.message && error.message.includes('suspended')) {
          console.log('Suspension detected from error message') // Debug log
          // Try to extract suspension info from the error response data
          const responseData = error.response?.data
          if (responseData) {
            console.log('Full response data:', responseData) // Debug log
            // Set a basic suspension info if we have some data
            setSuspensionInfo({
              reason: responseData.suspensionReason || responseData.suspension_reason || 'No reason provided',
              admin_email: responseData.admin_email || responseData.suspended_by_email || 'admin@pgmicro.com',
              suspended_at: responseData.suspended_at || new Date().toISOString(),
              suspended_by: responseData.suspended_by || 'System Administrator'
            })
            setError('') // Clear any error message since we're showing suspension info
          } else {
            setError(error.message || 'Login failed. Please check your credentials.')
          }
        } else {
          setError(error.message || 'Login failed. Please check your credentials.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // Debug: Log suspension info changes
  React.useEffect(() => {
    console.log('Suspension info changed:', suspensionInfo)
  }, [suspensionInfo])

  // Debug: Log before render
  console.log('About to render, suspensionInfo exists:', !!suspensionInfo)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PG Micro ISOMS</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input 
                type="email"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white" 
                value={email} 
                onChange={e => {
                  setEmail(e.target.value)
                  setError('')
                  setSuspensionInfo(null)
                }}
                placeholder="Enter your email address"
                disabled={loading}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white" 
                  value={password} 
                  onChange={e => {
                    setPassword(e.target.value)
                    setError('')
                    setSuspensionInfo(null)
                  }}
                  placeholder="Enter your password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {suspensionInfo && (
              <div 
                className="bg-red-100 border-4 border-red-500 rounded-xl p-6 mb-4 shadow-lg" 
                style={{
                  border: '4px solid #ef4444',
                  backgroundColor: '#fef2f2',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'
                }}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="w-8 h-8 text-red-500 mt-0.5" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-xl font-bold text-red-800 mb-3">
                      🚫 ACCOUNT SUSPENDED 🚫
                    </h3>
                    
                    <div className="space-y-3 text-sm text-red-700">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-red-500" />
                        <span className="font-medium">Status:</span>
                        <span className="ml-1 font-bold">Your account has been suspended by administration</span>
                      </div>
                      
                      {suspensionInfo.reason && (
                        <div className="flex items-start">
                          <Clock className="w-4 h-4 mr-2 text-red-500 mt-0.5" />
                          <div>
                            <span className="font-medium">Reason:</span>
                            <span className="ml-1 font-bold">{suspensionInfo.reason}</span>
                          </div>
                        </div>
                      )}
                      
                      {suspensionInfo.suspended_by && (
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-red-500" />
                          <span className="font-medium">Suspended by:</span>
                          <span className="ml-1 font-bold">{suspensionInfo.suspended_by}</span>
                        </div>
                      )}
                      
                      {suspensionInfo.suspended_at && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-orange-500" />
                          <span className="font-medium">Suspended on:</span>
                          <span className="ml-1">{new Date(suspensionInfo.suspended_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 p-4 bg-orange-100 rounded-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Need Help?</h4>
                      <p className="text-sm text-orange-700 mb-3">
                        If you believe this suspension is in error or if you have any concerns, please contact the system administrator:
                      </p>
                      
                      {suspensionInfo.admin_email && (
                        <div className="flex items-center text-sm">
                          <Mail className="w-4 h-4 mr-2 text-orange-600" />
                          <button
                            onClick={() => setShowContactModal(true)}
                            className="text-orange-600 hover:text-orange-800 font-medium underline bg-transparent border-none cursor-pointer"
                          >
                            {suspensionInfo.admin_email}
                          </button>
                        </div>
                      )}
                      
                      <p className="text-xs text-orange-600 mt-2">
                        An email notification has been sent to your registered email address with details about this suspension.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <span className="text-gray-600">Don't have an account? </span>
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                disabled={loading}
              >
                Create one here
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Secure access to your business management system
          </p>
        </div>
      </div>

      {/* Contact Admin Modal */}
      <ContactAdminModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        adminEmail={suspensionInfo?.admin_email || 'admin@pgmicro.com'}
        userEmail={email}
        suspensionReason={suspensionInfo?.reason}
      />
    </div>
  )
}
