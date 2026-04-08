'use client'
import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { VEHICLES } from '@/lib/mockData'
import { PageHeader, Table, Modal, FormField, StatusBadge } from '@/components/ui'

export default function VehiclePage() {
  const [data, setData] = useState(VEHICLES)
  const [modalOpen, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ vehicle_no:'', model:'', capacity:'', driver_name:'', driver_phone:'', status:'Active' })

  const openAdd = () => { setEditing(null); setForm({ vehicle_no:'',model:'',capacity:'',driver_name:'',driver_phone:'',status:'Active' }); setModal(true) }
  const openEdit = (v) => { setEditing(v); setForm({ vehicle_no:v.vehicle_no,model:v.model,capacity:v.capacity,driver_name:v.driver_name,driver_phone:v.driver_phone,status:v.status }); setModal(true) }
  const handleSave = () => {
    if (!form.vehicle_no) return
    if (editing) setData(p => p.map(v => v.id===editing.id ? {...v,...form} : v))
    else setData(p => [...p, { ...form, id: Date.now() }])
    setModal(false)
  }
  const handleDelete = (id) => { if (!confirm('Delete this vehicle?')) return; setData(p => p.filter(v => v.id !== id)) }

  return (
    <div>
      <PageHeader title="Vehicles" subtitle="Manage school transport vehicles"
        action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Vehicle</button>}
      />
      <div className="card">
        <Table headers={['Vehicle No','Model','Capacity','Driver','Phone','Status','Actions']} empty={data.length===0}>
          {data.map(v => (
            <tr key={v.id} className="hover:bg-gray-50">
              <td className="table-td font-medium">{v.vehicle_no}</td>
              <td className="table-td">{v.model}</td>
              <td className="table-td">{v.capacity}</td>
              <td className="table-td">{v.driver_name}</td>
              <td className="table-td">{v.driver_phone}</td>
              <td className="table-td"><StatusBadge status={v.status} /></td>
              <td className="table-td"><div className="flex gap-1">
                <button onClick={()=>openEdit(v)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600"><Pencil className="w-3.5 h-3.5"/></button>
                <button onClick={()=>handleDelete(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
              </div></td>
            </tr>
          ))}
        </Table>
      </div>
      <Modal open={modalOpen} onClose={()=>setModal(false)} title={editing?'Edit Vehicle':'Add Vehicle'}
        footer={<><button onClick={()=>setModal(false)} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary">Save</button></>}>
        <div className="space-y-4">
          <FormField label="Vehicle Number" required><input className="input" value={form.vehicle_no} onChange={e=>setForm({...form,vehicle_no:e.target.value})} placeholder="TN 01 AB 1234" /></FormField>
          <FormField label="Model"><input className="input" value={form.model} onChange={e=>setForm({...form,model:e.target.value})} /></FormField>
          <FormField label="Capacity"><input className="input" type="number" value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})} /></FormField>
          <FormField label="Driver Name"><input className="input" value={form.driver_name} onChange={e=>setForm({...form,driver_name:e.target.value})} /></FormField>
          <FormField label="Driver Phone"><input className="input" value={form.driver_phone} onChange={e=>setForm({...form,driver_phone:e.target.value})} /></FormField>
          <FormField label="Status">
            <select className="input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Active</option><option>Inactive</option><option>Maintenance</option></select>
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
