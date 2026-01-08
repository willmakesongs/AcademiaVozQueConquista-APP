
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Load .env.local manually
let apiKey = "";
try {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const match = envFile.match(/GEMINI_API_KEY=(.+)/);
    if (match && match[1]) {
        apiKey = match[1].trim();
    }
} catch (e) {
    console.error("Error reading .env.local", e);
}

if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    console.error("No valid GEMINI_API_KEY found in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log("Fetching available models...");
        // Hack: The SDK doesn't expose listModels directly globally easily in all versions, 
        // but fully supported in v1beta check.

        const modelsToCheck = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro", "gemini-1.5-pro", "gemini-1.5-flash-latest"];

        for (const modelName of modelsToCheck) {
            console.log(`\nTesting model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                // Simple generation to test access
                const result = await model.generateContent("Hello, are you there?");
                console.log(`✅ SUCCESS: ${modelName} responded.`);
                // console.log(result.response.text()); 
            } catch (error) {
                console.log(`❌ FAILURE: ${modelName} - ${error.message}`);
            }
        }

    } catch (error) {
        console.error("Global Error:", error);
    }
}

listModels();
