const { Billing, Patient } = require('../models');
const { getPagination, formatPaginationResponse } = require('../utils/helpers');

// Generate unique invoice number
const generateInvoiceNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
};

// Create billing/invoice
const createBilling = async (req, res, next) => {
  try {
    const {
      patientId,
      services,
      totalAmount,
      paidAmount,
      paymentMethod,
      notes
    } = req.body;

    // Verify patient exists
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber();

    // Determine status based on payment
    let status = 'PENDING';
    if (paidAmount >= totalAmount) {
      status = 'PAID';
    }

    const billing = await Billing.create({
      patientId,
      invoiceNumber,
      services: JSON.stringify(services),
      totalAmount: parseFloat(totalAmount),
      paidAmount: parseFloat(paidAmount) || 0,
      status,
      paymentMethod,
      notes
    });

    await billing.populate('patientId');

    // Parse services back to JSON
    const billingData = {
      ...billing,
      services: JSON.parse(billing.services)
    };

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: billingData
    });
  } catch (error) {
    next(error);
  }
};

// Get all billings with filters
const getAllBillings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, patientId, status, startDate, endDate } = req.query;
    const { skip, take } = getPagination(page, limit);

    const where = {};

    if (patientId) {
      where.patientId = parseInt(patientId);
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.billingDate = {};
      if (startDate) {
        where.billingDate.$gte = new Date(startDate);
      }
      if (endDate) {
        where.billingDate.$lte = new Date(endDate);
      }
    }

    const [billings, total] = await Promise.all([
      Billing.find(where)
        .skip(skip)
        .limit(take)
        .populate('patientId')
        .sort({ createdAt: -1 }),
      Billing.countDocuments(where)
    ]);

    // Parse services JSON
    const billingsData = billings.map(b => ({
      ...b,
      services: JSON.parse(b.services)
    }));

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(billingsData, total, parseInt(page), parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

// Get billing by ID
const getBillingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const billing = await Billing.findById(id).populate('patientId');

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Parse services JSON
    const billingData = {
      ...billing,
      services: JSON.parse(billing.services)
    };

    res.status(200).json({
      success: true,
      data: billingData
    });
  } catch (error) {
    next(error);
  }
};

// Update billing
const updateBilling = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      services,
      totalAmount,
      paidAmount,
      status,
      paymentMethod,
      notes
    } = req.body;

    const updateData = {};

    if (services) updateData.services = JSON.stringify(services);
    if (totalAmount) updateData.totalAmount = parseFloat(totalAmount);
    if (paidAmount !== undefined) updateData.paidAmount = parseFloat(paidAmount);
    if (status) updateData.status = status;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (notes) updateData.notes = notes;

    const billing = await Billing.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('patientId');

    // Parse services back to JSON
    const billingData = {
      ...billing,
      services: JSON.parse(billing.services)
    };

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: billingData
    });
  } catch (error) {
    next(error);
  }
};

// Delete billing
const deleteBilling = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Billing.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Generate PDF invoice (placeholder - requires PDF library)
const generatePDF = async (req, res, next) => {
  try {
    const { id } = req.params;

    const billing = await Billing.findById(id).populate('patientId');

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Parse services
    const services = JSON.parse(billing.services);

    // For now, return JSON data that can be used to generate PDF on frontend
    // In production, use libraries like pdfkit, puppeteer, or jspdf
    res.status(200).json({
      success: true,
      message: 'PDF data retrieved. Implement PDF generation library for actual PDF.',
      data: {
        invoiceNumber: billing.invoiceNumber,
        billingDate: billing.billingDate,
        patient: {
          name: `${billing.patientId.firstName} ${billing.patientId.lastName}`,
          email: billing.patientId.email,
          phone: billing.patientId.phone,
          address: billing.patientId.address
        },
        services,
        totalAmount: billing.totalAmount,
        paidAmount: billing.paidAmount,
        balance: billing.totalAmount - billing.paidAmount,
        status: billing.status,
        paymentMethod: billing.paymentMethod,
        notes: billing.notes
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBilling,
  getAllBillings,
  getBillingById,
  updateBilling,
  deleteBilling,
  generatePDF
};
