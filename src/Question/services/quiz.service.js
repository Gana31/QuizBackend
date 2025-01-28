import jwt from "jsonwebtoken";
import { ApiError } from "../../../utils/ApiError.js";
import QuestionRepository from "../repository/question.repository.js";
import QuizRepository from "../repository/quiz.repository.js";
import ServerConfig from "../../../config/ServerConfig.js";
import { CreateActivationToken } from "../../../utils/jwtCookie.js";
import { sendOtpMail } from "../../../utils/sendEmail.js";
import UserAnswerModel from "../models/userAnswer.model.js";
import QuizModel from "../models/quiz.model.js";
import QuestionServices from "./question.services.js";

const quizRepository = new QuizRepository();
const questionRepository = new QuestionRepository();

class ExamService {
  // Fetch quiz details, check if user is enrolled, and handle OTP and token generation
  async getQuizDetails(quizId, user) {
    try {
      
    const quiz = await quizRepository.findById(quizId);
    const currentDateISO = new Date().toISOString();
    if (!quiz || quiz.endTime > currentDateISO) {
      throw new ApiError(403, "Quiz is not yet eligible to start");
    }

    const isEnrolled = quiz.enrolledUsers.some(
      (enrollment) => enrollment.user.toString() === user.id.toString()
    );

    if (!isEnrolled) {
      throw new ApiError(400, 'You Are Not  enrolled in this quiz');
    }



    // Create a token for the session
    const { Token, ActivationCode } = CreateActivationToken(user);

    // OTP and expiry time handling (e.g., send via email)
    const expiryTime = 5;
    await sendOtpMail({
      email: user.email,
      otp: ActivationCode,
      quizTitle: quiz.name,
      expiryTime: expiryTime,
    });

    return { quiz, Token, ActivationCode, otp: ActivationCode, expiryTime };
    } catch (error) {
      console.log(error)
      throw error 
      
    }
  }

  // Verify OTP
  async verifyOtp(user, otp, token) {
    try {
      const decodedToken = jwt.verify(token, ServerConfig.ACCESS_TOKEN_SECRET);
      const storedActivationCode = decodedToken.ActivationCode;

      if (otp !== storedActivationCode) {
        throw new ApiError(403, "Invalid OTP");
      }
    } catch (error) {
      throw new ApiError(403, "Invalid or expired token");
    }

    return true;
  }

  async getShuffledQuestionsForQuiz(quizId, user) {
    try {
      // Fetch the quiz and populate its topics
      const quiz = await quizRepository.findByIdWithPopulate(quizId, "topics");
      if (!quiz || !quiz.topics || quiz.topics.length === 0) {
        throw new ApiError(404, "Quiz or topics not found");
      }
  
      const response = [];
      response.push({ quizId });
  
      // Calculate total max questions across all topics
      const totalMaxQuestions = quiz.topics.reduce((acc, topic) => acc + topic.maxQuestions, 0);
  
      // Iterate over each topic in the quiz

      for (const topic of quiz.topics) {
        // Fetch all questions for the topic
        const allQuestions = await questionRepository.findAll({ topicId: topic._id });
  
        if (!allQuestions || allQuestions.length === 0) {
          continue; // Skip this topic if no questions are available
        }
  
        // Shuffle questions
        const shuffledQuestions = shuffleArray(allQuestions);
  
        // Calculate the number of questions to select for this topic
        const numQuestionsToSend = parseInt(topic.maxQuestions) / 4;
        // Select a random subset of questions
        const selectedQuestions = shuffledQuestions.slice(0, numQuestionsToSend);
  
        // Prepare the response for this topic
        const topicData = {
          topicId: topic._id,
          topicName: topic.title,
          questions: selectedQuestions.map((q) => ({
            _id: q._id,
            title: q.title,
            options: q.options,
            topicId: topic._id, // Include topicId for the question
          })),
        };
  
        response.push(topicData);
      }
  
      return response.length > 1 ? response : null; // Return null if no topics/questions are available
    } catch (error) {
      console.error("Error fetching shuffled questions:", error);
      throw new ApiError(500, "Error fetching shuffled questions");
    }
  }
  
  
  
  async processAnswers({ quizId, topics, userId }) {
    try {
      const quiz = await QuizModel.findById(quizId).populate({
        path: "topics",
        populate: { path: "questions" },
      });
  
      if (!quiz) {
        throw new ApiError(404, "Quiz not found");
      }
  
      let totalMarks = 0;
      let score = 0;
  
      const userTopics = topics.map((topic) => {
        const quizTopic = quiz.topics.find((qt) => qt._id.toString() === topic.topicId);
  
        if (!quizTopic) {
          console.warn(`Topic with ID ${topic.topicId} not found in quiz ${quizId}`);
          return null;
        }
  
        const questions = topic.questions.map((question) => {
          const quizQuestion = quizTopic.questions.find((q) => q._id.toString() === question.questionId);
  
          if (!quizQuestion) {
            console.warn(`Question with ID ${question.questionId} not found in topic ${quizTopic.title}`);
            return {
              questionId: question.questionId,
              questionTitle: "Question not found",
              options: [],
              selectedOption: question.selectedOption,
              correctAnswer: null,
              userAnswer: null,
              isCorrect: false,
            };
          }
  
          const isCorrect = quizQuestion.options[question.selectedOption] === quizQuestion.correctAnswer;
          if (isCorrect) score++;
          totalMarks++;
  
          return {
            questionId: quizQuestion._id,
            questionTitle: quizQuestion.title,
            options: quizQuestion.options,
            selectedOption: question.selectedOption,
            correctAnswer: quizQuestion.correctAnswer,
            userAnswer: quizQuestion.options[question.selectedOption],
            explanationLink : quizQuestion.explanationLink,
            isCorrect,
          };
        }); // Remove null values if any
  
        return {
          topicId: quizTopic._id,
          topicName: quizTopic.title,
          questions,
        };
      }); // Remove null topics if any
  
      // Save user answers
      await UserAnswerModel.create({
        quizId,
        userId,
        topics: userTopics,
        score,
        totalMarks,
        status: score / totalMarks >= 0.5 ? "passed" : "failed",
      });
  
      // Update quiz completion status for the user
      quiz.enrolledUsers = quiz.enrolledUsers.map((user) =>
        user.user.toString() === userId.toString()
          ? { ...user, quizCompleted: true }
          : user
      );
  
      await quiz.save();
      // console.log(quiz)
      return {
        quizId,
        topics: userTopics,
        score,
        totalMarks,
        status: score / totalMarks >= 0.5 ? "passed" : "failed",
      };
    } catch (error) {
      console.error("Error processing answers:", error);
      throw error;
    }
  }
  
  async getUserPreviousAnswers(userId) {
    try {
      let structuredData;
      // Fetch the user's previous answers
      const userAnswers = await UserAnswerModel.find({ userId })
        .populate({
          path: "quizId", // Populate quiz details
          select: "name description startTime endTime createdBy", // Include the necessary fields
        })
        .populate({
          path: "topics.topicId",
          select: "title", // Populate topic title
        })
        .populate({
          path: "topics.questions.questionId",
          select: "questionTitle options correctAnswer explanationLink", // Populate question details
        });
  
      if (!userAnswers || userAnswers.length === 0) {
        return structuredData = []
      }
  
      // Structure the data as required
       structuredData = userAnswers.map((answer) => {
        const quizData = {
          id: answer.quizId._id,
          title: answer.quizId.name,
          date: answer.quizId.startTime.toLocaleDateString(),
          score: answer.score,
          quizCreator:answer.quizId.createdBy,
          totalMarks: answer.totalMarks,
          timeTaken: answer.timeTaken,
          description: answer.quizId.description,
          status: answer.status,
          topics: answer.topics.map((topic) => ({
            name: topic.topicName,
            totalQuestions: topic.questions.length,
            correctAnswers: topic.questions.filter((q) => q.isCorrect).length,
            questions: topic.questions.map((question) => {
              const userAnswer = question.userAnswer || 'Not Answered'; // If no answer, show 'Not Answered'
              return {
                id: question.questionId._id,
                topic: topic.topicName,
                question: question.questionTitle,
                options: question.options,
                userAnswer: userAnswer,
                explanationLink : question.explanationLink,
                correctAnswer: question.correctAnswer,
                isCorrect: question.isCorrect,
              };
            }),
          })),
        };
  
        return quizData;
      });
  
      // Return the structured data
      return structuredData;
    } catch (error) {
      throw error
    }
  }
  

  async calculateQuizStatistics(userId) {
    try {
      // Fetch user answers with quiz information
      const userAnswers = await UserAnswerModel.find({ userId })
        .populate({
          path: "quizId",
          select: "totalMarks", // Fetch totalMarks from Quiz schema
        })
        .select("createdAt score totalMarks");
  
      if (!userAnswers || userAnswers.length === 0) {
        return { monthlyQuizCount: {}, monthlyAverageScore: {} };
      }
  
      const monthlyData = {};
      // Iterate through user answers
      userAnswers.forEach((answer) => {
        const quizDate = new Date(answer.createdAt);
        const monthYear = quizDate.toLocaleString("default", { month: "short", year: "numeric" });
  
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { totalQuizzes: 0, totalScore: 0, totalMarks: 0 };
        }
  
        // Update monthly data
        monthlyData[monthYear].totalQuizzes += 1;
        monthlyData[monthYear].totalScore += answer.score || 0;
        monthlyData[monthYear].totalMarks += answer.totalMarks || 0;
      });
  
      // Prepare final statistics
      const monthlyQuizCount = {};
      const monthlyAverageScore = {};
  
      Object.entries(monthlyData).forEach(([monthYear, data]) => {
        monthlyQuizCount[monthYear] = data.totalQuizzes;
        monthlyAverageScore[monthYear] =
          data.totalMarks > 0 ? (data.totalScore / data.totalMarks) * 100 : 0;
      });

      const growthDataFromAverage = Object.entries(monthlyAverageScore).map(
        ([monthYear, score]) => ({
          month: monthYear,
          score: score,
        })
      );
  
      return { monthlyQuizCount, growthDataFromAverage };
    } catch (error) {
      console.error("Error calculating quiz statistics:", error);
      throw new ApiError(500, "Failed to calculate quiz statistics");
    }
  }

  generateStats(totalQuizzesTaken, averageScore, totalAvailableQuizzes, completionRate, changeText, changeType,upcomingquiznumber) {
    return [
      {
        title: "Total Quizzes Taken",
        value: totalQuizzesTaken.toString(),
        change: changeText, // Dynamic change from the previous month
        changeType: changeType, // increase or neutral based on quizzes taken
      },
      {
        title: "Average Score",
        value: `${averageScore.toFixed(2)}%`,
        change: "+5% from last month", // Can be calculated if you store previous month score
        changeType: "increase", // Change type can be calculated
      },
      {
        title: "Upcoming Quizzes",
        value: `${upcomingquiznumber}`, // This can be dynamically fetched based on upcoming quizzes
        change: upcomingquiznumber > 0 ? "Next quiz in 2 days" : "No Quiz ", // This can be calculated by checking the quiz dates
        changeType: "neutral",
      },
      {
        title: "Completion Rate",
        value: `${completionRate}%`,
        change: "Same as last month", // Calculate based on the previous month's data
        changeType: "neutral",
      },
    ];
  }

  async getUserQuizStats(user) {
    try {
      // Fetch the user's answers for the present month (from the 1st of the month to today)
      const today = new Date();
      const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1); // 1st of the current month
      const endOfToday = new Date(today); // Today's date
  
      // Fetch user answers for the current month
      const userAnswers = await UserAnswerModel.find({
        userId : user.id,
        createdAt: { $gte: startOfCurrentMonth, $lte: endOfToday }, // Filter by current month
      })
        .populate({
          path: "quizId",
          select: "totalMarks",
        })
        .select("createdAt score totalMarks");
  
      if (!userAnswers || userAnswers.length === 0) {
        // If no user answers found, return the default stats
        return this.generateStats(0, 0, 0, 0, "No quizzes taken this month", "neutral");
      }
  
      // Calculate Total Quizzes Taken for the current month
      const totalQuizzesTaken = userAnswers.length;
  
      // Calculate the average score
      let totalScore = 0;
      let totalMarks = 0;
      userAnswers.forEach((answer) => {
        totalScore += answer.score || 0;
        totalMarks += answer.totalMarks || 0;
      });
      const averageScore = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;
  
      // Calculate Completion Rate (this would ideally depend on the total number of quizzes the user can take)
      const totalAvailableQuizzes = 12; // This can be dynamically fetched from your quiz system
      const completionRate = ((totalQuizzesTaken / totalAvailableQuizzes) * 100).toFixed(2);
  
      // Get the number of quizzes taken in the previous month
      const previousMonthDate = new Date();
      previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
      const startOfLastMonth = new Date(previousMonthDate.getFullYear(), previousMonthDate.getMonth(), 1); // 1st date of last month
      const endOfLastMonth = new Date(previousMonthDate.getFullYear(), previousMonthDate.getMonth() + 1, 0); // Last date of last month
  
      // Fetch the user's answers for the previous month
      const userAnswersLastMonth = await UserAnswerModel.find({
        userId:user.id,
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }).select("createdAt");
  
      const totalQuizzesTakenLastMonth = userAnswersLastMonth.length;
  
      // Calculate the change in quizzes from last month
      const quizzesChange = totalQuizzesTaken - totalQuizzesTakenLastMonth;
      const changeText = quizzesChange > 0 
        ? `+${quizzesChange} from last month` 
        : `No change from last month`;
  
      const changeType = quizzesChange > 0 ? "increase" : "neutral";
        const upcomingquiz = await QuestionServices.getUpcomingQuizzes(user)
       const upcomingquiznumber = upcomingquiz.length
      // Generate the stats object with the change in quizzes taken
      return this.generateStats(totalQuizzesTaken, averageScore, totalAvailableQuizzes, completionRate, changeText, changeType,upcomingquiznumber);
    } catch (error) {
      console.error("Error fetching user quiz stats:", error);
      throw new ApiError(500, "Failed to fetch user quiz stats");
    }
  }
  
  async getUserQuizHistory(userId) {
    try {
      // Get the last 5 quizzes for the user, populated with quiz name from Quiz model
      const quizHistory = await UserAnswerModel.find({ userId })
        .sort({ createdAt: -1 }) // Sort by most recent
        .limit(5) // Limit to the last 5 quizzes
        .populate('quizId', 'name'); // Populate quizId with the quiz name

      // Format the quiz results
      const formattedQuizHistory = quizHistory.map((quiz) => ({
        name: quiz.quizId.name, // Get the quiz name from populated quizId
        obtainedMarks: quiz.score,
        totalMarks: quiz.totalMarks,
      }));

      return formattedQuizHistory;
    } catch (error) {
      throw new Error('Error fetching quiz history');
    }
  }
 
  
}



// Utility to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
  }
  return array;
}
export default new ExamService();
