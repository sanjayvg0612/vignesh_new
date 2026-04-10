'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { vehicleRouteMapApi } from '@/lib/api'
import { PageHeader, Table, Pagination, Modal, FormField, SearchBar } from '@/components/ui'

const PER_PAGE = 10
const EMPTY_FORM = { route_id: '', vehicle_id: '', driver_name: '', helper_name: '', driver_mob_no: '', helper_mob_no: '' }

export default function TransportMapPage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [errors, setErrors]   = useState({})

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await vehicleRouteMapApi.list({ page, limit: PER_PAGE })
      const r = res.result || {}
      setData(r.data || []); setTotal(r.total || 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchData() }, [fetchData])

  const closeModal = () => { setModal(false); setErrors({}) }
  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setModal(true) }
  const openEdit = (m) => {
    setEditing(m)
    setForm({ route_id: m.route_id ?? '', vehicle_id: m.vehicle_id ?? '', driver_name: m.driver_name || '', helper_name: m.helper_name || '', driver_mob_no: m.driver_mob_no || '', helper_mob_no: m.helper_mob_no || '' })
    setErrors({}); setModal(true)
  }

  const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); if (errors[k]) setErrors(p => ({ ...p, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.driver_name.trim()) e.driver_name = 'Driver name is required'
    if (!form.helper_name.trim()) e.helper_name = 'Helper name is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      const payload = { route_id: form.route_id ? Number(form.route_id) : undefined, vehicle_id: form.vehicle_id ? Number(form.vehicle_id) : undefined, driver_name: form.driver_name, helper_name: form.helper_name, driver_mob_no: form.driver_mob_no || undefined, helper_mob_no: form.helper_mob_no || undefined }
      if (editing) await vehicleRouteMapApi.update(editing.id, payload)
      else await vehicleRouteMapApi.create(payload)
      setModal(false); fetchData()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this mapping?')) return
    try { await vehicleRouteMapApi.delete(id); fetchData() }
    catch (e) { alert(e.message) }
  }

  return (
    <div>
      <PageHeader title="Vehicle Route Map" subtitle="Manage vehicle-route assignments with driver and helper info"
        action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Mapping</button>}
      />
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}
      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-sm text-gray-500 font-medium">Vehicle–Route Mappings</span>
          <span className="text-sm text-gray-500">{total} records</span>
        </div>
        <Table headers={['#', 'Route ID', 'Vehicle ID', 'Driver Name', 'Driver Mobile', 'Helper Name', 'Helper Mobile', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr><td colSpan={8} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : data.map((m, i) => (
            <tr key={m.id} className="hover:bg-gray-50">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td">{m.route_id ?? '—'}</td>
              <td className="table-td">{m.vehicle_id ?? '—'}</td>
              <td className="table-td font-medium">{m.driver_name}</td>
              <td className="table-td">{m.driver_mob_no || '—'}</td>
              <td className="table-td">{m.helper_name}</td>
              <td className="table-td">{m.helper_mob_no || '—'}</td>
              <td className="table-td">
                <div className="flex gap-1">
                  <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Mapping' : 'Add Vehicle-Route Mapping'}
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Route ID">
              <input className="input" type="number" value={form.route_id} onChange={f('route_id')} placeholder="1" />
            </FormField>
            <FormField label="Vehicle ID">
              <input className="input" type="number" value={form.vehicle_id} onChange={f('vehicle_id')} placeholder="1" />
            </FormField>
          </div>
          <FormField label="Driver Name" required>
            <input className={`input ${errors.driver_name ? 'border-red-400' : ''}`} value={form.driver_name} onChange={f('driver_name')} placeholder="Rajan" />
            {errors.driver_name && <p className="text-xs text-red-500 mt-1">{errors.driver_name}</p>}
          </FormField>
          <FormField label="Driver Mobile">
            <input className="input" value={form.driver_mob_no} onChange={f('driver_mob_no')} placeholder="9876543210" />
          </FormField>
          <FormField label="Helper Name" required>
            <input className={`input ${errors.helper_name ? 'border-red-400' : ''}`} value={form.helper_name} onChange={f('helper_name')} placeholder="Kumar" />
            {errors.helper_name && <p className="text-xs text-red-500 mt-1">{errors.helper_name}</p>}
          </FormField>
          <FormField label="Helper Mobile">
            <input className="input" value={form.helper_mob_no} onChange={f('helper_mob_no')} placeholder="9876543211" />
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
