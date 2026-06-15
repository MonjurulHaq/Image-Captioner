import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "sondhan-ai-secret-2024";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { id: number; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { id: number; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };
  } catch {
    return null;
  }
}
