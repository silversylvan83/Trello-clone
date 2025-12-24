import React, { useEffect, useState } from "react";
import { createBoard, getBoards, type Board } from "../api/board.api";
import { Link } from "react-router-dom";

export default function Boards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [title, setTitle] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const data = await getBoards();
      setBoards(data.boards);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load boards");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate() {
    if (!title.trim()) return;
    await createBoard(title.trim());
    setTitle("");
    load();
  }

  return (
    <div>
      <h2>Boards</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input placeholder="New board title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button onClick={onCreate}>Create</button>
      </div>

      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {boards.map((b) => (
          <Link
            key={b._id}
            to={`/boards/${b._id}`}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 12,
              textDecoration: "none",
              color: "inherit"
            }}
          >
            <div style={{ fontWeight: 700 }}>{b.title}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Updated: {new Date(b.updatedAt).toLocaleString()}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
