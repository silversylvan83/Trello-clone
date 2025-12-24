import type { VercelRequest, VercelResponse } from "@vercel/node";
import { connectDB } from "../_lib/db.ts";
import { requireAuth } from "../_lib/auth.ts";
import { send, handleError } from "../_lib/send.ts";
import List from "../_models/List.ts";
import Card from "../_models/Card.ts";

type Body = { listId?: string; title?: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
    await connectDB();

    const { userId } = requireAuth(req);
    const { listId, title } = (req.body ?? {}) as Body;

    if (!listId || !title?.trim()) throw Object.assign(new Error("listId and title required"), { statusCode: 400 });

    const list = await List.findById(listId);
    if (!list) throw Object.assign(new Error("List not found"), { statusCode: 404 });

    const count = await Card.countDocuments({ listId });
    const card = await Card.create({
      boardId: list.boardId,
      listId,
      title: title.trim(),
      description: "",
      order: count,
      createdBy: userId
    });

    return send(res, 200, { card });
  } catch (err) {
    return handleError(res, err);
  }
}
