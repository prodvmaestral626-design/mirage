import { useEffect } from 'react'
import { useProviderStore } from '../store/providerStore'
import { getProvider } from '../lib/providers/index'

const categorize = (model, providerId) => {
  if (providerId === 'openrouter') {
    const isFreeVariant = model.id?.endsWith(':free')
    const promptPrice = parseFloat(model.pricing?.prompt || '0')
    if (isFreeVariant || promptPrice === 0) return 'Free'
    return 'Paid'
  }
  if (model.pricing?.free || model.isFree) return 'Free'
  return 'Paid'
}

const normalizeModels = (rawModels, providerId) => {
  if (providerId === 'openrouter') {
    return rawModels.map(m => ({
      id: m.id,
      name: m.name || m.id,
      tier: categorize(m, providerId),
      context: m.context_length,
      description: m.description,
    }))
  }
  if (providerId === 'groq') {
    return rawModels.map(m => ({
      id: m.id,
      name: m.id,
      tier: 'Free',
      context: m.context_window,
    }))
  }
  if (providerId === 'ollama') {
    return rawModels.map(m => ({
      id: m.name,
      name: m.name,
      tier: 'Free',
    }))
  }
  return rawModels.map(m => ({
    id: m.id || m.name,
    name: m.name || m.id,
    tier: 'Free',
  }))
}

const tagHybrids = (models) => {
  const baseIds = new Set()
  const freeBaseIds = new Set()

  models.forEach(m => {
    if (m.id.endsWith(':free')) {
      freeBaseIds.add(m.id.replace(':free', ''))
    } else {
      baseIds.add(m.id)
    }
  })

  return models.map(m => {
    const baseId = m.id.replace(':free', '')
    if (baseIds.has(baseId) && freeBaseIds.has(baseId)) {
      return { ...m, tier: 'Hybrid' }
    }
    return m
  })
}

const getStaticModels = (providerId) => {
  const statics = {
    anthropic: [
      { id: 'claude-opus-4-5', name: 'Claude Opus 4.5', tier: 'Paid' },
      { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', tier: 'Paid' },
      { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', tier: 'Paid' },
    ],
  }
  return statics[providerId] || []
}

export const useModels = (providerId) => {
  const {
    setModelList,
    setModelLoadState,
    getApiKey,
    getModelList,
    getModelLoadState,
  } = useProviderStore()

  const apiKey = getApiKey(providerId)
  const models = getModelList(providerId)
  const loadState = getModelLoadState(providerId)
  const provider = getProvider(providerId)

  useEffect(() => {
    if (loadState === 'loaded' || loadState === 'loading') return
    if (!provider?.modelsEndpoint) {
      const staticModels = getStaticModels(providerId)
      setModelList(providerId, staticModels)
      return
    }
    if (provider.requiresKey && !apiKey) {
      setModelLoadState(providerId, 'idle')
      return
    }

    const fetchModels = async () => {
      setModelLoadState(providerId, 'loading')
      try {
        const headers = { 'Content-Type': 'application/json' }
        if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

        const res = await fetch(provider.modelsEndpoint, { headers })
        if (!res.ok) throw new Error(`Failed: ${res.status}`)

        const data = await res.json()
        let rawModels = data.data || data.models || data || []
        if (providerId === 'ollama') rawModels = data.models || []

        let normalized = normalizeModels(rawModels, providerId)
        if (providerId === 'openrouter') normalized = tagHybrids(normalized)

        setModelList(providerId, normalized)
      } catch (err) {
        console.error(`Model fetch error [${providerId}]:`, err)
        setModelLoadState(providerId, 'error')
      }
    }

    fetchModels()
  }, [providerId, apiKey])

  const grouped = {
    Free: models.filter(m => m.tier === 'Free'),
    Hybrid: models.filter(m => m.tier === 'Hybrid'),
    Paid: models.filter(m => m.tier === 'Paid'),
  }

  return { models, grouped, loadState }
}
