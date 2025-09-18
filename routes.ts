import { Router } from "express";

const routes = Router();

routes.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});

export default routes;