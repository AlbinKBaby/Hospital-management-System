import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLabTests } from '../../redux/slices/labSlice';
import { Activity, FileText, Clock, CheckCircle } from 'lucide-react';
import Layout from '../../components/Layout';

const LabStaffDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tests, loading } = useSelector((state) => state.lab);
  
  const [stats, setStats] = useState({
    totalTests: 0,
    pendingTests: 0,
    completedToday: 0,
    inProgress: 0,
  });

  useEffect(() => {
    dispatch(fetchLabTests());
  }, [dispatch]);

  useEffect(() => {
    if (tests.length > 0) {
      const today = new Date().toDateString();
      const completedToday = tests.filter(
        (test) => 
          test.status === 'completed' && 
          new Date(test.completedAt).toDateString() === today
      );

      setStats({
        totalTests: tests.length,
        pendingTests: tests.filter(t => t.status === 'pending').length,
        completedToday: completedToday.length,
        inProgress: tests.filter(t => t.status === 'in_progress').length,
      });
    }
  }, [tests]);

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

  const getPendingTests = () => {
    return tests
      .filter(test => test.status === 'pending' || test.status === 'in_progress')
      .slice(0, 5);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lab Staff Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Activity}
            title="Total Tests"
            value={stats.totalTests}
            color="bg-blue-500"
          />
          <StatCard
            icon={Clock}
            title="Pending Tests"
            value={stats.pendingTests}
            color="bg-yellow-500"
          />
          <StatCard
            icon={FileText}
            title="In Progress"
            value={stats.inProgress}
            color="bg-orange-500"
          />
          <StatCard
            icon={CheckCircle}
            title="Completed Today"
            value={stats.completedToday}
            color="bg-green-500"
          />
        </div>

        {/* Pending Tests */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Pending Tests</h2>
            <button className="btn-primary text-sm">View All</button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : getPendingTests().length > 0 ? (
            <div className="space-y-4">
              {getPendingTests().map((test) => (
                <div
                  key={test._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <Activity className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {test.testName || 'Lab Test'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Patient: {test.patientName || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Requested: {new Date(test.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        test.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : test.status === 'in_progress'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {test.status}
                    </span>
                    <button className="btn-primary text-sm">Process</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No pending tests at the moment
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left">
              <Activity className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">New Test</h3>
              <p className="text-sm text-gray-600 mt-1">Create lab test entry</p>
            </button>
            <button className="p-4 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors text-left">
              <Clock className="h-8 w-8 text-yellow-600 mb-2" />
              <h3 className="font-medium text-gray-900">Pending Tests</h3>
              <p className="text-sm text-gray-600 mt-1">View all pending tests</p>
            </button>
            <button className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left">
              <FileText className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">Test Results</h3>
              <p className="text-sm text-gray-600 mt-1">Upload and manage results</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {tests.slice(0, 5).map((test, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm">
                <div className={`h-2 w-2 rounded-full ${
                  test.status === 'completed' ? 'bg-green-500' : 
                  test.status === 'in_progress' ? 'bg-orange-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-gray-600">
                  Test <span className="font-medium">{test.testName}</span> for patient{' '}
                  <span className="font-medium">{test.patientName}</span> - {test.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LabStaffDashboard;
