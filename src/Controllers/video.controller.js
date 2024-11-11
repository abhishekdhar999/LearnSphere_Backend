import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { Video } from "../../Model/video.model.js";
import { uploadInCloudinary } from "../Utils/fileUploadInCloud.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { User } from "../../Model/user.model.js";

const publishvideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
const id = req.user._id;
console.log("id",id)
const user = await User.findById(id);
if (!user) {
    throw new ApiError(404, "User not found");
    }
    if(user.role !== 'Teacher'){
        throw new ApiError(403, "You are not authorized to publish a video");
    }

    if(!title || !description){
        throw new ApiError(400,"Please fill all the fields");
    }
    console.log("req.files",req.files);
    const videoLocalFilePath = req.files?.videoFile[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
// const thumbNailLocalFilePath = req.files?.thumbnail[0]?.path;

    if(!videoLocalFilePath  ){
        throw new ApiError(400, "videopath  path not found")
    }
    
    const videoUpload = await uploadInCloudinary(videoLocalFilePath);

    const coverImage = await uploadInCloudinary(coverImageLocalPath)

    const  video =await Video.create({
        videoFile:videoUpload?.url,
        thumbnail:coverImage?.url || "",
        title,
        description,
        duration:2,
        owner:id
    })

    const populatedVideo = await Video.findById(video._id).populate("owner")
    if(!video){
        throw new ApiError(400, "video not found");
    }

    return res.status(201).json(
        new ApiResponse(200, populatedVideo, "video created Successfully")
    )
});

const deleteVideo = asyncHandler(async(req,res)=>{

    const id = req.user._id;

const user = await User.findById(id);
if (!user) {
    throw new ApiError(404, "User not found");
    }
    if(user.role !== 'Teacher'){
        throw new ApiError(403, "You are not authorized to publish a video");
    }
   try {
    //  const  videoId  = req.params.id.toString();
     console.log("hello");
    //  if(!videoId){
    //      throw new ApiError(400,"id not found")
    //  }
     res.send("hello")
   } catch (error) {
    console.log("error")
   }
    
//     const teacherId = req.teacher.id;
//     const id = req.params.id;
// // const ownerId = await Video.find(teacherId)

//     const video = await Video.findById(videoId);
//     if(!video){
//         throw new ApiError(404, "Video not found");
//         }

//         if (video.owner.toString() !== teacherId.toString()) {
//             return res.status(403).json({ message: 'You are not authorized to delete this video' });
//         }
        
//         await Video.findByIdAndDelete(id)

//         return res.status(200).json(
//             new ApiResponse(200, "Video deleted successfully")
//             )
})

const getAllVideos = asyncHandler(async(req,res)=>{
    
        const userId  =  req.user._id;

        const allVideos = await Video.aggregate(
            [
                {
                    $match: {
                        owner: userId
                }
            }
            ]
        )
if(!allVideos){
    throw new ApiError(404, "Video not found");

}

return res
.status(200)
.json(
    new ApiResponse(200,allVideos, "Videos fetched successfully")
)

})

const entireVideos = asyncHandler(async(req,res)=>{
    const userId  =  req.user._id;
    if(!userId){
        throw new ApiError(404, "login first");
    }
    const videos = await Video.find().populate("owner");
    typeof(videos)
    if(!videos){
        throw new ApiError(404, "Video not found");
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200,videos, "Videos fetched successfully")
        )
})

export {publishvideo,deleteVideo,getAllVideos,entireVideos} 