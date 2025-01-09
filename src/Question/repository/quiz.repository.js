import CrudRepository from "../../../utils/crudClass.js";
import QuizModel from "../models/quiz.model.js";


class QuizRepository extends CrudRepository {
  constructor() {
    super(QuizModel);  
  }


  async findAllWithPopulate(filter, populateOptions) {
    try {

      const quizzes = await QuizModel.find(filter).populate(populateOptions);
      return quizzes;
    } catch (error) {
      throw error;
    }
  }
}

export default QuizRepository;
