import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { roleMiddleware } from "../middlewares/roleMiddleware.js"
import { enrollIntern } from "../controllers/enrollmentController.js"

const enrollmentRouter=express.Router()

enrollmentRouter.post('/',authMiddleware,roleMiddleware('admin'),enrollIntern)

export default enrollmentRouter