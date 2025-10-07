'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'

export default function AddList({ onCreate }: { onCreate: (title: string)=>Promise<void>|void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  return open ? (
    <div className="min-w-[300px] w-[300px] rounded-2xl border bg-white p-3 dark:bg-slate-900 dark:border-slate-800">
      <input value={title} onChange={e=>setTitle(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'&&title.trim()){ onCreate(title.trim()); setTitle(''); setOpen(false)} if(e.key==='Escape'){setOpen(false)} }} placeholder="Enter list title…" className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200 dark:bg-slate-900 dark:border-slate-800" autoFocus />
      <div className="mt-2 flex items-center gap-2">
        <button disabled={!title.trim()} onClick={()=>{ onCreate(title.trim()); setTitle(''); setOpen(false) }} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">Add list</button>
        <button onClick={()=>setOpen(false)} className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Cancel</button>
      </div>
    </div>
  ) : (
    <button onClick={()=>setOpen(true)} className="min-w-[300px] w-[300px] rounded-2xl border border-dashed bg-white/60 p-3 text-left text-sm text-slate-600 hover:bg-white dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-700"> <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4"/> Add another list</span> </button>
  )
}