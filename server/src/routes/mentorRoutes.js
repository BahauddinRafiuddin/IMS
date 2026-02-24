import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { completeInternshipByMentor ,createTask,reviewTask,getMentorTasks,getMentorDashboard,getMentorPrograms,getMentorInterns,getInternPerformance} from '../controllers/mentorController.js';

const mentorRouter=express.Router()

mentorRouter.post('/complete',authMiddleware,roleMiddleware('mentor'),completeInternshipByMentor)
mentorRouter.post('/task', authMiddleware, roleMiddleware("mentor"), createTask)
mentorRouter.put('/task/:taskId/review', authMiddleware, roleMiddleware('mentor'), reviewTask)
mentorRouter.get('/tasks', authMiddleware, roleMiddleware('mentor'), getMentorTasks)
mentorRouter.get('/dashboard', authMiddleware, roleMiddleware('mentor'), getMentorDashboard)
mentorRouter.get('/programs', authMiddleware, roleMiddleware('mentor'), getMentorPrograms)
mentorRouter.get('/interns', authMiddleware, roleMiddleware('mentor'), getMentorInterns)
mentorRouter.get('/intern-performance', authMiddleware, roleMiddleware('mentor'), getInternPerformance)

export default mentorRouter