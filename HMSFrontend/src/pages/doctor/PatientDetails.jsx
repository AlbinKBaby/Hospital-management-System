import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatientById } from '../../redux/slices/patientSlice';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Activity,
  FileText,
  Plus,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../config/api';

const PatientDetails = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentPatient, loading } = useSelector((state) => state.patients);
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('overview');
  const [treatments, setTreatments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [newTreatment, setNewTreatment] = useState({
    diagnosis: '',
    treatment: '',
    notes: '',
  });
  const [newPrescription, setNewPrescription] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (patientId) {
      dispatch(fetchPatientById(patientId));
      fetchTreatments();
      fetchPrescriptions();
    }
  }, [patientId, dispatch]);

  const fetchTreatments = async () => {
    try {
      const response = await api.get(`/treatments/patient/${patientId}`);
      setTreatments(response.data);
    } catch (err) {
      console.error('Failed to fetch treatments:', err);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get(`/prescriptions/patient/${patientId}`);
      setPrescriptions(response.data);
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
    }
  };

  const handleAddTreatment = async () => {
    if (!newTreatment.diagnosis || !newTreatment.treatment) {
      setError('Please fill in diagnosis and treatment');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await api.post('/treatments', {
        patientId,
        doctorId: user._id,
        ...newTreatment,
      });
      
      setTreatments([response.data, ...treatments]);
      setNewTreatment({ diagnosis: '', treatment: '', notes: '' });
      setSuccess('Treatment added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add treatment');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPrescription = async () => {
    if (!newPrescription.medication || !newPrescription.dosage) {
      setError('Please fill in medication and dosage');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await api.post('/prescriptions', {
        patientId,
        doctorId: user._id,
        ...newPrescription,
      });
      
      setPrescriptions([response.data, ...prescriptions]);
      setNewPrescription({
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      });
      setSuccess('Prescription added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add prescription');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !currentPatient) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Details</h1>
            <p className="text-gray-600 mt-1">View and manage patient information</p>
          </div>
          <button
            onClick={() => navigate('/doctor/patients')}
            className="btn-secondary"
          >
            Back to Patients
          </button>
        </div>

        {/* Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Patient Info Card */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-10 w-10 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentPatient.name}</h2>
                <p className="text-gray-600">Patient ID: {currentPatient._id?.slice(-8)}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {currentPatient.age} years
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium capitalize">
                    {currentPatient.gender}
                  </span>
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    {currentPatient.bloodGroup || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{currentPatient.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{currentPatient.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium text-gray-900">{currentPatient.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {currentPatient.medicalHistory && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-2">Medical History</h3>
              <p className="text-gray-700">{currentPatient.medicalHistory}</p>
            </div>
          )}

          {currentPatient.allergies && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Allergies</h3>
              <p className="text-red-600">{currentPatient.allergies}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('treatments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'treatments'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Treatments
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'prescriptions'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Prescriptions
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Treatments</h3>
              {treatments.length > 0 ? (
                <div className="space-y-3">
                  {treatments.slice(0, 3).map((treatment, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{treatment.diagnosis}</p>
                      <p className="text-sm text-gray-600 mt-1">{treatment.treatment}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(treatment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No treatments recorded</p>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Active Prescriptions</h3>
              {prescriptions.length > 0 ? (
                <div className="space-y-3">
                  {prescriptions.slice(0, 3).map((prescription, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{prescription.medication}</p>
                      <p className="text-sm text-gray-600">{prescription.dosage} - {prescription.frequency}</p>
                      <p className="text-xs text-gray-500 mt-2">Duration: {prescription.duration}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No prescriptions recorded</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'treatments' && (
          <div className="space-y-6">
            {/* Add Treatment Form */}
            <div className="card">
              <div className="flex items-center mb-4">
                <Plus className="h-6 w-6 text-primary-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Add New Treatment</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Diagnosis *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter diagnosis"
                    value={newTreatment.diagnosis}
                    onChange={(e) => setNewTreatment({ ...newTreatment, diagnosis: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Treatment *</label>
                  <textarea
                    className="input-field"
                    rows="3"
                    placeholder="Enter treatment details"
                    value={newTreatment.treatment}
                    onChange={(e) => setNewTreatment({ ...newTreatment, treatment: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Additional Notes</label>
                  <textarea
                    className="input-field"
                    rows="2"
                    placeholder="Enter any additional notes"
                    value={newTreatment.notes}
                    onChange={(e) => setNewTreatment({ ...newTreatment, notes: e.target.value })}
                  />
                </div>
                <button
                  onClick={handleAddTreatment}
                  disabled={saving}
                  className="btn-primary flex items-center disabled:opacity-50"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {saving ? 'Saving...' : 'Save Treatment'}
                </button>
              </div>
            </div>

            {/* Treatments List */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Treatment History</h3>
              {treatments.length > 0 ? (
                <div className="space-y-4">
                  {treatments.map((treatment, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{treatment.diagnosis}</h4>
                          <p className="text-gray-700 mt-2">{treatment.treatment}</p>
                          {treatment.notes && (
                            <p className="text-sm text-gray-600 mt-2 italic">{treatment.notes}</p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(treatment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No treatments recorded yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            {/* Add Prescription Form */}
            <div className="card">
              <div className="flex items-center mb-4">
                <Plus className="h-6 w-6 text-primary-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Add New Prescription</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Medication *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., Amoxicillin"
                    value={newPrescription.medication}
                    onChange={(e) => setNewPrescription({ ...newPrescription, medication: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Dosage *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., 500mg"
                    value={newPrescription.dosage}
                    onChange={(e) => setNewPrescription({ ...newPrescription, dosage: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Frequency</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., Twice daily"
                    value={newPrescription.frequency}
                    onChange={(e) => setNewPrescription({ ...newPrescription, frequency: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Duration</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., 7 days"
                    value={newPrescription.duration}
                    onChange={(e) => setNewPrescription({ ...newPrescription, duration: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Instructions</label>
                  <textarea
                    className="input-field"
                    rows="2"
                    placeholder="e.g., Take after meals"
                    value={newPrescription.instructions}
                    onChange={(e) => setNewPrescription({ ...newPrescription, instructions: e.target.value })}
                  />
                </div>
              </div>
              
              <button
                onClick={handleAddPrescription}
                disabled={saving}
                className="btn-primary flex items-center mt-4 disabled:opacity-50"
              >
                <Save className="h-5 w-5 mr-2" />
                {saving ? 'Saving...' : 'Save Prescription'}
              </button>
            </div>

            {/* Prescriptions List */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Prescription History</h3>
              {prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {prescriptions.map((prescription, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">{prescription.medication}</h4>
                          <div className="mt-2 space-y-1">
                            <p className="text-gray-700"><span className="font-medium">Dosage:</span> {prescription.dosage}</p>
                            <p className="text-gray-700"><span className="font-medium">Frequency:</span> {prescription.frequency}</p>
                            <p className="text-gray-700"><span className="font-medium">Duration:</span> {prescription.duration}</p>
                            {prescription.instructions && (
                              <p className="text-gray-600 italic mt-2">{prescription.instructions}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(prescription.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No prescriptions recorded yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PatientDetails;
