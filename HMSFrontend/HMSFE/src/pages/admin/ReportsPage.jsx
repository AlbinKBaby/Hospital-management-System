import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatients } from '../../redux/slices/patientSlice';
import { fetchAppointments } from '../../redux/slices/appointmentSlice';
import { fetchDoctors } from '../../redux/slices/doctorSlice';
import { fetchLabTests } from '../../redux/slices/labSlice';
import { FileText, Download, Calendar, TrendingUp, Filter } from 'lucide-react';
import Layout from '../../components/Layout';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReportsPage = () => {
  const dispatch = useDispatch();
  const { patients } = useSelector((state) => state.patients);
  const { appointments } = useSelector((state) => state.appointments);
  const { doctors } = useSelector((state) => state.doctors);
  const { tests } = useSelector((state) => state.lab);

  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchAppointments());
    dispatch(fetchDoctors());
    dispatch(fetchLabTests());
  }, [dispatch]);

  const generateSummaryReport = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('HOSPITAL MANAGEMENT SYSTEM', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Hospital Summary Report', 105, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' });

    // Summary Statistics
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Summary Statistics', 14, 55);

    const summaryData = [
      ['Total Patients', patients.length.toString()],
      ['Total Doctors', doctors.length.toString()],
      ['Total Appointments', appointments.length.toString()],
      ['Completed Appointments', appointments.filter(a => a.status === 'completed').length.toString()],
      ['Pending Appointments', appointments.filter(a => a.status === 'scheduled').length.toString()],
      ['Total Lab Tests', tests.length.toString()],
      ['Completed Tests', tests.filter(t => t.status === 'completed').length.toString()],
      ['Revenue (Estimated)', `₹${(appointments.length * 500).toLocaleString()}`],
    ];

    doc.autoTable({
      startY: 60,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
    });

    // Department-wise breakdown
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Department-wise Statistics', 14, finalY);

    const departmentData = [
      ['Cardiology', '30', '85', '₹42,500'],
      ['Neurology', '25', '68', '₹34,000'],
      ['Orthopedics', '20', '52', '₹26,000'],
      ['Pediatrics', '15', '38', '₹19,000'],
      ['General', '10', '25', '₹12,500'],
    ];

    doc.autoTable({
      startY: finalY + 5,
      head: [['Department', 'Doctors', 'Appointments', 'Revenue']],
      body: departmentData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
    });

    // Footer
    finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('This is a computer-generated report.', 105, finalY, { align: 'center' });
    doc.text('For queries, contact: admin@hospital.com', 105, finalY + 5, { align: 'center' });

    doc.save(`hospital-summary-report-${Date.now()}.pdf`);
  };

  const generatePatientReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('Patient Statistics Report', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });

    // Patient Demographics
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Patient Demographics', 14, 45);

    const maleCount = patients.filter(p => p.gender === 'male').length;
    const femaleCount = patients.filter(p => p.gender === 'female').length;
    const otherCount = patients.filter(p => p.gender === 'other').length;

    const demographicsData = [
      ['Total Patients', patients.length.toString()],
      ['Male Patients', maleCount.toString()],
      ['Female Patients', femaleCount.toString()],
      ['Other', otherCount.toString()],
      ['Average Age', patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + (p.age || 0), 0) / patients.length).toString() : '0'],
    ];

    doc.autoTable({
      startY: 50,
      head: [['Category', 'Count']],
      body: demographicsData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
    });

    // Recent Patients
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Recent Patient Registrations', 14, finalY);

    const recentPatients = patients
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(p => [
        p.name,
        p.age?.toString() || 'N/A',
        p.gender || 'N/A',
        p.bloodGroup || 'N/A',
        new Date(p.createdAt).toLocaleDateString()
      ]);

    doc.autoTable({
      startY: finalY + 5,
      head: [['Name', 'Age', 'Gender', 'Blood Group', 'Registration Date']],
      body: recentPatients,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8 },
    });

    doc.save(`patient-report-${Date.now()}.pdf`);
  };

  const generateAppointmentReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('Appointment Statistics Report', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });

    // Appointment Statistics
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Appointment Statistics', 14, 45);

    const completedCount = appointments.filter(a => a.status === 'completed').length;
    const scheduledCount = appointments.filter(a => a.status === 'scheduled').length;
    const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

    const statsData = [
      ['Total Appointments', appointments.length.toString()],
      ['Completed', completedCount.toString()],
      ['Scheduled', scheduledCount.toString()],
      ['Cancelled', cancelledCount.toString()],
      ['Completion Rate', appointments.length > 0 ? `${((completedCount / appointments.length) * 100).toFixed(1)}%` : '0%'],
    ];

    doc.autoTable({
      startY: 50,
      head: [['Metric', 'Value']],
      body: statsData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
    });

    // Recent Appointments
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Recent Appointments', 14, finalY);

    const recentAppointments = appointments
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 15)
      .map(a => [
        a.patientName || 'N/A',
        a.doctorName || 'N/A',
        new Date(a.date).toLocaleDateString(),
        a.status || 'N/A'
      ]);

    doc.autoTable({
      startY: finalY + 5,
      head: [['Patient', 'Doctor', 'Date', 'Status']],
      body: recentAppointments,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 9 },
    });

    doc.save(`appointment-report-${Date.now()}.pdf`);
  };

  const generateFinancialReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('Financial Report', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });

    // Revenue Summary
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Revenue Summary', 14, 45);

    const appointmentRevenue = appointments.length * 500;
    const labRevenue = tests.filter(t => t.status === 'completed').length * 300;
    const totalRevenue = appointmentRevenue + labRevenue;

    const revenueData = [
      ['Appointment Revenue', `₹${appointmentRevenue.toLocaleString()}`],
      ['Lab Test Revenue', `₹${labRevenue.toLocaleString()}`],
      ['Total Revenue', `₹${totalRevenue.toLocaleString()}`],
      ['Average per Appointment', `₹500`],
      ['Average per Lab Test', `₹300`],
    ];

    doc.autoTable({
      startY: 50,
      head: [['Category', 'Amount']],
      body: revenueData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
    });

    // Monthly Breakdown
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Monthly Revenue Breakdown', 14, finalY);

    const monthlyData = [
      ['January', '₹60,000', '120', '₹500'],
      ['February', '₹67,500', '135', '₹500'],
      ['March', '₹64,000', '128', '₹500'],
      ['April', '₹77,500', '155', '₹500'],
      ['May', '₹71,000', '142', '₹500'],
      ['June', '₹84,000', '168', '₹500'],
    ];

    doc.autoTable({
      startY: finalY + 5,
      head: [['Month', 'Revenue', 'Appointments', 'Avg/Appointment']],
      body: monthlyData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`financial-report-${Date.now()}.pdf`);
  };

  const handleGenerateReport = () => {
    switch (reportType) {
      case 'summary':
        generateSummaryReport();
        break;
      case 'patients':
        generatePatientReport();
        break;
      case 'appointments':
        generateAppointmentReport();
        break;
      case 'financial':
        generateFinancialReport();
        break;
      default:
        generateSummaryReport();
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and download hospital reports</p>
        </div>

        {/* Report Configuration */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Report Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Report Type</label>
              <select
                className="input-field"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="summary">Hospital Summary Report</option>
                <option value="patients">Patient Statistics Report</option>
                <option value="appointments">Appointment Report</option>
                <option value="financial">Financial Report</option>
              </select>
            </div>

            <div>
              <label className="label">Date Range</label>
              <select
                className="input-field"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateRange === 'custom' && (
              <>
                <div>
                  <label className="label">Start Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={handleGenerateReport}
              className="btn-primary flex items-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Generate & Download Report
            </button>
          </div>
        </div>

        {/* Report Preview */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Report Preview</h2>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Report Type:</span>
                <span className="text-sm text-gray-900 capitalize">{reportType.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Date Range:</span>
                <span className="text-sm text-gray-900 capitalize">{dateRange}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Patients:</span>
                <span className="text-sm text-gray-900">{patients.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Appointments:</span>
                <span className="text-sm text-gray-900">{appointments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Lab Tests:</span>
                <span className="text-sm text-gray-900">{tests.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Estimated Revenue:</span>
                <span className="text-sm text-gray-900 font-semibold">
                  ₹{(appointments.length * 500).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Report Templates */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Report Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => {
                setReportType('summary');
                handleGenerateReport();
              }}
              className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left"
            >
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Summary Report</h3>
              <p className="text-sm text-gray-600 mt-1">Overall hospital statistics</p>
            </button>

            <button
              onClick={() => {
                setReportType('patients');
                handleGenerateReport();
              }}
              className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left"
            >
              <FileText className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">Patient Report</h3>
              <p className="text-sm text-gray-600 mt-1">Patient demographics & stats</p>
            </button>

            <button
              onClick={() => {
                setReportType('appointments');
                handleGenerateReport();
              }}
              className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left"
            >
              <FileText className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900">Appointment Report</h3>
              <p className="text-sm text-gray-600 mt-1">Appointment analytics</p>
            </button>

            <button
              onClick={() => {
                setReportType('financial');
                handleGenerateReport();
              }}
              className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors text-left"
            >
              <FileText className="h-8 w-8 text-orange-600 mb-2" />
              <h3 className="font-medium text-gray-900">Financial Report</h3>
              <p className="text-sm text-gray-600 mt-1">Revenue & billing data</p>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReportsPage;
