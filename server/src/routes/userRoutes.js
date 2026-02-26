import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { changePassword, getMyProfile } from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.get('/profile', authMiddleware, getMyProfile)
userRouter.put('/update-pass', authMiddleware, changePassword)
export default userRouter