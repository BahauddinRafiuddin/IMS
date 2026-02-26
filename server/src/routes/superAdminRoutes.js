import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { roleMiddleware } from '../middlewares/roleMiddleware.js'
import { getCompanyFinanceOverview, getPlatformFinanceStats, getSingleCompanyFinance, getSuperAdminDashboard } from '../controllers/superAdmin.controller.js'

const superAdminRouter = express.Router()

superAdminRouter.get('/dashboard', authMiddleware, roleMiddleware('super_admin'), getSuperAdminDashboard)
superAdminRouter.get('/platform-finance', authMiddleware, roleMiddleware('super_admin'), getPlatformFinanceStats)

superAdminRouter.get('/finance-data', authMiddleware, roleMiddleware('super_admin'), getCompanyFinanceOverview)
superAdminRouter.get('/company-finance/:companyId', authMiddleware, roleMiddleware('super_admin'), getSingleCompanyFinance)

export default superAdminRouter