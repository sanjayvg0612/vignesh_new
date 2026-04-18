'use client'
import { useState, useEffect, useCallback } from 'react'
import { PageHeader, Table, Pagination } from '@/components/ui'
import { studentAttendanceApi, classApi, sectionApi } from '@/lib/api'

const PER_PAGE = 20
const STATUS_LABEL = { P: 'Present', A: 'Absent', L: 'Leave' }
const STATUS_COLOR = {
  P: 'bg-green-100 text-green-700 border-green-300',
  A: 'bg-red-100 text-red-600 border-red-300',
  L: 'bg-yellow-100 text-yellow-700 border-yellow-300',
}

export default function ViewAttendancePage() {
  const [classes, setClasses]   = useState([])
  const [sections, setSections] = useState([])
  const [data, setData]         = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const [classId, setClassId]     = useState('')
  const [sectionId, setSectionId] = useState('')
  const [date, setDate]           = useState('')
  const [status, setStatus]       = useState('')

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  useEffect(() => {
    classApi.dropdown().then(r => setClasses(r.result || [])).catch(() => setClasses([]))
  }, [])

  useEffect(() => {
    setSectionId('')
    setSections([])
    if (!classId) return
    sectionApi.dropdown({ class_id: classId })
      .then(r => setSections(r.result || []))
      .catch(() => setSections([]))
  }, [classId])

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res    = await studentAttendanceApi.list({
        class_id:      classId   || undefined,
        section_id:    sectionId || undefined,
        attendance_dt: date      || undefined,
        status:        status    || undefined,
        page,
        limit: PER_PAGE,
      })
      const result = res.result || {}
      setData(result.data  || [])
      setTotal(result.total || 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [classId, sectionId, date, status, page])

  useEffect(() => { fetchData() }, [fetchData])

  const handleFilter = () => { setPage(1); fetchData() }

  const present = data.filter(r => r.status === 'P').length
  const absent  = data.filter(r => r.status === 'A').length
  const leave   = data.filter(r => r.status === 'L').length
  const pct     = data.length ? Math.round((present / data.length) * 100) : 0

  return (
    <div>
      <PageHeader title="View Attendance" subtitle="View student attendance records" />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      {/* Filters */}
      <div className="card p-4 mb-4 flex gap-4 flex-wrap items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
          <select className="input w-36" value={classId} onChange={e => { setClassId(e.target.value); setPage(1) }}>
            <option value="">— All Classes —</option>
            {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code} {c.stream_name && ` - ${c.stream_name}`}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Section</label>
          <select className="input w-36" value={sectionId} onChange={e => { setSectionId(e.target.value); setPage(1) }} disabled={!classId}>
            <option value="">— All Sections —</option>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
          <input type="date" className="input w-40" value={date} onChange={e => { setDate(e.target.value); setPage(1) }} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select className="input w-36" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
            <option value="">— All —</option>
            <option value="P">Present</option>
            <option value="A">Absent</option>
            <option value="L">Leave</option>
          </select>
        </div>
      </div>

      {/* Summary cards */}
      {data.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          {[
            { l: 'Total Records',  v: total,    c: 'text-gray-900'     },
            { l: 'Present',        v: present,  c: 'text-green-600'    },
            { l: 'Absent',         v: absent,   c: 'text-red-500'      },
            { l: 'Leave',          v: leave,    c: 'text-yellow-600'   },
            { l: 'Attendance %',   v: `${pct}%`,c: 'text-primary-700'  },
          ].map(i => (
            <div key={i.l} className="card p-4 text-center">
              <p className={`text-2xl font-bold ${i.c}`} style={{fontFamily:'Outfit'}}>{i.v}</p>
              <p className="text-xs text-gray-500 mt-1">{i.l}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <Table
          headers={['Sl No.', 'Name', 'Class', 'Section', 'Group', 'Date', 'Status']}
          empty={!loading && data.length === 0}
        >
          {loading ? (
            <tr><td colSpan={7} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : data.map((r, i) => (
            <tr key={r.att_id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-medium text-gray-900">
                {r.student_name || `#${r.student_id}`}
              </td>
              <td className="table-td">{r.class_code   || (r.class_id   ? `#${r.class_id}`   : '—')}</td>
              <td className="table-td">{r.section_code || (r.section_id ? `#${r.section_id}` : '—')}</td>
              <td className="table-td">{r.group_name   || '—'}</td>
              <td className="table-td">{r.attendance_dt || '—'}</td>
              <td className="table-td">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLOR[r.status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                  {STATUS_LABEL[r.status] || r.status || '—'}
                </span>
              </td>
            </tr>
          ))}
        </Table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  )
}
