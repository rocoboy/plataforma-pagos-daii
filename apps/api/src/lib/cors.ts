import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
  'http://localhost:3001',
  'https://plataforma-pagos-daii-web-preprod.vercel.app',
  'https://plataforma-pagos-daii-web.vercel.app'
];

export function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigin = origin && allowedOrigins.includes(origin) 
    ? origin 
    : 'http://localhost:3001';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function addCorsHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const corsHeaders = getCorsHeaders(request);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export function createCorsResponse(request: NextRequest, data: unknown, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  return addCorsHeaders(response, request);
}

export function createCorsOptionsResponse(request: NextRequest): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}
