import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asynchandler.js";
import QuestionServices from "../services/question.services.js";


class QuestionController {
    createQuestion = asyncHandler(async (req, res, next) => {
        const user = req.user;
        const questionData = req.body;

        const newQuestion = await QuestionServices.createQuestion(questionData, user);
        res.status(201).json(new ApiResponse(201, "Question created successfully", newQuestion));
    });

    getQuestionsByTopic = asyncHandler(async (req, res, next) => {
        const { topicId } = req.params;
        const user = req.user;

        const questions = await QuestionServices.getQuestionsByTopic(topicId, user);
        res.status(200).json(new ApiResponse(200, "Questions fetched successfully", questions));
    });

    updateQuestion = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const user = req.user;
        const questionData = req.body;

        const updatedQuestion = await QuestionServices.updateQuestion(id, questionData, user);
        res.status(200).json(new ApiResponse(200, "Question updated successfully", updatedQuestion));
    });

    deleteQuestion = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const user = req.user;

        await QuestionServices.deleteQuestion(id, user);
        res.status(200).json(new ApiResponse(200, "Question deleted successfully"));
    });

    getQuizData = asyncHandler(async (req, res, next) => {
        const user = req.user; // Assuming you have the user in req.user
        const quizData = await QuestionServices.getQuizData(user);
    
        res.status(200).json(new ApiResponse(200, "Quiz data fetched successfully", quizData));
    });
}

export default new QuestionController();
