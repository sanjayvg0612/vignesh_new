'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, Table, Pagination, Modal, FormField, SearchBar } from '@/components/ui'
import { examApi, streamApi } from '@/lib/api'

const PER_PAGE = 10

export default function OfflineExamPage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [streams, setStreams] = useState([])
  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState({
    exam_name: '', school_stream_id: '', session_yr: '', exam_description: '', is_active: true,
  })

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  useEffect(() => {
    streamApi.dropdown().then(r => setStreams(r.result || [])).catch(() => setStreams([]))
  }, [])

  const fetchExams = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res    = await examApi.list({ page, limit: PER_PAGE, search: search || undefined })
      const result = res.result || {}
      setData(result.data  || [])
      setTotal(result.total || 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchExams() }, [fetchExams])

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  const openModal = (item = null) => {
    setEditing(item)
    setForm(item ? {
      exam_name:        item.exam_name        || '',
      school_stream_id: item.school_stream_id != null ? String(item.school_stream_id) : '',
      session_yr:       item.session_yr       || '',
      exam_description: item.exam_description || '',
      is_active:        item.is_active !== false,
    } : { exam_name: '', school_stream_id: '', session_yr: '', exam_description: '', is_active: true })
    setModal(true)
  }

  const handleSave = async () => {
    if (!form.exam_name.trim() || !form.school_stream_id || !form.session_yr.trim()) return
    setSaving(true)
    try {
      const payload = {
        exam_name:        form.exam_name.trim(),
        school_stream_id: parseInt(form.school_stream_id, 10),
        session_yr:       form.session_yr.trim(),
        exam_description: form.exam_description.trim() || undefined,
        is_active:        form.is_active,
      }
      if (editing) {
        await examApi.update(editing.exam_id ?? editing.id, payload)
      } else {
        await examApi.create(payload)
      }
      setModal(false)
      fetchExams()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (item) => {
    if (!confirm(`Delete exam "${item.exam_name}"?`)) return
    try { await examApi.delete(item.exam_id ?? item.id); fetchExams() }
    catch (e) { alert(e.message) }
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  const streamName = (id) => streams.find(s => s.id === id || s.school_stream_id === id)?.name || (id ? `#${id}` : '—')

  return (
    <div>
      <PageHeader
        title="Offline Exams"
        subtitle="Manage offline / written examinations"
        action={<button onClick={() => openModal()} className="btn-primary"><Plus className="w-4 h-4" /> Add Exam</button>}
      />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search exams..." />
          <span className="text-sm text-gray-500">{total} records</span>
        </div>
        <Table headers={['Sl No.', 'Exam Name', 'Stream', 'Session Year', 'Active', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr><td colSpan={6} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : data.map((ex, i) => (
            <tr key={ex.exam_id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-medium text-gray-900">{ex.exam_name}</td>
              <td className="table-td">{ex.stream_name || streamName(ex.school_stream_id)}</td>
              <td className="table-td">{ex.session_yr || '—'}</td>
              <td className="table-td">
                {ex.is_active !== false
                  ? <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                  : <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Inactive</span>}
              </td>
              <td className="table-td">
                <div className="flex items-center gap-2">
                  <button onClick={() => openModal(ex)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(ex)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModal(false)}
        title={editing ? 'Edit Exam' : 'Add Offline Exam'}
        footer={
          <>
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </>
        }
      >
        <FormField label="Exam Name" required>
          <input className="input" value={form.exam_name} onChange={f('exam_name')} placeholder="e.g. Mid-Term 2025" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Stream" required>
            <select className="input" value={form.school_stream_id} onChange={f('school_stream_id')}>
              <option value="">— Select Stream —</option>
              {streams.map(s => <option key={s.id ?? s.school_stream_id} value={s.id ?? s.school_stream_id}>{s.name}</option>)}
            </select>
          </FormField>
          <FormField label="Session Year" required>
            <input className="input" value={form.session_yr} onChange={f('session_yr')} placeholder="e.g. 2024-25" />
          </FormField>
        </div>
        <FormField label="Description">
          <textarea className="input" rows={2} value={form.exam_description} onChange={f('exam_description')} placeholder="Optional description" />
        </FormField>
        <FormField label="Active">
          <label className="flex items-center gap-2 mt-1 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 rounded" />
            <span className="text-sm text-gray-700">Mark as active</span>
          </label>
        </FormField>
      </Modal>
    </div>
  )
}
