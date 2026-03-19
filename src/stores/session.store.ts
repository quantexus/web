import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SessionStore {
  userId: string
  setUserId: (id: string) => void
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      userId: "",
      setUserId: (userId) => set({ userId }),
    }),
    {
      name: "quantexus-session",
    }
  )
)
