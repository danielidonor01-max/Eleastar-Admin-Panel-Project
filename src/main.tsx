import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import './index.css';
import './App.css';

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
            <>
                <Toaster richColors position="top-right" />
                <App />
                </>
        );
    } catch (err: unknown) {
        const error = err as { message?: string; stack?: string };
        console.error('FAILED TO START APP:', error);
        const root = createRoot(rootElement);
        root.render(
            <div style={{ padding: '2rem', color: 'red', fontFamily: 'monospace' }}>
                <h2>Application Failed to Start</h2>
                <pre style={{ background: '#333', color: '#fdd', padding: '1rem', overflow: 'auto' }}>
                    {error?.message || String(err)}
                    {'\n\n'}
                    {error?.stack}
                </pre>
            </div>
        );
    }
}

bootstrap();
