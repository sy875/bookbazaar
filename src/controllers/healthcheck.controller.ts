import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { ApiResponse } from "../utils/api-response";

const healthcheck = asyncHandler(async (req: Request, res: Response) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "OK", "Health check passed"));
});

export { healthcheck };
