const express = require('express');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 10000;

// Initialize Groq Client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json());

// UI Homepage
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nexus plus/title>
        <style>
            body { font-family: sans-serif; background: #0f172a; color: white; padding: 20px; max-width: 600px; margin: auto; }
            h2 { text-align: center; color: #38bdf8; }
            label { display: block; margin-top: 15px; margin-bottom: 5px; color: #94a3b8; }
            select, input, button { width: 100%; padding: 12px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: white; box-sizing: border-box; }
            button { background: #16a34a; font-weight: bold; cursor: pointer; border: none; margin-top: 10px; }
            button:disabled { background: #475569; }
            pre { background: #1e293b; padding: 15px; border-radius: 8px; white-space: pre-wrap; word-wrap: break-word; color: #4ade80; border: 1px solid #334155; }
        </style>
    </head>
    <body>
        <h2>⚡ nexus plus</h2>
        
        <label>Select Language:</label>
        <select id="language">
            <option value="HTML / CSS / JS">HTML / CSS</option>
            <option value="Python">Python</option>
            <option value="JavaScript">JavaScript</option>
            <option value="C++">C++</option>
            <option value="Bash / Shell">Bash / Shell</option>
        </select>

        <input type="text" id="prompt" placeholder="কী কোড চান লিখুন (যেমন: calculator)">
        
        <button onclick="getCode()" id="btn">Generate Code</button>

        <pre id="output">Your code is here</pre>

        <script>
            async function getCode() {
                const prompt = document.getElementById('prompt').value;
                const language = document.getElementById('language').value;
                const output = document.getElementById('output');
                const btn = document.getElementById('btn');

                if (!prompt) return alert('Please enter a prompt!');

                btn.disabled = true;
                btn.innerText = 'Writing Code...';
                output.innerText = 'Generating code, please wait...';

                try {
                    const res = await fetch('/generate-code', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt, language })
                    });
                    
                    const data = await res.json();
                    
                    if (data.code) {
                        output.innerText = data.code;
                    } else {
                        output.innerText = 'Error: ' + (data.error || 'Failed to generate code.');
                    }
                } catch (err) {
                    output.innerText = 'Error connecting to server.';
                } finally {
                    btn.disabled = false;
                    btn.innerText = 'Generate Code';
                }
            }
        </script>
    </body>
    </html>
    `);
});

// API Endpoint using Groq Free API
app.post('/generate-code', async (req, res) => {
    try {
        const { prompt, language } = req.body;

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: 'GROQ_API_KEY missing in Render Environment Variables!' });
        }

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: `You are an expert coding assistant. Write clean and well-commented code in ${language}. Only return raw code without markdown wrapping or conversational text.` },
                { role: 'user', content: prompt }
            ]
        });

        res.json({ code: completion.choices[0].message.content });
    } catch (error) {
        console.error('API Error:', error);
        res.json({ error: error.message || 'API request failed' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
