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
          }
        }
      )

      const text = result.data.text.trim()
      console.log('📝 OCR Raw Text:', text)
      console.log('📊 OCR Confidence:', result.data.confidence)

      // Clean text: remove all non-digit characters except dots
      const cleanedText = text.replace(/[^\d.]/g, '')
      console.log('🧹 Cleaned Text:', cleanedText)

      // Extract all numbers from cleaned text
      const numbers = cleanedText.match(/\d+\.?\d*/g)
      
      if (!numbers || numbers.length === 0) {
        console.log('⚠️ No numbers found in OCR')
        return {
          value: 0,
          confidence: 0
        }
      }

      // Parse all numbers and filter valid readings
      const readings = numbers
        .map(n => parseFloat(n))
        .filter(n => !isNaN(n) && n > 0 && n < 999999) // Reasonable meter reading range
        .sort((a, b) => b - a) // Sort descending

      console.log('🔢 All detected numbers:', readings)

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
      
      // If the largest number is too small (< 100), try to combine digits
      if (value < 100 && readings.length > 1) {
        // Try to form a larger number from consecutive digits
        const combined = parseFloat(readings.join(''))
        if (combined > 100 && combined < 999999) {
          value = combined
          console.log('🔄 Combined digits to form:', value)
        }
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
    } catch (error) {
      console.error('❌ OCR Error:', error)
      return {
        value: 0,
        confidence: 0
      }
    }
  }
}
