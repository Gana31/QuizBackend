import CrudRepository from "../../../utils/crudClass.js";
import QuizeUserModel from "../models/user.model.js";

class UserRepository extends CrudRepository{

    constructor(){
        super(QuizeUserModel)
    }
}

export default UserRepository;