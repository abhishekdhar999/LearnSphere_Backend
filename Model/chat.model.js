import mongoose ,{Schema} from "mongoose";

const chatSchema = new Schema({
    chatName:{
        type:String,
    },
    isGroupChat:{
        type:Boolean,
        default:false
    },
    groupAdmin:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'GroupChat'
    },
    user:[{
         type: mongoose.Schema.Types.ObjectId,
           ref: "User" 
    }],
    latestMessage:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    }

},
{ timestamps: true }
)

export const Chat = mongoose.model("Chat",chatSchema);