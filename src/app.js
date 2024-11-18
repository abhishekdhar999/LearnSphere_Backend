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

const allowedOrigins = [
    "https://learn-sphere-frontend.vercel.app", // Add other front-end URLs if needed
  ];
  
  const corsOptions = {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        // Allow requests from the allowed origins or from localhost (no origin)
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"], // Methods you want to allow
    credentials: true, // Allows cookies to be sent
  };
  
  // Apply the CORS middleware globally
  app.use(cors(corsOptions));
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