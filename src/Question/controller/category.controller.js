
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asynchandler.js";
import CategoryService from "../services/category.service.js";

class CategoryController {
    createCategory = asyncHandler(async (req, res, next) => {
        const user = req.user; // Assume user info is attached to the request
        const categoryData = req.body;

        const newCategory = await CategoryService.createCategory(categoryData, user);
        res.status(201).json(new ApiResponse(201, "Category created successfully", newCategory));
    });

    getAllCategories = asyncHandler(async (req, res, next) => {
        const categories = await CategoryService.getAllCategories();
        res.status(200).json(new ApiResponse(200, "Categories fetched successfully", categories));
    });

    getCategoryById = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const category = await CategoryService.getCategoryById(id);
        res.status(200).json(new ApiResponse(200, "Category fetched successfully", category));
    });

    updateCategory = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const user = req.user; // Assume user info is attached to the request
        const categoryData = req.body;

        const updatedCategory = await CategoryService.updateCategory(id, categoryData, user);
        res.status(200).json(new ApiResponse(200, "Category updated successfully", updatedCategory));
    });

    deleteCategory = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const user = req.user; // Assume user info is attached to the request

        await CategoryService.deleteCategory(id, user);
        res.status(200).json(new ApiResponse(200, "Category deleted successfully"));
    });
}

export default new CategoryController();
