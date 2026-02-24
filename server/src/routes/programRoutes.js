import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { roleMiddleware } from '../middlewares/roleMiddleware.js'
import { createProgram, getPrograms } from '../controllers/programController.js'

const programRouter = express.Router()

programRouter.post('/', authMiddleware, roleMiddleware('admin'), createProgram)
programRouter.get('/', authMiddleware, roleMiddleware('admin'), getPrograms)
export default programRouter