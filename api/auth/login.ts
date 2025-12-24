import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { connectDB } from "../_lib/db.ts";
import User from "../_models/User.ts";
import { signToken } from "../_lib/auth.ts";
import { send, handleError } from "../_lib/send.ts";

type Body = { email?: string; password?: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
    await connectDB();

    const { email, password } = (req.body ?? {}) as Body;
    if (!email || !password) throw Object.assign(new Error("email, password required"), { statusCode: 400 });

    const user = await User.findOne({ email });
    if (!user) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

    const token = signToken({ userId: String(user._id), email: user.email });
    return send(res, 200, { token, user: { id: String(user._id), name: user.name, email: user.email } });
  } catch (err) {
    return handleError(res, err);
  }
}
