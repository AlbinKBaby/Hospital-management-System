import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createPatient } from '../../redux/slices/patientSlice';
import { UserPlus, User, Mail, Phone, Calendar, MapPin, AlertCircle } from 'lucide-react';
import Layout from '../../components/Layout';

const PatientRegistration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.patients);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContact: '',
    emergencyContactName: '',
    medicalHistory: '',
    allergies: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Emergency contact is required';
    }

    if (!formData.emergencyContactName.trim()) {
      newErrors.emergencyContactName = 'Emergency contact name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await dispatch(createPatient(formData));
    if (createPatient.fulfilled.match(result)) {
      alert('Patient registered successfully!');
      navigate('/receptionist/patients');
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      emergencyContact: '',
      emergencyContactName: '',
      medicalHistory: '',
      allergies: '',
    });
    setErrors({});
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Registration</h1>
            <p className="text-gray-600 mt-1">Register a new patient</p>
          </div>
          <button
            onClick={() => navigate('/receptionist/patients')}
            className="btn-secondary"
          >
            Back to Patients
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="card">
            <div className="flex items-center mb-6">
              <User className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="label">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="label">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="label">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`input-field pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="1234567890"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="label">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    className={`input-field pl-10 ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
                {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label htmlFor="gender" className="label">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  className={`input-field ${errors.gender ? 'border-red-500' : ''}`}
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
              </div>

              <div>
                <label htmlFor="bloodGroup" className="label">
                  Blood Group
                </label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  className="input-field"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="card">
            <div className="flex items-center mb-6">
              <MapPin className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Address Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="address" className="label">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className={`input-field ${errors.address ? 'border-red-500' : ''}`}
                  placeholder="Enter street address"
                  value={formData.address}
                  onChange={handleChange}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div>
                <label htmlFor="city" className="label">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  className="input-field"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="state" className="label">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  className="input-field"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="zipCode" className="label">
                  ZIP Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  className="input-field"
                  placeholder="Enter ZIP code"
                  value={formData.zipCode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="card">
            <div className="flex items-center mb-6">
              <Phone className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Emergency Contact</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="emergencyContactName" className="label">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="emergencyContactName"
                  name="emergencyContactName"
                  className={`input-field ${errors.emergencyContactName ? 'border-red-500' : ''}`}
                  placeholder="Enter contact name"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                />
                {errors.emergencyContactName && <p className="text-red-500 text-sm mt-1">{errors.emergencyContactName}</p>}
              </div>

              <div>
                <label htmlFor="emergencyContact" className="label">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="emergencyContact"
                  name="emergencyContact"
                  className={`input-field ${errors.emergencyContact ? 'border-red-500' : ''}`}
                  placeholder="Enter contact number"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                />
                {errors.emergencyContact && <p className="text-red-500 text-sm mt-1">{errors.emergencyContact}</p>}
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="card">
            <div className="flex items-center mb-6">
              <UserPlus className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Medical Information</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="medicalHistory" className="label">
                  Medical History
                </label>
                <textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  rows="3"
                  className="input-field"
                  placeholder="Enter any relevant medical history"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="allergies" className="label">
                  Allergies
                </label>
                <textarea
                  id="allergies"
                  name="allergies"
                  rows="2"
                  className="input-field"
                  placeholder="Enter any known allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register Patient'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default PatientRegistration;
