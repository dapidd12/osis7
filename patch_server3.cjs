const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `      // Format messages into a single prompt since quickChat takes a string
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

const replacement = `      const key = apiKey.trim();
      const isEmailPass = key.includes(':') && !key.includes('http') && !key.includes('{');
      const isDeepSeekWeb = baseUrl.includes('chat.deepseek.com') || isEmailPass;

      if (isDeepSeekWeb) {
        // Mode 1: DeepSeek Web Unofficial Client
        const prompt = messages.map((m: any) => \`\${m.role.toUpperCase()}:\n\${m.content}\`).join('\\n\\n') + '\\n\\nASSISTANT:\\n';
        
        const { DeepSeekClient } = await import("deepseek-client");
        const client = new DeepSeekClient();

        if (isEmailPass) {
          const [email, password] = key.split(':');
          await client.login(email.trim(), password.trim());
        } else {
          client.setToken(key);
        }

        const isThinking = model?.toLowerCase().includes('reasoning') || model?.toLowerCase().includes('think') || model?.toLowerCase().includes('r1');
        
        try {
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
          });
        } catch (dsError: any) {
           console.error("DeepSeek Client Error:", dsError);
           if (dsError?.code === 'SESSION_CREATE_FAILED') {
              throw new Error("Gagal membuat sesi di DeepSeek Web. Pastikan Email/Password atau Token Anda benar, dan tidak terkena limitasi (WAF/Cloudflare).");
           }
           throw dsError;
        }

      } else {
        // Mode 2: Standard API (Groq, OpenAI, Official DeepSeek API)
        const fetchUrl = baseUrl || "https://api.groq.com/openai/v1/chat/completions";
        const fetchModel = model || "openai/gpt-oss-20b";
        
        const response = await fetch(fetchUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": \`Bearer \${key}\`
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
          throw new Error(\`Gagal menghubungi API (\${response.status}). Periksa kembali API Key dan Base URL Anda. Detail: \${errText.substring(0, 100)}\`);
        }

        const data = await response.json();
        res.json(data);
      }`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
