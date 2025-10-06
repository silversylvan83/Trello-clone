'use client'
import { useDroppable } from '@dnd-kit/core'
import KanbanCard from './KanbanCard'

type List = { _id: string; boardId: string; title: string; order: number }
type Card = { _id: string; boardId: string; listId: string; title: string; order: number }

export default function KanbanColumn({ list, items }: { list: List; items: Card[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: list._id, data: { listId: list._id } })
  return (
    <section className="flex min-w-[260px] flex-col gap-2">
      <div className="px-2 text-sm font-semibold">{list.title}</div>
      <div
        ref={setNodeRef}
        className={`rounded-xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-2 min-h-[220px] ${isOver ? 'ring-2 ring-blue-600' : ''}`}
      >
        <div className="grid gap-2">
          {items.map((c) => <KanbanCard key={c._id} card={c} />)}
        </div>
      </div>
    </section>
  )
}
