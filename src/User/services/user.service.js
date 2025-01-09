import UserRepository from "../repository/user.repository.js";
import { ApiError } from "../../../utils/ApiError.js";
import { generateTokensAndSetCookies } from "../../../utils/jwtCookie.js";

const Userrepository = new UserRepository();

class UserService {
    userRegisterService = async (data) => {
        const { email } = data;
        try {
            if (!data) {
                throw new ApiError(400, "No data received in service layer");
            }

            // Check if user already exists
            const userExist = await Userrepository.findByEmail(email);
            if (userExist) {
                // If user exists, throw an error
                throw new ApiError(400, "This email is already registered. Please log in.");
            }

            // If user doesn't exist, create the new user
            const response = await Userrepository.create(data);
            return response;

        } catch (error) {
            throw error;  // Rethrow the error to be handled by the controller
        }
    };

    userLoginService = async (data, res) => {
        const { email } = data;
        try {
            if (!data) {
                throw new ApiError(400, "No data received in service layer");
            }

            // Check if user exists
            const userExist = await Userrepository.findOne({ email, isActive: true });
            if (!userExist) {
                // If user doesn't exist, throw an error
                throw new ApiError(400, "This email is not registered. Please Register first.");
            }

            const match = await userExist.comparePassword(data.password);
            if (!match) {
                throw new ApiError(400, "Password is not valid");
            }

            const { user1 } = generateTokensAndSetCookies(userExist, res);
            const user2 = user1.toJSON();
            delete user2.password;

            return { user2, accessToken: true };

        } catch (error) {
            throw error;
        }
    };

    updateUserProfile = async (userId, profileData) => {
        try {
            const user = await Userrepository.findById(userId);
            if (!user) {
                throw new ApiError(404, "User not found");
            }

            await user.update(profileData);
            return user;
        } catch (error) {
            throw error;
        }
    };

    getAllUserProfile = async () => {
        try {
            const users = await Userrepository.findAll();
            return users;
        } catch (error) {
            throw error;
        }
    };

    getUserProfile = async (userId) => {
        try {
            const user = await Userrepository.findById(userId);
            if (!user) {
                throw new ApiError(404, "User not found");
            }
            if (user.refresh_token != null) {
                user.refresh_token = "";
            }

            return user;
        } catch (error) {
            throw error;
        }
    };
}

export default new UserService();
