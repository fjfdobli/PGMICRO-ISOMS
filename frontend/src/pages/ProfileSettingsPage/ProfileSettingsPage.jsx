import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Toast from '../../components/Toast'
import { User, Mail, Phone, MapPin, Shield, Save, Edit3, Eye, EyeOff } from 'lucide-react'
import { authAPI } from '../../lib/api'
import { getCurrentUser } from '../../lib/slices/authSlice'

export default function ProfileSettingsPage() {
  const dispatch = useDispatch()
  const currentUser = useSelector(state => state.auth.user)
  
  const [user, setUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    account_type: 'employee'
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  useEffect(() => {
    if (currentUser) {
      setUser({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        account_type: currentUser.account_type || 'employee'
      })
    } else {
      fetchCurrentUser()
    }
  }, [currentUser])

  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser()
      if (response.user) {
        setUser({
          first_name: response.user.first_name || '',
          last_name: response.user.last_name || '',
          email: response.user.email || '',
          phone: response.user.phone || '',
          address: response.user.address || '',
          account_type: response.user.account_type || 'employee'
        })
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      showToast('Failed to load user data', 'error')
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const handleInputChange = (field, value) => {
    setUser(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const profileData = {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        address: user.address
      }

      const response = await authAPI.updateProfile(profileData)
      
      if (response.success) {
        showToast('Profile updated successfully!', 'success')
        setIsEditing(false)
        
        // Update localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}')
        localStorage.setItem('userData', JSON.stringify({ ...userData, ...response.user }))
        
        // Refresh user data in Redux to get updated info including timestamps
        dispatch(getCurrentUser())
      } else {
        showToast(response.message || 'Failed to update profile', 'error')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      showToast(error.message || 'Failed to update profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast('All password fields are required', 'error')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error')
      return
    }

    if (passwordData.newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error')
      return
    }
    
    setLoading(true)
    try {
      const response = await authAPI.changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      })
      
      if (response.success) {
        showToast('Password changed successfully!', 'success')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        showToast(response.message || 'Failed to change password', 'error')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      showToast(error.message || 'Failed to change password', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 fade-in">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">Manage your personal information and account preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card
              title="Personal Information"
              subtitle="Update your personal details"
              actions={
                <Button
                  variant={isEditing ? "secondary" : "outline"}
                  size="sm"
                  leftIcon={isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  loading={loading}
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              }
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    value={user.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    disabled={!isEditing}
                    leftIcon={<User className="w-4 h-4" />}
                    placeholder="Enter your first name"
                  />
                  <Input
                    label="Last Name"
                    value={user.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    disabled={!isEditing}
                    leftIcon={<User className="w-4 h-4" />}
                    placeholder="Enter your last name"
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  value={user.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<Mail className="w-4 h-4" />}
                  placeholder="Enter your email address"
                />

                <Input
                  label="Phone Number"
                  value={user.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<Phone className="w-4 h-4" />}
                  placeholder="Enter your phone number"
                />

                <Input
                  label="Address"
                  value={user.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<MapPin className="w-4 h-4" />}
                  placeholder="Enter your address"
                />

                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Account Type: <span className="font-medium capitalize">{user.account_type}</span>
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card
              title="Change Password"
              subtitle="Update your account password"
            >
              <div className="space-y-4">
                <Input
                  label="Current Password"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  placeholder="Enter current password"
                />

                <Input
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="Enter new password"
                />

                <Input
                  label="Confirm New Password"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                />

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                    {showPassword ? 'Hide' : 'Show'} Passwords
                  </button>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleChangePassword}
                  loading={loading}
                  className="w-full"
                >
                  Update Password
                </Button>
              </div>
            </Card>

            <Card
              title="Account Status"
              className="mt-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Account Status</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    currentUser?.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : currentUser?.status === 'suspended'
                      ? 'bg-red-100 text-red-800'
                      : currentUser?.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentUser?.status ? currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1) : 'Active'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Login</span>
                  <span className="text-sm text-gray-900">
                    {currentUser?.last_login 
                      ? new Date(currentUser.last_login).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })
                      : 'Just now'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm text-gray-900">
                    {currentUser?.created_at 
                      ? new Date(currentUser.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric'
                        })
                      : new Date().toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric'
                        })}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
