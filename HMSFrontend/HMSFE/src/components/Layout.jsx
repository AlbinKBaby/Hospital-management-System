import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
import { 
  Menu, 
  X, 
  LogOut, 
  User, 
  Home,
  Users,
  Calendar,
  FileText,
  Settings,
  Activity
} from 'lucide-react';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', icon: Home, path: `/${user?.role}/dashboard` },
    ];

    switch (user?.role) {
      case 'doctor':
        return [
          ...baseItems,
          { name: 'Appointments', icon: Calendar, path: '/doctor/appointments' },
          { name: 'Patients', icon: Users, path: '/doctor/patients' },
          { name: 'Patient History', icon: FileText, path: '/doctor/patient-history' },
          { name: 'Lab Results', icon: Activity, path: '/doctor/lab-results' },
        ];
      case 'receptionist':
        return [
          ...baseItems,
          { name: 'Patients', icon: Users, path: '/receptionist/patients' },
          { name: 'Appointments', icon: Calendar, path: '/receptionist/appointments' },
          { name: 'Registration', icon: User, path: '/receptionist/register-patient' },
          { name: 'Assign Doctor', icon: User, path: '/receptionist/assign-doctor' },
          { name: 'Billing', icon: FileText, path: '/receptionist/billing' },
        ];
      case 'lab_staff':
        return [
          ...baseItems,
          { name: 'Lab Tests', icon: Activity, path: '/lab/tests' },
          { name: 'Upload Report', icon: FileText, path: '/lab/upload' },
          { name: 'Lab Reports', icon: FileText, path: '/lab/reports' },
        ];
      case 'admin':
        return [
          ...baseItems,
          { name: 'Users', icon: Users, path: '/admin/users' },
          { name: 'Doctors', icon: User, path: '/admin/doctors' },
          { name: 'Patients', icon: Users, path: '/admin/patients' },
          { name: 'Reports', icon: FileText, path: '/admin/reports' },
          { name: 'Settings', icon: Settings, path: '/admin/settings' },
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 bg-primary-600">
            <h1 className="text-xl font-bold text-white">HMS</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.name}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
