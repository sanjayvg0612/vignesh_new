'use client'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { ANNOUNCEMENTS } from '@/lib/mockData'
import { PageHeader, Modal, FormField } from '@/components/ui'
import clsx from 'clsx'

export default function AnnouncementPage() {
  const [data, setData] = useState(ANNOUNCEMENTS)
  const [modalOpen, setModal] = useState(false)
  const [form, setForm] = useState({ title:'', content:'', priority:'Normal', date:'' })

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  const handleSave = () => {
    if (!form.title) return
    setData(p => [...p, { ...form, id:Date.now(), date: form.date || new Date().toISOString().split('T')[0] }])
    setModal(false)
  }
  const handleDelete = (id) => { if (!confirm('Delete?')) return; setData(p => p.filter(a => a.id !== id)) }

  const priorityColor = { High:'badge-red', Normal:'badge-blue', Low:'badge-gray' }

  return (
    <div>
      <PageHeader title="Announcements" subtitle="Post important announcements for the school community"
        action={<button onClick={() => { setForm({ title:'',content:'',priority:'Normal',date:'' }); setModal(true) }} className="btn-primary"><Plus className="w-4 h-4" /> Add Announcement</button>}
      />
      <div className="space-y-3">
        {data.map(a => (
          <div key={a.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={clsx('badge', priorityColor[a.priority]||'badge-gray')}>{a.priority}</span>
                  <span className="text-xs text-gray-400">{a.date}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1" style={{fontFamily:'Outfit'}}>{a.title}</h3>
                <p className="text-sm text-gray-500">{a.content}</p>
              </div>
              <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 shrink-0"><Trash2 className="w-3.5 h-3.5"/></button>
            </div>
          </div>
        ))}
        {data.length === 0 && <div className="card p-12 text-center text-sm text-gray-400">No announcements yet</div>}
      </div>
      <Modal open={modalOpen} onClose={()=>setModal(false)} title="Add Announcement"
        footer={<><button onClick={()=>setModal(false)} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary">Publish</button></>}>
        <div className="space-y-4">
          <FormField label="Title" required><input className="input" value={form.title} onChange={f('title')} /></FormField>
          <FormField label="Content"><textarea className="input" rows={4} value={form.content} onChange={f('content')} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Priority">
              <select className="input" value={form.priority} onChange={f('priority')}><option>High</option><option>Normal</option><option>Low</option></select>
            </FormField>
            <FormField label="Date"><input className="input" type="date" value={form.date} onChange={f('date')} /></FormField>
          </div>
        </div>
      </Modal>
    </div>
  )
}
