import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getBoard } from "../api/board.api";
import { createList } from "../api/list.api";
import { createCard, moveCard } from "../api/card.api";

type List = { _id: string; title: string; order: number };
type Card = { _id: string; listId: string; title: string; description: string; order: number };
type Board = { _id: string; title: string };

export default function BoardView() {
  const { id } = useParams();
  const boardId = id as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [listTitle, setListTitle] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const data = await getBoard(boardId);
      setBoard(data.board);
      setLists(data.lists);
      setCards(data.cards);
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Failed to load board");
    }
  }

  useEffect(() => {
    load();
  }, [boardId]);

  const cardsByList = useMemo(() => {
    const map = new Map<string, Card[]>();
    for (const l of lists) map.set(l._id, []);
    for (const c of cards) {
      if (!map.has(c.listId)) map.set(c.listId, []);
      map.get(c.listId)!.push(c);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => a.order - b.order);
      map.set(k, arr);
    }
    return map;
  }, [lists, cards]);

  async function onAddList() {
    if (!listTitle.trim()) return;
    await createList(boardId, listTitle.trim());
    setListTitle("");
    load();
  }

  async function onAddCard(listId: string) {
    const title = window.prompt("Card title?");
    if (!title?.trim()) return;
    await createCard(listId, title.trim());
    load();
  }

  const [dragCardId, setDragCardId] = useState<string | null>(null);

  function onDragStart(cardId: string) {
    setDragCardId(cardId);
  }

  async function onDrop(listId: string) {
    if (!dragCardId) return;

    const targetCards = cardsByList.get(listId) || [];
    const toIndex = targetCards.length;

    // optimistic UI
    setCards((prev) => {
      const moving = prev.find((c) => c._id === dragCardId);
      if (!moving) return prev;
      const rest = prev.filter((c) => c._id !== dragCardId);
      return [...rest, { ...moving, listId, order: toIndex }];
    });

    try {
      await moveCard({ cardId: dragCardId, toListId: listId, toIndex });
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Move failed");
      await load();
    } finally {
      setDragCardId(null);
    }
  }

  if (!board) return <div>Loading...</div>;

  return (
    <div>
      <h2>{board.title}</h2>
      {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input placeholder="New list title" value={listTitle} onChange={(e) => setListTitle(e.target.value)} />
        <button onClick={onAddList}>Add list</button>
      </div>

      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12 }}>
        {lists.map((l) => {
          const listCards = cardsByList.get(l._id) || [];
          return (
            <div
              key={l._id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(l._id)}
              style={{
                minWidth: 280,
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 10,
                background: "#fafafa"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700 }}>{l.title}</div>
                <button onClick={() => onAddCard(l._id)}>+ Card</button>
              </div>

              <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                {listCards.map((c) => (
                  <div
                    key={c._id}
                    draggable
                    onDragStart={() => onDragStart(c._id)}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      background: "white",
                      border: "1px solid #e5e5e5",
                      cursor: "grab"
                    }}
                    title="Drag me to another list"
                  >
                    <div style={{ fontWeight: 600 }}>{c.title}</div>
                    {c.description ? <div style={{ fontSize: 12, opacity: 0.8 }}>{c.description}</div> : null}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
