import '@src/Options.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';

const Options = () => {
  const { isLight } = useStorage(exampleThemeStorage);

  return (
    <div
      className={cn(
        'flex min-h-screen items-center justify-center p-8',
        isLight ? 'bg-gradient-to-br from-blue-50 to-indigo-100' : 'bg-gradient-to-br from-gray-900 to-gray-800',
      )}>
      <div
        className={cn(
          'w-full max-w-2xl rounded-2xl p-12 shadow-2xl',
          isLight ? 'bg-white' : 'border border-gray-700 bg-gray-800',
        )}>
        <div className="mb-8 text-center">
          <h1 className={cn('mb-4 text-4xl font-bold', isLight ? 'text-gray-900' : 'text-white')}>
            Claude.ai RTL Support
          </h1>
          <p className={cn('text-lg leading-relaxed', isLight ? 'text-gray-600' : 'text-gray-300')}>
            Chrome extension that adds comprehensive right-to-left text direction support to Claude.ai
          </p>
        </div>

        <div className={cn('my-8 border-b border-t py-8', isLight ? 'border-gray-200' : 'border-gray-700')}>
          <h2 className={cn('mb-6 text-2xl font-semibold', isLight ? 'text-gray-800' : 'text-gray-100')}>Features</h2>
          <ul className={cn('space-y-3 text-base', isLight ? 'text-gray-700' : 'text-gray-300')}>
            <li className="flex items-start">
              <span className="mr-3 text-xl text-blue-500">✓</span>
              <span>Independent RTL controls for chat input, main content, and side panel</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-xl text-blue-500">✓</span>
              <span>Per-chat settings with automatic UUID storage</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-xl text-blue-500">✓</span>
              <span>Configurable panel position (top, right, bottom, left)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-xl text-blue-500">✓</span>
              <span>Modern toggle switches with smooth animations</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4 text-base">
          <div className={cn('flex items-center justify-center gap-2', isLight ? 'text-gray-700' : 'text-gray-300')}>
            <span className="font-semibold">Created by:</span>
            <a
              href="https://anatoly.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 underline transition-colors hover:text-blue-700">
              Anatoly Tarnavsky
            </a>
          </div>
          <div className={cn('flex items-center justify-center gap-2', isLight ? 'text-gray-700' : 'text-gray-300')}>
            <span className="font-semibold">Repository:</span>
            <a
              href="https://github.com/anatoly314/llm-gui-rtl-browser-extension"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 underline transition-colors hover:text-blue-700">
              github.com/anatoly314/llm-gui-rtl-browser-extension
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);
