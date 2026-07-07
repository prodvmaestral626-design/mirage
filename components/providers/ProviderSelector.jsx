import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { PROVIDERS } from '../../lib/providers/index'
import { useProviderStore } from '../../store/providerStore'

const ProviderSelector = () => {
  const { selectedProviderId, setProvider } = useProviderStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [buttonHover, setButtonHover] = useState(false)
  const dropdownRef = useRef(null)

  const selectedProvider = PROVIDERS.find(p => p.id === selectedProviderId)

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

  return (
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
          padding: '6px 14px 6px 10px',
          backgroundColor: '#110d14',
          border: `1px solid ${buttonHover || isOpen ? '#6b2040' : '#2a1f30'}`,
          borderRadius: '20px',
          cursor: 'pointer',
          color: '#e8ddf0',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          boxShadow: isOpen ? '0 0 0 1px rgba(139,26,74,0.2)' : 'none',
        }}
      >
        {selectedProvider && (
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: selectedProvider.color,
            boxShadow: `0 0 8px ${selectedProvider.color}`,
            flexShrink: 0,
          }} />
        )}
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          color: '#e8ddf0',
        }}>
          {selectedProvider ? selectedProvider.name : 'Select Provider'}
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
          minWidth: '240px',
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

          {PROVIDERS.map((provider, index) => {
            const isActiveProvider = provider.id === selectedProviderId
            const isHovered = hoveredItem === provider.id

            return (
              <div
                key={provider.id}
                onClick={() => {
                  setProvider(provider.id)
                  setIsOpen(false)
                }}
                onMouseEnter={() => setHoveredItem(provider.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  margin: '2px 0',
                  cursor: 'pointer',
                  backgroundColor: isActiveProvider
                    ? 'rgba(139,26,74,0.15)'
                    : isHovered
                    ? 'rgba(139,26,74,0.1)'
                    : 'transparent',
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateY(0)' : 'translateY(8px)',
                  transition: `background-color 0.15s ease, opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${index * 35}ms, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${index * 35}ms`,
                }}
              >
                {/* Color dot */}
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: provider.color,
                  boxShadow: `0 0 8px ${provider.color}`,
                  flexShrink: 0,
                }} />

                {/* Text */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: 0,
                }}>
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#e8ddf0',
                    letterSpacing: '-0.01em',
                  }}>
                    {provider.name}
                  </span>
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '11px',
                    fontWeight: 400,
                    color: '#9b8aaa',
                    opacity: 0.7,
                    marginTop: '2px',
                    lineHeight: 1.4,
                  }}>
                    {provider.description}
                  </span>
                </div>

                {/* Active checkmark */}
                {isActiveProvider && (
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    <Check size={12} color="#c0305a" strokeWidth={3} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ProviderSelector
