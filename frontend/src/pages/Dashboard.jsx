import { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import API from '../api/axios';

function Dashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
  });

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patientsRes, doctorsRes, appointmentsRes] =
          await Promise.all([
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
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      label: 'Total Patients',
      value: stats.patients,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Doctors',
      value: stats.doctors,
      icon: UserCheck,
      color: 'bg-green-500',
    },
    {
      label: 'Appointments',
      value: stats.appointments,
      icon: Calendar,
      color: 'bg-purple-500',
    },
    {
      label: 'System Status',
      value: 'Online',
      icon: Activity,
      color: 'bg-orange-500',
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

  const pieData = Object.entries(statusCount).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#f59e0b', '#10b981', '#ef4444', '#3b82f6'];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl shadow p-6 flex items-center gap-4"
          >
            <div className={`${color} text-white p-3 rounded-lg`}>
              <Icon className="w-6 h-6" />
            </div>

            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-800">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            System Overview
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Appointment Status
          </h2>

          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              No appointment data yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;