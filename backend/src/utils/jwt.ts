import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface JwtPayload {
    userId: string;
    email: string;
}

export function generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function decodeToken(token: string): JwtPayload | null {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded === "string") {
        return null;
    }
    return decoded as JwtPayload;
}
