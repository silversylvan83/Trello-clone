'use client'
import { CSS } from '@dnd-kit/utilities'
import { useDraggable } from '@dnd-kit/core'
import { GripVertical } from 'lucide-react'
import { Card } from '@/app/boards/[id]/page'

export default function KanbanCard({ card }: { card: Card }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card._id, data: { cardId: card._id, listId: card.listId } })
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? 'none' : 'transform 0.15s ease, box-shadow 0.15s ease',
    boxShadow: isDragging ? '0 6px 20px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    cursor: isDragging ? 'grabbing' : 'grab',
  }
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style} className={`group rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-3 text-sm select-none ${isDragging ? 'ring-2 ring-blue-600 scale-[1.02]' : 'hover:border-blue-400 hover:shadow-md transition-transform'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="font-medium text-slate-800 dark:text-slate-100">{card.title}</div>
          {card.description && (<p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-3">{card.description}</p>)}
        </div>
        <span className="opacity-0 group-hover:opacity-100 text-slate-400"><GripVertical className="h-4 w-4"/></span>
      </div>
    </div>
  )
}