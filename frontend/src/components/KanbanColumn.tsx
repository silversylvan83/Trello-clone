import { useDroppable } from '@dnd-kit/core';
import KanbanCard from './KanbanCard';
import { Card, List } from '@/store/types';

export default function KanbanColumn({ list, items }: { list: List; items: Card[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: list._id, data: { listId: list._id } });
  return (
    <section className="flex flex-col gap-2 min-w-[260px]">
      <div className="px-2 font-semibold">{list.title}</div>
      <div ref={setNodeRef} className={`rounded-xl border bg-white p-2 ${isOver?'ring-2 ring-blue-600':''}`}>
        <div className="grid gap-2">
          {items.sort((a,b)=>a.order-b.order).map(c => <KanbanCard key={c._id} card={c} />)}
        </div>
      </div>
    </section>
  );
}
