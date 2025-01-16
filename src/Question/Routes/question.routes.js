import express from 'express';
import { authMiddleware } from '../../Middleware/authMiddleware.js';
import QuestionController from '../controller/question.controller.js';
import QuizController from '../controller/quiz.controller.js';
import { FeedbackController } from '../controller/feedback.controller.js';

const questionRoutes = express.Router();
const feedbackController = new FeedbackController();
// Quiz Routes
questionRoutes.post('/createQuiz', authMiddleware, QuestionController.createQuiz); // Create a new quiz
questionRoutes.get('/getAllQuizzes', authMiddleware, QuestionController.getAllQuizzes); // Get all quizzes
questionRoutes.put('/updateQuiz/:quizId', authMiddleware, QuestionController.updateQuiz); // Update a quiz
questionRoutes.delete('/deleteQuiz/:quizId', authMiddleware, QuestionController.deleteQuiz); // Delete a quiz

// Topic Routes
questionRoutes.post('/createTopic', authMiddleware, QuestionController.createTopic); // Create a new topic
questionRoutes.get('/getTopicsByQuiz/:quizId', authMiddleware, QuestionController.getTopicsByQuiz); // Get topics by quiz ID
questionRoutes.put('/updateTopic/:topicId', authMiddleware, QuestionController.updateTopic); // Update a topic
questionRoutes.delete('/deleteTopic/:topicId', authMiddleware, QuestionController.deleteTopic); // Delete a topic

// Question Routes
questionRoutes.post('/createQuestion', authMiddleware, QuestionController.createQuestion); // Create a new question
questionRoutes.get('/getQuestionsByTopic/:topicId', authMiddleware, QuestionController.getQuestionsByTopic); // Get questions by topic ID
questionRoutes.put('/updateQuestion/:id', authMiddleware, QuestionController.updateQuestion); // Update a question
questionRoutes.delete('/deleteQuestion/:questionId', authMiddleware, QuestionController.deleteQuestion); // Delete a question

// Get All Previous Quizzes
questionRoutes.get('/getUserPreviousQuizzes', authMiddleware, QuestionController.getUserPreviousQuizzes); // Get all previous quizzes
questionRoutes.get('/getUpcomingQuizzes', authMiddleware, QuestionController.getUpcomingQuizzes);
questionRoutes.post('/enroll/:quizId', authMiddleware, QuestionController.enrollUser);
questionRoutes.get('/live-quizzes', authMiddleware, QuestionController.getLiveQuizzes);


questionRoutes.post('/startQuiz/:quizId', authMiddleware, QuizController.startQuiz);
questionRoutes.post('/getNextQuestion', authMiddleware, QuizController.getNextQuestion);
questionRoutes.post("/verify-otp", authMiddleware, QuizController.verifyOtp)


questionRoutes.post("/answersubmit",authMiddleware,QuizController.submitAnswer);
questionRoutes.get("/previous-answers", authMiddleware, QuizController.getUserAnswers);


questionRoutes.get("/monthly-statistics", authMiddleware, QuizController.getMonthlyStatistics);
questionRoutes.get('/quiz-history',authMiddleware, QuizController.getUserQuizHistory);
questionRoutes.get("/user-statistics", authMiddleware, QuizController.getUserStatistics);


questionRoutes.post("/createfeedback", authMiddleware, feedbackController.createFeedback);
questionRoutes.patch("/repaytoquestion/:feedbackId", authMiddleware,  feedbackController.updateAdminReply);
questionRoutes.get("/getuserfeedback", authMiddleware, feedbackController.getUserFeedback);
questionRoutes.get("/getteacherfeedback", authMiddleware, feedbackController.getTeacherFeedback);

export default questionRoutes;
