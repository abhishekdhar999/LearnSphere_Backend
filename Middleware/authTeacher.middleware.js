import Jwt  from "jsonwebtoken";
import { ApiError } from "../src/Utils/ApiError.js";
import { User } from "../Model/user.model.js";
import { asyncHandler } from "../src/Utils/asyncHandler.js";
import { Teacher } from "../Model/teacher.model.js";

export const verifyTeacherJwt = asyncHandler(async (req, res, next) => {  
try {
    console.log("jwt teacher")
    const authTokken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
    if(!authTokken){
    throw new ApiError(401,"authorization failed");
    }
    
    const decodedToken = Jwt.verify(authTokken,"123456789qwertyuiop9876654321");
    console.log("decoded",decodedToken);
    
    const teacher = await Teacher.findById(decodedToken?._id).select("-password -refreshToken")
    if(!teacher){
        throw new ApiError(401,"user not found");
        }
    req.teacher = teacher;

    next()
} catch (error) {
    
}

})

