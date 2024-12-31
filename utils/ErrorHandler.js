// errorHandler.js
import { ApiError } from "./ApiError.js";

const ErrorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            data: err.data,
        });
    }

    // Handle Sequelize validation errors
    if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
        const errors = err.errors.map((e) => e.message);
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors,
        });
    }

    // Handle other errors
    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};

export default ErrorHandler;
