'use client'
import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { TRANSPORT_STUDENTS, ROUTES } from '@/lib/mockData'
import { PageHeader, Table, SearchBar, Modal, FormField } from '@/components/ui'

export default function TransportStudentsPage() {
  const [data, setData] = useState(TRANSPORT_STUDENTS)
  const [search, setSearch] = useState('')
  const [modalOpen, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ student_name:'', roll_no:'', class_name:'', route:'', vehicle_no:'', pickup_point:'' })

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  const rows = data.filter(r => r.student_name.toLowerCase().includes(search.toLowerCase()))

  const openAdd = () => { setEditing(null); setForm({ student_name:'',roll_no:'',class_name:'',route:'',vehicle_no:'',pickup_point:'' }); setModal(true) }
  const openEdit = (r) => { setEditing(r); setForm({ student_name:r.student_name,roll_no:r.roll_no,class_name:r.class_name,route:r.route,vehicle_no:r.vehicle_no,pickup_point:r.pickup_point }); setModal(true) }
  const handleSave = () => {
    if (!form.student_name) return
    if (editing) setData(p => p.map(r => r.id===editing.id ? {...r,...form} : r))
    else setData(p => [...p, {...form, id:Date.now()}])
    setModal(false)
  }
  const handleDelete = (id) => { if (!confirm('Remove student from transport?')) return; setData(p => p.filter(r => r.id !== id)) }

  return (
    <div>
      <PageHeader title="Transport Students" subtitle="Manage students assigned to school transport"
        action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Assign Student</button>}
      />
      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <SearchBar value={search} onChange={setSearch} placeholder="Search student..." />
        </div>
        <Table headers={['#','Student','Roll No','Class','Route','Vehicle No','Pickup Point','Actions']} empty={rows.length===0}>
          {rows.map((r,i) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="table-td text-gray-400">{i+1}</td>
              <td className="table-td font-medium">{r.student_name}</td>
              <td className="table-td">{r.roll_no}</td>
              <td className="table-td">{r.class_name}</td>
              <td className="table-td">{r.route}</td>
              <td className="table-td">{r.vehicle_no}</td>
              <td className="table-td">{r.pickup_point}</td>
              <td className="table-td"><div className="flex gap-1">
                <button onClick={()=>openEdit(r)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600"><Pencil className="w-3.5 h-3.5"/></button>
                <button onClick={()=>handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
              </div></td>
            </tr>
          ))}
        </Table>
      </div>
      <Modal open={modalOpen} onClose={()=>setModal(false)} title={editing?'Edit Assignment':'Assign Student to Transport'}
        footer={<><button onClick={()=>setModal(false)} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary">Save</button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Student Name" required><input className="input" value={form.student_name} onChange={f('student_name')} /></FormField>
            <FormField label="Roll No"><input className="input" value={form.roll_no} onChange={f('roll_no')} /></FormField>
          </div>
          <FormField label="Class"><input className="input" value={form.class_name} onChange={f('class_name')} placeholder="Class 10-A" /></FormField>
          <FormField label="Route">
            <select className="input" value={form.route} onChange={f('route')}>
              <option value="">Select route</option>
              {ROUTES.map(r => <option key={r.id} value={r.route_name}>{r.route_name}</option>)}
            </select>
          </FormField>
          <FormField label="Vehicle No"><input className="input" value={form.vehicle_no} onChange={f('vehicle_no')} /></FormField>
          <FormField label="Pickup Point"><input className="input" value={form.pickup_point} onChange={f('pickup_point')} /></FormField>
        </div>
      </Modal>
    </div>
  )
}
