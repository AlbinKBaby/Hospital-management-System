const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hospital.com' },
    update: {},
    create: {
      email: 'admin@hospital.com',
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'System',
      lastName: 'Administrator',
      phone: '1234567890',
      isActive: true
    }
  });
  console.log('✅ Admin user created:', admin.email);

  // Create Sample Doctor
  const doctorPassword = await bcrypt.hash('doctor123', 10);
  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@hospital.com' },
    update: {},
    create: {
      email: 'doctor@hospital.com',
      password: doctorPassword,
      role: 'DOCTOR',
      firstName: 'John',
      lastName: 'Smith',
      phone: '9876543210',
      isActive: true,
      doctor: {
        create: {
          specialization: 'Cardiology',
          qualification: 'MD, DM Cardiology',
          experience: 10,
          consultationFee: 500
        }
      }
    }
  });
  console.log('✅ Doctor user created:', doctorUser.email);

  // Create Sample Receptionist
  const receptionistPassword = await bcrypt.hash('receptionist123', 10);
  const receptionistUser = await prisma.user.upsert({
    where: { email: 'receptionist@hospital.com' },
    update: {},
    create: {
      email: 'receptionist@hospital.com',
      password: receptionistPassword,
      role: 'RECEPTIONIST',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '9876543211',
      isActive: true,
      receptionist: {
        create: {
          shift: 'Morning'
        }
      }
    }
  });
  console.log('✅ Receptionist user created:', receptionistUser.email);

  // Create Sample Lab Staff
  const labStaffPassword = await bcrypt.hash('labstaff123', 10);
  const labStaffUser = await prisma.user.upsert({
    where: { email: 'labstaff@hospital.com' },
    update: {},
    create: {
      email: 'labstaff@hospital.com',
      password: labStaffPassword,
      role: 'LAB_STAFF',
      firstName: 'Michael',
      lastName: 'Brown',
      phone: '9876543212',
      isActive: true,
      labStaff: {
        create: {
          department: 'Pathology'
        }
      }
    }
  });
  console.log('✅ Lab staff user created:', labStaffUser.email);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📋 Default Login Credentials:');
  console.log('================================');
  console.log('Admin:');
  console.log('  Email: admin@hospital.com');
  console.log('  Password: admin123');
  console.log('\nDoctor:');
  console.log('  Email: doctor@hospital.com');
  console.log('  Password: doctor123');
  console.log('\nReceptionist:');
  console.log('  Email: receptionist@hospital.com');
  console.log('  Password: receptionist123');
  console.log('\nLab Staff:');
  console.log('  Email: labstaff@hospital.com');
  console.log('  Password: labstaff123');
  console.log('================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
