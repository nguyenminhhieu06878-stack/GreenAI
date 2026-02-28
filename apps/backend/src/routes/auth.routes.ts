import { Router } from 'express'
import passport from 'passport'
import { login, register, getProfile, updateProfile, updateRole, googleCallback } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.post('/login', login)
router.post('/register', register)
router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, updateProfile)
router.put('/role', authenticate, updateRole)

// Google OAuth routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: false 
}))

router.get('/google/callback', 
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/dang-nhap?error=auth_failed'
  }), 
  googleCallback
)

export default router
