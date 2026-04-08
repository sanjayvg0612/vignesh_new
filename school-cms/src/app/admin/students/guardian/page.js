'use client'
import { useState, useEffect, useCallback } from 'react'
import { PageHeader, SearchBar, Table, Pagination } from '@/components/ui'
import { studentApi, classApi, sectionApi } from '@/lib/api'

const PER_PAGE = 10

export default function GuardianListPage() {
  const [data, setData]         = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [classId, setClassId]   = useState('')
  const [sectionId, setSectionId] = useState('')
  const [classes, setClasses]   = useState([])
  const [sections, setSections] = useState([])

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  // Load class dropdown on mount
  useEffect(() => {
    classApi.dropdown().then(r => setClasses(r.result || [])).catch(() => setClasses([]))
  }, [])

  // Load section dropdown when class changes
  useEffect(() => {
    if (!classId) { setSections([]); setSectionId(''); return }
    sectionApi.list({ page: 1, limit: 100 }).then(r => {
      const all = r.result?.data || []
      setSections(all.filter(s => String(s.class_id) === String(classId)))
    }).catch(() => setSections([]))
    setSectionId('')
  }, [classId])

  const fetchGuardians = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res    = await studentApi.guardianList({
        page, limit: PER_PAGE,
        search:     search     || undefined,
        class_id:   classId    || undefined,
        section_id: sectionId  || undefined,
      })
      const result = res.result || {}
      setData(result.data  || [])
      setTotal(result.total || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, classId, sectionId])

  useEffect(() => { fetchGuardians() }, [fetchGuardians])

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  return (
    <div>
      <PageHeader
        title="Guardian List"
        subtitle="View guardians linked to students"
      />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search by name or phone..." />
          <select
            className="input w-40"
            value={classId}
            onChange={e => { setClassId(e.target.value); setPage(1) }}
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            className="input w-40"
            value={sectionId}
            onChange={e => { setSectionId(e.target.value); setPage(1) }}
            disabled={!classId}
          >
            <option value="">All Sections</option>
            {sections.map(s => <option key={s.section_id} value={s.section_id}>{s.section_name}</option>)}
          </select>
          <span className="text-sm text-gray-500 ml-auto">{total} records</span>
        </div>

        <Table
          headers={['Sl No.', 'Student Name', 'Class', 'Section', 'Guardian Name', 'Phone', 'Email', 'Gender']}
          empty={!loading && data.length === 0}
        >
          {loading ? (
            <tr>
              <td colSpan={8} className="table-td text-center text-gray-400 py-8">Loading...</td>
            </tr>
          ) : data.map((g, i) => (
            <tr key={g.student_id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-medium text-gray-900">
                {g.student_name || [g.first_name, g.last_name].filter(Boolean).join(' ') || '—'}
              </td>
              <td className="table-td">{g.class_code  || g.class_id  || '—'}</td>
              <td className="table-td">{g.section_name || g.section_id || '—'}</td>
              <td className="table-td">{g.guardian_name  || '—'}</td>
              <td className="table-td">{g.guardian_phone || '—'}</td>
              <td className="table-td">{g.guardian_email || '—'}</td>
              <td className="table-td">{g.guardian_gender || '—'}</td>
            </tr>
          ))}
        </Table>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  )
}
