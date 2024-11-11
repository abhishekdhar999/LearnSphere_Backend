import { Router } from "express";
import { createChat, createGroupChat, fetchChatsOfLoggedInUser, groupChatOfCommunity } from "../src/Controllers/chat.controller.js";
import { verifyJwt } from "../Middleware/auth.middleware.js";
const router = Router();

router.route("/createchat").post(verifyJwt,createChat);
router.route("/fetchchat").get(verifyJwt,fetchChatsOfLoggedInUser)
// router.route('/creategroupchat').post(verifyJwt,createGroupChat)
router.route('/fetchgroupchat/:groupChatId').get(groupChatOfCommunity)
export default router;