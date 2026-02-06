import { userRepository } from "../repositories/user.repository.js";
import { NotFoundError, ConflictError } from "../utils/errors.js";
import { generateInitials } from "../utils/avatar.js";
import { UpdateProfileInput } from "../schemas/user.schema.js";
import { uploadImage, deleteImage } from "./cloudinary.service.js";

export async function getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
        throw new NotFoundError("User not found");
    }
    return user;
}

export async function getAllUsers(excludeUserId?: string, search?: string) {
    return userRepository.findAll(excludeUserId, search);
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
    if (data.username) {
        const existing = await userRepository.findByUsername(data.username);
        if (existing && existing.id !== userId) {
            throw new ConflictError("Username already taken");
        }
    }

    const updateData: Record<string, unknown> = { ...data };

    if (data.name) {
        updateData.initials = generateInitials(data.name);
    }

    return userRepository.update(userId, updateData);
}

export async function updateAvatar(userId: string, file: Express.Multer.File) {
    const user = await userRepository.findById(userId);
    if (!user) {
        throw new NotFoundError("User not found");
    }

    if (user.avatarUrl && user.avatarUrl.includes("cloudinary")) {
        const publicId = extractPublicId(user.avatarUrl);
        if (publicId) {
            await deleteImage(publicId);
        }
    }

    const avatarUrl = await uploadImage(file, "convo/avatars");
    await userRepository.update(userId, { avatarUrl });

    return avatarUrl;
}

function extractPublicId(url: string): string | null {
    const match = url.match(/\/v\d+\/(.+)\.\w+$/);
    return match ? match[1] : null;
}

export async function setOnlineStatus(userId: string, isOnline: boolean) {
    return userRepository.updateOnlineStatus(userId, isOnline);
}
