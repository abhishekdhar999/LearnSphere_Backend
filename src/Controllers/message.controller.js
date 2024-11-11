import { Chat } from "../../Model/chat.model.js";
import { GroupChat } from "../../Model/groupChat.model.js";
import Message from "../../Model/message.model.js";
import { User } from "../../Model/user.model.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js"

const getMessages = asyncHandler(async (req,res)=>{

  const  chatId  = req.params.chatId;  // Extract chatId from req.body
  
  if (!chatId) {
    return res.status(400).json({ message: "chatId is required" });
  }

  try {
    const messages = await Message.find({ chat: chatId })  // Use chatId from req.body
      .populate("sender", "name pic email")
      .populate("chat");
      
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }

})

const sendMessage = asyncHandler(async(req,res)=>{
    const{content,chatId,isGroupChat} = req.body;

    console.log("content",content)
    console.log("chat id",chatId)
    console.log("isGroupChat",isGroupChat)
    let message;
    if(isGroupChat){
      const groupChat = await GroupChat.findById(chatId);

      const participants = groupChat.participants

       message = await Message.create({
        sender:req.user._id,
        content,
        chat:chatId
      })
      
    }else{
      const chat = await Chat.findById(chatId);
      console.log("chat",chat)
      
      const users = chat.user;
      console.log("users",chat.user);
      
      const readBy = users[1];
      console.log("read",readBy);
      
      
           message = await Message.create({
              sender:req.user._id,
              content,
              chat:chatId,
              readBy:readBy,
          })
          
    }

    // message = User.populate(message, {path: "chat.user"})

 // Populate sender and chat fields
//  const populatedMessage = await Message.findById(message._id)
//  .populate("sender", "name avatar") // Populate sender's name and avatar
// //  .populate("chat") // Populate chat details
//  .populate("readBy", "name avatar email"); // Populate readBy field

// // If you want to populate the users in the chat
// const fullMessage = await User.populate(populatedMessage, {
//  path: "chat.users", // Adjust this according to your chat schema
//  select: "name pic email" // Select fields to include from user
// });

const messageControllerMessage =  await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message })
 
return res
.status(200)
.json(new ApiResponse(
    200,
    {
        messageData:message,
      message: "message sent successfully"
    }
))
})

export {sendMessage,getMessages}