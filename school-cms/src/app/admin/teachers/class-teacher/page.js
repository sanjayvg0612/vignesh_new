'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, Table, Pagination, Modal, FormField } from '@/components/ui'
import { classSectionTeacherApi, employeeApi, classApi, subjectApi } from '@/lib/api'

const PER_PAGE = 10

export default function ClassTeacherPage() {
  const [rows, setRows]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(null)

  const [teachers, setTeachers] = useState([])
  const [classes, setClasses]   = useState([])
  const [subjects, setSubjects] = useState([])
  const [form, setForm]         = useState({ class_id: '', emp_id: '', subject_id: '' })

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res    = await classSectionTeacherApi.list({ page, limit: PER_PAGE })
      const result = res.result || {}
      const groups = Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : []
      const flat = []
      groups.forEach(g => {
        if (g.class_teacher?.emp_id) {
          flat.push({
            map_id:       g.class_teacher.map_id,
            emp_id:       g.class_teacher.emp_id,
            emp_name:     g.class_teacher.emp_name,
            class_id:     g.class_id,
            class_code:   g.class_code,
            section_id:   g.section_id,
            section_code: g.section_code,
          })
        }
      })
      setRows(flat)
      setTotal(result.total || flat.length)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchData() }, [fetchData])

  // Load subjects when form class changes
  useEffect(() => {
    setSubjects([])
    setForm(p => ({ ...p, subject_id: '' }))
    if (!form.class_id) return
    subjectApi.dropdown({ class_id: form.class_id, limit: 200 })
      .then(r => setSubjects(r.result || []))
      .catch(() => setSubjects([]))
  }, [form.class_id])

  const openModal = async (item = null) => {
    setEditing(item)
    setForm(item ? {
      class_id:   String(item.class_id || ''),
      emp_id:     String(item.emp_id   || ''),
      subject_id: '',
    } : { class_id: '', emp_id: '', subject_id: '' })
    try {
      const [teacherRes, classRes] = await Promise.all([
        employeeApi.dropdown(),
        classApi.dropdown(),
      ])
      setTeachers(teacherRes.result || [])
      setClasses(classRes.result   || [])
    } catch { setTeachers([]); setClasses([]) }
    setModal(true)
  }

  const handleSave = async () => {
    if (!form.class_id || !form.emp_id || !form.subject_id) return
    setSaving(true)
    try {
      const payload = {
        emp_id:     parseInt(form.emp_id,     10),
        class_id:   parseInt(form.class_id,   10),
        subject_id: parseInt(form.subject_id, 10),
      }
      if (editing) {
        await classSectionTeacherApi.update(editing.map_id, payload)
      } else {
        await classSectionTeacherApi.create(payload)
      }
      setModal(false)
      fetchData()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (item) => {
    if (!confirm('Remove this class teacher assignment?')) return
    try { await classSectionTeacherApi.delete(item.map_id); fetchData() }
    catch (e) { alert(e.message) }
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div>
      <PageHeader
        title="Class Teacher"
        subtitle="Assign class teachers to classes"
        action={<button onClick={() => openModal()} className="btn-primary"><Plus className="w-4 h-4" /> Assign</button>}
      />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="card">
        <Table headers={['Sl No.', 'Class', 'Section', 'Class Teacher', 'Actions']} empty={!loading && rows.length === 0}>
          {loading ? (
            <tr><td colSpan={5} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : rows.map((item, i) => (
            <tr key={item.map_id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td">{item.class_code   || `#${item.class_id}`}</td>
              <td className="table-td">{item.section_code || '—'}</td>
              <td className="table-td font-medium text-gray-900">{item.emp_name || `#${item.emp_id}`}</td>
              <td className="table-td">
                <div className="flex items-center gap-2">
                  <button onClick={() => openModal(item)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(item)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
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
        title={editing ? 'Edit Class Teacher' : 'Assign Class Teacher'}
        footer={
          <>
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </>
        }
      >
        <FormField label="Class" required>
          <select className="input" value={form.class_id} onChange={e => setForm(p => ({ ...p, class_id: e.target.value, subject_id: '' }))}>
            <option value="">— Select Class —</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FormField>
        <FormField label="Subject" required>
          <select className="input" value={form.subject_id} onChange={f('subject_id')} disabled={!form.class_id}>
            <option value="">— Select Subject —</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {!form.class_id && <p className="text-xs text-gray-400 mt-1">Select a class first</p>}
        </FormField>
        <FormField label="Teacher" required>
          <select className="input" value={form.emp_id} onChange={f('emp_id')}>
            <option value="">— Select Teacher —</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </FormField>
      </Modal>
    </div>
  )
}
