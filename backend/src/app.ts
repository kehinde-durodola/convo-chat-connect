import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { requestIdMiddleware } from "./utils/requestId.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.middleware.js";
import routes from "./routes/index.js";
import logger from "./utils/logger.util.js";

const app = express();

app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestIdMiddleware);

app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`, { requestId: req.requestId });
    next();
});

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
