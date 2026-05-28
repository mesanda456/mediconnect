import { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, Activity, TrendingUp, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import API from '../api/axios';

function Dashboard() {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0 });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
          API.get('/patients'),
          API.get('/doctors'),
          API.get('/appointments'),
        ]);
        setStats({
          patients: patientsRes.data.length,
          doctors: doctorsRes.data.length,
          appointments: appointmentsRes.data.length,
        });
        setAppointments(appointmentsRes.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      label: 'Total Patients',
      value: stats.patients,
      icon: Users,
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      light: 'bg-blue-50',
      text: 'text-blue-600',
      change: '+2 this week',
    },
    {
      label: 'Total Doctors',
      value: stats.doctors,
      icon: UserCheck,
      bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      light: 'bg-emerald-50',
      text: 'text-emerald-600',
      change: 'Active staff',
    },
    {
      label: 'Appointments',
      value: stats.appointments,
      icon: Calendar,
      bg: 'bg-gradient-to-br from-violet-500 to-violet-600',
      light: 'bg-violet-50',
      text: 'text-violet-600',
      change: 'Total booked',
    },
    {
      label: 'System Status',
      value: 'Online',
      icon: Activity,
      bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
      light: 'bg-orange-50',
      text: 'text-orange-600',
      change: '100% uptime',
    },
  ];

  const barData = [
    { name: 'Patients', count: stats.patients },
    { name: 'Doctors', count: stats.doctors },
    { name: 'Appointments', count: stats.appointments },
  ];

  const statusCount = appointments.reduce((acc, appointment) => {
    const status = appointment.status || 'UNKNOWN';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  const COLORS = ['#f59e0b', '#10b981', '#ef4444', '#3b82f6'];

  const recentAppointments = appointments.slice(-5).reverse();

  const statusBadge = (status) => {
    const map = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-blue-100 text-blue-700',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-500 shadow-sm">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(({ label, value, icon: Icon, bg, light, text, change }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${light} p-3 rounded-xl`}>
                <Icon className={`w-5 h-5 ${text}`} />
              </div>
              <span className="text-xs text-gray-400 font-medium">{change}</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">System Overview</h2>
              <p className="text-sm text-gray-400">Total counts across modules</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="count" fill="url(#blueGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Appointment Status</h2>
              <p className="text-sm text-gray-400">Breakdown by current status</p>
            </div>
            <Calendar className="w-5 h-5 text-violet-500" />
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: '12px', color: '#6b7280' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-300">
              <Calendar className="w-12 h-12 mb-2" />
              <p className="text-sm">No appointment data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
            <p className="text-sm text-gray-400">Latest 5 appointments</p>
          </div>
        </div>
        {recentAppointments.length > 0 ? (
          <div className="space-y-3">
            {recentAppointments.map(a => (
              <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{a.patient?.fullName || 'Unknown Patient'}</p>
                    <p className="text-xs text-gray-400">{a.doctor?.fullName || 'Unknown Doctor'} • {a.appointmentDate}</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusBadge(a.status)}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-300">
            <Calendar className="w-10 h-10 mb-2" />
            <p className="text-sm">No appointments yet</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default Dashboard;