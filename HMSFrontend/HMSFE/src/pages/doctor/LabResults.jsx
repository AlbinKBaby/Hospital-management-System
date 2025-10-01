import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLabTests } from '../../redux/slices/labSlice';
import { Search, Download, Eye, FileText, Filter, Calendar } from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../config/api';

const LabResults = () => {
  const dispatch = useDispatch();
  const { tests, loading } = useSelector((state) => state.lab);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTest, setSelectedTest] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    dispatch(fetchLabTests());
  }, [dispatch]);

  const filteredTests = tests.filter((test) => {
    const matchesSearch = 
      test.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.testId?.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || test.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handlePreview = (test) => {
    setSelectedTest(test);
    setShowPreview(true);
  };

  const handleDownload = async (test) => {
    try {
      // If test has a result file URL
      if (test.resultFileUrl) {
        const response = await api.get(test.resultFileUrl, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `lab-result-${test.testId || test._id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // Generate a simple text report
        const reportContent = `
LAB TEST REPORT
================

Test ID: ${test._id}
Patient: ${test.patientName || 'N/A'}
Test Name: ${test.testName || 'N/A'}
Date: ${new Date(test.createdAt).toLocaleDateString()}
Status: ${test.status}

Results:
${test.results || 'No results available'}

Notes:
${test.notes || 'No additional notes'}
        `;
        
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `lab-result-${test._id}.txt`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download report');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lab Results</h1>
          <p className="text-gray-600 mt-1">View and download patient lab test results</p>
        </div>

        {/* Search and Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Search by patient name, test name, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="input-field pl-10"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lab Results Table */}
        <div className="card">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredTests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTests.map((test) => (
                    <tr key={test._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {test._id?.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {test.patientName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{test.testName || 'Lab Test'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(test.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                          {test.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handlePreview(test)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="Preview"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDownload(test)}
                            className="text-green-600 hover:text-green-900 flex items-center"
                            title="Download"
                            disabled={test.status !== 'completed'}
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No lab results found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No lab test results available'}
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <p className="text-sm text-gray-600">Total Tests</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{tests.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {tests.filter(t => t.status === 'completed').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {tests.filter(t => t.status === 'in_progress').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-2">
              {tests.filter(t => t.status === 'pending').length}
            </p>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Lab Test Report</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Test ID</p>
                    <p className="font-medium text-gray-900">{selectedTest._id?.slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedTest.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Patient Name</p>
                    <p className="font-medium text-gray-900">{selectedTest.patientName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Test Name</p>
                    <p className="font-medium text-gray-900">{selectedTest.testName || 'Lab Test'}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTest.status)}`}>
                    {selectedTest.status}
                  </span>
                </div>

                {selectedTest.results && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">Results</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedTest.results}</p>
                    </div>
                  </div>
                )}

                {selectedTest.notes && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">Notes</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedTest.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowPreview(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownload(selectedTest)}
                  className="btn-primary flex items-center"
                  disabled={selectedTest.status !== 'completed'}
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default LabResults;
