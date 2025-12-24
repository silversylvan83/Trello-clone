import type { VercelRequest, VercelResponse } from "@vercel/node";
import { connectDB } from "../_lib/db.ts";
import { requireAuth } from "../_lib/auth.ts";
import { send, handleError } from "../_lib/send.ts";
import Board from "../_models/Board.ts";
import List from "../_models/List.ts";
import Card from "../_models/Card.ts";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });
    await connectDB();

    const { userId } = requireAuth(req);
    const boardId = String(req.query.boardId);

    const board = await Board.findById(boardId);
    if (!board) throw Object.assign(new Error("Board not found"), { statusCode: 404 });

    const isMember =
      String(board.ownerId) === String(userId) ||
      (board.memberIds ?? []).some((m: any) => String(m) === String(userId));

    if (!isMember) throw Object.assign(new Error("Forbidden"), { statusCode: 403 });

    const lists = await List.find({ boardId }).sort({ order: 1, createdAt: 1 });
    const cards = await Card.find({ boardId }).sort({ order: 1, createdAt: 1 });

    return send(res, 200, { board, lists, cards });
  } catch (err) {
    return handleError(res, err);
  }
}
