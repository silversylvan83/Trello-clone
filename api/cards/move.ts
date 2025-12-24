import type { VercelRequest, VercelResponse } from "@vercel/node";
import { connectDB } from "../_lib/db.ts";
import { requireAuth } from "../_lib/auth.ts";
import { send, handleError } from "../_lib/send.ts";
import Card from "../_models/Card.ts";

type Body = { cardId?: string; toListId?: string; toIndex?: number };

async function normalizeOrders(listId: string) {
  const cards = await Card.find({ listId }).sort({ order: 1, createdAt: 1 });
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].order !== i) {
      cards[i].order = i;
      await cards[i].save();
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "PATCH") return send(res, 405, { error: "Method not allowed" });
    await connectDB();
    requireAuth(req);

    const { cardId, toListId, toIndex } = (req.body ?? {}) as Body;
    if (!cardId || !toListId || typeof toIndex !== "number") {
      throw Object.assign(new Error("cardId, toListId, toIndex required"), { statusCode: 400 });
    }

    const card = await Card.findById(cardId);
    if (!card) throw Object.assign(new Error("Card not found"), { statusCode: 404 });

    const fromListId = String(card.listId);

    card.listId = toListId;
    card.order = toIndex;
    await card.save();

    await normalizeOrders(fromListId);
    await normalizeOrders(toListId);

    return send(res, 200, { ok: true });
  } catch (err) {
    return handleError(res, err);
  }
}
