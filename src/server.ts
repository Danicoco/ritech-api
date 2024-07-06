/** @format */

import cors from "cors"
import helmet from "helmet"
import express from "express"
import { createServer } from "http"
import compression from "compression"
import rateLimit from "express-rate-limit"

import routes from "./routes"
import { errorHandler } from "./modules/common/utils"

const app = express()
const httpServer = createServer(app)

const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many request from this IP, please try again after 10 minutes",
})

// Middlewares
app.use(helmet())
app.use(compression())

app.use(cors({}))

app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(express.json({ limit: "10mb" }))
app.disable("x-powered-by");

app.use("/", apiLimiter, routes)

// Error handlers
app.use(errorHandler)

export default httpServer
