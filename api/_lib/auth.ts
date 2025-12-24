import type { VercelRequest } from "@vercel/node";
import jwt from "jsonwebtoken";
export type JwtPayload = { userId: string; email: string };

export function signToken(payload: JwtPayload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw Object.assign(new Error("Missing JWT_SECRET"), { statusCode: 500 });
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw Object.assign(new Error("Missing JWT_SECRET"), { statusCode: 500 });
  return jwt.verify(token, secret) as JwtPayload;
}

export function requireAuth(req: VercelRequest): JwtPayload {
  const header = (req.headers.authorization ?? "") as string;
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
  return verifyToken(token);
}
