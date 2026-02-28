import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import {
  createRoom,
  getRooms,
  getRoom,
  updateRoom,
  assignTenant,
  removeTenant,
  deleteRoom
} from '../controllers/room.controller'

const router = Router()

// All routes require authentication
router.use(authenticate)

router.post('/', createRoom)
router.get('/', getRooms)
router.get('/:id', getRoom)
router.put('/:id', updateRoom)
router.post('/:id/assign-tenant', assignTenant)
router.post('/:id/remove-tenant', removeTenant)
router.delete('/:id', deleteRoom)

export default router
