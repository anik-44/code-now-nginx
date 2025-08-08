import prisma from "../config/prisma.js";
import {getJudge0LanguageId, getLanguageName, pollBatchResults, submitBatch} from "../config/judge0.js";
import {supportedLanguages, status} from "../utils/constants.js";
import {encodeBase64} from "../utils/helper.js";

class CodeExecutorService {
    async runCode(userCode, userInput = "", problemId, language) {
        try {
            const problem = await prisma.problem.findUnique({
                where: {id: problemId},
            });
            const languageId = getJudge0LanguageId(language);
            if (!languageId) {
                throw new Error(`Language ${language} is not supported`);
            }
            const solutionCode = problem.referenceSolutions[supportedLanguages.java];
            // first get expected output for userInput
            const submissions = {
                source_code: encodeBase64(solutionCode), language_id: languageId, stdin: encodeBase64(userInput),
            }

            const submissionResults = await submitBatch([submissions]);
            const tokens = submissionResults.map(res => res.token)
            const expectedResultArray = await pollBatchResults(tokens)

            // Now run for user code
            const userSubmissions = {
                source_code: encodeBase64(userCode), language_id: languageId, stdin: encodeBase64(userInput),
            };
            const userSubmissionBatch = await submitBatch([userSubmissions]);
            const userSubmissionTokens = userSubmissionBatch.map(res => res.token)
            const userSubmissionResult = await pollBatchResults(userSubmissionTokens)

            if (userSubmissionResult[0].stderr === null && userSubmissionResult[0].compileOutput === null) {
                const finalResult = userSubmissionResult.map((result, index) => {
                    const resultStatus = result["stdout"] === expectedResultArray[index]["stdout"] ? status.accepted : status.wrong;
                    console.log(resultStatus)
                    return {
                        userResult: {
                            ...userSubmissionResult[0]
                        }, expectedResult: {
                            ...expectedResultArray[0]
                        }, status: resultStatus,
                    }
                })
                return finalResult;
            } else {
                const finalResult = userSubmissionResult.map((result, index) => {
                    return {
                        userResult: {
                            ...userSubmissionResult[0]
                        }, expectedResult: {
                            ...expectedResultArray[0]
                        }, status: status.error,
                    }
                })
                return finalResult;

            }


        } catch (error) {
            console.error(error);
            throw new Error(error.message || "Run Code Service failed");
        }

    }

    async submitCode(code, problemId, language, userId) {
        try {
            const problem = await prisma.problem.findUnique({
                where: {id: problemId},
            });
            const languageId = getJudge0LanguageId(language);
            if (!languageId) {
                throw new Error(`Language ${language} is not supported`);
            }
            const submissions = problem.testcases.map(({input, output}) => ({
                source_code: encodeBase64(code),
                language_id: languageId,
                stdin: encodeBase64(input),
                expected_output: encodeBase64(output),
            }));
            const submissionResults = await submitBatch(submissions);
            const tokens = submissionResults.map(res => res.token)
            const pollResults = await pollBatchResults(tokens)

            const submissionData = pollResults.reduce((accumulator, current) => {
                const time = Math.max(Number(accumulator?.time), Number(current.time))
                const memory = Math.max(Number(accumulator?.memory), Number(current.memory))
                const resultStatus = (accumulator?.status === status.wrong || Number(current.status.id) !== 3) ? status.wrong : status.accepted;
                const stderr = current.stderr || accumulator.stderr;
                const compileOutput = accumulator?.compileOutput || current?.compile_output;
                return {
                    time: time.toString(),
                    memory: memory.toString(),
                    stderr: stderr,
                    compileOutput: compileOutput,
                    status: (current.stderr === null && current.compile_output === null) ? resultStatus : status.error,
                }
            })

            // create submission in db
            const submission = await prisma.submission.create({
                data: {
                    ...submissionData,
                    sourceCode: code,
                    userId: userId,
                    problemId: problemId,
                    language: getLanguageName(languageId),
                },
            })
            return submission;

        } catch (error) {
            console.error(error);
            throw new Error(error.message || "Submit Code failed");
        }

    }
}

export default new CodeExecutorService();