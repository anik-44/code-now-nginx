import {Router} from 'express';
import {authMiddleware, checkAdmin} from "../middlewares/auth.middleware.js";
import {
    createProblemHandler, deleteProblemHandler,
    getProblemByIdHandler,
    getProblemsHandler,
    updateProblemHandler
} from "../controllers/problem.controller.js";


const problemRouter = Router();

problemRouter.post("/create-problem", authMiddleware, checkAdmin, createProblemHandler);
problemRouter.get("/", getProblemsHandler);
problemRouter.get("/:id", getProblemByIdHandler);
problemRouter.put("/:id", authMiddleware, checkAdmin, updateProblemHandler)
problemRouter.delete("/:id", authMiddleware, checkAdmin, deleteProblemHandler);

export default problemRouter;