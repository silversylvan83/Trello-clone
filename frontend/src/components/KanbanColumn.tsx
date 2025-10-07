'use client'
import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Plus, ChevronDown, Trash2 } from 'lucide-react'
import KanbanCard from '@/components/KanbanCard'
import { Card } from '@/app/boards/[id]/page'

type List = { _id: string; boardId: string; title: string; order: number }

export default function KanbanColumn({ list, items, onAddCard, onDeleteList }: { list: List; items: Card[]; onAddCard?: (listId: string, title: string)=>Promise<void>|void; onDeleteList?: (listId: string)=>void }) {
  const { setNodeRef, isOver } = useDroppable({ id: list._id, data: { listId: list._id } })
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')

  return (
    <section className="min-w-[300px] w-[300px] flex flex-col gap-3">
      <header className="flex items-center justify-between rounded-xl border bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/70 dark:to-slate-900 dark:border-slate-800 px-3 py-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-white text-[10px] font-bold">{list.title.slice(0,1).toUpperCase()}</span>
          <span className="truncate" title={list.title}>{list.title}</span>
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">{items.length}</span>
        </h3>
        <div className="flex items-center gap-1">
          {onDeleteList && (
            <button onClick={()=>onDeleteList(list._id)} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" title="Delete list"><Trash2 className="h-3.5 w-3.5"/></button>
          )}
          <button onClick={()=>setOpen(v=>!v)} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
            <Plus className="h-3.5 w-3.5"/> Add <ChevronDown className={`h-3.5 w-3.5 transition ${open?'rotate-180':''}`}/>
          </button>
        </div>
      </header>

      <div ref={setNodeRef} className={`rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-3 transition-shadow ${isOver ? 'ring-2 ring-blue-600 shadow-lg' : 'shadow-sm hover:shadow-md'}`}>
        <div className="grid gap-2">
          {items.length === 0 && !open && (
            <div className="rounded-xl border border-dashed bg-slate-50 p-4 text-center text-xs text-slate-500 dark:bg-slate-950/40 dark:border-slate-800">Drop a card here or click <span className="font-medium">Add</span></div>
          )}
          {items.map(c => (<KanbanCard key={c._id} card={c} />))}
        </div>

        {open && (
          <div className="mt-3 rounded-xl border bg-slate-50 p-2 dark:bg-slate-950/40 dark:border-slate-800">
            <input value={title} onChange={e=>setTitle(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ onAddCard?.(list._id, title.trim()); setTitle(''); setOpen(false)} if(e.key==='Escape'){ setOpen(false)} }} placeholder="Card title" className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200 dark:bg-slate-900 dark:border-slate-800" autoFocus />
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>Enter to add • Esc to cancel</span>
              <button disabled={!title.trim()} onClick={()=>{ onAddCard?.(list._id, title.trim()); setTitle(''); setOpen(false) }} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">Add card</button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}