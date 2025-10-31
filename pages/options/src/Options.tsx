import '@src/Options.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';

const Options = () => {
  const { isLight } = useStorage(exampleThemeStorage);

  return (
    <div className={cn('App', isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-100')}>
      <h2 className="mb-2 text-xl font-bold">Claude.ai RTL Support</h2>
      <p className="mb-4 max-w-md text-center text-sm">
        Chrome extension that adds right-to-left text direction support to Claude.ai
      </p>
      <div className="mb-4 space-y-2 text-xs">
        <p>
          <strong>Created by:</strong>{' '}
          <a
            href="https://anatoly.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800">
            Anatoly Tarnavsky
          </a>
        </p>
        <p>
          <strong>Repository:</strong>{' '}
          <a
            href="https://github.com/anatoly314/llm-gui-rtl-browser-extension"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800">
            github.com/anatoly314/llm-gui-rtl-browser-extension
          </a>
        </p>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);
