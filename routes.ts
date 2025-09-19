import { Router } from "express";
import departamentoRoutes from "./src/routes/departamentoRoutes";

const routes = Router();

routes.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});

routes.use(departamentoRoutes);

export default routes;