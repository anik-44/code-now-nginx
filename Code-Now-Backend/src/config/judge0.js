import axios from "axios"
import {supportedLanguages} from "../utils/constants.js";

export const getJudge0LanguageId = (language) => {
    const languageMap = {
        "PYTHON": 71, "JAVA": 62, "JAVASCRIPT": 63,
    }
    return languageMap[language.toUpperCase()]
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const pollBatchResults = async (tokens, maxRetries = 30, delay = 1000) => {
    let attempts = 0;
    while (attempts < maxRetries) {
        try {
            const {data} = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`, {
                params: {
                    tokens: tokens.join(","), base64_encoded: true,
                }
            });
            const results = data.submissions;

            // Decode result
            for (const res of results) {
                if (res.stdout) res.stdout = atob(res.stdout);
                if (res.stderr) res.stderr = atob(res.stderr);
                if (res.compile_output) res.compile_output = atob(res.compile_output);
                if (res.message) res.message = atob(res.message);
            }

            const isAllDone = results.every((res) => {
                return res.status.id !== 1 && res.status.id !== 2
            });

            if (isAllDone) return results;

        } catch (error) {
            console.error("Polling error", error.message);
        }

        await sleep(delay);
        attempts++;
    }
    throw new Error("Polling Timed out");
};

export const submitBatch = async (submissions) => {
    const {data} = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=true`, {
        submissions
    })
    return data;
}


export function getLanguageName(languageId) {
    const LANGUAGE_NAMES = {
        63: supportedLanguages.javascript, 71: supportedLanguages.python, 62: supportedLanguages.java,
    }
    return LANGUAGE_NAMES[languageId] || "Unknown"
}