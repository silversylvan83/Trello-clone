import React, { useState } from "react";
import { register } from "../api/auth.api";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const data = await register({ name, email, password });
      localStorage.setItem("token", data.token);
      nav("/boards");
    } catch (e:any) {
      setErr(e?.response?.data?.error || "Register failed");
    }
  }

  return (
    <div style={{ maxWidth: 360 }}>
      <h2>Register</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Create account</button>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
      </form>
      <p style={{ marginTop: 8 }}>
        Already have one? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
