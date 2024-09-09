import express from 'express'
import { protectRoute } from '../middleware/protectRoute.middleware.js'
import { deleteNotifications, getNotifications } from '../controllers/notification.controller.js'

const router = express.Router()

router.get('/', protectRoute, getNotifications)
router.delete('/', protectRoute, deleteNotifications)

export default router