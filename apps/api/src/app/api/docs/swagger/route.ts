// app/api/docs/swagger/route.ts
export const runtime = "nodejs";

export async function GET() {
  // Usar variable de entorno personalizada API_BASE_URL, si no está definida usar localhost
  const apiBaseUrl = process.env.API_BASE_URL;
  const baseUrl = apiBaseUrl || 'http://localhost:3000';
  
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Swagger UI - Payments API</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
    <style>
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { color: #3b82f6; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>

    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        SwaggerUIBundle({
          // Usar la ruta dinámica que genera el YAML con el servidor correcto
          url: "/api/docs/openapi",
          dom_id: "#swagger-ui",
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
          layout: "BaseLayout",
          deepLinking: true,
          showExtensions: true,
          showCommonExtensions: true,
          tryItOutEnabled: true,
          // El servidor correcto ya está configurado dinámicamente en el YAML
          onComplete: () => {
            console.log('Swagger UI loaded with environment-specific server');
          }
        });
      };
    </script>
  </body>
</html>`;
  
  return new Response(html, { 
    headers: { 
      "content-type": "text/html; charset=utf-8",
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    } 
  });
}

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
