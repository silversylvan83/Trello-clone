import { CSS } from '@dnd-kit/utilities';
import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/store/types';

export default function KanbanCard({ card }: { card: Card }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card._id, data: { cardId: card._id } });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={`rounded-lg border p-2 bg-slate-50 ${isDragging?'ring-2 ring-blue-600':''}`}>
      <div className="text-sm">{card.title}</div>
    </div>
  );
}
