import userService from "../services/user.service.js";

export const getUserDetails = async (req, res, next) => {
    try {
        const userId = req.userId;
        const user = await userService.getUserById(userId);

        res.json({
            success: true, message: 'User details retrieved successfully', data: user
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "User not found"
        })

    }
}

export const updateUserDetails = async (req, res, next) => {
    try {
        const userId = req.userId;
        const updateData = req.body;
        const updatedUser = await userService.updateUser(userId, updateData);

        res.json({
            success: true, message: 'User details updated successfully', data: updatedUser
        });
    } catch (error) {
        res.status(400).json({
            message: "Update user failed."
        })
    }
}
