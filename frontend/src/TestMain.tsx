import ReactDOM from 'react-dom/client';

const SimpleApp = () => {
  return (
    <div style={{ padding: '20px', color: 'red', fontSize: '24px' }}>
      <h1>Simple React Test Working!</h1>
      <p>If you see this, React is working.</p>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
} else {
  console.log('Root element found, creating React root...');
  const root = ReactDOM.createRoot(rootElement);
  root.render(<SimpleApp />);
  console.log('React app rendered!');
}
