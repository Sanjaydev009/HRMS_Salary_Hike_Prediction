import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { leaveAPI } from '../services/api';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';

interface LeaveRequest {
  _id: string;
  employeeId: any;
  leaveType: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: string;
  createdAt: string;
  hrNotes?: string;
  rejectionReason?: string;
  approvedBy?: any;
  approvedDate?: string;
}

const DebugLeaves: React.FC = () => {
  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('DEBUG: User role:', user?.role);
      const response = user?.role === 'employee' ? await leaveAPI.getMyLeaves() : await leaveAPI.getAll();
      console.log('DEBUG: Raw API Response:', response);
      setRawData(response);
    } catch (err) {
      console.error('DEBUG: Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Debug Leave Data
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={fetchData} 
        sx={{ mb: 3 }}
        disabled={loading}
      >
        Refresh Data
      </Button>

      {loading && <CircularProgress />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {rawData && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            User Information
          </Typography>
          <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography><strong>Role:</strong> {user?.role}</Typography>
              <Typography><strong>Name:</strong> {user?.profile?.firstName} {user?.profile?.lastName}</Typography>
              <Typography><strong>ID:</strong> {user?.id}</Typography>
            </CardContent>
          </Card>

          <Typography variant="h6" gutterBottom>
            API Response Structure
          </Typography>
          <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography><strong>Success:</strong> {String(rawData.success)}</Typography>
              <Typography><strong>Message:</strong> {rawData.message}</Typography>
              <Typography><strong>Data keys:</strong> {rawData.data ? Object.keys(rawData.data).join(', ') : 'None'}</Typography>
              <Typography><strong>Leaves count:</strong> {rawData.data?.leaves?.length || 0}</Typography>
            </CardContent>
          </Card>

          {rawData.data?.leaves && rawData.data.leaves.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Leave Records
              </Typography>
              {rawData.data.leaves.map((leave: LeaveRequest, index: number) => (
                <Card key={leave._id} sx={{ mb: 2, bgcolor: leave.hrNotes ? 'success.50' : 'grey.50' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Leave #{index + 1} - {leave.leaveType}
                    </Typography>
                    <Typography><strong>Status:</strong> {leave.status}</Typography>
                    <Typography><strong>Dates:</strong> {leave.startDate} to {leave.endDate}</Typography>
                    <Typography><strong>Duration:</strong> {leave.numberOfDays} days</Typography>
                    <Typography><strong>Reason:</strong> {leave.reason}</Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      HR Notes Debug:
                    </Typography>
                    <Typography><strong>hrNotes field exists:</strong> {String('hrNotes' in leave)}</Typography>
                    <Typography><strong>hrNotes value:</strong> {leave.hrNotes || 'null/undefined'}</Typography>
                    <Typography><strong>hrNotes type:</strong> {typeof leave.hrNotes}</Typography>
                    <Typography><strong>rejectionReason field exists:</strong> {String('rejectionReason' in leave)}</Typography>
                    <Typography><strong>rejectionReason value:</strong> {leave.rejectionReason || 'null/undefined'}</Typography>
                    <Typography><strong>rejectionReason type:</strong> {typeof leave.rejectionReason}</Typography>
                    
                    {(leave.hrNotes || leave.rejectionReason) && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">HR Feedback:</Typography>
                        <Typography>{leave.hrNotes || leave.rejectionReason}</Typography>
                      </Alert>
                    )}
                    
                    {leave.approvedBy && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography><strong>Approved By:</strong> {leave.approvedBy.profile ? `${leave.approvedBy.profile.firstName} ${leave.approvedBy.profile.lastName}` : 'Unknown'}</Typography>
                        <Typography><strong>Approved Date:</strong> {leave.approvedDate || 'Not set'}</Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default DebugLeaves;
