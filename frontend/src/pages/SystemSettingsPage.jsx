import React, { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import { Settings, Database, Bell, Shield, Palette, Globe, Save, RefreshCw, AlertTriangle } from 'lucide-react'

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'PGMICRO ISOMS',
    timezone: 'UTC+8',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    emailNotifications: true,
    pushNotifications: true,
    lowStockAlerts: true,
    orderAlerts: true,
    systemAlerts: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    twoFactorAuth: false,
    ipWhitelist: '',
    theme: 'light',
    primaryColor: '#3B82F6',
    sidebarCollapsed: false,
    autoBackup: true,
    backupFrequency: 'daily',
    logRetention: 30,
    maintenanceMode: false
  })

  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      console.log('Saving settings:', settings)
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Error saving settings:', error)
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 fade-in">
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-2 text-gray-600">Configure system preferences and application settings</p>
        </div>

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
                          value={settings.companyName}
                          onChange={(e) => handleSettingChange('companyName', e.target.value)}
                          placeholder="Enter company name"
                        />
                        <Input
                          label="Timezone"
                          value={settings.timezone}
                          onChange={(e) => handleSettingChange('timezone', e.target.value)}
                          placeholder="Select timezone"
                        />
                        <Input
                          label="Language"
                          value={settings.language}
                          onChange={(e) => handleSettingChange('language', e.target.value)}
                          placeholder="Select language"
                        />
                        <Input
                          label="Date Format"
                          value={settings.dateFormat}
                          onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                          placeholder="Select date format"
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
                        {[
                          { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                          { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser push notifications' },
                          { key: 'lowStockAlerts', label: 'Low Stock Alerts', description: 'Get notified when inventory is low' },
                          { key: 'orderAlerts', label: 'Order Alerts', description: 'Get notified about new orders' },
                          { key: 'systemAlerts', label: 'System Alerts', description: 'Get notified about system events' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{item.label}</h4>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings[item.key]}
                                onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="Session Timeout (minutes)"
                          type="number"
                          value={settings.sessionTimeout}
                          onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                          placeholder="30"
                        />
                        <Input
                          label="Password Expiry (days)"
                          type="number"
                          value={settings.passwordExpiry}
                          onChange={(e) => handleSettingChange('passwordExpiry', parseInt(e.target.value))}
                          placeholder="90"
                        />
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                            <p className="text-sm text-gray-600">Add an extra layer of security</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.twoFactorAuth}
                              onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <Input
                          label="IP Whitelist"
                          value={settings.ipWhitelist}
                          onChange={(e) => handleSettingChange('ipWhitelist', e.target.value)}
                          placeholder="192.168.1.1, 10.0.0.1"
                          helperText="Comma-separated list of allowed IP addresses"
                        />
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
                            value={settings.theme}
                            onChange={(e) => handleSettingChange('theme', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={settings.primaryColor}
                              onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <span className="text-sm text-gray-600">{settings.primaryColor}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Collapsed Sidebar</h4>
                            <p className="text-sm text-gray-600">Start with sidebar collapsed</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.sidebarCollapsed}
                              onChange={(e) => handleSettingChange('sidebarCollapsed', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'system' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">System Configuration</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Auto Backup</h4>
                            <p className="text-sm text-gray-600">Automatically backup system data</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.autoBackup}
                              onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                            <select
                              value={settings.backupFrequency}
                              onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="hourly">Hourly</option>
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                          <Input
                            label="Log Retention (days)"
                            type="number"
                            value={settings.logRetention}
                            onChange={(e) => handleSettingChange('logRetention', parseInt(e.target.value))}
                            placeholder="30"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-yellow-800">Maintenance Mode</h4>
                              <p className="text-sm text-yellow-700">Temporarily disable system access</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.maintenanceMode}
                              onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
