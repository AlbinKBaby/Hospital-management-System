const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Doctor, Receptionist, LabStaff } = require('../models');
const { connectDB, disconnectDB } = require('../config/database');

async function main() {
  console.log('🌱 Starting database seeding...');

  // Connect to database
  await connectDB();

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create Admin User
  let admin = await User.findOne({ email: 'admin@hospital.com' });
  if (!admin) {
    admin = await User.create({
      email: 'admin@hospital.com',
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'System',
      lastName: 'Administrator',
      phone: '1234567890',
      isActive: true
    });
    console.log('✅ Admin user created:', admin.email);
  } else {
    console.log('ℹ️  Admin user already exists:', admin.email);
  }

  // Create Sample Doctor
  const doctorPassword = await bcrypt.hash('doctor123', 10);
  let doctorUser = await User.findOne({ email: 'doctor@hospital.com' });
  if (!doctorUser) {
    doctorUser = await User.create({
      email: 'doctor@hospital.com',
      password: doctorPassword,
      role: 'DOCTOR',
      firstName: 'John',
      lastName: 'Smith',
      phone: '9876543210',
      isActive: true
    });

    await Doctor.create({
      userId: doctorUser._id,
      specialization: 'Cardiology',
      qualification: 'MD, DM Cardiology',
      experience: 10,
      consultationFee: 500
    });
    console.log('✅ Doctor user created:', doctorUser.email);
  } else {
    console.log('ℹ️  Doctor user already exists:', doctorUser.email);
  }

  // Create Sample Receptionist
  const receptionistPassword = await bcrypt.hash('receptionist123', 10);
  let receptionistUser = await User.findOne({ email: 'receptionist@hospital.com' });
  if (!receptionistUser) {
    receptionistUser = await User.create({
      email: 'receptionist@hospital.com',
      password: receptionistPassword,
      role: 'RECEPTIONIST',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '9876543211',
      isActive: true
    });

    await Receptionist.create({
      userId: receptionistUser._id,
      shift: 'Morning'
    });
    console.log('✅ Receptionist user created:', receptionistUser.email);
  } else {
    console.log('ℹ️  Receptionist user already exists:', receptionistUser.email);
  }

  // Create Sample Lab Staff
  const labStaffPassword = await bcrypt.hash('labstaff123', 10);
  let labStaffUser = await User.findOne({ email: 'labstaff@hospital.com' });
  if (!labStaffUser) {
    labStaffUser = await User.create({
      email: 'labstaff@hospital.com',
      password: labStaffPassword,
      role: 'LAB_STAFF',
      firstName: 'Michael',
      lastName: 'Brown',
      phone: '9876543212',
      isActive: true
    });

    await LabStaff.create({
      userId: labStaffUser._id,
      department: 'Pathology'
    });
    console.log('✅ Lab staff user created:', labStaffUser.email);
  } else {
    console.log('ℹ️  Lab staff user already exists:', labStaffUser.email);
  }

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
    await disconnectDB();
    process.exit(0);
  });
