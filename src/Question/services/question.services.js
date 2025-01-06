import { ApiError } from "../../../utils/ApiError.js";
import QuestionRepository from "../repository/question.repository.js";
import { TopicModel, CategoryModel, QuestionModel, QuestionOptionModel } from "../../dbrelation.js";

const questionRepository = new QuestionRepository();

class QuestionService {
    async createQuestion(data, user) {
        const topic = await TopicModel.findByPk(data.topic_id, {
            include: [{ model: CategoryModel, as: "category" }]
        });
        if (!topic) {
            throw new ApiError(404, "Topic not found");
        }
        if (topic.created_by !== user.id) {
            throw new ApiError(403, "You can only create questions for topics you own");
        }

        data.created_by = user.id;
        const question = await questionRepository.create(data);

        if (data.options) {
            const options = data.options.map(option => ({ ...option, question_id: question.id }));
            await QuestionOptionModel.bulkCreate(options);
        }

        return questionRepository.findWithOptions(question.id);
    }

    async getQuestionsByTopic(topicId, user) {
        const topic = await TopicModel.findByPk(topicId, {
            include: [{ model: CategoryModel, as: "category" }]
        });
        if (!topic || topic.created_by !== user.id) {
            throw new ApiError(403, "You can only view questions for topics you own");
        }

        return await questionRepository.findByTopicId(topicId, {
            include: [{ model: QuestionOptionModel, as: "options" }]
        });
    }

    async updateQuestion(id, data, user) {
        const question = await questionRepository.findById(id);
        if (question.created_by !== user.id) {
            throw new ApiError(403, "You can only update questions you created");
        }

        if (data.options) {
            await QuestionOptionModel.destroy({ where: { question_id: id } });
            const options = data.options.map(option => ({ ...option, question_id: id }));
            await QuestionOptionModel.bulkCreate(options);
        }

        return await questionRepository.update(id, data);
    }

    async deleteQuestion(id, user) {
        const question = await questionRepository.findById(id);
        if (question.created_by !== user.id) {
            throw new ApiError(403, "You can only delete questions you created");
        }

        return await questionRepository.delete(id);
    }

    async getQuizData(user) {
        // Get all categories with topics and questions
        const categories = await CategoryModel.findAll({
            include: [
                {
                    model: TopicModel,
                    as: 'topics',
                    include: [
                        {
                            model: QuestionModel,
                            as: 'questions',
                            include: [
                                {
                                    model: QuestionOptionModel,
                                    as: 'options'
                                }
                            ]
                        }
                    ]
                }
            ]
        });
    
        // Filter out categories and topics that don't belong to the user (if needed)
        return categories;
    }
}

export default new QuestionService();