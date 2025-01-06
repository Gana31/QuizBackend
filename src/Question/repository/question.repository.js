import CrudRepository from "../../../utils/crudClass.js";
import { QuestionModel, QuestionOptionModel, TopicModel, CategoryModel } from "../../dbrelation.js";

class QuestionRepository extends CrudRepository {
    constructor() {
        super(QuestionModel);
    }

    async findByTopicId(topicId, options = {}) {
        return await this.model.findAll({ where: { topic_id: topicId }, ...options });
    }

    async findWithOptions(questionId) {
        return await this.model.findByPk(questionId, {
            include: [{ model: QuestionOptionModel, as: "options" }]
        });
    }
}

export default QuestionRepository;