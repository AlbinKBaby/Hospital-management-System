import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Auth Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboards
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import ReceptionistDashboard from './pages/dashboards/ReceptionistDashboard';
import LabStaffDashboard from './pages/dashboards/LabStaffDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';

// Patient Pages
import PatientList from './pages/patients/PatientList';
import PatientRegistration from './pages/patients/PatientRegistration';
import AssignDoctor from './pages/patients/AssignDoctor';

// Appointment Pages
import AppointmentList from './pages/appointments/AppointmentList';

// Billing Pages
import BillingPage from './pages/billing/BillingPage';

// Doctor Pages
import PatientDetails from './pages/doctor/PatientDetails';
import PatientHistory from './pages/doctor/PatientHistory';
import LabResults from './pages/doctor/LabResults';

// Lab Pages
import UploadLabReport from './pages/lab/UploadLabReport';
import LabReportsList from './pages/lab/LabReportsList';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import ReportsPage from './pages/admin/ReportsPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/home';
    
    switch (user?.role?.toUpperCase()) {
      case 'DOCTOR':
        return '/doctor/dashboard';
      case 'RECEPTIONIST':
        return '/receptionist/dashboard';
      case 'LAB_STAFF':
        return '/lab/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/home';
    }
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/home" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Default Route */}
        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

        {/* Doctor Routes */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <AppointmentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <PatientList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patient/:patientId"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <PatientDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patient-history"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <PatientHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/lab-results"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <LabResults />
            </ProtectedRoute>
          }
        />

        {/* Receptionist Routes */}
        <Route
          path="/receptionist/dashboard"
          element={
            <ProtectedRoute allowedRoles={['receptionist']}>
              <ReceptionistDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receptionist/patients"
          element={
            <ProtectedRoute allowedRoles={['receptionist']}>
              <PatientList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receptionist/register-patient"
          element={
            <ProtectedRoute allowedRoles={['receptionist']}>
              <PatientRegistration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receptionist/assign-doctor"
          element={
            <ProtectedRoute allowedRoles={['receptionist']}>
              <AssignDoctor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receptionist/assign-doctor/:patientId"
          element={
            <ProtectedRoute allowedRoles={['receptionist']}>
              <AssignDoctor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receptionist/billing"
          element={
            <ProtectedRoute allowedRoles={['receptionist']}>
              <BillingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receptionist/appointments"
          element={
            <ProtectedRoute allowedRoles={['receptionist']}>
              <AppointmentList />
            </ProtectedRoute>
          }
        />

        {/* Lab Staff Routes */}
        <Route
          path="/lab/dashboard"
          element={
            <ProtectedRoute allowedRoles={['lab_staff']}>
              <LabStaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lab/tests"
          element={
            <ProtectedRoute allowedRoles={['lab_staff']}>
              <LabStaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lab/upload"
          element={
            <ProtectedRoute allowedRoles={['lab_staff']}>
              <UploadLabReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lab/reports"
          element={
            <ProtectedRoute allowedRoles={['lab_staff']}>
              <LabReportsList />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/patients"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PatientList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
