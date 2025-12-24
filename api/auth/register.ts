import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { connectDB } from "../_lib/db.ts";
import User from "../_models/User.ts";
import { signToken } from "../_lib/auth.ts";
import { send, handleError } from "../_lib/send.ts";

type Body = { name?: string; email?: string; password?: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
    await connectDB();

    const { name, email, password } = (req.body ?? {}) as Body;
    if (!name || !email || !password) {
      throw Object.assign(new Error("name, email, password required"), { statusCode: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) throw Object.assign(new Error("Email already registered"), { statusCode: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    const token = signToken({ userId: String(user._id), email: user.email });
    return send(res, 200, { token, user: { id: String(user._id), name: user.name, email: user.email } });
  } catch (err) {
    return handleError(res, err);
  }
}
