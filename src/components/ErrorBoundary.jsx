import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', fontFamily: 'sans-serif', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: '#0F172A', marginBottom: '1rem', fontSize: '1.75rem', fontWeight: 800 }}>Something went wrong.</h2>
          <p style={{ color: '#64748B', marginBottom: '1.5rem', maxWidth: '450px' }}>An unexpected error occurred while loading this page. Click below to refresh.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              background: '#5CB349', 
              color: '#fff', 
              border: 'none', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '8px', 
              fontWeight: 700, 
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(92, 179, 73, 0.3)'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
