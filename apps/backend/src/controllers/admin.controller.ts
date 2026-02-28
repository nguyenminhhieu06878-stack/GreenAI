import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import User from '../models/User.model.js'
import Room from '../models/Room.model.js'
import Subscription from '../models/Subscription.model.js'
import MeterReading from '../models/MeterReading.model.js'

// Get system statistics for dashboard
export const getSystemStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalLandlords = await User.countDocuments({ role: 'landlord' })
    const totalTenants = await User.countDocuments({ role: 'tenant' })
    const totalRooms = await Room.countDocuments()
    const occupiedRooms = await Room.countDocuments({ tenantId: { $ne: null } })

    // Subscription revenue (only source of revenue)
    const subscriptionStats = await Subscription.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$planPrice' },
          count: { $sum: 1 }
        }
      }
    ])

    const subscriptionRevenue = subscriptionStats[0]?.totalRevenue || 0

    // Recent subscriptions for activity feed (exclude pending)
    const recentSubscriptions = await Subscription.find({ status: { $ne: 'pending' } })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Monthly subscription stats
    const monthlyStats = await Subscription.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$planPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    res.json({
      users: {
        total: totalUsers,
        landlords: totalLandlords,
        tenants: totalTenants
      },
      rooms: {
        total: totalRooms,
        occupied: occupiedRooms,
        vacant: totalRooms - occupiedRooms
      },
      subscriptions: {
        active: subscriptionStats[0]?.count || 0,
        revenue: subscriptionRevenue
      },
      revenue: {
        total: subscriptionRevenue
      },
      recentActivities: recentSubscriptions,
      monthlyStats
    })
  } catch (error) {
    console.error('Get system stats error:', error)
    res.status(500).json({ error: 'Failed to get system statistics' })
  }
}

// Get all users
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query

    const query: any = {}
    if (role) query.role = role
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await User.countDocuments(query)

    res.json({
      users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    })
  } catch (error) {
    console.error('Get all users error:', error)
    res.status(500).json({ error: 'Failed to get users' })
  }
}

// Get all rooms
export const getAllRooms = async (req: AuthRequest, res: Response) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query

    const query: any = {}
    if (status) query.status = status
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ]
    }

    const rooms = await Room.find(query)
      .populate('landlordId', 'name email')
      .populate('tenantId', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await Room.countDocuments(query)

    res.json({
      rooms,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    })
  } catch (error) {
    console.error('Get all rooms error:', error)
    res.status(500).json({ error: 'Failed to get rooms' })
  }
}

// Delete user
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    if (id === req.user?.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' })
    }

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.role === 'landlord') {
      await Room.deleteMany({ landlordId: id })
    }

    if (user.role === 'tenant') {
      await Room.updateMany({ tenantId: id }, { $unset: { tenantId: 1 }, status: 'vacant' })
    }

    await User.findByIdAndDelete(id)

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ error: 'Failed to delete user' })
  }
}

// Update user role
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { role } = req.body

    if (!['tenant', 'landlord', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    if (id === req.user?.id) {
      return res.status(400).json({ error: 'Cannot change your own role' })
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user })
  } catch (error) {
    console.error('Update user role error:', error)
    res.status(500).json({ error: 'Failed to update user role' })
  }
}

// Get tenant readings
export const getTenantReadings = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.params

    const readings = await MeterReading.find({ userId: tenantId })
      .populate('roomId', 'name address')
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })

    res.json({ readings })
  } catch (error) {
    console.error('Get tenant readings error:', error)
    res.status(500).json({ error: 'Failed to get tenant readings' })
  }
}

// Get all vouchers
export const getAllVouchers = async (req: AuthRequest, res: Response) => {
  try {
    const Voucher = (await import('../models/Voucher.model')).default
    
    const vouchers = await Voucher.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })

    res.json({ vouchers })
  } catch (error) {
    console.error('Get all vouchers error:', error)
    res.status(500).json({ error: 'Failed to get vouchers' })
  }
}

// Delete voucher
export const deleteVoucher = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const Voucher = (await import('../models/Voucher.model')).default

    const voucher = await Voucher.findByIdAndDelete(id)
    
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' })
    }

    res.json({ message: 'Voucher deleted successfully' })
  } catch (error) {
    console.error('Delete voucher error:', error)
    res.status(500).json({ error: 'Failed to delete voucher' })
  }
}
