import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments } from '../../redux/slices/appointmentSlice';
import { Calendar, Users, Clock, Activity } from 'lucide-react';
import Layout from '../../components/Layout';

const DoctorDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { appointments, loading } = useSelector((state) => state.appointments);
  
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingAppointments: 0,
    completedToday: 0,
  });

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  useEffect(() => {
    if (appointments.length > 0) {
      const today = new Date().toDateString();
      const todayAppts = appointments.filter(
        (apt) => new Date(apt.date).toDateString() === today
      );
      
      setStats({
        todayAppointments: todayAppts.length,
        totalPatients: new Set(appointments.map(a => a.patientId)).size,
        pendingAppointments: appointments.filter(a => a.status === 'scheduled').length,
        completedToday: todayAppts.filter(a => a.status === 'completed').length,
      });
    }
  }, [appointments]);

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );

  const getTodayAppointments = () => {
    const today = new Date().toDateString();
    return appointments
      .filter((apt) => new Date(apt.date).toDateString() === today)
      .slice(0, 5);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, Dr. {user?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Calendar}
            title="Today's Appointments"
            value={stats.todayAppointments}
            color="bg-blue-500"
          />
          <StatCard
            icon={Users}
            title="Total Patients"
            value={stats.totalPatients}
            color="bg-green-500"
          />
          <StatCard
            icon={Clock}
            title="Pending Appointments"
            value={stats.pendingAppointments}
            color="bg-yellow-500"
          />
          <StatCard
            icon={Activity}
            title="Completed Today"
            value={stats.completedToday}
            color="bg-purple-500"
          />
        </div>

        {/* Today's Appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Today's Appointments</h2>
            <button className="btn-primary text-sm">View All</button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : getTodayAppointments().length > 0 ? (
            <div className="space-y-4">
              {getTodayAppointments().map((appointment) => (
                <div
                  key={appointment._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.patientName || 'Patient Name'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {appointment.status}
                    </span>
                    <button className="btn-primary text-sm">View</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No appointments scheduled for today
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-primary-200 rounded-lg hover:bg-primary-50 transition-colors text-left">
              <Calendar className="h-8 w-8 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">View Schedule</h3>
              <p className="text-sm text-gray-600 mt-1">Check your appointments</p>
            </button>
            <button className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left">
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">Patient Records</h3>
              <p className="text-sm text-gray-600 mt-1">Access medical records</p>
            </button>
            <button className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left">
              <Activity className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900">Lab Results</h3>
              <p className="text-sm text-gray-600 mt-1">View test results</p>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorDashboard;
