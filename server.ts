import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Hardening: Content Security Policy & Headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Needed for Vite development, usually strict in production
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "wss:", "ws:"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "blob:"],
        frameAncestors: ["'self'", "*"], // To allow preview iframe
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Prevent giant payloads (Attachment sandboxing / limits)
  app.use(express.json({ limit: '10mb' }));
  app.use(cors());

  // === SPEC-001 ZQ-X1Keybox Endpoints Mock ===
  const providers = [
    { id: '1', name: 'OpenAI', type: 'cloud', enabled: true },
    { id: '2', name: 'Gemini', type: 'cloud', enabled: true },
    { id: '3', name: 'Ollama', type: 'local', enabled: true }
  ];

  app.get('/api/v1/providers', (req, res) => {
    res.json(providers);
  });

  app.post('/api/v1/providers', (req, res) => {
    const { provider, api_key, region } = req.body;
    // Mock Vault storage
    res.status(201).json({ status: 'Provider secured in Vault', provider_id: Date.now().toString() });
  });

  app.post('/api/v1/runtime/session', (req, res) => {
    const { provider, task } = req.body;
    res.json({
      session_token: `x1_rt_${Math.random().toString(36).substring(7)}`,
      expires_in: 300,
      mode: 'clinical_referral'
    });
  });
  
  app.post('/api/v1/runtime/revoke', (req, res) => {
    res.json({ status: 'revoked' });
  });

  app.post('/api/v1/chat', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is required');
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const { message, history, attachments } = req.body;
      
      const systemInstruction = `You are ZQ AI LOGIC™ (HarnessBoundary Kernel). 
      You are an enterprise-grade Sovereign AI Infrastructure platform managing trust, governance, and clinical operations.
      Respond concisely and professionally as a hardened system. Do not break character. 
      Analyze the user's input as if it were a system command or inquiry. 
      Use Markdown formatting.`;

      const contents = history.map((msg: any) => {
        const parts: any[] = [];
        if (msg.text) parts.push({ text: msg.text });
        
        if (msg.attachments && Array.isArray(msg.attachments)) {
          msg.attachments.forEach((att: any) => {
             if (att.type === 'image' && att.data && att.mimeType) {
                const base64Data = att.data.includes(',') ? att.data.split(',')[1] : att.data;
                parts.push({
                   inlineData: {
                      data: base64Data,
                      mimeType: att.mimeType
                   }
                });
             } else {
                parts.push({ text: `[Attachment: ${att.name}]` });
             }
          });
        }
        
        if (parts.length === 0) parts.push({ text: " " });

        return {
          role: msg.role === 'ai' ? 'model' : 'user',
          parts
        };
      });
      
      const currentParts: any[] = [];
      if (message) currentParts.push({ text: message });
      
      if (attachments && Array.isArray(attachments)) {
         attachments.forEach((att: any) => {
             if (att.type === 'image' && att.data && att.mimeType) {
                const base64Data = att.data.includes(',') ? att.data.split(',')[1] : att.data;
                currentParts.push({
                   inlineData: {
                      data: base64Data,
                      mimeType: att.mimeType
                   }
                });
             } else {
                currentParts.push({ text: `[Attachment: ${att.name}]` });
             }
          });
      }
      
      if (currentParts.length === 0) currentParts.push({ text: "[Empty Message]" });
      
      contents.push({ role: 'user', parts: currentParts });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents,
        config: { systemInstruction }
      });
      
      res.json({ reply: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
