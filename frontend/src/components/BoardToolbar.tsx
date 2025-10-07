'use client'
import { RefreshCcw, SortAsc, Search } from 'lucide-react'

export default function BoardToolbar({ query, onQuery, onRefresh }: { query: string; onQuery: (v:string)=>void; onRefresh: ()=>void }) {
  return (
    <div className="mb-3 flex items-center gap-2 px-1">
      <label className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
        <input value={query} onChange={e=>onQuery(e.target.value)} placeholder="Search cards…" className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm bg-white/90 dark:bg-slate-900/70 dark:border-slate-800"/>
      </label>
      <button className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-2 text-sm bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800"><SortAsc className="h-4 w-4"/> Sort</button>
      <button onClick={onRefresh} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-2 text-sm bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800"><RefreshCcw className="h-4 w-4"/> Refresh</button>
    </div>
  )
}