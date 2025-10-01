import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPatients } from '../../redux/slices/patientSlice';
import { DollarSign, Plus, Trash2, FileText, Search, AlertCircle, CheckCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../../config/api';

const BillingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patients } = useSelector((state) => state.patients);

  const [selectedPatient, setSelectedPatient] = useState('');
  const [searchPatient, setSearchPatient] = useState('');
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    quantity: 1,
    price: 0,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  const filteredPatients = patients.filter((patient) =>
    patient.name?.toLowerCase().includes(searchPatient.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchPatient.toLowerCase())
  );

  const selectedPatientData = patients.find(p => p._id === selectedPatient);

  const addService = () => {
    if (!newService.name || newService.price <= 0) {
      setError('Please enter valid service details');
      return;
    }

    setServices([
      ...services,
      {
        ...newService,
        id: Date.now(),
        total: newService.quantity * newService.price,
      },
    ]);

    setNewService({
      name: '',
      description: '',
      quantity: 1,
      price: 0,
    });
    setError('');
  };

  const removeService = (id) => {
    setServices(services.filter(service => service.id !== id));
  };

  const calculateTotal = () => {
    return services.reduce((sum, service) => sum + service.total, 0);
  };

  const calculateTax = () => {
    return calculateTotal() * 0.18; // 18% GST
  };

  const calculateGrandTotal = () => {
    return calculateTotal() + calculateTax();
  };

  const generatePDF = () => {
    if (!selectedPatientData) {
      setError('Please select a patient');
      return;
    }

    if (services.length === 0) {
      setError('Please add at least one service');
      return;
    }

    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Primary blue
    doc.text('HOSPITAL MANAGEMENT SYSTEM', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE', 105, 30, { align: 'center' });

    // Invoice Details
    doc.setFontSize(10);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 14, 45);
    doc.text(`Invoice No: INV-${Date.now()}`, 14, 50);

    // Patient Details
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Patient Details:', 14, 60);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Name: ${selectedPatientData.name}`, 14, 67);
    doc.text(`Email: ${selectedPatientData.email}`, 14, 72);
    doc.text(`Phone: ${selectedPatientData.phone}`, 14, 77);
    doc.text(`Patient ID: ${selectedPatientData._id}`, 14, 82);

    // Services Table
    const tableData = services.map(service => [
      service.name,
      service.description,
      service.quantity,
      `₹${service.price.toFixed(2)}`,
      `₹${service.total.toFixed(2)}`,
    ]);

    doc.autoTable({
      startY: 90,
      head: [['Service', 'Description', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 9 },
    });

    // Totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: ₹${calculateTotal().toFixed(2)}`, 140, finalY);
    doc.text(`Tax (18%): ₹${calculateTax().toFixed(2)}`, 140, finalY + 7);
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text(`Grand Total: ₹${calculateGrandTotal().toFixed(2)}`, 140, finalY + 17);

    // Footer
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.text('Thank you for choosing our hospital!', 105, 280, { align: 'center' });
    doc.text('For queries, contact: info@hospital.com | +91-1234567890', 105, 285, { align: 'center' });

    // Save PDF
    doc.save(`invoice-${selectedPatientData.name}-${Date.now()}.pdf`);
  };

  const saveBilling = async () => {
    if (!selectedPatient || services.length === 0) {
      setError('Please select a patient and add services');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/billing', {
        patientId: selectedPatient,
        services,
        subtotal: calculateTotal(),
        tax: calculateTax(),
        total: calculateGrandTotal(),
      });

      setSuccess(true);
      generatePDF();
      
      setTimeout(() => {
        navigate('/receptionist/patients');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save billing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
            <p className="text-gray-600 mt-1">Generate patient invoices</p>
          </div>
          <button
            onClick={() => navigate('/receptionist/patients')}
            className="btn-secondary"
          >
            Back to Patients
          </button>
        </div>

        {/* Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Billing saved and invoice generated successfully!</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

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

        {/* Add Services */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add Services/Tests</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="label">Service Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Blood Test"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Quantity</label>
              <input
                type="number"
                className="input-field"
                min="1"
                value={newService.quantity}
                onChange={(e) => setNewService({ ...newService, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <label className="label">Price (₹)</label>
              <input
                type="number"
                className="input-field"
                min="0"
                step="0.01"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={addService}
                className="btn-primary w-full flex items-center justify-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="label">Description (Optional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="Service description"
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
            />
          </div>
        </div>

        {/* Services List */}
        {services.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Services Added</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {services.map((service) => (
                    <tr key={service.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {service.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {service.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {service.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{service.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{service.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => removeService(service.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-end space-y-2">
                <div className="w-64">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Tax (18%):</span>
                    <span className="font-medium">₹{calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t">
                    <span>Grand Total:</span>
                    <span className="text-primary-600">₹{calculateGrandTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={generatePDF}
            disabled={!selectedPatient || services.length === 0}
            className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="h-5 w-5 mr-2" />
            Preview PDF
          </button>
          <button
            onClick={saveBilling}
            disabled={!selectedPatient || services.length === 0 || loading}
            className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DollarSign className="h-5 w-5 mr-2" />
            {loading ? 'Saving...' : 'Save & Generate Invoice'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default BillingPage;
