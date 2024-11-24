import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import authRoutes from '../Routes/authRoutes.js';
import videoRoutes from '../Routes/videoRoutes.js'

import chatRoutes from '../Routes/chatRoutes.js'
import messageRoutes from '../Routes/messageRoutes.js'
import subscriptionRoutes from '../Routes/subscriptionRoutes.js'
import skillsRoutes from '../Routes/skillsRoutes.js'
import communityRoutes from '../Routes/communityRoutes.js'
const app = express();

 
app.use(cors(
    {
        origin: ['https://learn-sphere-frontend-f9igwolcr-abhishek-dhars-projects.vercel.app','https://learn-sphere-frontend.vercel.app/','https://learn-sphere-frontend-9omx4f33z-abhishek-dhars-projects.vercel.app/','http://localhost:3000', 'http://localhost:3001',"https://learnsphere-backend-4.onrender.com","https://learn-sphere-frontend-9omx4f33z-abhishek-dhars-projects.vercel.app/","https://learn-sphere-frontend.vercel.app/"],
    }
));

app.use(express.json({limit:"16kb"}))
app.use(cookieParser());
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static('public'));







 app.use("/users",authRoutes);
app.use("/videos",videoRoutes)

app.use("/chat",chatRoutes)
app.use("/message",messageRoutes)
app.use("/subscription",subscriptionRoutes)
app.use("/skills",skillsRoutes)
app.use('/community',communityRoutes)
export {app};