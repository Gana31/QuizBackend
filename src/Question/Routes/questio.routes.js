import express from 'express';
import { authMiddleware } from '../../Middleware/authMiddleware.js';
import QuestionController from '../controller/question.controller.js';

const questionRoutes = express.Router();

questionRoutes.post('/createQuestion', authMiddleware, QuestionController.createQuestion);
questionRoutes.get('/getqize', authMiddleware, QuestionController.getQuizData);
questionRoutes.put('/updateQuestion/:id', authMiddleware, QuestionController.updateQuestion);
questionRoutes.delete('/deleteQuestion/:id', authMiddleware, QuestionController.deleteQuestion);

export default questionRoutes;
