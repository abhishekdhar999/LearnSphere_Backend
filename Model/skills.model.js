import mongoose, { Schema } from "mongoose";

const skillsSchema = new Schema({
   skillToLearn:{
        type:[String],
        required:true
    },
   skillToShare:{
    type:[String],
    required:true
   },
   skillLevel:{
    type:String,
    required:true
    },
    skillType:{
        type:String,
        required:true
    },
    skillDescription:{
        type:String,
        required:true
        },
        skillImage:{
            type:String,
            // required:true
            },
            skillVideo:{
                type:String,
                // required:true
            },
            certifications:{
                type:String,  // cloudinary url 
               
            },
            owner:{
                type: Schema.Types.ObjectId,
                ref: 'User',
            }

})


export const SKILLS = mongoose.model("SKILLS",skillsSchema)