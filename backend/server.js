// create express server
import express from 'express';
import dotenv from 'dotenv'
import connectMongoDB from './db/connectMongoDB.js';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import userRoutes from "./routes/user.routes.js"
import postRoutes from "./routes/post.routes.js"
import notificationRoutes from "./routes/notification.routes.js"

import {v2 as cloudinary} from 'cloudinary'

dotenv.config()

cloudinary.config(
    {
        cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
        api_key:process.env.CLOUDINARY_API_KEY,
        api_secret:process.env.CLOUDINARY_API_SECRET,
    }
)

const app = express();

const PORT =  8080 ||  process.env.PORT



// middleware - to parse req.body
app.use(express.json({limit: '5mb'})) // default 100kb of data size
// middleware - to parse form data with encoded url
app.use(express.urlencoded({extended: true}))

// to parse cookie or jwt token
app.use(cookieParser())

app.use('/api/auth', authRoutes)

// User Routes and controllers
app.use("/api/users", userRoutes)

// user post and control
app.use('/api/posts', postRoutes)

// user notification 
app.use("/api/notifications", notificationRoutes)

app.listen(PORT, ()=>{
    console.log(`Server is running on http//:localhost:${PORT}`)
    connectMongoDB()
})
