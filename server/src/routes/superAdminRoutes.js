import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { roleMiddleware } from '../middlewares/roleMiddleware.js'
import { approveReview, exportCompanyCommissionHistory, getAllCompaniesCommissionHistory, getCompanyFinanceOverview, getCompanyTransactionReport, getPendingReviews, getPlatformFinanceStats, getSingleCompanyComissionHistory, getSingleCompanyFinance, getSuperAdminDashboard, rejectReview } from '../controllers/superAdmin.controller.js'
import { updateCompanyCommission } from '../controllers/companyController.js'

const superAdminRouter = express.Router()

superAdminRouter.get('/dashboard', authMiddleware, roleMiddleware('super_admin'), getSuperAdminDashboard)
superAdminRouter.get('/platform-finance', authMiddleware, roleMiddleware('super_admin'), getPlatformFinanceStats)
superAdminRouter.put('/update-comission/:companyId', authMiddleware, roleMiddleware('super_admin'), updateCompanyCommission)
superAdminRouter.get('/comission-history', authMiddleware, roleMiddleware('super_admin'), getAllCompaniesCommissionHistory)
superAdminRouter.get('/comission-history/:companyId', authMiddleware, roleMiddleware('super_admin'), getSingleCompanyComissionHistory)
superAdminRouter.get("/comission-history/export/:companyId", authMiddleware, roleMiddleware('super_admin'), exportCompanyCommissionHistory)


superAdminRouter.get('/finance-data', authMiddleware, roleMiddleware('super_admin'), getCompanyFinanceOverview)
superAdminRouter.get('/company-finance/:companyId', authMiddleware, roleMiddleware('super_admin'), getSingleCompanyFinance)

superAdminRouter.get('/transactions', authMiddleware, roleMiddleware('super_admin'), getCompanyTransactionReport)

superAdminRouter.get('/pending-reviews', authMiddleware, roleMiddleware('super_admin'), getPendingReviews)
superAdminRouter.put('/approveReview/:reviewId', authMiddleware, roleMiddleware('super_admin'), approveReview)
superAdminRouter.put('/rejectReview/:reviewId', authMiddleware, roleMiddleware('super_admin'), rejectReview)

export default superAdminRouter