import { useStorage, toggleRTL, initRTLManager, getCurrentRTLState } from '@extension/shared';
import { rtlPositionStorage } from '@extension/storage';
import { useState, useEffect } from 'react';
import type { PositionType } from '@extension/storage';

export default function App() {
  const [isHovered, setIsHovered] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const storageData = useStorage(rtlPositionStorage);
  const position = storageData?.position || 'top';

  // Initialize RTL manager and load current state
  useEffect(() => {
    const cleanup = initRTLManager();

    // Load initial RTL state
    getCurrentRTLState().then(state => setIsRTL(state));

    return cleanup;
  }, []);

  const handleToggleRTL = async () => {
    const newState = await toggleRTL();
    setIsRTL(newState);
  };

  const getContainerStyle = () => {
    const baseStyle = {
      position: 'fixed' as const,
      zIndex: 9999999,
    };

    switch (position) {
      case 'top':
        return { ...baseStyle, top: 0, left: '50%', transform: 'translateX(-50%)' };
      case 'right':
        return { ...baseStyle, right: 0, top: '50%', transform: 'translateY(-50%)' };
      case 'bottom':
        return { ...baseStyle, bottom: 0, left: '50%', transform: 'translateX(-50%)' };
      case 'left':
        return { ...baseStyle, left: 0, top: '50%', transform: 'translateY(-50%)' };
      default:
        return { ...baseStyle, top: 0, left: '50%', transform: 'translateX(-50%)' };
    }
  };

  const getTriggerStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      backgroundColor: '#3b82f6',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      opacity: isHovered ? 1 : 0.9,
      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '8px',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
        };
      case 'right':
        return {
          ...baseStyle,
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '8px',
          height: '120px',
          borderTopLeftRadius: '8px',
          borderBottomLeftRadius: '8px',
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '8px',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
        };
      case 'left':
        return {
          ...baseStyle,
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '8px',
          height: '120px',
          borderTopRightRadius: '8px',
          borderBottomRightRadius: '8px',
        };
      default:
        return baseStyle;
    }
  };

  const getPanelStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      backgroundColor: 'white',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.3s ease',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          top: isHovered ? '8px' : '-450px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '400px',
          borderRadius: '0 0 12px 12px',
        };
      case 'right':
        return {
          ...baseStyle,
          right: isHovered ? '8px' : '-550px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '500px',
          height: '400px',
          borderRadius: '12px 0 0 12px',
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: isHovered ? '8px' : '-450px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '400px',
          borderRadius: '12px 12px 0 0',
        };
      case 'left':
        return {
          ...baseStyle,
          left: isHovered ? '8px' : '-550px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '500px',
          height: '400px',
          borderRadius: '0 12px 12px 0',
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div style={getContainerStyle()} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {/* Trigger bar */}
      <div style={getTriggerStyle()} />

      {/* Sliding panel */}
      <div style={getPanelStyle()}>
        <h2
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1f2937',
          }}>
          RTL Settings
        </h2>

        <div style={{ marginTop: '12px' }}>
          <div
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px',
            }}>
            Toggle Position
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '12px',
              flexWrap: 'wrap',
            }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '6px',
                border: position === 'top' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                backgroundColor: position === 'top' ? '#eff6ff' : 'white',
                transition: 'all 0.2s',
              }}>
              <input
                type="radio"
                name="position"
                value="top"
                checked={position === 'top'}
                onChange={() => rtlPositionStorage.setPosition('top' as PositionType)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#3b82f6' }}
              />
              <span
                style={{
                  fontSize: '14px',
                  color: position === 'top' ? '#1e40af' : '#374151',
                  fontWeight: position === 'top' ? '600' : '400',
                  userSelect: 'none',
                }}>
                Top
              </span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '6px',
                border: position === 'right' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                backgroundColor: position === 'right' ? '#eff6ff' : 'white',
                transition: 'all 0.2s',
              }}>
              <input
                type="radio"
                name="position"
                value="right"
                checked={position === 'right'}
                onChange={() => rtlPositionStorage.setPosition('right' as PositionType)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#3b82f6' }}
              />
              <span
                style={{
                  fontSize: '14px',
                  color: position === 'right' ? '#1e40af' : '#374151',
                  fontWeight: position === 'right' ? '600' : '400',
                  userSelect: 'none',
                }}>
                Right
              </span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '6px',
                border: position === 'bottom' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                backgroundColor: position === 'bottom' ? '#eff6ff' : 'white',
                transition: 'all 0.2s',
              }}>
              <input
                type="radio"
                name="position"
                value="bottom"
                checked={position === 'bottom'}
                onChange={() => rtlPositionStorage.setPosition('bottom' as PositionType)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#3b82f6' }}
              />
              <span
                style={{
                  fontSize: '14px',
                  color: position === 'bottom' ? '#1e40af' : '#374151',
                  fontWeight: position === 'bottom' ? '600' : '400',
                  userSelect: 'none',
                }}>
                Bottom
              </span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '6px',
                border: position === 'left' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                backgroundColor: position === 'left' ? '#eff6ff' : 'white',
                transition: 'all 0.2s',
              }}>
              <input
                type="radio"
                name="position"
                value="left"
                checked={position === 'left'}
                onChange={() => rtlPositionStorage.setPosition('left' as PositionType)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#3b82f6' }}
              />
              <span
                style={{
                  fontSize: '14px',
                  color: position === 'left' ? '#1e40af' : '#374151',
                  fontWeight: position === 'left' ? '600' : '400',
                  userSelect: 'none',
                }}>
                Left
              </span>
            </label>
          </div>
        </div>

        {/* RTL Toggle */}
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
          <div
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px',
            }}>
            RTL Direction
          </div>

          <button
            onClick={handleToggleRTL}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              backgroundColor: isRTL ? '#10b981' : '#6b7280',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = isRTL ? '#059669' : '#4b5563';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = isRTL ? '#10b981' : '#6b7280';
            }}>
            {isRTL ? 'RTL Enabled ✓' : 'RTL Disabled'}
          </button>

          <p
            style={{
              marginTop: '8px',
              fontSize: '12px',
              color: '#6b7280',
            }}>
            {isRTL ? 'Chat is displayed right-to-left' : 'Chat is displayed left-to-right'}
          </p>
        </div>
      </div>
    </div>
  );
}
