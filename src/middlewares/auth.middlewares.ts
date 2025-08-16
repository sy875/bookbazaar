import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { User } from "../models/user.models.js";
import { MyJwtPayload } from "../types/user.js";
import { EXCLUDE_API_KEY_VERIFICATION } from "../utils/constants.js";
import { ApiKey } from "../models/apikey.models.js";
import crypto from "crypto";

export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    try {
      const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as MyJwtPayload;
      const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
      );
      if (!user) {
        // Client should make a request to /api/v1/users/refresh-token if they have refreshToken present in their cookie
        // Then they will get a new access token which will allow them to refresh the access token without logging out the user
        throw new ApiError(401, "Invalid access token");
      }
      req.user = user;
      next();
    } catch (error) {
      // Client should make a request to /api/v1/users/refresh-token if they have refreshToken present in their cookie
      // Then they will get a new access token which will allow them to refresh the access token without logging out the user
      throw new ApiError(
        401,
        error instanceof Error ? error.message : "Invalid access token"
      );
    }
  }
);

/**
 * @param {AvailableUserRoles} roles
 * @description
 * * This middleware is responsible for validating multiple user role permissions at a time.
 * * So, in future if we have a route which can be accessible by multiple roles, we can achieve that with this middleware
 */
export const verifyPermission = (roles = ["admin"]) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?._id) {
      throw new ApiError(401, "Unauthorized request");
    }
    if (roles.includes(req.user?.role)) {
      next();
    } else {
      throw new ApiError(403, "You are not allowed to perform this action");
    }
  });

/**
 * @description This middleware is responsible for validating api key
 */
export const verifyApiKey = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith(EXCLUDE_API_KEY_VERIFICATION)) return next();
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      await new Promise<void>((resolve, reject) => {
        try {
          verifyJWT(req, res, (err?: any) => {
            if (err) return reject(err);
            resolve();
          });
        } catch (err) {
          reject(err);
        }
      });
    }

    if (req.user) {
      return next();
    }

    const incomingApiKey = req.header("x-api-key") || req.query.apiKey;

    if (!incomingApiKey || typeof incomingApiKey != "string") {
      throw new ApiError(401, "Api key is required");
    }

    const hashedApiKey = crypto
      .createHash("sha256")
      .update(incomingApiKey)
      .digest("hex");

    const apiKeyExist = await ApiKey.findOne({ key: hashedApiKey });

    if (!apiKeyExist || !apiKeyExist.isActive) {
      throw new ApiError(401, "Invalid Api key");
    }

    next();
  }
);
