import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Users, UserCheck, Calendar, LogOut, FileText, Settings, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const links = [
    { to: '/', label: 'Dashboard', icon: Heart },
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/doctors', label: 'Doctors', icon: UserCheck },
    { to: '/appointments', label: 'Appointments', icon: Calendar },
    { to: '/medical-records', label: 'Records', icon: FileText },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Fetch today + tomorrow appointments for notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get('/appointments');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(today);
        dayAfter.setDate(dayAfter.getDate() + 2);

        const upcoming = res.data.filter(a => {
          if (a.status === 'CANCELLED' || a.status === 'COMPLETED') return false;
          const apptDate = new Date(a.appointmentDate);
          apptDate.setHours(0, 0, 0, 0);
          return apptDate >= today && apptDate < dayAfter;
        });

        setNotifications(upcoming);
      } catch (err) {
        // silently fail
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isToday = (dateStr) => {
    const today = new Date();
    const d = new Date(dateStr);
    return d.toDateString() === today.toDateString();
  };

  return (
    <nav className="bg-blue-600 dark:bg-gray-800 text-white shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6" />
            <span className="text-xl font-bold">MediConnect</span>
          </div>
          <div className="flex gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === to ? 'bg-blue-800' : 'hover:bg-blue-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-blue-200">👤 {user?.name || user?.email}</span>

            {/* Bell Notification */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">Upcoming Appointments</p>
                    <span className="text-xs text-gray-400">Today & Tomorrow</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No upcoming appointments</p>
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                      {notifications.map(a => (
                        <div key={a.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{a.patient?.fullName || 'Unknown Patient'}</p>
                              <p className="text-xs text-gray-400 mt-0.5">Dr. {a.doctor?.fullName} • {a.appointmentTime}</p>
                              {a.reason && <p className="text-xs text-gray-400 mt-0.5">{a.reason}</p>}
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                isToday(a.appointmentDate)
                                  ? 'bg-orange-100 text-orange-600'
                                  : 'bg-blue-100 text-blue-600'
                              }`}>
                                {isToday(a.appointmentDate) ? 'Today' : 'Tomorrow'}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                a.status === 'CONFIRMED'
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-yellow-100 text-yellow-600'
                              }`}>
                                {a.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="px-4 py-2 border-t border-gray-100">
                    <Link
                      to="/appointments"
                      onClick={() => setShowDropdown(false)}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      View all appointments →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/settings"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname === '/settings' ? 'bg-blue-800' : 'hover:bg-blue-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
