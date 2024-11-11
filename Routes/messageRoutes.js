import { Router } from "express";
import { verifyJwt } from "../Middleware/auth.middleware.js";
import { getMessages, sendMessage } from "../src/Controllers/message.controller.js";

const router = Router();

router.route("/sendmessages").post(verifyJwt,sendMessage);
router.route("/getmessages/:chatId").get(verifyJwt,getMessages)
export default router;