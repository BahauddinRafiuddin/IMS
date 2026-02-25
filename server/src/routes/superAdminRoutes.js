import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { roleMiddleware } from '../middlewares/roleMiddleware.js'
import { getSuperAdminDashboard } from '../controllers/superAdmin.controller.js'

const superAdminRouter=express.Router()

superAdminRouter.get('/dashboard',authMiddleware,roleMiddleware('super_admin'),getSuperAdminDashboard)

export default superAdminRouter