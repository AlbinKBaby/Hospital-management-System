# Quick Setup Guide

## Step-by-Step Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your settings:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/hospital_management_system"
PORT=5000
JWT_SECRET=your_super_secret_key_here
```

### 3. Setup MySQL Database

Open MySQL and create the database:

```sql
CREATE DATABASE hospital_management_system;
```

### 4. Run Prisma Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

### 5. Seed Initial Data (Optional but Recommended)

```bash
node prisma/seed.js
```

This creates default users:
- **Admin**: admin@hospital.com / admin123
- **Doctor**: doctor@hospital.com / doctor123
- **Receptionist**: receptionist@hospital.com / receptionist123
- **Lab Staff**: labstaff@hospital.com / labstaff123

### 6. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on: `http://localhost:5000`

## Testing the API

### 1. Health Check

```bash
curl http://localhost:5000
```

### 2. Login as Admin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "password": "admin123"
  }'
```

Copy the `token` from the response.

### 3. Get Profile (Protected Route)

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Create a Patient (as Receptionist)

First login as receptionist, then:

```bash
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com",
    "phone": "9876543210",
    "dateOfBirth": "1990-05-15",
    "gender": "FEMALE",
    "address": "123 Main St, City",
    "bloodGroup": "O+"
  }'
```

## Common Issues

### Issue: Database connection failed

**Solution**: 
- Check MySQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

### Issue: Prisma Client not found

**Solution**:
```bash
npx prisma generate
```

### Issue: Port already in use

**Solution**: Change PORT in .env or kill the process using port 5000

### Issue: JWT token errors

**Solution**: Ensure JWT_SECRET is set in .env file

## Useful Commands

```bash
# View database in browser
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Check Prisma schema
npx prisma validate

# Format Prisma schema
npx prisma format
```

## Next Steps

1. Test all API endpoints using Postman or Thunder Client
2. Integrate with frontend application
3. Configure production environment variables
4. Set up proper logging and monitoring
5. Implement rate limiting for production

## Support

For detailed API documentation, see [README.md](README.md)
