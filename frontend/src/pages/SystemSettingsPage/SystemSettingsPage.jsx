import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Toast from '../../components/Toast'
import { Settings, Database, Bell, Shield, Palette, Globe, Save, RefreshCw, AlertTriangle } from 'lucide-react'
import { fetchSettings, updateSettings, applyTheme, applyPrimaryColor } from '../../lib/slices/settingsSlice'

export default function SystemSettingsPage() {
  const dispatch = useDispatch()
  const currentUser = useSelector(state => state.auth.user)
  const globalSettings = useSelector(state => state.settings)
  const isAdmin = currentUser?.account_type === 'admin' || 
                  currentUser?.allowed_modules?.includes('system-settings')

  const [settings, setSettings] = useState({
    general: {},
    notifications: {},
    security: {},
    appearance: {},
    system: {}
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [activeTab, setActiveTab] = useState('general')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  useEffect(() => {
    if (!isAdmin) {
      showToast('You do not have permission to access System Settings', 'error')
      setFetching(false)
      return
    }
    setFetching(true)
    console.log('Fetching settings...')
    dispatch(fetchSettings())
      .unwrap()
      .then(data => {
        console.log('Settings loaded successfully:', data)
        setFetching(false)
      })
      .catch(error => {
        console.error('Failed to load settings:', error)
        showToast('Failed to load settings: ' + error, 'error')
        setFetching(false)
      })
  }, [isAdmin, dispatch])

  useEffect(() => {
    console.log('Global settings updated:', globalSettings)
    setSettings({
      general: globalSettings.general || {},
      notifications: globalSettings.notifications || {},
      security: globalSettings.security || {},
      appearance: globalSettings.appearance || {},
      system: globalSettings.system || {}
    })
  }, [globalSettings])

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    console.log('Saving settings:', settings)
    try {
      const result = await dispatch(updateSettings(settings)).unwrap()
      console.log('Settings saved successfully:', result)
      showToast('Settings saved successfully!', 'success')
      
      // Apply theme and colors immediately
      console.log('Applying theme:', settings.appearance?.theme)
      dispatch(applyTheme())
      dispatch(applyPrimaryColor())
      
      // Force a check of the HTML class
      setTimeout(() => {
        const isDark = document.documentElement.classList.contains('dark')
        console.log('Dark mode active:', isDark)
        console.log('HTML classes:', document.documentElement.className)
      }, 100)
    } catch (error) {
      console.error('Error saving settings:', error)
      showToast(error?.message || error || 'Failed to save settings', 'error')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'system', label: 'System', icon: Database }
  ]

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You do not have permission to access System Settings.</p>
              <p className="text-sm text-gray-500 mt-2">Only administrators can modify system settings.</p>
            </div>
          </Card>
        </div>
      </div>
    )
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 fade-in">
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-2 text-gray-600">Configure system preferences and application settings</p>
        </div>

        {fetching ? (
          <Card>
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading settings...</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Card title="Settings" padding="sm">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Card
                title={tabs.find(tab => tab.id === activeTab)?.label}
                actions={
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Save className="w-4 h-4" />}
                    onClick={handleSaveSettings}
                    loading={loading}
                  >
                    Save Settings
                  </Button>
                }
              >
                <div className="transition-all duration-200">
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input
                            label="Company Name"
                            value={settings.general?.company_name || ''}
                            onChange={(e) => handleSettingChange('general', 'company_name', e.target.value)}
                            placeholder="Enter company name"
                          />
                          <Input
                            label="Company Email"
                            type="email"
                            value={settings.general?.company_email || ''}
                            onChange={(e) => handleSettingChange('general', 'company_email', e.target.value)}
                            placeholder="Enter company email"
                          />
                          <Input
                            label="Company Phone"
                            value={settings.general?.company_phone || ''}
                            onChange={(e) => handleSettingChange('general', 'company_phone', e.target.value)}
                            placeholder="Enter company phone"
                          />
                          <Input
                            label="Company Address"
                            value={settings.general?.company_address || ''}
                            onChange={(e) => handleSettingChange('general', 'company_address', e.target.value)}
                            placeholder="Enter company address"
                          />
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                            <select
                              value={settings.general?.timezone || 'Asia/Singapore'}
                              onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>
                              <option value="Asia/Manila">Asia/Manila (UTC+8)</option>
                              <option value="Asia/Hong_Kong">Asia/Hong Kong (UTC+8)</option>
                              <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
                              <option value="Asia/Kuala_Lumpur">Asia/Kuala Lumpur (UTC+8)</option>
                            </select>
                          </div>
                          <Input
                            label="Date Format"
                            value={settings.general?.date_format || 'YYYY-MM-DD'}
                            onChange={(e) => handleSettingChange('general', 'date_format', e.target.value)}
                            placeholder="e.g., YYYY-MM-DD"
                            disabled
                          />
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                            <select
                              value={settings.general?.time_format || '12h & 24h'}
                              onChange={(e) => handleSettingChange('general', 'time_format', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="12h & 24h">12h & 24h</option>
                              <option value="12h">12h</option>
                              <option value="24h">24h</option>
                            </select>
                          </div>
                          <Input
                            label="Currency"
                            value={settings.general?.currency || 'PHP'}
                            onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                            placeholder="e.g., USD, EUR"
                            disabled
                          />
                          <Input
                            label="Language"
                            value={settings.general?.language || 'en'}
                            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                            placeholder="e.g., en, es"
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Email Notifications</p>
                              <p className="text-sm text-gray-500">Receive notifications via email</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={settings.notifications?.email_notifications || false}
                              onChange={(e) => handleSettingChange('notifications', 'email_notifications', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Push Notifications</p>
                              <p className="text-sm text-gray-500">Receive browser push notifications</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={settings.notifications?.push_notifications || false}
                              onChange={(e) => handleSettingChange('notifications', 'push_notifications', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Notification Sound</p>
                              <p className="text-sm text-gray-500">Play sound for notifications</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={settings.notifications?.notification_sound || false}
                              onChange={(e) => handleSettingChange('notifications', 'notification_sound', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">New Order Notifications</p>
                              <p className="text-sm text-gray-500">Notify admins on new orders</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={settings.notifications?.notify_on_new_order || false}
                              onChange={(e) => handleSettingChange('notifications', 'notify_on_new_order', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Low Stock Alerts</p>
                              <p className="text-sm text-gray-500">Notify admins on low stock</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={settings.notifications?.notify_on_low_stock || false}
                              onChange={(e) => handleSettingChange('notifications', 'notify_on_low_stock', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">New User Notifications</p>
                              <p className="text-sm text-gray-500">Notify admins on new user registration</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={settings.notifications?.notify_on_new_user || false}
                              onChange={(e) => handleSettingChange('notifications', 'notify_on_new_user', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <Input
                            label="Session Timeout (minutes)"
                            type="number"
                            value={settings.security?.session_timeout || 30}
                            onChange={(e) => handleSettingChange('security', 'session_timeout', parseInt(e.target.value))}
                            placeholder="30"
                          />
                          <Input
                            label="Password Min Length"
                            type="number"
                            value={settings.security?.password_min_length || 6}
                            onChange={(e) => handleSettingChange('security', 'password_min_length', parseInt(e.target.value))}
                            placeholder="6"
                          />
                          <Input
                            label="Max Login Attempts"
                            type="number"
                            value={settings.security?.max_login_attempts || 5}
                            onChange={(e) => handleSettingChange('security', 'max_login_attempts', parseInt(e.target.value))}
                            placeholder="5"
                          />
                          <Input
                            label="Lockout Duration (minutes)"
                            type="number"
                            value={settings.security?.lockout_duration || 15}
                            onChange={(e) => handleSettingChange('security', 'lockout_duration', parseInt(e.target.value))}
                            placeholder="15"
                          />
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Require Special Characters</p>
                              <p className="text-sm text-gray-500">Require special characters in passwords</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={settings.security?.password_require_special || false}
                              onChange={(e) => handleSettingChange('security', 'password_require_special', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                              <p className="text-sm text-gray-500">Enable two-factor authentication</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={settings.security?.enable_2fa || false}
                              onChange={(e) => handleSettingChange('security', 'enable_2fa', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'appearance' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                            <select
                              value={settings.appearance?.theme || 'light'}
                              onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="light">Light</option>
                              <option value="dark">Dark</option>
                            </select>
                          </div>
                          <Input
                            label="Primary Color"
                            type="color"
                            value={settings.appearance?.primary_color || '#3B82F6'}
                            onChange={(e) => handleSettingChange('appearance', 'primary_color', e.target.value)}
                          />
                          <Input
                            label="Logo URL"
                            value={settings.appearance?.logo_url || ''}
                            onChange={(e) => handleSettingChange('appearance', 'logo_url', e.target.value)}
                            placeholder="https://example.com/logo.png"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'system' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <Input
                            label="Max File Upload Size (MB)"
                            type="number"
                            value={settings.system?.max_file_size || 50}
                            onChange={(e) => handleSettingChange('system', 'max_file_size', parseInt(e.target.value))}
                            placeholder="50"
                          />
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Enable Chat System</p>
                              <p className="text-sm text-gray-500">Allow users to use chat feature</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={settings.system?.enable_chat || false}
                              onChange={(e) => handleSettingChange('system', 'enable_chat', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Enable File Uploads</p>
                              <p className="text-sm text-gray-500">Allow file uploads in chat</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={settings.system?.enable_file_uploads || false}
                              onChange={(e) => handleSettingChange('system', 'enable_file_uploads', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Enable Notifications</p>
                              <p className="text-sm text-gray-500">Enable notification system</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={settings.system?.enable_notifications || false}
                              onChange={(e) => handleSettingChange('system', 'enable_notifications', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                            <div>
                              <p className="font-medium text-red-900 flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Maintenance Mode
                              </p>
                              <p className="text-sm text-red-700">Put the system in maintenance mode</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={settings.system?.maintenance_mode || false}
                              onChange={(e) => handleSettingChange('system', 'maintenance_mode', e.target.checked)}
                              className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
