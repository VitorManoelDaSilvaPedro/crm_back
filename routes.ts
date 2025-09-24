import { Router } from "express";
import departamentoRoutes from "./src/routes/departamentoRoutes";
import usuarioRoutes from "./src/routes/usuarioRoutes";
import authRoutes from "./src/routes/authRoutes";
import boardRoutes from "./src/routes/boardRoutes";
import { conditionalAuthMiddleware } from "./src/middleware/conditionalAuthMiddleware";

const routes = Router();

routes.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});

// Rotas públicas (sem autenticação)
routes.use(authRoutes);

// Aplicar middleware de autenticação condicional
routes.use(conditionalAuthMiddleware);
routes.use(departamentoRoutes);
routes.use(usuarioRoutes);
routes.use(boardRoutes);

export default routes;