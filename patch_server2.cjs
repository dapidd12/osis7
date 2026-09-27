const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `      const fetchUrl = baseUrl || "https://api.groq.com/openai/v1/chat/completions";
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
      }

      const data = await response.json();
      res.json(data);`;

const replacement = `      // Format messages into a single prompt since quickChat takes a string
      const prompt = messages.map((m: any) => \`\${m.role.toUpperCase()}:\n\${m.content}\`).join('\\n\\n') + '\\n\\nASSISTANT:\\n';
      
      let client;
      
      // Initialize DeepSeekClient (using dynamic import or require depending on environment, but since this is typescript, we can just use import from above, wait let's just require it to avoid import issues at top of file)
      const { DeepSeekClient } = await import("deepseek-client");
      client = new DeepSeekClient();

      const key = apiKey.trim();
      if (key.includes(':') && !key.includes('http') && !key.includes('{')) {
        const [email, password] = key.split(':');
        await client.login(email.trim(), password.trim());
      } else {
        client.setToken(key);
      }

      const isThinking = model?.toLowerCase().includes('reasoning') || model?.toLowerCase().includes('think') || model?.toLowerCase().includes('r1');
      
      const reply = await client.quickChat(prompt, {
        thinking: isThinking,
        search: true
      });

      res.json({
        choices: [
          {
            message: {
              role: "assistant",
              content: reply.content
            }
          }
        ]
      });`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
