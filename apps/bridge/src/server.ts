import { appConfig } from './config';
// @ts-ignore: allow importing amqplib without types in this file
import amqp from 'amqplib';

export function createServer() {
  // Helper to peek messages from RabbitMQ without permanently consuming them.
  // It connects, performs up to `limit` ch.get() calls with noAck=false
  // and then nacks each message with requeue=true so messages stay in the queue.
  async function fetchRabbitMessages(limit = 20) {
    const msgs: any[] = [];
    let conn: amqp.Connection | null = null;
    let ch: amqp.Channel | null = null;
    try {
  conn = await amqp.connect((appConfig as any).rabbitmq.url);
      ch = await conn.createChannel();

      for (let i = 0; i < limit; i++) {
  const msg = await ch.get((appConfig as any).rabbitmq.queue, { noAck: false });
        if (!msg) break;

        const raw = msg.content.toString();
        let parsed: any = raw;
        try { parsed = JSON.parse(raw); } catch { /* keep raw string if not JSON */ }

        msgs.push({
          content: parsed,
          fields: msg.fields,
          properties: msg.properties,
        });

        // Requeue the message so we only "peek" it (do not permanently consume)
        ch.nack(msg, false, true);
      }
    } finally {
      if (ch) await ch.close().catch(() => {});
      if (conn) await conn.close().catch(() => {});
    }
    return msgs;
  }

  const server = Bun.serve({
    port: appConfig.server.port,
    hostname: appConfig.server.host,
    async fetch(request) {
      const url = new URL(request.url);

      // Health check endpoint
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          service: 'rabbitmq-bridge',
          version: '1.0.0',
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Metrics endpoint
      if (url.pathname === '/metrics') {
        return new Response(JSON.stringify({
          connected: true, // You can add more metrics here
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Status endpoint with more detailed information
      if (url.pathname === '/status') {
        return new Response(JSON.stringify({
          service: 'rabbitmq-bridge',
          version: '1.0.0',
          status: 'running',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          config: {
            rabbitmq: {
              url: ((appConfig as any).rabbitmq?.url || '').replace(/\/\/.*@/, '//***:***@'), // Hide credentials
              queue: (appConfig as any).rabbitmq?.queue,
              exchange: (appConfig as any).rabbitmq?.exchange,
            },
            webhook: {
              baseUrl: appConfig.webhook.baseUrl,
              timeout: appConfig.webhook.timeout,
              maxRetries: appConfig.webhook.maxRetries,
            },
          },
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // New: Read/peek events from RabbitMQ queue
      if (url.pathname === '/events') {
        try {
          const limit = Number(url.searchParams.get('limit') || '20');
          const safeLimit = Math.max(1, Math.min(100, limit));
          const messages = await fetchRabbitMessages(safeLimit);
          return new Response(JSON.stringify({
            count: messages.length,
            messages,
            note: 'Messages were peeked and requeued (not permanently consumed)',
          }), {
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (err) {
          return new Response(JSON.stringify({
            error: 'Failed to read messages',
            message: String(err),
          }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
      }

      // 404 for other routes
      return new Response(JSON.stringify({
        error: 'Not Found',
        message: 'The requested endpoint does not exist',
        availableEndpoints: ['/health', '/metrics', '/status', '/events'],
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  console.log(`Health check server running on http://${appConfig.server.host}:${appConfig.server.port}`);
  return server;
}
