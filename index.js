import app from "./app.js";
import { connectDatabase } from "./config/databaseconfig.js";
import ServerConfig from "./config/ServerConfig.js";
import { ApiError } from "./utils/ApiError.js";



const PORT = ServerConfig.PORT || 8080

const serverstart = async () => {
    try {
        await connectDatabase();
        app.listen(PORT, () => {
            console.log(`Server Is Up on ${PORT}`);
        })

    } catch (error) {
        // console.log(error);
        throw new ApiError(400,error.message);
    }
}

serverstart();