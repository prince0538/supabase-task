import express from "express";
import morgan from "morgan";
import userRoutes from './routes/auth.routes'

const app = express()
app.use(morgan('dev'))
app.use(express.json())
app.use('/api/v1/user', userRoutes)

export default app