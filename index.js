const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());

// Gemini AI Initialize
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// AI Code Endpoint
app.post('/generate-code', async (req, res) => {
  const { prompt, language } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are a dedicated Code Writer AI.
Rules:
1. Output ONLY valid, executable code inside markdown code blocks.
2. Target Language: ${language || 'Any'}.
3. NO greetings, NO explanations, NO chat or commentary outside code comments.`,
        temperature: 0.1,
      },
    });

    res.json({ code: response.text });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate code: ' + err.message });
  }
});

// Mobile Friendly HTML UI Interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Termux Code Writer AI</title>
      <style>
        body { font-family: monospace; background: #0d1117; color: #58a6ff; padding: 15px; margin: 0; }
        h3 { text-align: center; color: #58a6ff; }
        select, input, button { width: 100%; padding: 12px; margin-top: 10px; border-radius: 6px; border: 1px solid #30363d; font-size: 15px; box-sizing: border-box; }
        input, select { background: #161b22; color: #c9d1d9; }
        button { background: #238636; color: #ffffff; font-weight: bold; cursor: pointer; border: none; }
        button:active { background: #2ea043; }
        pre { background: #161b22; padding: 12px; border-radius: 6px; border: 1px solid #30363d; color: #7ee787; overflow-x: auto; white-space: pre-wrap; word-break: break-all; margin-top: 15px; font-size: 13px; }
      </style>
    </head>
    <body>
      <h3>⚡ Termux Code Writer AI</h3>
      
      <label style="color:#8b949e;">Select Language:</label>
      <select id="language">
        <option value="python">Python</option>
        <option value="javascript">JavaScript</option>
        <option value="html">HTML / CSS</option>
        <option value="cpp">C++</option>
        <option value="bash">Bash / Shell</option>
      </select>

      <input type="text" id="prompt" placeholder="কী কোড চান লিখুন (যেমন: Login Form)">
      <button onclick="getCode()" id="btn">Generate Code</button>

      <pre id="output">// আপনার কোড এখানে দেখাবে...</pre>

      <script>
        async function getCode() {
          const prompt = document.getElementById('prompt').value;
          const language = document.getElementById('language').value;
          const output = document.getElementById('output');
          const btn = document.getElementById('btn');

          if (!prompt) return alert('Please enter a prompt!');
          
          btn.innerText = 'Writing Code...';
          output.innerText = 'Generating code, please wait...';

          try {
            const res = await fetch('/generate-code', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt, language })
            });
            const data = await res.json();
            output.innerText = data.code || 'Error occurred!';
          } catch(e) {
            output.innerText = 'Error connecting to server.';
          } finally {
            btn.innerText = 'Generate Code';
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Start Express Server
app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
