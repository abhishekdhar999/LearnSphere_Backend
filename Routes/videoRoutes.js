import { Router} from "express";
import { upload } from "../Middleware/mullter.js";
import { verifyJwt } from "../Middleware/auth.middleware.js";
import {  deleteVideo, entireVideos, getAllVideos } from "../src/Controllers/video.controller.js";
// routes
import { publishvideo } from "../src/Controllers/video.controller.js";
import { verifyTeacherJwt } from "../Middleware/authTeacher.middleware.js";
const router = Router();


router.route("/postvideo").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    verifyJwt,
    publishvideo
   
);

router.route("/deletevideo").post(
  verifyJwt,
    deleteVideo
)
// route to get videos of logged in user
router.route("/allvideos").get(verifyJwt,getAllVideos)

// route to get all videos in database
router.route("/entirevideos").get(verifyJwt,entireVideos)

export default router;