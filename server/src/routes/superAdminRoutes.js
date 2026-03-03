import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { roleMiddleware } from '../middlewares/roleMiddleware.js'
import { getCompanyFinanceOverview, getCompanyTransactionReport, getPlatformFinanceStats, getSingleCompanyFinance, getSuperAdminDashboard } from '../controllers/superAdmin.controller.js'
import { updateCompanyCommission } from '../controllers/companyController.js'

const superAdminRouter = express.Router()

superAdminRouter.get('/dashboard', authMiddleware, roleMiddleware('super_admin'), getSuperAdminDashboard)
superAdminRouter.get('/platform-finance', authMiddleware, roleMiddleware('super_admin'), getPlatformFinanceStats)
superAdminRouter.put('/update-comission/:companyId', authMiddleware, roleMiddleware('super_admin'), updateCompanyCommission)

superAdminRouter.get('/finance-data', authMiddleware, roleMiddleware('super_admin'), getCompanyFinanceOverview)
superAdminRouter.get('/company-finance/:companyId', authMiddleware, roleMiddleware('super_admin'), getSingleCompanyFinance)

superAdminRouter.get('/transactions',authMiddleware,roleMiddleware('super_admin'),getCompanyTransactionReport)
export default superAdminRouter