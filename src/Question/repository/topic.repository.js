import CrudRepository from "../../../utils/crudClass.js";
import TopicModel from "../models/topic.model.js";


class TopicRepository extends CrudRepository {
  constructor() {
    super(TopicModel);
  }

  async deleteByQuizId(quizId) {
    return await this.model.deleteMany({ quizId });
  }

  async findByQuizId(quizId) {
    try {
        return await TopicModel.find({ quizId }).exec();
    } catch (error) {
        throw error;
    }
}
}

export default TopicRepository;