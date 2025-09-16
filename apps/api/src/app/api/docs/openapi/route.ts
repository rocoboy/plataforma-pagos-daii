import { NextRequest } from "next/server";
import { createCorsResponse } from "@/lib/cors";
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Leer el archivo YAML base
    const yamlPath = path.join(process.cwd(), 'public', 'docs', 'openapi', 'payments-openapi.yaml');
    const yamlContent = fs.readFileSync(yamlPath, 'utf8');
    
    // Determinar el entorno basado en la URL del request
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const currentUrl = `${protocol}://${host}`;
    
    // Determinar qué servidor mostrar
    let serverUrl: string;
    let serverDescription: string;
    
    if (currentUrl.includes('preprod')) {
      serverUrl = 'https://plataforma-pagos-daii-preprod.vercel.app/api';
      serverDescription = 'Servidor de preproducción (Vercel)';
    } else if (currentUrl.includes('localhost')) {
      serverUrl = 'http://localhost:3000/api';
      serverDescription = 'Servidor de desarrollo local';
    } else {
      // Producción por defecto
      serverUrl = 'https://plataforma-pagos-daii.vercel.app/api';
      serverDescription = 'Servidor de producción (Vercel)';
    }
    
    // Reemplazar la sección de servidores en el YAML
    const serverSection = `servers:
  - url: ${serverUrl}
    description: ${serverDescription}`;
    
    // Buscar y reemplazar la sección de servidores
    const updatedYaml = yamlContent.replace(
      /servers:\s*\n(?:\s*-\s*url:.*\n(?:\s*description:.*\n)*)*/,
      serverSection
    );
    
    // Retornar como YAML
    return new Response(updatedYaml, {
      headers: {
        'Content-Type': 'application/x-yaml',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    return createCorsResponse(request, {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
}

// Handle preflight OPTIONS request
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
