import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";
import { userRepository } from "../repositories/user.repository.js";
import { generateToken } from "../utils/jwt.js";
import { generateInitials, generateAvatarColor, generateUsername } from "../utils/avatar.js";
import { UnauthorizedError } from "../utils/errors.js";
import logger from "../utils/logger.util.js";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(idToken: string) {
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            throw new UnauthorizedError("Invalid Google token payload");
        }

        return {
            email: payload.email,
            name: payload.name || payload.email.split("@")[0],
            picture: payload.picture,
        };
    } catch (error) {
        logger.error("Google token verification failed", { error });
        throw new UnauthorizedError("Invalid Google token");
    }
}

async function generateUniqueUsername(name: string): Promise<string> {
    const maxAttempts = 10;

    for (let i = 0; i < maxAttempts; i++) {
        const username = generateUsername(name);
        const existing = await userRepository.findByUsername(username);
        if (!existing) {
            return username;
        }
    }

    return `user${Date.now()}`;
}

export async function authenticateWithGoogle(idToken: string) {
    const googleUser = await verifyGoogleToken(idToken);

    let user = await userRepository.findByEmail(googleUser.email);

    if (!user) {
        const username = await generateUniqueUsername(googleUser.name);

        user = await userRepository.create({
            email: googleUser.email,
            name: googleUser.name,
            username,
            initials: generateInitials(googleUser.name),
            avatarColor: generateAvatarColor(),
            avatarUrl: googleUser.picture,
        });

        logger.info("New user created", { userId: user.id, email: user.email });
    } else {
        await userRepository.updateOnlineStatus(user.id, true);
        logger.info("User logged in", { userId: user.id, email: user.email });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return { user, token };
}

export async function logout(userId: string) {
    await userRepository.updateOnlineStatus(userId, false);
    logger.info("User logged out", { userId });
}
