import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatients } from '../../redux/slices/patientSlice';
import { fetchAppointments } from '../../redux/slices/appointmentSlice';
import { Users, Calendar, UserPlus, Clock } from 'lucide-react';
import Layout from '../../components/Layout';

const ReceptionistDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { patients, loading: patientsLoading } = useSelector((state) => state.patients);
  const { appointments, loading: appointmentsLoading } = useSelector((state) => state.appointments);
  
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    newRegistrations: 0,
    pendingAppointments: 0,
  });

  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchAppointments());
  }, [dispatch]);

  useEffect(() => {
    if (patients.length > 0 && appointments.length > 0) {
      const today = new Date().toDateString();
      const todayAppts = appointments.filter(
        (apt) => new Date(apt.date).toDateString() === today
      );
      
      const thisMonth = new Date().getMonth();
      const newRegs = patients.filter(
        (p) => new Date(p.createdAt).getMonth() === thisMonth
      );

      setStats({
        totalPatients: patients.length,
        todayAppointments: todayAppts.length,
        newRegistrations: newRegs.length,
        pendingAppointments: appointments.filter(a => a.status === 'scheduled').length,
      });
    }
  }, [patients, appointments]);

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

  const getRecentPatients = () => {
    return patients
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Receptionist Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            title="Total Patients"
            value={stats.totalPatients}
            color="bg-blue-500"
          />
          <StatCard
            icon={Calendar}
            title="Today's Appointments"
            value={stats.todayAppointments}
            color="bg-green-500"
          />
          <StatCard
            icon={UserPlus}
            title="New This Month"
            value={stats.newRegistrations}
            color="bg-purple-500"
          />
          <StatCard
            icon={Clock}
            title="Pending Appointments"
            value={stats.pendingAppointments}
            color="bg-yellow-500"
          />
        </div>

        {/* Recent Patients */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Patients</h2>
            <button className="btn-primary text-sm">View All</button>
          </div>

          {patientsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : getRecentPatients().length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getRecentPatients().map((patient) => (
                    <tr key={patient._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {patient._id?.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.phone}</div>
                        <div className="text-sm text-gray-500">{patient.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(patient.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-primary-600 hover:text-primary-900 font-medium">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No patients registered yet
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left">
              <UserPlus className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Register Patient</h3>
              <p className="text-sm text-gray-600 mt-1">Add new patient</p>
            </button>
            <button className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left">
              <Calendar className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">Book Appointment</h3>
              <p className="text-sm text-gray-600 mt-1">Schedule new appointment</p>
            </button>
            <button className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left">
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900">View Patients</h3>
              <p className="text-sm text-gray-600 mt-1">Browse patient list</p>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReceptionistDashboard;
