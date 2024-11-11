import { Community } from "../../Model/community.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { GroupChat } from "../../Model/groupChat.model.js";


const createcommunity = asyncHandler(async (req, res) => {
  console.log("reqqbody",req.body);
    const {title,selectedUsers} = req.body
    
    const admin = req.user._id;
     const participants = selectedUsers || [];
  console.log("particpnats in create comm 1",participants)

    // Ensure admin is part of participants
    if (!participants.includes(admin.toString())) {
      participants.push(admin);
    }
  
    // Create the Community
    const community = await Community.create({
      title,
      admin,
      participants,
    });
    console.log("community", community);
  
    if (!community) {
      throw new ApiError(404, "Community not created");
    }
  
    console.log("particpnats in create comm 2",participants)
    // Create the Group Chat
    const groupChat = await GroupChat.create({
      groupName: title,
      participants:participants,
      createdBy: admin,
    });
  
    if (!groupChat) {
      throw new ApiError(404, "Group chat not created");
    }

    const groupChatWithParticipants = await GroupChat.findById(groupChat._id)
    .populate({
      path: 'participants',
      select: 'name email',
    });
  
  // Debugging: Log the populated result
  console.log("GroupChat with Participants:", groupChatWithParticipants);
  
  // Check if populated successfully
  if (!groupChatWithParticipants) {
    throw new Error("Group Chat not found");
  }
  
  // Check participants before mapping
  console.log("Participants before mapping:", groupChatWithParticipants.participants);
  
  // Here, we can manipulate the populated data if needed
  // const participantDetails = groupChatWithParticipants.participants.map(participant => ({
  //   participantId: participant._id,
  //   name: participant.name,
  //   email: participant.email,
  // }));
  
  // If you want to update the participants array with their details
  // groupChatWithParticipants.participants = participantDetails;
  
  // Now save the modified document back to the database
  await groupChatWithParticipants.save();
  

  console.log("Updated Group Chat saved with participant details:", groupChatWithParticipants);
  
//     console.log("gropup chjat",groupChat)
//  const updatedGroupChat =  await groupChat.populate('participants');

    // console.log("updatedGroupChat",updatedGroupChat);
    // Update the Community with groupChatId and get the updated document
    const updatedCommunity = await Community.findByIdAndUpdate(
      community._id,
      { groupChatId: groupChat._id },
      { new: true }
    )
      .populate({
        path: 'groupChatId',
        populate: {
          path: 'participants',   // Populate the participants field inside GroupChat
          select: 'name email',   // Select specific fields of participants
        },
      });
  
    await updatedCommunity.save();
      
// console.log("populatedUpdatedCommunity",populatedUpdatedCommunity)
    // Check if updated community exists
    if (!updatedCommunity) {
      throw new ApiError(404, "Failed to update community with group chat");
    }
  
    console.log("updatedCommunity", updatedCommunity);
  
    // Send the response
    return res.status(200).json(
      new ApiResponse(
        200,
        {updatedCommunity,groupChatWithParticipants},
        "Community created and group chat associated successfully"
      )
    );
  });
  
const getCommunitiesById = asyncHandler(async(req,res)=>{
    const communities = await Community.find({
        $or: [
            { admin: req.user._id }, // Check if the user is the admin
            { participants: req.user._id } // Check if the user is a participant
        ]
    })

    
    if(!communities){
return
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            communities,
            "communities of user fetched sucessfully"
        )
    )
})

const addParticipantToCommunity = asyncHandler(async(req,res)=>{
    const {communityId,participantsId} = req.body;
    console.log("communityId",communityId);
    console.log("participantId",participantsId)
    console.log("reqbody",req.body)
    const community = await Community.findByIdAndUpdate(
        {_id:communityId},
        { $push: { participants: participantsId } }, // Push the participantId into the participants array
      { new: true } 
    )

      if(!community){
        throw new ApiError("participant is not added")
      }

      const groupChatId = community.groupChatId;
      console.log("groupChatId",groupChatId)
      const groupChat = await GroupChat.findByIdAndUpdate(
        {_id:groupChatId},
        {$push:{participants:participantsId}},
        {new:true}
      )

      if(!groupChat){
        throw new ApiError("user not added to the groupchat participants")
      }

      return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            {community,groupChat},
            "success"
        )
      )
})

const removeParticipantFromCommunity = asyncHandler(async(req, res) => {
    const { communityId, participantId } = req.body;
  
    const communityToCheckAdmin = await Community.findById(communityId)
    console.log("commm",communityToCheckAdmin.admin)
    console.log("req",req.user._id)
    if (communityToCheckAdmin.admin.toString() === req.user._id.toString()) {
        console.log("innnnnnn")
        try {
            // Remove participant from community
            const community = await Community.findByIdAndUpdate(
              { _id: communityId },
              { $pull: { participants: participantId } }, // Remove the participantId from the participants array
              { new: true }
            );
        
            if (!community) {
              throw new ApiError("Participant not removed from community");
            }
        
            const groupChatId =  community.groupChatId;
            console.log("groupChatId", groupChatId);
        
            // Remove participant from group chat
            const groupChat = await GroupChat.findByIdAndUpdate(
              { _id: groupChatId },
              { $pull: { participants: participantId } }, // Remove the participantId from the groupChat participants array
              { new: true }
            );
        
            if (!groupChat) {
              throw new ApiError("Participant not removed from group chat");
            }
        
            return res.status(200).json(
              new ApiResponse(
                200,
                { community, groupChat },
                "Participant removed successfully"
              )
            );
          } catch (error) {
            return res.status(500).json({
              message: "Error removing participant",
              error: error.message
            });
          }
    }else{
        throw new ApiError("only admin can remove and add")
    }


    
  });
  

export {createcommunity,getCommunitiesById,addParticipantToCommunity,removeParticipantFromCommunity}


