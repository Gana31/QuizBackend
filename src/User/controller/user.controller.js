import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import {asyncHandler} from '../../../utils/asynchandler.js'
import UserService from "../services/user.service.js";

class userController {

    userRegister = async (req, res, next) => {
        try {
            const { name, email, password, account_type } = req.body;
            
            // Validate input
            if (!name) throw new ApiError(400, "Name is required");
            if (!email) throw new ApiError(400, "Email is required");
            if (!password) throw new ApiError(400, "Password is required");
            if (!account_type) throw new ApiError(400, "Account type is required");

            // Call service method to register user
            const data = await UserService.userRegisterService(req.body);

            // Respond if data is successfully returned
            if (data) {
                res.status(201).json(new ApiResponse(201, "registered successfully", data));
            }
            
        } catch (error) {
            // Pass the error to the global error handler
            next(error);
        }
    }
    userlogin = async (req, res, next) => {
        try {
            const {email, password } = req.body;

            // Validate input
    
            if (!email) throw new ApiError(400, "Email is required");
            if (!password) throw new ApiError(400, "Password is required");


            const data = await UserService.userLoginService(req.body,res);

            // Respond if data is successfully returned
            if (data) {
                res.status(201).json(new ApiResponse(201, "User Login successfully", data));
            }
            
        } catch (error) {
            // Pass the error to the global error handler
            next(error);
        }
    }

    Logout = asyncHandler(async(req,res,next)=>{
        try {
         
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            res.status(200).json(new ApiResponse(200,"user Logout Successful"));
        } catch (error) {
            next(error);
        }
    })

    createprofile = asyncHandler(async (req, res, next) => {
        try {
            const profileData = req.body;
            // console.log(req.body)

        const updatedUser = await UserService.updateUserProfile(req.user.id, profileData);

            // console.log(req.body);            
            res.status(200).json(new ApiResponse(200, "Profile updated successfully", updatedUser));
        } catch (error) {
            next(error)
        }
    });

    getAllUser = asyncHandler(async (req, res, next) => {
        try {
          const userid = req.user?.id;

        const userprofile = await UserService.getAllUserProfile(userid);
            if(!userprofile || userprofile.length == 0 ){
                 return res.status(200).json(new ApiResponse(200, " No Profile Found",userprofile));
            }
            // console.log(req.body);            
            return res.status(200).json(new ApiResponse(200, "Profile fetch successfully", userprofile));
        } catch (error) {
            next(error)
        }
    });
    getUserProfile = asyncHandler(async (req, res, next) => {
        try {
          const {id} = req.body;

        const userprofile = await UserService.getUserProfile(id);
            if(!userprofile || userprofile.length == 0 ){
                 return res.status(200).json(new ApiResponse(200, " No Profile Found",userprofile));
            }
            // console.log(req.body);            
            return res.status(200).json(new ApiResponse(200, "Profile fetch successfully", userprofile));
        } catch (error) {
            next(error)
        }
    });
}

export default new userController();
