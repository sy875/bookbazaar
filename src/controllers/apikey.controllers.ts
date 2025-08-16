import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiKey } from "../models/apikey.models.js";
import { ApiError } from "../utils/api-error.js";
import crypto from "crypto";
import { ApiResponse } from "../utils/api-response.js";


export const createApiKey = asyncHandler(
  async (req: Request, res: Response) => {
    const { title } = req.body;
    const apiKeyExist = await ApiKey.find({ owner: req.user._id });

    if (apiKeyExist.length > 0) {
      throw new ApiError(409, "ApiKey exist for the user");
    }

    const generatedApiKey = crypto.randomBytes(10).toString("base64url");

    const hashedApiKey = crypto
      .createHash("sha256")
      .update(generatedApiKey)
      .digest("hex");

    const apikey = await ApiKey.create({
      title,
      owner: req.user._id,
      key: hashedApiKey,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { apikey: generatedApiKey },
          "Api key generated successfully"
        )
      );
  }
);

export const getApiKeys = asyncHandler(async (req: Request, res: Response) => {
  const apiKeys = await ApiKey.find({ owner: req.user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, apiKeys, "Api keys fetched successfully"));
});

export const updateApiKey = asyncHandler(
  async (req: Request, res: Response) => {
    const { apikeyId } = req.params;
    const { isActive } = req.body;

    const apikeyExist = await ApiKey.findById(apikeyId).populate("owner");

    console.log(apikeyExist);

    if (!apikeyExist) {
      throw new ApiError(409, "ApiKey Does not exist");
    }

    if (apikeyExist.owner?._id.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You do not have permission");
    } 

    const apikey = await ApiKey.findByIdAndUpdate(
      apikeyId,
      { $set: { isActive } },
      { new: true }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { updatedApiKey: apikey },
          "Api key updated successfully"
        )
      );
  }
);

export const deleteApiKey = asyncHandler(
  async (req: Request, res: Response) => {
    const { apikeyId } = req.params;
    const apikey = await ApiKey.findByIdAndDelete(apikeyId);

    if (!apikey) {
      throw new ApiError(409, "ApiKey Does not exist");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { deletedApiKey: apikey },
          "Api key deleted successfully"
        )
      );
  }
);
