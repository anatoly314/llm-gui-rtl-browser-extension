import {
  getCurrentClaudeRTLState,
  getCurrentClaudeChatInputRTLState,
  getCurrentClaudeMainContentRTLState,
  toggleClaudeRTL,
  toggleClaudeChatInputRTL,
  toggleClaudeMainContentRTL,
} from '@extension/shared';
import { claudeChatStorage } from '@extension/storage';
import { useState, useEffect } from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

const ToggleSwitch = ({ checked, onChange, label }: ToggleSwitchProps) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <span style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>{label}</span>
    <button
      onClick={onChange}
      style={{
        position: 'relative',
        width: '36px',
        height: '18px',
        backgroundColor: checked ? '#10b981' : '#d1d5db',
        borderRadius: '9px',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        padding: 0,
      }}
      aria-checked={checked}
      role="switch">
      <div
        style={{
          position: 'absolute',
          top: '1px',
          left: checked ? '19px' : '1px',
          width: '16px',
          height: '16px',
          backgroundColor: 'white',
          borderRadius: '50%',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
        }}
      />
    </button>
  </div>
);

export const ClaudeTab = () => {
  const [isRTL, setIsRTL] = useState(false);
  const [isChatInputRTL, setIsChatInputRTL] = useState(false);
  const [isMainContentRTL, setIsMainContentRTL] = useState(false);

  // Load initial states
  useEffect(() => {
    const loadStates = async () => {
      const rtl = await getCurrentClaudeRTLState();
      const chatInput = await getCurrentClaudeChatInputRTLState();
      const mainContent = await getCurrentClaudeMainContentRTLState();

      setIsRTL(rtl);
      setIsChatInputRTL(chatInput);
      setIsMainContentRTL(mainContent);
    };

    loadStates();

    // Subscribe to storage changes
    const unsubscribe = claudeChatStorage.subscribe(async () => {
      loadStates();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggleRTL = async () => {
    const newState = await toggleClaudeRTL();
    setIsRTL(newState);
  };

  const handleToggleChatInputRTL = async () => {
    const newState = await toggleClaudeChatInputRTL();
    setIsChatInputRTL(newState);
  };

  const handleToggleMainContentRTL = async () => {
    const newState = await toggleClaudeMainContentRTL();
    setIsMainContentRTL(newState);
  };

  return (
    <>
      {/* Chat Input RTL Toggle */}
      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
        <div
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '10px',
          }}>
          Chat Input Direction
        </div>

        <ToggleSwitch checked={isChatInputRTL} onChange={handleToggleChatInputRTL} label="Enable RTL" />

        <p
          style={{
            marginTop: '6px',
            fontSize: '12px',
            color: '#6b7280',
          }}>
          {isChatInputRTL ? 'Chat input is displayed right-to-left' : 'Chat input is displayed left-to-right'}
        </p>
      </div>

      {/* Main Content RTL Toggle */}
      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
        <div
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '10px',
          }}>
          Main Content Direction
        </div>

        <ToggleSwitch checked={isMainContentRTL} onChange={handleToggleMainContentRTL} label="Enable RTL" />

        <p
          style={{
            marginTop: '6px',
            fontSize: '12px',
            color: '#6b7280',
          }}>
          {isMainContentRTL ? 'Main content is displayed right-to-left' : 'Main content is displayed left-to-right'}
        </p>
      </div>

      {/* Side Panel RTL Toggle */}
      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
        <div
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '10px',
          }}>
          Side Panel Direction
        </div>

        <ToggleSwitch checked={isRTL} onChange={handleToggleRTL} label="Enable RTL" />

        <p
          style={{
            marginTop: '6px',
            fontSize: '12px',
            color: '#6b7280',
          }}>
          {isRTL ? 'Side panel is displayed right-to-left' : 'Side panel is displayed left-to-right'}
        </p>
      </div>
    </>
  );
};
