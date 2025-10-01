# Controller Update Instructions

## Quick Reference for Remaining Controllers

All remaining controllers need these changes:

### 1. Replace imports
```javascript
// OLD
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// NEW
const { Model1, Model2, ... } = require('../models');
```

### 2. Key Query Conversions

#### Find by ID
- `prisma.model.findUnique({ where: { id: parseInt(id) } })` → `Model.findById(id)`

#### Find One
- `prisma.model.findUnique({ where: { field } })` → `Model.findOne({ field })`

#### Find Many
- `prisma.model.findMany({ where, skip, take })` → `Model.find(where).skip(skip).limit(take)`

#### Create
- `prisma.model.create({ data: {...} })` → `Model.create({...})`

#### Update
- `prisma.model.update({ where: { id }, data })` → `Model.findByIdAndUpdate(id, data, { new: true })`

#### Count
- `prisma.model.count({ where })` → `Model.countDocuments(where)`

#### Populate/Include
- `include: { relation: true }` → `.populate('relation')`
- Nested: `.populate({ path: 'relation', populate: { path: 'userId' } })`

### 3. Query Operators
- `contains` → `$regex` with `$options: 'i'`
- `gte/lte` → `$gte/$lte`
- `in` → `$in`
- `OR` → `$or`

### 4. ID Conversions
- Remove `parseInt(id)` - MongoDB uses string IDs
- Use `_id` instead of `id` for new documents
- Relations use ObjectId directly

## Controllers Status
- ✅ authController.js
- ✅ patientController.js
- ✅ appointmentController.js
- ⏳ prescriptionController.js
- ⏳ billingController.js
- ⏳ labReportController.js
- ⏳ doctorController.js
- ⏳ adminController.js
