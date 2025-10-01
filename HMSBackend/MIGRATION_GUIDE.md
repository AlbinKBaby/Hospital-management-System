# Prisma to Mongoose Migration Guide

## Completed Steps

1. ✅ Created Mongoose models in `/models` directory
2. ✅ Updated `package.json` to use Mongoose instead of Prisma
3. ✅ Created database connection configuration in `/config/database.js`
4. ✅ Updated `index.js` to use Mongoose connection
5. ✅ Updated `authController.js` to use Mongoose models

## Key Migration Patterns

### Import Changes
```javascript
// OLD (Prisma)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// NEW (Mongoose)
const { Model1, Model2 } = require('../models');
```

### Query Changes

#### Find One
```javascript
// OLD
await prisma.model.findUnique({ where: { id } })
await prisma.model.findUnique({ where: { email } })

// NEW
await Model.findById(id)
await Model.findOne({ email })
```

#### Find Many
```javascript
// OLD
await prisma.model.findMany({ where, skip, take, include, orderBy })

// NEW
await Model.find(where).skip(skip).limit(take).populate('relation').sort({ field: -1 })
```

#### Create
```javascript
// OLD
await prisma.model.create({ data: {...} })

// NEW
await Model.create({...})
```

#### Update
```javascript
// OLD
await prisma.model.update({ where: { id }, data: {...} })

// NEW
await Model.findByIdAndUpdate(id, {...}, { new: true })
```

#### Delete
```javascript
// OLD
await prisma.model.delete({ where: { id } })

// NEW
await Model.findByIdAndDelete(id)
```

#### Count
```javascript
// OLD
await prisma.model.count({ where })

// NEW
await Model.countDocuments(where)
```

### Populate/Include Changes
```javascript
// OLD
include: {
  doctor: true,
  receptionist: { include: { user: true } }
}

// NEW
.populate('doctor')
.populate({
  path: 'receptionist',
  populate: { path: 'userId', model: 'User' }
})
```

### Search Queries
```javascript
// OLD
where: {
  OR: [
    { firstName: { contains: search } },
    { lastName: { contains: search } }
  ]
}

// NEW
{
  $or: [
    { firstName: { $regex: search, $options: 'i' } },
    { lastName: { $regex: search, $options: 'i' } }
  ]
}
```

## Next Steps

Run the following commands:
```bash
# Install Mongoose
npm install

# Remove Prisma files (optional)
# rm -rf prisma node_modules/.prisma

# Update .env file (DATABASE_URL should be MongoDB connection string)
# Example: DATABASE_URL="mongodb://localhost:27017/hospital_management"
```

## Controllers to Update

- ✅ authController.js
- ⏳ patientController.js
- ⏳ appointmentController.js
- ⏳ prescriptionController.js
- ⏳ labReportController.js
- ⏳ billingController.js
- ⏳ doctorController.js
- ⏳ adminController.js
