import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asynchandler.js";
import QuizService from "../services/question.services.js";
import { ApiError } from "../../../utils/ApiError.js";

class QuestionController {
    // Quiz CRUD Methods
    createQuiz = asyncHandler(async (req, res, next) => {
        const user = req.user;
        const quizData = req.body;
        // Validate input
       
        if (!quizData.name) throw new ApiError(400, "Quiz title is required");

        const newQuiz = await QuizService.createQuiz(quizData, user);
        res.status(201).json(new ApiResponse(201, "Quiz created successfully", newQuiz));
    });

    getAllQuizzes = asyncHandler(async (req, res, next) => {
        const user = req.user;
        const quizzes = await QuizService.getUserPreviousQuizzes(user);
        res.status(200).json(new ApiResponse(200, "Quizzes fetched successfully", quizzes));
    });

    updateQuiz = asyncHandler(async (req, res, next) => {
        const { quizId } = req.params;
        const user = req.user;
        const quizData = req.body;
        // Validate input
        if (!quizData.name) throw new ApiError(400, "Quiz title is required");

        const updatedQuiz = await QuizService.updateQuiz(quizId, quizData, user);
        res.status(200).json(new ApiResponse(200, "Quiz updated successfully", updatedQuiz));
    });

    deleteQuiz = asyncHandler(async (req, res, next) => {
        const { quizId } = req.params;
        const user = req.user;

        // Validate input
        if (!quizId) throw new ApiError(400, "Quiz ID is required");

        await QuizService.deleteQuiz(quizId, user);
        res.status(200).json(new ApiResponse(200, "Quiz deleted successfully"));
    });

    // Topic CRUD Methods
    createTopic = asyncHandler(async (req, res, next) => {
        const user = req.user;
        const topicData = req.body;

        // Validate input
        // console.log(req.body)
        if (!topicData.title) throw new ApiError(400, "Topic title is required");
        if (!topicData.quizId) throw new ApiError(400, "Quiz ID is required");

        const newTopic = await QuizService.createTopic(topicData, user);
        res.status(201).json(new ApiResponse(201, "Topic created successfully", newTopic));
        
    });

    getTopicsByQuiz = asyncHandler(async (req, res, next) => {
        const { quizId } = req.params;
        const user = req.user;

        // Validate input
        if (!quizId) throw new ApiError(400, "Quiz ID is required");

        const topics = await QuizService.getTopicsByQuiz(quizId, user);
        res.status(200).json(new ApiResponse(200, "Topics fetched successfully", topics));
    });

    updateTopic = asyncHandler(async (req, res, next) => {
        const { topicId } = req.params;
        const user = req.user;
        const topicData = req.body;

        // Validate input
        if (!topicData.title) throw new ApiError(400, "Topic title is required");

        const updatedTopic = await QuizService.updateTopic(topicId, topicData, user);
        res.status(200).json(new ApiResponse(200, "Topic updated successfully", updatedTopic));
    });

    deleteTopic = asyncHandler(async (req, res, next) => {
        const { topicId } = req.params;
        const user = req.user;

        // Validate input
        if (!topicId) throw new ApiError(400, "Topic ID is required");

        await QuizService.deleteTopic(topicId, user);
        res.status(200).json(new ApiResponse(200, "Topic deleted successfully"));
    });

    // Question CRUD Methods
    createQuestion = asyncHandler(async (req, res, next) => {
        const user = req.user;
        const questionData = req.body;
                // console.log(req.body)
        // Validate input
        if (!questionData.title) throw new ApiError(400, "Question text is required");
        if (!questionData.topicId) throw new ApiError(400, "Topic ID is required");

        const newQuestion = await QuizService.createQuestion(questionData, user);
        res.status(201).json(new ApiResponse(201, "Question created successfully", newQuestion));
    });

    getQuestionsByTopic = asyncHandler(async (req, res, next) => {
        const { topicId } = req.params;
        const user = req.user;

        // Validate input
        if (!topicId) throw new ApiError(400, "Topic ID is required");

        const questions = await QuizService.getQuestionsByTopic(topicId, user);
        res.status(200).json(new ApiResponse(200, "Questions fetched successfully", questions));
    });

    updateQuestion = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const user = req.user;
        const questionData = req.body;

        // Validate input
        if (!questionData.title) throw new ApiError(400, "Question title is required");

        const updatedQuestion = await QuizService.updateQuestion(id, questionData, user);
        res.status(200).json(new ApiResponse(200, "Question updated successfully", updatedQuestion));
    });

    deleteQuestion = asyncHandler(async (req, res, next) => {
        const { questionId } = req.params;
        const user = req.user;

        // Validate input
        if (!questionId) throw new ApiError(400, "Question ID is required");

        await QuizService.deleteQuestion(questionId, user);
        res.status(200).json(new ApiResponse(200, "Question deleted successfully"));
    });

    // Get All Previous Quizzes
    getUserPreviousQuizzes = asyncHandler(async (req, res, next) => {
        const user = req.user;

        const quizzes = await QuizService.getUserPreviousQuizzes(user);
        res.status(200).json(new ApiResponse(200, "Previous quizzes fetched successfully", quizzes));
    });

    async getUpcomingQuizzes(req, res, next) {
        try {
            const user = req.user; 
            const quizzes = await QuizService.getUpcomingQuizzes(user); // Call service to fetch upcoming quizzes
            return res.status(200).json(new ApiResponse(200, "Upcoming quizzes fetched successfully", quizzes));
        } catch (error) {
            return next(new ApiError(500, "Error fetching upcoming quizzes", error));
        }
    }

    async getLiveQuizzes(req, res, next) {
        try {
            const user = req.user; // Get the logged-in user
            const liveQuizzes = await QuizService.getLiveQuizzes(user); // Call service to fetch live quizzes
    
           
            return res.status(200).json(new ApiResponse(200, "Live quizzes fetched successfully", liveQuizzes));
        } catch (error) {
            return next(new ApiError(500, "Error fetching live quizzes", error));
        }
    }

    enrollUser = asyncHandler(async (req, res, next) => {
        const { quizId } = req.params;
        const user = req.user; // Assume `req.user` contains authenticated user details
    
        if (!quizId) throw new ApiError(400, "Quiz ID is required");
            // console.log(user)
        const enrolledQuiz = await QuizService.enrollUser(quizId, user);
        res
          .status(200)
          .json(new ApiResponse(200, "User enrolled successfully", enrolledQuiz));
      });
}

export default new QuestionController();
