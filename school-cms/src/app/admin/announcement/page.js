'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Paperclip } from 'lucide-react'
import { PageHeader, SearchBar, Table, Pagination, Modal, FormField } from '@/components/ui'
import { announcementApi, groupApi, streamApi, classApi, sectionApi } from '@/lib/api'

const PER_PAGE = 10
const PRIORITIES = ['High', 'Normal', 'Low']

const EMPTY_FORM = { title: '', content: '', priority: 'Normal', date: '', group_id: '', stream_id: '', class_id: '', section_id: '' }

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
  const [form, setForm]       = useState(EMPTY_FORM)
  const [file, setFile]       = useState(null)
  const [fileName, setFileName] = useState('')

  // Cascade dropdowns
  const [groups, setGroups]   = useState([])
  const [streams, setStreams]  = useState([])
  const [classes, setClasses]  = useState([])
  const [sections, setSections] = useState([])
  const [streamLoading, setStreamLoading]   = useState(false)
  const [classLoading, setClassLoading]     = useState(false)
  const [sectionLoading, setSectionLoading] = useState(false)

  const [deleteId, setDeleteId]       = useState(null)
  const [deleting, setDeleting]       = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res    = await announcementApi.list({ page, limit: PER_PAGE, search: search || undefined })
      const result = res.result || {}
      setData(result.data || []); setTotal(result.total || 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchAnnouncements() }, [fetchAnnouncements])

  // Load groups once
  useEffect(() => {
    groupApi.dropdown().then(r => setGroups(Array.isArray(r.result) ? r.result : [])).catch(() => setGroups([]))
  }, [])

  const handleGroupChange = async (id) => {
    setForm(f => ({ ...f, group_id: id, stream_id: '', class_id: '', section_id: '' }))
    setStreams([]); setClasses([]); setSections([])
    if (formErrors.group_id) setFormErrors(p => ({ ...p, group_id: '' }))
    if (!id) return
    // Load streams and classes in parallel
    setStreamLoading(true); setClassLoading(true)
    try {
      const [streamRes, classRes] = await Promise.all([
        streamApi.dropdown({ school_group_id: id }),
        classApi.dropdown({ school_group_id: id }),
      ])
      setStreams(Array.isArray(streamRes.result) ? streamRes.result : [])
      setClasses(Array.isArray(classRes.result) ? classRes.result : [])
    } catch {
      setStreams([]); setClasses([])
    } finally { setStreamLoading(false); setClassLoading(false) }
  }

  const handleStreamChange = async (id) => {
    setForm(f => ({ ...f, stream_id: id, class_id: '', section_id: '' }))
    setClasses([]); setSections([])
    // Reload classes filtered by stream (or all for group if stream cleared)
    setClassLoading(true)
    try {
      const params = { school_group_id: form.group_id }
      if (id) params.stream_id = id
      const res = await classApi.dropdown(params)
      setClasses(Array.isArray(res.result) ? res.result : [])
    } catch { setClasses([]) } finally { setClassLoading(false) }
  }

  const handleClassChange = async (id) => {
    setForm(f => ({ ...f, class_id: id, section_id: '' }))
    setSections([])
    if (formErrors.class_id) setFormErrors(p => ({ ...p, class_id: '' }))
    if (!id) return
    setSectionLoading(true)
    try {
      const res = await sectionApi.dropdown({ class_id: id })
      setSections(Array.isArray(res.result) ? res.result : [])
    } catch { setSections([]) } finally { setSectionLoading(false) }
  }

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  const resetDropdowns = () => { setStreams([]); setClasses([]); setSections([]) }

  const openAdd = () => {
    setEditing(null); setFormErrors({})
    setFile(null); setFileName('')
    setForm(EMPTY_FORM)
    resetDropdowns()
    setModal(true)
  }

  const openEdit = async (a) => {
    setEditing(a); setFormErrors({})
    setFile(null); setFileName('')
    setForm({
      title:     a.title     || '',
      content:   a.content   || '',
      priority:  a.priority  || 'Normal',
      date:      a.date      ? a.date.split('T')[0] : '',
      group_id:  a.group_id  ? String(a.group_id)  : '',
      stream_id: a.stream_id ? String(a.stream_id) : '',
      class_id:  a.class_id  ? String(a.class_id)  : '',
      section_id:a.section_id? String(a.section_id): '',
    })
    resetDropdowns()
    // Load cascade data for existing values
    if (a.group_id) {
      setStreamLoading(true)
      streamApi.dropdown({ school_group_id: a.group_id })
        .then(r => setStreams(Array.isArray(r.result) ? r.result : []))
        .catch(() => setStreams([]))
        .finally(() => setStreamLoading(false))
    }
    if (a.stream_id && a.group_id) {
      setClassLoading(true)
      classApi.dropdown({ school_group_id: a.group_id, stream_id: a.stream_id })
        .then(r => setClasses(Array.isArray(r.result) ? r.result : []))
        .catch(() => setClasses([]))
        .finally(() => setClassLoading(false))
    }
    if (a.class_id) {
      setSectionLoading(true)
      sectionApi.dropdown({ class_id: a.class_id })
        .then(r => setSections(Array.isArray(r.result) ? r.result : []))
        .catch(() => setSections([]))
        .finally(() => setSectionLoading(false))
    }
    setModal(true)
  }

  const validate = () => {
    const ve = {}
    if (!form.title.trim()) ve.title    = 'Title is required'
    if (!form.group_id)     ve.group_id = 'Group is required'
    if (!form.class_id)     ve.class_id = 'Class is required'
    return ve
  }

  const handleSave = async () => {
    const ve = validate()
    if (Object.keys(ve).length) { setFormErrors(ve); return }
    setSaving(true)
    try {
      const payload = {
        title:      form.title,
        content:    form.content   || undefined,
        priority:   form.priority,
        date:       form.date      || undefined,
        group_id:   Number(form.group_id),
        stream_id:  Number(form.stream_id),
        class_id:   Number(form.class_id),
        section_id: Number(form.section_id),
      }
      if (editing) {
        await announcementApi.update(editing.id ?? editing.announcement_id, payload, file || undefined)
      } else {
        await announcementApi.create(payload, file || undefined)
      }
      setModal(false); fetchAnnouncements()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const confirmDelete = (id) => { setDeleteId(id); setConfirmOpen(true) }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await announcementApi.delete(deleteId)
      setConfirmOpen(false); fetchAnnouncements()
    } catch (e) { alert(e.message) }
    finally { setDeleting(false) }
  }

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f); setFileName(f.name)
  }

  const priorityColor = { High: 'bg-red-100 text-red-700', Normal: 'bg-blue-100 text-blue-700', Low: 'bg-gray-100 text-gray-600' }

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

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search announcements..." />
          <span className="text-sm text-gray-500 ml-auto">{total} records</span>
        </div>

        <Table headers={['Sl No.', 'Title', 'Content', 'Priority', 'Date', 'File', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr><td colSpan={7} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
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
                  <a href={announcementApi.fileUrl(a.id ?? a.announcement_id)} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary-600 hover:underline text-xs">
                    <Paperclip className="w-3 h-3" /> View
                  </a>
                ) : '—'}
              </td>
              <td className="table-td">
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(a)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => confirmDelete(a.id ?? a.announcement_id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
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
            <button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Publish'}</button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Group */}
          <FormField label="Group" required>
            <select
              className={`input ${formErrors.group_id ? 'border-red-400' : ''}`}
              value={form.group_id}
              onChange={e => handleGroupChange(e.target.value)}
            >
              <option value="">— Select Group —</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            {formErrors.group_id && <p className="text-xs text-red-500 mt-1">{formErrors.group_id}</p>}
          </FormField>

          {/* Stream */}
          <FormField label="Stream">
            <select
              className={`input ${formErrors.stream_id ? 'border-red-400' : ''}`}
              value={form.stream_id}
              onChange={e => handleStreamChange(e.target.value)}
              disabled={streamLoading || !form.group_id}
            >
              <option value="">
                {streamLoading ? 'Loading...' : !form.group_id ? '— Select Group first —' : streams.length === 0 ? 'No streams available' : '— Select Stream —'}
              </option>
              {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {formErrors.stream_id && <p className="text-xs text-red-500 mt-1">{formErrors.stream_id}</p>}
          </FormField>

          {/* Class */}
          <FormField label="Class" required>
            <select
              className={`input ${formErrors.class_id ? 'border-red-400' : ''}`}
              value={form.class_id}
              onChange={e => handleClassChange(e.target.value)}
              disabled={classLoading || !form.group_id}
            >
              <option value="">
                {classLoading ? 'Loading...' : !form.group_id ? '— Select Group first —' : classes.length === 0 ? 'No classes available' : '— Select Class —'}
              </option>
              {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code}{c.stream_name ? ` - ${c.stream_name}` : ''}</option>)}
            </select>
            {formErrors.class_id && <p className="text-xs text-red-500 mt-1">{formErrors.class_id}</p>}
          </FormField>

          {/* Section */}
          <FormField label="Section">
            <select
              className={`input ${formErrors.section_id ? 'border-red-400' : ''}`}
              value={form.section_id}
              onChange={e => { setForm(f => ({ ...f, section_id: e.target.value })); if (formErrors.section_id) setFormErrors(p => ({ ...p, section_id: '' })) }}
              disabled={sectionLoading || !form.class_id}
            >
              <option value="">
                {sectionLoading ? 'Loading...' : !form.class_id ? '— Select Class first —' : sections.length === 0 ? 'No sections available' : '— Select Section —'}
              </option>
              {sections.map(s => <option key={s.section_id} value={s.section_id}>{s.section_code}</option>)}
            </select>
            {formErrors.section_id && <p className="text-xs text-red-500 mt-1">{formErrors.section_id}</p>}
          </FormField>

          <hr className="border-gray-100" />

          {/* Title */}
          <FormField label="Title" required>
            <input
              className={`input ${formErrors.title ? 'border-red-400' : ''}`}
              placeholder="Announcement title..."
              value={form.title}
              onChange={e => { setForm(f => ({ ...f, title: e.target.value })); if (formErrors.title) setFormErrors(p => ({ ...p, title: '' })) }}
            />
            {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
          </FormField>

          {/* Content */}
          <FormField label="Content">
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Write announcement content..."
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            />
          </FormField>

          {/* Priority + Date */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Priority">
              <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </FormField>
            <FormField label="Date">
              <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </FormField>
          </div>

          {/* File */}
          <FormField label="Attachment (optional)">
            <label className="flex items-center gap-2 cursor-pointer input py-2 text-sm text-gray-500 hover:border-primary-400 transition-colors">
              <Paperclip className="w-4 h-4 shrink-0" />
              <span className="truncate">{fileName || 'Choose file...'}</span>
              <input type="file" className="hidden" onChange={handleFileChange} />
            </label>
          </FormField>
        </div>
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
