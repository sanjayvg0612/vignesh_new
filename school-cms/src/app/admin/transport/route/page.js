'use client'
import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { ROUTES } from '@/lib/mockData'
import { PageHeader, Table, Modal, FormField } from '@/components/ui'

export default function RoutePage() {
  const [data, setData] = useState(ROUTES)
  const [modalOpen, setModal] = useState(false)
  const [form, setForm] = useState({ route_name:'', vehicle_no:'', stops:'', students:'', driver:'' })

  const handleSave = () => {
    if (!form.route_name) return
    setData(p => [...p, { ...form, id: Date.now() }])
    setModal(false)
  }
  const handleDelete = (id) => { if (!confirm('Delete?')) return; setData(p => p.filter(r => r.id !== id)) }

  return (
    <div>
      <PageHeader title="Routes" subtitle="Manage vehicle routes and stops"
        action={<button onClick={() => { setForm({ route_name:'',vehicle_no:'',stops:'',students:'',driver:'' }); setModal(true) }} className="btn-primary"><Plus className="w-4 h-4" /> Add Route</button>}
      />
      <div className="card">
        <Table headers={['Route Name','Vehicle No','Stops','Students','Driver','Actions']} empty={data.length===0}>
          {data.map(r => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="table-td font-medium">{r.route_name}</td>
              <td className="table-td">{r.vehicle_no}</td>
              <td className="table-td text-xs text-gray-500 max-w-xs truncate">{r.stops}</td>
              <td className="table-td">{r.students}</td>
              <td className="table-td">{r.driver}</td>
              <td className="table-td"><button onClick={()=>handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5"/></button></td>
            </tr>
          ))}
        </Table>
      </div>
      <Modal open={modalOpen} onClose={()=>setModal(false)} title="Add Route"
        footer={<><button onClick={()=>setModal(false)} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary">Save</button></>}>
        <div className="space-y-4">
          <FormField label="Route Name" required><input className="input" value={form.route_name} onChange={e=>setForm({...form,route_name:e.target.value})} placeholder="Route A - North" /></FormField>
          <FormField label="Vehicle No"><input className="input" value={form.vehicle_no} onChange={e=>setForm({...form,vehicle_no:e.target.value})} /></FormField>
          <FormField label="Stops"><input className="input" value={form.stops} onChange={e=>setForm({...form,stops:e.target.value})} placeholder="Stop 1 → Stop 2 → Stop 3" /></FormField>
          <FormField label="Driver"><input className="input" value={form.driver} onChange={e=>setForm({...form,driver:e.target.value})} /></FormField>
        </div>
      </Modal>
    </div>
  )
}
