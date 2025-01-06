import CrudRepository from "../../../utils/crudClass.js";
import {CategoryModel} from '../../dbrelation.js'
class CategoryRepository extends CrudRepository {
    constructor() {
        super(CategoryModel);
    }

    async findByUserId(userId, options = {}) {
        return await this.model.findAll({ where: { created_by: userId }, ...options });
    }
}

export default CategoryRepository;
