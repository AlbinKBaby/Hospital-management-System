# API Endpoints Reference

Base URL: `http://localhost:5000/api`

## 🔐 Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@hospital.com",
  "password": "admin123"
}
```

### Register User (Admin Only)
```http
POST /auth/register
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newuser@hospital.com",
  "password": "password123",
  "role": "DOCTOR",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "1234567890",
  "specialization": "Cardiology",
  "qualification": "MD",
  "experience": 5,
  "consultationFee": 500
}
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer {token}
```

### Update Profile
```http
PUT /auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Updated",
  "lastName": "Name",
  "phone": "9876543210"
}
```

### Change Password
```http
PUT /auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## 👨‍💼 Admin

### Get Dashboard Stats
```http
GET /admin/dashboard/stats
Authorization: Bearer {token}
```

### Get All Users
```http
GET /admin/users?page=1&limit=10&role=DOCTOR&search=john
Authorization: Bearer {token}
```

### Get User by ID
```http
GET /admin/users/1
Authorization: Bearer {token}
```

### Update User
```http
PUT /admin/users/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Updated",
  "lastName": "Name",
  "isActive": true
}
```

### Delete User
```http
DELETE /admin/users/1
Authorization: Bearer {token}
```

### Toggle User Status
```http
PATCH /admin/users/1/toggle-status
Authorization: Bearer {token}
```

### Get All Doctors
```http
GET /admin/doctors?page=1&limit=10&specialization=Cardiology
Authorization: Bearer {token}
```

---

## 👥 Patients

### Create Patient
```http
POST /patients
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "9876543210",
  "dateOfBirth": "1990-05-15",
  "gender": "FEMALE",
  "address": "123 Main St",
  "bloodGroup": "O+",
  "emergencyContact": "9876543211"
}
```

### Get All Patients
```http
GET /patients?page=1&limit=10&search=jane
Authorization: Bearer {token}
```

### Get Patient by ID
```http
GET /patients/1
Authorization: Bearer {token}
```

### Update Patient
```http
PUT /patients/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "9876543210"
}
```

### Delete Patient
```http
DELETE /patients/1
Authorization: Bearer {token}
```

### Get Patient Medical History
```http
GET /patients/1/medical-history
Authorization: Bearer {token}
```

### Add Medical Record
```http
POST /patients/1/medical-records
Authorization: Bearer {token}
Content-Type: application/json

{
  "recordType": "Allergy",
  "description": "Allergic to penicillin",
  "recordDate": "2024-01-15"
}
```

---

## 📅 Appointments

### Create Appointment
```http
POST /appointments
Authorization: Bearer {token}
Content-Type: application/json

{
  "patientId": 1,
  "doctorId": 1,
  "appointmentDate": "2024-02-01",
  "appointmentTime": "10:00 AM",
  "reason": "Regular checkup",
  "notes": "Patient has fever"
}
```

### Get All Appointments
```http
GET /appointments?page=1&limit=10&status=SCHEDULED&doctorId=1&date=2024-02-01
Authorization: Bearer {token}
```

### Get Appointment by ID
```http
GET /appointments/1
Authorization: Bearer {token}
```

### Update Appointment
```http
PUT /appointments/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "appointmentDate": "2024-02-02",
  "appointmentTime": "11:00 AM",
  "status": "IN_PROGRESS"
}
```

### Cancel Appointment
```http
PATCH /appointments/1/cancel
Authorization: Bearer {token}
```

### Get Doctor's Appointments
```http
GET /appointments/doctor/my-appointments?page=1&limit=10&status=SCHEDULED
Authorization: Bearer {token}
```

---

## 💊 Prescriptions

### Create Prescription
```http
POST /prescriptions
Authorization: Bearer {token}
Content-Type: application/json

{
  "appointmentId": 1,
  "patientId": 1,
  "diagnosis": "Common Cold",
  "medicines": [
    {
      "name": "Paracetamol",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "5 days"
    },
    {
      "name": "Cough Syrup",
      "dosage": "10ml",
      "frequency": "Three times daily",
      "duration": "3 days"
    }
  ],
  "instructions": "Take medicine after meals. Drink plenty of water.",
  "followUpDate": "2024-02-10"
}
```

### Get All Prescriptions
```http
GET /prescriptions?page=1&limit=10&patientId=1&doctorId=1
Authorization: Bearer {token}
```

### Get Prescription by ID
```http
GET /prescriptions/1
Authorization: Bearer {token}
```

### Update Prescription
```http
PUT /prescriptions/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "diagnosis": "Updated diagnosis",
  "medicines": [...],
  "instructions": "Updated instructions"
}
```

### Get Doctor's Prescriptions
```http
GET /prescriptions/doctor/my-prescriptions?page=1&limit=10
Authorization: Bearer {token}
```

---

## 🧪 Lab Reports

### Create Lab Report Request
```http
POST /lab-reports
Authorization: Bearer {token}
Content-Type: application/json

{
  "patientId": 1,
  "testName": "Complete Blood Count",
  "testType": "Blood Test",
  "remarks": "Urgent test required"
}
```

### Get All Lab Reports
```http
GET /lab-reports?page=1&limit=10&status=PENDING&patientId=1&testType=Blood
Authorization: Bearer {token}
```

### Get Lab Report by ID
```http
GET /lab-reports/1
Authorization: Bearer {token}
```

### Update Lab Report
```http
PUT /lab-reports/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "COMPLETED",
  "results": "WBC: 8000, RBC: 5.2M, Hemoglobin: 14.5g/dL",
  "remarks": "All values within normal range",
  "reportDate": "2024-02-01"
}
```

### Delete Lab Report
```http
DELETE /lab-reports/1
Authorization: Bearer {token}
```

### Get Pending Lab Reports
```http
GET /lab-reports/pending?page=1&limit=10
Authorization: Bearer {token}
```

### Get Lab Staff's Reports
```http
GET /lab-reports/lab-staff/my-reports?page=1&limit=10&status=COMPLETED
Authorization: Bearer {token}
```

---

## 📊 Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Filters
- `search`: Search term for text fields
- `status`: Filter by status
- `role`: Filter by user role
- `date`: Filter by specific date
- `patientId`: Filter by patient ID
- `doctorId`: Filter by doctor ID
- `testType`: Filter by test type

### Example with Multiple Parameters
```http
GET /appointments?page=2&limit=20&status=SCHEDULED&doctorId=1&date=2024-02-01
```

---

## 🔒 Authorization Headers

All protected routes require JWT token:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 Response Format

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
  "error": "Detailed error information"
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

---

## 🎯 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
