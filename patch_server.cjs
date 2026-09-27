const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": \`Bearer \${apiKey}\`
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          stream: false
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(\`API error \${response.status}: \${errText}\`);
      }`;

const replacement = `      const fetchUrl = baseUrl || "https://api.groq.com/openai/v1/chat/completions";
      const fetchModel = model || "openai/gpt-oss-20b";
      
      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": \`Bearer \${apiKey.trim()}\`
        },
        body: JSON.stringify({
          model: fetchModel.trim(),
          messages: messages,
          stream: false
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Upstream API Error:", response.status, errText);
        throw new Error(\`Gagal menghubungi AI (\${response.status}). Periksa kembali API Key dan Base URL Anda. Detail: \${errText.substring(0, 100)}\`);
      }`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
