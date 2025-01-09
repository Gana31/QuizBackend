import jwt from "jsonwebtoken";
import ServerConfig from "../../config/ServerConfig.js";
import { ApiError } from "../../utils/ApiError.js";
import { generateTokensAndSetCookies } from "../../utils/jwtCookie.js";
import { QuizeUserModel } from "../User/index.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    if (accessToken) {
      try {
        // Verify the access token
        const decoded = jwt.verify(accessToken, ServerConfig.ACCESS_TOKEN_SECRET);

        // Fetch the user by userId from the decoded JWT
        const user = await QuizeUserModel.findById(decoded.userId); // MongoDB equivalent of findOne by ID
        if (!user) {
          throw new ApiError(401, "User not found");
        }

        req.user = { id: user._id, role: user.account_type }; // Store user info and role

        // Check for the specific role required to access the route
        if (req.requiredRole && req.user.role !== req.requiredRole) {
          throw new ApiError(403, "Forbidden: You do not have the required role");
        }

        // If no refreshToken and access token is valid, move to the next middleware
        if (!refreshToken) {
          generateTokensAndSetCookies(user, res); // Set a new access token
        }

        return next();
      } catch (err) {
        throw new ApiError(401, "Access token expired or invalid");
      }
    }

    // If no access token, check for refresh token
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, ServerConfig.REFRESH_TOKEN_SECRET);

        // Fetch the user by userId from the decoded JWT
        const user = await QuizeUserModel.findById(decoded.userId);
        if (!user) {
          res.clearCookie('accessToken');
          res.clearCookie('refreshToken');
          throw new ApiError(401, "Invalid refresh token");
        }

        generateTokensAndSetCookies(user, res);
        req.user = { id: user._id, role: user.account_type }; // Store user info and role

        // Check for the specific role required to access the route
        if (req.requiredRole && req.user.role !== req.requiredRole) {
          throw new ApiError(403, "Forbidden: You do not have the required role");
        }

        return next();
      } catch (err) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        throw new ApiError(401, "Session expired. Please log in again.");
      }
    }

    throw new ApiError(401, "Session expired. Please log in again.", "AUTH_ERROR");
  } catch (error) {
    console.log(error);
    next(new ApiError(401, error.message || "Error while authenticating"));
  }
};

// Role requirement middleware
export const requireRole = (role) => {
  return (req, res, next) => {
    req.requiredRole = role;
    next();
  };
};
