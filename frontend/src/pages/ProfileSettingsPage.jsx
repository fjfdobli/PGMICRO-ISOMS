import React, { useState, useEffect } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import { User, Mail, Phone, MapPin, Shield, Save, Edit3, Eye, EyeOff } from 'lucide-react'

export default function ProfileSettingsPage() {
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

  useEffect(() => {
    // Load user data from localStorage or API
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    setUser(userData)
  }, [])

  const handleInputChange = (field, value) => {
    setUser(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      // API call to update profile
      console.log('Updating profile:', user)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    
    setLoading(true)
    try {
      // API call to change password
      console.log('Changing password')
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Error changing password:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 fade-in">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">Manage your personal information and account preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
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

          {/* Password Change */}
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

            {/* Account Status */}
            <Card
              title="Account Status"
              className="mt-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Account Status</span>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Login</span>
                  <span className="text-sm text-gray-900">Today, 2:30 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm text-gray-900">Jan 2024</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
