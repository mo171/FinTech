// Require the cloudinary library
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloundinary = async (filePath) => {
  try {
    if (!filePath) return null;
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(filePath); // Delete the local file after upload

    return response;
  } catch (error) {
    fs.unlinkSync(filePath);
    console.error("Error uploading to Cloudinary:", error);
    return null;
  }
};

export { uploadOnCloundinary };
