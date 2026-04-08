'use client'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { VEHICLE_EXPENSES } from '@/lib/mockData'
import { PageHeader, Table, Modal, FormField } from '@/components/ui'

const EXPENSE_TYPES = ['Fuel', 'Maintenance', 'Repair', 'Insurance', 'Other']

export default function VehicleExpensePage() {
  const [data, setData] = useState(VEHICLE_EXPENSES)
  const [modalOpen, setModal] = useState(false)
  const [form, setForm] = useState({ vehicle_no:'', type:'Fuel', amount:'', date:'', description:'' })

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  const handleSave = () => {
    if (!form.vehicle_no || !form.amount) return
    setData(p => [...p, { ...form, id:Date.now(), amount:Number(form.amount) }])
    setModal(false)
  }
  const handleDelete = (id) => { if (!confirm('Delete?')) return; setData(p => p.filter(e => e.id !== id)) }

  const total = data.reduce((s, e) => s + Number(e.amount), 0)
  const typeColor = { Fuel:'badge-blue', Maintenance:'badge-yellow', Repair:'badge-red', Insurance:'badge-purple', Other:'badge-gray' }

  return (
    <div>
      <PageHeader title="Vehicle Expense" subtitle="Track and manage vehicle running expenses"
        action={<button onClick={() => { setForm({ vehicle_no:'',type:'Fuel',amount:'',date:'',description:'' }); setModal(true) }} className="btn-primary"><Plus className="w-4 h-4" /> Add Expense</button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {EXPENSE_TYPES.slice(0,4).map(t => {
          const sum = data.filter(e => e.type === t).reduce((s,e) => s+Number(e.amount), 0)
          return (
            <div key={t} className="card p-4 text-center">
              <p className="text-xl font-bold text-gray-900" style={{fontFamily:'Outfit'}}>₹{sum.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{t}</p>
            </div>
          )
        })}
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Total Expenses: <span className="text-primary-700 font-bold">₹{total.toLocaleString()}</span></p>
        </div>
        <Table headers={['#','Vehicle No','Type','Amount','Date','Description','Actions']} empty={data.length===0}>
          {data.map((e,i) => (
            <tr key={e.id} className="hover:bg-gray-50">
              <td className="table-td text-gray-400">{i+1}</td>
              <td className="table-td font-medium">{e.vehicle_no}</td>
              <td className="table-td"><span className={`badge ${typeColor[e.type]||'badge-gray'}`}>{e.type}</span></td>
              <td className="table-td font-medium text-gray-900">₹{Number(e.amount).toLocaleString()}</td>
              <td className="table-td">{e.date}</td>
              <td className="table-td text-gray-500 text-xs">{e.description}</td>
              <td className="table-td"><button onClick={()=>handleDelete(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5"/></button></td>
            </tr>
          ))}
        </Table>
      </div>

      <Modal open={modalOpen} onClose={()=>setModal(false)} title="Add Vehicle Expense"
        footer={<><button onClick={()=>setModal(false)} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary">Save</button></>}>
        <div className="space-y-4">
          <FormField label="Vehicle No" required><input className="input" value={form.vehicle_no} onChange={f('vehicle_no')} placeholder="TN 01 AB 1234" /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Expense Type">
              <select className="input" value={form.type} onChange={f('type')}>{EXPENSE_TYPES.map(t=><option key={t}>{t}</option>)}</select>
            </FormField>
            <FormField label="Amount (₹)" required><input className="input" type="number" value={form.amount} onChange={f('amount')} /></FormField>
          </div>
          <FormField label="Date"><input className="input" type="date" value={form.date} onChange={f('date')} /></FormField>
          <FormField label="Description"><input className="input" value={form.description} onChange={f('description')} /></FormField>
        </div>
      </Modal>
    </div>
  )
}
