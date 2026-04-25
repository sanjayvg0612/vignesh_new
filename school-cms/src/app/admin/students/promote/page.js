'use client'
import { useState, useEffect } from 'react'
import { TrendingUp, CheckCircle } from 'lucide-react'
import { PageHeader, Table, FormField } from '@/components/ui'
import { studentApi, classApi, streamApi } from '@/lib/api'

const SCHOOL_ID = 1

// Class 10 is identified by class_code containing '10'
const isTenthClass = (classCode = '') => classCode.trim() === '10'

export default function PromotePage() {
  const [classes, setClasses]   = useState([])
  const [streams, setStreams]   = useState([])
  const [classId, setClassId]   = useState('')
  const [students, setStudents] = useState([])
  const [streamMap, setStreamMap] = useState({})

  const [loadingStudents, setLoadingStudents] = useState(false)
  const [promoting, setPromoting]             = useState(false)
  const [success, setSuccess]                 = useState('')
  const [error, setError]                     = useState('')
  const [classError, setClassError]           = useState('')

  // Load classes + streams once
  useEffect(() => {
    classApi.dropdown()
      .then(r => setClasses(Array.isArray(r.result) ? r.result : []))
      .catch(() => setClasses([]))
    streamApi.dropdown()
      .then(r => setStreams(Array.isArray(r.result) ? r.result : []))
      .catch(() => setStreams([]))
  }, [])

  const selectedClass = classes.find(c => String(c.class_id) === String(classId))
  const isTenth       = selectedClass ? isTenthClass(selectedClass.class_code) : false

  const handleClassChange = async (id) => {
    setClassId(id)
    setStudents([])
    setStreamMap({})
    setSuccess('')
    setError('')
    setClassError('')
    if (!id) return

    const cls = classes.find(c => String(c.class_id) === String(id))
    if (!cls || !isTenthClass(cls.class_code)) return // only load students for class 10

    setLoadingStudents(true)
    try {
      const res = await studentApi.list({ school_id: SCHOOL_ID, class_id: id, limit: 100 })
      setStudents(res.result?.data || [])
    } catch (e) { setError(e.message) }
    finally { setLoadingStudents(false) }
  }

  // ── Class 10: stream-per-student promote ──────────────────────────────────
  const changedStudents = students.filter(s => streamMap[s.student_id])

  const handleStreamChange = (studentId, streamId) => {
    setStreamMap(prev => ({ ...prev, [studentId]: streamId }))
  }

  const handlePromoteTenth = async () => {
    if (!changedStudents.length) {
      setError('Please select a stream for at least one student before promoting.')
      return
    }
    if (!confirm(`Promote ${changedStudents.length} student(s) with updated streams? This cannot be undone.`)) return

    setPromoting(true); setError(''); setSuccess('')
    let promoted = 0; const failedNames = []
    for (const s of changedStudents) {
      try {
        await studentApi.updateMapping(s.student_id, { stream_id: Number(streamMap[s.student_id]) })
        promoted++
      } catch {
        failedNames.push([s.first_name, s.last_name].filter(Boolean).join(' ') || `#${s.student_id}`)
      }
    }
    setPromoting(false)
    if (promoted > 0) {
      const remaining = { ...streamMap }
      changedStudents.forEach(s => {
        const name = [s.first_name, s.last_name].filter(Boolean).join(' ') || `#${s.student_id}`
        if (!failedNames.includes(name)) delete remaining[s.student_id]
      })
      setStreamMap(remaining)
    }
    if (failedNames.length) setError(`Failed to promote: ${failedNames.join(', ')}`)
    else setSuccess(`Successfully promoted ${promoted} student(s).`)
  }

  // ── Other classes: simple bulk promote ────────────────────────────────────
  const handlePromoteAll = async (e) => {
    e.preventDefault()
    if (!classId) { setClassError('Please select a class'); return }
    if (!confirm('Promote all students from this class to the next class? This action cannot be undone.')) return
    setPromoting(true); setSuccess(''); setError('')
    try {
      const res = await studentApi.promote(classId)
      setSuccess(typeof (res.result || res) === 'string' ? (res.result || res) : 'Promotion complete.')
      setClassId('')
    } catch (err) { setError(err.message) }
    finally { setPromoting(false) }
  }

  return (
    <div>
      <PageHeader
        title="Promote Students"
        subtitle="Promote students from one class to the next"
        action={
          isTenth && changedStudents.length > 0 ? (
            <button onClick={handlePromoteTenth} className="btn-primary flex items-center gap-2" disabled={promoting}>
              <TrendingUp className="w-4 h-4" />
              {promoting ? 'Promoting...' : `Promote ${changedStudents.length} Student${changedStudents.length > 1 ? 's' : ''}`}
            </button>
          ) : null
        }
      />

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {/* ── Class selector (always visible) ── */}
      <div className="card p-4 mb-4 flex items-end gap-4 flex-wrap">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            From Class <span className="text-red-500">*</span>
          </label>
          <select
            className={`input w-56 ${classError ? 'border-red-400' : ''}`}
            value={classId}
            onChange={e => handleClassChange(e.target.value)}
          >
            <option value="">— Select a class —</option>
            {classes.map(c => (
              <option key={c.class_id} value={c.class_id}>
                {c.class_code}{c.stream_name ? ` - ${c.stream_name}` : ''}
              </option>
            ))}
          </select>
          {classError && <p className="text-xs text-red-500 mt-1">{classError}</p>}
        </div>
        {isTenth && students.length > 0 && (
          <div className="text-sm text-gray-500 self-end pb-2">
            {students.length} student{students.length !== 1 ? 's' : ''} •{' '}
            <span className="text-primary-600 font-medium">{changedStudents.length} stream{changedStudents.length !== 1 ? 's' : ''} changed</span>
          </div>
        )}
      </div>

      {/* ── Class 10: table with stream selection ── */}
      {isTenth && (
        <>
          {loadingStudents ? (
            <div className="card p-12 text-center text-gray-400 text-sm">Loading students...</div>
          ) : (
            <div className="card">
              <Table
                headers={['Sl No.', 'Student Name', 'Section', 'Select Stream']}
                empty={students.length === 0}
              >
                {students.map((s, i) => (
                  <tr key={s.student_id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td text-gray-400">{i + 1}</td>
                    <td className="table-td">
                      <p className="font-medium text-gray-900">
                        {[s.first_name, s.last_name].filter(Boolean).join(' ') || `Student #${s.student_id}`}
                      </p>
                      {s.student_roll_id && <p className="text-xs text-gray-400">Roll: {s.student_roll_id}</p>}
                    </td>
                    <td className="table-td text-gray-600">{s.section_code || s.section_name || '—'}</td>
                    <td className="table-td">
                      <select
                        className={`input w-44 text-sm ${streamMap[s.student_id] ? 'border-primary-400 ring-1 ring-primary-300' : ''}`}
                        value={streamMap[s.student_id] || ''}
                        onChange={e => handleStreamChange(s.student_id, e.target.value)}
                      >
                        <option value="">— No change —</option>
                        {streams.map(st => (
                          <option key={st.school_stream_id ?? st.id} value={st.school_stream_id ?? st.id}>
                            {st.stream_name || st.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          )}

          {/* Sticky footer bar */}
          {changedStudents.length > 0 && (
            <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between z-10 shadow-lg">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-primary-700">{changedStudents.length}</span> student{changedStudents.length > 1 ? 's' : ''} with stream changes ready to promote
              </p>
              <button onClick={handlePromoteTenth} className="btn-primary flex items-center gap-2" disabled={promoting}>
                <TrendingUp className="w-4 h-4" />
                {promoting ? 'Promoting...' : 'Promote Students'}
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Other classes: simple promote form ── */}
      {!isTenth && (
        <div className="card p-6 max-w-lg">
          <form onSubmit={handlePromoteAll} className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
              ⚠️ This will promote <strong>all active students</strong> from the selected class to the next classes and same sections. Please ensure the next class exists before proceeding.
            </div>
            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={promoting || !classId}
            >
              <TrendingUp className="w-4 h-4" />
              {promoting ? 'Promoting...' : 'Promote All Students'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
