import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asynchandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import ExamService from "../services/quiz.service.js";

class QuizController {
  // Start quiz and send token to frontend, OTP will be sent to email
  startQuiz = asyncHandler(async (req, res, next) => {
    const user = req.user; // User ID from the token
    const quizId = req.params.quizId; // Quiz ID passed in the URL

    const { Token } = await ExamService.getQuizDetails(quizId, user);

    // Send the quiz data along with the token to the user
    res.status(200).json(new ApiResponse(200, "Quiz started", {
      Token,
    }));
  });

  // Separate route for OTP verification
  verifyOtp = asyncHandler(async (req, res, next) => {
    const user = req.user; // User ID from the token
    const { otp, token ,quizId } = req.body;

    const isVerified = await ExamService.verifyOtp(user, otp, token);

    if (!isVerified) {
      throw new ApiError(403, "OTP verification failed");
    }

    res.status(200).json(new ApiResponse(200, "OTP verified successfully", {true:true,quizId:quizId}));
  });

  getNextQuestion = asyncHandler(async (req, res, next) => {
    const user = req.user; // User ID from the token
    const { quizId } = req.body; // Only quizId is sent
  
    // Fetch the shuffled questions for the quiz
    const questionData = await ExamService.getShuffledQuestionsForQuiz(quizId, user);
  
    if (!questionData) {
      throw new ApiError(404, "No questions available for this quiz");
    }
    // console.log(JSON.stringify(questionData, null, 2));

    // Send shuffled questions with topic info
    res.status(200).json(new ApiResponse(200, "Questions fetched successfully", questionData));
  });
 
  
  submitAnswer = asyncHandler(async (req, res, next) => {
    const { quizId, topics } = req.body;
    const userId = req.user.id;

    if (!quizId || !topics || topics.length === 0) {
      throw new ApiError(400, "quizId and topics are required");
    }

    // Call service method to handle business logic
    const response = await ExamService.processAnswers({ quizId, topics, userId });

    // console.log(JSON.stringify(response));
    // Return response to the client
    res.status(200).json(new ApiResponse(200, "Answers submitted successfully", response));
  });

   getUserAnswers = asyncHandler(async(req, res, next) => {
    const userId = req.user.id; // This comes from the `authMiddleware`

    try {
      // Fetch the previous answers for the user from the service
      const previousAnswers = await ExamService.getUserPreviousAnswers(userId);

      // Return the previous answers to the client
      res.status(200).json(new ApiResponse(200, "Previous answers fetched successfully", previousAnswers));
    } catch (error) {
      next(error); // Pass the error to the next middleware (error handler)
    }
  })

  async getMonthlyStatistics(req, res, next) {
    try {
      const userId = req.user.id; // Assuming user ID is attached to the request object after authentication
      const statistics = await ExamService.calculateQuizStatistics(userId);

      return res.status(200).json(new ApiResponse(200, "Monthly statistics retrieved", statistics));
    } catch (error) {
      next(error); // Pass the error to the error handling middleware
    }
  }

  async getUserStatistics(req, res, next) {
    try {
      const user = req.user;
      const statistics = await ExamService.getUserQuizStats(user);
      // console.log(statistics)
      res.status(200).json(statistics);
    } catch (error) {
      next(error);
    }
  }

  async getUserQuizHistory(req, res, next) {
    try {
      const {id } = req.user; // Get the userId from the request parameters
      const quizHistory = await ExamService.getUserQuizHistory(id);
      res.status(200).json(quizHistory); // Send back the formatted quiz history
    } catch (error) {
      next(error); // Pass any errors to the next middleware
    }
  }

}

export default new QuizController();
