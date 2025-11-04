import { ChatGPTTab } from './ChatGPTTab';
import { ClaudeTab } from './ClaudeTab';
import { useState } from 'react';

type TabType = 'claude' | 'chatgpt';

interface TabContainerProps {
  currentPlatform: 'claude' | 'chatgpt';
  initialTab: TabType;
}

export const TabContainer = ({ currentPlatform, initialTab }: TabContainerProps) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [showTabWarning, setShowTabWarning] = useState(false);

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

  return (
    <>
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
        {activeTab === 'claude' && <ClaudeTab />}
        {activeTab === 'chatgpt' && <ChatGPTTab />}
      </div>
    </>
  );
};
