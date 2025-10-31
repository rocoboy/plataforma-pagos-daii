import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { createCorsResponse } from "@/lib/cors";

const SECRET_KEY = process.env.JWT_SECRET!;

export function adminAuthMiddleware(request: NextRequest) {
  console.log("Admin auth middleware called");
  
  const authHeader = request.headers.get("authorization");
  console.log("Auth header:", authHeader ? `Bearer ${authHeader.split(" ")[1]?.substring(0, 20)}...` : "missing");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No valid auth header found");
    return createCorsResponse(request, { error: "Token requerido" }, 401);
  }

  const token = authHeader.split(" ")[1];
  console.log("Token extracted, length:", token?.length);
  console.log("Token first 50 chars:", token?.substring(0, 50));
  console.log("Token format check - contains dots:", (token?.match(/\./g) || []).length);
  console.log("Using JWT_SECRET:", SECRET_KEY ? "Set" : "Missing");
  
  try {
    const decoded_unverified = jwt.decode(token, { complete: true });
    console.log("JWT header (unverified):", decoded_unverified?.header);
    console.log("JWT payload (unverified):", decoded_unverified?.payload);
    
    const decoded = jwt.verify(token, SECRET_KEY) as { rol?: string };
    console.log("Token decoded successfully, role:", decoded.rol); 
    
    if (decoded.rol !== "admin") {
      console.log("Access denied - role mismatch. Expected: 'admin', Got:", decoded.rol);
      return createCorsResponse(request, { error: "Acceso denegado: rol insuficiente" }, 403);
    }
    
    console.log("Admin access granted");
    return null; 
  } catch (err) {
    console.log("JWT verification failed:", err);
    return createCorsResponse(request, { error: "Token inválido o expirado" }, 401);
  }
}