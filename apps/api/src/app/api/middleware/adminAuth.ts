import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET!;

export function adminAuthMiddleware(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token requerido" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { role?: string };
    if (decoded.role !== "Administrador") {
      return NextResponse.json({ error: "Acceso denegado: rol insuficiente" }, { status: 403 });
    }
    return null; 
  } catch (err) {
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });
  }
}