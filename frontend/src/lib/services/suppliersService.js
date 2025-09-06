export async function fetchSuppliersService() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function addSupplierService(payload) {
  const { data, error } = await supabase
    .from('suppliers')
    .insert(payload)
    .select()
  if (error) throw error
  return data || []
}

export async function updateSupplierService(id, updates) {
  const { data, error } = await supabase
    .from('suppliers')
    .update(updates)
    .eq('id', id)
    .select()
  if (error) throw error
  return data || []
}

export async function deleteSupplierService(id) {
  const { data, error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id)
    .select('id')
  if (error) throw error
  return data
}

