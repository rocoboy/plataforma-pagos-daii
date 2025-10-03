import { NextRequest, NextResponse } from 'next/server';
import { addCorsHeaders, createCorsOptionsResponse } from '@/lib/cors';

export function middleware(request: NextRequest) {
  // Only apply to /api routes (also enforced by matcher below)
  if (request.method === 'OPTIONS') {
    // Short-circuit preflight with proper CORS headers
    return createCorsOptionsResponse(request);
  }

  // Continue the request and append CORS headers on the response
  const response = NextResponse.next();
  return addCorsHeaders(response, request);
}

export const config = {
  matcher: ['/api/:path*'],
};
