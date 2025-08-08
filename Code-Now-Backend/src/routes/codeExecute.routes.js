import {Router} from "express";
import {runCodeHandler, submitCodeHandler} from "../controllers/codeExecutor.controller.js";
import {authMiddleware} from "../middlewares/auth.middleware.js";

const executorRouter = Router();

executorRouter.post("/run/:problemId",authMiddleware ,runCodeHandler)
executorRouter.post("/submit/:problemId",authMiddleware, submitCodeHandler);

export default executorRouter;