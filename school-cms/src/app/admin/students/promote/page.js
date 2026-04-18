'use client'
import { useState, useEffect } from 'react'
import { TrendingUp, CheckCircle } from 'lucide-react'
import { PageHeader, FormField } from '@/components/ui'
import { studentApi, classApi } from '@/lib/api'

export default function PromotePage() {
  const [classId, setClassId]     = useState('')
  const [promoting, setPromoting] = useState(false)
  const [success, setSuccess]     = useState(null)
  const [error, setError]         = useState('')
  const [classError, setClassError] = useState('')
  const [classes, setClasses]     = useState([])

  useEffect(() => {
    classApi.dropdown()
      .then(r => setClasses(r.result || []))
      .catch(() => setClasses([]))
  }, [])

  const handlePromote = async (e) => {
    e.preventDefault()
    if (!classId) { setClassError('Please select a class'); return }
    setClassError('')
    if (!confirm('Promote all students from this class to the next class? This action cannot be undone.')) return
    setPromoting(true)
    setSuccess(null)
    setError('')
    try {
      const res = await studentApi.promote(classId)
      setSuccess(res.result || res)
      setClassId('')
    } catch (err) {
      setError(err.message)
    } finally {
      setPromoting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Promote Students"
        subtitle="Promote all students from one class to the next"
      />

      <div className="card p-6 max-w-lg">
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 font-medium mb-2">
              <CheckCircle className="w-4 h-4 shrink-0" /> Promotion complete
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {success.promoted != null && (
                <div className="bg-white rounded border border-green-200 p-3 text-center">
                  <p className="text-xl font-bold text-green-600">{success.promoted}</p>
                  <p className="text-xs text-gray-500">Promoted</p>
                </div>
              )}
              {success.skipped != null && (
                <div className="bg-white rounded border border-green-200 p-3 text-center">
                  <p className="text-xl font-bold text-yellow-500">{success.skipped}</p>
                  <p className="text-xs text-gray-500">Skipped</p>
                </div>
              )}
              {typeof success === 'string' && (
                <p className="col-span-2 text-sm">{success}</p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        <form onSubmit={handlePromote} className="space-y-4">
          <FormField label="From Class" required>
            <select
              className={`input ${classError ? 'border-red-400 focus:ring-red-400' : ''}`}
              value={classId}
              onChange={e => { setClassId(e.target.value); if(classError) setClassError('') }}
            >
              <option value="">— Select the class to promote from —</option>
              {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code}{c.stream_name ? ` - ${c.stream_name}` : ''}</option>)}
            </select>
            {classError && <p className="text-xs text-red-500 mt-1">{classError}</p>}
          </FormField>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
            ⚠️ This will promote <strong>all active students</strong> from the selected class to the next class. Please ensure the next class exists before proceeding.
          </div>

          <button
            type="submit"
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={promoting}
          >
            <TrendingUp className="w-4 h-4" />
            {promoting ? 'Promoting...' : 'Promote All Students'}
          </button>
        </form>
      </div>
    </div>
  )
}
