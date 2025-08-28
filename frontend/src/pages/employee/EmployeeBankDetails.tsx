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
  Alert,
  CircularProgress,
  Stack,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  AccountBalance,
  CreditCard,
  Security,
} from '@mui/icons-material';
import api from '../../services/api';

interface BankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
  branchCode?: string;
  swiftCode?: string;
  isVerified: boolean;
  lastUpdated: string;
}

const EmployeeBankDetails: React.FC = () => {
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<BankDetails>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile/bank-details');
      
      if (response.data.success) {
        const details = response.data.data.bankDetails;
        setBankDetails(details);
        setFormData(details || {});
      }
    } catch (error: any) {
      console.error('Error fetching bank details:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.accountHolderName?.trim()) {
      newErrors.accountHolderName = 'Account holder name is required';
    }
    if (!formData.bankName?.trim()) {
      newErrors.bankName = 'Bank name is required';
    }
    if (!formData.accountNumber?.trim()) {
      newErrors.accountNumber = 'Account number is required';
    }
    if (!formData.routingNumber?.trim()) {
      newErrors.routingNumber = 'Routing number is required';
    } else if (formData.routingNumber.length !== 9) {
      newErrors.routingNumber = 'Routing number must be 9 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setEditing(true);
    setErrors({});
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData(bankDetails || {});
    setErrors({});
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const response = await api.put('/profile/bank-details', formData);
      
      if (response.data.success) {
        setBankDetails(response.data.data.bankDetails);
        setEditing(false);
        setErrors({});
      }
    } catch (error: any) {
      console.error('Error saving bank details:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to save bank details' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof BankDetails) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber || accountNumber.length <= 4) return accountNumber;
    return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Bank Details
        </Typography>
        {!editing && bankDetails && (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={handleEdit}
          >
            Edit Details
          </Button>
        )}
      </Box>

      {bankDetails ? (
        <>
          {/* Status Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Security color={bankDetails.isVerified ? 'success' : 'warning'} />
                    <Box>
                      <Typography variant="h6">
                        Verification Status
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color={bankDetails.isVerified ? 'success.main' : 'warning.main'}
                      >
                        {bankDetails.isVerified ? 'Verified' : 'Pending Verification'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <AccountBalance color="primary" />
                    <Box>
                      <Typography variant="h6">
                        Last Updated
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(bankDetails.lastUpdated).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Bank Details Form */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {errors.submit && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errors.submit}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Account Holder Name"
                  value={formData.accountHolderName || ''}
                  onChange={handleInputChange('accountHolderName')}
                  fullWidth
                  disabled={!editing}
                  error={!!errors.accountHolderName}
                  helperText={errors.accountHolderName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CreditCard />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Bank Name"
                  value={formData.bankName || ''}
                  onChange={handleInputChange('bankName')}
                  fullWidth
                  disabled={!editing}
                  error={!!errors.bankName}
                  helperText={errors.bankName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountBalance />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Account Number"
                  value={editing ? formData.accountNumber || '' : maskAccountNumber(formData.accountNumber || '')}
                  onChange={handleInputChange('accountNumber')}
                  fullWidth
                  disabled={!editing}
                  error={!!errors.accountNumber}
                  helperText={errors.accountNumber || (editing ? 'Your account number will be encrypted' : 'Account number is masked for security')}
                  type={editing ? 'text' : 'password'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Routing Number"
                  value={formData.routingNumber || ''}
                  onChange={handleInputChange('routingNumber')}
                  fullWidth
                  disabled={!editing}
                  error={!!errors.routingNumber}
                  helperText={errors.routingNumber || '9-digit routing number'}
                  inputProps={{ maxLength: 9 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Account Type"
                  value={formData.accountType || 'checking'}
                  onChange={handleInputChange('accountType')}
                  fullWidth
                  disabled={!editing}
                  SelectProps={{ native: true }}
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Branch Code"
                  value={formData.branchCode || ''}
                  onChange={handleInputChange('branchCode')}
                  fullWidth
                  disabled={!editing}
                  helperText="Optional branch identifier"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="SWIFT Code"
                  value={formData.swiftCode || ''}
                  onChange={handleInputChange('swiftCode')}
                  fullWidth
                  disabled={!editing}
                  helperText="Required for international transfers"
                />
              </Grid>
            </Grid>

            {editing && (
              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            )}

            {editing && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Bank details will require re-verification after any changes. Processing may take 1-2 business days.
              </Alert>
            )}
          </Paper>
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Bank Details Found
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Please add your bank information for payroll processing.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AccountBalance />}
            onClick={handleEdit}
            sx={{ mt: 2 }}
          >
            Add Bank Details
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default EmployeeBankDetails;
