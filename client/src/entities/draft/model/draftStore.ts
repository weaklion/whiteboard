import { create } from 'zustand';

interface Draft {
  points: number[];
  color: string;
}

interface DraftStore {
  drafts: Map<string, Draft>; // id -> Draft
  actions: {
    updateDraft: (id: string, draft: Draft) => void;
    removeDraft: (id: string) => void;
  }
}

export const useDraftStore = create<DraftStore>((set) => ({
  drafts: new Map(),
  actions: {
    updateDraft: (id, draft) => set((state) => {
      const newDrafts = new Map(state.drafts);
      newDrafts.set(id, draft);
      return { drafts: newDrafts };
    }),
    removeDraft: (id) => set((state) => {
      const newDrafts = new Map(state.drafts);
      newDrafts.delete(id);
      return { drafts: newDrafts };
    }),
  },
}));
