import Tesseract from 'tesseract.js'
import path from 'path'
import fs from 'fs'

export class OCRService {
  static async extractMeterReading(imagePath: string): Promise<{ value: number; confidence: number }> {
    try {
      const absolutePath = path.resolve(imagePath)
      
      // Check if file exists
      if (!fs.existsSync(absolutePath)) {
        console.error('❌ File not found:', absolutePath)
        return {
          value: 0,
          confidence: 0
        }
      }
      
      console.log('🔍 Starting OCR for:', absolutePath)
      
      // Use Tesseract with optimized settings for meter readings
      const result = await Tesseract.recognize(
        absolutePath,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
            }
          },
          // Add error handler
          errorHandler: (err) => {
            console.error('OCR Error during processing:', err.message)
          }
        }
      )

      const text = result.data.text.trim()
      console.log('📝 OCR Raw Text:', text)
      console.log('📊 OCR Confidence:', result.data.confidence)

      // If text is empty or confidence too low, return error
      if (!text || text.length === 0) {
        console.log('⚠️ OCR returned empty text')
        return {
          value: 0,
          confidence: 0
        }
      }

      // Extract numbers from original text (before cleaning)
      // This preserves word boundaries
      const numbersFromOriginal = text.match(/\d+\.?\d*/g) || []
      
      console.log('🔢 Numbers from original text:', numbersFromOriginal)

      // Parse all numbers and filter valid readings
      const readings = numbersFromOriginal
        .map(n => parseFloat(n))
        .filter(n => !isNaN(n) && n >= 10 && n < 999999) // Reasonable meter reading range (at least 2 digits)
        .sort((a, b) => b - a) // Sort descending

      console.log('✅ Valid readings:', readings)

      if (readings.length === 0) {
        console.log('⚠️ No valid readings found')
        return {
          value: 0,
          confidence: 0
        }
      }

      // Strategy: Take the largest number that looks like a meter reading
      // Meter readings are typically 3-6 digits
      let value = readings[0]
      
      // Prefer numbers with 3-6 digits
      const preferredReadings = readings.filter(n => n >= 100 && n <= 999999)
      if (preferredReadings.length > 0) {
        value = preferredReadings[0]
        console.log('🎯 Selected preferred reading:', value)
      }

      // Get confidence from OCR result (0-100 scale)
      const confidence = result.data.confidence / 100

      console.log('✅ Final OCR Result:', { 
        value, 
        confidence: confidence.toFixed(2),
        allReadings: readings 
      })

      return {
        value: Math.round(value), // Round to integer for meter readings
        confidence: Math.max(0.3, Math.min(1, confidence)) // Clamp between 0.3 and 1
      }
    } catch (error: any) {
      console.error('❌ OCR Error:', error)
      
      // Handle specific errors
      if (error.message && error.message.includes('Image too small')) {
        console.error('Image is too small for OCR processing')
        return {
          value: 0,
          confidence: 0
        }
      }
      
      return {
        value: 0,
        confidence: 0
      }
    }
  }
}
