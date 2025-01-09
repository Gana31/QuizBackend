import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ServerConfig from '../../../config/ServerConfig.js';
import { ApiError } from '../../../utils/ApiError.js';

// Helper function to validate email format
const validateEmail = (email) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

// Helper function to validate password
const validatePassword = (password) => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

// Helper function to generate random profile image
const random_profile = () => {
  const img_urls = [
    "https://res.cloudinary.com/dnyhn7loo/image/upload/v1732534321/profile_images/g1xzno2gegyixplrqky2.webp",
    "https://res.cloudinary.com/dnyhn7loo/image/upload/v1732534320/profile_images/xyrs8o9vgo8qjhz1dlaw.webp",
    "https://res.cloudinary.com/dnyhn7loo/image/upload/v1732534320/profile_images/lhwlf42g7q5wzqafrkfu.webp",
    "https://res.cloudinary.com/dnyhn7loo/image/upload/v1732534320/profile_images/mzsr5qkbppzbix9xl89w.webp",
    "https://res.cloudinary.com/dnyhn7loo/image/upload/v1732534320/profile_images/kpt4t3bkjkvi63gtaduy.webp"
  ];
  const idx = Math.floor(Math.random() * img_urls.length);
  return img_urls[idx];
};

const QuizeUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    validate: {
      validator: validateEmail,
      message: 'Invalid Email Address',
    },
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  avatar: {
    type: String,
    default: random_profile,
  },
  account_type: {
    type: String,
    enum: ['User', 'Teacher'],
    default: 'User',
    required: true,
  },
  refresh_token: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  versionKey: false,
});

// Pre-save hook to hash password and set random avatar
QuizeUserSchema.pre('save', async function(next) {
  // Check the plain-text password before hashing
  if (this.isModified('password') && !validatePassword(this.password)) {
    throw new ApiError(400,'Password must contain at least 8 characters, including a letter and a number.');
  }
  
  // Only hash the password if it's new or modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  this.avatar = random_profile();
  next();
});

// Method to generate JWT token
QuizeUserSchema.methods.getJWTToken = function() {
  return jwt.sign({ userId: this._id }, ServerConfig.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
};

// Method to generate Access Token
QuizeUserSchema.methods.getAccessToken = function() {
  return jwt.sign({ userId: this._id }, ServerConfig.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
};

// Method to generate Refresh Token
QuizeUserSchema.methods.getRefreshToken = function() {
  return jwt.sign({ userId: this._id }, ServerConfig.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

// Method to compare password
QuizeUserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create the Mongoose model
const QuizeUserModel = mongoose.model('QuizeUser', QuizeUserSchema);

export default QuizeUserModel;
