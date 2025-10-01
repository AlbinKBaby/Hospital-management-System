import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPatients } from '../../redux/slices/patientSlice';
import { fetchDoctors } from '../../redux/slices/doctorSlice';
import { UserCheck, Search, CheckCircle, AlertCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../config/api';

const AssignDoctor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patientId } = useParams();
  
  const { patients } = useSelector((state) => state.patients);
  const { doctors } = useSelector((state) => state.doctors);
  
  const [selectedPatient, setSelectedPatient] = useState(patientId || '');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [searchPatient, setSearchPatient] = useState('');
  const [searchDoctor, setSearchDoctor] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchDoctors());
  }, [dispatch]);

  const filteredPatients = patients.filter((patient) =>
    patient.name?.toLowerCase().includes(searchPatient.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchPatient.toLowerCase())
  );

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name?.toLowerCase().includes(searchDoctor.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchDoctor.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedPatient || !selectedDoctor) {
      setError('Please select both patient and doctor');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/patients/assign-doctor', {
        patientId: selectedPatient,
        doctorId: selectedDoctor,
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/receptionist/patients');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign doctor');
    } finally {
      setLoading(false);
    }
  };

  const selectedPatientData = patients.find(p => p._id === selectedPatient);
  const selectedDoctorData = doctors.find(d => d._id === selectedDoctor);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assign Doctor</h1>
            <p className="text-gray-600 mt-1">Assign a doctor to a patient</p>
          </div>
          <button
            onClick={() => navigate('/receptionist/patients')}
            className="btn-secondary"
          >
            Back to Patients
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Doctor assigned successfully! Redirecting...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Select Patient */}
          <div className="card">
            <div className="flex items-center mb-4">
              <UserCheck className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Select Patient</h2>
            </div>

            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="Search patients..."
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <div
                    key={patient._id}
                    onClick={() => setSelectedPatient(patient._id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPatient === patient._id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                        <p className="text-sm text-gray-500">
                          {patient.age} years • {patient.gender}
                        </p>
                      </div>
                      {selectedPatient === patient._id && (
                        <CheckCircle className="h-6 w-6 text-primary-600" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No patients found</p>
              )}
            </div>
          </div>

          {/* Select Doctor */}
          <div className="card">
            <div className="flex items-center mb-4">
              <UserCheck className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Select Doctor</h2>
            </div>

            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="Search doctors..."
                  value={searchDoctor}
                  onChange={(e) => setSearchDoctor(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    onClick={() => setSelectedDoctor(doctor._id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDoctor === doctor._id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Dr. {doctor.name}</p>
                        <p className="text-sm text-gray-600">{doctor.specialization || 'General'}</p>
                        <p className="text-sm text-gray-500">{doctor.email}</p>
                      </div>
                      {selectedDoctor === doctor._id && (
                        <CheckCircle className="h-6 w-6 text-primary-600" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No doctors found</p>
              )}
            </div>
          </div>
        </div>

        {/* Assignment Summary */}
        {selectedPatientData && selectedDoctorData && (
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="font-bold text-gray-900 mb-4">Assignment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Patient</p>
                <p className="font-medium text-gray-900">{selectedPatientData.name}</p>
                <p className="text-sm text-gray-500">{selectedPatientData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Doctor</p>
                <p className="font-medium text-gray-900">Dr. {selectedDoctorData.name}</p>
                <p className="text-sm text-gray-500">{selectedDoctorData.specialization || 'General'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={handleAssign}
            disabled={!selectedPatient || !selectedDoctor || loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Assigning...' : 'Assign Doctor'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default AssignDoctor;
