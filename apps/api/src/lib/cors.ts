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
    // Common extras
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
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
  // Debug: log CORS response creation
  const origin = request.headers.get('origin') || 'unknown';
  console.log(`[CORS] Response -> origin=${origin} status=${status}`);
  const response = NextResponse.json(data, { status });
  return addCorsHeaders(response, request);
}

export function createCorsOptionsResponse(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin') || 'unknown';
  const acrm = request.headers.get('access-control-request-method') || 'N/A';
  const acrh = request.headers.get('access-control-request-headers') || 'N/A';
  console.log(`[CORS] Preflight OPTIONS -> origin=${origin} ACRM=${acrm} ACRH=${acrh}`);
  // Use 204 (No Content) which is common for preflight
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}
