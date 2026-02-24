import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { roleMiddleware } from '../middlewares/roleMiddleware.js'
import { createPaymentOrder, verifyPayment } from '../controllers/paymentController.js'
import { refundPayment } from '../controllers/adminController.js'

const paymentRouter=express.Router()

paymentRouter.post('/create-order',authMiddleware,roleMiddleware('intern'),createPaymentOrder)
paymentRouter.post('/verify',authMiddleware,roleMiddleware('intern'),verifyPayment)
paymentRouter.post('/refund',authMiddleware,roleMiddleware('admin'),refundPayment)

export default paymentRouter