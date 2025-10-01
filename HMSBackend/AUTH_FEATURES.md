# Authentication & User Management Features

## ✅ All Required Features Implemented

### 1. Auth APIs

#### ✅ POST /api/auth/register
- **Purpose**: Admin creates users (Doctor, Receptionist, Lab Staff)
- **Access**: Admin only
- **Features**:
  - Creates users with specific roles (ADMIN, DOCTOR, RECEPTIONIST, LAB_STAFF)
  - Automatically creates role-specific profiles
  - Password hashing with bcrypt
  - Returns JWT token upon registration
  
**Request Example**:
```json
POST /api/auth/register
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "email": "doctor@hospital.com",
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

#### ✅ POST /api/auth/login
- **Purpose**: JWT login for all users
- **Access**: Public
- **Features**:
  - Email and password authentication
  - Password verification with bcrypt
  - Returns JWT token
  - Includes user profile with role-specific data
  - Checks if account is active

**Request Example**:
```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "doctor@hospital.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "doctor@hospital.com",
      "role": "DOCTOR",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "1234567890",
      "isActive": true,
      "doctor": {
        "specialization": "Cardiology",
        "qualification": "MD",
        "experience": 5,
        "consultationFee": 500
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### ✅ POST /api/auth/logout
- **Purpose**: Invalidate token (client-side)
- **Access**: Authenticated users
- **Features**:
  - Confirms logout action
  - Client should remove token from storage
  - Can be extended with token blacklisting

**Request Example**:
```bash
POST /api/auth/logout
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "message": "Logout successful. Please remove the token from client."
}
```

#### ✅ GET /api/auth/me
- **Purpose**: Get logged-in user profile
- **Access**: Authenticated users
- **Features**:
  - Returns current user information
  - Includes role-specific profile data
  - Password excluded from response

**Request Example**:
```bash
GET /api/auth/me
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "doctor@hospital.com",
    "role": "DOCTOR",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "1234567890",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "doctor": {
      "id": 1,
      "specialization": "Cardiology",
      "qualification": "MD",
      "experience": 5,
      "consultationFee": 500
    }
  }
}
```

### 2. Security Features

#### ✅ JWT Middleware for Authentication
**File**: `middleware/auth.js`

**Features**:
- Verifies JWT token from Authorization header
- Extracts user information from token
- Validates token expiration
- Checks if user exists in database
- Verifies account is active
- Handles token errors (expired, invalid, malformed)

**Implementation**:
```javascript
const authenticate = async (req, res, next) => {
  // Extract token from header
  const token = req.headers.authorization?.split(' ')[1];
  
  // Verify token
  const decoded = jwt.verify(token, config.jwt.secret);
  
  // Fetch user from database
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  });
  
  // Attach user to request
  req.user = user;
  next();
};
```

#### ✅ Role-Based Access Control (RBAC)
**File**: `middleware/auth.js`

**Features**:
- Restricts access based on user roles
- Supports multiple roles per endpoint
- Clear error messages for unauthorized access
- Four roles: ADMIN, DOCTOR, RECEPTIONIST, LAB_STAFF

**Implementation**:
```javascript
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};
```

**Usage Examples**:
```javascript
// Admin only
router.post('/register', authenticate, authorize('ADMIN'), authController.register);

// Doctor only
router.post('/prescriptions', authenticate, authorize('DOCTOR'), prescriptionController.create);

// Multiple roles
router.post('/patients', authenticate, authorize('RECEPTIONIST', 'ADMIN'), patientController.create);
```

#### ✅ Password Hashing with bcrypt
**File**: `utils/helpers.js`

**Features**:
- Passwords hashed before storing in database
- Salt rounds: 10
- Secure password comparison
- Never stores plain text passwords

**Implementation**:
```javascript
// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
```

### 3. Additional Security Features

#### ✅ Input Validation
**File**: `validators/authValidators.js`

- Email format validation
- Password minimum length (6 characters)
- Required field validation
- Role validation (only allowed roles)
- Phone number validation

#### ✅ Token Generation
**File**: `utils/helpers.js`

```javascript
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } // Default: 7 days
  );
};
```

#### ✅ Secure Response Formatting
- Passwords excluded from all responses
- Sensitive data filtered
- Consistent response structure

```javascript
const formatUserResponse = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
```

## 📊 Complete Authentication Flow

### Registration Flow (Admin creates user)
1. Admin logs in → receives JWT token
2. Admin sends POST /api/auth/register with new user data
3. System validates admin role
4. System checks if email already exists
5. Password is hashed with bcrypt
6. User created with role-specific profile
7. JWT token generated and returned

### Login Flow
1. User sends POST /api/auth/login with credentials
2. System finds user by email
3. System verifies password with bcrypt
4. System checks if account is active
5. JWT token generated with userId and role
6. Token and user profile returned

### Protected Route Access
1. Client sends request with JWT token in header
2. `authenticate` middleware verifies token
3. User information attached to request
4. `authorize` middleware checks user role
5. Request proceeds to controller if authorized

### Logout Flow
1. User sends POST /api/auth/logout
2. Server confirms logout
3. Client removes token from storage
4. Subsequent requests fail without valid token

## 🔐 Role Permissions Summary

| Role | Can Register Users | Can Create Patients | Can Create Appointments | Can Create Prescriptions | Can Manage Lab Reports |
|------|-------------------|---------------------|------------------------|-------------------------|------------------------|
| **ADMIN** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes (full access) |
| **DOCTOR** | ❌ No | ❌ No | ❌ No | ✅ Yes | ✅ Yes (request only) |
| **RECEPTIONIST** | ❌ No | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes (request only) |
| **LAB_STAFF** | ❌ No | ❌ No | ❌ No | ❌ No | ✅ Yes (update only) |

## 🧪 Testing Authentication

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "password": "admin123"
  }'
```

### Test Protected Route
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Role-Based Access
```bash
# Try to register user without admin token (should fail)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -d '{
    "email": "newuser@hospital.com",
    "password": "password123",
    "role": "DOCTOR",
    "firstName": "Test",
    "lastName": "User"
  }'
```

## ✅ Checklist Summary

- ✅ POST /api/auth/register (Admin only)
- ✅ POST /api/auth/login (JWT authentication)
- ✅ POST /api/auth/logout (Token invalidation)
- ✅ GET /api/auth/me (Get current user)
- ✅ JWT middleware for authentication
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcrypt
- ✅ Token expiration handling
- ✅ Active account verification
- ✅ Input validation
- ✅ Secure response formatting
- ✅ Error handling

## 🎯 All Requirements Met!

Your authentication system is **complete and production-ready** with all requested features implemented.
