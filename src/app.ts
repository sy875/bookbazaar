import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import YAML from "yaml";


import {
  errorHandler,
} from "./middlewares/error.middlewares.js";
import morganMiddleware from "./logger/morgan.logger.js";

const file = fs.readFileSync(path.resolve(__dirname, "../swagger.yaml"), "utf8");
const swaggerDocument = YAML.parse(
  file?.replace(
    "- url: ${{server}}",
    `- url: ${
      process.env.BookBazaar_HOST_URL || "http://localhost:3000"
    }/api/v1`
  )
);

const app = express();
app.use(morganMiddleware);
// global middlewares
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN === "*"
        ? "*" // This might give CORS error for some origins due to credentials set to true
        : process.env.CORS_ORIGIN?.split(","), // For multiple cors origin for production. Refer https://github.com/hiteshchoudhary/apihub/blob/a846abd7a0795054f48c7eb3e71f3af36478fa96/.env.sample#L12C1-L12C12
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // configure static file to save images locally
app.use(cookieParser());



import healthcheckRouter from "./routes/healthcheck.routes.js";

import userRouter from "./routes/user.routes.js";
import bookRouter from "./routes/book.routes.js";



// * healthcheck
app.use("/api/v1/healthcheck", healthcheckRouter);

// * App apis
app.use("/api/v1/users", userRouter);
app.use("/api/v1/books", bookRouter);

// * API DOCS
// ? Keeping swagger code at the end so that we can load swagger on "/" route
app.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    swaggerOptions: {
      docExpansion: "none", // keep all the sections collapsed by default
    },
    customSiteTitle: "bookBazaar docs",
  })
);

// common error handling middleware
app.use(errorHandler);

export default app;
