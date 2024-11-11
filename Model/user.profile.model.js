import mongoose , { Schema } from "mongoose";

const profileModel = new Schema ({
    name: String,
    email: String,
    password: String,
    role: String,
    image: String,
    description:String,
    subjects:[String],
phoneNumber:String,
charge: String,
location:String,
})

export const PROFILEMODEL = mongoose.model("PROFILEMODEL",profileModel)