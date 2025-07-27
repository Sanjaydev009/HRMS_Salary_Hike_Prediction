import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Divider,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import { Calculate, TrendingUp, AccountBalance } from '@mui/icons-material';

interface SalaryCalculatorProps {
  open: boolean;
  onClose: () => void;
}

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

const SalaryCalculator: React.FC<SalaryCalculatorProps> = ({
  open,
  onClose,
}) => {
  const [baseSalary, setBaseSalary] = useState<number>(75000);
  const [allowances, setAllowances] = useState<number>(2000);
  const [state, setState] = useState<string>('CA');
  const [filingStatus, setFilingStatus] = useState<string>('single');
  const [calculations, setCalculations] = useState<any>(null);

  // Tax brackets (simplified for demo)
  const federalBrackets: TaxBracket[] = [
    { min: 0, max: 10275, rate: 0.10 },
    { min: 10275, max: 41775, rate: 0.12 },
    { min: 41775, max: 89450, rate: 0.22 },
    { min: 89450, max: 190750, rate: 0.24 },
    { min: 190750, max: 364200, rate: 0.32 },
    { min: 364200, max: 462500, rate: 0.35 },
    { min: 462500, max: Infinity, rate: 0.37 },
  ];

  const stateTaxRates: { [key: string]: number } = {
    'CA': 0.08,
    'NY': 0.07,
    'TX': 0.00,
    'FL': 0.00,
    'WA': 0.00,
  };

  const calculateTax = (income: number, brackets: TaxBracket[]): number => {
    let tax = 0;
    let remainingIncome = income;

    for (const bracket of brackets) {
      if (remainingIncome <= 0) break;
      
      const taxableInThisBracket = Math.min(remainingIncome, bracket.max - bracket.min);
      tax += taxableInThisBracket * bracket.rate;
      remainingIncome -= taxableInThisBracket;
    }

    return tax;
  };

  const calculateSalary = () => {
    const annualGross = baseSalary + (allowances * 12);
    const monthlyGross = annualGross / 12;

    // Federal tax calculation
    const federalTax = calculateTax(annualGross, federalBrackets);
    const monthlyFederalTax = federalTax / 12;

    // State tax calculation
    const stateTaxRate = stateTaxRates[state] || 0;
    const stateTax = annualGross * stateTaxRate;
    const monthlyStateTax = stateTax / 12;

    // Social Security (6.2% up to $160,200 in 2023)
    const socialSecurityTax = Math.min(annualGross * 0.062, 160200 * 0.062);
    const monthlySocialSecurity = socialSecurityTax / 12;

    // Medicare (1.45%)
    const medicareTax = annualGross * 0.0145;
    const monthlyMedicare = medicareTax / 12;

    // Total taxes
    const totalAnnualTax = federalTax + stateTax + socialSecurityTax + medicareTax;
    const totalMonthlyTax = totalAnnualTax / 12;

    // Net pay
    const annualNet = annualGross - totalAnnualTax;
    const monthlyNet = annualNet / 12;

    setCalculations({
      annual: {
        gross: annualGross,
        federalTax,
        stateTax,
        socialSecurityTax,
        medicareTax,
        totalTax: totalAnnualTax,
        net: annualNet,
      },
      monthly: {
        gross: monthlyGross,
        federalTax: monthlyFederalTax,
        stateTax: monthlyStateTax,
        socialSecurityTax: monthlySocialSecurity,
        medicareTax: monthlyMedicare,
        totalTax: totalMonthlyTax,
        net: monthlyNet,
      },
      effective: {
        taxRate: (totalAnnualTax / annualGross) * 100,
        takeHomeRate: (annualNet / annualGross) * 100,
      },
    });
  };

  useEffect(() => {
    calculateSalary();
  }, [baseSalary, allowances, state, filingStatus]);

  const resetCalculator = () => {
    setBaseSalary(75000);
    setAllowances(2000);
    setState('CA');
    setFilingStatus('single');
    setCalculations(null);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Calculate sx={{ mr: 1 }} />
          Salary Calculator
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Calculate take-home pay after taxes and deductions. This calculator provides estimates 
            based on 2025 tax brackets and may not reflect your exact situation.
          </Alert>

          <Grid container spacing={3}>
            {/* Input Section */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Salary Information
              </Typography>
              
              <TextField
                fullWidth
                label="Annual Base Salary"
                type="number"
                value={baseSalary}
                onChange={(e) => setBaseSalary(Number(e.target.value))}
                InputProps={{
                  startAdornment: '$',
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Monthly Allowances"
                type="number"
                value={allowances}
                onChange={(e) => setAllowances(Number(e.target.value))}
                InputProps={{
                  startAdornment: '$',
                }}
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>State</InputLabel>
                <Select
                  value={state}
                  label="State"
                  onChange={(e) => setState(e.target.value)}
                >
                  <MenuItem value="CA">California</MenuItem>
                  <MenuItem value="NY">New York</MenuItem>
                  <MenuItem value="TX">Texas</MenuItem>
                  <MenuItem value="FL">Florida</MenuItem>
                  <MenuItem value="WA">Washington</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Filing Status</InputLabel>
                <Select
                  value={filingStatus}
                  label="Filing Status"
                  onChange={(e) => setFilingStatus(e.target.value)}
                >
                  <MenuItem value="single">Single</MenuItem>
                  <MenuItem value="married">Married Filing Jointly</MenuItem>
                  <MenuItem value="marriedSeparate">Married Filing Separately</MenuItem>
                  <MenuItem value="headOfHousehold">Head of Household</MenuItem>
                </Select>
              </FormControl>

              <Button
                fullWidth
                variant="outlined"
                onClick={resetCalculator}
              >
                Reset Calculator
              </Button>
            </Grid>

            {/* Results Section */}
            {calculations && (
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Salary Breakdown
                </Typography>

                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={4}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <AccountBalance sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h5" color="primary">
                          ${calculations.annual.gross.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Annual Gross
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                        <Typography variant="h5" color="success.main">
                          ${calculations.annual.net.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Annual Net
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Calculate sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                        <Typography variant="h5" color="warning.main">
                          {calculations.effective.taxRate.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Effective Tax Rate
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Detailed Breakdown */}
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="h6" gutterBottom>
                      Annual Breakdown
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Gross Salary:</Typography>
                        <Typography fontWeight="medium">${calculations.annual.gross.toLocaleString()}</Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, mt: 1 }}>
                        <Typography color="text.secondary">Federal Tax:</Typography>
                        <Typography color="text.secondary">-${calculations.annual.federalTax.toLocaleString()}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="text.secondary">State Tax ({state}):</Typography>
                        <Typography color="text.secondary">-${calculations.annual.stateTax.toLocaleString()}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="text.secondary">Social Security:</Typography>
                        <Typography color="text.secondary">-${calculations.annual.socialSecurityTax.toLocaleString()}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="text.secondary">Medicare:</Typography>
                        <Typography color="text.secondary">-${calculations.annual.medicareTax.toLocaleString()}</Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography fontWeight="bold">Net Salary:</Typography>
                        <Typography fontWeight="bold" color="success.main">
                          ${calculations.annual.net.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="h6" gutterBottom>
                      Monthly Breakdown
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Gross Pay:</Typography>
                        <Typography fontWeight="medium">${calculations.monthly.gross.toLocaleString()}</Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, mt: 1 }}>
                        <Typography color="text.secondary">Federal Tax:</Typography>
                        <Typography color="text.secondary">-${calculations.monthly.federalTax.toLocaleString()}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="text.secondary">State Tax:</Typography>
                        <Typography color="text.secondary">-${calculations.monthly.stateTax.toLocaleString()}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="text.secondary">Social Security:</Typography>
                        <Typography color="text.secondary">-${calculations.monthly.socialSecurityTax.toLocaleString()}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="text.secondary">Medicare:</Typography>
                        <Typography color="text.secondary">-${calculations.monthly.medicareTax.toLocaleString()}</Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography fontWeight="bold">Net Pay:</Typography>
                        <Typography fontWeight="bold" color="success.main">
                          ${calculations.monthly.net.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                {/* Additional Info */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Additional Information
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                      <Chip 
                        label={`Take-home rate: ${calculations.effective.takeHomeRate.toFixed(1)}%`}
                        color="success"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Chip 
                        label={`Bi-weekly net: $${(calculations.monthly.net / 2).toLocaleString()}`}
                        color="info"
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SalaryCalculator;
