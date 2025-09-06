import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return (data || []).map((product) => ({ ...product, quantity: product.stock }))
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const addInventoryItem = createAsyncThunk(
  'inventory/addInventoryItem',
  async (itemData, { rejectWithValue }) => {
    try {
      const toInsert = {
        name: itemData.name,
        sku: itemData.sku,
        category: itemData.category,
        price: itemData.price,
        stock: itemData.quantity,
      }
      const { data, error } = await supabase
        .from('products')
        .insert([toInsert])
        .select()
        .single()
      
      if (error) throw error
      return { ...data, quantity: data.stock }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateInventoryItem = createAsyncThunk(
  'inventory/updateInventoryItem',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const dbUpdates = { ...updates }
      if (Object.prototype.hasOwnProperty.call(dbUpdates, 'quantity')) {
        dbUpdates.stock = dbUpdates.quantity
        delete dbUpdates.quantity
      }
      const { data, error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { ...data, quantity: data.stock }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteInventoryItem = createAsyncThunk(
  'inventory/deleteInventoryItem',
  async (id, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    items: [],
    loading: false,
    error: null,
    filters: {
      search: '',
      category: '',
      status: 'all',
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        category: '',
        status: 'all',
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(addInventoryItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addInventoryItem.fulfilled, (state, action) => {
        state.loading = false
        state.items.unshift(action.payload)
      })
      .addCase(addInventoryItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateInventoryItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateInventoryItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(deleteInventoryItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(item => item.id !== action.payload)
      })
      .addCase(deleteInventoryItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, setFilters, clearFilters } = inventorySlice.actions
export default inventorySlice.reducer