import { v2 as cloudinary } from 'cloudinary';
import { fstatSync } from 'fs';

 
 const uploadInCloudinary = async (filePath)=>{
    cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.CLOUD_API_KEY, 
        api_secret: process.env.CLOUD_API_SECRET // Click 'View API Keys' above to copy your API secret
    });
try {
    if(!filePath){
        return null;
    }
    const uploadResult = await cloudinary.uploader.upload(filePath, {
        resource_type: "auto",
        public_id:"images"
    })

    console.log("file uploaded successfully",uploadResult);
    return uploadResult;
} catch (error) {
    // fs.unlinkSync(filePath)
    console.log("Error uploading file to cloudinary", error);
    // removing the file 
}

const optimizeUrl = cloudinary.url('images',{
    fetch_format: 'auto',
    quality: 'auto'
})
   
console.log(optimizeUrl);

const autoCropUrl = cloudinary.url('images', {
    crop: 'auto',
    gravity: 'auto',
    width: 500,
    height: 500,
});

console.log(autoCropUrl); 
}

export {uploadInCloudinary}