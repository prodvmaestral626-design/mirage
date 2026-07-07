import { create } from 'zustand'

export const useProviderStore = create((set, get) => ({
  selectedProviderId: 'openrouter',
  selectedModelId: 'openrouter/auto',
  apiKeys: {},
  modelLists: {},
  modelLoadState: {},

  setProvider: (providerId) => set({
    selectedProviderId: providerId,
    selectedModelId: null,
  }),

  setModel: (modelId) => set({ selectedModelId: modelId }),

  setApiKey: (providerId, key) => set((state) => ({
    apiKeys: { ...state.apiKeys, [providerId]: key },
  })),

  setModelList: (providerId, models) => set((state) => ({
    modelLists: { ...state.modelLists, [providerId]: models },
    modelLoadState: { ...state.modelLoadState, [providerId]: 'loaded' },
  })),

  setModelLoadState: (providerId, status) => set((state) => ({
    modelLoadState: { ...state.modelLoadState, [providerId]: status },
  })),

  getApiKey: (providerId) => get().apiKeys[providerId] || null,
  getModelList: (providerId) => get().modelLists[providerId] || [],
  getModelLoadState: (providerId) => get().modelLoadState[providerId] || 'idle',
}))
