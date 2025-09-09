import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Avatar
} from '@mui/material';
import {
  Receipt,
  Person,
  CalendarToday,
  AccountBalance,
  Print,
  Download,
  CheckCircle,
  Schedule,
  Cancel
} from '@mui/icons-material';
import dayjs from 'dayjs';

// Utility function to format currency in INR
const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

interface PayslipData {
  _id: string;
  employeeId: {
    employeeId: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    jobDetails: {
      department: string;
      position: string;
    };
  };
  payPeriod: {
    month: number;
    year: number;
  };
  basicSalary: number;
  allowances: {
    housing: number;
    transport: number;
    medical: number;
    other: number;
  };
  deductions: {
    tax: number;
    insurance: number;
    providentFund: number;
    other: number;
  };
  overtime: {
    hours: number;
    rate: number;
  };
  totalAllowances: number;
  totalDeductions: number;
  overtimePay: number;
  grossSalary: number;
  netSalary: number;
  paymentDetails: {
    status: string;
    method: string;
    transactionId?: string;
  };
  processedDate: string;
  paidDate?: string;
}

interface PayslipViewerProps {
  open: boolean;
  onClose: () => void;
  payrollId?: string;
  employeeId?: string;
  payPeriod?: { month: number; year: number };
}

const RealTimePayslipViewer: React.FC<PayslipViewerProps> = ({
  open,
  onClose,
  payrollId,
  employeeId,
  payPeriod
}) => {
  const [payslip, setPayslip] = useState<PayslipData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch payslip data
  const fetchPayslip = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = '/api/payroll';
      
      if (payrollId) {
        url += `/${payrollId}`;
      } else if (employeeId && payPeriod) {
        url += `?employeeId=${employeeId}&month=${payPeriod.month}&year=${payPeriod.year}`;
      } else {
        throw new Error('Either payrollId or employeeId with payPeriod is required');
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payslip data');
      }

      const data = await response.json();
      if (data.success) {
        // Handle different response structures
        let payslipData;
        if (payrollId) {
          // Individual record: data.data.payroll
          payslipData = data.data?.payroll || data.data;
        } else {
          // Array response: data.data.payrollRecords
          const records = data.data?.payrollRecords || data.data;
          payslipData = Array.isArray(records) ? records[0] : records;
        }
        
        // Ensure we have valid payslip data
        if (payslipData && payslipData._id) {
          setPayslip(payslipData);
        } else {
          throw new Error('No payslip data found');
        }
      } else {
        throw new Error(data.message || 'Failed to fetch payslip');
      }
    } catch (err) {
      console.error('Error fetching payslip:', err);
      setError(err instanceof Error ? err.message : 'Failed to load payslip');
    } finally {
      setLoading(false);
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle download (PDF)
  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    console.log('Download payslip:', payslip?._id);
  };

  // Load data when dialog opens
  useEffect(() => {
    if (open && (payrollId || (employeeId && payPeriod))) {
      fetchPayslip();
    }
  }, [open, payrollId, employeeId, payPeriod]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setPayslip(null);
      setError(null);
    }
  }, [open]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'processed': return 'warning';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle />;
      case 'processed': return <Schedule />;
      case 'pending': return <Schedule />;
      default: return <Cancel />;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '700px' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Receipt color="primary" />
            <Typography variant="h6">Payslip</Typography>
          </Box>
          {payslip && (
            <Chip
              icon={getStatusIcon(payslip.paymentDetails?.status || 'pending')}
              label={(payslip.paymentDetails?.status || 'pending').toUpperCase()}
              color={getStatusColor(payslip.paymentDetails?.status || 'pending') as any}
              variant="outlined"
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : payslip ? (
          <Box sx={{ p: 2 }}>
            {/* Header */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
                    <Person />
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h5" gutterBottom>
                    {payslip.employeeId?.profile?.firstName || 'N/A'} {payslip.employeeId?.profile?.lastName || ''}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Employee ID: {payslip.employeeId?.employeeId || 'N/A'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {payslip.employeeId?.jobDetails?.position || 'N/A'} - {payslip.employeeId?.jobDetails?.department || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">Pay Period</Typography>
                    <Typography variant="h6">
                      {dayjs().month((payslip.payPeriod?.month || 1) - 1).format('MMMM')} {payslip.payPeriod?.year || new Date().getFullYear()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Grid container spacing={3}>
              {/* Earnings */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    Earnings
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Basic Salary</TableCell>
                          <TableCell align="right">{formatINR(payslip.basicSalary || 0)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Housing Allowance</TableCell>
                          <TableCell align="right">{formatINR(payslip.allowances?.housing || 0)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Transport Allowance</TableCell>
                          <TableCell align="right">{formatINR(payslip.allowances?.transport || 0)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Medical Allowance</TableCell>
                          <TableCell align="right">{formatINR(payslip.allowances?.medical || 0)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Other Allowances</TableCell>
                          <TableCell align="right">{formatINR(payslip.allowances?.other || 0)}</TableCell>
                        </TableRow>
                        {payslip.overtime?.hours && (payslip.overtime?.hours || 0) > 0 && (
                          <TableRow>
                            <TableCell>
                              Overtime ({payslip.overtime?.hours || 0} hrs @ {formatINR(payslip.overtime?.rate || 0)}/hr)
                            </TableCell>
                            <TableCell align="right">{formatINR(payslip.overtimePay || 0)}</TableCell>
                          </TableRow>
                        )}
                        <TableRow sx={{ bgcolor: 'success.50' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Total Earnings</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {formatINR(payslip.grossSalary || 0)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Deductions */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" color="error.main" gutterBottom>
                    Deductions
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Income Tax</TableCell>
                          <TableCell align="right">{formatINR(payslip.deductions?.tax || 0)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Insurance</TableCell>
                          <TableCell align="right">{formatINR(payslip.deductions?.insurance || 0)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Provident Fund</TableCell>
                          <TableCell align="right">{formatINR(payslip.deductions?.providentFund || 0)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Other Deductions</TableCell>
                          <TableCell align="right">{formatINR(payslip.deductions?.other || 0)}</TableCell>
                        </TableRow>
                        <TableRow sx={{ bgcolor: 'error.50' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Total Deductions</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {formatINR(payslip.totalDeductions || 0)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>

            {/* Net Salary */}
            <Paper sx={{ p: 3, mt: 3, bgcolor: 'primary.50', textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                Net Salary: {formatINR(payslip.netSalary || 0)}
              </Typography>
            </Paper>

            {/* Payment Details */}
            <Paper sx={{ p: 2, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Payment Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                  <Typography variant="body1">
                    {payslip.paymentDetails?.method?.replace('_', ' ')?.toUpperCase() || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip
                    label={(payslip.paymentDetails?.status || 'pending').toUpperCase()}
                    color={getStatusColor(payslip.paymentDetails?.status || 'pending') as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Processed Date</Typography>
                  <Typography variant="body1">
                    {payslip.processedDate ? dayjs(payslip.processedDate).format('MMM DD, YYYY') : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Paid Date</Typography>
                  <Typography variant="body1">
                    {payslip.paidDate ? dayjs(payslip.paidDate).format('MMM DD, YYYY') : 'Pending'}
                  </Typography>
                </Grid>
                {payslip.paymentDetails?.transactionId && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Transaction ID</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {payslip.paymentDetails.transactionId}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Footer */}
            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                This is a computer-generated payslip and does not require a signature.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generated on {dayjs().format('MMMM DD, YYYY')}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="body1" color="text.secondary">
              No payslip data available
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>
          Close
        </Button>
        {payslip && (
          <>
            <Button
              onClick={handleDownload}
              startIcon={<Download />}
              variant="outlined"
            >
              Download PDF
            </Button>
            <Button
              onClick={handlePrint}
              startIcon={<Print />}
              variant="contained"
            >
              Print
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RealTimePayslipViewer;
