import {Router} from "express";
import {
    forgotPasswordHandler,
    loginHandler,
    logoutHandler,
    refreshHandler,
    registerHandler,
    resetHandler, validateUser
} from "../controllers/auth.controller.js";
import {authMiddleware} from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post('/register',
    registerHandler
);

authRouter.post('/login',
    loginHandler)

authRouter.post('/refresh', refreshHandler)

authRouter.post('/logout',
    logoutHandler
);

authRouter.post('/password/forgot',
    forgotPasswordHandler
);

authRouter.post('/password-reset/:userId/:token',
    resetHandler
);

authRouter.get('/validate', authMiddleware, validateUser)
export default authRouter;