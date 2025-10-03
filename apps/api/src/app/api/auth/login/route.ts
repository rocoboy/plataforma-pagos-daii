import { NextRequest } from "next/server";
import { createCorsResponse, createCorsOptionsResponse } from "@/lib/cors";

export async function POST(request: NextRequest) {
  try {
    // Obtener credenciales del frontend
    const { email, password } = await request.json();

    // Hacer la llamada a la API del Grupo 5 desde el backend
    const response = await fetch('https://grupo5-usuarios.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    // Intentar parsear el cuerpo; si falla, usar objeto vacío
    const raw: any = await response.json().catch(() => ({}));

    // Normalizar campos variables desde el servicio externo
  const token = raw.token || raw.accessToken || raw.jwt || raw?.data?.token || null;
  const userRaw = raw.user || raw.usuario || raw?.data?.user || raw?.data?.usuario || null;
    const message = raw.message || raw.mensaje || raw.msg || (response.ok ? 'Login exitoso' : 'Error de autenticación');

    // Mapear usuario a un shape consistente
    let user = userRaw ? {
      id: userRaw.id || userRaw.user_id || userRaw.uid || 'unknown',
      email: userRaw.email || userRaw.correo || userRaw.username || '',
      name: userRaw.name || userRaw.nombre || userRaw.displayName || '',
      role: userRaw.role || userRaw.rol || userRaw.tipo || 'Usuario',
    } : null;

    // Fallback: construir usuario desde campos de nivel superior si no vino anidado
    if (!user) {
      const topEmail = raw.email || raw.correo || '';
      const topRole = raw.role || raw.rol || raw.tipo || undefined;
      const topName = raw.name || raw.nombre || '';
      const topId = raw.user_id || raw.uid || raw.id || 'unknown';
      if (topEmail || topRole || topName) {
        user = {
          id: topId,
          email: topEmail,
          name: topName,
          role: topRole || 'Usuario',
        };
      }
    }

    // Fallback adicional: si tenemos token pero no usuario, intentar decodificar JWT (sin verificar)
    if (!user && token && token.split('.').length === 3) {
      try {
        const payloadSegment = token.split('.')[1];
        const padded = payloadSegment.padEnd(payloadSegment.length + (4 - (payloadSegment.length % 4)) % 4, '=');
        const json = Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
        const payload = JSON.parse(json);

        user = {
          id: payload.id || payload.user_id || payload.sub || 'unknown',
          email: payload.email || payload.correo || payload.username || '',
          name: payload.name || payload.nombre || payload.displayName || '',
          role: payload.role || payload.rol || payload.tipo || 'Usuario',
        };
      } catch (e) {
        // Si falla la decodificación, dejamos user como null
        console.warn('No se pudo decodificar JWT para construir usuario:', e);
      }
    }

  const success = Boolean(response.ok && token && user);

    // Construir payload normalizado para el frontend
    const payload = success
      ? { success: true, token, user }
      : { success: false, message, ...raw };

    // Devolver la respuesta con CORS habilitado y status del servicio externo
    return createCorsResponse(request, payload, response.status);
  } catch (error) {
    console.error('Error en proxy de login:', error);
    return createCorsResponse(request, {
      success: false,
      message: 'Error de conexión con el servicio de autenticación'
    }, 500);
  }
}

// Handle preflight OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return createCorsOptionsResponse(request);
}