import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', background: '#FAF6EF', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 24, fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: 480, background: '#fff', border: '1px solid #E8DDC9',
            borderRadius: 12, padding: 28, textAlign: 'center'
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🍳</div>
            <h1 style={{
              fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500,
              margin: '0 0 8px', color: '#2A1F1A'
            }}>
              Something went wrong in the kitchen
            </h1>
            <p style={{ fontSize: 14, color: '#5C4A3A', lineHeight: 1.6, margin: '0 0 18px' }}>
              The app hit an error and couldn't render. Your data is safe — try reloading.
            </p>
            <details style={{ fontSize: 11, color: '#8B6F47', marginBottom: 18, textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', textAlign: 'center' }}>Technical details</summary>
              <pre style={{ marginTop: 8, padding: 10, background: '#FAF6EF', borderRadius: 6, overflowX: 'auto', fontSize: 10 }}>
                {String(this.state.error?.message || this.state.error)}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 24px', background: '#A85C32', color: '#FAF6EF',
                border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer'
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
