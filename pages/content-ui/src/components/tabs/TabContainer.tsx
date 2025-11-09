import { ChatGPTTab } from './ChatGPTTab';
import { ClaudeTab } from './ClaudeTab';
import { NotebookLMTab } from './NotebookLMTab';
import { ProviderDropdown } from '@extension/ui';
import { useState } from 'react';

type TabType = 'claude' | 'chatgpt' | 'notebooklm';

interface TabContainerProps {
  currentPlatform: 'claude' | 'chatgpt' | 'notebooklm';
  initialTab: TabType;
}

const PROVIDER_OPTIONS = [
  { value: 'claude', label: 'Claude.ai' },
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'notebooklm', label: 'NotebookLM' },
];

export const TabContainer = ({ currentPlatform, initialTab }: TabContainerProps) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [showPlatformWarning, setShowPlatformWarning] = useState(false);

  const handleProviderChange = (provider: string) => {
    setActiveTab(provider as TabType);
  };

  const handleInvalidSelection = () => {
    setShowPlatformWarning(true);
    setTimeout(() => setShowPlatformWarning(false), 2000);
  };

  return (
    <>
      {/* Platform Warning Notification */}
      {showPlatformWarning && (
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
          This provider is only available on{' '}
          {currentPlatform === 'claude' ? 'Claude.ai' : currentPlatform === 'chatgpt' ? 'ChatGPT' : 'NotebookLM'}
        </div>
      )}

      {/* Provider Dropdown */}
      <ProviderDropdown
        options={PROVIDER_OPTIONS}
        value={activeTab}
        currentPlatform={currentPlatform}
        onChange={handleProviderChange}
        onInvalidSelection={handleInvalidSelection}
      />

      {/* Provider Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'claude' && <ClaudeTab />}
        {activeTab === 'chatgpt' && <ChatGPTTab />}
        {activeTab === 'notebooklm' && <NotebookLMTab />}
      </div>
    </>
  );
};
