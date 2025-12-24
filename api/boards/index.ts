import type { VercelRequest, VercelResponse } from "@vercel/node";
import { connectDB } from "../_lib/db.ts";
import { requireAuth } from "../_lib/auth.ts";
import { send, handleError } from "../_lib/send.ts";
import Board from "../_models/Board.ts";

type Body = { title?: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();
    const { userId } = requireAuth(req);

    if (req.method === "GET") {
      const boards = await Board.find({
        $or: [{ ownerId: userId }, { memberIds: userId }]
      }).sort({ updatedAt: -1 });

      return send(res, 200, { boards });
    }

    if (req.method === "POST") {
      const { title } = (req.body ?? {}) as Body;
      if (!title?.trim()) throw Object.assign(new Error("title required"), { statusCode: 400 });

      const board = await Board.create({
        title: title.trim(),
        ownerId: userId,
        memberIds: [userId]
      });

      return send(res, 200, { board });
    }

    return send(res, 405, { error: "Method not allowed" });
  } catch (err) {
    return handleError(res, err);
  }
}
