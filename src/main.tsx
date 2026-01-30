import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Dynamic import to catch load-time errors
async function bootstrap() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Fatal: Root element not found');
    return;
  }

  try {
    const { default: App } = await import('./App.tsx');
    const root = createRoot(rootElement);

    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );

  } catch (err: any) {
    console.error('FAILED TO START APP:', err);

    // Fallback UI to show the error on screen
    const root = createRoot(rootElement);
    root.render(
      <div style={{ padding: '2rem', color: 'red', fontFamily: 'monospace' }}>
        <h2>Application Failed to Start</h2>
        <pre style={{ background: '#333', color: '#fdd', padding: '1rem', overflow: 'auto' }}>
          {err?.message || String(err)}
          {'\n\n'}
          {err?.stack}
        </pre>
      </div>
    );
  }
}

bootstrap();
