import express from 'express'
import cors from 'cors'
import authRouter from './routes/authRotes.js'
import adminRouter from './routes/adminRoutes.js'
import performanceRouter from './routes/performance.routes.js'
import certificateRouter from './routes/certificate.routes.js'
import companyRouter from './routes/companyRoutes.js'
import programRouter from './routes/programRoutes.js'
import enrollmentRouter from './routes/enrollmentRoutes.js'
import internRouter from './routes/internRoutes.js'
import paymentRouter from './routes/paymentRoutes.js'
import mentorRouter from './routes/mentorRoutes.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/companies',companyRouter)
app.use('/api/programs',programRouter)
app.use('/api/enrollments',enrollmentRouter)
app.use('/api/intern',internRouter)
app.use('/api/mentor',mentorRouter)
app.use('/api/admin',adminRouter)
app.use('/api/payment',paymentRouter)


app.use('/api/auth',authRouter)
app.use('/api/performance',performanceRouter)
app.use('/api/certificate',certificateRouter)

export default app;