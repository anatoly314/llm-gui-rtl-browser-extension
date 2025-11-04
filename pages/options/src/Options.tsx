import '@src/Options.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';

const Options = () => (
  <div
    className={cn('flex min-h-screen items-center justify-center p-8', 'bg-gradient-to-br from-blue-50 to-indigo-100')}>
    <div className={cn('w-full max-w-2xl rounded-2xl p-12 shadow-2xl', 'bg-white')}>
      <div className="mb-8 text-center">
        <h1 className={cn('mb-4 text-4xl font-bold', 'text-gray-900')}>AI Chat RTL Support</h1>
        <p className={cn('text-lg leading-relaxed', 'text-gray-600')}>
          Browser extension that adds comprehensive right-to-left text direction support to AI chat interfaces
        </p>
      </div>

      <div className={cn('my-8 border-b border-t py-8', 'border-gray-200')}>
        <h2 className={cn('mb-6 text-2xl font-semibold', 'text-gray-800')}>Features</h2>
        <ul className={cn('space-y-3 text-base', 'text-gray-700')}>
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
        <div className={cn('flex items-center justify-center gap-2', 'text-gray-700')}>
          <span className="font-semibold">Created by:</span>
          <a
            href="https://anatoly.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 underline transition-colors hover:text-blue-700">
            Anatoly Tarnavsky
          </a>
        </div>
        <div className={cn('flex items-center justify-center gap-2', 'text-gray-700')}>
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

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);
