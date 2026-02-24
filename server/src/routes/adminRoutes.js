import express from 'express'
import { roleMiddleware } from '../middlewares/roleMiddleware.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { changeProgramStatus, createIntern, createMentor, createProgram, deleteMentorById, getAllInterns, getAllMentors, getAllPrograms, getAvailableInterns, updateInternStatus, updateProgram } from '../controllers/adminController.js'

const adminRouter = express.Router()
// Create Mentor and intern
adminRouter.post('/intern',authMiddleware,roleMiddleware('admin'),createIntern)
adminRouter.post('/mentor', authMiddleware, roleMiddleware("admin"), createMentor)


// Admin AuthRouter
adminRouter.get('/interns', authMiddleware, roleMiddleware("admin"), getAllInterns)
adminRouter.get('/available-interns', authMiddleware, roleMiddleware('admin'), getAvailableInterns)
adminRouter.get('/mentors', authMiddleware, roleMiddleware('admin'), getAllMentors)
adminRouter.put('/intern/:internId/status', authMiddleware, roleMiddleware("admin"), updateInternStatus)
adminRouter.delete('/mentor/:mentorId/delete', authMiddleware, roleMiddleware('admin'), deleteMentorById)
// adminRouter.put('/assign-mentor', authMiddleware, roleMiddleware("admin"), assignMentor)

// Admin InternShip Program Router
adminRouter.post('/program', authMiddleware, roleMiddleware("admin"), createProgram)
adminRouter.get('/programs', authMiddleware, roleMiddleware("admin"), getAllPrograms)
adminRouter.put('/program/:progId/status', authMiddleware, roleMiddleware("admin"), changeProgramStatus)
adminRouter.put('/program/:progId', authMiddleware, roleMiddleware("admin"), updateProgram)
// adminRouter.put('/program/:progId/enroll', authMiddleware, roleMiddleware('admin'), enrollIntern)

export default adminRouter