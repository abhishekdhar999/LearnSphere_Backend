import mongoose,{Schema} from "mongoose";

const groupChatSchema = new Schema({
    groupName: { type: String, required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],  // List of user IDs
//   admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],        // Admins of the group
  groupIcon: { type: String },                                   // Optional: URL for group image/icon
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Group creator
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})


export const GroupChat = mongoose.model("GroupChat",groupChatSchema)