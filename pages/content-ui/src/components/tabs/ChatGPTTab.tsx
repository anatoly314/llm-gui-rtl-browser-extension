import {
  getCurrentChatGPTKatexRTLState,
  getCurrentChatGPTInputRTLState,
  toggleChatGPTKatexRTL,
  toggleChatGPTInputRTL,
} from '@extension/shared';
import { chatgptChatStorage } from '@extension/storage';
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

export const ChatGPTTab = () => {
  const [isChatGPTKatexRTL, setIsChatGPTKatexRTL] = useState(false);
  const [isChatGPTInputRTL, setIsChatGPTInputRTL] = useState(false);

  // Load initial states
  useEffect(() => {
    const loadStates = async () => {
      const katex = await getCurrentChatGPTKatexRTLState();
      const input = await getCurrentChatGPTInputRTLState();

      setIsChatGPTKatexRTL(katex);
      setIsChatGPTInputRTL(input);
    };

    loadStates();

    // Subscribe to storage changes
    const unsubscribe = chatgptChatStorage.subscribe(async () => {
      loadStates();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggleChatGPTKatexRTL = async () => {
    const newState = await toggleChatGPTKatexRTL();
    setIsChatGPTKatexRTL(newState);
  };

  const handleToggleChatGPTInputRTL = async () => {
    const newState = await toggleChatGPTInputRTL();
    setIsChatGPTInputRTL(newState);
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

        <ToggleSwitch checked={isChatGPTInputRTL} onChange={handleToggleChatGPTInputRTL} label="Enable RTL" />

        <p
          style={{
            marginTop: '6px',
            fontSize: '12px',
            color: '#6b7280',
          }}>
          {isChatGPTInputRTL ? 'Chat input is displayed right-to-left' : 'Chat input is displayed left-to-right'}
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

        <ToggleSwitch checked={isChatGPTKatexRTL} onChange={handleToggleChatGPTKatexRTL} label="Enable Fix" />

        <p
          style={{
            marginTop: '6px',
            fontSize: '12px',
            color: '#6b7280',
          }}>
          {isChatGPTKatexRTL
            ? 'Math expressions are forced to display left-to-right (fixes RTL issues)'
            : 'Math expressions follow page direction (may break in RTL responses)'}
        </p>
      </div>
    </>
  );
};
