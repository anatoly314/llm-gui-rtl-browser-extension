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
        <p className="mb-4 max-w-md text-center text-sm">
          Comprehensive right-to-left text direction support with independent controls for chat input, main content,
          side panel, and chat panels across multiple AI platforms.
        </p>
        <div className="mb-2 space-y-1 text-xs">
          <p>
            <strong>Features:</strong>
          </p>
          <ul className="list-inside list-disc text-left">
            <li>Per-chat/notebook RTL settings with automatic storage</li>
            <li>KaTeX mathematical expressions preserved in LTR</li>
            <li>Configurable panel position (top/right/bottom/left)</li>
            <li>Provider dropdown with platform detection</li>
            <li>Modern toggle switches with smooth animations</li>
            <li>
              <strong>Supports</strong>:
              <ul className="ml-4 list-inside list-disc">
                <li>Claude.ai</li>
                <li>ChatGPT</li>
                <li>NotebookLM</li>
              </ul>
            </li>
          </ul>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs">
          <a
            href="https://github.com/anatoly314/llm-gui-rtl-browser-extension"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline">
            GitHub
          </a>
          <span className="text-gray-300">•</span>
          <a
            href="https://anatoly.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline">
            Made by Anatoly
          </a>
        </div>
        <p className="mt-2 pt-2 text-xs text-gray-400">v{version}</p>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
