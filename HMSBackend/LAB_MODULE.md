# Lab Module - Complete Features

## ✅ All Required Features Implemented

### 1. Lab Report APIs

#### ✅ POST /api/lab-reports
**Purpose**: Create lab report request  
**Access**: Receptionist, Doctor, Admin  
**Features**:
- Create new lab test request
- Assign to patient
- Set initial status as PENDING
- Add remarks/notes

**Request Example**:
```json
POST /api/lab-reports
Authorization: Bearer {token}
Content-Type: application/json

{
  "patientId": 1,
  "testName": "Complete Blood Count (CBC)",
  "testType": "Blood Test",
  "remarks": "Urgent test required for diagnosis"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Lab report requested successfully",
  "data": {
    "id": 1,
    "patientId": 1,
    "testName": "Complete Blood Count (CBC)",
    "testType": "Blood Test",
    "status": "PENDING",
    "results": null,
    "fileUrl": null,
    "fileName": null,
    "remarks": "Urgent test required for diagnosis",
    "conductedBy": null,
    "reportDate": null,
    "createdAt": "2024-02-01T10:00:00.000Z",
    "patient": {
      "id": 1,
      "firstName": "John",
      "lastName": "Smith",
      "email": "john@example.com"
    }
  }
}
```

---

#### ✅ POST /api/lab-reports/:id/upload
**Purpose**: Upload lab report file to AWS S3  
**Access**: Lab Staff, Admin  
**Features**:
- Upload PDF, images, or document files
- Automatic upload to AWS S3
- File size limit: 10MB
- Supported formats: PDF, JPG, JPEG, PNG, DOC, DOCX, XLS, XLSX
- Automatically marks report as COMPLETED
- Assigns lab staff to report

**Request Example**:
```bash
POST /api/lab-reports/1/upload
Authorization: Bearer {lab_staff_token}
Content-Type: multipart/form-data

file: [binary file data]
```

**Using cURL**:
```bash
curl -X POST http://localhost:5000/api/lab-reports/1/upload \
  -H "Authorization: Bearer LAB_STAFF_TOKEN" \
  -F "file=@/path/to/lab-report.pdf"
```

**Response**:
```json
{
  "success": true,
  "message": "Lab report file uploaded successfully",
  "data": {
    "id": 1,
    "patientId": 1,
    "testName": "Complete Blood Count (CBC)",
    "testType": "Blood Test",
    "status": "COMPLETED",
    "results": null,
    "fileUrl": "https://your-bucket.s3.amazonaws.com/lab-reports/1704447600000-lab-report.pdf",
    "fileName": "lab-report.pdf",
    "remarks": "Urgent test required for diagnosis",
    "conductedBy": 1,
    "reportDate": "2024-02-01T14:30:00.000Z",
    "createdAt": "2024-02-01T10:00:00.000Z",
    "updatedAt": "2024-02-01T14:30:00.000Z",
    "patient": {
      "id": 1,
      "firstName": "John",
      "lastName": "Smith"
    },
    "labStaff": {
      "id": 1,
      "department": "Pathology",
      "user": {
        "firstName": "Michael",
        "lastName": "Brown"
      }
    }
  }
}
```

---

#### ✅ GET /api/lab-reports/:id
**Purpose**: Fetch single lab report  
**Access**: All authenticated users  
**Features**:
- Complete report details
- Patient information
- Lab staff information
- File URL if uploaded
- Test results

**Request Example**:
```bash
GET /api/lab-reports/1
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "patientId": 1,
    "testName": "Complete Blood Count (CBC)",
    "testType": "Blood Test",
    "status": "COMPLETED",
    "results": "WBC: 7500/μL (Normal)\nRBC: 5.2M/μL (Normal)\nHemoglobin: 14.5 g/dL (Normal)",
    "fileUrl": "https://your-bucket.s3.amazonaws.com/lab-reports/1704447600000-lab-report.pdf",
    "fileName": "lab-report.pdf",
    "remarks": "All values within normal range",
    "conductedBy": 1,
    "reportDate": "2024-02-01T14:30:00.000Z",
    "createdAt": "2024-02-01T10:00:00.000Z",
    "updatedAt": "2024-02-01T14:30:00.000Z",
    "patient": {
      "id": 1,
      "firstName": "John",
      "lastName": "Smith",
      "email": "john@example.com",
      "phone": "9876543210"
    },
    "labStaff": {
      "id": 1,
      "department": "Pathology",
      "user": {
        "firstName": "Michael",
        "lastName": "Brown",
        "email": "labstaff@hospital.com",
        "phone": "9876543212"
      }
    }
  }
}
```

---

#### ✅ GET /api/lab-reports/:id/download
**Purpose**: Generate presigned URL for downloading lab report file  
**Access**: All authenticated users  
**Features**:
- Generates secure presigned URL
- URL valid for 1 hour
- No direct S3 access required
- Works with private S3 buckets

**Request Example**:
```bash
GET /api/lab-reports/1/download
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "message": "Download URL generated successfully",
  "data": {
    "downloadUrl": "https://your-bucket.s3.amazonaws.com/lab-reports/1704447600000-lab-report.pdf?AWSAccessKeyId=...&Signature=...&Expires=...",
    "fileName": "lab-report.pdf",
    "expiresIn": 3600
  }
}
```

**Usage**: Use the `downloadUrl` to download the file directly in browser or application.

---

#### ✅ GET /api/lab-reports
**Purpose**: List/search/filter lab reports  
**Access**: All authenticated users  
**Features**:
- Pagination support
- Filter by status (PENDING, IN_PROGRESS, COMPLETED)
- Filter by patient ID
- Filter by test type
- Search functionality
- Ordered by creation date (newest first)

**Request Examples**:
```bash
# Get all lab reports (paginated)
GET /api/lab-reports?page=1&limit=10

# Filter by status
GET /api/lab-reports?status=PENDING

# Filter by patient
GET /api/lab-reports?patientId=1

# Filter by test type
GET /api/lab-reports?testType=Blood

# Combined filters
GET /api/lab-reports?status=COMPLETED&patientId=1&testType=Blood&page=1&limit=20
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "patientId": 1,
      "testName": "Complete Blood Count (CBC)",
      "testType": "Blood Test",
      "status": "COMPLETED",
      "results": "WBC: 7500/μL (Normal)...",
      "fileUrl": "https://your-bucket.s3.amazonaws.com/lab-reports/...",
      "fileName": "lab-report.pdf",
      "reportDate": "2024-02-01T14:30:00.000Z",
      "patient": {
        "id": 1,
        "firstName": "John",
        "lastName": "Smith",
        "phone": "9876543210"
      },
      "labStaff": {
        "id": 1,
        "user": {
          "firstName": "Michael",
          "lastName": "Brown",
          "email": "labstaff@hospital.com"
        }
      }
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

#### ✅ DELETE /api/lab-reports/:id
**Purpose**: Delete lab report  
**Access**: Admin only  
**Features**:
- Permanently removes lab report from database
- Admin-only access for data integrity

**Request Example**:
```bash
DELETE /api/lab-reports/1
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "success": true,
  "message": "Lab report deleted successfully"
}
```

---

### 2. Additional Lab Staff Features

#### GET /api/lab-reports/pending
**Purpose**: Get all pending lab reports  
**Access**: Lab Staff, Admin  
**Features**:
- Shows only PENDING reports
- Ordered by creation date (oldest first)
- Pagination support

**Request Example**:
```bash
GET /api/lab-reports/pending?page=1&limit=10
Authorization: Bearer {lab_staff_token}
```

---

#### GET /api/lab-reports/lab-staff/my-reports
**Purpose**: Get lab staff's assigned reports  
**Access**: Lab Staff only  
**Features**:
- Shows only reports conducted by logged-in lab staff
- Filter by status
- Pagination support

**Request Example**:
```bash
GET /api/lab-reports/lab-staff/my-reports?status=COMPLETED&page=1&limit=10
Authorization: Bearer {lab_staff_token}
```

---

#### PUT /api/lab-reports/:id
**Purpose**: Update lab report (with optional file upload)  
**Access**: Lab Staff, Admin  
**Features**:
- Update status, results, remarks
- Optional file upload
- Automatic lab staff assignment
- Set report date

**Request Example (with file)**:
```bash
PUT /api/lab-reports/1
Authorization: Bearer {lab_staff_token}
Content-Type: multipart/form-data

status: COMPLETED
results: All values normal
remarks: No abnormalities detected
reportDate: 2024-02-01
file: [binary file data]
```

**Request Example (without file)**:
```json
PUT /api/lab-reports/1
Authorization: Bearer {lab_staff_token}
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "remarks": "Test in progress, results pending"
}
```

---

## 📊 Database Schema Updates

### LabReport Model (Updated)
```prisma
model LabReport {
  id          Int             @id @default(autoincrement())
  patientId   Int
  testName    String
  testType    String
  status      LabReportStatus @default(PENDING)
  results     String?         @db.Text
  fileUrl     String?         // NEW: AWS S3 file URL
  fileName    String?         // NEW: Original file name
  remarks     String?         @db.Text
  conductedBy Int?
  reportDate  DateTime?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  patient  Patient   @relation(fields: [patientId], references: [id], onDelete: Cascade)
  labStaff LabStaff? @relation(fields: [conductedBy], references: [id])

  @@map("lab_reports")
}
```

---

## 🔧 AWS S3 Configuration

### Environment Variables Required
```env
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-hospital-bucket-name
```

### AWS S3 Setup Steps

1. **Create S3 Bucket**:
   - Go to AWS S3 Console
   - Create new bucket (e.g., `hospital-lab-reports`)
   - Choose region (e.g., `us-east-1`)
   - Block public access (recommended for security)

2. **Create IAM User**:
   - Go to AWS IAM Console
   - Create new user with programmatic access
   - Attach policy: `AmazonS3FullAccess` (or custom policy)
   - Save Access Key ID and Secret Access Key

3. **S3 Bucket Policy** (if using private bucket):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/YOUR_IAM_USER"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-hospital-bucket-name/*"
    }
  ]
}
```

4. **Configure CORS** (if accessing from frontend):
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": []
  }
]
```

---

## 🧪 Testing Examples

### Test Create Lab Report
```bash
curl -X POST http://localhost:5000/api/lab-reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer RECEPTIONIST_TOKEN" \
  -d '{
    "patientId": 1,
    "testName": "Blood Sugar Test",
    "testType": "Blood Test",
    "remarks": "Fasting test required"
  }'
```

### Test Upload Lab Report File
```bash
curl -X POST http://localhost:5000/api/lab-reports/1/upload \
  -H "Authorization: Bearer LAB_STAFF_TOKEN" \
  -F "file=@/path/to/report.pdf"
```

### Test Get Lab Report
```bash
curl -X GET http://localhost:5000/api/lab-reports/1 \
  -H "Authorization: Bearer TOKEN"
```

### Test Download Lab Report
```bash
curl -X GET http://localhost:5000/api/lab-reports/1/download \
  -H "Authorization: Bearer TOKEN"
```

### Test List Lab Reports with Filters
```bash
curl -X GET "http://localhost:5000/api/lab-reports?status=COMPLETED&testType=Blood&page=1&limit=10" \
  -H "Authorization: Bearer TOKEN"
```

### Test Delete Lab Report
```bash
curl -X DELETE http://localhost:5000/api/lab-reports/1 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🔐 Security Features

### File Upload Security
- File type validation (only allowed formats)
- File size limit (10MB)
- Secure S3 upload with private ACL
- Presigned URLs for secure downloads
- URL expiration (1 hour)

### Access Control
- Role-based permissions
- Lab staff can only update reports
- Admin can delete reports
- All authenticated users can view reports

### Data Protection
- Files stored in private S3 bucket
- Temporary presigned URLs for downloads
- AWS credentials stored in environment variables
- No direct S3 access from frontend

---

## 📦 Dependencies Added

```json
{
  "dependencies": {
    "aws-sdk": "^2.1498.0",
    "multer": "^1.4.5-lts.1"
  }
}
```

---

## ✅ Checklist Summary

### Lab Report APIs
- ✅ POST /api/lab-reports - Create lab report request
- ✅ POST /api/lab-reports/:id/upload - Upload lab report file to AWS S3
- ✅ GET /api/lab-reports/:id - Fetch single report
- ✅ GET /api/lab-reports/:id/download - Generate download URL
- ✅ GET /api/lab-reports - List/search/filter reports
- ✅ DELETE /api/lab-reports/:id - Delete report

### Additional Features
- ✅ GET /api/lab-reports/pending - Get pending reports
- ✅ GET /api/lab-reports/lab-staff/my-reports - Get lab staff's reports
- ✅ PUT /api/lab-reports/:id - Update report (with optional file upload)

### AWS S3 Integration
- ✅ File upload to S3
- ✅ Presigned URL generation
- ✅ File deletion from S3
- ✅ Secure file storage
- ✅ Multiple file format support

---

## 🎯 All Lab Module Requirements Met!

Your Lab Module is **complete and production-ready** with all requested features fully implemented, including:
- Complete lab report management
- AWS S3 file upload integration
- Secure file download with presigned URLs
- List/search/filter functionality
- Role-based access control
- File type and size validation
- Pagination support
- Full CRUD operations
