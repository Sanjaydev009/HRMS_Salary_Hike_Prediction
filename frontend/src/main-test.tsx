import React from 'react';
import ReactDOM from 'react-dom/client';

const SimpleTest = () => {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🚀 HRMS Application Test
      </h1>
      <p style={{ fontSize: '18px', color: '#666', textAlign: 'center' }}>
        If you can see this message, React is working correctly!
      </p>
      <button 
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
        onClick={() => {
          window.location.href = '/login';
        }}
      >
        Go to Login Page
      </button>
    </div>
  );
};

// Replace the main app temporarily
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SimpleTest />
  </React.StrictMode>
);
