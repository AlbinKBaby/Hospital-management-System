# Hospital Management System - Backend API

A comprehensive REST API backend for Hospital Management System built with Node.js, Express, MySQL, Prisma ORM, and JWT authentication.

## 🚀 Features

- **Multi-Role Authentication**: Admin, Receptionist, Doctor, and Lab Staff
- **JWT-based Security**: Secure token-based authentication
- **Role-Based Access Control**: Fine-grained permissions for different user roles
- **Patient Management**: Complete patient registration and medical history
- **Appointment System**: Schedule and manage doctor appointments
- **Prescription Management**: Doctors can create and manage prescriptions
- **Lab Reports**: Lab staff can manage test requests and results
- **RESTful API**: Clean and well-documented API endpoints

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository

```bash
cd HMSBackend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/hospital_management_system"

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

**Important**: Replace the database credentials with your MySQL credentials.

### 4. Database Setup

#### Create MySQL Database

```sql
CREATE DATABASE hospital_management_system;
```

#### Run Prisma Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 5. Seed Initial Admin User (Optional)

Create a file `prisma/seed.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@hospital.com',
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'System',
      lastName: 'Administrator',
      phone: '1234567890',
      isActive: true
    }
  });

  console.log('Admin user created:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run the seed:

```bash
node prisma/seed.js
```

### 6. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/login` | User login | Public |
| POST | `/auth/register` | Register new user | Admin only |
| GET | `/auth/profile` | Get current user profile | Authenticated |
| PUT | `/auth/profile` | Update profile | Authenticated |
| PUT | `/auth/change-password` | Change password | Authenticated |

### Admin Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/admin/dashboard/stats` | Get dashboard statistics | Admin |
| GET | `/admin/users` | Get all users | Admin |
| GET | `/admin/users/:id` | Get user by ID | Admin |
| PUT | `/admin/users/:id` | Update user | Admin |
| DELETE | `/admin/users/:id` | Delete user | Admin |
| PATCH | `/admin/users/:id/toggle-status` | Toggle user status | Admin |
| GET | `/admin/doctors` | Get all doctors | Admin |

### Patient Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/patients` | Create new patient | Receptionist, Admin |
| GET | `/patients` | Get all patients | Authenticated |
| GET | `/patients/:id` | Get patient by ID | Authenticated |
| PUT | `/patients/:id` | Update patient | Receptionist, Admin |
| DELETE | `/patients/:id` | Delete patient | Admin |
| GET | `/patients/:id/medical-history` | Get medical history | Authenticated |
| POST | `/patients/:id/medical-records` | Add medical record | Doctor, Admin |

### Appointment Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/appointments` | Create appointment | Receptionist, Admin |
| GET | `/appointments` | Get all appointments | Authenticated |
| GET | `/appointments/:id` | Get appointment by ID | Authenticated |
| PUT | `/appointments/:id` | Update appointment | Receptionist, Doctor, Admin |
| PATCH | `/appointments/:id/cancel` | Cancel appointment | Receptionist, Admin |
| GET | `/appointments/doctor/my-appointments` | Get doctor's appointments | Doctor |

### Prescription Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/prescriptions` | Create prescription | Doctor |
| GET | `/prescriptions` | Get all prescriptions | Authenticated |
| GET | `/prescriptions/:id` | Get prescription by ID | Authenticated |
| PUT | `/prescriptions/:id` | Update prescription | Doctor |
| GET | `/prescriptions/doctor/my-prescriptions` | Get doctor's prescriptions | Doctor |

### Lab Report Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/lab-reports` | Create lab report request | Receptionist, Doctor, Admin |
| GET | `/lab-reports` | Get all lab reports | Authenticated |
| GET | `/lab-reports/:id` | Get lab report by ID | Authenticated |
| PUT | `/lab-reports/:id` | Update lab report | Lab Staff, Admin |
| DELETE | `/lab-reports/:id` | Delete lab report | Admin |
| GET | `/lab-reports/pending` | Get pending reports | Lab Staff, Admin |
| GET | `/lab-reports/lab-staff/my-reports` | Get lab staff's reports | Lab Staff |

## 🔐 User Roles & Permissions

### Admin
- Full system access
- User management (create, update, delete, activate/deactivate)
- View all data and statistics
- System configuration

### Receptionist
- Register new patients
- Schedule appointments
- Update patient information
- Request lab tests
- View appointments and patients

### Doctor
- View assigned appointments
- Create and update prescriptions
- Add medical records
- Request lab tests
- View patient medical history

### Lab Staff
- View pending lab test requests
- Update lab report status
- Add test results
- View assigned reports

## 📊 Database Schema

### Main Models

- **User**: System users with roles
- **Doctor**: Doctor-specific information
- **Receptionist**: Receptionist-specific information
- **LabStaff**: Lab staff-specific information
- **Patient**: Patient records
- **Appointment**: Doctor appointments
- **Prescription**: Medical prescriptions
- **LabReport**: Laboratory test reports
- **MedicalRecord**: Patient medical history

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control (RBAC)
- Input validation with express-validator
- SQL injection protection with Prisma ORM
- CORS configuration
- Error handling middleware

## 🧪 Testing the API

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"admin123"}'

# Get profile (replace TOKEN with actual JWT)
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman

1. Import the API endpoints
2. Set base URL: `http://localhost:5000/api`
3. For protected routes, add header: `Authorization: Bearer <your_token>`

## 📁 Project Structure

```
HMSBackend/
├── config/
│   └── config.js              # Configuration settings
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── adminController.js     # Admin operations
│   ├── patientController.js   # Patient management
│   ├── appointmentController.js
│   ├── prescriptionController.js
│   └── labReportController.js
├── middleware/
│   ├── auth.js                # Authentication & authorization
│   ├── errorHandler.js        # Error handling
│   └── validator.js           # Validation middleware
├── prisma/
│   └── schema.prisma          # Database schema
├── routes/
│   ├── authRoutes.js
│   ├── adminRoutes.js
│   ├── patientRoutes.js
│   ├── appointmentRoutes.js
│   ├── prescriptionRoutes.js
│   └── labReportRoutes.js
├── utils/
│   └── helpers.js             # Utility functions
├── validators/
│   ├── authValidators.js
│   ├── patientValidators.js
│   ├── appointmentValidators.js
│   ├── prescriptionValidators.js
│   └── labReportValidators.js
├── .env                       # Environment variables
├── .env.example               # Environment template
├── index.js                   # Main server file
├── package.json
└── README.md
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check MySQL is running
mysql --version

# Test connection
mysql -u username -p

# Verify DATABASE_URL in .env file
```

### Prisma Issues

```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database in browser
npx prisma studio
```

### Port Already in Use

```bash
# Change PORT in .env file or kill the process
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | MySQL connection string | Required |
| PORT | Server port | 5000 |
| NODE_ENV | Environment mode | development |
| JWT_SECRET | Secret key for JWT | Required |
| JWT_EXPIRES_IN | Token expiration time | 7d |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:3000 |

## 🚦 API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 📄 License

ISC

## 👥 Support

For issues and questions, please create an issue in the repository.

---

**Built with ❤️ for Healthcare Management**
