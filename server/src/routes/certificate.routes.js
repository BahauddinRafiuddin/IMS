import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { roleMiddleware } from '../middlewares/roleMiddleware.js'
import { checkCertificateEligibility } from '../controllers/certificate.controller.js'
import { downloadCertificate } from '../controllers/certificatePdf.controller.js'

const certificateRouter = express.Router()

certificateRouter.get('/eligibility/:programId', authMiddleware, roleMiddleware('intern'), checkCertificateEligibility)
certificateRouter.get('/download/:programId', authMiddleware, roleMiddleware('intern'), downloadCertificate)
export default certificateRouter