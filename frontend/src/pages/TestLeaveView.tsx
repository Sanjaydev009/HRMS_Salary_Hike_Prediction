import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../services/api';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Divider,
  Grid,
  Chip,
} from '@mui/material';
import dayjs from 'dayjs';
import LeaveRequestForm from '../components/leaves/LeaveRequestForm';

const TestLeaveView: React.FC = () => {
  const [leaveData, setLeaveData] = useState<any>(null);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [formOpen, setFormOpen] = useState(false);

  const fetchEmployeeLeaves = async () => {
    try {
      console.log('Fetching employee leaves...');
      const response = await leaveAPI.getMyLeaves();
      console.log('Employee leaves response:', response);
      setLeaveData(response);
    } catch (error) {
      console.error('Error fetching employee leaves:', error);
    }
  };

  const testLeaveView = (leave: any) => {
    console.log('Selected leave for view:', leave);
    
    // Transform the leave to match the LeaveRequestForm interface
    const transformedLeave = {
      id: leave._id,
      employeeId: leave.employeeId?._id || leave.employeeId,
      employeeName: leave.employeeId?.profile 
        ? `${leave.employeeId.profile.firstName} ${leave.employeeId.profile.lastName}`
        : 'Test Employee',
      leaveType: leave.leaveType,
      startDate: dayjs(leave.startDate),
      endDate: dayjs(leave.endDate),
      duration: leave.numberOfDays,
      reason: leave.reason,
      status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1),
      appliedDate: dayjs(leave.appliedDate || leave.createdAt),
      approvedBy: leave.approvedBy ? `${leave.approvedBy.profile.firstName} ${leave.approvedBy.profile.lastName}` : undefined,
      approvedDate: leave.approvedDate ? dayjs(leave.approvedDate) : undefined,
      comments: leave.rejectionReason || leave.comments,
      hrNotes: leave.hrNotes,
      rejectionReason: leave.rejectionReason,
    };

    console.log('Transformed leave for LeaveRequestForm:', transformedLeave);
    console.log('hrNotes in transformed leave:', transformedLeave.hrNotes);
    console.log('rejectionReason in transformed leave:', transformedLeave.rejectionReason);
    console.log('Status in transformed leave:', transformedLeave.status);

    setSelectedLeave(transformedLeave);
    setFormOpen(true);
  };

  useEffect(() => {
    fetchEmployeeLeaves();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Test Leave View (Employee Perspective)
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={fetchEmployeeLeaves} 
        sx={{ mb: 3 }}
      >
        Refresh Employee Leaves
      </Button>

      {leaveData && leaveData.data && leaveData.data.leaves && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Employee Leaves ({leaveData.data.leaves.length})
          </Typography>
          
          {leaveData.data.leaves.map((leave: any) => (
            <Card key={leave._id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6">{leave.leaveType}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dayjs(leave.startDate).format('MMM DD, YYYY')} - {dayjs(leave.endDate).format('MMM DD, YYYY')}
                    </Typography>
                    <Typography variant="body2">
                      {leave.numberOfDays} days
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={3}>
                    <Chip
                      label={leave.status}
                      color={
                        leave.status === 'approved' ? 'success' :
                        leave.status === 'rejected' ? 'error' :
                        leave.status === 'pending' ? 'warning' : 'default'
                      }
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={3}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => testLeaveView(leave)}
                    >
                      Test View
                    </Button>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" color="primary">
                  Raw Data Check:
                </Typography>
                <Typography variant="body2">
                  <strong>hrNotes:</strong> "{leave.hrNotes || 'null/undefined'}" (type: {typeof leave.hrNotes})
                </Typography>
                <Typography variant="body2">
                  <strong>rejectionReason:</strong> "{leave.rejectionReason || 'null/undefined'}" (type: {typeof leave.rejectionReason})
                </Typography>
                <Typography variant="body2">
                  <strong>status:</strong> "{leave.status}" (type: {typeof leave.status})
                </Typography>
                
                {(leave.hrNotes || leave.rejectionReason) && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <strong>Should show HR Notes:</strong> {leave.hrNotes || leave.rejectionReason}
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Test Leave Request Form */}
      <LeaveRequestForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedLeave(null);
        }}
        onSave={() => {}} // No-op for testing
        request={selectedLeave}
        mode="view"
        leaveBalances={[]}
      />
    </Box>
  );
};

export default TestLeaveView;
