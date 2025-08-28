import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Download,
  ExpandMore,
  AccountBalance,
  TrendingUp,
  Receipt,
  AttachMoney,
  Refresh,
  Visibility,
} from '@mui/icons-material';
import api from '../../services/api';

interface PayrollRecord {
  _id: string;
  payPeriod: {
    month: number;
    year: number;
  };
  salary: {
    baseSalary: number;
    grossSalary: number;
    netSalary: number;
  };
  allowances: {
    total: number;
    hra: number;
    transport: number;
    medical: number;
    bonus: number;
    overtime: number;
  };
  deductions: {
    total: number;
    tax: number;
    providentFund: number;
    insurance: number;
    other: number;
  };
  paymentDetails: {
    status: 'pending' | 'paid' | 'failed';
    paidDate?: string;
    paymentMethod: string;
    transactionId?: string;
  };
  generatedBy?: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
}

interface PayrollSummary {
  currentYear: number;
  totalPayslips: number;
  yearlyEarnings: {
    totalGross: number;
    totalNet: number;
    totalDeductions: number;
    totalAllowances: number;
    totalTax: number;
    totalBonus: number;
    totalOvertime: number;
  };
  avgMonthlySalary: number;
  latestPayslip: {
    month: number;
    year: number;
    netSalary: number;
    status: string;
    payDate?: string;
  } | null;
}

const EmployeePayroll: React.FC = () => {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchPayrollData();
  }, [selectedYear]);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/payroll/my?year=${selectedYear}&limit=12`);
      
      if (response.data.success) {
        setPayrollRecords(response.data.data.payrollRecords);
        setSummary(response.data.data.summary);
      }
    } catch (error: any) {
      console.error('Error fetching payroll data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (record: PayrollRecord) => {
    setSelectedRecord(record);
    setDetailsOpen(true);
  };

  const handleDownloadPayslip = async (payrollId: string) => {
    try {
      const response = await api.get(`/payroll/${payrollId}/download`, {
        responseType: 'blob',
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip-${payrollId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      console.error('Error downloading payslip:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          My Payroll
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchPayrollData}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <TextField
            select
            label="Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            size="small"
            sx={{ minWidth: 120 }}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <AttachMoney color="primary" />
                  <Box>
                    <Typography variant="h6">
                      {formatCurrency(summary.yearlyEarnings.totalNet)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Earnings (YTD)
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <TrendingUp color="success" />
                  <Box>
                    <Typography variant="h6">
                      {formatCurrency(summary.avgMonthlySalary)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Monthly
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Receipt color="info" />
                  <Box>
                    <Typography variant="h6">{summary.totalPayslips}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Payslips
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <AccountBalance color="warning" />
                  <Box>
                    <Typography variant="h6">
                      {formatCurrency(summary.yearlyEarnings.totalTax)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Tax Paid
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Latest Payslip */}
      {summary?.latestPayslip && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Latest Payslip
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>{getMonthName(summary.latestPayslip.month)} {summary.latestPayslip.year}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Net Salary: {formatCurrency(summary.latestPayslip.netSalary)}
              </Typography>
              <Chip
                label={summary.latestPayslip.status}
                color={getStatusColor(summary.latestPayslip.status) as any}
                size="small"
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
              {summary.latestPayslip.payDate && (
                <Typography variant="body2" color="text.secondary">
                  Paid on: {new Date(summary.latestPayslip.payDate).toLocaleDateString()}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Payroll Records */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payroll History
        </Typography>
        
        {payrollRecords.length === 0 ? (
          <Alert severity="info">
            No payroll records found for {selectedYear}
          </Alert>
        ) : (
          <Stack spacing={2}>
            {payrollRecords.map((record) => (
              <Accordion key={record._id}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Grid container spacing={2} alignItems="center" sx={{ width: '100%' }}>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {getMonthName(record.payPeriod.month)} {record.payPeriod.year}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body1" fontWeight="medium">
                        {formatCurrency(record.salary.netSalary)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Net Salary
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Chip
                        label={record.paymentDetails.status}
                        color={getStatusColor(record.paymentDetails.status) as any}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={3} sx={{ textAlign: { sm: 'right' } }}>
                      <Stack direction="row" spacing={1} justifyContent={{ sm: 'flex-end' }}>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(record);
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Download />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPayslip(record._id);
                          }}
                        >
                          Download
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" gutterBottom>
                        Earnings
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Base Salary:</Typography>
                          <Typography variant="body2">
                            {formatCurrency(record.salary.baseSalary)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">HRA:</Typography>
                          <Typography variant="body2">
                            {formatCurrency(record.allowances.hra)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Transport:</Typography>
                          <Typography variant="body2">
                            {formatCurrency(record.allowances.transport)}
                          </Typography>
                        </Box>
                        {record.allowances.bonus > 0 && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Bonus:</Typography>
                            <Typography variant="body2">
                              {formatCurrency(record.allowances.bonus)}
                            </Typography>
                          </Box>
                        )}
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                          <Typography variant="body2">Gross Salary:</Typography>
                          <Typography variant="body2">
                            {formatCurrency(record.salary.grossSalary)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" gutterBottom>
                        Deductions
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Income Tax:</Typography>
                          <Typography variant="body2">
                            {formatCurrency(record.deductions.tax)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Provident Fund:</Typography>
                          <Typography variant="body2">
                            {formatCurrency(record.deductions.providentFund)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Insurance:</Typography>
                          <Typography variant="body2">
                            {formatCurrency(record.deductions.insurance)}
                          </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                          <Typography variant="body2">Total Deductions:</Typography>
                          <Typography variant="body2">
                            {formatCurrency(record.deductions.total)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" gutterBottom>
                        Payment Details
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                          <Typography variant="body1">Net Salary:</Typography>
                          <Typography variant="body1" color="primary">
                            {formatCurrency(record.salary.netSalary)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Method:</Typography>
                          <Typography variant="body2">
                            {record.paymentDetails.paymentMethod}
                          </Typography>
                        </Box>
                        {record.paymentDetails.paidDate && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Paid Date:</Typography>
                            <Typography variant="body2">
                              {new Date(record.paymentDetails.paidDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                        {record.paymentDetails.transactionId && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Transaction ID:</Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {record.paymentDetails.transactionId}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Payslip Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Payslip Details - {selectedRecord && `${getMonthName(selectedRecord.payPeriod.month)} ${selectedRecord.payPeriod.year}`}
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Grid container spacing={3}>
              {/* Summary section with complete payslip details would go here */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Detailed payslip view with all earnings, deductions, and payment information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This would contain a formatted payslip layout with all the salary components
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EmployeePayroll;
