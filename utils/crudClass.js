import { ApiError } from "./ApiError.js"; // Import your custom error class

class CrudRepository {
  constructor(model) {
    this.model = model; // Mongoose model
  }

  // Create method
  async create(data) {
    try {
      const createdRecord = await this.model.create(data);
      return createdRecord;
    } catch (error) {
      console.log(error);
      throw new ApiError(500, error.message || 'Error creating record', error);
    }
  }

  // Find by ID method
  async findById(id) {
    try {
      const record = await this.model.findById(id);
      if (!record) {
        throw new ApiError(404, `Record with id ${id} not found`);
      }
      return record;
    } catch (error) {
      throw new ApiError(500, 'Error fetching record by ID', error);
    }
  }

  // Find all records
  async findAll() {
    try {
      const records = await this.model.find();
      return records;
    } catch (error) {
      throw new ApiError(500, 'Error fetching all records', error);
    }
  }

  // Update method
  async update(id, data) {
    try {
      const updatedRecord = await this.model.findByIdAndUpdate(id, data, { new: true });
      if (!updatedRecord) {
        throw new ApiError(404, `Record with id ${id} not found`);
      }
      return updatedRecord;
    } catch (error) {
      throw new ApiError(500, 'Error updating record', error);
    }
  }

  // Delete method
  async delete(id) {
    try {
      const deletedRecord = await this.model.findByIdAndDelete(id);
      if (!deletedRecord) {
        throw new ApiError(404, `Record with id ${id} not found`);
      }
      return { message: 'Record deleted successfully' };
    } catch (error) {
      throw new ApiError(500, 'Error deleting record', error);
    }
  }

  // Find by email method
  async findByEmail(email) {
    try {
      const record = await this.model.findOne({ email });
      return record;
    } catch (error) {
      throw new ApiError(500, 'Error fetching user by email', error);
    }
  }

  // Find one with options (similar to findOne in Sequelize)
  async findOne(options) {
    try {
      const record = await this.model.findOne(options);
      return record;
    } catch (error) {
      throw new ApiError(500, 'Error fetching record by criteria', error);
    }
  }

  // Find by relation method (MongoDB uses population for relationships)
  async findByRelation(relationship, where) {
    try {
      const record = await this.model.findOne(where).populate(relationship);
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
