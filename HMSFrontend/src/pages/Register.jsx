import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../redux/slices/authSlice';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'RECEPTIONIST',
    // Doctor specific fields
    specialization: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    // Receptionist specific fields
    shift: '',
    // Lab Staff specific fields
    department: '',
  });

  const [success, setSuccess] = useState(false);

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
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match! 😕', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (formData.password.length < 6) {
      toast.warning('Password must be at least 6 characters long! 🔒', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const { confirmPassword, ...submitData } = formData;
    
    console.log('📤 Sending registration data to backend:', submitData);
    
    const result = await dispatch(register(submitData));
    
    console.log('📥 Backend response:', result);
    
    if (register.fulfilled.match(result)) {
      console.log('✅ Registration successful:', result.payload);
      setSuccess(true);
      toast.success('Account created successfully! 🎉 Redirecting to login...', {
        position: "top-right",
        autoClose: 1500,
      });
      navigate('/login');
    } else if (register.rejected.match(result)) {
      console.error('❌ Registration failed:', result.payload);
      toast.error(result.payload || 'Registration failed. Please try again.', {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="bg-primary-600 p-3 rounded-full">
              <UserPlus className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create New Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Hospital Management System
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Registration successful! Redirecting to login...</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="firstName" className="label">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="input-field"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="label">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="input-field"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

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
              <label htmlFor="phone" className="label">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="number"
                required
                className="input-field"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="role" className="label">
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                className="input-field"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="DOCTOR">Doctor</option>
                <option value="LAB_STAFF">Lab Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* Doctor Specific Fields */}
            {formData.role === 'DOCTOR' && (
              <>
                <div>
                  <label htmlFor="specialization" className="label">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="specialization"
                    name="specialization"
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g., Cardiology, Neurology"
                    value={formData.specialization}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="qualification" className="label">
                    Qualification <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="qualification"
                    name="qualification"
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g., MBBS, MD"
                    value={formData.qualification}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="experience" className="label">
                    Experience (Years)
                  </label>
                  <input
                    id="experience"
                    name="experience"
                    type="number"
                    min="0"
                    className="input-field"
                    placeholder="Years of experience"
                    value={formData.experience}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="consultationFee" className="label">
                    Consultation Fee
                  </label>
                  <input
                    id="consultationFee"
                    name="consultationFee"
                    type="number"
                    min="0"
                    className="input-field"
                    placeholder="Fee amount"
                    value={formData.consultationFee}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {/* Receptionist Specific Fields */}
            {formData.role === 'RECEPTIONIST' && (
              <div>
                <label htmlFor="shift" className="label">
                  Shift
                </label>
                <select
                  id="shift"
                  name="shift"
                  className="input-field"
                  value={formData.shift}
                  onChange={handleChange}
                >
                  <option value="">Select Shift</option>
                  <option value="MORNING">Morning (6 AM - 2 PM)</option>
                  <option value="AFTERNOON">Afternoon (2 PM - 10 PM)</option>
                  <option value="NIGHT">Night (10 PM - 6 AM)</option>
                </select>
              </div>
            )}

            {/* Lab Staff Specific Fields */}
            {formData.role === 'LAB_STAFF' && (
              <div>
                <label htmlFor="department" className="label">
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  className="input-field"
                  placeholder="e.g., Pathology, Radiology"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="input-field"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="input-field"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
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
                    Creating account...
                  </>
                ) : (
                  'Create Account'
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
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full btn-secondary flex justify-center"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
