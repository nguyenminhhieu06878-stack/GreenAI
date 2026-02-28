import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import Room from '../models/Room.model'
import User from '../models/User.model'
import MeterReading from '../models/MeterReading.model'
import { SubscriptionService } from '../services/subscription.service'

// Create a new room (landlord only)
export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { name, address, electricityRate } = req.body
    const landlordId = req.user?.id

    // Check if user is landlord
    const user = await User.findById(landlordId)
    if (user?.role !== 'landlord') {
      return res.status(403).json({ error: 'Only landlords can create rooms' })
    }

    // Check room limit based on subscription
    const canCreate = await SubscriptionService.canCreateRoom(landlordId!)
    if (!canCreate.allowed) {
      return res.status(400).json({ 
        error: canCreate.message,
        currentCount: canCreate.currentCount,
        maxRooms: canCreate.maxRooms
      })
    }

    const room = await Room.create({
      landlordId,
      name,
      address,
      electricityRate: electricityRate || 2500,
      status: 'active'
    })

    res.json({ 
      room,
      roomCount: canCreate.currentCount! + 1,
      maxRooms: canCreate.maxRooms
    })
  } catch (error) {
    console.error('Create room error:', error)
    res.status(500).json({ error: 'Failed to create room' })
  }
}

// Get all rooms (landlord sees all their rooms, tenant sees their room)
export const getRooms = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const user = await User.findById(userId)

    let rooms
    if (user?.role === 'landlord') {
      rooms = await Room.find({ landlordId: userId })
        .populate('tenantId', 'name email')
        .sort({ createdAt: -1 })
    } else {
      rooms = await Room.find({ tenantId: userId })
        .populate('landlordId', 'name email')
        .sort({ createdAt: -1 })
    }

    res.json({ rooms })
  } catch (error) {
    console.error('Get rooms error:', error)
    res.status(500).json({ error: 'Failed to get rooms' })
  }
}

// Get single room details
export const getRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    const user = await User.findById(userId)

    const room = await Room.findById(id)
      .populate('landlordId', 'name email')
      .populate('tenantId', 'name email')

    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }

    // Check permission
    const isAdmin = user?.role === 'admin'
    const isLandlord = room.landlordId._id.toString() === userId
    const isTenant = room.tenantId?._id.toString() === userId

    if (!isAdmin && !isLandlord && !isTenant) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Get meter readings for this room
    const readings = await MeterReading.find({ roomId: id })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(30)

    res.json({ room, readings, isLandlord, isTenant, isAdmin })
  } catch (error) {
    console.error('Get room error:', error)
    res.status(500).json({ error: 'Failed to get room' })
  }
}

// Update room (landlord only)
export const updateRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { name, address, electricityRate, status } = req.body
    const userId = req.user?.id

    const room = await Room.findById(id)
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }

    // Check if user is the landlord
    if (room.landlordId.toString() !== userId) {
      return res.status(403).json({ error: 'Only landlord can update room' })
    }

    if (name) room.name = name
    if (address) room.address = address
    if (electricityRate) room.electricityRate = electricityRate
    if (status) room.status = status

    await room.save()

    res.json({ room })
  } catch (error) {
    console.error('Update room error:', error)
    res.status(500).json({ error: 'Failed to update room' })
  }
}

// Assign tenant to room (landlord only)
export const assignTenant = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { tenantEmail } = req.body
    const userId = req.user?.id

    const room = await Room.findById(id)
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }

    // Check if user is the landlord
    if (room.landlordId.toString() !== userId) {
      return res.status(403).json({ error: 'Only landlord can assign tenant' })
    }

    // Find tenant by email
    const tenant = await User.findOne({ email: tenantEmail })
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' })
    }

    if (tenant.role !== 'tenant') {
      return res.status(400).json({ error: 'User is not a tenant' })
    }

    // Check if tenant is already assigned to another room
    const existingRoom = await Room.findOne({ tenantId: tenant._id })
    if (existingRoom) {
      return res.status(400).json({ error: 'Tenant is already assigned to another room' })
    }

    room.tenantId = tenant._id
    await room.save()

    const populatedRoom = await Room.findById(id)
      .populate('tenantId', 'name email')
      .populate('landlordId', 'name email')

    res.json({ room: populatedRoom })
  } catch (error) {
    console.error('Assign tenant error:', error)
    res.status(500).json({ error: 'Failed to assign tenant' })
  }
}

// Remove tenant from room (landlord only)
export const removeTenant = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const room = await Room.findById(id)
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }

    // Check if user is the landlord
    if (room.landlordId.toString() !== userId) {
      return res.status(403).json({ error: 'Only landlord can remove tenant' })
    }

    const tenantId = room.tenantId

    // Remove tenant from room
    room.tenantId = undefined
    await room.save()

    // Cancel tenant's subscription if they have one
    if (tenantId) {
      const Subscription = (await import('../models/Subscription.model')).default
      await Subscription.updateMany(
        { userId: tenantId, status: 'active' },
        { status: 'cancelled' }
      )
      
      // Reset user's subscription plan to free
      await User.findByIdAndUpdate(tenantId, {
        subscriptionPlan: 'Gói Miễn Phí',
        subscriptionEndDate: null
      })
      
      // Remove roomId from all readings of this tenant to make them personal readings
      await MeterReading.updateMany(
        { userId: tenantId, roomId: id },
        { $unset: { roomId: '' } }
      )
    }

    res.json({ room })
  } catch (error) {
    console.error('Remove tenant error:', error)
    res.status(500).json({ error: 'Failed to remove tenant' })
  }
}

// Delete room (landlord only)
export const deleteRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const room = await Room.findById(id)
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }

    // Check if user is the landlord
    if (room.landlordId.toString() !== userId) {
      return res.status(403).json({ error: 'Only landlord can delete room' })
    }

    await Room.findByIdAndDelete(id)

    res.json({ message: 'Room deleted successfully' })
  } catch (error) {
    console.error('Delete room error:', error)
    res.status(500).json({ error: 'Failed to delete room' })
  }
}
