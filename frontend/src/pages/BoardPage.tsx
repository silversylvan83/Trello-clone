import { useEffect } from 'react';
import { DndContext, type DragEndEvent, rectIntersection } from '@dnd-kit/core';
import { io } from 'socket.io-client';
import { BASE, api } from '../lib/api';
import KanbanColumn from '../components/KanbanColumn';
import { useBoard } from '../store/board';
import { Card, List } from '@/store/types';

const BOARD_ID = 'default'; // replace with real ID from /api/boards

export default function BoardPage() {
  const { lists, cards, setLists, setCards, moveCard } = useBoard();

  useEffect(() => {
    (async () => {
      const [ls, cs] = await Promise.all([
        api.get<List[]>('/api/lists', { params: { boardId: BOARD_ID }}),
        api.get<Card[]>('/api/cards', { params: { boardId: BOARD_ID }})
      ]);
      setLists(ls.data);
      setCards(cs.data);
      const s = io(BASE); s.emit('join-board', BOARD_ID);
      s.on('card:moved', (p: unknown) => {
        const card = p as { _id: string; listId: string; order: number };
        moveCard(card._id, card.listId, card.order);
      });
      s.on('list:created', (_)=> fetchLists());
      function fetchLists(){ api.get<List[]>('/api/lists',{params:{boardId:BOARD_ID}}).then(r=>setLists(r.data)); }
      return () => { s.disconnect(); };
    })();
  }, []);

  const byList: Record<string, Card[]> = {};
  lists.forEach(l => byList[l._id] = []);
  cards.forEach(c => (byList[c.listId] ||= []).push(c));

  async function onDragEnd(e: DragEndEvent) {
    const cardId = String(e.active.id);
    const toListId = String(e.over?.id || '');
    if (!toListId) return;

    // compute toOrder: place at end
    const siblings = (byList[toListId] || []).sort((a,b)=>a.order-b.order);
    const toOrder = (siblings.at(-1)?.order || 0) + 1;

    moveCard(cardId, toListId, toOrder); // optimistic
    try { await api.patch(`/api/cards/${cardId}/move`, { toListId, toOrder }); } catch {}
  }

  return (
    <div className="p-4 overflow-x-auto">
      <DndContext collisionDetection={rectIntersection} onDragEnd={onDragEnd}>
        <div className="flex gap-4">
          {lists.sort((a,b)=>a.order-b.order).map(l => (
            <KanbanColumn key={l._id} list={l} items={byList[l._id] || []} />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
