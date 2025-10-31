import '@src/Popup.css';
import { PROJECT_URL_OBJECT, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';

const Popup = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const logo = isLight ? 'popup/logo_vertical.svg' : 'popup/logo_vertical_dark.svg';

  const goGithubSite = () => chrome.tabs.create(PROJECT_URL_OBJECT);

  return (
    <div className={cn('App', isLight ? 'bg-slate-50' : 'bg-gray-800')}>
      <header className={cn('App-header', isLight ? 'text-gray-900' : 'text-gray-100')}>
        <button onClick={goGithubSite}>
          <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
        </button>
        <h2 className="mb-2 text-xl font-bold">Claude.ai RTL Support</h2>
        <p className="mb-4 max-w-md text-center text-sm">
          Add right-to-left text direction support to Claude.ai with independent toggles for chat input, main content,
          and side panel.
        </p>
        <div className="mb-2 space-y-1 text-xs">
          <p>
            <strong>Features:</strong>
          </p>
          <ul className="list-inside list-disc text-left">
            <li>Per-chat RTL settings with UUID storage</li>
            <li>Configurable panel position (top/right/bottom/left)</li>
            <li>Works on /new page and in active chats</li>
            <li>Modern toggle switches with smooth animations</li>
          </ul>
        </div>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
