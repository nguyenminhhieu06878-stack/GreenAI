import multer from 'multer'
import path from 'path'
import { config } from '../config/index.js'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.dir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'meter-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error('Only image files (jpeg, jpg, png) are allowed'))
  }
}

export const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxSize },
  fileFilter
})
