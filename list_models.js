
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, val] = line.split('=');
  if (key && val) env[key.trim()] = val.trim();
});

async function list() {
  const apiKey = env.NEXT_PUBLIC_GEMINI_API_KEY || env.GEMINI_API_KEY; // Use the one that worked or try both
  console.log("Using Key ending in: " + apiKey?.slice(-4));
  
  // Direct fetch for list models
  try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const data = await resp.json();
      if (data.models) {
          console.log("Available Models:");
          data.models.forEach(m => console.log(m.name));
      } else {
          console.log("Error listing models:", JSON.stringify(data));
      }
  } catch(e) { console.error(e); }
}
list();
