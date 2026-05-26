import { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, Activity } from 'lucide-react';
import API from '../api/axios';

function Dashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patients, doctors, appointments] = await Promise.all([
          API.get('/patients'),
          API.get('/doctors'),
          API.get('/appointments'),
        ]);

        setStats({
          patients: patients.data.length,
          doctors: doctors.data.length,
          appointments: appointments.data.length,
        });
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;