import Jwt  from "jsonwebtoken";
import { ApiError } from "../src/Utils/ApiError.js";
import { User } from "../Model/user.model.js";
import { asyncHandler } from "../src/Utils/asyncHandler.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {  
try {
    const authTokken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
    if(!authTokken){
    throw new ApiError(401,"authorization failed");
    }
    
    const decodedToken = Jwt.verify(authTokken,process.env.JWT_SECRET_KEY);
    console.log("decoded",decodedToken);
    
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    if(!user){
        throw new ApiError(401,"user not found");
        }
    req.user = user;

    next()
} catch (error) {
    
}

})

