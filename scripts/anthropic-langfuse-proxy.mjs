#!/usr/bin/env node
/**
 * Anthropic → Langfuse Proxy
 *
 * Transparent proxy that sits between OpenClaw and the Anthropic API.
 * Captures all LLM calls and forwards traces to Langfuse for observability.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... LANGFUSE_PUBLIC_KEY=... LANGFUSE_SECRET_KEY=... \
 *   LANGFUSE_HOST=http://137.184.4.57 node anthropic-langfuse-proxy.mjs
 *
 * Set ANTHROPIC_BASE_URL=http://127.0.0.1:4010 in the OpenClaw env to route through this proxy.
 */

import http from 'node:http';
import https from 'node:https';
import crypto from 'node:crypto';

const PORT = parseInt(process.env.PROXY_PORT || '4010', 10);
const ANTHROPIC_HOST = 'api.anthropic.com';
const LANGFUSE_HOST = process.env.LANGFUSE_HOST || 'http://137.184.4.57';
const LANGFUSE_PUBLIC_KEY = process.env.LANGFUSE_PUBLIC_KEY || '';
const LANGFUSE_SECRET_KEY = process.env.LANGFUSE_SECRET_KEY || '';
const CLIENT_NAME = process.env.LANGFUSE_PROJECT || 'bryn-fullerton-rotary';

// Model pricing per 1M tokens (input / output)
const MODEL_PRICING = {
  'claude-opus-4-6':           { input: 15.00, output: 75.00 },
  'claude-sonnet-4-6':         { input: 3.00,  output: 15.00 },
  'claude-haiku-4-5-20251001': { input: 0.80,  output: 4.00 },
};

function calculateCost(model, inputTokens, outputTokens) {
  const pricing = Object.entries(MODEL_PRICING).find(([key]) => model?.includes(key));
  if (!pricing) return 0;
  const [, rates] = pricing;
  return (inputTokens * rates.input / 1_000_000) + (outputTokens * rates.output / 1_000_000);
}

function sendToLangfuse(events) {
  if (!LANGFUSE_PUBLIC_KEY || !LANGFUSE_SECRET_KEY) return;

  const auth = Buffer.from(`${LANGFUSE_PUBLIC_KEY}:${LANGFUSE_SECRET_KEY}`).toString('base64');
  const body = JSON.stringify({ batch: events });
  const url = new URL('/api/public/ingestion', LANGFUSE_HOST);

  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
      'Content-Length': Buffer.byteLength(body),
    },
  };

  const transport = url.protocol === 'https:' ? https : http;
  const req = transport.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode >= 400) {
        console.error(`[langfuse] Error ${res.statusCode}: ${data}`);
      }
    });
  });
  req.on('error', (err) => console.error(`[langfuse] Send error: ${err.message}`));
  req.write(body);
  req.end();
}

function createTraceAndGeneration({ traceId, model, inputTokens, outputTokens, startTime, endTime, statusCode, requestBody }) {
  const cost = calculateCost(model, inputTokens, outputTokens);
  const durationMs = endTime - startTime;
  const timestamp = new Date(startTime).toISOString();

  // Extract a summary from the request for the trace name
  let traceName = 'llm-call';
  try {
    const parsed = JSON.parse(requestBody);
    if (parsed.system) {
      traceName = typeof parsed.system === 'string'
        ? parsed.system.slice(0, 50)
        : 'system-prompt';
    }
  } catch {}

  const events = [
    {
      id: crypto.randomUUID(),
      type: 'trace-create',
      timestamp,
      body: {
        id: traceId,
        name: traceName,
        metadata: { client: CLIENT_NAME, model, durationMs },
        tags: [CLIENT_NAME],
      },
    },
    {
      id: crypto.randomUUID(),
      type: 'generation-create',
      timestamp,
      body: {
        traceId,
        name: model || 'unknown',
        model: model || 'unknown',
        startTime: timestamp,
        endTime: new Date(endTime).toISOString(),
        completionStartTime: timestamp,
        usage: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens,
          unit: 'TOKENS',
        },
        metadata: { statusCode, durationMs },
        calculatedTotalCost: cost,
      },
    },
  ];

  sendToLangfuse(events);

  const costStr = cost > 0 ? `$${cost.toFixed(4)}` : '?';
  console.log(`[${new Date().toISOString()}] ${model || '?'} | ${inputTokens}→${outputTokens} tokens | ${costStr} | ${durationMs}ms`);
}

const server = http.createServer((clientReq, clientRes) => {
  const startTime = Date.now();
  const traceId = crypto.randomUUID();

  // Collect request body
  let requestBody = '';
  clientReq.on('data', (chunk) => requestBody += chunk);
  clientReq.on('end', () => {
    // Parse model from request
    let model = '';
    try {
      const parsed = JSON.parse(requestBody);
      model = parsed.model || '';
    } catch {}

    // Check if streaming
    let isStreaming = false;
    try {
      isStreaming = JSON.parse(requestBody).stream === true;
    } catch {}

    // Forward to Anthropic
    const options = {
      hostname: ANTHROPIC_HOST,
      port: 443,
      path: clientReq.url,
      method: clientReq.method,
      headers: {
        ...clientReq.headers,
        host: ANTHROPIC_HOST,
      },
    };

    const proxyReq = https.request(options, (proxyRes) => {
      // Pass headers through
      clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);

      if (isStreaming) {
        // Streaming: parse SSE events for token usage
        let inputTokens = 0;
        let outputTokens = 0;
        let buffer = '';

        proxyRes.on('data', (chunk) => {
          clientRes.write(chunk);
          buffer += chunk.toString();

          // Parse complete SSE events
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const event = JSON.parse(data);
              if (event.type === 'message_start' && event.message?.usage) {
                inputTokens = event.message.usage.input_tokens || 0;
              }
              if (event.type === 'message_delta' && event.usage) {
                outputTokens = event.usage.output_tokens || 0;
              }
            } catch {}
          }
        });

        proxyRes.on('end', () => {
          clientRes.end();
          createTraceAndGeneration({
            traceId, model, inputTokens, outputTokens,
            startTime, endTime: Date.now(),
            statusCode: proxyRes.statusCode, requestBody,
          });
        });
      } else {
        // Non-streaming: collect full response
        let responseBody = '';
        proxyRes.on('data', (chunk) => {
          clientRes.write(chunk);
          responseBody += chunk.toString();
        });

        proxyRes.on('end', () => {
          clientRes.end();
          let inputTokens = 0;
          let outputTokens = 0;
          try {
            const parsed = JSON.parse(responseBody);
            inputTokens = parsed.usage?.input_tokens || 0;
            outputTokens = parsed.usage?.output_tokens || 0;
          } catch {}

          createTraceAndGeneration({
            traceId, model, inputTokens, outputTokens,
            startTime, endTime: Date.now(),
            statusCode: proxyRes.statusCode, requestBody,
          });
        });
      }
    });

    proxyReq.on('error', (err) => {
      console.error(`[proxy] Error forwarding to Anthropic: ${err.message}`);
      clientRes.writeHead(502);
      clientRes.end(`Proxy error: ${err.message}`);
    });

    proxyReq.write(requestBody);
    proxyReq.end();
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[anthropic-langfuse-proxy] Listening on 127.0.0.1:${PORT}`);
  console.log(`[anthropic-langfuse-proxy] Forwarding to ${ANTHROPIC_HOST}`);
  console.log(`[anthropic-langfuse-proxy] Langfuse: ${LANGFUSE_HOST} (project: ${CLIENT_NAME})`);
});
