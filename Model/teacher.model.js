
import mongoose, {Schema} from "mongoose";
import jwt from 'jsonwebtoken'

const teacherSchema = new Schema (
    {
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        },
        subjects:{
            type:[String],
            required:true
        },
        phoneNumber:{
            type:String,
            required:true
        },
        role: {
            type: String,
            enum: ['Teacher'],  // Role for this schema is fixed as "User"
            default: 'Teacher',
          },
        isVerifiedUser:{type:Boolean,default:false},
        refreshTokken:{type:String},
        avatarTeacher: {
            type: String, // cloudinary url
            required: true,
        },

}
)

teacherSchema.methods.generateTeachersAccessTokken = async function(){
    return jwt.sign(
        {
        _id:this._id,
        name:this.name,
        email:this.email,
    },
    "123456789qwertyuiop9876654321",
    {
        expiresIn:"10d"
    }
    )
}

teacherSchema.methods.generateTeachersRefreshTokken = async function() {
    return jwt.sign(
        {
        _id:this._id,
        name:this.name,
        email:this.email,
    },
    "123456789qwertyuiop9876654321",
    {
        expiresIn:"1d"
    }
    )
}


export const Teacher = mongoose.model("Teacher",teacherSchema);