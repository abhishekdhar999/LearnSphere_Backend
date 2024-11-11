import { Router } from "express";
import { verifyJwt } from "../Middleware/auth.middleware.js";
import { isSubscribed, subscribe, unSubscribe } from "../src/Controllers/subscription.controller.js";

const router = Router();

router.route("/subscribe").post(verifyJwt,subscribe)
router.route("/unsubscribe").post(verifyJwt,unSubscribe)
router.route("/checksubscribed/:channelId").get(verifyJwt,isSubscribed)
export default router