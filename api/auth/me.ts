import type { VercelRequest, VercelResponse } from "@vercel/node";
import { connectDB } from "../_lib/db.ts";
import User from "../_models/User.ts";
import { requireAuth } from "../_lib/auth.ts";
import { send, handleError } from "../_lib/send.ts";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });
    await connectDB();

    const { userId } = requireAuth(req);
    const user = await User.findById(userId).select("_id name email");
    if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

    return send(res, 200, { user: { id: String(user._id), name: user.name, email: user.email } });
  } catch (err) {
    return handleError(res, err);
  }
}
