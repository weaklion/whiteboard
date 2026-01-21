import { create } from "zustand";

interface SelectionStore {
  historyIdx: number;
  selectedIds: string[];
  selectionRectangle: {
    visible: boolean;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  actions : {

    setHistoryIdx: (idx: number) => void;
    setSelectedIds: (ids: string[]) => void;
    setSelectionRectangle: (rect: SelectionStore["selectionRectangle"]) => void;
  }
}

export const useSelectionStore = create<SelectionStore>((set) => ({
  historyIdx: 0,
  selectedIds: [],
  selectionRectangle: {
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  },
  actions : {
  setHistoryIdx: (historyIdx) => set({ historyIdx }),
  setSelectedIds: (selectedIds) => set({ selectedIds }),
  setSelectionRectangle: (selectionRectangle) => set({ selectionRectangle }),

  }
}));
