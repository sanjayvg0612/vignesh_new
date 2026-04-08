'use client'
import { useState } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { SLIDERS } from '@/lib/mockData'
import { PageHeader, Table, Modal, FormField } from '@/components/ui'

export default function SliderPage() {
  const [data, setData] = useState(SLIDERS)
  const [modalOpen, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title:'', subtitle:'', order:1, active:true })

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  const openAdd = () => { setEditing(null); setForm({ title:'',subtitle:'',order:data.length+1,active:true }); setModal(true) }
  const openEdit = (s) => { setEditing(s); setForm({ title:s.title,subtitle:s.subtitle,order:s.order,active:s.active }); setModal(true) }
  const handleSave = () => {
    if (!form.title) return
    if (editing) setData(p => p.map(s => s.id===editing.id ? {...s,...form} : s))
    else setData(p => [...p, {...form, id:Date.now()}])
    setModal(false)
  }
  const toggleActive = (id) => setData(p => p.map(s => s.id===id ? {...s,active:!s.active} : s))
  const handleDelete = (id) => { if (!confirm('Delete this slide?')) return; setData(p => p.filter(s => s.id !== id)) }

  return (
    <div>
      <PageHeader title="Slider" subtitle="Manage homepage banner slides"
        action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Slide</button>}
      />
      <div className="card">
        <Table headers={['Order','Title','Subtitle','Status','Actions']} empty={data.length===0}>
          {[...data].sort((a,b)=>a.order-b.order).map(s => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="table-td"><span className="w-7 h-7 rounded-full bg-primary-50 text-primary-700 font-bold text-sm flex items-center justify-center">{s.order}</span></td>
              <td className="table-td font-medium">{s.title}</td>
              <td className="table-td text-gray-500 text-xs max-w-xs truncate">{s.subtitle}</td>
              <td className="table-td">
                <button onClick={() => toggleActive(s.id)} className={`flex items-center gap-1.5 text-xs font-medium ${s.active?'text-green-600':'text-gray-400'}`}>
                  {s.active ? <ToggleRight className="w-5 h-5"/> : <ToggleLeft className="w-5 h-5"/>}
                  {s.active ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td className="table-td"><div className="flex gap-1">
                <button onClick={()=>openEdit(s)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600"><Pencil className="w-3.5 h-3.5"/></button>
                <button onClick={()=>handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
              </div></td>
            </tr>
          ))}
        </Table>
      </div>
      <Modal open={modalOpen} onClose={()=>setModal(false)} title={editing?'Edit Slide':'Add Slide'}
        footer={<><button onClick={()=>setModal(false)} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary">Save</button></>}>
        <div className="space-y-4">
          <FormField label="Title" required><input className="input" value={form.title} onChange={f('title')} /></FormField>
          <FormField label="Subtitle"><input className="input" value={form.subtitle} onChange={f('subtitle')} /></FormField>
          <FormField label="Display Order"><input className="input" type="number" value={form.order} onChange={f('order')} /></FormField>
          <FormField label="Status">
            <select className="input" value={form.active ? 'Active' : 'Inactive'} onChange={e => setForm(p => ({...p, active: e.target.value === 'Active'}))}>
              <option>Active</option><option>Inactive</option>
            </select>
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
