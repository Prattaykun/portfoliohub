
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Simple parser for .env.local since dotenv might not be installed or configured for .local
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, val] = line.split('=');
  if (key && val) env[key.trim()] = val.trim();
});

async function testModel(modelName, keyName, keyValue) {
  if (!keyValue) {
    console.log(`Skipping ${keyName} (Empty)`);
    return;
  }
  console.log(`Testing ${modelName} with ${keyName}...`);
  try {
    const genAI = new GoogleGenerativeAI(keyValue);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello");
    console.log(`SUCCESS: ${modelName} with ${keyName}`);
    console.log(result.response.text());
  } catch (error) {
    console.log(`FAILED: ${modelName} with ${keyName}`);
    // console.log(error.message); // too verbose?
    if (error.message.includes("404")) console.log("Error: 404 Not Found (Model not supported)");
    else if (error.message.includes("400")) console.log("Error: 400 Bad Request (Location/Key issue)");
    else console.log("Error: " + error.message.substring(0, 100));
  }
}

async function run() {
  await testModel("gemini-1.5-flash", "GEMINI_API_KEY", env.GEMINI_API_KEY);
  await testModel("gemma-3-12b-it", "GEMINI_API_KEY", env.GEMINI_API_KEY);
  await testModel("gemini-2.5-flash", "GEMINI_API_KEY", env.GEMINI_API_KEY);
  await testModel("gemini-pro", "GEMINI_API_KEY", env.GEMINI_API_KEY);
  await testModel("gemini-pro", "NEXT_PUBLIC_GEMINI_API_KEY", env.NEXT_PUBLIC_GEMINI_API_KEY);
}

run();
