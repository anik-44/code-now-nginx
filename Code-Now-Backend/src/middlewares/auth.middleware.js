import {verifyAccess} from "../utils/jwt.js";

export const checkAdmin = async (req, res, next) => {
    try {
        const userId = req.userId;

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                role: true
            }
        })

        if (!user || user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Permission denied"
            })
        }

        next();
    } catch (error) {
        console.error("Error checking admin role:", error);
        res.status(500).json({message: "Error checking admin role"});
    }
}

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies['access']
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            })
        }
        const payload = verifyAccess(token);
        req.userId = payload.sub;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({"message": "Invalid token"});
    }
}

