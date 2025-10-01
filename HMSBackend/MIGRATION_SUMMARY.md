# Prisma to Mongoose Migration Summary

## ✅ Completed Tasks

### 1. Models Created
All Mongoose models have been created in `/models` directory:
- ✅ User.js
- ✅ Doctor.js
- ✅ Receptionist.js
- ✅ LabStaff.js
- ✅ Patient.js
- ✅ Appointment.js
- ✅ Prescription.js
- ✅ LabReport.js
- ✅ MedicalRecord.js
- ✅ Billing.js
- ✅ Treatment.js
- ✅ models/index.js (exports all models)

### 2. Configuration Updated
- ✅ `package.json` - Replaced Prisma with Mongoose
- ✅ `config/database.js` - Created Mongoose connection config
- ✅ `index.js` - Updated to use Mongoose connection

### 3. Controllers Updated
- ✅ authController.js - Fully migrated to Mongoose
- ✅ patientController.js - Fully migrated to Mongoose
- ✅ appointmentController.js - Fully migrated to Mongoose

### 4. Seed File
- ✅ `seeds/seed.js` - Created Mongoose seed file

## ⏳ Remaining Controllers to Update

The following controllers still use Prisma and need manual conversion:

### Controllers Needing Update:
1. **prescriptionController.js** - Uses Prescription, Appointment, Patient, Doctor models
2. **billingController.js** - Uses Billing, Patient models
3. **labReportController.js** - Uses LabReport, Patient, LabStaff models
4. **doctorController.js** - Uses Doctor, Patient, Appointment, Treatment, LabReport models
5. **adminController.js** - Uses User, Doctor, Receptionist, LabStaff, Patient models

## 🔧 Quick Conversion Guide

### Pattern Replacements Needed:

#### 1. Imports
```javascript
// Replace
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// With
const { Model1, Model2 } = require('../models');
```

#### 2. Find Operations
```javascript
// findUnique with id
prisma.model.findUnique({ where: { id: parseInt(id) } })
→ Model.findById(id)

// findUnique with other field
prisma.model.findUnique({ where: { email } })
→ Model.findOne({ email })

// findMany
prisma.model.findMany({ where, skip, take, orderBy: { field: 'desc' } })
→ Model.find(where).skip(skip).limit(take).sort({ field: -1 })
```

#### 3. Create/Update/Delete
```javascript
// Create
prisma.model.create({ data: {...} })
→ Model.create({...})

// Update
prisma.model.update({ where: { id: parseInt(id) }, data: {...} })
→ Model.findByIdAndUpdate(id, {...}, { new: true })

// Delete
prisma.model.delete({ where: { id: parseInt(id) } })
→ Model.findByIdAndDelete(id)

// Count
prisma.model.count({ where })
→ Model.countDocuments(where)
```

#### 4. Relations (Include → Populate)
```javascript
// Simple include
include: { doctor: true }
→ .populate('doctorId')

// Nested include
include: {
  doctor: {
    include: {
      user: { select: { firstName: true } }
    }
  }
}
→ .populate({
  path: 'doctorId',
  populate: { path: 'userId', select: 'firstName' }
})
```

#### 5. Query Operators
```javascript
// Text search
{ firstName: { contains: search } }
→ { firstName: { $regex: search, $options: 'i' } }

// Date range
{ date: { gte: start, lte: end } }
→ { date: { $gte: start, $lte: end } }

// In array
{ status: { in: ['PENDING', 'COMPLETED'] } }
→ { status: { $in: ['PENDING', 'COMPLETED'] } }

// OR conditions
{ OR: [{ field1: value1 }, { field2: value2 }] }
→ { $or: [{ field1: value1 }, { field2: value2 }] }
```

#### 6. Important ID Changes
- Remove all `parseInt(id)` - MongoDB uses string ObjectIds
- Use `_id` for accessing ID of newly created documents
- Relations use ObjectId directly (no conversion needed)

## 📋 Next Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Update Environment Variables
Ensure your `.env` file has MongoDB connection string:
```
DATABASE_URL="mongodb://localhost:27017/hospital_management"
# or for MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/hospital_management"
```

### Step 3: Run Seed File
```bash
node seeds/seed.js
```

### Step 4: Update Remaining Controllers
Manually update the 5 remaining controllers using the patterns above.

### Step 5: Remove Prisma (Optional)
```bash
# Remove Prisma directory
Remove-Item -Recurse -Force prisma

# Remove Prisma from node_modules
npm uninstall @prisma/client prisma
```

### Step 6: Test the Application
```bash
npm start
```

## 🔑 Default Credentials (After Seeding)

- **Admin**: admin@hospital.com / admin123
- **Doctor**: doctor@hospital.com / doctor123
- **Receptionist**: receptionist@hospital.com / receptionist123
- **Lab Staff**: labstaff@hospital.com / labstaff123

## 📝 Notes

1. **Virtual Populate**: The User model uses virtuals to populate doctor/receptionist/labStaff. Make sure to call `.populate()` when needed.

2. **JSON Fields**: Fields like `medicines` and `services` are stored as strings. Parse them with `JSON.parse()` when reading and `JSON.stringify()` when writing.

3. **Timestamps**: Mongoose automatically handles `createdAt` and `updatedAt` with `timestamps: true` in schemas.

4. **Soft Delete**: Patient model has `isDeleted` and `deletedAt` fields for soft deletion.

5. **ObjectId References**: All foreign keys are now ObjectId types and reference other collections.

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module '../models'"
**Solution**: Ensure all model files are created and models/index.js exports them.

### Issue: "Cast to ObjectId failed"
**Solution**: Remove `parseInt()` calls - MongoDB uses string IDs.

### Issue: "Populate not working"
**Solution**: Check that the field name matches the schema reference (e.g., `doctorId` not `doctor`).

### Issue: "Virtuals not showing in response"
**Solution**: Add `toJSON: { virtuals: true }` to schema options and call `.populate()`.

## 📚 Resources

- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Query Operators](https://www.mongodb.com/docs/manual/reference/operator/query/)
- [Mongoose Populate](https://mongoosejs.com/docs/populate.html)
