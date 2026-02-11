import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { streamSSE } from 'hono/streaming';
import { serve } from '@hono/node-server';
import {
  MOCK_AI_RESULT,
  AIRecommendationResultSchema,
  type AIMatchInput,
} from '@eatwhat/shared';

const app = new Hono();

app.use('*', cors());

/* ──────────── Health ──────────── */
app.get('/', (c) => c.json({ status: 'ok', service: 'eatwhat-worker' }));

/* ──────────── AI Match SSE ──────────── */
app.post('/api/match', async (c) => {
  const body = await c.req.json<AIMatchInput>();

  return streamSSE(c, async (stream) => {
    // Phase 1: Analysis streaming
    const analysis = MOCK_AI_RESULT.midpoint_analysis;
    for (let i = 0; i < analysis.length; i++) {
      await stream.writeSSE({
        event: 'analysis',
        data: JSON.stringify({ text: analysis.slice(0, i + 1), done: i === analysis.length - 1 }),
      });
      await new Promise((r) => setTimeout(r, 30));
    }

    // Phase 2: Candidates
    // In production: call Alibaba Cloud Bailian API here
    // https://help.aliyun.com/zh/model-studio/call-single-agent-application/
    for (const [i, candidate] of MOCK_AI_RESULT.candidates.entries()) {
      await new Promise((r) => setTimeout(r, 500));
      await stream.writeSSE({
        event: 'candidate',
        data: JSON.stringify({ index: i, candidate }),
      });
    }

    // Phase 3: Complete
    await stream.writeSSE({
      event: 'complete',
      data: JSON.stringify(MOCK_AI_RESULT),
    });
  });
});

/* ──────────── Invitation Status ──────────── */
app.get('/api/invite/:id/status', (c) => {
  return c.json({
    id: c.req.param('id'),
    status: 'selecting',
    hostSelected: null,
    guestSelected: null,
  });
});

/* ──────────── Start server ──────────── */
const port = 3001;
console.log(`🔧 Worker running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
