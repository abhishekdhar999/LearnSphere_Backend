import mongoose , {Schema} from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
const userSchema = new Schema(
    {
        name: {type: String, required: true,index:true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        phoneNumber:{type: Number,required:true},
        isVerifiedUser:{type:Boolean,default:false},
        refreshTokken:{type:String},
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        role: {
            type: String,
            enum: ['Student', 'Teacher'],  // Role can be either "Student" or "Teacher"
            required: true,
          },
          description:{
            type:String,
          },
    subjects:{
        type:[String],
    },
    charge:{
        type:Number,
    },
    locationCity:{
        type:String,
    },
    subscribersCount:{
        type:Number,
        default:0
    },
    subscribers:{
        type:[ Schema.Types.ObjectId ],
        ref:"User"
    },
    location: {
        type:{ type: String, default: "Point" },
        coordinates: [Number] // [longitude, latitude]
    },
    Rating:{
        type:Number,
        ref:"User"
    }

    },
    {
        timestamps: true,
    }
)

userSchema.index({ location: '2dsphere' });

userSchema.pre('save',async function(next){
    if(!this.isModified("password")){
        return next();
    }

    this.password = bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessTokken = async function (){
return jwt.sign(
    {
        _id : this._id,
        name : this.name,
        email:this.email,
        avatar:this.avatar,

},
"qwertyuiop0987654321poiuytrewq",
{
expiresIn:"10d"
}
)
}

userSchema.methods.generateRefreshTokken = async function (){
   return jwt.sign(
        {
            _id : this._id,
            name : this.name,
            email:this.email
    
    },
    "qwertyuiop0987654321poiuytrewq",
    {
    expiresIn:"1d"
    }
    )
}
export const User  = mongoose.model("User",userSchema);
