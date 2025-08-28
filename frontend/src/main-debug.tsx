import ReactDOM from 'react-dom/client';

console.log('🚀 Main.tsx is executing...');

const SimpleDebugApp = () => {
  console.log('📝 SimpleDebugApp component is rendering...');
  return (
    <div style={{ 
      padding: '40px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontSize: '24px',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <h1>🎉 HRMS Application is Working!</h1>
      <p>✅ React is successfully rendering</p>
      <p>✅ Main.tsx is executing properly</p>
      <p>✅ Port 5174 is serving the application</p>
      <div style={{ marginTop: '20px', fontSize: '16px' }}>
        <p>👨‍💻 Debug timestamp: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

console.log('🔍 Looking for root element...');
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found, creating React root...');
  const root = ReactDOM.createRoot(rootElement);
  
  console.log('🎨 Rendering SimpleDebugApp...');
  root.render(<SimpleDebugApp />);
  
  console.log('🎯 React app should be rendered now!');
}
