import questionController from "./controller/question.controller.js"
import QuizModel from "./models/quiz.model.js"
import QuestionRepository from "./repository/question.repository.js"
import QuizRepository from "./repository/quiz.repository.js"
import TopicRepository from "./repository/topic.repository.js"
import questionRoutes from "./Routes/question.routes.js"
import questionServices from "./services/question.services.js"
import QuestionModel from './models/question.model.js'
import TopicModel from './models/topic.model.js'

export {
    questionController,
    questionRoutes,
    questionServices,
    QuestionRepository,
    TopicRepository,
    QuizRepository,
    QuizModel,
    QuestionModel,
    TopicModel
}