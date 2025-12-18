
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Define explicit interfaces for ErrorBoundary props and state
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

// Error Boundary Simples para Produção
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // Fix: Properly initializing state within the constructor with correct typing
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Critical Render Error:", error, errorInfo);
  }

  render() {
    // Fix: access this.state with correct generic typing
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: '#f8fafc',
          color: '#1e293b',
          fontFamily: 'sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Sistema Temporariamente Indisponível</h1>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>Ocorreu um erro ao carregar a interface médica.</p>
          <pre style={{ 
            backgroundColor: '#f1f5f9', 
            padding: '15px', 
            borderRadius: '8px', 
            fontSize: '12px',
            maxWidth: '100%',
            overflow: 'auto'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => {
              localStorage.removeItem('medsearat_db_v1');
              window.location.reload();
            }}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Resetar Sistema e Recarregar
          </button>
        </div>
      );
    }
    // Fix: access this.props with correct generic typing
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
