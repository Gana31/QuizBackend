import CategoryModel from "./Question/models/category.model.js";
import QuestionModel from "./Question/models/question.model.js";
import QuestionOptionModel from "./Question/models/questionoptions.model.js";
import TopicModel from "./Question/models/topic.model.js";
import QuizeUserModel from "./User/models/user.model.js";

CategoryModel.belongsTo(QuizeUserModel, { foreignKey: "created_by", as: "creator" });
CategoryModel.hasMany(TopicModel, { foreignKey: "category_id", as: "topics" });

TopicModel.belongsTo(CategoryModel, { foreignKey: "category_id", as: "category" });
TopicModel.belongsTo(QuizeUserModel, { foreignKey: "created_by", as: "creator" });
TopicModel.hasMany(QuestionModel, { foreignKey: "topic_id", as: "questions" });

QuestionModel.belongsTo(TopicModel, { foreignKey: "topic_id", as: "topic" });
QuestionModel.belongsTo(QuizeUserModel, { foreignKey: "created_by", as: "creator" });
QuestionModel.hasMany(QuestionOptionModel, { foreignKey: "question_id", as: "options" });
QuestionModel.belongsTo(QuestionOptionModel, { foreignKey: "correct_option_id", as: "correctOption" });

QuestionOptionModel.belongsTo(QuestionModel, { foreignKey: "question_id", as: "question" });


export {
    CategoryModel,
    TopicModel,
    QuestionModel,
    QuestionOptionModel,
  };