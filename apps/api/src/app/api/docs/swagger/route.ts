// app/api/docs/swagger/route.ts
export const runtime = "nodejs";

export async function GET() {
  // La variable API_BASE_URL está disponible para uso futuro si es necesario
  // const apiBaseUrl = process.env.API_BASE_URL;
  
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
          // Usar el archivo YAML estático
          url: "/docs/openapi/payments-openapi.yaml",
          dom_id: "#swagger-ui",
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
          layout: "BaseLayout",
          deepLinking: true,
          showExtensions: true,
          showCommonExtensions: true,
          tryItOutEnabled: true,
          // Configurar el servidor por defecto según el entorno
          onComplete: () => {
            // Seleccionar el servidor correcto automáticamente basado en la URL actual
            const currentUrl = window.location.origin;
            
            // Determinar qué servidor seleccionar basado en la URL actual
            let targetServer = '';
            if (currentUrl.includes('preprod')) {
              targetServer = 'preprod';
            } else if (currentUrl.includes('localhost')) {
              targetServer = 'localhost';
            } else {
              // Si no es preprod ni localhost, asumir producción
              targetServer = 'plataforma-pagos-daii.vercel.app';
            }
            
            // Buscar y seleccionar el servidor correcto
            const serverButtons = document.querySelectorAll('.servers .servers-title + .servers .servers-container .server');
            for (const button of serverButtons) {
              const serverUrl = button.getAttribute('data-value');
              if (serverUrl && serverUrl.includes(targetServer)) {
                button.click();
                break;
              }
            }
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
