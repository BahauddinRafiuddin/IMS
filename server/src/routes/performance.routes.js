import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { calculateInternPerformance } from '../controllers/performance.controller.js';

const performanceRouter = express.Router()

performanceRouter.get('/intern/:programId', authMiddleware, roleMiddleware('intern'), calculateInternPerformance)

export default performanceRouter;