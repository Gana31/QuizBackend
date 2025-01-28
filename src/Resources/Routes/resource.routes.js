import express from 'express';
import { authMiddleware, requireRole } from '../../Middleware/authMiddleware.js';
import ResourceController from '../controller/resource.controller.js';

const resourceRoutes = express.Router();

// Resource Routes (CRUD for resources)
resourceRoutes.post('/createResource', authMiddleware, requireRole("Teacher"), ResourceController.createResource); // Create a new resource
resourceRoutes.get('/getResource/:resourceId', authMiddleware, requireRole("Teacher"), ResourceController.getResourceById); // Get a resource by ID
resourceRoutes.put('/updateResource/:resourceId', authMiddleware, requireRole("Teacher"), ResourceController.updateResource); // Update a resource
resourceRoutes.delete('/deleteResource/:resourceId', authMiddleware, requireRole("Teacher"), ResourceController.deleteResource); // Delete a resource

// Question Routes (CRUD for questions associated with resources)
resourceRoutes.post('/createResourceQuestion', authMiddleware, requireRole("Teacher"), ResourceController.createQuestion); // Create a new question
resourceRoutes.get('/getQuestionsByResource/:resourceId', authMiddleware, requireRole("Teacher"), ResourceController.getQuestionsByResource); // Get questions by resource ID
resourceRoutes.put('/updateResourceQuestion/:questionId', authMiddleware, requireRole("Teacher"), ResourceController.updateQuestion); // Update a question
resourceRoutes.delete('/deleteResourceQuestion/:questionId', authMiddleware, requireRole("Teacher"), ResourceController.deleteQuestion); // Delete a question

// Admin-specific resource route
resourceRoutes.get('/getAllAdminResources', authMiddleware, requireRole("Teacher"), ResourceController.getAllAdminResources); // Get all resources created by the teacher

resourceRoutes.get("/resourcesAlldetails", ResourceController.getAllResourcesWithCategories);
export default resourceRoutes;
