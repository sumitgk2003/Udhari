import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
export const verifyAccessToken = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(402, "Unathorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select("-accessToken");

    if (!user) {
      throw new ApiError(401, "Invalid AccessToken1");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.clearCookies("accessToken", { httpOnly: true, secure: true });
      throw new ApiError(401, "Token expired");
    } else {
      throw new ApiError(
        403,
        error.message || "Something went wrong while auth middleware"
      );
    }
  }
});
