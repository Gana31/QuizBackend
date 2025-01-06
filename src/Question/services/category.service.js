// CategoryService.js
import { ApiError } from "../../../utils/ApiError.js";
import CategoryRepository from "../repository/category.repository.js";


const categoryRepository = new CategoryRepository();

class CategoryService {
    async createCategory(data, user) {
        if (user.role !== "Teacher") {
            throw new ApiError(403, "Only Teachers can create categories");
        }
        data.created_by = user.id;
        return await categoryRepository.create(data);
    }

    async getAllCategories() {
        return await categoryRepository.findAll();
    }

    async getCategoryById(id) {
        return await categoryRepository.findById(id);
    }

    async updateCategory(id, data, user) {
        const category = await categoryRepository.findById(id);

        if (category.created_by !== user.id) {
            throw new ApiError(403, "You can only update categories you created");
        }

        return await categoryRepository.update(id, data);
    }

    async deleteCategory(id, user) {
        const category = await categoryRepository.findById(id);

        if (category.created_by !== user.id) {
            throw new ApiError(403, "You can only delete categories you created");
        }

        return await categoryRepository.delete(id);
    }
}

export default new CategoryService();
