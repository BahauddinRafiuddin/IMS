import express from 'express'
import { roleMiddleware } from '../middlewares/roleMiddleware.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { changeProgramStatus, createIntern, createMentor, createProgram, deleteMentorById, exportInterns, exportMentors, getAdminDashboard, getAdminFinanceOverview, getAllInterns, getAllMentors, getAllPrograms, getAvailableInterns, getCompanyReviews, updateInternStatus, updateProgram ,exportPrograms,exportFinanceReport, exportCompanyReviews} from '../controllers/adminController.js'

const adminRouter = express.Router()

adminRouter.get('/dashboard', authMiddleware, roleMiddleware('admin'), getAdminDashboard)

// Create Mentor and intern
adminRouter.post('/intern', authMiddleware, roleMiddleware('admin'), createIntern)
adminRouter.post('/mentor', authMiddleware, roleMiddleware("admin"), createMentor)

adminRouter.get('/finance-overview', authMiddleware, roleMiddleware('admin'), getAdminFinanceOverview)
adminRouter.get('/finance/export',authMiddleware,roleMiddleware("admin"),exportFinanceReport)

// Admin AuthRouter
adminRouter.get('/interns', authMiddleware, roleMiddleware("admin"), getAllInterns)
adminRouter.get('/intern/export', authMiddleware, roleMiddleware('admin'), exportInterns)
adminRouter.get('/mentors', authMiddleware, roleMiddleware('admin'), getAllMentors)
adminRouter.get('/mentors/export', authMiddleware, roleMiddleware('admin'), exportMentors)


adminRouter.get('/available-interns', authMiddleware, roleMiddleware('admin'), getAvailableInterns)
adminRouter.put('/intern/:internId/status', authMiddleware, roleMiddleware("admin"), updateInternStatus)
adminRouter.delete('/mentor/:mentorId/delete', authMiddleware, roleMiddleware('admin'), deleteMentorById)
// adminRouter.put('/assign-mentor', authMiddleware, roleMiddleware("admin"), assignMentor)

// Admin InternShip Program Router
adminRouter.post('/program', authMiddleware, roleMiddleware("admin"), createProgram)

adminRouter.get('/programs', authMiddleware, roleMiddleware("admin"), getAllPrograms)
adminRouter.get('/programs/export',authMiddleware,roleMiddleware('admin'),exportPrograms)

adminRouter.put('/program/:progId/status', authMiddleware, roleMiddleware("admin"), changeProgramStatus)
adminRouter.put('/program/:progId', authMiddleware, roleMiddleware("admin"), updateProgram)
// adminRouter.put('/program/:progId/enroll', authMiddleware, roleMiddleware('admin'), enrollIntern)

adminRouter.get('/reviews', authMiddleware, roleMiddleware('admin'), getCompanyReviews)
adminRouter.get('/reviews/export',authMiddleware,roleMiddleware('admin'),exportCompanyReviews)

export default adminRouter