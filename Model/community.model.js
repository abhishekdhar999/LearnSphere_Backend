import mongoose, { Schema } from "mongoose";

const communitySchema = new Schema({
    title: { type: String, required: true },
    participants: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User' // Reference to the User model
        }
      ],
    admin:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    groupChatId:{
      type:Schema.Types.ObjectId,
      ref:'GroupChat'
    }
})

export const Community = mongoose.model("Community",communitySchema)