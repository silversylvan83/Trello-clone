'use client'
import { create } from 'zustand'

type List = { _id: string; boardId: string; title: string; order: number }
type Card = { _id: string; boardId: string; listId: string; title: string; order: number }

type State = {
  lists: List[]
  cards: Card[]
  setLists: (l: List[]) => void
  setCards: (c: Card[]) => void
  moveCard: (id: string, toListId: string, toOrder: number) => void
}

export const useBoard = create<State>((set) => ({
  lists: [],
  cards: [],
  setLists: (lists) => set({ lists }),
  setCards: (cards) => set({ cards }),
  moveCard: (id, toListId, toOrder) =>
    set((s) => ({
      cards: s.cards.map((c) =>
        c._id === id ? { ...c, listId: toListId, order: toOrder } : c
      )
    }))
}))
