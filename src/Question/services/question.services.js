import mongoose from "mongoose";
import { ApiError } from "../../../utils/ApiError.js";
import QuestionRepository from "../repository/question.repository.js";
import QuizRepository from "../repository/quiz.repository.js";
import TopicRepository from "../repository/topic.repository.js";
import TopicModel from "../models/topic.model.js";
import UserAnswerModel from "../models/userAnswer.model.js";

const quizRepository = new QuizRepository();
const topicRepository = new TopicRepository();
const questionRepository = new QuestionRepository();

class QuizService {
    async createQuiz(data, user) {
        try {
            data.createdBy = user.id;
            return await quizRepository.create(data);
        } catch (error) {
            throw error;
        }
    }

    async updateQuiz(quizId, data, user) {
        try {
            const quiz = await quizRepository.findById(quizId);
            if (!quiz || quiz.createdBy.toString() !== user.id.toString()) {
                throw new ApiError(403, 'Unauthorized or Quiz not found');
            }

            // Update quiz fields
            Object.assign(quiz, data);
            return await quizRepository.update(quizId, quiz);
        } catch (error) {
            throw error;
        }
    }

    async deleteQuiz(quizId, user) {
        try {
            const quiz = await quizRepository.findById(quizId);
            if (!quiz || quiz.createdBy.toString() !== user.id.toString()) {
                throw new ApiError(403, 'Unauthorized or Quiz not found');
            }

            await topicRepository.deleteByQuizId(quizId);
            await quizRepository.delete(quizId);
        } catch (error) {
            throw error;
        }
    }

    async createTopic(data, user) {
        try {
            const quiz = await quizRepository.findById(data.quizId);
            
            if (!quiz || !quiz.createdBy.equals(user.id)) {
                throw new ApiError(403, 'Unauthorized or Quiz not found');
            }
    
            // Create the topic
            data.createdBy = user.id;
            const newTopic = await topicRepository.create(data);
    
            // Add the topic ID to the quiz
            quiz.topics.push(newTopic._id);
    
            // Save the updated quiz
            await quiz.save();
    
            return newTopic; // Return the created topic
        } catch (error) {
            throw error;
        }
    }
    
    

    async updateTopic(topicId, data, user) {
        try {
            const topic = await topicRepository.findById(topicId);
            if (!topic || !topic.createdBy.equals(user.id)) {
                throw new ApiError(403, 'Unauthorized or Topic not found');
            }
    
            // Update topic fields
            Object.assign(topic, data);
            return await topicRepository.update(topicId, topic);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    

    async deleteTopic(topicId, user) {
        try {
            const topic = await topicRepository.findById(topicId);
            if (!topic || !topic.createdBy.equals(user.id)) {
                throw new ApiError(403, 'Unauthorized or Topic not found');
            }

            await questionRepository.deleteByTopicId(topicId);
            await topicRepository.delete(topicId);
        } catch (error) {
            throw error;
        }
    }

    async createQuestion(data, user) {
        try {
            const topic = await topicRepository.findById(data.topicId);
            if (!topic || !topic.createdBy.equals(user.id)) {
                throw new ApiError(403, 'Unauthorized or Topic not found');
            }
    
            data.createdBy = user.id;
    
            const newQuestion = await questionRepository.create(data);
    
            topic.questions.push(newQuestion._id);
            
            await topic.save();
    
            return newQuestion; 
        } catch (error) {
            throw error;
        }
    }
    

    async updateQuestion(questionId, data, user) {
        try {
            const question = await questionRepository.findById(questionId);
            if (!question || !question.createdBy.equals(user.id)) {
                throw new ApiError(403, 'Unauthorized or Question not found');
            }

            // Update question fields
            Object.assign(question, data);
            return await questionRepository.update(questionId, question);
        } catch (error) {
            throw error;
        }
    }

    async deleteQuestion(questionId, user) {
        try {
            // Find the question to ensure it exists and belongs to the user
            const question = await questionRepository.findById(questionId);
            if (!question || !question.createdBy.equals(user.id)) {
                throw new ApiError(403, 'Unauthorized or Question not found');
            }
    
            // Remove the question reference from the corresponding topic
            await TopicModel.findByIdAndUpdate(
                question.topicId,
                { $pull: { questions: questionId } }, // Remove the questionId from the questions array
                { new: true } // Return the updated document
            );
    
            // Delete the question itself
            await questionRepository.delete(questionId);
        } catch (error) {
            throw error;
        }
    }
    

    async getUserPreviousQuizzes(user) {
        try {
            const userId = user.id instanceof mongoose.Types.ObjectId ? user.id : mongoose.Types.ObjectId(user.id); // Ensure it's an ObjectId
    
            // console.log('Fetching quizzes for user with ID:', userId);
    
            // Fetch quizzes created by the user
            const quizzes = await quizRepository.findAllWithPopulate({ createdBy: userId });
    
            // Loop through each quiz to fetch topics and questions manually
            for (let quiz of quizzes) {
                // Fetch topics for each quiz by quizId
                const topics = await topicRepository.findByQuizId(quiz._id);
                
                // Loop through each topic to fetch questions by topicId
                for (let topic of topics) {
                    const questions = await questionRepository.findByTopicId(topic._id);
                    topic.questions = questions; // Attach questions to topic
                }
    
                quiz.topics = topics; // Attach topics to quiz
            }
    
            // console.log('Fetched quizzes with topics and questions:', quizzes); // Check the output
            return quizzes;
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            throw error;
        }
    }

    async getUpcomingQuizzes(user) {
        try {
            // Get the current date and time for filtering future quizzes
            const currentDate = new Date();
    
            // Fetch quizzes with future start times
            const quizzes = await quizRepository.findAllWithPopulate({
                startTime: { $gt: currentDate },
            });
    
            const upcomingQuizzes = [];
    
            for (let quiz of quizzes) {
                // console.log(quiz.enrolledUsers)
                const isUserEnrolled = quiz.enrolledUsers.some(
                    (enrollment) =>
                      enrollment.user.toString() === user.id.toString()
                  );
                
                  // Skip the quiz if the user is already enrolled with quizCompleted false
                  if (isUserEnrolled) {
                    continue; // User already registered and quiz not completed, skip this quiz
                  }
                
                // Extract and format the date from startTime
                const quizDate = formatDate(quiz.startTime);
    
                const quizDetails = {
                    id: quiz._id,
                    title: quiz.name,
                    description: quiz.description,
                    // Format the start and end time to "HH:mm AM/PM"
                    timing: `${formatTime(quiz.startTime)} - ${formatTime(quiz.endTime)}`,
                    date: quizDate, // Add the formatted date here
                    totalMarks: 0,  // Initialize total marks
                    topics: [], // Initialize topics as an array of topic names
                };
    
                let isValidQuiz = true;
    
                // Check if quiz has topics, if not skip it
                if (quiz.topics.length === 0) {
                    continue; // Skip this quiz as it doesn't have any topics
                }
    
                // Loop through each topic in the quiz
                for (let topicId of quiz.topics) {
                    const topic = await topicRepository.findById(topicId);
    
                    // Get the number of questions created in the topic
                    const questions = await questionRepository.findByTopicId(topic._id);
    
                    // Check if the number of questions meets the maximum allowed
                    const requiredQuestions = topic.maxQuestions;
    
                    // If the topic doesn't have enough questions, don't include the quiz
                    if (questions.length < requiredQuestions) {
                        isValidQuiz = false;
                        break;
                    }
    
                    // Add the topic name to the topics array
                    quizDetails.topics.push(topic.title);
    
                    // Add the topic's total marks to the quiz's total marks
                    quizDetails.totalMarks += topic.totalMarks;
                }
    
                // Only add the quiz to the result if it's valid
                if (isValidQuiz) {
                    upcomingQuizzes.push({
                        id: quizDetails.id,
                        title: quizDetails.title,
                        description: quizDetails.description,
                        timing: quizDetails.timing,
                        date: quizDetails.date, // Include the date field
                        totalMarks: quizDetails.totalMarks,
                        topics: quizDetails.topics,
                    });
                }
            }
    
            return upcomingQuizzes;
        } catch (error) {
            console.log(error)
            throw new ApiError(500, "Error fetching upcoming quizzes", error);
        }
    }
    

    async getLiveQuizzes(user) {
        try {
          const currentDate = new Date();
          const ObjectId = mongoose.Types.ObjectId;
          const userId = user.id; // Convert user.id to ObjectId if necessary
      
        //   console.log("User ID:", userId); // Log userId to verify
      
          // Fetch all quizzes that have started (live quizzes)
          const quizzes = await quizRepository.findAllWithPopulate({
            startTime: { $gte: currentDate }, // Fetch quizzes that have started
          });
      
          // Filter quizzes where the user is enrolled
          const liveQuizzes = quizzes.filter(quiz =>
            quiz.enrolledUsers.some(enrolledUser => enrolledUser.user.toString() === userId.toString() && enrolledUser.quizCompleted == false)
          );
      
        //   console.log(liveQuizzes)
          // Initialize an array to hold the live quizzes that pass validation
          const validLiveQuizzes = [];
      
          for (let quiz of liveQuizzes) {
            const quizDate = formatDate(quiz.startTime);
      
            const quizDetails = {
              id: quiz._id,
              title: quiz.name,
              description: quiz.description,
              timing: `${formatTime(quiz.startTime)} - ${formatTime(quiz.endTime)}`,
              date: quizDate, // Include the formatted date
              totalMarks: 0, // Initialize total marks
              topics: [], // Initialize topics as an array of topic names
            };
      
            let isValidQuiz = true;
      
            // Fetch topic details by populating topic references
            if (quiz.topics.length === 0) {
              continue; // Skip quizzes with no topics
            }
      
            for (let topicId of quiz.topics) {
              const topic = await topicRepository.findById(topicId);
      
              if (!topic) {
                isValidQuiz = false;
                break;
              }
      
              // Get the number of questions created in the topic
              const questions = await questionRepository.findByTopicId(topic._id);
              const requiredQuestions = topic.maxQuestions;
      
              // Check if the number of questions meets the maximum allowed
              if (questions.length < requiredQuestions) {
                isValidQuiz = false;
                break;
              }
      
              // Add the topic name to the topics array
              quizDetails.topics.push(topic.title);
      
              // Add the topic's total marks to the quiz's total marks
              quizDetails.totalMarks += topic.totalMarks;
            }
      
            // Only add the quiz to the result if it's valid
            if (isValidQuiz) {
              validLiveQuizzes.push({
                id: quizDetails.id,
                title: quizDetails.title,
                description: quizDetails.description,
                timing: quizDetails.timing,
                date: quizDetails.date, // Include the date field
                totalMarks: quizDetails.totalMarks,
                topics: quizDetails.topics,
              });
            }
          }
      
          // console.log("Valid Live Quizzes:", validLiveQuizzes); // Log the valid quizzes
          return validLiveQuizzes;
      
        } catch (error) {
          console.error("Error fetching live quizzes:", error);
          throw new ApiError(500, "Error fetching live quizzes", error);
        }
      }
      
      

    async enrollUser(quizId, user) {
        try {
          const quiz = await quizRepository.findById(quizId);
          if (!quiz) throw new ApiError(404, 'Quiz not found');
    
          // Check if the user created the quiz
          if (quiz.createdBy.toString() === user.id.toString()) {
            throw new ApiError(403, 'You cannot enroll in a quiz you created');
          }
          
          // Check user account type
          if (user.role !== 'User') {
            throw new ApiError(403, 'Only users with an account type of "user" can enroll');
          }
    
          // Check if it's within 1 hour of the quiz's start time
          // const oneHourBeforeStartTime = new Date(quiz.startTime.getTime() - 60 * 60 * 1000);
          // const currentTime = new Date();
          // if (currentTime >= oneHourBeforeStartTime) {
          //   throw new ApiError(400, 'You can only enroll in the quiz more than 1 hour before it starts');
          // }
    
          const isEnrolled = quiz.enrolledUsers.some(
            (enrollment) => enrollment.user.toString() === user.id.toString()
          );
    
          if (isEnrolled) {
            throw new ApiError(400, 'User is already enrolled in this quiz');
          }
    
          // Enroll the user with `quizCompleted` set to `false`
          quiz.enrolledUsers.push({ user: user.id, quizCompleted: false });
          await quiz.save();
    
          return quiz;
        } catch (error) {
          throw error;
        }
      }


    async getAllquiz(user) {
  try {
    const currentDate = new Date();
    const ObjectId = mongoose.Types.ObjectId;
    const userId = new ObjectId(user.id); // Convert user.id to ObjectId if necessary

    // console.log("User ID:", userId); // Log userId to verify

    // Fetch all upcoming quizzes
    const quizzes = await quizRepository.findAllWithPopulate({
      startTime: { $gte: currentDate }, // Fetch quizzes that start after the current date
    });

    // Filter quizzes where the user is enrolled
    const userQuizzes = quizzes.filter(quiz => 
      quiz.enrolledUsers.some(user => user.toString() === userId.toString())
    );

    // console.log("User's Enrolled Quizzes:", userQuizzes); // Log the filtered quizzes
    return userQuizzes;
  } catch (error) {
    console.error("Error fetching quizzes:", error);
  }
}


  
    
    
    
}

  // Helper function to format the time as HH:mm AM/PM
  function formatTime(date) {
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return new Date(date).toLocaleString('en-US', options).replace(',', ''); // Format to "HH:mm AM/PM"
}

// Helper function to format the date as YYYY-MM-DD
function formatDate(date) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(date).toLocaleDateString('en-US', options); // Format to "YYYY-MM-DD"
}


export default new QuizService();
