import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../../lib/slices/authSlice'
import { Eye, EyeOff, CheckCircle, Shield, Users } from 'lucide-react'
import { authAPI } from '../../lib/api'

export default function RegisterPage({ onSwitchToLogin }) {
  const dispatch = useDispatch()
  const { loading, error } = useSelector(state => state.auth)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [localError, setLocalError] = useState('')
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isBootstrap, setIsBootstrap] = useState(false)
  const [checkingBootstrap, setCheckingBootstrap] = useState(true)

  useEffect(() => {
    checkBootstrapMode()
  }, [])

  const checkBootstrapMode = async () => {
    try {
      const response = await authAPI.checkBootstrapMode()
      setIsBootstrap(response.isBootstrap)
    } catch (error) {
      console.error('Failed to check bootstrap mode:', error)
      setIsBootstrap(false)
    } finally {
      setCheckingBootstrap(false)
    }
  }

  const onRegister = async (e) => {
    e.preventDefault()
    setLocalError('')
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setLocalError('Please fill in all required fields')
      return
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long')
      return
    }

    try {
      const accountType = isBootstrap ? 'admin' : 'employee'
      
      const userData = {
        email,
        password,
        firstName,
        lastName,
        accountType,
        phone: phone || undefined,
        address: address || undefined
      }

      await dispatch(registerUser(userData)).unwrap()
      
      if (isBootstrap) {
        setSuccessMessage('System has been initialized successfully! You can now sign in as the administrator.')
      } else {
        setSuccessMessage('Your access request has been submitted and is pending approval. You will be notified once an administrator reviews your request.')
      }
      
      setSuccess(true)
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  if (checkingBootstrap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {isBootstrap ? 'System Initialized!' : 'Request Submitted!'}
            </h1>
            <p className="text-gray-600 mb-6">
              {successMessage}
            </p>
            <button
              onClick={onSwitchToLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg"
            >
              {isBootstrap ? 'Sign In as Administrator' : 'Back to Sign In'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl mb-4">
            {isBootstrap ? (
              <Shield className="w-8 h-8 text-white" />
            ) : (
              <Users className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isBootstrap ? 'Initial System Setup' : 'Request System Access'}
          </h1>
          <p className="text-gray-600">
            {isBootstrap 
              ? 'Create the first administrator account' 
              : 'Submit a request to join your organization'
            }
          </p>
        </div>

        {isBootstrap && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">System Initialization</h3>
                <p className="text-yellow-700 text-sm">
                  You are creating the first administrator account for this ERP system. 
                  Only the business owner or designated IT administrator should complete this setup.
                </p>
              </div>
            </div>
          </div>
        )}

        {!isBootstrap && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <Users className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">Employee Access Request</h3>
                <p className="text-blue-700 text-sm">
                  Your request will be reviewed by a system administrator. You will be able to 
                  sign in once your account is approved and permissions are assigned.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={onRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white" 
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white" 
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input 
                type="email"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter email address"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-700">
                <div className="flex items-center">
                  {isBootstrap ? (
                    <>
                      <Shield className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="font-medium">Administrator</span>
                      <span className="text-sm text-gray-500 ml-2">(System Setup)</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium">Employee</span>
                      <span className="text-sm text-gray-500 ml-2">(Pending Approval)</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input 
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white" 
                  value={address} 
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Enter address"
                  disabled={loading}
                />
              </div>
            </div>
            
            {displayError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700 text-sm font-medium">{displayError}</span>
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
                  {isBootstrap ? 'Initializing System...' : 'Submitting Request...'}
                </div>
              ) : (
                isBootstrap ? 'Initialize System' : 'Submit Request'
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <span className="text-gray-600">Already have an account? </span>
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                disabled={loading}
              >
                Sign in here
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            {isBootstrap 
              ? 'Secure system initialization for PG Micro ISOMS'
              : 'Secure access request for PG Micro ISOMS'
            }
          </p>
        </div>
      </div>
    </div>
  )
}
