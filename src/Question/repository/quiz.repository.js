import { ApiError } from "../../../utils/ApiError.js";
import CrudRepository from "../../../utils/crudClass.js";
import QuizModel from "../models/quiz.model.js";


class QuizRepository extends CrudRepository {
  constructor() {
    super(QuizModel);  
  }

  async findByIdWithPopulate(id, populateOptions) {
    try {
      const query = QuizModel.findById(id).populate(populateOptions);
      const record = await query;
      if (!record) {
        throw new ApiError(404, `Quiz with id ${id} not found`);
      }
      return record;
    } catch (error) {
      console.log(error)
      throw new ApiError(500, 'Error fetching quiz with populated fields', error);
    }
  }

  async findAllWithPopulate(filter, populateOptions) {
    try {

      const quizzes = await QuizModel.find(filter).populate(populateOptions);
      return quizzes;
    } catch (error) {
      throw error;
    }
  }

  async enrollUser(quizId, userId) {
    try {
      return await QuizModel.findByIdAndUpdate(
        quizId,
        { $addToSet: { enrolledUsers: userId } }, // Prevent duplicate enrollments
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }
}

export default QuizRepository;
