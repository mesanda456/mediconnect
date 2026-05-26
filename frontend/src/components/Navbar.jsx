import { Link, useLocation } from 'react-router-dom';
import { Heart, Users, UserCheck, Calendar } from 'lucide-react';

function Navbar() {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Dashboard', icon: Heart },
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/doctors', label: 'Doctors', icon: UserCheck },
    { to: '/appointments', label: 'Appointments', icon: Calendar },
  ];

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
        </div>
      </div>
    </nav>
  );
}

export default Navbar;