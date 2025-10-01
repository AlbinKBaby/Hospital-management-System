const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword, generateToken, formatUserResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

// Register new user (Admin only can create users)
const register = async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName, phone, ...roleSpecificData } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with role-specific data
    const userData = {
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      phone
    };

    // Add role-specific relations
    if (role === 'DOCTOR') {
      userData.doctor = {
        create: {
          specialization: roleSpecificData.specialization,
          qualification: roleSpecificData.qualification,
          experience: roleSpecificData.experience || 0,
          consultationFee: roleSpecificData.consultationFee || 0
        }
      };
    } else if (role === 'RECEPTIONIST') {
      userData.receptionist = {
        create: {
          shift: roleSpecificData.shift || null
        }
      };
    } else if (role === 'LAB_STAFF') {
      userData.labStaff = {
        create: {
          department: roleSpecificData.department || null
        }
      };
    }

    const user = await prisma.user.create({
      data: userData,
      include: {
        doctor: true,
        receptionist: true,
        labStaff: true
      }
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: formatUserResponse(user),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        doctor: true,
        receptionist: true,
        labStaff: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: formatUserResponse(user),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        doctor: true,
        receptionist: true,
        labStaff: true
      }
    });

    res.status(200).json({
      success: true,
      data: formatUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

// Update profile
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        phone
      },
      include: {
        doctor: true,
        receptionist: true,
        labStaff: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: formatUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

// Change password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Logout user (client-side token invalidation)
const logout = async (req, res, next) => {
  try {
    // Note: JWT tokens are stateless, so logout is handled client-side by removing the token
    // This endpoint is provided for consistency and can be extended with token blacklisting if needed
    res.status(200).json({
      success: true,
      message: 'Logout successful. Please remove the token from client.'
    });
  } catch (error) {
    next(error);
  }
};

// Get current user (alias for getProfile - /auth/me endpoint)
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        doctor: true,
        receptionist: true,
        labStaff: true
      }
    });

    res.status(200).json({
      success: true,
      data: formatUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  getCurrentUser,
  updateProfile,
  changePassword
};
