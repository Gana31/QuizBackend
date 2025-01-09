import dotenv from 'dotenv'

dotenv.config();

const config ={
    ORIGIN : process.env.ORIGIN,
    PORT : process.env.PORT,
    DB_URI:process.env.DB_URI,
    ACCESS_TOKEN_SECRET : process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET : process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY : process.env.ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY : process.env.REFRESH_TOKEN_EXPIRY,
    CLOUDINARY_CLOUD_NAME : process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    NODE_ENV:process.env.NODE_ENV,
    RAZORPAY_SECRET:process.env.RAZORPAY_SECRET,
    RAZORPAY_KEY:process.env.RAZORPAY_KEY,
}

export default Object.freeze(config);