import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import OCRTraining from '../models/OCRTraining.model.js'

export const getTrainingData = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 100 } = req.query
    
    const trainingData = await OCRTraining.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))

    const stats = {
      total: await OCRTraining.countDocuments(),
      avgAccuracy: 0
    }

    // Calculate average accuracy
    if (trainingData.length > 0) {
      const correctCount = trainingData.filter(d => d.ocrResult === d.correctValue).length
      stats.avgAccuracy = (correctCount / trainingData.length) * 100
    }

    res.json({ 
      trainingData,
      stats
    })
  } catch (error) {
    console.error('Get training data error:', error)
    res.status(500).json({ error: 'Failed to get training data' })
  }
}

export const getTrainingStats = async (req: AuthRequest, res: Response) => {
  try {
    const total = await OCRTraining.countDocuments()
    const data = await OCRTraining.find()

    let correct = 0
    let totalConfidence = 0

    data.forEach(d => {
      if (d.ocrResult === d.correctValue) {
        correct++
      }
      totalConfidence += d.confidence
    })

    const accuracy = total > 0 ? (correct / total) * 100 : 0
    const avgConfidence = total > 0 ? totalConfidence / total : 0

    res.json({
      total,
      correct,
      incorrect: total - correct,
      accuracy: accuracy.toFixed(2),
      avgConfidence: avgConfidence.toFixed(2)
    })
  } catch (error) {
    console.error('Get training stats error:', error)
    res.status(500).json({ error: 'Failed to get training stats' })
  }
}
