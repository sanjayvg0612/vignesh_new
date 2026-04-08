'use client'
import { ROUTES, VEHICLES } from '@/lib/mockData'
import { PageHeader } from '@/components/ui'
import { MapPin, Bus } from 'lucide-react'

export default function TransportMapPage() {
  return (
    <div>
      <PageHeader title="Vehicle Route Map" subtitle="Visual overview of all active transport routes" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map placeholder */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center justify-center gap-3 relative">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage:'repeating-linear-gradient(0deg,#6366f1 0,#6366f1 1px,transparent 0,transparent 50%),repeating-linear-gradient(90deg,#6366f1 0,#6366f1 1px,transparent 0,transparent 50%)',backgroundSize:'40px 40px'}} />
            <MapPin className="w-12 h-12 text-primary-400" />
            <p className="text-gray-500 font-medium">Interactive map view</p>
            <p className="text-xs text-gray-400">Connect a maps API (Google Maps / Leaflet) to enable live tracking</p>
          </div>
        </div>

        {/* Route list */}
        <div className="space-y-3">
          <p className="font-semibold text-gray-900 text-sm" style={{fontFamily:'Outfit'}}>Active Routes</p>
          {ROUTES.map(r => {
            const vehicle = VEHICLES.find(v => v.vehicle_no === r.vehicle_no)
            return (
              <div key={r.id} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Bus className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{r.route_name}</p>
                    <p className="text-xs text-gray-400">{r.vehicle_no}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-2">{r.stops}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{r.students} students</span>
                  <span className={`badge ${vehicle?.status==='Active'?'badge-green':'badge-yellow'}`}>{vehicle?.status || 'Unknown'}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
