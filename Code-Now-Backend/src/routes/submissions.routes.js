import {Router} from "express";
import {getProblemSubmissionHandler} from "../controllers/submission.controller.js";
import {authMiddleware} from "../middlewares/auth.middleware.js";

const submissionsRouter = Router();

submissionsRouter.get("/:problemId", authMiddleware, getProblemSubmissionHandler);

export  default submissionsRouter;
