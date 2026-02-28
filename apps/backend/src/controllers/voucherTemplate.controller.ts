import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import VoucherTemplate from '../models/VoucherTemplate.model'
import Voucher from '../models/Voucher.model'

// Get all voucher templates
export const getAllTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const templates = await VoucherTemplate.find().sort({ createdAt: -1 })
    res.json({ templates })
  } catch (error) {
    console.error('Get templates error:', error)
    res.status(500).json({ error: 'Failed to get voucher templates' })
  }
}

// Create voucher template
export const createTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, value, type, quantity, probability, validFrom, validUntil } = req.body

    const template = await VoucherTemplate.create({
      name,
      description,
      value,
      type,
      quantity,
      remaining: quantity, // Initially, remaining = quantity
      probability,
      validFrom,
      validUntil,
      isActive: true
    })

    res.status(201).json({ template })
  } catch (error) {
    console.error('Create template error:', error)
    res.status(500).json({ error: 'Failed to create voucher template' })
  }
}

// Update voucher template
export const updateTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { name, description, value, type, quantity, probability, isActive, validFrom, validUntil } = req.body

    const template = await VoucherTemplate.findById(id)
    if (!template) {
      return res.status(404).json({ error: 'Template not found' })
    }

    // Update fields
    if (name !== undefined) template.name = name
    if (description !== undefined) template.description = description
    if (value !== undefined) template.value = value
    if (type !== undefined) template.type = type
    if (probability !== undefined) template.probability = probability
    if (isActive !== undefined) template.isActive = isActive
    if (validFrom !== undefined) template.validFrom = validFrom
    if (validUntil !== undefined) template.validUntil = validUntil

    // If quantity is updated, adjust remaining proportionally
    if (quantity !== undefined && quantity !== template.quantity) {
      const diff = quantity - template.quantity
      template.quantity = quantity
      template.remaining = Math.max(0, template.remaining + diff)
    }

    await template.save()

    res.json({ template })
  } catch (error) {
    console.error('Update template error:', error)
    res.status(500).json({ error: 'Failed to update voucher template' })
  }
}

// Delete voucher template
export const deleteTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const template = await VoucherTemplate.findByIdAndDelete(id)
    if (!template) {
      return res.status(404).json({ error: 'Template not found' })
    }

    res.json({ message: 'Template deleted successfully' })
  } catch (error) {
    console.error('Delete template error:', error)
    res.status(500).json({ error: 'Failed to delete voucher template' })
  }
}

// Random voucher for user
export const randomVoucher = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id

    // Get all active templates with remaining quantity
    const templates = await VoucherTemplate.find({
      isActive: true,
      remaining: { $gt: 0 }
    })

    if (templates.length === 0) {
      return res.status(400).json({ error: 'Không còn voucher nào khả dụng' })
    }

    // Check validity dates
    const now = new Date()
    const validTemplates = templates.filter(t => {
      if (t.validFrom && t.validFrom > now) return false
      if (t.validUntil && t.validUntil < now) return false
      return true
    })

    if (validTemplates.length === 0) {
      return res.status(400).json({ error: 'Không có voucher hợp lệ' })
    }

    // Weighted random selection based on probability
    const totalProbability = validTemplates.reduce((sum, t) => sum + t.probability, 0)
    let random = Math.random() * totalProbability
    
    let selectedTemplate = validTemplates[0]
    for (const template of validTemplates) {
      random -= template.probability
      if (random <= 0) {
        selectedTemplate = template
        break
      }
    }

    // Generate unique voucher code
    const code = `VC${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    // Create voucher for user
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // Valid for 30 days

    const voucher = await Voucher.create({
      userId,
      templateId: selectedTemplate._id,
      code,
      value: selectedTemplate.value,
      type: 'random',
      isUsed: false,
      expiresAt
    })

    // Decrease remaining quantity
    selectedTemplate.remaining -= 1
    await selectedTemplate.save()

    res.json({
      voucher: {
        code: voucher.code,
        value: voucher.value,
        expiresAt: voucher.expiresAt
      },
      template: {
        name: selectedTemplate.name,
        description: selectedTemplate.description
      }
    })
  } catch (error) {
    console.error('Random voucher error:', error)
    res.status(500).json({ error: 'Failed to generate voucher' })
  }
}

// Get voucher statistics
export const getVoucherStats = async (req: AuthRequest, res: Response) => {
  try {
    const templates = await VoucherTemplate.find()
    const vouchers = await Voucher.find()

    const stats = {
      totalTemplates: templates.length,
      activeTemplates: templates.filter(t => t.isActive).length,
      totalQuantity: templates.reduce((sum, t) => sum + t.quantity, 0),
      remainingQuantity: templates.reduce((sum, t) => sum + t.remaining, 0),
      distributedVouchers: vouchers.length,
      usedVouchers: vouchers.filter(v => v.isUsed).length,
      unusedVouchers: vouchers.filter(v => !v.isUsed).length
    }

    res.json({ stats })
  } catch (error) {
    console.error('Get voucher stats error:', error)
    res.status(500).json({ error: 'Failed to get voucher statistics' })
  }
}
