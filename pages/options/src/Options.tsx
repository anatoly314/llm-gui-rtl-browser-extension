import '@src/Options.css';
import { t } from '@extension/i18n';
import { PROJECT_URL_OBJECT, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';

const Options = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const logo = isLight ? 'options/logo_horizontal.svg' : 'options/logo_horizontal_dark.svg';

  const goGithubSite = () => chrome.tabs.create(PROJECT_URL_OBJECT);

  return (
    <div className={cn('App', isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-100')}>
      <button onClick={goGithubSite}>
        <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
      </button>
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
            href="https://github.com/anatolyefimov/llm-gui-rtl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800">
            github.com/anatolyefimov/llm-gui-rtl
          </a>
        </p>
      </div>
      <ToggleButton onClick={exampleThemeStorage.toggle}>{t('toggleTheme')}</ToggleButton>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);
