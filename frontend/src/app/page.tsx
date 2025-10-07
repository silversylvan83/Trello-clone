"use client";

import { useEffect, useMemo } from "react";
import { DndContext, type DragEndEvent, rectIntersection } from "@dnd-kit/core";
import KanbanColumn from "@/components/KanbanColumn";
import BoardShell from "@/components/BoardShell";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import { useBoard } from "@/store/board";

type List = { _id: string; boardId: string; title: string; order: number };
type Card = {
  _id: string;
  boardId: string;
  listId: string;
  title: string;
  order: number;
};

const BOARD_ID = "default"; // replace with real board id from backend

export default function Page() {
  const { lists, cards, setLists, setCards, moveCard } = useBoard();

  useEffect(() => {
    (async () => {
      const [ls, cs] = await Promise.all([
        api.get<List[]>("/api/lists", { params: { boardId: BOARD_ID } }),
        api.get<Card[]>("/api/cards", { params: { boardId: BOARD_ID } }),
      ]);
      setLists(ls.data);
      setCards(cs.data);

      socket.connect();
      socket.emit("join-board", BOARD_ID);
      socket.on("card:moved", (p: unknown) => {
        const card = p as Card;
        moveCard(card._id, card.listId, card.order);
      });
      socket.on("list:created", async () => {
        const re = await api.get<List[]>("/api/lists", {
          params: { boardId: BOARD_ID },
        });
        setLists(re.data);
      });
      return () => {
        socket.disconnect();
      };
    })();
  }, [setLists, setCards, moveCard]);

  const byList = useMemo(() => {
    const map: Record<string, Card[]> = {};
    lists.forEach((l) => (map[l._id] = []));
    cards.forEach((c) => (map[c.listId] ||= []).push(c));
    return map;
  }, [lists, cards]);

  async function onDragEnd(e: DragEndEvent) {
    const cardId = String(e.active.id);
    const toListId = String(e.over?.id || "");
    if (!toListId) return;
    const siblings = (byList[toListId] || []).sort((a, b) => a.order - b.order);
    const toOrder = (siblings.at(-1)?.order || 0) + 1;
    moveCard(cardId, toListId, toOrder); // optimistic
    try {
      await api.patch(`/api/cards/${cardId}/move`, { toListId, toOrder });
    } catch {}
  }

  return (
    <BoardShell title="Board">
      <DndContext collisionDetection={rectIntersection} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto p-4">
          {lists
            .sort((a, b) => a.order - b.order)
            .map((l) => (
              <KanbanColumn
                key={l._id}
                list={l}
                items={(byList[l._id] || []).sort((a, b) => a.order - b.order)}
              />
            ))}
        </div>
      </DndContext>
    </BoardShell>
  );
}
