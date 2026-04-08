'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader, FormField } from '@/components/ui'
import { studentApi, getSchoolId } from '@/lib/api'

const EMPTY = {
  first_name: '', last_name: '', gender: 'male', dob: '', age: '',
  email: '', phone: '', blood_group: '', emergency_contact: '',
  student_roll_id: '', enroll_date: '', status: 'active',
  class_id: '', section_id: '',
  address_line1: '', address_line2: '', city: '', state: '', country: '', postal_code: '',
  guardian_first_name: '', guardian_last_name: '', guardian_phone: '',
  guardian_email: '', guardian_gender: 'male',
}

export default function AddStudentPage() {
  const router  = useRouter()
  const [form, setForm]     = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState(false)

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await studentApi.create({
        school_id:          getSchoolId(),
        class_id:           parseInt(form.class_id, 10),
        section_id:         parseInt(form.section_id, 10),
        first_name:         form.first_name,
        last_name:          form.last_name          || undefined,
        gender:             form.gender,
        dob:                form.dob                || undefined,
        age:                form.age ? parseInt(form.age, 10) : undefined,
        email:              form.email              || undefined,
        phone:              form.phone              || undefined,
        blood_group:        form.blood_group        || undefined,
        emergency_contact:  form.emergency_contact  || undefined,
        student_roll_id:    form.student_roll_id    || undefined,
        enroll_date:        form.enroll_date        || undefined,
        status:             form.status,
        address_line1:      form.address_line1      || undefined,
        address_line2:      form.address_line2      || undefined,
        city:               form.city               || undefined,
        state:              form.state              || undefined,
        country:            form.country            || undefined,
        postal_code:        form.postal_code        || undefined,
        guardian_first_name: form.guardian_first_name || undefined,
        guardian_last_name:  form.guardian_last_name  || undefined,
        guardian_phone:      form.guardian_phone,
        guardian_email:      form.guardian_email    || undefined,
        guardian_gender:     form.guardian_gender,
      })
      setSuccess(true)
      setTimeout(() => router.push('/admin/students'), 1200)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Add Student" subtitle="Register a new student record" />

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          Student added successfully! Redirecting...
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">

        {/* Basic Info */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required>
              <input className="input" value={form.first_name} onChange={f('first_name')} required />
            </FormField>
            <FormField label="Last Name">
              <input className="input" value={form.last_name} onChange={f('last_name')} />
            </FormField>
            <FormField label="Roll ID">
              <input className="input" value={form.student_roll_id} onChange={f('student_roll_id')} placeholder="e.g. 2026001" />
            </FormField>
            <FormField label="Gender">
              <select className="input" value={form.gender} onChange={f('gender')}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </FormField>
            <FormField label="Date of Birth">
              <input className="input" type="date" value={form.dob} onChange={f('dob')} />
            </FormField>
            <FormField label="Age">
              <input className="input" type="number" value={form.age} onChange={f('age')} placeholder="e.g. 14" />
            </FormField>
            <FormField label="Blood Group">
              <input className="input" value={form.blood_group} onChange={f('blood_group')} placeholder="e.g. B+" />
            </FormField>
            <FormField label="Status">
              <select className="input" value={form.status} onChange={f('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>
          </div>
        </div>

        {/* Class & Enroll */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Class & Enrollment</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Class ID" required>
              <input className="input" type="number" value={form.class_id} onChange={f('class_id')} placeholder="Enter Class ID" required />
            </FormField>
            <FormField label="Section ID" required>
              <input className="input" type="number" value={form.section_id} onChange={f('section_id')} placeholder="Enter Section ID" required />
            </FormField>
            <FormField label="Enroll Date">
              <input className="input" type="date" value={form.enroll_date} onChange={f('enroll_date')} />
            </FormField>
          </div>
        </div>

        {/* Contact */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Contact Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email">
              <input className="input" type="email" value={form.email} onChange={f('email')} />
            </FormField>
            <FormField label="Phone">
              <input className="input" value={form.phone} onChange={f('phone')} />
            </FormField>
            <FormField label="Emergency Contact">
              <input className="input" value={form.emergency_contact} onChange={f('emergency_contact')} />
            </FormField>
          </div>
        </div>

        {/* Address */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Address</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Address Line 1">
              <input className="input" value={form.address_line1} onChange={f('address_line1')} />
            </FormField>
            <FormField label="Address Line 2">
              <input className="input" value={form.address_line2} onChange={f('address_line2')} />
            </FormField>
            <FormField label="City">
              <input className="input" value={form.city} onChange={f('city')} />
            </FormField>
            <FormField label="State">
              <input className="input" value={form.state} onChange={f('state')} />
            </FormField>
            <FormField label="Country">
              <input className="input" value={form.country} onChange={f('country')} />
            </FormField>
            <FormField label="Postal Code">
              <input className="input" value={form.postal_code} onChange={f('postal_code')} />
            </FormField>
          </div>
        </div>

        {/* Guardian */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Guardian Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Guardian First Name">
              <input className="input" value={form.guardian_first_name} onChange={f('guardian_first_name')} />
            </FormField>
            <FormField label="Guardian Last Name">
              <input className="input" value={form.guardian_last_name} onChange={f('guardian_last_name')} />
            </FormField>
            <FormField label="Guardian Phone" required>
              <input className="input" value={form.guardian_phone} onChange={f('guardian_phone')} required />
            </FormField>
            <FormField label="Guardian Email">
              <input className="input" type="email" value={form.guardian_email} onChange={f('guardian_email')} />
            </FormField>
            <FormField label="Guardian Gender">
              <select className="input" value={form.guardian_gender} onChange={f('guardian_gender')}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </FormField>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.push('/admin/students')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Add Student'}
          </button>
        </div>
      </form>
    </div>
  )
}
