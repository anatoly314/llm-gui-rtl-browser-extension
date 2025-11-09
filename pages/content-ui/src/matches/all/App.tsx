import { TabContainer } from '../../components/tabs';
import {
  useStorage,
  initRTLManager,
  getCurrentChatId,
  transferNewChatSettings,
  clearNewChatSettings,
  reapplyChatGPTStyles,
} from '@extension/shared';
import { rtlPositionStorage, migrateStorage } from '@extension/storage';
import { Toast } from '@extension/ui';
import { useState, useEffect } from 'react';
import type { PositionType } from '@extension/storage';

type TabType = 'claude' | 'chatgpt' | 'notebooklm';

export default function App() {
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('claude');
  const [showToast, setShowToast] = useState(false);
  const [shouldShowPanel, setShouldShowPanel] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<'claude' | 'chatgpt' | 'notebooklm'>('claude');
  const storageData = useStorage(rtlPositionStorage);
  const position = storageData?.position || 'top';

  // Check if panel should be visible (only on /new, /project/, /c/, /notebook/, or when chatId exists)
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
    const isChatGPTHome = isChatGPT && path === '/';

    // NotebookLM checks
    const isNotebookLM = hostname === 'notebooklm.google.com';
    const isNotebookLMNotebook = isNotebookLM && path.startsWith('/notebook/');

    setShouldShowPanel(
      isNewPage || isProjectPage || hasChatId || isChatGPTConversation || isChatGPTHome || isNotebookLMNotebook,
    );
  };

  // Auto-select tab based on current website
  const autoSelectTab = () => {
    const hostname = window.location.hostname;
    if (hostname === 'chatgpt.com' || hostname === 'chat.openai.com') {
      setActiveTab('chatgpt');
      setCurrentPlatform('chatgpt');
    } else if (hostname === 'notebooklm.google.com') {
      setActiveTab('notebooklm');
      setCurrentPlatform('notebooklm');
    } else if (hostname === 'claude.ai') {
      setActiveTab('claude');
      setCurrentPlatform('claude');
    }
  };

  // Initialize RTL manager and handle chat changes
  useEffect(() => {
    // Run migration first (one-time, idempotent)
    migrateStorage().catch(error => {
      console.error('[App] Migration failed:', error);
    });

    const cleanup = initRTLManager();

    // Initialize states - if starting on /new, /project/*, or ChatGPT home page, clear any previous "new" settings
    const initializeStates = async () => {
      const path = window.location.pathname;
      const hostname = window.location.hostname;
      const isChatGPTHome = (hostname === 'chatgpt.com' || hostname === 'chat.openai.com') && path === '/';

      if (path === '/new' || path.startsWith('/project/') || isChatGPTHome) {
        await clearNewChatSettings();
      }
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
        // If transitioning from /new, /project/*, or ChatGPT home to a chat with UUID, transfer settings FIRST
        const wasOnNewOrProject = lastPath === '/new' || lastPath.startsWith('/project/');
        const wasOnChatGPTHome =
          (lastHostname === 'chatgpt.com' || lastHostname === 'chat.openai.com') && lastPath === '/';

        if (!lastChatId && currentChatId && (wasOnNewOrProject || wasOnChatGPTHome)) {
          await transferNewChatSettings(currentChatId);

          // Immediately reapply styles after transfer (fixes race condition with RTL Manager)
          await reapplyChatGPTStyles();
        }

        lastChatId = currentChatId;
      }

      // Check if path changed (affects visibility)
      if (currentPath !== lastPath) {
        // If navigating TO /new, /project/*, or ChatGPT home page, clear any previous "new" settings
        const isNewOrProject = currentPath === '/new' || currentPath.startsWith('/project/');
        const isChatGPTHome =
          (currentHostname === 'chatgpt.com' || currentHostname === 'chat.openai.com') && currentPath === '/';
        const wasNotNewOrProjectOrHome =
          lastPath !== '/new' &&
          !lastPath.startsWith('/project/') &&
          !(lastHostname === 'chatgpt.com' || lastHostname === 'chat.openai.com' ? lastPath === '/' : false);

        if ((isNewOrProject || isChatGPTHome) && wasNotNewOrProjectOrHome) {
          await clearNewChatSettings();
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

            {/* Tab Container handles all tab logic and content */}
            <TabContainer currentPlatform={currentPlatform} initialTab={activeTab} />
          </div>
        </div>
      )}
    </>
  );
}
