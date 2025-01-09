import mongoose from "mongoose";
import { ApiError } from "../../../utils/ApiError.js";
import QuestionRepository from "../repository/question.repository.js";
import QuizRepository from "../repository/quiz.repository.js";
import TopicRepository from "../repository/topic.repository.js";

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
            // console.log(quiz, user);
    
            if (!quiz || !quiz.createdBy.equals(user.id)) {
                throw new ApiError(403, 'Unauthorized or Quiz not found');
            }
    
            data.createdBy = user.id;
            return await topicRepository.create(data);
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
            return await questionRepository.create(data);
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
            const question = await questionRepository.findById(questionId);
            if (!question || !question.createdBy.equals(user.id)) {
                throw new ApiError(403, 'Unauthorized or Question not found');
            }

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
    
}

export default new QuizService();
