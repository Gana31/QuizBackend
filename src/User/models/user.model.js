import bcrypt from 'bcryptjs'
import { DataTypes } from 'sequelize';
import jwt from "jsonwebtoken"
import { sequelize } from '../../../config/databaseconfig.js';
import ServerConfig from '../../../config/ServerConfig.js';
import { ApiError } from '../../../utils/ApiError.js';
const validateEmail = (email) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const random_profile = () => {
  const img_urls = [
    "https://res.cloudinary.com/dnyhn7loo/image/upload/v1732534321/profile_images/g1xzno2gegyixplrqky2.webp",
    "https://res.cloudinary.com/dnyhn7loo/image/upload/v1732534320/profile_images/xyrs8o9vgo8qjhz1dlaw.webp",
    "https://res.cloudinary.com/dnyhn7loo/image/upload/v1732534320/profile_images/lhwlf42g7q5wzqafrkfu.webp",
    "https://res.cloudinary.com/dnyhn7loo/image/upload/v1732534320/profile_images/mzsr5qkbppzbix9xl89w.webp",
    "https://res.cloudinary.com/dnyhn7loo/image/upload/v1732534320/profile_images/kpt4t3bkjkvi63gtaduy.webp"
  ]
  const idx = Math.floor(Math.random() * img_urls.length);
  return img_urls[idx];
};

const QuizeUserModel = sequelize.define('quizusers', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notNull: { msg: "Email is required" },
        notEmpty: { msg: "Email is required" },
        isEmail: function (value) {
          if (value !== "" && !validateEmail(value)) {
            throw new ApiError(400,"Invalid Email Address");
          }
        },
        async isUnique(value) {
          const existingUser = await QuizeUserModel.findOne({
            where: {
              email: value,
              deletedAt: null,
              isActive: true,
            },
          });
          if (existingUser) {
            throw new Error("Email already in use!");
          }
        },
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [8],
            msg: "Password must be at least 8 characters long",
          },
          notNull: { msg: "Password is required" },
          notEmpty: { msg: "Password cannot be empty" },
          isStrongPassword(value) {
            const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
            if (!regex.test(value)) {
              throw new ApiError(
                400,
                "Password must contain at least 8 characters, including a letter and a number."
              );
            }
          },
        },
      },
      
    avatar: {
      type: DataTypes.STRING,
      defaultValue: random_profile(),
    },
    account_type: {
        type: DataTypes.ENUM("User", "Teacher"),
        allowNull: false,
        defaultValue: "User",
        validate: {
          isIn: {
            args: [["User", "Teacher"]],
            msg: "Role must be one of: User or Worker",
          },
          notEmpty: {
            msg: "Account type cannot be empty",
          },
          notNull: { msg: "Account type is required" },
          isValidAccountType(value) {
            if (!["User", "Teacher"].includes(value)) {
              throw new ApiError(400, "Invalid account type specified.");
            }
          },
        },
      },
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'quizusers',
    timestamps: true,
    underscored: true,
    paranoid: true,
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ["password"] },
      },
    },
  });

  QuizeUserModel.addHook('beforeCreate', async (user) => {
    try {
      user.avatar = random_profile();
      if (user.changed("password")) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    } catch (error) {
        throw error
    //   throw new ApiError(500, error.message || "Error during user creation: ");
    }
  });


  QuizeUserModel.addHook("beforeValidate", async (user) => {
  try {
    if (!user.account_type || !["User", "Teacher"].includes(user.account_type)) {
      throw new ApiError(400, "Invalid account type. It must be either 'User' or 'Teacher'.");
    }

    if (user.password) {
    
      if (user.password.length <8) {
        throw new ApiError(
          400,
          "Password must contain at least 8 characters, including a letter and a number."
        );
      }
    }
  } catch (error) {
    throw(error);
  }
});
  

QuizeUserModel.prototype.getJWTToken = function () {
    return jwt.sign({ userId: this.id },ServerConfig.ACCESS_TOKEN_SECRET);
  };
  QuizeUserModel.prototype.getAccessToken = function () {
    return jwt.sign({ userId: this.id }, ServerConfig.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
  };
  
  QuizeUserModel.prototype.getRefreshToken = function () {
    return jwt.sign({ userId: this.id }, ServerConfig.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  };
  
  QuizeUserModel.prototype.comparePassword = async function (enteredPassword) {
    // console.log("password", enteredPassword, this.password);
    return await bcrypt.compare(enteredPassword, this.password);
  };

  export default QuizeUserModel;