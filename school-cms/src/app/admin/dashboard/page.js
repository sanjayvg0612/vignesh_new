'use client'
import { Users, GraduationCap, School, Bus, ArrowRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { STATS } from '@/lib/mockData'
import { StatCard } from '@/components/ui'

const QUICK_ACTIONS = [
  { title: 'Manage Students', desc: 'Add, edit, or remove student records', href: '/admin/students', icon: Users, color: 'purple' },
  { title: 'Manage Classes',  desc: 'Create and manage class schedules',   href: '/admin/timetable', icon: School, color: 'green' },
  { title: 'System Settings', desc: 'Configure school policies and settings', href: '/admin/system/contact', icon: GraduationCap, color: 'blue' },
]

export default function DashboardPage() {
  return (
    <div>
      <h1 className="page-title">Dashboard Overview</h1>
      <p className="page-sub">Welcome back! Here&apos;s what&apos;s happening at your school today.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Students" value={STATS.total_students.toLocaleString()} subtitle="Active students" icon={Users}         trend={STATS.student_trend} color="purple" />
        <StatCard title="Total Teachers" value={STATS.total_teachers.toLocaleString()} subtitle="Active teachers" icon={GraduationCap} trend={STATS.teacher_trend} color="blue"   />
        <StatCard title="Total Classes"  value={STATS.total_classes.toLocaleString()}  subtitle="Classes running"  icon={School}        trend={STATS.class_trend}   color="green"  />
        <StatCard title="Buses"          value={STATS.total_buses.toLocaleString()}    subtitle="Active buses"     icon={Bus}           trend={STATS.bus_trend}     color="orange" />
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4" style={{fontFamily:'Outfit'}}>Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {QUICK_ACTIONS.map(action => {
          const Icon = action.icon
          return (
            <div key={action.href} className="card p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${action.color === 'purple' ? 'primary' : action.color}-50`}>
                  <Icon className={`w-5 h-5 text-${action.color === 'purple' ? 'primary' : action.color}-600`} />
                </div>
                <h3 className="font-semibold text-gray-900" style={{fontFamily:'Outfit'}}>{action.title}</h3>
              </div>
              <p className="text-sm text-gray-500">{action.desc}</p>
              <Link href={action.href} className="btn-secondary flex items-center justify-center gap-2 mt-auto">
                Go to {action.title.split(' ')[1]} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )
        })}
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary-600" />
          <h2 className="font-semibold text-gray-900" style={{fontFamily:'Outfit'}}>School Summary</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[{l:'Exams this month',v:'5'},{l:'Fee collected',v:'₹14.3L'},{l:'Attendance today',v:'94%'},{l:'Notices posted',v:'5'}].map(i=>(
            <div key={i.l} className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xl font-bold text-primary-700" style={{fontFamily:'Outfit'}}>{i.v}</p>
              <p className="text-xs text-gray-500 mt-1">{i.l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
