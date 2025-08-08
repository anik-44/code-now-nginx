import problemService from '../services/problem.service.js';

export const createProblemHandler = async (req, res) => {
    try {
        const problem = req.body
        const userId = req.userId
        const newProblem = await problemService.createProblem(problem, userId);
        return res.status(201).json({
            success: true,
            message: "Problem Created Successfully",
            problem: newProblem,
        });
    } catch
        (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message || "Create Problem failed",
        });
    }
}

export const getProblemsHandler = async (req, res) => {
    try {
        const result = await problemService.getProblems(req.query);
        return res.json({
            success: true,
            total: result.total,
            problems: result.problems
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message || "Get Problems failed",
        });
    }
}

export const getProblemByIdHandler = async (req, res) => {
    try {
        const problemId = req.params.id;
        const problem = await problemService.getProblem(problemId);
        return res.status(200).json({
            success: true,
            problem: problem
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message || "Get Problem by Id failed",
        });
    }
}

export const updateProblemHandler = async (req, res) => {
    try {
        const problemId = req.params.id;
        const updateProblem = await problemService.updateProblem(req.body, problemId);
        return res.status(200).json({
            success: true,
            message: "Updated Problem",
            updatedProblem: updateProblem
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message || "Update Problem failed",
        })
    }
}

export const deleteProblemHandler = async (req, res) => {
    const userId = req.userId;
    try {
        await problemService.deleteProblem(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Problem Deleted Successfully",
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || "Delete Problem failed",
        })
    }
}