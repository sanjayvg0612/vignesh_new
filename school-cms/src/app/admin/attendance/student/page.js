'use client'
import { useState, useEffect } from 'react'
import { PageHeader, Table } from '@/components/ui'
import { studentAttendanceApi, studentApi, classApi, sectionApi, groupApi } from '@/lib/api'

const SCHOOL_ID  = 1
const STATUS_NEXT  = { P: 'A', A: 'P' }
const STATUS_LABEL = { P: 'Present', A: 'Absent' }
const STATUS_COLOR = {
  P: 'bg-green-100 text-green-700 border-green-300',
  A: 'bg-red-100 text-red-600 border-red-300',
}

export default function StudentAttendancePage() {
  const [groups, setGroups]     = useState([])
  const [classes, setClasses]   = useState([])
  const [sections, setSections] = useState([])
  const [students, setStudents] = useState([])
  const [statuses, setStatuses] = useState({})

  const [groupId, setGroupId]     = useState('')
  const [classId, setClassId]     = useState('')
  const [sectionId, setSectionId] = useState('')
  const [date, setDate]           = useState(new Date().toISOString().split('T')[0])

  const [search, setSearch]             = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  const [classLoading, setClassLoading]     = useState(false)
  const [sectionLoading, setSectionLoading] = useState(false)

  // Load groups on mount
  useEffect(() => {
    groupApi.dropdown().then(r => setGroups(Array.isArray(r.result) ? r.result : [])).catch(() => setGroups([]))
  }, [])

  const handleGroupChange = async (id) => {
    setGroupId(id)
    setClassId('')
    setSectionId('')
    setClasses([])
    setSections([])
    setStudents([])
    setStatuses({})
    setSearch('')
    setDebouncedSearch('')
    if (!id) return
    setClassLoading(true)
    try {
      const res = await classApi.dropdown({ school_group_id: id })
      setClasses(Array.isArray(res.result) ? res.result : [])
    } catch { setClasses([]) } finally { setClassLoading(false) }
  }

  const handleClassChange = async (id) => {
    setClassId(id)
    setSectionId('')
    setSections([])
    setStudents([])
    setStatuses({})
    setSearch('')
    setDebouncedSearch('')
    if (!id) return
    setSectionLoading(true)
    try {
      const res = await sectionApi.dropdown({ class_id: id })
      setSections(Array.isArray(res.result) ? res.result : [])
    } catch { setSections([]) } finally { setSectionLoading(false) }
  }

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  // Load students when class + section selected (no search)
  useEffect(() => {
    if (!classId || !sectionId) { setStudents([]); setStatuses({}); return }
    setLoading(true)
    setError('')
    studentApi.list({ school_id: SCHOOL_ID, class_id: classId, section_id: sectionId, limit: 100 })
      .then(res => {
        const list = res.result?.data || []
        setStudents(list)
        const init = {}
        list.forEach(s => { init[s.student_id] = 'P' })
        setStatuses(init)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [classId, sectionId])

  // Search students by name/ID via API
  useEffect(() => {
    if (!debouncedSearch.trim()) return
    setLoading(true)
    setError('')
    studentApi.list({ school_id: SCHOOL_ID, limit: 100, search: debouncedSearch })
      .then(res => {
        const list = res.result?.data || []
        setStudents(list)
        const init = {}
        list.forEach(s => { init[s.student_id] = 'P' })
        setStatuses(init)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [debouncedSearch])

  const toggle = (id) => {
    setSaved(false)
    setStatuses(p => ({ ...p, [id]: STATUS_NEXT[p[id]] || 'P' }))
  }

  const markAll = (status) => {
    setSaved(false)
    const next = {}
    students.forEach(s => { next[s.student_id] = status })
    setStatuses(next)
  }

  const handleSave = async () => {
    if (!students.length || !classId || !sectionId || !groupId) {
      setError('Please select Group, Class, Section and Date before saving.')
      return
    }
    setSaving(true); setError('')
    try {
      await studentAttendanceApi.bulkCreate({
        class_id:        parseInt(classId,   10),
        section_id:      parseInt(sectionId, 10),
        school_group_id: parseInt(groupId,   10),
        attendance_dt:   date,
        students: students.map(s => ({
          student_id: s.student_id,
          status:     statuses[s.student_id] || 'P',
        })),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const present = Object.values(statuses).filter(s => s === 'P').length
  const absent  = Object.values(statuses).filter(s => s === 'A').length

  return (
    <div>
      <PageHeader
        title="Student Attendance"
        subtitle="Mark daily attendance for students"
        action={
          <button onClick={handleSave} className="btn-primary" disabled={saving || !students.length}>
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        }
      />

      {saved  && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">Attendance saved successfully!</div>}
      {error  && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      {/* Filters */}
      <div className="card p-4 mb-4 flex gap-4 flex-wrap items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Group <span className="text-red-500">*</span></label>
          <select className="input w-36" value={groupId} onChange={e => handleGroupChange(e.target.value)}>
            <option value="">— Select —</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Class <span className="text-red-500">*</span></label>
          <select className="input w-36" value={classId} onChange={e => handleClassChange(e.target.value)} disabled={classLoading || !groupId || classes.length === 0}>
            <option value="">
              {classLoading ? 'Loading...' : !groupId ? '— Select —' : classes.length === 0 ? 'No classes' : '— Select —'}
            </option>
            {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code}{c.stream_name ? ` - ${c.stream_name}` : ''}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Section <span className="text-red-500">*</span></label>
          <select className="input w-36" value={sectionId} onChange={e => setSectionId(e.target.value)} disabled={sectionLoading || !classId || sections.length === 0}>
            <option value="">
              {sectionLoading ? 'Loading...' : !classId ? '— Select —' : sections.length === 0 ? 'No sections' : '— Select —'}
            </option>
            {sections.map(s => <option key={s.section_id} value={s.section_id}>{s.section_code}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
          <input type="date" className="input w-40" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Search Student</label>
          <input
            className="input w-48"
            placeholder="Name or Roll No..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Summary + quick actions */}
      {students.length > 0 && (
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="flex gap-3">
            <div className="card px-4 py-3 text-center min-w-[80px]">
              <p className="text-xl font-bold text-green-600" style={{fontFamily:'Outfit'}}>{present}</p>
              <p className="text-xs text-gray-500">Present</p>
            </div>
            <div className="card px-4 py-3 text-center min-w-[80px]">
              <p className="text-xl font-bold text-red-500" style={{fontFamily:'Outfit'}}>{absent}</p>
              <p className="text-xs text-gray-500">Absent</p>
            </div>
            <div className="card px-4 py-3 text-center min-w-[80px]">
              <p className="text-xl font-bold text-gray-700" style={{fontFamily:'Outfit'}}>{students.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => markAll('P')} className="btn-secondary text-xs">Mark All Present</button>
            <button onClick={() => markAll('A')} className="btn-secondary text-xs">Mark All Absent</button>
          </div>
        </div>
      )}

      {!classId && !sectionId && !debouncedSearch ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Select Group, Class and Section to load students</div>
      ) : (
        <div className="card">
          <Table headers={['Sl No.', 'Student Name', 'Roll No', 'Status', 'Action']} empty={!loading && students.length === 0}>
            {loading ? (
              <tr><td colSpan={5} className="table-td text-center text-gray-400 py-8">Loading students...</td></tr>
            ) : students.map((s, i) => {
              const st = statuses[s.student_id] || 'P'
              return (
                <tr key={s.student_id} className="hover:bg-gray-50">
                  <td className="table-td text-gray-400">{i + 1}</td>
                  <td className="table-td font-medium text-gray-900">{s.first_name} {s.last_name}</td>
                  <td className="table-td text-gray-500">{s.student_roll_id || '—'}</td>
                  <td className="table-td">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLOR[st]}`}>
                      {STATUS_LABEL[st]}
                    </span>
                  </td>
                  <td className="table-td">
                    <button
                      onClick={() => toggle(s.student_id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        st === 'P'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {st === 'P' ? 'Mark Absent' : 'Mark Present'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </Table>
        </div>
      )}
    </div>
  )
}
