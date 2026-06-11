import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Users, UserCheck, Calendar, LogOut, FileText, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
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
            <span className="text-sm text-blue-200">👤 {user?.email}</span>
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