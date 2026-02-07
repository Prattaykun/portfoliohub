
const Groq = require('groq-sdk');

// running with node --env-file=.env.local
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  const models = await groq.models.list();
  console.log(models.data.map(m => m.id));
}

main().catch(console.error);
