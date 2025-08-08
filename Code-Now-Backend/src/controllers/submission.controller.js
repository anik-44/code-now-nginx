import submissionService from "../services/submission.service.js";

export const getProblemSubmissionHandler = async (req, res) => {
    try {
        const problemId = req.params.problemId;
        const userId = req.userId;
        const submissions = await submissionService.getProblemSubmission(problemId, userId,);
        return res.status(200).json({
            success: true,
            submissions,
        });
    } catch (error) {
        (error);
        return res.status(400).json({
            success: false,
            error: error.message || "Get Problem Submission Failed"
        })
    }
}

export const getAllSubmissionsHandler = (req, res) => {
    try {
        const userId = req.userId;

        const submissions = submissionService.getAllSubmissions(userId);
        return res.status(200).json({
            success: true,
            submissions,
        })

    } catch (error) {
        console.error(error);
        return res.status(400).json({
            success: false,
            error: error.message || "Get User Submissions Failed"
        })
    }


}