// UserService.js
import { Op } from "sequelize";
import { ApiError } from "../../../utils/ApiError.js";
import { generateTokensAndSetCookies } from "../../../utils/jwtCookie.js";
import UserRepository from "../repository/user.repository.js";

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
    }
    userLoginService = async (data,res) => {
        const { email } = data;
        // console.log(data.password);
        try {
            if (!data) {
                throw new ApiError(400, "No data received in service layer");
            }

            // Check if user already exists
            const userExist = await Userrepository.model.scope('withPassword').findOne({ where: { email ,isActive: true } });
            if (!userExist) {
                // If user exists, throw an error
                throw new ApiError(400, "This email is not registered. Please Register first.");
            }
            // console.log(userExist);
            const match = await userExist.comparePassword(data.password);
            if(!match){
                throw new ApiError(400,"Password is no valid");
            }
            const{user1} =generateTokensAndSetCookies(userExist, res);
            const user2 = user1.toJSON();
            delete user2.password;
            const accessToken = true
            return {user2,accessToken};

        } catch (error) {
            throw error;  
        }
    }

    updateUserProfile = async (userId, profileData) => {
        try {
            const user = await Userrepository.findOne({ where: { id:userId} });
            if (!user) {
                throw new ApiError(404, "User not found");
            }
            await user.update(profileData);

            return user;
        } catch (error) {
            throw error;
        }
    };

    getAllUserProfile = async (userid) => {
        try {
            const users = await Userrepository.findAll();
    
            return users;
        } catch (error) {
            throw error;
        }
    };

    getUserProfile = async (userid) => {
        try {
            const users = await Userrepository.findOne({
                where: {
                    id:userid , 
                },
            });
            if(users.refresh_token != null){
                 users.refresh_token = ""
            }
            
            // console.log(users);
            return users;
        } catch (error) {
            throw error;
        }
    };
    
}

export default new UserService();
