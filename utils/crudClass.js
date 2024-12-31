// CrudRepository.js
import { ApiError } from "./ApiError.js"; // Import your custom error class

class CrudRepository {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        try {
            const createdRecord = await this.model.create(data);
            return createdRecord;
        } catch (error) {
            // Throw a new ApiError for consistency
            console.log(error)
            throw new ApiError(500, error.message || 'Error creating record', error);
        }
    }

    async findById(id, options = {}) {
        try {
            const record = await this.model.findByPk(id, options);
            if (!record) {
                throw new ApiError(404, `Record with id ${id} not found`);
            }
            return record;
        } catch (error) {
            throw new ApiError(500, 'Error fetching record by ID', error);
        }
    }

    async findAll(options = {}) {
        try {
            const records = await this.model.findAll(options);
            return records;
        } catch (error) {
            throw new ApiError(500, 'Error fetching all records', error);
        }
    }

    async update(id, data) {
        try {
            const [updated] = await this.model.update(data, { where: { id } });
            if (!updated) {
                throw new ApiError(404, `Record with id ${id} not found`);
            }
            return await this.findById(id);
        } catch (error) {
            throw new ApiError(500, 'Error updating record', error);
        }
    }

    async delete(id) {
        try {
            const deleted = await this.model.destroy({ where: { id } });
            if (!deleted) {
                throw new ApiError(404, `Record with id ${id} not found`);
            }
            return { message: 'Record deleted successfully', deleted };
        } catch (error) {
            throw new ApiError(500, 'Error deleting record', error);
        }
    }

    async findByEmail(email) {
        try {
            const record = await this.model.findOne({ where: { email } });
            if (!record) {
               return null
            }
            return record;
        } catch (error) {
            throw new ApiError(500, error.message || 'Error fetching user by email', error);
        }
    }

    async findOne(options) {
        try {
            const record = await this.model.findOne(options);
            return record;
        } catch (error) {
            throw new ApiError(500, 'Error fetching record by criteria', error);
        }
    }

    async findByRelation(relationship, where) {
        try {
            const record = await this.model.findOne({
                where,
                include: relationship,
            });
            if (!record) {
                throw new ApiError(404, 'Record not found with the given relation');
            }
            return record;
        } catch (error) {
            throw new ApiError(500, 'Error fetching records with relation', error);
        }
    }
}

export default CrudRepository;
