'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { transportStudentApi } from '@/lib/api'
import { PageHeader, Table, Pagination, Modal, FormField, SearchBar } from '@/components/ui'

const PER_PAGE = 10
const EMPTY_FORM = { vehicle_id: '', class_id: '', section_id: '', student_id: '', group_id: '', session_yr: '' }

export default function TransportStudentsPage() {
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
      const res = await transportStudentApi.list({ page, limit: PER_PAGE })
      const r = res.result || {}
      setData(r.data || []); setTotal(r.total || 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchData() }, [fetchData])

  const closeModal = () => { setModal(false); setErrors({}) }
  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setModal(true) }
  const openEdit = (s) => {
    setEditing(s)
    setForm({ vehicle_id: s.vehicle_id ?? '', class_id: s.class_id ?? '', section_id: s.section_id ?? '', student_id: s.student_id ?? '', group_id: s.group_id ?? '', session_yr: s.session_yr || '' })
    setErrors({}); setModal(true)
  }

  const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); if (errors[k]) setErrors(p => ({ ...p, [k]: '' })) }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        vehicle_id: form.vehicle_id ? Number(form.vehicle_id) : undefined,
        class_id:   form.class_id   ? Number(form.class_id)   : undefined,
        section_id: form.section_id ? Number(form.section_id) : undefined,
        student_id: form.student_id ? Number(form.student_id) : undefined,
        group_id:   form.group_id   ? Number(form.group_id)   : undefined,
        session_yr: form.session_yr || undefined,
      }
      if (editing) await transportStudentApi.update(editing.id, payload)
      else await transportStudentApi.create(payload)
      setModal(false); fetchData()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove student from transport?')) return
    try { await transportStudentApi.delete(id); fetchData() }
    catch (e) { alert(e.message) }
  }

  return (
    <div>
      <PageHeader title="Transport Students" subtitle="Manage students assigned to school transport"
        action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Assign Student</button>}
      />
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}
      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-sm text-gray-500 font-medium">Transportation Assignments</span>
          <span className="text-sm text-gray-500">{total} records</span>
        </div>
        <Table headers={['#', 'Student ID', 'Vehicle ID', 'Class ID', 'Section ID', 'Group ID', 'Session Year', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr><td colSpan={8} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : data.map((s, i) => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-medium">{s.student_id ?? '—'}</td>
              <td className="table-td">{s.vehicle_id ?? '—'}</td>
              <td className="table-td">{s.class_id ?? '—'}</td>
              <td className="table-td">{s.section_id ?? '—'}</td>
              <td className="table-td">{s.group_id ?? '—'}</td>
              <td className="table-td">{s.session_yr || '—'}</td>
              <td className="table-td">
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Assignment' : 'Assign Student to Transport'}
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></>}>
        <div className="space-y-4">
          <FormField label="Student ID">
            <input className="input" type="number" value={form.student_id} onChange={f('student_id')} placeholder="1" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Vehicle ID">
              <input className="input" type="number" value={form.vehicle_id} onChange={f('vehicle_id')} placeholder="1" />
            </FormField>
            <FormField label="Group ID">
              <input className="input" type="number" value={form.group_id} onChange={f('group_id')} placeholder="1" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Class ID">
              <input className="input" type="number" value={form.class_id} onChange={f('class_id')} placeholder="1" />
            </FormField>
            <FormField label="Section ID">
              <input className="input" type="number" value={form.section_id} onChange={f('section_id')} placeholder="1" />
            </FormField>
          </div>
          <FormField label="Session Year">
            <input className="input" value={form.session_yr} onChange={f('session_yr')} placeholder="2024-25" />
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
