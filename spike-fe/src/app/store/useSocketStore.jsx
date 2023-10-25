import {create} from "zustand";
export const useSocketStore = create((set) => ({
  currentSocket:null,
  setCurrentSocket:(socket) => set((state) => ({socket:socket})) 
}));
