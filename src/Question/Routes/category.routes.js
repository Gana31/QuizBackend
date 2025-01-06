import express from 'express'
import { authMiddleware } from '../../Middleware/authMiddleware.js';
import CategoryController from '../controller/category.controller.js';


const categoryRoutes = express.Router();

categoryRoutes.post("/createcategory", authMiddleware, CategoryController.createCategory);
categoryRoutes.get("/getAllcategory", authMiddleware, CategoryController.getAllCategories);
categoryRoutes.get("/getcategoryByid/:id", authMiddleware, CategoryController.getCategoryById);
categoryRoutes.put("/updateCategory/:id", authMiddleware, CategoryController.updateCategory);
categoryRoutes.delete("/deleteCategory/:id", authMiddleware, CategoryController.deleteCategory);

export default categoryRoutes;