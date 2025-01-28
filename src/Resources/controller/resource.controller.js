import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asynchandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import ResourceQuizService from "../services/resource.services.js";

class ResourceController {
    // Resource CRUD Methods

    createResource = asyncHandler(async (req, res, next) => {
        const user = req.user;
        const resourceData = req.body;

        if (!resourceData.name) throw new ApiError(400, "Resource name is required");
        if (!resourceData.description) throw new ApiError(400, "Resource description is required");
        if (!resourceData.category) throw new ApiError(400, "Resource category is required");

        const newResource = await ResourceQuizService.createResourceQuiz(resourceData, user);
        res.status(201).json(new ApiResponse(201, "Resource created successfully", newResource));
    });


    getResourceById = asyncHandler(async (req, res, next) => {
        const { resourceId } = req.params;

        if (!resourceId) throw new ApiError(400, "Resource ID is required");

        const resource = await ResourceQuizService.getResourceById(resourceId);
        res.status(200).json(new ApiResponse(200, "Resource fetched successfully", resource));
    });

    updateResource = asyncHandler(async (req, res, next) => {
        const { resourceId } = req.params;
        const user = req.user;
        const resourceData = req.body;

        if (!resourceData.name) throw new ApiError(400, "Resource name is required");

        const updatedResource = await ResourceQuizService.updateResourceQuiz(resourceId, resourceData, user);
        res.status(200).json(new ApiResponse(200, "Resource updated successfully", updatedResource));
    });

    deleteResource = asyncHandler(async (req, res, next) => {
        const { resourceId } = req.params;
        const user = req.user;

        if (!resourceId) throw new ApiError(400, "Resource ID is required");

        await ResourceQuizService.deleteResourceQuiz(resourceId, user);
        res.status(200).json(new ApiResponse(200, "Resource deleted successfully"));
    });

    // Question CRUD Methods

    createQuestion = asyncHandler(async (req, res, next) => {
        const user = req.user;
        const questionData = req.body;

        if (!questionData.title) throw new ApiError(400, "Question title is required");

        const newQuestion = await ResourceQuizService.createQuestion(questionData, user);
        res.status(201).json(new ApiResponse(201, "Question created successfully", newQuestion));
    });

    getQuestionsByResource = asyncHandler(async (req, res, next) => {
        const { resourceId } = req.params;

        if (!resourceId) throw new ApiError(400, "Resource ID is required");

        const questions = await ResourceQuizService.getQuestionsByResource(resourceId);
        res.status(200).json(new ApiResponse(200, "Questions fetched successfully", questions));
    });

    updateQuestion = asyncHandler(async (req, res, next) => {
        const { questionId } = req.params;
        const user = req.user;
        const questionData = req.body;

        if (!questionData.title) throw new ApiError(400, "Question title is required");

        const updatedQuestion = await ResourceQuizService.updateQuestion(questionId, questionData, user);
        res.status(200).json(new ApiResponse(200, "Question updated successfully", updatedQuestion));
    });

    deleteQuestion = asyncHandler(async (req, res, next) => {
        const { questionId } = req.params;
        const user = req.user;

        if (!questionId) throw new ApiError(400, "Question ID is required");

        await ResourceQuizService.deleteQuestion(questionId, user);
        res.status(200).json(new ApiResponse(200, "Question deleted successfully"));
    });

    // Fetch User Resources

    getAllAdminResources = asyncHandler(async (req, res, next) => {
        const user = req.user;
        const resources = await ResourceQuizService.getAllAdminResources(user);
      
        res.status(200).json(new ApiResponse(200, "All Admin resources fetched successfully", resources));
    });

    getAllResourcesWithCategories = asyncHandler(async (req, res, next) => {
      

        const { resources, categories } = await ResourceQuizService.getAllResourcesWithCategories();
        res.status(200).json(
            new ApiResponse(200, "Resources and categories fetched successfully", {
                resources,
                categories,
            })
        );
    });

    // getUserQuestions = asyncHandler(async (req, res, next) => {
    //     const user = req.user;
    //     const questions = await ResourceQuizService.getUserQuestions(user);
    //     res.status(200).json(new ApiResponse(200, "User questions fetched successfully", questions));
    // });
}

export default new ResourceController();
