import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../api';

const AVAILABLE_MODULES = [
  'dashboard',
  'sales', 
  'purchase-orders',
  'returns',
  'inventory',
  'customers',
  'suppliers'
];

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(email, password);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      return {};
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await authAPI.getCurrentUser();
      return response;
    } catch (error) {
      localStorage.removeItem('authToken');
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  token: localStorage.getItem('authToken'),
  availableModules: AVAILABLE_MODULES,
};

const normalizeUserModules = (user) => {
  if (!user) return null;
  
  let allowedModules = user.allowed_modules || [];
  
  if (user.account_type === 'admin') {
    allowedModules = AVAILABLE_MODULES;
  } else {
    if (!allowedModules.includes('dashboard')) {
      allowedModules = ['dashboard', ...allowedModules];
    }
    allowedModules = allowedModules.filter(module => AVAILABLE_MODULES.includes(module));
  }
  
  return {
    ...user,
    allowed_modules: allowedModules
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = normalizeUserModules(action.payload);
      state.isAuthenticated = true;
      state.error = null;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    resetAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.token = null;
      localStorage.removeItem('authToken');
    },
    
    updateUserModules: (state, action) => {
      if (state.user && state.user.id === action.payload.userId) {
        state.user.allowed_modules = action.payload.modules;
      }
    },
    
    checkModuleAccess: (state, action) => {
      const module = action.payload;
      if (!state.user || !state.isAuthenticated) {
        return false;
      }
      
      if (state.user.account_type === 'admin') {
        return true;
      }
      
      return state.user.allowed_modules?.includes(module) || false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = normalizeUserModules(action.payload.user);
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      });

    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = normalizeUserModules(action.payload.user);
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      });

    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = normalizeUserModules(action.payload.user);
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      });

    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearError, resetAuth, updateUserModules, checkModuleAccess } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAvailableModules = (state) => state.auth.availableModules;
export const selectUserModules = (state) => state.auth.user?.allowed_modules || [];
export const selectIsAdmin = (state) => state.auth.user?.account_type === 'admin';
export const selectHasModuleAccess = (module) => (state) => {
  const user = state.auth.user;
  if (!user || !state.auth.isAuthenticated) return false;
  if (user.account_type === 'admin') return true;
  if (module === 'users') return user.account_type === 'admin';
  return user.allowed_modules?.includes(module) || false;
};

export const selectAccessibleNavigation = (state) => {
  const user = state.auth.user;
  if (!user || !state.auth.isAuthenticated) return [];
  
  const allNavItems = [
    { id: 'dashboard', name: 'Dashboard', path: '/', module: 'dashboard' },
    { id: 'sales', name: 'Sales', path: '/sales', module: 'sales' },
    { id: 'purchase-orders', name: 'Purchase Orders', path: '/purchase-orders', module: 'purchase-orders' },
    { id: 'returns', name: 'Returns & Warranty', path: '/returns', module: 'returns' },
    { id: 'inventory', name: 'Inventory', path: '/inventory', module: 'inventory' },
    { id: 'customers', name: 'Customers', path: '/customers', module: 'customers' },
    { id: 'suppliers', name: 'Suppliers', path: '/suppliers', module: 'suppliers' },
    { id: 'users', name: 'Users', path: '/users', module: 'users' }
  ];
  
  if (user.account_type === 'admin') {
    return allNavItems;
  }
  
  const userModules = user.allowed_modules || ['dashboard'];
  return allNavItems.filter(item => 
    userModules.includes(item.module) && item.module !== 'users'
  );
};

export const validateModules = (modules, userType = 'employee') => {
  if (!Array.isArray(modules)) return ['dashboard'];
  
  if (userType === 'admin') {
    return AVAILABLE_MODULES;
  }
  
  const validModules = modules.filter(module => AVAILABLE_MODULES.includes(module));
  if (!validModules.includes('dashboard')) {
    validModules.unshift('dashboard');
  }
  
  return validModules;
};

export default authSlice.reducer;