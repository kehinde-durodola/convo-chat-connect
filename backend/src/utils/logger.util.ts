import { env } from "../config/env.js";

const isDevelopment = env.NODE_ENV === "development";

export const logger = {
    info: (message: string, meta?: unknown) => {
        console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta, null, 2) : "");
    },
    warn: (message: string, meta?: unknown) => {
        console.warn(
            `[WARN] ${message}`,
            meta ? JSON.stringify(meta, null, 2) : ""
        );
    },
    error: (message: string, meta?: unknown) => {
        console.error(
            `[ERROR] ${message}`,
            meta ? JSON.stringify(meta, null, 2) : ""
        );
    },
    debug: (message: string, meta?: unknown) => {
        if (isDevelopment) {
            console.log(
                `[DEBUG] ${message}`,
                meta ? JSON.stringify(meta, null, 2) : ""
            );
        }
    },
};

export default logger;
