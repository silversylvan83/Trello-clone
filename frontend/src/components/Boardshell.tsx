'use client'
import { PropsWithChildren, useMemo } from 'react'
import { Menu, Star, Users, Filter, Share2, MoreHorizontal, Lock, Globe, ChevronDown } from 'lucide-react'

type Visibility = 'private' | 'workspace' | 'public'

export default function BoardShell({ title, visibility = 'workspace', membersCount = 3, bgImageUrl, bgColor = '#3b82f6', onToggleSidebar, onStar, onFilter, onShare, onShowMenu, children, }: PropsWithChildren<{ title?: string; visibility?: Visibility; membersCount?: number; bgImageUrl?: string; bgColor?: string; onToggleSidebar?: () => void; onStar?: () => void; onFilter?: () => void; onShare?: () => void; onShowMenu?: () => void; }>) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'Kanban'
  const visIcon = useMemo(() => (visibility==='private'? <Lock className="h-3.5 w-3.5"/> : visibility==='public'? <Globe className="h-3.5 w-3.5"/> : <Users className="h-3.5 w-3.5"/>), [visibility])

  return (
    <div className="h-screen w-full grid" style={{ gridTemplateRows: '48px auto 1fr' }}>
      <header className="flex items-center justify-between px-3 sm:px-4 border-b bg-white/70 dark:bg-slate-900/70 backdrop-blur z-40">
        <div className="flex items-center gap-2">
          <button onClick={onToggleSidebar} className="h-8 w-8 grid place-items-center rounded-md border border-slate-200 bg-white/60 dark:border-slate-700 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition" aria-label="Open sidebar">
            <Menu size={16} className="text-slate-700 dark:text-slate-300" />
          </button>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{appName}</div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600" />
        </div>
      </header>

      <div className="relative">
        <div className="absolute inset-0 -z-10" style={{ background: bgImageUrl? `url(${bgImageUrl}) center/cover no-repeat` : bgColor }} />
        <div className="absolute inset-0 -z-10 bg-black/20" />
        <div className="px-3 sm:px-4 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base sm:text-lg font-semibold text-white drop-shadow-sm">{title || 'Untitled board'}</h1>
            <button onClick={onStar} className="inline-flex items-center gap-1 rounded-md bg-white/15 text-white/95 px-2 py-1 text-xs hover:bg-white/25" aria-label="Star board">
              <Star className="h-3.5 w-3.5" /> Star
            </button>
            <span className="inline-flex items-center gap-1 rounded-md bg-white/15 text-white/95 px-2 py-1 text-xs">
              {visIcon} {visibility==='private'?'Private':visibility==='public'?'Public':'Workspace'} <ChevronDown className="h-3.5 w-3.5 opacity-80" />
            </span>
            <div className="ml-auto flex items-center gap-1">
              <div className="flex -space-x-2">
                {[...Array(Math.min(membersCount,3))].map((_,i)=> (
                  <div key={i} className="h-7 w-7 rounded-full ring-2 ring-white/70 bg-white/90 text-[10px] grid place-items-center font-semibold text-slate-700">{['VK','AR','JD'][i] ?? 'U'}</div>
                ))}
                {membersCount>3 && (<div className="h-7 w-7 rounded-full ring-2 ring-white/70 bg-white/80 grid place-items-center text-[10px] text-slate-700">+{membersCount-3}</div>)}
              </div>
              <button onClick={onFilter} className="ml-2 inline-flex items-center gap-1 rounded-md bg-white/15 text-white/95 px-2 py-1 text-xs hover:bg-white/25"><Filter className="h-3.5 w-3.5"/> Filter</button>
              <button onClick={onShare} className="inline-flex items-center gap-1 rounded-md bg-white/15 text-white/95 px-2 py-1 text-xs hover:bg-white/25"><Share2 className="h-3.5 w-3.5"/> Share</button>
              <button onClick={onShowMenu} className="inline-flex items-center gap-1 rounded-md bg-white/15 text-white/95 px-2 py-1 text-xs hover:bg-white/25"><MoreHorizontal className="h-3.5 w-3.5"/> Show menu</button>
            </div>
          </div>
        </div>
      </div>

      <main className="overflow-hidden bg-slate-50 dark:bg-slate-950">
        <div className="h-full w-full overflow-auto">
          <div className="min-h-full w-max p-3 sm:p-4 flex gap-3 sm:gap-4">{children}</div>
        </div>
      </main>
    </div>
  )
}