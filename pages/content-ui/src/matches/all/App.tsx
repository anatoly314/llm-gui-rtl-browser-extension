import {
  useStorage,
  toggleRTL,
  toggleChatInputRTL,
  toggleMainContentRTL,
  toggleChatGPTKatexRTL,
  toggleChatGPTInputRTL,
  initRTLManager,
  getCurrentRTLState,
  getCurrentChatInputRTLState,
  getCurrentMainContentRTLState,
  getCurrentChatGPTKatexRTLState,
  getCurrentChatGPTInputRTLState,
  getCurrentChatId,
  transferNewChatSettings,
  clearNewChatSettings,
} from '@extension/shared';
import { rtlPositionStorage } from '@extension/storage';
import { Toast } from '@extension/ui';
import { useState, useEffect } from 'react';
import type { PositionType } from '@extension/storage';

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
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

type TabType = 'claude' | 'chatgpt';

export default function App() {
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('claude');
  const [isRTL, setIsRTL] = useState(false);
  const [isChatInputRTL, setIsChatInputRTL] = useState(false);
  const [isMainContentRTL, setIsMainContentRTL] = useState(false);
  const [isChatGPTKatexRTL, setIsChatGPTKatexRTL] = useState(false);
  const [isChatGPTInputRTL, setIsChatGPTInputRTL] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [shouldShowPanel, setShouldShowPanel] = useState(false);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<'claude' | 'chatgpt'>('claude');
  const storageData = useStorage(rtlPositionStorage);
  const position = storageData?.position || 'top';

  // Check if panel should be visible (only on /new, /project/, /c/, or when chatId exists)
  const checkPanelVisibility = () => {
    const path = window.location.pathname;
    const hostname = window.location.hostname;
    const chatId = getCurrentChatId();

    // Claude.ai checks
    const isNewPage = path === '/new';
    const isProjectPage = path.startsWith('/project/');
    const hasChatId = !!chatId;

    // ChatGPT checks
    const isChatGPT = hostname === 'chatgpt.com' || hostname === 'chat.openai.com';
    const isChatGPTConversation = isChatGPT && path.startsWith('/c/');

    setShouldShowPanel(isNewPage || isProjectPage || hasChatId || isChatGPTConversation);
  };

  // Auto-select tab based on current website
  const autoSelectTab = () => {
    const hostname = window.location.hostname;
    if (hostname === 'chatgpt.com' || hostname === 'chat.openai.com') {
      setActiveTab('chatgpt');
      setCurrentPlatform('chatgpt');
    } else if (hostname === 'claude.ai') {
      setActiveTab('claude');
      setCurrentPlatform('claude');
    }
  };

  // Initialize RTL manager and load current state
  useEffect(() => {
    const cleanup = initRTLManager();

    // Function to load RTL states for current chat
    const loadRTLStates = () => {
      getCurrentRTLState().then(state => setIsRTL(state));
      getCurrentChatInputRTLState().then(state => setIsChatInputRTL(state));
      getCurrentMainContentRTLState().then(state => setIsMainContentRTL(state));
      getCurrentChatGPTKatexRTLState().then(state => setIsChatGPTKatexRTL(state));
      getCurrentChatGPTInputRTLState().then(state => setIsChatGPTInputRTL(state));
    };

    // Load initial RTL states and check visibility
    const initializeStates = async () => {
      // If starting on /new or /project/* page, clear any previous "new" settings
      const path = window.location.pathname;
      if (path === '/new' || path.startsWith('/project/')) {
        await clearNewChatSettings();
      }
      loadRTLStates();
      checkPanelVisibility();
      autoSelectTab();
    };

    initializeStates();

    // Watch for chat changes and visibility by monitoring URL
    let lastChatId = getCurrentChatId();
    let lastPath = window.location.pathname;
    let lastHostname = window.location.hostname;
    const checkChanges = async () => {
      const currentChatId = getCurrentChatId();
      const currentPath = window.location.pathname;
      const currentHostname = window.location.hostname;

      // Check if chat changed
      if (currentChatId !== lastChatId) {
        // If transitioning from /new or /project/* to a chat with UUID, transfer settings FIRST
        const wasOnNewOrProject = lastPath === '/new' || lastPath.startsWith('/project/');
        if (!lastChatId && currentChatId && wasOnNewOrProject) {
          await transferNewChatSettings(currentChatId);
        }

        lastChatId = currentChatId;
        loadRTLStates();
      }

      // Check if path changed (affects visibility)
      if (currentPath !== lastPath) {
        // If navigating TO /new or /project/* page, clear any previous "new" settings
        const isNewOrProject = currentPath === '/new' || currentPath.startsWith('/project/');
        const wasNotNewOrProject = lastPath !== '/new' && !lastPath.startsWith('/project/');
        if (isNewOrProject && wasNotNewOrProject) {
          await clearNewChatSettings();
          loadRTLStates(); // Reload to show default states
        }

        lastPath = currentPath;
        checkPanelVisibility();
      }

      // Check if hostname changed (affects tab selection)
      if (currentHostname !== lastHostname) {
        lastHostname = currentHostname;
        autoSelectTab();
      }
    };

    // Check for changes every 500ms
    const intervalId = setInterval(checkChanges, 500);

    return () => {
      cleanup();
      clearInterval(intervalId);
    };
  }, []);

  const handleToggleRTL = async () => {
    const newState = await toggleRTL();
    setIsRTL(newState);
  };

  const handleToggleChatInputRTL = async () => {
    const newState = await toggleChatInputRTL();
    setIsChatInputRTL(newState);
  };

  const handleToggleMainContentRTL = async () => {
    const newState = await toggleMainContentRTL();
    setIsMainContentRTL(newState);
  };

  const handleToggleChatGPTKatexRTL = async () => {
    const newState = await toggleChatGPTKatexRTL();
    setIsChatGPTKatexRTL(newState);
  };

  const handleToggleChatGPTInputRTL = async () => {
    const newState = await toggleChatGPTInputRTL();
    setIsChatGPTInputRTL(newState);
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
      padding: '16px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '10px',
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          top: isHovered ? '8px' : '-520px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '450px',
          height: '480px',
          borderRadius: '0 0 12px 12px',
        };
      case 'right':
        return {
          ...baseStyle,
          right: isHovered ? '8px' : '-480px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '450px',
          height: '480px',
          borderRadius: '12px 0 0 12px',
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: isHovered ? '8px' : '-520px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '450px',
          height: '480px',
          borderRadius: '12px 12px 0 0',
        };
      case 'left':
        return {
          ...baseStyle,
          left: isHovered ? '8px' : '-480px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '450px',
          height: '480px',
          borderRadius: '0 12px 12px 0',
        };
      default:
        return baseStyle;
    }
  };

  const handleTabClick = (tab: TabType) => {
    // Check if trying to click the wrong tab for current platform
    if ((currentPlatform === 'claude' && tab === 'chatgpt') || (currentPlatform === 'chatgpt' && tab === 'claude')) {
      setShowTabWarning(true);
      setTimeout(() => setShowTabWarning(false), 2000);
      return;
    }
    setActiveTab(tab);
  };

  const renderTabButton = (tab: TabType, label: string) => {
    const isWrongPlatform =
      (currentPlatform === 'claude' && tab === 'chatgpt') || (currentPlatform === 'chatgpt' && tab === 'claude');

    return (
      <button
        onClick={() => handleTabClick(tab)}
        style={{
          flex: 1,
          padding: '4px 8px',
          border: 'none',
          borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
          backgroundColor: activeTab === tab ? '#eff6ff' : 'transparent',
          color: isWrongPlatform ? '#9ca3af' : activeTab === tab ? '#1e40af' : '#374151',
          fontSize: '12px',
          fontWeight: activeTab === tab ? '600' : '500',
          cursor: isWrongPlatform ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          position: 'relative' as const,
          opacity: isWrongPlatform ? 0.5 : 1,
        }}>
        {label}
      </button>
    );
  };

  const renderPositionControls = () => (
    <div style={{ marginTop: '12px' }}>
      <div
        style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '10px',
        }}>
        Panel Position
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '8px',
          flexWrap: 'wrap',
        }}>
        {(['top', 'right', 'bottom', 'left'] as PositionType[]).map(pos => (
          <label
            key={pos}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '5px',
              border: position === pos ? '2px solid #3b82f6' : '2px solid #e5e7eb',
              backgroundColor: position === pos ? '#eff6ff' : 'white',
              transition: 'all 0.2s',
            }}>
            <input
              type="radio"
              name="position"
              value={pos}
              checked={position === pos}
              onChange={() => rtlPositionStorage.setPosition(pos)}
              style={{ width: '13px', height: '13px', cursor: 'pointer', accentColor: '#3b82f6' }}
            />
            <span
              style={{
                fontSize: '12px',
                color: position === pos ? '#1e40af' : '#374151',
                fontWeight: position === pos ? '600' : '400',
                userSelect: 'none',
                textTransform: 'capitalize',
              }}>
              {pos}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderClaudeContent = () => (
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

  const renderChatGPTContent = () => (
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

  return (
    <>
      {showToast && (
        <Toast
          message="Please start a chat first to apply RTL settings"
          type="warning"
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
      {shouldShowPanel && (
        <div
          style={getContainerStyle()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>
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

            {/* Panel Position Controls (Global) */}
            {renderPositionControls()}

            {/* Tab Warning Notification */}
            {showTabWarning && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fbbf24',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#92400e',
                  fontWeight: '500',
                  animation: 'fadeIn 0.2s ease-in',
                }}>
                This tab is only available on {currentPlatform === 'claude' ? 'ChatGPT' : 'Claude.ai'}
              </div>
            )}

            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #e5e7eb',
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #e5e7eb',
              }}>
              {renderTabButton('claude', 'Claude.ai')}
              {renderTabButton('chatgpt', 'ChatGPT')}
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {activeTab === 'claude' && renderClaudeContent()}
              {activeTab === 'chatgpt' && renderChatGPTContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
