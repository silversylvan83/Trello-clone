import type { VercelRequest, VercelResponse } from "@vercel/node";
import { connectDB } from "../_lib/db.ts";
import { requireAuth } from "../_lib/auth.ts";
import { send, handleError } from "../_lib/send.ts";
import Board from "../_models/Board.ts";
import List from "../_models/List.ts";

type Body = { boardId?: string; title?: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
    await connectDB();

    const { userId } = requireAuth(req);
    const { boardId, title } = (req.body ?? {}) as Body;

    if (!boardId || !title?.trim()) {
      throw Object.assign(new Error("boardId and title required"), { statusCode: 400 });
    }

    const board = await Board.findById(boardId);
    if (!board) throw Object.assign(new Error("Board not found"), { statusCode: 404 });

    const isMember =
      String(board.ownerId) === String(userId) ||
      (board.memberIds ?? []).some((m: any) => String(m) === String(userId));

    if (!isMember) throw Object.assign(new Error("Forbidden"), { statusCode: 403 });

    const count = await List.countDocuments({ boardId });
    const list = await List.create({ boardId, title: title.trim(), order: count });

    return send(res, 200, { list });
  } catch (err) {
    return handleError(res, err);
  }
}
