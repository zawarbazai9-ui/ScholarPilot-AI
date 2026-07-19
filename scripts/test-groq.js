const Groq = require('groq-sdk');
const fs = require('fs');

// Read key from .env
const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/^GROQ_API_KEY=(.+)$/m);
const key = match ? match[1].trim() : '';
console.log('Key loaded:', key ? key.slice(0, 8) + '...' : 'MISSING');

if (!key) {
  console.error('No GROQ_API_KEY found in .env');
  process.exit(1);
}

const groq = new Groq({ apiKey: key });

(async () => {
  try {
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Say "Groq API is working!" in exactly those words.' }],
    });
    console.log('Response:', res.choices[0]?.message?.content);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
