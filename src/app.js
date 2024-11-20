import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'
// routes
import authRoutes from '../Routes/authRoutes.js';
import videoRoutes from '../Routes/videoRoutes.js'

import chatRoutes from '../Routes/chatRoutes.js'
import messageRoutes from '../Routes/messageRoutes.js'
import subscriptionRoutes from '../Routes/subscriptionRoutes.js'
import skillsRoutes from '../Routes/skillsRoutes.js'
import communityRoutes from '../Routes/communityRoutes.js'
const app = express();

 
app.use(cors());
app.use(express.json({limit:"16kb"}))
app.use(cookieParser());
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static('public'));




// routes


 app.use("/users",authRoutes);
app.use("/videos",videoRoutes)

app.use("/chat",chatRoutes)
app.use("/message",messageRoutes)
app.use("/subscription",subscriptionRoutes)
app.use("/skills",skillsRoutes)
app.use('/community',communityRoutes)
export {app};