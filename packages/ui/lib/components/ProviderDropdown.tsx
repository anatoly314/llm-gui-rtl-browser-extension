import { useState, useEffect, useRef } from 'react';

interface ProviderOption {
  value: string;
  label: string;
}

interface ProviderDropdownProps {
  options: ProviderOption[];
  value: string;
  currentPlatform: string;
  onChange: (value: string) => void;
  onInvalidSelection?: () => void;
}

export const ProviderDropdown = ({
  options,
  value,
  currentPlatform,
  onChange,
  onInvalidSelection,
}: ProviderDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (selectedValue: string) => {
    // Check if trying to select the wrong provider for current platform
    if (selectedValue !== currentPlatform) {
      onInvalidSelection?.();
      setIsOpen(false);
      return;
    }
    onChange(selectedValue);
    setIsOpen(false);
  };

  const currentLabel = options.find(opt => opt.value === value)?.label || 'Select Provider';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      style={{
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #e5e7eb',
        position: 'relative' as const,
      }}>
      <label
        htmlFor="provider-dropdown"
        style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: '600',
          color: '#6b7280',
          marginBottom: '6px',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.025em',
        }}>
        Provider
      </label>
      <div ref={dropdownRef} style={{ position: 'relative' as const }}>
        <button
          id="provider-dropdown"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            color: '#374151',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.boxShadow = 'none';
          }}>
          <span>{currentLabel}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}>
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            style={{
              position: 'absolute' as const,
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              backgroundColor: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              zIndex: 50,
              overflow: 'hidden',
            }}>
            {options.map(option => {
              const isCurrentPlatform = option.value === currentPlatform;
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  disabled={!isCurrentPlatform}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    color: isCurrentPlatform ? (isSelected ? '#1e40af' : '#374151') : '#9ca3af',
                    fontSize: '13px',
                    fontWeight: isSelected ? '600' : '500',
                    textAlign: 'left' as const,
                    cursor: isCurrentPlatform ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s',
                    opacity: isCurrentPlatform ? 1 : 0.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onMouseEnter={e => {
                    if (isCurrentPlatform) {
                      e.currentTarget.style.backgroundColor = isSelected ? '#dbeafe' : '#f9fafb';
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = isSelected ? '#eff6ff' : '#ffffff';
                  }}>
                  <span>{option.label}</span>
                  {isSelected && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M13 4L6 11L3 8"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
