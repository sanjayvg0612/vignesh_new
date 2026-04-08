'use client'
import { useState, useEffect } from 'react'
import { PageHeader, Table } from '@/components/ui'
import { employeeAttendanceApi, employeeApi, groupApi } from '@/lib/api'

const STATUS_NEXT  = { P: 'A', A: 'P' }
const STATUS_LABEL = { P: 'Present', A: 'Absent' }
const STATUS_COLOR = {
  P: 'bg-green-100 text-green-700 border-green-300',
  A: 'bg-red-100 text-red-600 border-red-300',
}

export default function TeacherAttendancePage() {
  const [groups, setGroups]       = useState([])
  const [allStaff, setAllStaff]   = useState([])
  const [employees, setEmployees] = useState([])
  const [statuses, setStatuses]   = useState({})

  const [groupId,  setGroupId]  = useState('')
  const [staffId,  setStaffId]  = useState('')
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0])

  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    groupApi.dropdown().then(r => setGroups(r.result || [])).catch(() => setGroups([]))
    employeeApi.dropdown({ limit: 500 }).then(r => setAllStaff(r.result?.data || r.result || [])).catch(() => setAllStaff([]))
  }, [])

  // Build the attendance list from already-loaded allStaff — no extra API call
  useEffect(() => {
    if (!groupId) { setEmployees([]); setStatuses({}); return }
    const list = staffId
      ? allStaff.filter(e => String(e.emp_db_id ?? e.emp_id ?? e.id) === String(staffId))
      : allStaff
    setEmployees(list)
    setStatuses(prev => {
      const init = {}
      list.forEach(e => { const id = e.emp_db_id ?? e.emp_id ?? e.id; init[id] = prev[id] || 'P' })
      return init
    })
  }, [groupId, staffId, allStaff])

  const toggle = (id) => {
    setSaved(false)
    setStatuses(p => ({ ...p, [id]: STATUS_NEXT[p[id]] || 'P' }))
  }

  const markAll = (status) => {
    setSaved(false)
    const next = {}
    employees.forEach(e => { next[e.emp_db_id ?? e.emp_id ?? e.id] = status })
    setStatuses(next)
  }

  const handleSave = async () => {
    if (!employees.length || !groupId) {
      setError('Please select a Group and Date before saving.')
      return
    }
    setSaving(true); setError('')
    try {
      await employeeAttendanceApi.bulkCreate({
        school_group_id: parseInt(groupId, 10),
        attendance_dt:   date,
        employees: employees.map(e => ({
          emp_id: e.emp_db_id ?? e.emp_id ?? e.id,
          status: statuses[e.emp_db_id ?? e.emp_id ?? e.id] || 'P',
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
        title="Teacher Attendance"
        subtitle="Mark daily attendance for teachers and staff"
        action={
          <button onClick={handleSave} className="btn-primary" disabled={saving || !employees.length}>
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        }
      />

      {saved && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">Attendance saved successfully!</div>}
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      {/* Filters */}
      <div className="card p-4 mb-4 flex gap-4 flex-wrap items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Group <span className="text-red-500">*</span></label>
          <select className="input w-40" value={groupId} onChange={e => setGroupId(e.target.value)}>
            <option value="">— Select Group —</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Select Staff</label>
          <select className="input w-52" value={staffId} onChange={e => setStaffId(e.target.value)}>
            <option value="">— All Staff —</option>
            {allStaff.map(s => {
              const id   = s.emp_db_id ?? s.emp_id ?? s.id
              const name = s.name || `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || `Staff #${id}`
              return (
                <option key={id} value={id}>
                  {name}{s.role_name ? ` (${s.role_name})` : ''}
                </option>
              )
            })}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
          <input type="date" className="input w-40" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>

      {/* Summary + quick actions */}
      {employees.length > 0 && (
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
              <p className="text-xl font-bold text-gray-700" style={{fontFamily:'Outfit'}}>{employees.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => markAll('P')} className="btn-secondary text-xs">Mark All Present</button>
            <button onClick={() => markAll('A')} className="btn-secondary text-xs">Mark All Absent</button>
          </div>
        </div>
      )}

      {!groupId ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Select a Group to load employees</div>
      ) : (
        <div className="card">
          <Table headers={['Sl No.', 'Name', 'Role', 'Mobile', 'Status', 'Action']} empty={employees.length === 0}>
            {employees.map((emp, i) => {
              const id = emp.emp_db_id ?? emp.emp_id ?? emp.id
              const st = statuses[id] || 'P'
              return (
                <tr key={id} className="hover:bg-gray-50">
                  <td className="table-td text-gray-400">{i + 1}</td>
                  <td className="table-td font-medium text-gray-900">
                    {emp.name || `${emp.first_name ?? ''} ${emp.last_name ?? ''}`.trim()}
                  </td>
                  <td className="table-td text-gray-500">{emp.role_name || '—'}</td>
                  <td className="table-td text-gray-500">{emp.mobile   || '—'}</td>
                  <td className="table-td">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLOR[st]}`}>
                      {STATUS_LABEL[st]}
                    </span>
                  </td>
                  <td className="table-td">
                    <button
                      onClick={() => toggle(id)}
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
