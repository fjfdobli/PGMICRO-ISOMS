import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchSuppliersService, addSupplierService, updateSupplierService, deleteSupplierService, } from '../services/suppliersService'
const PENDING_KEY = 'pendingSupplierDelete'

const readPending = () => {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (_) {
    return null
  }
}

const writePending = (pending) => {
  try {
    if (!pending) localStorage.removeItem(PENDING_KEY)
    else localStorage.setItem(PENDING_KEY, JSON.stringify(pending))
  } catch (_) {}
}

export const fetchSuppliers = createAsyncThunk('suppliers/fetchAll', async () => {
  const data = await fetchSuppliersService()
  return data
})

export const addSupplier = createAsyncThunk('suppliers/add', async (payload) => {
  const data = await addSupplierService(payload)
  return data[0]
})

export const updateSupplier = createAsyncThunk('suppliers/update', async ({ id, updates }) => {
  const data = await updateSupplierService(id, updates)
  return data[0]
})

export const finalizeDeleteSupplier = createAsyncThunk('suppliers/finalizeDelete', async (id) => {
  await deleteSupplierService(id)
  return id
})

export const restoreSupplier = createAsyncThunk('suppliers/restore', async (supplier) => {
  // Reinsert the supplier record; prefer keeping original id if present
  const payload = { id: supplier.id, name: supplier.name, email: supplier.email, phone: supplier.phone, address: supplier.address }
  const data = await addSupplierService(payload)
  return data[0]
})

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState: {
    items: [],
    loading: false,
    error: null,
    undo: { visible: false, supplier: null, secondsLeft: 5 },
  },
  reducers: {
    beginDeleteOptimistic: (state, action) => {
      const supplier = action.payload
      state.items = state.items.filter(s => s.id !== supplier.id)
      const expireAt = Date.now() + 5000
      writePending({ supplier, expireAt })
      state.undo = { visible: true, supplier, secondsLeft: 5 }
    },
    resumePendingDelete: (state, action) => {
      const { supplier, secondsLeft } = action.payload
      state.items = state.items.filter(s => s.id !== supplier.id)
      state.undo = { visible: true, supplier, secondsLeft }
    },
    tickUndo: (state) => {
      if (!state.undo.visible) return
      state.undo.secondsLeft = Math.max(0, state.undo.secondsLeft - 1)
    },
    cancelUndo: (state) => {
      state.undo = { visible: false, supplier: null, secondsLeft: 5 }
      writePending(null)
    },
    undoDelete: (state) => {
      if (state.undo.supplier) {
        state.items.unshift(state.undo.supplier)
      }
      state.undo = { visible: false, supplier: null, secondsLeft: 5 }
      writePending(null)
    },
    setSuppliers: (state, action) => {
      state.items = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(addSupplier.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        const i = state.items.findIndex(s => s.id === action.payload.id)
        if (i !== -1) state.items[i] = action.payload
      })
      .addCase(finalizeDeleteSupplier.fulfilled, (state, action) => {
        const id = action.payload
        state.items = state.items.filter(s => s.id !== id)
        // Keep undo visible to allow restoration via insert
      })
      .addCase(restoreSupplier.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.undo = { visible: false, supplier: null, secondsLeft: 5 }
        writePending(null)
      })
  }
})

export const { beginDeleteOptimistic, tickUndo, cancelUndo, undoDelete, setSuppliers } = suppliersSlice.actions
export default suppliersSlice.reducer