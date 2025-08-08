import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import path from 'path';
import {fileURLToPath} from 'url';
import userRouter from "./routes/user.routes.js";
import problemRouter from "./routes/problem.routes.js";
import submissionsRouter from "./routes/submissions.routes.js";
import executorRouter from "./routes/codeExecute.routes.js";

const app = express();

// env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
    path: path.join(__dirname, '../.env'),
});


app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// cors
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

// health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Success!',
    });
})

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/problems", problemRouter)
app.use("/api/submissions", submissionsRouter)
app.use("/api/execute", executorRouter)


app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});







