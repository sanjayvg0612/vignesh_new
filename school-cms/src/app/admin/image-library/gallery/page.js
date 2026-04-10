'use client'
import { useState } from 'react'
import { Plus, Trash2, Image } from 'lucide-react'
import { GALLERY } from '@/lib/mockData'
import { PageHeader, Modal, FormField } from '@/components/ui'

const CATEGORIES = ['Events', 'Sports', 'Academic', 'Cultural', 'Other']

export default function GalleryPage() {
  const [data, setData] = useState(GALLERY)
  const [modalOpen, setModal] = useState(false)
  const [form, setForm] = useState({ title:'', category:'Events', date:'', images:0 })
  const [errors, setErrors] = useState({})

  const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); if(errors[k]) setErrors(p=>({...p,[k]:''})) }
  const closeModal = () => { setModal(false); setErrors({}) }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Album title is required'
    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setData(p => [...p, { ...form, id: Date.now(), images: Number(form.images) }])
    setModal(false)
  }
  const handleDelete = (id) => { if (!confirm('Delete this album?')) return; setData(p => p.filter(g => g.id !== id)) }

  const catColors = { Events:'badge-blue', Sports:'badge-green', Academic:'badge-purple', Cultural:'badge-yellow', Other:'badge-gray' }

  return (
    <div>
      <PageHeader title="Gallery" subtitle="Manage school photo albums and collections"
        action={<button onClick={() => { setForm({ title:'',category:'Events',date:'',images:0 }); setErrors({}); setModal(true) }} className="btn-primary"><Plus className="w-4 h-4" /> Add Album</button>}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.map(g => (
          <div key={g.id} className="card overflow-hidden group">
            <div className="h-36 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <Image className="w-12 h-12 text-primary-400" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-semibold text-gray-900 text-sm leading-tight">{g.title}</p>
                <button onClick={() => handleDelete(g.id)} className="p-1 rounded hover:bg-red-50 text-red-400 shrink-0"><Trash2 className="w-3.5 h-3.5"/></button>
              </div>
              <div className="flex items-center justify-between">
                <span className={`badge ${catColors[g.category] || 'badge-gray'}`}>{g.category}</span>
                <span className="text-xs text-gray-400">{g.images} photos</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{g.date}</p>
            </div>
          </div>
        ))}
      </div>
      <Modal open={modalOpen} onClose={closeModal} title="Add Album"
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary">Save</button></>}>
        <div className="space-y-4">
          <FormField label="Album Title" required>
            <input className={`input ${errors.title ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.title} onChange={f('title')} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </FormField>
          <FormField label="Category">
            <select className="input" value={form.category} onChange={f('category')}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
          </FormField>
          <FormField label="Date"><input className="input" type="date" value={form.date} onChange={f('date')} /></FormField>
          <FormField label="Number of Images"><input className="input" type="number" value={form.images} onChange={f('images')} /></FormField>
        </div>
      </Modal>
    </div>
  )
}
