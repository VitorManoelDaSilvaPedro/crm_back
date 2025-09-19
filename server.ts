import Express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import cors from "cors";

import routes from "./routes";
import { specs } from "./src/config/swaggerConfig";
import { basicAuth } from "./src/middleware/authMiddleware";

dotenv.config()

const server = Express();

server.use(cors())
server.use(Express.json());
server.use(routes);

server.use("/docs", basicAuth, swaggerUi.serve, swaggerUi.setup(specs));

const PORT = process.env.PORT || 4000;
const serverInstance = server.listen(PORT);

export default serverInstance;