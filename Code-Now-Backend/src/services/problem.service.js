import {getJudge0LanguageId, pollBatchResults, submitBatch} from "../config/judge0.js";
import prisma from "../config/prisma.js";
import {encodeBase64} from "../utils/helper.js";

class ProblemService {

    async createProblem(problem, userId) {
        const {
            title,
            description,
            slug,
            difficulty,
            tags,
            examples,
            constraints,
            testcases,
            codeSnippets,
            referenceSolutions,
        } = problem;

        try {
            for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
                const languageId = getJudge0LanguageId(language);

                if (!languageId) {
                    throw new Error(`Language ${language} is not supported`);
                }

                // Encode data base64(code, input, output)
                const submissions = testcases.map(({input, output}) => ({
                    source_code: encodeBase64(solutionCode),
                    language_id: languageId,
                    stdin: encodeBase64(input),
                    expected_output: encodeBase64(output),
                }));

                // submission tokens arr
                const submissionResults = await submitBatch(submissions);
                const tokens = submissionResults.map((res) => res.token);
                const results = await pollBatchResults(tokens);
                console.log(results);

                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    console.log(result);
                    if (result.status.id !== 3) {
                        throw new Error(`Testcase ${i + 1} failed for language ${language}`);
                    }
                }
            }
            const newProblem = await prisma.problem.create({
                data: {
                    title,
                    description,
                    difficulty,
                    slug,
                    tags,
                    examples,
                    constraints,
                    testcases,
                    codeSnippets,
                    referenceSolutions,
                    userId,
                },
            });
            return newProblem;

        } catch (error) {
            console.log(error);
            throw new Error(error.message || "Create Problem failed");
        }
    }

    async getProblems(query) {
        try {
            const {
                search,
                difficulty,
                tagsList,
                userId,
                sortBy = "title",
                order = "desc",
                page = "1",
                pageSize = "10"
            } = query;

            const where = {}
            if (search) {
                where["OR"] = [
                    {title: {contains: search, mode: "insensitive"}},
                    {description: {contains: search, mode: "insensitive"}},
                ]
            }

            if (difficulty) {
                where.difficulty = difficulty.toUpperCase();
            }

            if (tagsList) {
                where.tags = {hasSome: tagsList}
            }
            if (userId) {
                where.userId = userId;
            }

            const skip = (parseInt(page) - 1) * parseInt(pageSize);
            const take = parseInt(pageSize);

            const problems = await prisma.problem.findMany(
                {
                    where,
                    orderBy: {[sortBy]: order},
                    skip,
                    take,
                }
            )
            const total = await prisma.problem.count({where});
            return {
                total,
                problems
            }
        } catch (error) {
            console.log(error);
            throw new Error(error.message || "Get Problems failed");

        }
    }

    async getProblem(problemId) {
        try {
            const problem = await prisma.problem.findUnique({where: {id: problemId}});
            return problem;

        } catch (error) {
            console.log(error);
            throw new Error(error.message || "Get Problem by Id failed");
        }
    }

    async updateProblem(updateProblem, problemId) {

        try {
            /*check if problem update examples, constraints, testcases, codeSnippets, referenceSolutions*/
            const propsCheck = [
                'examples',
                'constraints',
                'testcases',
                'codeSnippets',
                'referenceSolutions'
            ];

            const isPresent = propsCheck.every(key => Object.prototype.hasOwnProperty.call(updateProblem, key));

            if (isPresent) {
                for (const [language, solutionCode] of Object.entries(updateProblem.referenceSolutions)) {
                    const languageId = getJudge0LanguageId(language);

                    if (!languageId) {
                        throw new Error(`Language ${language} is not supported`);
                    }

                    // run testCases
                    const submissions = updateProblem.testcases.map(({input, output}) => ({
                        source_code: solutionCode,
                        language_id: languageId,
                        stdin: input,
                        expected_output: output,
                    }));

                    // submission tokens arr
                    const submissionResults = await submitBatch(submissions);
                    console.log(submissionResults);
                    const tokens = submissionResults.map((res) => res.token);

                    const results = await pollBatchResults(tokens);
                    console.log(results);

                    for (let i = 0; i < results.length; i++) {
                        const result = results[i];
                        console.log(result);
                        if (result.status.id !== 3) {
                            throw new Error(`Testcase ${i + 1} failed for language ${language}`);
                        }
                    }
                }
            }

            if (updateProblem.slug) {
                const slugPresent = await prisma.problem.findUnique({
                    where: {slug: updateProblem.slug}
                });
                if (exist && exist.id !== id) throw new Error('Slug already in use');
            }

            const updatedProblem = await prisma.problem.update({
                where: {id: problemId},
                data: {
                    ...updateProblem,
                    updatedAt: new Date(),
                },
                include: {user: {select: {id: true, name: true, email: true}}}
            });

            return updatedProblem;

        } catch (error) {
            console.log(error);
            throw new Error(error.message || "Update Problem failed");
        }
    }

    async deleteProblem(id) {
        try {
            const deleted = await prisma.problem.delete({where: {id}});
            return deleted;
        } catch (error) {
            console.log(error);
            throw new Error(error.message || "Delete Problem Failed");
        }
    }
}

export default new ProblemService();