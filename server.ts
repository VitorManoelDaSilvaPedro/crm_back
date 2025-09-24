import Express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import cors from "cors";

import routes from "./routes";
import { specs } from "./src/config/swaggerConfig";
import { basicAuth } from "./src/middleware/authMiddleware";
import { UserSeed } from "./src/repositories/seeds/userSeed";

dotenv.config()

const server = Express();

server.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
server.use(Express.json());

// Rotas do Swagger (antes das rotas da API)
server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
server.use("/docs", basicAuth, swaggerUi.serve, swaggerUi.setup(specs));

// Rotas da API
server.use(routes);

const PORT = process.env.PORT || 4000;
const serverInstance = server.listen(PORT, async () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    
    // Executar seed automaticamente
    const seed = new UserSeed();
    await seed.run();
});

export default serverInstance;