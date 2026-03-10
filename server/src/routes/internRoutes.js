import express from "express"
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { roleMiddleware } from '../middlewares/roleMiddleware.js'
import { createReview, getInternPaymentHistory, getMyProgram, getMyTask, startInternship, submitTask } from "../controllers/internController.js"

const internRouter = express.Router()

internRouter.get("/my-programs", authMiddleware, roleMiddleware("intern"), getMyProgram)
internRouter.post('/start', authMiddleware, roleMiddleware('intern'), startInternship)
internRouter.get('/task', authMiddleware, roleMiddleware('intern'), getMyTask)
internRouter.post('/task/:taskId/submit', authMiddleware, roleMiddleware('intern'), submitTask)
internRouter.get('/payment-history', authMiddleware, roleMiddleware('intern'), getInternPaymentHistory)
internRouter.post('/review',authMiddleware,roleMiddleware('intern'),createReview)


export default internRouter