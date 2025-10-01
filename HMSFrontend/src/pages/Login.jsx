import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../redux/slices/authSlice';
import { AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redirect if already authenticated (e.g., page refresh)
  useEffect(() => {
    if (isAuthenticated && user && user.role) {
      console.log('🔄 Already authenticated, redirecting...');
      const roleUpper = user.role.toUpperCase();
      
      switch (roleUpper) {
        case 'DOCTOR':
          navigate('/doctor/dashboard', { replace: true });
          break;
        case 'RECEPTIONIST':
          navigate('/receptionist/dashboard', { replace: true });
          break;
        case 'LAB_STAFF':
          navigate('/lab/dashboard', { replace: true });
          break;
        case 'ADMIN':
          navigate('/admin/dashboard', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📤 Sending login data to backend:', formData);
    
    const result = await dispatch(login(formData));
    
    console.log('📥 Backend response:', result);
    
    if (login.rejected.match(result)) {
      console.error('❌ Login failed:', result.payload);
      toast.error(result.payload || 'Login failed. Please check your credentials.', {
        position: "top-right",
        autoClose: 4000,
      });
    } else if (login.fulfilled.match(result)) {
      console.log('✅ Login successful:', result.payload);
      console.log('🔍 Full payload structure:', JSON.stringify(result.payload, null, 2));
      
      // Get user role from backend response
      const user = result.payload?.user;
      const userRole = user?.role;
      
      console.log('👤 User object:', user);
      console.log('👤 User role from backend:', userRole);
      
      if (!userRole) {
        console.error('❌ No role found in response!');
        toast.error('Login successful but role not found. Please contact admin.', {
          position: "top-right",
          autoClose: 4000,
        });
        return;
      }
      
      // Show success toast
      toast.success(`Welcome back, ${user.firstName || 'User'}! 🎉`, {
        position: "top-right",
        autoClose: 1500,
      });
      
      // Navigate based on role
      switch (userRole.toUpperCase()) {
        case 'DOCTOR':
          console.log('➡️ Navigating to /doctor/dashboard');
          navigate('/doctor/dashboard');
          break;
        case 'RECEPTIONIST':
          console.log('➡️ Navigating to /receptionist/dashboard');
          navigate('/receptionist/dashboard');
          break;
        case 'LAB_STAFF':
          console.log('➡️ Navigating to /lab/dashboard');
          navigate('/lab/dashboard');
          break;
        case 'ADMIN':
          console.log('➡️ Navigating to /admin/dashboard');
          navigate('/admin/dashboard');
          break;
        default:
          console.log('⚠️ Unknown role, navigating to home');
          navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Hospital Management System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-field"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to HMS?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full btn-secondary flex justify-center"
              >
                Create new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
