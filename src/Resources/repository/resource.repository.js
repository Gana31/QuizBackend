import CrudRepository from "../../../utils/crudClass.js";
import ResourceModel from "../models/resource.model.js";



class ResourceRepository extends CrudRepository {
  constructor() {
    super(ResourceModel);  
  }

  
}

export default ResourceRepository;
