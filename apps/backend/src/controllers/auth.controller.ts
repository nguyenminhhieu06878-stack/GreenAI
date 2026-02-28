import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import passport from 'passport'
import { AuthRequest } from '../middleware/auth'
import { config } from '../config'
import User from '../models/User.model'

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Set default subscription plan based on role
    let defaultPlan: string;
    let subscriptionExpiry: Date | null;
    
    if (role === 'landlord') {
      // Landlord gets free plan forever (no expiry)
      defaultPlan = 'Gói Miễn Phí (Chủ Trọ)';
      subscriptionExpiry = null;
    } else {
      // Tenant gets free 2 months of "Gói Cơ Bản" (29k plan)
      defaultPlan = 'Gói Cơ Bản';
      subscriptionExpiry = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days = 2 months
    }
    
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: role || 'tenant',
      subscriptionPlan: defaultPlan,
      subscriptionExpiry
    })

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: 604800 } // 7 days in seconds
    )

    res.status(201).json({
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionExpiry: user.subscriptionExpiry
      },
      token
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: 604800 } // 7 days in seconds
    )

    res.json({
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionExpiry: user.subscriptionExpiry
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
}

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionExpiry: user.subscriptionExpiry,
      billingDate: user.billingDate || 1,
      monthlyGoal: user.monthlyGoal || 0,
      electricityRate: user.electricityRate || 3000,
      isNewUser: user.isNewUser || false
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Failed to get profile' })
  }
}

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, billingDate, monthlyGoal, electricityRate } = req.body

    const user = await User.findById(req.user?.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (name) user.name = name
    if (billingDate !== undefined) user.billingDate = billingDate
    if (monthlyGoal !== undefined) user.monthlyGoal = monthlyGoal
    if (electricityRate !== undefined) user.electricityRate = electricityRate

    await user.save()

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      billingDate: user.billingDate,
      monthlyGoal: user.monthlyGoal,
      electricityRate: user.electricityRate
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
}

// Update user role (for new Google OAuth users)
export const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!['tenant', 'landlord'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Update role and subscription plan
    user.role = role
    user.isNewUser = false
    
    if (role === 'landlord') {
      user.subscriptionPlan = 'Gói Miễn Phí (Chủ Trọ)';
      user.subscriptionExpiry = null; // No expiry for landlord free plan
    } else {
      user.subscriptionPlan = 'Gói Cơ Bản';
      user.subscriptionExpiry = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days for tenant
    }

    await user.save()

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionExpiry: user.subscriptionExpiry,
      isNewUser: user.isNewUser
    })
  } catch (error) {
    console.error('Update role error:', error)
    res.status(500).json({ error: 'Failed to update role' })
  }
}

// Google OAuth callback
export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}/dang-nhap?error=auth_failed`);
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: 604800 } // 7 days in seconds
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}/dang-nhap?error=auth_failed`);
  }
};
