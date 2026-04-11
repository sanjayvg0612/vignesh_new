'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, SearchBar, Table, Pagination, Modal, FormField, StatusBadge } from '@/components/ui'
import { subjectApi, classApi, getSchoolId } from '@/lib/api'

const PER_PAGE = 10

const toApiStatus = (s) => s.toLowerCase()
const toUiStatus  = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export default function SubjectPage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState({
    subject_name: '', description: '', class_id: '', status: 'Active',
  })
  const [classes, setClasses] = useState([])
  const [errors, setErrors]   = useState({})

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res    = await subjectApi.list({ page, limit: PER_PAGE, search: search || undefined })
      const result = res.result || {}
      setData(result.data  || [])
      setTotal(result.total || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchSubjects() }, [fetchSubjects])

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  const closeModal = () => { setModal(false); setErrors({}) }

  const openModal = async (subject = null) => {
    setEditing(subject)
    setForm(subject ? {
      subject_name: subject.subject_name,
      description:  subject.description || '',
      class_id:     String(subject.class_id),
      status:       toUiStatus(subject.status),
    } : { subject_name: '', description: '', class_id: '', status: 'Active' })
    setErrors({})
    try {
      const res = await classApi.dropdown()
      setClasses(res.result || [])
    } catch { setClasses([]) }
    setModal(true)
  }

  const validate = () => {
    const e = {}
    if (!editing && !form.class_id) e.class_id = 'Class is required'
    if (!form.subject_name.trim()) e.subject_name = 'Subject name is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSaving(true)
    try {
      if (editing) {
        await subjectApi.update(editing.subject_id, {
          subject_name: form.subject_name,
          description:  form.description  || undefined,
          class_id:     parseInt(form.class_id, 10) || undefined,
          status:       toApiStatus(form.status),
        })
      } else {
        await subjectApi.create({
          school_id:    getSchoolId(),
          class_id:     parseInt(form.class_id, 10),
          subject_name: form.subject_name,
          description:  form.description  || undefined,
          status:       toApiStatus(form.status),
        })
      }
      setModal(false)
      fetchSubjects()
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this subject?')) return
    try {
      await subjectApi.delete(id)
      fetchSubjects()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Subject"
        subtitle="Manage school subjects"
        action={<button onClick={() => openModal()} className="btn-primary"><Plus className="w-4 h-4" /> Add Subject</button>}
      />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search subjects..." />
          <span className="text-sm text-gray-500">{total} records</span>
        </div>

        <Table headers={['Sl No.','Class', 'Stream', 'Subject Name', 'Status', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr>
              <td colSpan={6} className="table-td text-center text-gray-400 py-8">Loading...</td>
            </tr>
          ) : data.map((s, i) => (
            <tr key={s.subject_id} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td">{s.class_code  || s.class_id}</td>
              <td className="table-td">{s.stream_name || '—'}</td>
              <td className="table-td font-medium text-gray-900">{s.subject_name}</td>
              <td className="table-td"><StatusBadge status={toUiStatus(s.status)} /></td>
              <td className="table-td">
                <div className="flex items-center gap-2">
                  <button onClick={() => openModal(s)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(s.subject_id)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
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
        onClose={closeModal}
        title={editing ? 'Edit Subject' : 'Add Subject'}
        footer={
          <>
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        {!editing && (
          <FormField label="Class" required>
            <select
              className={`input ${errors.class_id ? 'border-red-400 focus:ring-red-400' : ''}`}
              value={form.class_id}
              onChange={e => { setForm(f => ({ ...f, class_id: e.target.value })); if (errors.class_id) setErrors(p => ({ ...p, class_id: '' })) }}
            >
              <option value="">— Select Class —</option>
              {classes.map(c => (
                <option key={c.class_id} value={c.class_code}>{c.class_code} {c.stream_name ? ` - ${c.stream_name}` : ''}</option>
              ))}
            </select>
            {errors.class_id && <p className="text-xs text-red-500 mt-1">{errors.class_id}</p>}
          </FormField>
        )}
        <FormField label="Subject Name" required>
          <input
            className={`input ${errors.subject_name ? 'border-red-400 focus:ring-red-400' : ''}`}
            value={form.subject_name}
            onChange={e => { setForm(f => ({ ...f, subject_name: e.target.value })); if (errors.subject_name) setErrors(p => ({ ...p, subject_name: '' })) }}
            placeholder="e.g. Mathematics"
          />
          {errors.subject_name && <p className="text-xs text-red-500 mt-1">{errors.subject_name}</p>}
        </FormField>
        <FormField label="Description">
          <input
            className="input"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Brief description (optional)"
          />
        </FormField>
        <FormField label="Status">
          <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </FormField>
      </Modal>
    </div>
  )
}
