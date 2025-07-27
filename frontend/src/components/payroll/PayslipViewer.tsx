import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Paper,
} from '@mui/material';
import { Download, Print } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  payPeriod: {
    start: Dayjs;
    end: Dayjs;
  };
  baseSalary: number;
  allowances: {
    type: string;
    amount: number;
  }[];
  deductions: {
    type: string;
    amount: number;
  }[];
  grossPay: number;
  netPay: number;
  taxes: {
    federal: number;
    state: number;
    social: number;
  };
  status: 'Draft' | 'Processed' | 'Paid' | 'Cancelled';
  processedDate?: Dayjs;
  paidDate?: Dayjs;
}

interface PayslipViewerProps {
  open: boolean;
  onClose: () => void;
  payroll: PayrollRecord | null;
}

const PayslipViewer: React.FC<PayslipViewerProps> = ({
  open,
  onClose,
  payroll,
}) => {
  if (!payroll) return null;

  const totalAllowances = payroll.allowances.reduce((sum, allowance) => sum + allowance.amount, 0);
  const totalDeductions = payroll.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
  const totalTaxes = payroll.taxes.federal + payroll.taxes.state + payroll.taxes.social;

  const handleDownload = () => {
    // In real app, this would generate and download PDF
    console.log('Downloading payslip for:', payroll.employeeName);
  };

  const handlePrint = () => {
    // In real app, this would open print dialog
    window.print();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Payslip - {payroll.employeeName}
          </Typography>
          <Box>
            <Button
              startIcon={<Print />}
              onClick={handlePrint}
              size="small"
              sx={{ mr: 1 }}
            >
              Print
            </Button>
            <Button
              startIcon={<Download />}
              onClick={handleDownload}
              variant="outlined"
              size="small"
            >
              Download PDF
            </Button>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Paper sx={{ p: 3, mt: 1 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Company Name
            </Typography>
            <Typography variant="body2" color="text.secondary">
              123 Business Street, City, State 12345
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: (555) 123-4567 | Email: hr@company.com
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Employee and Pay Period Info */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Typography variant="h6" gutterBottom>
                Employee Information
              </Typography>
              <Typography variant="body2">
                <strong>Name:</strong> {payroll.employeeName}
              </Typography>
              <Typography variant="body2">
                <strong>Employee ID:</strong> {payroll.employeeId}
              </Typography>
              <Typography variant="body2">
                <strong>Department:</strong> {payroll.department}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6" gutterBottom>
                Pay Period Information
              </Typography>
              <Typography variant="body2">
                <strong>Pay Period:</strong> {payroll.payPeriod.start.format('MMM DD')} - {payroll.payPeriod.end.format('MMM DD, YYYY')}
              </Typography>
              <Typography variant="body2">
                <strong>Pay Date:</strong> {payroll.paidDate?.format('MMM DD, YYYY') || 'Pending'}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {payroll.status}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          {/* Earnings */}
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Typography variant="h6" gutterBottom>
                Earnings
              </Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Base Salary</TableCell>
                    <TableCell align="right">${(payroll.baseSalary / 12).toLocaleString()}</TableCell>
                  </TableRow>
                  {payroll.allowances.map((allowance, index) => (
                    <TableRow key={index}>
                      <TableCell>{allowance.type}</TableCell>
                      <TableCell align="right">${allowance.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell><strong>Total Allowances</strong></TableCell>
                    <TableCell align="right"><strong>${totalAllowances.toLocaleString()}</strong></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Gross Earnings</strong></TableCell>
                    <TableCell align="right"><strong>${payroll.grossPay.toLocaleString()}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="h6" gutterBottom>
                Deductions
              </Typography>
              <Table size="small">
                <TableBody>
                  {/* Taxes */}
                  <TableRow>
                    <TableCell>Federal Tax</TableCell>
                    <TableCell align="right">${payroll.taxes.federal.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>State Tax</TableCell>
                    <TableCell align="right">${payroll.taxes.state.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Social Security</TableCell>
                    <TableCell align="right">${payroll.taxes.social.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Total Taxes</strong></TableCell>
                    <TableCell align="right"><strong>${totalTaxes.toLocaleString()}</strong></TableCell>
                  </TableRow>
                  
                  {/* Other Deductions */}
                  {payroll.deductions.map((deduction, index) => (
                    <TableRow key={index}>
                      <TableCell>{deduction.type}</TableCell>
                      <TableCell align="right">${deduction.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell><strong>Total Other Deductions</strong></TableCell>
                    <TableCell align="right"><strong>${totalDeductions.toLocaleString()}</strong></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Total Deductions</strong></TableCell>
                    <TableCell align="right"><strong>${(totalTaxes + totalDeductions).toLocaleString()}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Net Pay */}
          <Box sx={{ backgroundColor: 'primary.50', p: 2, borderRadius: 1 }}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Typography variant="h5" color="primary">
                  Net Pay
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  ${payroll.netPay.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Year to Date Summary */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Year to Date Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Typography variant="body2" color="text.secondary">
                  YTD Gross
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  ${(payroll.grossPay * 7).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" color="text.secondary">
                  YTD Taxes
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  ${(totalTaxes * 7).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" color="text.secondary">
                  YTD Deductions
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  ${(totalDeductions * 7).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" color="text.secondary">
                  YTD Net
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  ${(payroll.netPay * 7).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              This is a computer-generated payslip. No signature required.
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Generated on {dayjs().format('MMMM DD, YYYY')}
            </Typography>
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PayslipViewer;
