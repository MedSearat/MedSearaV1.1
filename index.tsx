
import React, { ReactNode, ErrorInfo, Component } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

/**
 * Fixed ErrorBoundary: Using explicit inheritance and class property declarations
 * to ensure that 'state' and 'props' are correctly recognized by the TypeScript compiler.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Explicitly declare state and props for maximum compatibility with TypeScript
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("Critical Render Error:", error, errorInfo);
  }

  render() {
    // Accessing 'state' and 'props' inherited from Component
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-5 text-center font-sans">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 max-w-lg">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Sistema Indisponível</h1>
            <p className="text-slate-500 mb-6">Ocorreu um erro inesperado na interface médica. Tente recarregar o sistema.</p>
            <pre className="bg-slate-100 p-4 rounded-xl text-[10px] text-slate-600 overflow-auto mb-6 text-left max-h-40">
              {this.state.error?.toString()}
            </pre>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
            >
              Reiniciar Sistema
            </button>
          </div>
        </div>
      );
    }
    
    // Explicitly return children from props
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
