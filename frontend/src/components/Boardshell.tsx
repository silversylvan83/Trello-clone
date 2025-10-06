'use client'
import { PropsWithChildren } from 'react'
import { Menu } from 'lucide-react'

export default function BoardShell({ title, children }: PropsWithChildren<{ title?: string }>) {
  return (
    <div className="h-screen w-full grid" style={{ gridTemplateRows: '56px 1fr' }}>
      <header className="border-b bg-white/70 dark:bg-slate-900/70 backdrop-blur flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button className="h-9 w-9 grid place-items-center rounded-lg border dark:border-slate-700">
            <Menu size={16} />
          </button>
          <h1 className="text-lg font-semibold">{title || (process.env.NEXT_PUBLIC_APP_NAME ?? 'Kanban')}</h1>
        </div>
      </header>
      <main className="bg-slate-50 dark:bg-slate-950 overflow-hidden">{children}</main>
    </div>
  )
}
