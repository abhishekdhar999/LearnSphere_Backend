import { asyncHandler } from "../Utils/asyncHandler.js";
import {User} from '../../Model/user.model.js'
import {ApiError} from '../Utils/ApiError.js';
import { ApiResponse } from '../Utils/ApiResponse.js';
import { uploadInCloudinary } from "../Utils/fileUploadInCloud.js";
import jwt from "jsonwebtoken"
import { Rating } from "../../Model/rating.model.js";

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        console.log("userid",userId);
        const user = await User.findById(userId)
        console.log("upper user",user)
        const accessToken = await user.generateAccessTokken()
        const refreshToken = await user.generateRefreshTokken()

        user.refreshTokken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phoneNumber, role ,floatLongitude,floatLatitude} = req.body;

    // Log the incoming request body and files
    console.log("req.body", req.body);
    console.log("req.files", req.files);

    // Ensure all required fields are present
    if (!name || !email || !password || !phoneNumber || !role) {
        return res.status(400).json({ message: "All fields are required." });
    }
console.log("req.files",req.files)
    // Check if avatar was uploaded
    const avatarFile = req.files?.avatar?.[0]?.path;
    if (!avatarFile) {
        return res.status(400).json({ message: "Avatar file is required." });
    }

    // Optionally check if cover image was uploaded
    let coverImagePath = "";
    if (req.files && req.files.coverImage && req.files.coverImage[0]) {
        coverImagePath = req.files.coverImage[0].path;
    }
console.log("avatar file",avatarFile)
    // Upload files to Cloudinary (or handle as needed)
    const avatar = await uploadInCloudinary(avatarFile);
    const coverImage = coverImagePath ? await uploadInCloudinary(coverImagePath) : null;

    if (!avatar) {
        return res.status(400).json({ message: "Failed to upload avatar." });
    }

    // Create the user in the database
    const user = await User.create({
        name,
        email,
        password,
        phoneNumber,
        avatar: avatar.url,  // Save the avatar URL from Cloudinary
        coverImage: coverImage?.url || "",  // Save cover image if uploaded
        role,
        location: {
            type: "Point",  // Specify the type as Point
            coordinates: [floatLongitude, floatLatitude]  // Replace with actual longitude and latitude values
        }
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        return res.status(500).json({ message: "Failed to create the user." });
    }

    return res.status(200).json({
        message: "User registered successfully",
        user: createdUser
    });
});


  const loginUser = asyncHandler (async (req,res)=>{
    const {email, password,latitude,longitude} = req.body;
    if(!email || !password){
        throw new ApiError(400,"fill the credentials")
    }
    console.log("latitude backend",latitude)
    console.log("longitude backend",longitude)
    const user = await User.findOne({email});
    if(!user){
        return new ApiError(404,"User not found");
        }
        
//     const isPasswordValid = await user.isPasswordCorrect(password)

//    if (!isPasswordValid) {
//     throw new ApiError(401, "Invalid user credentials")
//     }
        console.log("user",user);

        
const {accessToken,refreshToken} = await  generateAccessAndRefereshTokens(user._id)
console.log("accesstoken",accessToken);
console.log("refreshtoken",refreshToken);

    const loggedInUser = await User.findOneAndUpdate(
        {_id:user._id},{
            $set:{
                location:{
                     type:"Point",
                    coordinates:[longitude,latitude]
                }
            }
        },{
            new:true
        }
        ).select("-password -refreshToken");
        console.log("loggedinuser",loggedInUser);

        
        const options = {
            httpOnly: true,
             secure: false
        }

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

  })

  const logoutUser = asyncHandler( async(req,res)=>{
const id  = req.user._id;
if(!id){
    throw new ApiError(401,"User id not found")
}
  await User.findByIdAndUpdate(
    id,
    {
        $unset : {
            refreshTokken : null
        }
    },
    {
        new : true
    }
  )

  return res
  .status(200)
  .clearCookie("accessToken")
  .clearCookie("refreshToken")
  .json(
    new ApiResponse(
        200,
        {
            
        },
        "User logged out Successfully"
        )
        )
//     const refreshTokken = req.cookies.refreshToken;
//     if(!refreshTokken){
//         return new ApiError(401,"No refresh token found")
//     }

//     const user = await  User.findOne({refreshTokken})
// res.send(user)
//      user.refreshTokken = null;
// await user.save();

// return res 
// .status(200)
// .clearCookies("accessToken")
// .clearCookies("refreshToken")
// .json(
//     new ApiResponse(
//         200,
//         {
//             data:{user}
//             },
//             "User logged out successfully"
//             )
//             )
            

  })
  
  const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken =  req.cookies?.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"no refreshTokken")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,"qwertyuiop0987654321poiuytrewq");
    
        const user =await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401,"User not found")
        }
    console.log("refresgtokken",incomingRefreshToken)
    console.log("user resfresh token",user?.refreshTokken)
        if (incomingRefreshToken!== user?.refreshTokken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
      const {accessToken,newRefreshToken} = await generateAccessAndRefereshTokens(user._id);
    
      console.log(accessToken)
      console.log(newRefreshToken);
    
    
      const options = {
        httpOnly: true,
        secure: true
    }
    
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {accessToken, refreshToken: newRefreshToken},
            "Access token refreshed"
        )
    )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
  })

  const getUserChannelProfile = asyncHandler(async(req,res)=>{
   
    const userId = req.params.userId

    if(!userId){
        throw new ApiError(400,"user not found");
    }

  const channel =   User.aggregate([
        {
            $match:{
                _id : userId
            }
    },
    {
            $lookup:{
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'channel',
                as: "subscribers"
            }
    },
    {
        $lookup:{
            from: 'subscriptions',
            localField: '_id',
            foreignField: 'subscriber',
            as: "subscribedTo"
        }
    },
    {
        $addFields:{
           
            subscribersCount: {
                $size: "$subscribers"
            },
            channelsSubscribedToCount: {
                $size: "$subscribedTo"
            },
            isSubscribed: {
                $in: [req.user._id, "$subscribedTo"]
                }
        }
    },
   {
    $project:{
        _id: 1,
        name: 1,
        email: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
       
   }

    },
    

])
if (!channel?.length) {
    throw new ApiError(404, "channel does not exists")
}

return res
.status(200)
.json(
    new ApiResponse(200, channel[0], "User channel fetched successfully")
)
  })

  const getWatchHistory = asyncHandler(async(req,res)=>{

    const user = await User.aggregate([
        {
            $match: {
                _id:req.user._id
        }
    },
    {
        $lookup:{
            from:"videos",
            localField:"watchHistory",
            foreignField:"_id",
            as:"watchHistory",
            pipeline:[
                {
                    $lookup:{
                        from:"users",
                        localField:"owners",
                        foreignField:"_id",
                        as:"owners",
                        pipeline:[
                            {
                                $project:{
                                    name:1,
                                    email:1,
                                    _id:1
                            }
                        }
                        ]
                    }
                },
                {
                    $project:{
                        title:1,
                        views:1,
                        _id:1,
                        description:1
                } 
                }
            ]
        }
    },
    {
        $addFields:{
            owner:{
                $first: "$owner"
            }
        }
    }
    ])
   return res
   .status(200)
   .json(
    new ApiResponse(200,
        user[0].watchHistory,
        "users watch history fetched successfully")
   )



  })

  const getAllUsersWhoseRoleIsTeacher = asyncHandler(async(req,res)=>{
    const user = await User.find({role:"Teacher"}).select("-password")

    if(!user){
        throw new ApiError(400,"user whose role is teacher no found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            user,
            "users whose role is teacher fetched successfully")
            )
  })

  const getCurrentUser = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id).select("-password")

    if(!user){
        throw new ApiError(400,"user not found");
    }
    console.log("user",user)
    return res
    .status(200)
    .json(
        new ApiResponse(200,
            user,
            "current user fetched successfully")
            )
    // .json(200,
    //     new ApiResponse(
    //         200,
    //         user,
    //     ))
  })

  const editUserProfile = asyncHandler(async (req, res) => {
    const { name, charge, location, description,subjects } = req.body;
    
    // Debugging: Log request body
    console.log("Request body:", req.body);
    
    // Fetch the user from the database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    // Update user fields
    if(name){
        user.name = name
    }else{
        user.name = user.name
    }
     
    user.location = location || user.location;
    user.description = description || user.description;
  
    // Only update the charge if the user is a Teacher
    if (user.role === 'Teacher') {
      user.charge = charge !== undefined ? charge : user.charge;
    }
    if (user.role === 'Teacher') {
        user.subjects = subjects !== undefined ? subjects : user.charge;
      }
  
    // Save the updated user document
    try {
      await user.save();
      return res.status(200).json({
        statusCode: 200,
        data: user,
        message: "User profile updated successfully",
      });
    } catch (error) {
      console.error("Error saving user:", error);
      return res.status(500).json({ message: "Failed to update user profile" });
    }
  });
  
  const findByLocation = asyncHandler(async (req, res) => {
    const { long, lat } = req.params;
    // User.getIndexes();
    console.log("Received lat:", lat, "long:", long);

    // Check if latitude or longitude is missing
    if (!lat || !long) {
        return res.status(400).json({ message: "Latitude or longitude not provided" });
    }
 
    const radiusInKilometers = 10;
    
    // Find users by location within the radius
    const users = await User.find({
        // "location.coordinates": { $eq: [long, lat] }

        location: {

            $geoWithin: {
                $centerSphere: [
                    [parseFloat(long), parseFloat(lat)], // [longitude, latitude]
                    radiusInKilometers / 6378.1 // Convert km to radians
                ]
            }
        }
        // location: {
        //     $elemMatch: {
        //         coordinates: { $eq: longitude, $eq: latitude }
        //     }
        // }
        // location: {
                
        //     $geoIntersects: {
        //         $geometry: {
        //             type: "Point",
        //             coordinates: [parseFloat(long), parseFloat(lat)] // Order: [longitude, latitude]
        //         }
        //     }
        // }
    });
console.log(users)
    // Check if users exist or if the array is empty
    if (!users || users.length === 0) {
        return res.status(404).json({ message: "No users found for the given location" });
    }

    // Return successful response
    return res.status(200).json(
        new ApiResponse(
            200,
            users,
            "Users successfully fetched by location"
        )
    );
});

const submitRating = asyncHandler(async (req, res) => {
    const loggedInUserId = req.user._id;
    if (!loggedInUserId) {
        throw new ApiError("Please log in first");
    }

    let { rating, teacherInUsersId } = req.body;
    console.log("body", req.body);

    // Check for required fields
    if (!rating || !teacherInUsersId) {
        throw new ApiError("Rating or teacher ID not found");
    }

    // Convert rating to a number
    rating = parseFloat(rating);
    if (isNaN(rating)) {
        throw new ApiError("Invalid rating value");
    }

    // Find the existing rating, if any
    const beforeRating = await Rating.findOne({ teacherId: teacherInUsersId });
    let newRatingValue = rating;
    let newRatingCount = 1;

    // Calculate the new rating value and count if there's an existing rating
    if (beforeRating) {
        newRatingValue = (beforeRating.rating * beforeRating.ratingCount + rating) / (beforeRating.ratingCount + 1);
        newRatingCount = beforeRating.ratingCount + 1;
    }


   let ratingvalue = parseFloat(newRatingValue);
    if (isNaN(ratingvalue)) {
        throw new ApiError("Invalid rating value");
    }
    // Create or update the rating
    const createRating = await Rating.create({
        rating: ratingvalue,
        ratingCount: newRatingCount,
        userId: loggedInUserId,
        teacherId: teacherInUsersId
    });

    // Populate the created rating with user and teacher details
    const populatedRating = await Rating.findById(createRating._id).populate("userId").populate("teacherId");

    if (!createRating) {
        throw new ApiError("Failed to record rating");
    }

    return res.status(200).json(
        new ApiResponse(200, populatedRating, "Rating recorded successfully")
    );
});


const getRatingOfTeacher = asyncHandler(async(req,res)=>{
const {id} = req.params

const rating  = await Rating.findOne({
    teacherId:id
});

const rate = 0;

if(!rating){
    return res
    .status(200)
    .json(
rate
    )
}
return res 
.status(200)
.json(
    new ApiResponse(
        200,
        rating,
        "ratign generated success"
    )
)
})

const allUsers = asyncHandler(async(req,res)=>{
    const users = await User.find()
    if(!users){
        throw new ApiError("no users to fetch");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            users,
            "users fetched successfully"
        )
    )
})

const submitreview = asyncHandler(async(req,res)=>{
    console.log("om")
    const sender = req.user._id;
    const {id} = req.params;
    const {review} = req.body;
    const rating = await Rating.findOne({teacherId:id});
    if(!rating){
        const newRating = new Rating({
            userId:sender,
            teacherId:id,
            review,
            // rating:0
            })
            await newRating.save();
            return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    newRating,
                    "rating created successfully"
                    )
                    )
                    }
                    const existingRating = await Rating.findOne({userId:sender,teacherId:id});
                    if(existingRating){
                        existingRating.review = review;
                        // existingRating.rating = req.body.rating;
                        await existingRating.save();
                        return res
                        .status(200)
                        .json(
                            new ApiResponse(
                                200,
                                existingRating,
                                "rating updated successfully"
                                )
                                )
                                }
})

const getReviewsById = asyncHandler(async(req,res)=>{
    console.log("in to bakcend")
    const {id} = req.params;
    const reviews = await Rating.find({teacherId:id});
    if(!reviews){
        return res
        .status(404)
        .json(
            new ApiResponse(
                404,
                null,
                "no reviews found"
                )
                )
                }
                res.status(200).json(reviews);
                
})

  export { registerUser ,loginUser,logoutUser,refreshAccessToken,getUserChannelProfile,getWatchHistory,getAllUsersWhoseRoleIsTeacher,getCurrentUser,editUserProfile,findByLocation,submitRating,getRatingOfTeacher,allUsers,submitreview,getReviewsById};


  //     [
    //         {
    //         $set:{
    //             rating:{
    //                 $cond:{
    //                     if: { $gt: [{ $ifNull: ["$ratingCount", 0] }, 0] },
    //                     then:{
    //                         $divide:[
    //                             {
    //                                 $add:[
    //                                     {
    //                                         $multiply:[
    //                                             {$ifNull:['rating',0]},
    //                                             {$ifNull:['ratingCount',0]}
    //                                         ]
    //                                     },
    //                                     rating
    //                                 ]
    //                             },
    //                             {
    //                                 $add:[{ifNull:['$ratingCount',0]},1]
    //                             }
    //                         ]
    //                     },
    //                     else:{
    //                         rating
    //                     }
                        
    //                 }
    //             },
                
    //             ratingCount:{
    //                 $add:[
    //                     {$ifNull:['ratingCount',0]},1
    //                 ]
    //             }
    //         }
    //     }
    //     ]
    // ).populate('')