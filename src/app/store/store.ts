
import { create } from 'zustand';
import { GlobalData } from '@/app/types'
 
export const useStore = create<GlobalData>((set) => ({
  user: null,
  messageData: [],
  setUser: (user) => set({ user }),
  setMessageData: (messageData) => set({ messageData })
}));