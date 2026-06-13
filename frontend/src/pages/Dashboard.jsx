import { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, Activity, TrendingUp, Clock, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import API from '../api/axios';

function Dashboard() {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0, records: 0 });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patientsRes, doctorsRes, appointmentsRes, recordsRes] = await Promise.all([
          API.get('/patients'),
          API.get('/doctors'),
          API.get('/appointments'),
          API.get('/medical-records'),
        ]);
        setStats({
          patients: patientsRes.data.length,
          doctors: doctorsRes.data.length,
          appointments: appointmentsRes.data.length,
          records: recordsRes.data.length,
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

  // Derived stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.appointmentDate === todayStr);
  const pendingCount = appointments.filter(a => a.status === 'PENDING').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
  const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED').length;

  const cards = [
    {
      label: 'Total Patients',
      value: stats.patients,
      icon: Users,
      light: 'bg-blue-50',
      text: 'text-blue-600',
      change: 'Registered',
      border: 'border-l-blue-500',
    },
    {
      label: 'Total Doctors',
      value: stats.doctors,
      icon: UserCheck,
      light: 'bg-emerald-50',
      text: 'text-emerald-600',
      change: 'Active staff',
      border: 'border-l-emerald-500',
    },
    {
      label: 'Appointments',
      value: stats.appointments,
      icon: Calendar,
      light: 'bg-violet-50',
      text: 'text-violet-600',
      change: 'Total booked',
      border: 'border-l-violet-500',
    },
    {
      label: 'Medical Records',
      value: stats.records,
      icon: FileText,
      light: 'bg-orange-50',
      text: 'text-orange-600',
      change: 'On file',
      border: 'border-l-orange-500',
    },
  ];

  const secondaryCards = [
    { label: "Today's Appointments", value: todayAppointments.length, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Pending Review', value: pendingCount, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Confirmed', value: confirmedCount, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Completed', value: completedCount, icon: XCircle, color: 'text-gray-400', bg: 'bg-gray-50' },
  ];

  // Monthly bar chart — last 6 months appointment counts
  const monthlyData = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const count = appointments.filter(a => a.appointmentDate?.startsWith(`${year}-${month}`)).length;
      months.push({ name: label, count });
    }
    return months;
  })();

  const statusCount = appointments.reduce((acc, a) => {
    const status = a.status || 'UNKNOWN';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  const COLORS = ['#f59e0b', '#10b981', '#ef4444', '#3b82f6'];

  // Activity feed — last 8 appointments sorted by date desc
  const activityFeed = [...appointments]
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
    .slice(0, 8);

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
          <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-500 shadow-sm">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(({ label, value, icon: Icon, light, text, change, border }) => (
          <div key={label} className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${border} p-5 hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`${light} p-3 rounded-xl`}>
                <Icon className={`w-5 h-5 ${text}`} />
              </div>
              <span className="text-xs text-gray-400 font-medium">{change}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {secondaryCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
            <div className={`${bg} p-2.5 rounded-xl`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Monthly Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Monthly Appointments</h2>
              <p className="text-sm text-gray-400">Last 6 months</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={36}>
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

      {/* Activity Feed + Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <p className="text-sm text-gray-400">Latest appointment updates</p>
            </div>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          {activityFeed.length > 0 ? (
            <div className="space-y-3">
              {activityFeed.map((a, i) => (
                <div key={a.id} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${
                      a.status === 'CONFIRMED' ? 'bg-emerald-400' :
                      a.status === 'COMPLETED' ? 'bg-blue-400' :
                      a.status === 'CANCELLED' ? 'bg-red-400' : 'bg-amber-400'
                    }`} />
                    {i < activityFeed.length - 1 && <div className="w-0.5 h-6 bg-gray-100 mt-1" />}
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{a.patient?.fullName}</p>
                      <p className="text-xs text-gray-400">Dr. {a.doctor?.fullName} • {a.appointmentDate}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(a.status)}`}>
                      {a.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-300">
              <Activity className="w-10 h-10 mb-2" />
              <p className="text-sm">No activity yet</p>
            </div>
          )}
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
              <p className="text-sm text-gray-400">{todayAppointments.length} appointments today</p>
            </div>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          {todayAppointments.length > 0 ? (
            <div className="space-y-3">
              {todayAppointments.map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="text-center min-w-[48px]">
                    <p className="text-sm font-bold text-gray-800">{a.appointmentTime?.slice(0, 5)}</p>
                  </div>
                  <div className="w-px h-8 bg-gray-200" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{a.patient?.fullName}</p>
                    <p className="text-xs text-gray-400">Dr. {a.doctor?.fullName}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(a.status)}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-300">
              <Calendar className="w-10 h-10 mb-2" />
              <p className="text-sm">No appointments today</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
