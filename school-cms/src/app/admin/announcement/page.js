'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Paperclip } from 'lucide-react'
import { PageHeader, SearchBar, Table, Pagination, Modal, FormField } from '@/components/ui'
import { announcementApi } from '@/lib/api'

const PER_PAGE = 10
const PRIORITIES = ['High', 'Normal', 'Low']

export default function AnnouncementPage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const [modalOpen, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving]   = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [form, setForm]       = useState({ title: '', content: '', priority: 'Normal', date: '' })
  const [file, setFile]       = useState(null)
  const [fileName, setFileName] = useState('')

  const [deleteId, setDeleteId]       = useState(null)
  const [deleting, setDeleting]       = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res    = await announcementApi.list({ page, limit: PER_PAGE, search: search || undefined })
      const result = res.result || {}
      setData(result.data   || [])
      setTotal(result.total || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchAnnouncements() }, [fetchAnnouncements])

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  const openAdd = () => {
    setEditing(null)
    setFormErrors({})
    setFile(null)
    setFileName('')
    setForm({ title: '', content: '', priority: 'Normal', date: '' })
    setModal(true)
  }

  const openEdit = (a) => {
    setEditing(a)
    setFormErrors({})
    setFile(null)
    setFileName('')
    setForm({
      title:    a.title    || '',
      content:  a.content  || '',
      priority: a.priority || 'Normal',
      date:     a.date     ? a.date.split('T')[0] : '',
    })
    setModal(true)
  }

  const validate = () => {
    const ve = {}
    if (!form.title.trim()) ve.title = 'Title is required'
    return ve
  }

  const handleSave = async () => {
    const ve = validate()
    if (Object.keys(ve).length) { setFormErrors(ve); return }
    setSaving(true)
    try {
      const payload = {
        title:    form.title,
        content:  form.content  || undefined,
        priority: form.priority,
        date:     form.date     || undefined,
      }
      if (editing) {
        await announcementApi.update(editing.id ?? editing.announcement_id, payload, file || undefined)
      } else {
        await announcementApi.create(payload, file || undefined)
      }
      setModal(false)
      fetchAnnouncements()
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = (id) => { setDeleteId(id); setConfirmOpen(true) }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await announcementApi.delete(deleteId)
      setConfirmOpen(false)
      fetchAnnouncements()
    } catch (e) {
      alert(e.message)
    } finally {
      setDeleting(false)
    }
  }

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setFileName(f.name)
  }

  const priorityColor = {
    High:   'bg-red-100 text-red-700',
    Normal: 'bg-blue-100 text-blue-700',
    Low:    'bg-gray-100 text-gray-600',
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Post important announcements for the school community"
        action={
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Announcement
          </button>
        }
      />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search announcements..." />
          <span className="text-sm text-gray-500 ml-auto">{total} records</span>
        </div>

        <Table
          headers={['Sl No.', 'Title', 'Content', 'Priority', 'Date', 'File', 'Actions']}
          empty={!loading && data.length === 0}
        >
          {loading ? (
            <tr>
              <td colSpan={7} className="table-td text-center text-gray-400 py-8">Loading...</td>
            </tr>
          ) : data.map((a, i) => (
            <tr key={a.id ?? a.announcement_id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-semibold text-gray-900">{a.title || '—'}</td>
              <td className="table-td text-gray-500 max-w-xs truncate">{a.content || '—'}</td>
              <td className="table-td">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priorityColor[a.priority] || 'bg-gray-100 text-gray-600'}`}>
                  {a.priority || '—'}
                </span>
              </td>
              <td className="table-td whitespace-nowrap text-gray-600">{formatDate(a.date)}</td>
              <td className="table-td">
                {(a.id ?? a.announcement_id) ? (
                  <a
                    href={announcementApi.fileUrl(a.id ?? a.announcement_id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary-600 hover:underline text-xs"
                  >
                    <Paperclip className="w-3 h-3" /> View
                  </a>
                ) : '—'}
              </td>
              <td className="table-td">
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(a)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => confirmDelete(a.id ?? a.announcement_id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModal(false); setFormErrors({}) }}
        title={editing ? 'Edit Announcement' : 'Add Announcement'}
        footer={
          <>
            <button onClick={() => { setModal(false); setFormErrors({}) }} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Publish'}
            </button>
          </>
        }
      >
        <FormField label="Title" required>
          <input
            className={`input ${formErrors.title ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="Announcement title..."
            value={form.title}
            onChange={e => { setForm(f => ({ ...f, title: e.target.value })); if (formErrors.title) setFormErrors(p => ({ ...p, title: '' })) }}
          />
          {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
        </FormField>

        <FormField label="Content">
          <textarea
            className="input resize-none"
            rows={4}
            placeholder="Write announcement content..."
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Priority">
            <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </FormField>
          <FormField label="Date">
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            />
          </FormField>
        </div>

        <FormField label="Attachment (optional)">
          <label className="flex items-center gap-2 cursor-pointer input py-2 text-sm text-gray-500 hover:border-primary-400 transition-colors">
            <Paperclip className="w-4 h-4 shrink-0" />
            <span className="truncate">{fileName || 'Choose file...'}</span>
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>
        </FormField>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete Announcement"
        footer={
          <>
            <button onClick={() => setConfirmOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn-primary bg-red-600 hover:bg-red-700 focus:ring-red-500" disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">Are you sure you want to delete this announcement? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}
