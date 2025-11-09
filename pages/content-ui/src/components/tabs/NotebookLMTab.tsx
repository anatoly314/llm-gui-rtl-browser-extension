import {
  getCurrentNotebookLMKatexRTLState,
  getCurrentNotebookLMChatPanelRTLState,
  toggleNotebookLMKatexRTL,
  toggleNotebookLMChatPanelRTL,
} from '@extension/shared';
import { notebooklmChatStorage } from '@extension/storage';
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

export const NotebookLMTab = () => {
  const [isKatexRTL, setIsKatexRTL] = useState(false);
  const [isChatPanelRTL, setIsChatPanelRTL] = useState(false);

  // Load initial states
  useEffect(() => {
    const loadStates = async () => {
      const katex = await getCurrentNotebookLMKatexRTLState();
      const chatPanel = await getCurrentNotebookLMChatPanelRTLState();

      setIsKatexRTL(katex);
      setIsChatPanelRTL(chatPanel);
    };

    loadStates();

    // Subscribe to storage changes
    const unsubscribe = notebooklmChatStorage.subscribe(async () => {
      loadStates();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggleKatexRTL = async () => {
    const newState = await toggleNotebookLMKatexRTL();
    setIsKatexRTL(newState);
  };

  const handleToggleChatPanelRTL = async () => {
    const newState = await toggleNotebookLMChatPanelRTL();
    setIsChatPanelRTL(newState);
  };

  return (
    <>
      {/* Chat Panel RTL Toggle */}
      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
        <div
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '10px',
          }}>
          Chat Panel Direction
        </div>

        <ToggleSwitch checked={isChatPanelRTL} onChange={handleToggleChatPanelRTL} label="Enable RTL" />

        <p
          style={{
            marginTop: '6px',
            fontSize: '12px',
            color: '#6b7280',
          }}>
          {isChatPanelRTL ? 'Chat panel is displayed right-to-left' : 'Chat panel is displayed left-to-right'}
        </p>
      </div>

      {/* KaTeX RTL Toggle */}
      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
        <div
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '10px',
          }}>
          Fix KaTeX Math Expressions
        </div>

        <ToggleSwitch checked={isKatexRTL} onChange={handleToggleKatexRTL} label="Enable Fix" />

        <p
          style={{
            marginTop: '6px',
            fontSize: '12px',
            color: '#6b7280',
          }}>
          {isKatexRTL
            ? 'Math expressions are forced to display left-to-right (fixes RTL issues)'
            : 'Math expressions follow page direction (may break in RTL responses)'}
        </p>
      </div>
    </>
  );
};
