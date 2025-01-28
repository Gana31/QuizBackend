import CrudRepository from "../../../utils/crudClass.js";
import ResourceQuestionModel from "../models/Resource.question.model.js";



class ResourceQuestionRepository extends CrudRepository {
  constructor() {
    super(ResourceQuestionModel);
  }
  async deleteMany(filter) {
    try {
        return await ResourceQuestionModel.deleteMany(filter);
    } catch (error) {
        throw new Error("Failed to delete multiple questions: " + error.message);
    }
}


}

export default ResourceQuestionRepository;