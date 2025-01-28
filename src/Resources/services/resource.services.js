
import { ApiError } from "../../../utils/ApiError.js";
import ResourceRepository from "../repository/resource.repository.js";
import ResourceQuestionRepository from "../repository/Resource.question.repository.js";
import ResourceModel from "../models/resource.model.js";
import ResourceQuestionModel from "../models/Resource.question.model.js";

const resourceRepository = new ResourceRepository()
const resourceQuestionRepository = new ResourceQuestionRepository()

class ResourceQuizService {
  async createResourceQuiz(data, user) {
    try {
        data.createdBy = user.id;
        return await resourceRepository.create(data);
    } catch (error) {
        throw error;
    }
}

async updateResourceQuiz(quizId, data, user) {
    try {
        const quiz = await resourceRepository.findById(quizId);
        if (!quiz || quiz.createdBy.toString() !== user.id.toString()) {
            throw new ApiError(403, "Unauthorized or Resource Quiz not found");
        }

        Object.assign(quiz, data);
        return await resourceRepository.update(quizId, quiz);
    } catch (error) {
        throw error;
    }
}

async deleteResourceQuiz(quizId, user) {
    try {
        const quiz = await resourceRepository.findById(quizId);
        if (!quiz || quiz.createdBy.toString() !== user.id.toString()) {
            throw new ApiError(403, "Unauthorized or Quiz not found");
        }

        // Delete all questions associated with the quiz
        await resourceQuestionRepository.deleteMany({
            _id: { $in: quiz.questions },
        });

        // Delete the quiz itself
        await resourceRepository.delete(quizId);
    } catch (error) {
        throw error;
    }
}

async createQuestion(data, user) {
    try {
        console.log(data)
        const resource = await resourceRepository.findById(data.resourceId);
        if (!resource || resource.createdBy.toString() !== user.id.toString()) {
            throw new ApiError(403, "Unauthorized or Resource not found");
        }

        data.createdBy = user.id;

        const newQuestion = await resourceQuestionRepository.create(data);

        resource.questions.push(newQuestion._id);
        await resource.save();

        return newQuestion;
    } catch (error) {
        throw error;
    }
}

async updateQuestion(questionId, data, user) {
    try {
        const question = await resourceQuestionRepository.findById(questionId);
        if (!question || question.createdBy.toString() !== user.id.toString()) {
            throw new ApiError(403, "Unauthorized or Question not found");
        }

        Object.assign(question, data);
        return await resourceQuestionRepository.update(questionId, question);
    } catch (error) {
        throw error;
    }
}

async deleteQuestion(questionId, user) {
    try {
        const question = await resourceQuestionRepository.findById(questionId);
        if (!question || question.createdBy.toString() !== user.id.toString()) {
            throw new ApiError(403, "Unauthorized or Question not found");
        }

        // Remove the question reference from the associated quiz
        await ResourceModel.findByIdAndUpdate(
            question.resourceId,
            { $pull: { questions: questionId } },
            { new: true }
        );

        // Delete the question itself
        await resourceQuestionRepository.delete(questionId);
    } catch (error) {
        throw error;
    }
}

async getAllAdminResources(user) {
    try {
       

        // Find all resources created by the user (admin)
        const resources = await ResourceModel.find({ createdBy: user.id.toString() })
            .populate({
                path: 'questions', // Populate the 'questions' field in Resource model
                model: 'ResourceQuestion', // Populate with the ResourceQuestion model
            });

        return resources;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


async getQuestionsByResource(resourceId) {
    try {
      // Step 1: Find the resource by ID
      const resource = await ResourceModel.findById(resourceId);
      if (!resource) {
        throw new ApiError(404, "Resource not found");
      }

      // Step 2: Fetch all questions associated with this resource
      const questions = await ResourceQuestionModel.find({
        _id: { $in: resource.questions }, // Find questions by their IDs (which are stored in the 'questions' array of the resource)
      });

      // Step 3: Return the populated questions
      return questions;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getAllResourcesWithCategories() {
    try {
        // Fetch all resources created by the user
        const resources = await ResourceModel.find()
            .populate({
                path: "questions", // Populate questions in resources
                model: "ResourceQuestion",
            })
            .populate({
                path: "createdBy", // Populate creator details
                model: "QuizeUser", 
                select: "name", // Fetch only the name field
            });

        // Extract unique categories
        const categories = [...new Set(resources.map((resource) => resource.category))];

        return { resources, categories };
    } catch (error) {
        console.error(error);
        throw error;
    }
}
    
}



export default new ResourceQuizService();
