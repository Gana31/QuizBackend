import CrudRepository from "../../../utils/crudClass.js";
import QuestionModel from "../models/question.model.js";


class QuestionRepository extends CrudRepository {
  constructor() {
    super(QuestionModel);
  }

  async deleteByTopicId(topicId) {
    return await this.model.deleteMany({ topicId });
  }
  async findByTopicId(topicId) {
    try {
        return await QuestionModel.find({ topicId }).exec();
    } catch (error) {
        throw error;
    }
}
}

export default QuestionRepository;