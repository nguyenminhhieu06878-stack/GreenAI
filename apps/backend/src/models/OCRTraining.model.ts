import mongoose from 'mongoose'

const ocrTrainingSchema = new mongoose.Schema({
  imagePath: {
    type: String,
    required: true
  },
  ocrResult: {
    type: Number,
    required: true
  },
  correctValue: {
    type: Number,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  rawText: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('OCRTraining', ocrTrainingSchema)
