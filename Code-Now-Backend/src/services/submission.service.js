import prisma from "../config/prisma.js";

class SubmissionService {

    async getProblemSubmission(problemId, userId) {
        try {
            const submissions = await prisma.submission.findMany({
                where: {
                    problemId: problemId,
                    userId: userId
                }
            });
            return submissions;

        } catch (error) {
            console.log(error);
            throw new Error(error.message || "Get Problem Submission failed!");
        }

    }

    async getAllSubmissions(userId) {
        try {
            const submissions = await prisma.submission.findMany({
                where: {
                    userId: userId
                }
            })
            return submissions;
        } catch (error) {
            console.log(error);
            throw new Error(error.message || "Get All Submissions failed!");
        }

    }
}

export default new SubmissionService();