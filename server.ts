import Express from "express";
import dotenv from "dotenv";

import cors from "cors";

import routes from "./routes";

dotenv.config()

const server = Express();

server.use(cors())
server.use(Express.json());
server.use(routes);

const PORT = process.env.PORT || 4000;
const serverInstance = server.listen(PORT);

export default serverInstance;