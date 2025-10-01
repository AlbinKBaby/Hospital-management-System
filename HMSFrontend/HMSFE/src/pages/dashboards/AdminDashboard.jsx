import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatients } from '../../redux/slices/patientSlice';
import { fetchAppointments } from '../../redux/slices/appointmentSlice';
import { fetchDoctors } from '../../redux/slices/doctorSlice';
import { fetchLabTests } from '../../redux/slices/labSlice';
import { Users, Calendar, Activity, TrendingUp, DollarSign, UserCheck } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Layout from '../../components/Layout';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { patients } = useSelector((state) => state.patients);
  const { appointments } = useSelector((state) => state.appointments);
  const { doctors } = useSelector((state) => state.doctors);
  const { tests } = useSelector((state) => state.lab);
  
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalLabTests: 0,
    revenue: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchAppointments());
    dispatch(fetchDoctors());
    dispatch(fetchLabTests());
  }, [dispatch]);

  useEffect(() => {
    setStats({
      totalPatients: patients.length,
      totalDoctors: doctors.length,
      totalAppointments: appointments.length,
      totalLabTests: tests.length,
      revenue: appointments.length * 500, // Mock calculation
      activeUsers: patients.length + doctors.length,
    });
  }, [patients, appointments, doctors, tests]);

  // Chart data
  const monthlyData = [
    { month: 'Jan', patients: 45, appointments: 120, revenue: 60000 },
    { month: 'Feb', patients: 52, appointments: 135, revenue: 67500 },
    { month: 'Mar', patients: 48, appointments: 128, revenue: 64000 },
    { month: 'Apr', patients: 61, appointments: 155, revenue: 77500 },
    { month: 'May', patients: 55, appointments: 142, revenue: 71000 },
    { month: 'Jun', patients: 67, appointments: 168, revenue: 84000 },
  ];

  const departmentData = [
    { name: 'Cardiology', value: 30 },
    { name: 'Neurology', value: 25 },
    { name: 'Orthopedics', value: 20 },
    { name: 'Pediatrics', value: 15 },
    { name: 'General', value: 10 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <TrendingUp className="h-5 w-5 text-green-500" />
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            icon={Users}
            title="Total Patients"
            value={stats.totalPatients}
            color="bg-blue-500"
            subtitle="+12% from last month"
          />
          <StatCard
            icon={UserCheck}
            title="Total Doctors"
            value={stats.totalDoctors}
            color="bg-green-500"
            subtitle="Active staff members"
          />
          <StatCard
            icon={Calendar}
            title="Total Appointments"
            value={stats.totalAppointments}
            color="bg-purple-500"
            subtitle="+8% from last month"
          />
          <StatCard
            icon={Activity}
            title="Lab Tests"
            value={stats.totalLabTests}
            color="bg-orange-500"
            subtitle="All time tests"
          />
          <StatCard
            icon={DollarSign}
            title="Revenue"
            value={`₹${stats.revenue.toLocaleString()}`}
            color="bg-emerald-500"
            subtitle="This month"
          />
          <StatCard
            icon={Users}
            title="Active Users"
            value={stats.activeUsers}
            color="bg-indigo-500"
            subtitle="System users"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Appointments */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Appointments</h2>
            <div className="space-y-3">
              {appointments.slice(0, 5).map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.patientName || 'Patient'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(appointment.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Overview */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">System Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Patient Registration Rate</span>
                <span className="text-sm font-medium text-green-600">+12%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Appointment Completion</span>
                <span className="text-sm font-medium text-blue-600">88%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Lab Test Processing</span>
                <span className="text-sm font-medium text-orange-600">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Uptime</span>
                <span className="text-sm font-medium text-purple-600">99.9%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '99.9%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={2} name="Patients" />
                <Line type="monotone" dataKey="appointments" stroke="#10b981" strokeWidth={2} name="Appointments" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Department Distribution */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Department Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Chart */}
          <div className="card lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left">
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-600 mt-1">Add or edit users</p>
            </button>
            <button className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left">
              <UserCheck className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Doctors</h3>
              <p className="text-sm text-gray-600 mt-1">Doctor profiles</p>
            </button>
            <button className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left">
              <Activity className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900">View Reports</h3>
              <p className="text-sm text-gray-600 mt-1">Analytics & reports</p>
            </button>
            <button className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors text-left">
              <DollarSign className="h-8 w-8 text-orange-600 mb-2" />
              <h3 className="font-medium text-gray-900">Financial</h3>
              <p className="text-sm text-gray-600 mt-1">Revenue & billing</p>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
