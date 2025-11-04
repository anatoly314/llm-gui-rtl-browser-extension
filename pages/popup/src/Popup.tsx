import '@src/Popup.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';

const Popup = () => {
  const manifest = chrome.runtime.getManifest();
  const version = manifest.version;

  return (
    <div className={cn('App', 'bg-slate-50')}>
      <header className={cn('App-header', 'text-gray-900')}>
        <h2 className="mb-1 text-xl font-bold">AI Chat RTL Support</h2>
        <p className="mb-3 text-xs text-gray-600">Currently supports Claude.ai • More AI platforms coming soon</p>
        <p className="mb-4 max-w-md text-center text-sm">
          Comprehensive right-to-left text direction support with independent controls for chat input, main content, and
          side panel.
        </p>
        <div className="mb-2 space-y-1 text-xs">
          <p>
            <strong>Features:</strong>
          </p>
          <ul className="list-inside list-disc text-left">
            <li>Per-chat RTL settings with automatic storage</li>
            <li>KaTeX mathematical expressions preserved in LTR</li>
            <li>Configurable panel position (top/right/bottom/left)</li>
            <li>Works on /new, /project, and active chats</li>
            <li>Modern toggle switches with smooth animations</li>
          </ul>
        </div>
        <p className="mt-auto pt-2 text-xs text-gray-400">v{version}</p>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
