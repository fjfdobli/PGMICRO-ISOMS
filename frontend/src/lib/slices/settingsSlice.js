import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { settingsAPI } from '../api'

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.getAll()
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || 'Failed to fetch settings')
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch settings')
    }
  }
)

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.updateAll(settings)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || 'Failed to update settings')
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update settings')
    }
  }
)

export const updateSingleSetting = createAsyncThunk(
  'settings/updateSingleSetting',
  async ({ key, value }, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.updateSingle(key, value)
      if (response.success) {
        return { key, value }
      }
      return rejectWithValue(response.message || 'Failed to update setting')
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update setting')
    }
  }
)

const initialState = {
  general: {
    company_name: 'PGMICRO-ISOMS',
    company_email: '',
    company_phone: '',
    company_address: '',
    timezone: 'UTC',
    date_format: 'YYYY-MM-DD',
    time_format: '12h & 24h',
    currency: 'PHP',
    language: 'en',
  },
  notifications: {
    email_notifications: true,
    push_notifications: true,
    notification_sound: true,
    notify_on_new_order: true,
    notify_on_low_stock: true,
    notify_on_new_user: true,
  },
  security: {
    session_timeout: 30,
    password_min_length: 6,
    max_login_attempts: 5,
    lockout_duration: 15,
    password_require_special: false,
    enable_2fa: false,
  },
  appearance: {
    theme: 'light',
    primary_color: '#3B82F6',
    logo_url: '',
  },
  system: {
    max_file_size: 50,
    enable_chat: true,
    enable_file_uploads: true,
    enable_notifications: true,
    maintenance_mode: false,
  },
  loading: false,
  error: null,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action) => {
      return { ...state, ...action.payload, loading: false, error: null }
    },
    setSingleSetting: (state, action) => {
      const { category, key, value } = action.payload
      if (state[category]) {
        state[category][key] = value
      }
    },
    applyTheme: (state) => {
      const theme = state.appearance?.theme || 'light'
      const htmlElement = document.documentElement
      
     // console.log('Applying theme:', theme)
      
      if (theme === 'dark') {
        htmlElement.classList.add('dark')
      //  console.log('Added dark class to HTML')
      } else if (theme === 'light') {
        htmlElement.classList.remove('dark')
      //  console.log('Removed dark class from HTML')
      } else if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          htmlElement.classList.add('dark')
       //   console.log('Auto mode: Added dark class (system prefers dark)')
        } else {
          htmlElement.classList.remove('dark')
       //   console.log('Auto mode: Removed dark class (system prefers light)')
        }
      }
      
    //  console.log('Current HTML classes:', htmlElement.className)
    },
    applyPrimaryColor: (state) => {
      const primaryColor = state.appearance?.primary_color || '#3B82F6'
    //  console.log('Applying primary color:', primaryColor)
      document.documentElement.style.setProperty('--primary-color', primaryColor)
      document.documentElement.style.setProperty('--color-brand', primaryColor)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false
        state.general = { ...state.general, ...action.payload.general }
        state.notifications = { ...state.notifications, ...action.payload.notifications }
        state.security = { ...state.security, ...action.payload.security }
        state.appearance = { ...state.appearance, ...action.payload.appearance }
        state.system = { ...state.system, ...action.payload.system }
      
      //  console.log('Settings fetched, auto-applying theme:', state.appearance?.theme)
        const theme = state.appearance?.theme || 'light'
        const htmlElement = document.documentElement
        if (theme === 'dark') {
          htmlElement.classList.add('dark')
        } else if (theme === 'light') {
          htmlElement.classList.remove('dark')
        } else if (theme === 'auto') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          if (prefersDark) htmlElement.classList.add('dark')
          else htmlElement.classList.remove('dark')
        }
        
        const primaryColor = state.appearance?.primary_color || '#3B82F6'
        document.documentElement.style.setProperty('--primary-color', primaryColor)
        document.documentElement.style.setProperty('--color-brand', primaryColor)
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false
        state.general = { ...state.general, ...action.payload.general }
        state.notifications = { ...state.notifications, ...action.payload.notifications }
        state.security = { ...state.security, ...action.payload.security }
        state.appearance = { ...state.appearance, ...action.payload.appearance }
        state.system = { ...state.system, ...action.payload.system }
        
       // console.log('Settings updated, auto-applying theme:', state.appearance?.theme)
        const theme = state.appearance?.theme || 'light'
        const htmlElement = document.documentElement
        if (theme === 'dark') {
          htmlElement.classList.add('dark')
        } else if (theme === 'light') {
          htmlElement.classList.remove('dark')
        } else if (theme === 'auto') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          if (prefersDark) htmlElement.classList.add('dark')
          else htmlElement.classList.remove('dark')
        }
        
        const primaryColor = state.appearance?.primary_color || '#3B82F6'
        document.documentElement.style.setProperty('--primary-color', primaryColor)
        document.documentElement.style.setProperty('--color-brand', primaryColor)
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateSingleSetting.fulfilled, (state, action) => {
        const { key, value } = action.payload
        for (const category of ['general', 'notifications', 'security', 'appearance', 'system']) {
          if (state[category] && key in state[category]) {
            state[category][key] = value
            break
          }
        }
      })
  },
})

export const { setSettings, setSingleSetting, applyTheme, applyPrimaryColor } = settingsSlice.actions
export default settingsSlice.reducer
