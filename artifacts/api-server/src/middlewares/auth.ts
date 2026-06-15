import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth";

export interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  req.user = payload;
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== "Admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }
    next();
  });
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (payload) req.user = payload;
  }
  next();
}
