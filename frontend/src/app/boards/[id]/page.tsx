"use client";
import React, { useMemo, useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import BoardShell from "@/components/BoardShell";
import BoardToolbar from "@/components/BoardToolbar";
import KanbanColumn from "@/components/KanbanColumn";
import AddList from "@/components/AddList";

export type Card = {
  _id: string;
  boardId: string;
  listId: string;
  title: string;
  order: number;
  description?: string;
};

type List = { _id: string; boardId: string; title: string; order: number };

export default function BoardPage() {
  const [query, setQuery] = useState("");

  // --- Static Demo Data ---
  const lists: List[] = [
    { _id: "list-1", boardId: "default", title: "To Do", order: 1 },
    { _id: "list-2", boardId: "default", title: "In Progress", order: 2 },
    { _id: "list-3", boardId: "default", title: "Done", order: 3 },
  ];

  const cards: Card[] = [
    {
      _id: "card-1",
      boardId: "default",
      listId: "list-1",
      title: "Setup project structure",
      order: 1,
      description: "Initialize Next.js, TailwindCSS, and ESLint.",
    },
    {
      _id: "card-2",
      boardId: "default",
      listId: "list-1",
      title: "Configure backend API",
      order: 2,
      description: "Connect to Express server and test routes.",
    },
    {
      _id: "card-3",
      boardId: "default",
      listId: "list-2",
      title: "Implement drag-and-drop",
      order: 1,
      description: "Integrate @dnd-kit for cards and lists.",
    },
    {
      _id: "card-4",
      boardId: "default",
      listId: "list-2",
      title: "Add card composer UI",
      order: 2,
      description: "Inline input with auto-focus for new cards.",
    },
    {
      _id: "card-5",
      boardId: "default",
      listId: "list-3",
      title: "Polish dark mode",
      order: 1,
      description: "Adjust background gradients and contrast.",
    },
    {
      _id: "card-6",
      boardId: "default",
      listId: "list-3",
      title: "Deploy preview build",
      order: 2,
      description: "Deploy to Vercel and verify responsive layout.",
    },
  ];

  const cardsByList = useMemo(() => {
    const map: Record<string, Card[]> = {};
    lists.forEach((l) => (map[l._id] = []));
    cards.forEach((c) => (map[c.listId] ||= []).push(c));
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.order - b.order));
    return map;
  }, [lists, cards]);

  const filteredCardsByList = useMemo(() => {
    if (!query.trim()) return cardsByList;
    const q = query.toLowerCase();
    const clone: typeof cardsByList = {};
    for (const [lid, listCards] of Object.entries(cardsByList)) {
      clone[lid] = listCards.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }
    return clone;
  }, [cardsByList, query]);

  function onDragEnd(_ev: DragEndEvent) {
    // For static demo, just animate
  }

  return (
    <BoardShell
      title="Trello Demo Board"
      visibility="workspace"
      membersCount={5}
      bgImageUrl="https://images.unsplash.com/photo-1517816428104-797678c7cf0d?q=80&w=1880&auto=format&fit=crop"
    >
      <BoardToolbar query={query} onQuery={setQuery} onRefresh={() => {}} />

      <DndContext onDragEnd={onDragEnd}>
        <div className="flex w-max gap-4">
          {lists.map((list) => (
            <KanbanColumn
              key={list._id}
              list={list}
              items={filteredCardsByList[list._id] || []}
            />
          ))}
          <AddList onCreate={() => {}} />
        </div>
      </DndContext>
    </BoardShell>
  );
}
