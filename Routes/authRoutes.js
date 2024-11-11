import { Router } from 'express'

// middleware
import { upload } from '../Middleware/mullter.js';
import { verifyJwt } from '../Middleware/auth.middleware.js';

// routes
import { loginUser, logoutUser, refreshAccessToken, registerUser,getUserChannelProfile, getWatchHistory, getAllUsersWhoseRoleIsTeacher, getCurrentUser, editUserProfile, findByLocation ,submitRating, getRatingOfTeacher, allUsers, submitreview, getReviewsById} from '../src/Controllers/user.controller.js';


const router = Router();

router.route("/register").post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]),
    registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt,logoutUser);
router.route("/refreshAccessToken").post(refreshAccessToken);
router.route("/channels/:userId").get(verifyJwt,getUserChannelProfile);
router.route("/watchHistory").get(verifyJwt,getWatchHistory)
router.route("/roleteachers").get(getAllUsersWhoseRoleIsTeacher);
router.route('/currentuser').get(verifyJwt,getCurrentUser);
router.route("/edituser").put(verifyJwt,editUserProfile);
router.route("/searchbylocation/:long/:lat").get(verifyJwt,findByLocation)
router.route("/submitrating").post(verifyJwt,submitRating)
router.route("/getrating/:id").get(verifyJwt,getRatingOfTeacher)
router.route("/allusers").get(verifyJwt,allUsers)
router.route('/submitreview/:id').post(verifyJwt,submitreview)
router.route('/reviews/:id').get(verifyJwt,getReviewsById)

export default router;