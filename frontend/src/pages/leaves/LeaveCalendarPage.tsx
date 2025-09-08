import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import LeaveCalendar from '../../components/leaves/ProfessionalLeaveCalendar';

const LeaveCalendarPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Leave Management Calendar
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Interactive calendar view for managing team leaves and availability
        </Typography>
      </Box>
      
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <LeaveCalendar />
      </Paper>
    </Container>
  );
};

export default LeaveCalendarPage;
