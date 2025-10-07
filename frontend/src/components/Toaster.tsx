/* eslint-disable react-hooks/rules-of-hooks */
'use client'
import { createContext, useContext, useMemo, useState } from 'react'

const Ctx = createContext<{ success:(m:string)=>void; error:(m:string)=>void }|null>(null)

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<{ id:number; kind:'ok'|'err'; msg:string }[]>([])
  const api = useMemo(()=>({
    success(msg:string){ const id=Date.now(); setItems(v=>[...v,{id,kind:'ok',msg}]); setTimeout(()=>setItems(v=>v.filter(x=>x.id!==id)), 2500) },
    error(msg:string){ const id=Date.now(); setItems(v=>[...v,{id,kind:'err',msg}]); setTimeout(()=>setItems(v=>v.filter(x=>x.id!==id)), 3500) },
  }),[])
  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {items.map(x=> (
          <div key={x.id} className={`rounded-xl border px-3 py-2 text-sm shadow ${x.kind==='ok'?'bg-emerald-50 border-emerald-200 text-emerald-900':'bg-rose-50 border-rose-200 text-rose-900'}`}>{x.msg}</div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export const toast = {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  success(msg:string){ (useContext(Ctx) )?.success?.(msg) },
  error(msg:string){ (useContext(Ctx) )?.error?.(msg) },
}
