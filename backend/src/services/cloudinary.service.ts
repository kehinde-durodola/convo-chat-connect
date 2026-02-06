import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { InternalServerError } from "../utils/errors.js";
import logger from "../utils/logger.util.js";

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
    file: Express.Multer.File,
    folder: string = "convo"
): Promise<string> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder,
                    resource_type: "image",
                    transformation: [
                        { width: 800, height: 800, crop: "limit" },
                        { quality: "auto" },
                        { fetch_format: "auto" },
                    ],
                },
                (error, result) => {
                    if (error) {
                        logger.error("Cloudinary upload failed", { error });
                        reject(new InternalServerError("Image upload failed"));
                    } else if (result) {
                        resolve(result.secure_url);
                    } else {
                        reject(new InternalServerError("Image upload failed"));
                    }
                }
            )
            .end(file.buffer);
    });
}

export async function deleteImage(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        logger.error("Cloudinary delete failed", { error, publicId });
    }
}
