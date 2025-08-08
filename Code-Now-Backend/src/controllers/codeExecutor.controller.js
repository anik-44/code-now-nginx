import codeExecutorService from "../services/codeExecutor.service.js";

export const runCodeHandler = async (req, res) => {
    try {
        const problemId = req.params.problemId;
        const {code, language, userInput} = req.body;
        const result = await codeExecutorService.runCode(code, userInput, problemId, language)
        return res.status(200).json({
            success: true, result
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false, error: error.message || "Run Code failed"
        })
    }
}

export const submitCodeHandler = async (req, res) => {
    try {
        const problemId = req.params.problemId;
        const {code, language} = req.body;
        const userId = req.userId
        const submission = await codeExecutorService.submitCode(code, problemId, language, userId);
        return res.status(200).json({
            success: true, submission
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false, error: error.message || "Submit Code failed"
        })

    }

}