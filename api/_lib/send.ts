import type { VercelResponse } from "@vercel/node";

export function send(res: VercelResponse, status: number, data: unknown) {
  res.status(status).json(data);
}

export function handleError(res: VercelResponse, err: any) {
  const code = err?.statusCode ?? 500;
  res.status(code).json({ error: err?.message ?? "Server error" });
}
