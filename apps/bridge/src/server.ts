import { appConfig } from './config';

export function createServer() {
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
              url: appConfig.rabbitmq.url.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
              queue: appConfig.rabbitmq.queue,
              exchange: appConfig.rabbitmq.exchange,
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

      // 404 for other routes
      return new Response(JSON.stringify({
        error: 'Not Found',
        message: 'The requested endpoint does not exist',
        availableEndpoints: ['/health', '/metrics', '/status'],
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  console.log(`Health check server running on http://${appConfig.server.host}:${appConfig.server.port}`);
  return server;
}
