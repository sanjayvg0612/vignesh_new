'use client'
import { useState, useEffect } from 'react'
import { ArrowRightLeft, CheckCircle } from 'lucide-react'
import { PageHeader, FormField } from '@/components/ui'
import { studentApi, classApi, sectionApi } from '@/lib/api'

export default function TransferPage() {
  const [studentId, setStudentId]   = useState('')
  const [sectionId, setSectionId]   = useState('')
  const [classId, setClassId]       = useState('')
  const [transferring, setTransferring] = useState(false)
  const [success, setSuccess]       = useState('')
  const [error, setError]           = useState('')
  const [errors, setErrors]         = useState({})
  const [students, setStudents]     = useState([])
  const [classes, setClasses]       = useState([])
  const [sections, setSections]     = useState([])

  // Load students and classes on mount
  useEffect(() => {
    studentApi.dropdown({ limit: 500 })
      .then(r => setStudents(r.result?.data || r.result || []))
      .catch(() => setStudents([]))
    classApi.dropdown()
      .then(r => setClasses(r.result || []))
      .catch(() => setClasses([]))
  }, [])

  // Load sections when class changes
  useEffect(() => {
    if (!classId) { setSections([]); setSectionId(''); return }
    sectionApi.list({ page: 1, limit: 100 }).then(r => {
      const all = r.result?.data || []
      setSections(all.filter(s => String(s.class_id) === String(classId)))
    }).catch(() => setSections([]))
    setSectionId('')
  }, [classId])

  const handleTransfer = async (e) => {
    e.preventDefault()
    const ve = {}
    if (!studentId) ve.studentId = 'Please select a student'
    if (!sectionId) ve.sectionId = 'Please select a section'
    if (Object.keys(ve).length) { setErrors(ve); return }
    setErrors({})
    setTransferring(true)
    setSuccess('')
    setError('')
    try {
      const res = await studentApi.transfer(studentId, sectionId)
      setSuccess(res.message || 'Student transferred successfully.')
      setStudentId('')
      setClassId('')
      setSectionId('')
    } catch (err) {
      setError(err.message)
    } finally {
      setTransferring(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Transfer Student"
        subtitle="Move a student to a different class section"
      />

      <div className="card p-6 max-w-lg">
        {success && (
          <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
            <CheckCircle className="w-4 h-4 shrink-0" /> {success}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        <form onSubmit={handleTransfer} className="space-y-4">
          <FormField label="Select Student" required>
            <select
              className={`input ${errors.studentId ? 'border-red-400 focus:ring-red-400' : ''}`}
              value={studentId}
              onChange={e => { setStudentId(e.target.value); if(errors.studentId) setErrors(p=>({...p,studentId:''})) }}
            >
              <option value="">— Choose a student —</option>
              {students.map(s => (
                <option key={s.student_id || s.id} value={s.student_id || s.id}>
                  {s.student_name || [s.first_name, s.last_name].filter(Boolean).join(' ')}
                  {s.roll_number ? ` (${s.roll_number})` : ''}
                </option>
              ))}
            </select>
            {errors.studentId && <p className="text-xs text-red-500 mt-1">{errors.studentId}</p>}
          </FormField>

          <FormField label="Transfer to Class" required>
            <select
              className="input"
              value={classId}
              onChange={e => setClassId(e.target.value)}
            >
              <option value="">— Choose target class —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>

          <FormField label="Transfer to Section" required>
            <select
              className={`input ${errors.sectionId ? 'border-red-400 focus:ring-red-400' : ''}`}
              value={sectionId}
              onChange={e => { setSectionId(e.target.value); if(errors.sectionId) setErrors(p=>({...p,sectionId:''})) }}
              disabled={!classId}
            >
              <option value="">— Choose target section —</option>
              {sections.map(s => (
                <option key={s.section_id} value={s.section_id}>{s.section_name}</option>
              ))}
            </select>
            {errors.sectionId && <p className="text-xs text-red-500 mt-1">{errors.sectionId}</p>}
          </FormField>

          <button
            type="submit"
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={transferring}
          >
            <ArrowRightLeft className="w-4 h-4" />
            {transferring ? 'Transferring...' : 'Transfer Student'}
          </button>
        </form>
      </div>
    </div>
  )
}
