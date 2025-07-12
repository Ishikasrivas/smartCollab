import { create } from 'zustand'

interface Board {
  _id: string
  title: string
  columns: string[]
}

interface BoardStore {
  boards: Board[]
  fetchBoards: (token: string) => Promise<void>
  createBoard: (title: string, token: string) => Promise<void>
}

export const useBoardStore = create<BoardStore>((set) => ({
  boards: [],
  fetchBoards: async (token) => {
    const res = await fetch('http://localhost:5000/api/boards', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    set({ boards: data })
  },
  createBoard: async (title, token) => {
    const res = await fetch('http://localhost:5000/api/boards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    })
    const board = await res.json()
    set((state) => ({ boards: [...state.boards, board] }))
  },
})) 