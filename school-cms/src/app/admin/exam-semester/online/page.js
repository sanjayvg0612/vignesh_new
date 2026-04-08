'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { PageHeader, Table, Pagination, Modal, FormField, SearchBar } from '@/components/ui'
import { onlineExamApi, classApi, subjectApi } from '@/lib/api'

const PER_PAGE = 10

export default function OnlineExamPage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const [classes, setClasses]   = useState([])
  const [subjects, setSubjects] = useState([])

  const [filterClassId, setFilterClassId]     = useState('')
  const [filterSubjectId, setFilterSubjectId] = useState('')

  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState({
    title: '', class_id: '', subject_id: '',
    start_date: '', end_date: '',
    exam_code: '', url: '', duration: '',
  })

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  useEffect(() => {
    classApi.dropdown().then(r => setClasses(r.result || [])).catch(() => setClasses([]))
  }, [])

  // Load subjects when form class changes
  useEffect(() => {
    setSubjects([])
    const cid = form.class_id
    if (!cid) return
    subjectApi.dropdown({ class_id: cid, limit: 200 })
      .then(r => setSubjects(r.result || []))
      .catch(() => setSubjects([]))
  }, [form.class_id])

  const fetchExams = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res    = await onlineExamApi.list({
        class_id:   filterClassId   || undefined,
        subject_id: filterSubjectId || undefined,
        search:     search          || undefined,
        page, limit: PER_PAGE,
      })
      const result = res.result || {}
      setData(result.data  || [])
      setTotal(result.total || 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [filterClassId, filterSubjectId, search, page])

  useEffect(() => { fetchExams() }, [fetchExams])

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  const openModal = (item = null) => {
    setEditing(item)
    setForm(item ? {
      title:      item.title      || '',
      class_id:   item.class_id   != null ? String(item.class_id)   : '',
      subject_id: item.subject_id != null ? String(item.subject_id) : '',
      start_date: item.start_date || '',
      end_date:   item.end_date   || '',
      exam_code:  item.exam_code  || '',
      url:        item.url        || '',
      duration:   item.duration   != null ? String(item.duration)   : '',
    } : { title: '', class_id: '', subject_id: '', start_date: '', end_date: '', exam_code: '', url: '', duration: '' })
    setModal(true)
  }

  const handleSave = async () => {
    if (!form.class_id || !form.subject_id || !form.start_date || !form.end_date) return
    setSaving(true)
    try {
      const payload = {
        class_id:   parseInt(form.class_id,   10),
        subject_id: parseInt(form.subject_id, 10),
        start_date: form.start_date,
        end_date:   form.end_date,
        title:      form.title.trim()    || undefined,
        exam_code:  form.exam_code.trim()|| undefined,
        url:        form.url.trim()      || undefined,
        duration:   form.duration.trim()  || undefined,
      }
      if (editing) {
        await onlineExamApi.update(editing.online_exam_id ?? editing.id, payload)
      } else {
        await onlineExamApi.create(payload)
      }
      setModal(false)
      fetchExams()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (item) => {
    if (!confirm(`Delete online exam "${item.title || item.exam_code || '#' + (item.online_exam_id ?? item.id)}"?`)) return
    try { await onlineExamApi.delete(item.online_exam_id ?? item.id); fetchExams() }
    catch (e) { alert(e.message) }
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  const className   = (id) => classes.find(c => c.id === id   || String(c.id) === String(id))?.name   || (id ? `#${id}` : '—')
  const subjectName = (id) => subjects.find(s => (s.id ?? s.subject_id) === id || String(s.id ?? s.subject_id) === String(id))?.name || (id ? `#${id}` : '—')

  return (
    <div>
      <PageHeader
        title="Online Exams"
        subtitle="Manage online / digital examinations"
        action={<button onClick={() => openModal()} className="btn-primary"><Plus className="w-4 h-4" /> Add Exam</button>}
      />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      {/* Filters */}
      <div className="card p-4 mb-4 flex gap-4 items-end flex-wrap">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
          <select className="input w-40" value={filterClassId} onChange={e => { setFilterClassId(e.target.value); setPage(1) }}>
            <option value="">— All Classes —</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
          <SearchBar value={search} onChange={handleSearch} placeholder="Search exams..." />
        </div>
        <span className="text-sm text-gray-500 self-end pb-1">{total} records</span>
      </div>

      <div className="card">
        <Table headers={['Sl No.', 'Title', 'Class', 'Subject', 'Exam Code', 'Start Date', 'End Date', 'Duration', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr><td colSpan={9} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : data.map((ex, i) => (
            <tr key={ex.online_exam_id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-medium text-gray-900">
                {ex.url
                  ? <a href={ex.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary-600 hover:underline">
                      {ex.title || '—'} <ExternalLink className="w-3 h-3" />
                    </a>
                  : (ex.title || '—')}
              </td>
              <td className="table-td">{ex.class_name   || className(ex.class_id)}</td>
              <td className="table-td">{ex.subject_name || subjectName(ex.subject_id)}</td>
              <td className="table-td">
                {ex.exam_code
                  ? <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{ex.exam_code}</span>
                  : '—'}
              </td>
              <td className="table-td">{ex.start_date || '—'}</td>
              <td className="table-td">{ex.end_date   || '—'}</td>
              <td className="table-td">{ex.duration != null ? `${ex.duration} min` : '—'}</td>
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
        title={editing ? 'Edit Online Exam' : 'Add Online Exam'}
        footer={
          <>
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </>
        }
      >
        <FormField label="Title">
          <input className="input" value={form.title} onChange={f('title')} placeholder="e.g. Chapter 5 Quiz" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Class" required>
            <select className="input" value={form.class_id} onChange={f('class_id')}>
              <option value="">— Select Class —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Subject" required>
            <select className="input" value={form.subject_id} onChange={f('subject_id')} disabled={!form.class_id}>
              <option value="">— Select Subject —</option>
              {subjects.map(s => <option key={s.id ?? s.subject_id} value={s.id ?? s.subject_id}>{s.name}</option>)}
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Start Date" required>
            <input className="input" type="date" value={form.start_date} onChange={f('start_date')} />
          </FormField>
          <FormField label="End Date" required>
            <input className="input" type="date" value={form.end_date} onChange={f('end_date')} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Exam Code">
            <input className="input" value={form.exam_code} onChange={f('exam_code')} placeholder="e.g. EX2025" />
          </FormField>
          <FormField label="Duration (minutes)">
            <input className="input" type="number" min="1" value={form.duration} onChange={f('duration')} placeholder="e.g. 60" />
          </FormField>
        </div>
        <FormField label="Exam URL">
          <input className="input" type="url" value={form.url} onChange={f('url')} placeholder="https://..." />
        </FormField>
      </Modal>
    </div>
  )
}
