import { SKILLS } from "../../Model/skills.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { uploadInCloudinary } from "../Utils/fileUploadInCloud.js";

const postSkill = asyncHandler(async (req,res)=>{
    const {skillToLearn,skillToShare,skillLevel,skillType,skillDescription} = req.body

    console.log("reqbody",req.body)
if(!skillToLearn || !skillToShare || !skillLevel || !skillType || !skillDescription){
    throw new ApiError(400,"Please fill in all fields")
}

console.log("req.file",req.files)
const skillImageFile = req.files?.skillImage[0]?.path;

// if (!skillImageFile) {
//     throw new ApiError(400,'skill image is required');
//     }

    let skillVideoFile = "" ;
    if (req.files && req.files.skillVideo && req.files.skillVideo[0]) {
        skillVideoFile = req.files.skillVideo[0].path;
        }

        let certificatesFile = "";
        if (req.files && req.files.certifications && req.files.certifications[0]) {
            certificatesFile = req.files.certifications[0].path;
            }

            const skillImage = await uploadInCloudinary(skillImageFile);
            const skillVideo = skillVideoFile ?  await uploadInCloudinary(skillVideoFile) : null;
            const certification = certificatesFile ? await uploadInCloudinary(certificatesFile) : null;

// if(!skillImage){
//     throw new ApiError(400,"Failed to upload skill image")
// }

            const newSkill = await SKILLS.create({
                skillToLearn,
                skillToShare,
                skillLevel,
                skillType,
                skillDescription,
                skillImage:skillImage?.url || "",
                skillVideo:skillVideo?.url || "",
                certifications:certification?.url || "",
                owner:req.user._id
            });

            const populatedNewSkill = await SKILLS.findById(newSkill._id).populate("owner" )
            console.log("newSkill",populatedNewSkill);
            return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    populatedNewSkill,
                    "Skill created successfully"
                )
            )


})

const allSkills = asyncHandler(async(req,res)=>{

   const userId = req.user._id;
    const skills = await SKILLS.find({
        owner: { $ne: userId }
    })
    if(!skills){
        throw new ApiError(404,"No skills found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            skills,
            "Skills found successfully"
            )
    )
})

const skillSearch = asyncHandler(async (req, res) => {
    const { skillToLearn, skillToShare } = req.query;
  
    // Make sure the query params are provided
    if (!skillToLearn || !skillToShare) {
      return res.status(400).json({ message: "Please provide both skills to learn and share." });
    }
  
    // Construct the search query using MongoDB $regex
    const searchQuery = {
      $and: [
        { skillToLearn: { $regex: skillToLearn, $options: 'i' } },  // Case-insensitive search
        { skillToShare: { $regex: skillToShare, $options: 'i' } },  // Case-insensitive search
      ],
    };
  
    // Perform the search
    const skills = await SKILLS.find(searchQuery);
  
    // If no skills are found, return a 404
    if (!skills || skills.length === 0) {
      throw new ApiError(404, "No skills found matching the criteria");
    }
  
    // Return the results
    return res.status(200).json(
      new ApiResponse(200, skills, "Skills fetched successfully")
    );
  });
  

export {postSkill,allSkills,skillSearch}