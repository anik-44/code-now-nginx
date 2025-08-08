import {Router} from "express";
import {authMiddleware} from "../middlewares/auth.middleware.js";
import {getUserDetails, updateUserDetails} from "../controllers/user.controller.js";

const userRouter = Router();


userRouter.get('/profile', authMiddleware, getUserDetails);
userRouter.put('/update', authMiddleware, updateUserDetails);


export default userRouter;