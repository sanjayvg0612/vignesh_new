'use client'
import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '@/components/ui'
import { classSectionTeacherApi, classApi } from '@/lib/api'

export default function SectionClassTeacherPage() {
  const [groups, setGroups]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [classId, setClassId] = useState('')
  const [classes, setClasses] = useState([])

  useEffect(() => {
    classApi.dropdown().then(r => setClasses(r.result || [])).catch(() => setClasses([]))
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res    = await classSectionTeacherApi.list({ class_id: classId || undefined, limit: 100 })
      const result = res.result || {}
      const data   = Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : []
      setGroups(data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [classId])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div>
      <PageHeader
        title="Section & Class Teacher"
        subtitle="View class sections with assigned class and subject teachers"
      />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="card p-4 mb-4 flex gap-4 items-end flex-wrap">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Class</label>
          <select className="input w-48" value={classId} onChange={e => setClassId(e.target.value)}>
            <option value="">— All Classes —</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {loading && (
        <div className="card p-8 text-center text-gray-400 text-sm">Loading...</div>
      )}

      {!loading && groups.length === 0 && (
        <div className="card p-8 text-center text-gray-400 text-sm">No data found</div>
      )}

      <div className="space-y-4">
        {groups.map((g, gi) => (
          <div key={gi} className="card overflow-hidden">
            {/* Header */}
            <div className="bg-primary-50 px-5 py-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-primary-800 text-sm">{g.class_code || `Class #${g.class_id}`}</span>
                {g.section_code && (
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                    Section: {g.section_code}
                  </span>
                )}
                {g.group_name && (
                  <span className="text-xs text-gray-500">{g.group_name}</span>
                )}
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Class Teacher */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Class Teacher</p>
                {g.class_teacher?.emp_id ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
                      {(g.class_teacher.emp_name || 'T')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{g.class_teacher.emp_name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">Not assigned</span>
                )}
              </div>

              {/* Subject Teachers */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Subject Teachers</p>
                {g.subject_teachers?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                          <th className="pb-2 pr-6 font-medium">Subject</th>
                          <th className="pb-2 font-medium">Teacher</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {g.subject_teachers.map((st, si) => (
                          <tr key={si}>
                            <td className="py-2 pr-6 text-gray-700">{st.subject_name || `#${st.subject_id}`}</td>
                            <td className="py-2 font-medium text-gray-900">{st.emp_name || `#${st.emp_id}`}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">No subject teachers assigned</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
