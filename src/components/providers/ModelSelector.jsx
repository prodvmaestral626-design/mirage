import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Cpu, Zap, Loader } from 'lucide-react'
import { useProviderStore } from '../../store/providerStore'
import { useModels } from '../../hooks/useModels'

const ModelSelector = () => {
  const { selectedProviderId, selectedModelId, setModel } = useProviderStore()
  const { grouped, loadState } = useModels(selectedProviderId)
  const [isOpen, setIsOpen] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [buttonHover, setButtonHover] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsActive(true), 10)
      return () => clearTimeout(timer)
    } else {
      setIsActive(false)
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const allModels = [
    ...(grouped.Free || []),
    ...(grouped.Hybrid || []),
    ...(grouped.Paid || []),
  ]
  const selectedModel = allModels.find(m => m.id === selectedModelId)

  const getTriggerText = () => {
    if (loadState === 'loading') return 'Loading models...'
    if (loadState === 'error') return 'Failed to load'
    if (loadState === 'idle') return 'Add API key'
    if (selectedModel) return selectedModel.name
    return 'Select Model'
  }

  const groupsToRender = ['Free', 'Hybrid', 'Paid'].filter(
    g => grouped[g] && grouped[g].length > 0
  )

  let globalIndex = 0

  return (
    <>
      <style>{`
        @keyframes mirage-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes mirage-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .mirage-loader-spin { animation: mirage-spin 1s linear infinite; }
        .mirage-text-pulse { animation: mirage-pulse 1.5s ease-in-out infinite; }
      `}</style>

      <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block', zIndex: 100 }}>

        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setButtonHover(true)}
          onMouseLeave={() => setButtonHover(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            backgroundColor: '#110d14',
            border: `1px solid ${buttonHover || isOpen ? '#6b2040' : '#2a1f30'}`,
            borderRadius: '20px',
            cursor: 'pointer',
            color: '#e8ddf0',
            transform: isOpen ? 'scale(0.98)' : 'scale(1)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: isOpen ? '0 0 0 1px rgba(139,26,74,0.2)' : 'none',
          }}
        >
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: loadState === 'idle' || loadState === 'error' ? '#4a3a55' : '#e8ddf0',
          }}>
            {getTriggerText()}
          </span>
          <ChevronDown
            size={16}
            color="#9b8aaa"
            style={{
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            minWidth: '280px',
            backgroundColor: 'rgba(17, 13, 20, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 26, 74, 0.3)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,26,74,0.15)',
            padding: '8px',
            opacity: isActive ? 1 : 0,
            transform: isActive ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-8px)',
            transformOrigin: 'top center',
            transition: 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>

            {/* Loading state */}
            {loadState === 'loading' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 12px' }}>
                <Loader size={16} color="#9b8aaa" className="mirage-loader-spin" />
                <span className="mirage-text-pulse" style={{
                  color: '#9b8aaa',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px',
                }}>
                  Loading models...
                </span>
              </div>
            )}

            {/* Error state */}
            {loadState === 'error' && (
              <div style={{
                padding: '16px 12px',
                color: '#8b1a1a',
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
              }}>
                Failed to load
              </div>
            )}

            {/* No key state */}
            {loadState === 'idle' && (
              <div style={{
                padding: '16px 12px',
                color: '#4a3a55',
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
              }}>
                Add API key to load models
              </div>
            )}

            {/* Grouped model list */}
            {loadState === 'loaded' && groupsToRender.map((groupName, groupIndex) => (
              <div key={groupName}>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: '#4a3a55',
                  paddingLeft: '12px',
                  paddingTop: '8px',
                  paddingBottom: '4px',
                }}>
                  {groupName}
                </div>

                {grouped[groupName].map(model => {
                  const itemIndex = globalIndex++
                  const isActiveModel = model.id === selectedModelId
                  const isHovered = hoveredItem === model.id

                  return (
                    <div
                      key={model.id}
                      onClick={() => {
                        setModel(model.id)
                        setIsOpen(false)
                      }}
                      onMouseEnter={() => setHoveredItem(model.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        margin: '2px 0',
                        cursor: 'pointer',
                        backgroundColor: isActiveModel
                          ? 'rgba(139,26,74,0.15)'
                          : isHovered
                          ? 'rgba(139,26,74,0.1)'
                          : 'transparent',
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? 'translateY(0)' : 'translateY(8px)',
                        transition: `background-color 0.15s ease, opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${itemIndex * 40}ms, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${itemIndex * 40}ms`,
                      }}
                    >
                      {/* Leading icon */}
                      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                        {groupName === 'Free'
                          ? <Zap size={16} color="#9b8aaa" />
                          : <Cpu size={16} color="#9b8aaa" />
                        }
                      </div>

                      {/* Text content */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#e8ddf0',
                          letterSpacing: '-0.02em',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {model.name}
                        </span>
                        {model.description && (
                          <span style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '11px',
                            fontWeight: 400,
                            color: '#9b8aaa',
                            opacity: 0.7,
                            lineHeight: 1.4,
                            marginTop: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {model.description}
                          </span>
                        )}
                      </div>

                      {/* Tier badge */}
                      <div style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#e8ddf0',
                        backgroundColor: model.tier === 'Free'
                          ? '#2d6a4f'
                          : model.tier === 'Hybrid'
                          ? '#7a5c1a'
                          : '#8b1a4a',
                        flexShrink: 0,
                      }}>
                        {model.tier}
                      </div>

                      {/* Active dot */}
                      {isActiveModel && (
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#c0305a',
                          boxShadow: '0 0 8px #c0305a',
                          marginLeft: '4px',
                          flexShrink: 0,
                        }} />
                      )}
                    </div>
                  )
                })}

                {/* Group divider */}
                {groupIndex < groupsToRender.length - 1 && (
                  <div style={{
                    height: '1px',
                    backgroundColor: '#2a1f30',
                    margin: '4px 0',
                  }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default ModelSelector
