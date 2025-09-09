import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Grid,
  Chip,
  Divider,
  Box,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Person,
  CalendarToday,
  Schedule,
  Description,
} from '@mui/icons-material';
import { leaveAPI } from '../../services/api';

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: any; // Dayjs object
  endDate: any; // Dayjs object
  duration: number;
  reason: string;
  status: string;
  appliedDate: any; // Dayjs object
  approvedBy?: string;
  approvedDate?: any;
  comments?: string;
  hrNotes?: string;
  rejectionReason?: string;
}

interface HRLeaveApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  leave: LeaveRequest | null;
  onSuccess: () => void;
}

const HRLeaveApprovalDialog: React.FC<HRLeaveApprovalDialogProps> = ({
  open,
  onClose,
  leave,
  onSuccess,
}) => {
  const [decision, setDecision] = useState<'approved' | 'rejected' | ''>('');
  const [hrNotes, setHrNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!leave || !decision) return;

    if (decision === 'rejected' && !hrNotes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const approvalData: any = {
        status: decision,
        hrNotes: hrNotes.trim(),
      };
      
      if (decision === 'rejected') {
        approvalData.rejectionReason = hrNotes.trim();
      }

      await leaveAPI.approve(leave.id, approvalData);

      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Error processing leave:', err);
      setError(err instanceof Error ? err.message : 'Failed to process leave request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDecision('');
    setHrNotes('');
    setError(null);
    onClose();
  };

  if (!leave) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const isProcessed = leave.status.toLowerCase() !== 'pending';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Person color="primary" />
          <div>
            <Typography variant="h6">Leave Request Review</Typography>
            <Typography variant="body2" color="text.secondary">
              Review and provide feedback for this leave request
            </Typography>
          </div>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Employee Information */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Person fontSize="small" />
              <Typography variant="subtitle2">Employee Details</Typography>
            </Box>
            <Typography variant="body1" fontWeight="medium">{leave.employeeName}</Typography>
            <Typography variant="body2" color="text.secondary">Employee ID: {leave.employeeId}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CalendarToday fontSize="small" />
              <Typography variant="subtitle2">Current Status</Typography>
            </Box>
            <Chip
              label={leave.status}
              color={getStatusColor(leave.status) as any}
              size="small"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Applied on {leave.appliedDate.format('MMM DD, YYYY')}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Leave Details */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>Leave Type</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{leave.leaveType}</Typography>
            
            <Typography variant="subtitle2" gutterBottom>Duration</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule fontSize="small" />
              <Typography variant="body1">{leave.duration} days</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>Leave Period</Typography>
            <Typography variant="body1">
              {leave.startDate.format('MMM DD, YYYY')} - {leave.endDate.format('MMM DD, YYYY')}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Description fontSize="small" />
              <Typography variant="subtitle2">Employee's Reason</Typography>
            </Box>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 1, 
              border: '1px solid', 
              borderColor: 'grey.200' 
            }}>
              <Typography variant="body2">{leave.reason}</Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Show existing HR notes if already processed */}
        {isProcessed && (leave.hrNotes || leave.rejectionReason) && (
          <>
            <Typography variant="subtitle2" gutterBottom>Previous HR Notes</Typography>
            <Box sx={{ 
              p: 2, 
              bgcolor: leave.status.toLowerCase() === 'approved' ? 'success.50' : 'error.50', 
              borderRadius: 1, 
              border: '1px solid', 
              borderColor: leave.status.toLowerCase() === 'approved' ? 'success.200' : 'error.200',
              mb: 3
            }}>
              <Typography variant="body2">
                {leave.hrNotes || leave.rejectionReason}
              </Typography>
              {leave.approvedBy && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  By: {leave.approvedBy} on {leave.approvedDate?.format('MMM DD, YYYY')}
                </Typography>
              )}
            </Box>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Decision Section - Only show if still pending */}
        {!isProcessed && (
          <>
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">
                <Typography variant="subtitle2">Decision</Typography>
              </FormLabel>
              <RadioGroup
                row
                value={decision}
                onChange={(e) => setDecision(e.target.value as 'approved' | 'rejected')}
                sx={{ mt: 1 }}
              >
                <FormControlLabel 
                  value="approved" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle color="success" fontSize="small" />
                      <span>Approve</span>
                    </Box>
                  }
                />
                <FormControlLabel 
                  value="rejected" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Cancel color="error" fontSize="small" />
                      <span>Reject</span>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>

            {/* HR Notes Section */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label={
                decision === 'approved' 
                  ? "HR Notes (Optional)" 
                  : decision === 'rejected' 
                    ? "Reason for Rejection (Required)" 
                    : "HR Notes"
              }
              placeholder={
                decision === 'approved' 
                  ? "Add any notes or conditions for approval..."
                  : decision === 'rejected' 
                    ? "Please explain why this request is being rejected..."
                    : "Select a decision first to add notes..."
              }
              value={hrNotes}
              onChange={(e) => setHrNotes(e.target.value)}
              disabled={!decision}
              required={decision === 'rejected'}
              error={decision === 'rejected' && !hrNotes.trim()}
              helperText={
                decision === 'approved' 
                  ? "Optional notes that will be visible to the employee"
                  : decision === 'rejected' 
                    ? "Required - This reason will be shown to the employee"
                    : "Select approve or reject to add notes"
              }
              inputProps={{ maxLength: 1000 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {hrNotes.length}/1000 characters
            </Typography>
          </>
        )}

        {/* View-only mode for processed requests */}
        {isProcessed && (
          <Alert severity="info">
            This leave request has already been {leave.status.toLowerCase()}. 
            {leave.approvedBy && ` Processed by ${leave.approvedBy} on ${leave.approvedDate?.format('MMM DD, YYYY')}.`}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          {isProcessed ? 'Close' : 'Cancel'}
        </Button>
        
        {!isProcessed && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!decision || loading || (decision === 'rejected' && !hrNotes.trim())}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Processing...' : 'Submit Decision'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default HRLeaveApprovalDialog;
