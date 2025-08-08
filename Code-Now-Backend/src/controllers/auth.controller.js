import authService from '../services/auth.service.js';
import userService from "../services/user.service.js";

export const registerHandler = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        await authService.register(email, password);

        res.status(201).json({
            success: true, message: 'User registered successfully',
        });
    } catch (error) {
        res.status(400).json({
            message: error.message || 'Registration failed'
        })

    }
}

export const loginHandler = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        const {tokens, userDetails} = await authService.login(email, password);

        res.cookie("access", tokens?.accessToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        })

        res.cookie("refresh", tokens?.refreshToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        })

        res.status(200).json({
            success: true, message: 'Login successfully',
            userDetails
        })

    } catch (error) {
        res.status(401).json({
            message: error.message || "Invalid credentials"
        })
    }
}

export const validateUser = async (req, res, next) => {
    try {
        const userId = req.userId;
        const userDetails = await userService.getUserById(userId);
        return res.status(200).json({
            success: true,
            userDetails: userDetails
        })
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            message: error.message || 'User not found',
        })
    }

}

export const refreshHandler = async (req, res,) => {
    try {
        const refreshToken = req.cookies['refresh'];
        const token = await authService.refresh(refreshToken);

        res.cookie("access", token.accessToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        })


        res.status(200).json({
            success: true, message: 'Token refreshed successfully',
        });
    } catch (error) {
        res.status(400).json({
            message: error.message || 'Refresh token failed'
        })
    }
}

export const logoutHandler = async (req, res, next) => {
    try {
        const {refreshToken} = req.cookies['refresh'];
        await authService.logout(refreshToken);

        res.status(200).json({
            success: true, message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
}


export const forgotPasswordHandler = async (req, res, next) => {
    try {
        const {email} = req.body;
        await authService.forgotPassword(email);

        res.status(200).json({
            success: true, message: 'Password reset link sent'
        });
    } catch (error) {
        next(error);
    }
}

export const resetHandler = async (req, res, next) => {
    try {
        const {userId, token} = req.params;
        const {password} = req.body;

        await authService.reset(userId, token, password);

        res.status(200).json({
            success: true, message: 'Password reset successfully'
        });
    } catch (error) {
        next(error);
    }
}