import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

export const cloudinaryUpload = async function (filePath) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    const uploadResult = await cloudinary.uploader.upload(filePath)
    return uploadResult;
};

export const cloudinaryDelete = async function (publicId) {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === "ok") {
        return true;
    } else {
        return false;
    }
}