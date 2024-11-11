import { Router } from "express";
import { verifyJwt } from "../Middleware/auth.middleware.js";
import { addParticipantToCommunity, createcommunity, getCommunitiesById, removeParticipantFromCommunity } from "../src/Controllers/community.controller.js";
const router = Router();

router.route("/createcommunity").post(verifyJwt,createcommunity)
router.route("/getcommunities").get(verifyJwt,getCommunitiesById)
router.route("/addparticipant").post(verifyJwt,addParticipantToCommunity)
router.route("/removeparticipant").post(verifyJwt,removeParticipantFromCommunity)
export default router;