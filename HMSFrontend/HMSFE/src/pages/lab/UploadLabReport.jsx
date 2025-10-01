import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPatients } from '../../redux/slices/patientSlice';
import { createLabTest } from '../../redux/slices/labSlice';
import { Upload, FileText, Search, AlertCircle, CheckCircle, X } from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../config/api';

const UploadLabReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patients } = useSelector((state) => state.patients);
  const { loading } = useSelector((state) => state.lab);

  const [selectedPatient, setSelectedPatient] = useState('');
  const [searchPatient, setSearchPatient] = useState('');
  const [formData, setFormData] = useState({
    testName: '',
    testType: '',
    description: '',
    notes: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  const filteredPatients = patients.filter((patient) =>
    patient.name?.toLowerCase().includes(searchPatient.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchPatient.toLowerCase())
  );

  const selectedPatientData = patients.find(p => p._id === selectedPatient);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF and image files (JPEG, PNG) are allowed');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError('');

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const uploadToS3 = async (file) => {
    // This is a mock implementation. In production, you would:
    // 1. Get pre-signed URL from your backend
    // 2. Upload file directly to S3 using the pre-signed URL
    // 3. Return the file URL

    // For now, we'll simulate the upload with FormData to backend
    const formDataToSend = new FormData();
    formDataToSend.append('file', file);
    formDataToSend.append('patientId', selectedPatient);
    formDataToSend.append('testName', formData.testName);

    try {
      const response = await api.post('/lab/upload', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      return response.data.fileUrl; // Backend should return the S3 URL
    } catch (err) {
      throw new Error(err.response?.data?.message || 'File upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPatient) {
      setError('Please select a patient');
      return;
    }

    if (!formData.testName) {
      setError('Please enter test name');
      return;
    }

    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Upload file to S3
      const fileUrl = await uploadToS3(selectedFile);

      // Create lab test record
      const labTestData = {
        patientId: selectedPatient,
        patientName: selectedPatientData.name,
        testName: formData.testName,
        testType: formData.testType,
        description: formData.description,
        notes: formData.notes,
        resultFileUrl: fileUrl,
        status: 'completed',
      };

      await dispatch(createLabTest(labTestData));

      setSuccess('Lab report uploaded successfully!');
      setTimeout(() => {
        navigate('/lab/reports');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to upload lab report');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upload Lab Report</h1>
            <p className="text-gray-600 mt-1">Upload test results and reports</p>
          </div>
          <button
            onClick={() => navigate('/lab/reports')}
            className="btn-secondary"
          >
            View All Reports
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Patient */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Patient</h2>
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

            {searchPatient && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient._id}
                    onClick={() => {
                      setSelectedPatient(patient._id);
                      setSearchPatient('');
                    }}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <p className="font-medium text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-600">{patient.email} • {patient.phone}</p>
                  </div>
                ))}
              </div>
            )}

            {selectedPatientData && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-gray-900">Selected Patient: {selectedPatientData.name}</p>
                <p className="text-sm text-gray-600">{selectedPatientData.email} • {selectedPatientData.phone}</p>
              </div>
            )}
          </div>

          {/* Test Details */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Test Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  Test Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="testName"
                  className="input-field"
                  placeholder="e.g., Complete Blood Count"
                  value={formData.testName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="label">Test Type</label>
                <select
                  name="testType"
                  className="input-field"
                  value={formData.testType}
                  onChange={handleChange}
                >
                  <option value="">Select Type</option>
                  <option value="blood">Blood Test</option>
                  <option value="urine">Urine Test</option>
                  <option value="xray">X-Ray</option>
                  <option value="mri">MRI</option>
                  <option value="ct_scan">CT Scan</option>
                  <option value="ultrasound">Ultrasound</option>
                  <option value="ecg">ECG</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="label">Description</label>
                <textarea
                  name="description"
                  className="input-field"
                  rows="3"
                  placeholder="Enter test description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Notes</label>
                <textarea
                  name="notes"
                  className="input-field"
                  rows="2"
                  placeholder="Additional notes or observations"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Report File</h2>
            
            {!selectedFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, JPEG, PNG up to 10MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {filePreview ? (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded"
                      />
                    ) : (
                      <div className="h-20 w-20 bg-red-100 rounded flex items-center justify-center">
                        <FileText className="h-10 w-10 text-red-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{uploadProgress}% uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-red-600 hover:text-red-800"
                    disabled={uploading}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500 mt-4">
              <strong>Note:</strong> Files are uploaded to AWS S3 for secure storage and easy access.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/lab/dashboard')}
              className="btn-secondary"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedPatient || !selectedFile || !formData.testName}
              className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="h-5 w-5 mr-2" />
              {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Report'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default UploadLabReport;
