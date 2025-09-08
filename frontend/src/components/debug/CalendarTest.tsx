import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';

const CalendarTest: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const testAPI = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🔍 Testing calendar API...');
      
      // Test 1: Basic API connectivity
      const testResponse = await fetch('/api/calendar/test');
      console.log('✅ Test endpoint:', testResponse.status);
      
      // Test 2: Events endpoint
      const eventsResponse = await fetch('/api/calendar/events?month=9&year=2025');
      console.log('✅ Events endpoint:', eventsResponse.status);
      
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        console.log('📊 Events data:', eventsData);
        setData(eventsData);
      } else {
        setError(`API Error: ${eventsResponse.status} ${eventsResponse.statusText}`);
      }
    } catch (err) {
      console.error('💥 API Test failed:', err);
      setError(`Network Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🔧 Calendar API Test Page
      </Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">API Test Results:</Typography>
        
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <CircularProgress size={20} />
            <Typography>Testing API...</Typography>
          </Box>
        )}
        
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            ❌ Error: {error}
          </Typography>
        )}
        
        {data && (
          <Box sx={{ mt: 2 }}>
            <Typography color="success.main">
              ✅ API Working! Found {data.events?.length || 0} events
            </Typography>
            <Button 
              variant="contained" 
              onClick={testAPI} 
              sx={{ mt: 1 }}
            >
              🔄 Test Again
            </Button>
            
            <Box sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
              <Typography variant="subtitle2">Raw Data:</Typography>
              <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '10px' }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            </Box>
          </Box>
        )}
      </Paper>
      
      <Typography variant="body2" color="text.secondary">
        This page tests if the calendar API is working without authentication.
      </Typography>
    </Box>
  );
};

export default CalendarTest;
