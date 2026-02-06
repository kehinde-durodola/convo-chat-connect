import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
    // Server
    PORT: z.string().default("3001"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // Database
    DATABASE_URL: z.string().url(),

    // JWT
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default("7d"),

    // Google OAuth
    GOOGLE_CLIENT_ID: z.string(),

    // Cloudinary
    CLOUDINARY_CLOUD_NAME: z.string(),
    CLOUDINARY_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),

    // Frontend URL (for CORS)
    FRONTEND_URL: z.string().url(),
});

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("Invalid environment variables:");
    console.error(parsedEnv.error.format());
    process.exit(1);
}

export const env = parsedEnv.data;

export type Env = z.infer<typeof envSchema>;
