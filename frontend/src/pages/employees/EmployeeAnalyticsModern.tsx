import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Stack,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Avatar,
  IconButton,
  Fade,
  Skeleton,
  useMediaQuery,
  Container,
  Divider,
  ButtonGroup,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import api from '../../services/api';

interface AnalyticsData {
  hiringTrends: Array<{
    month: string;
    hired: number;
    total: number;
    growth: number;
  }>;
  departmentStats: Array<{
    _id: string;
    count: number;
    avgSalary: number;
    newHires: number;
  }>;
  leavePatterns: Array<{
    month: string;
    total: number;
    approved: number;
    pending: number;
    sick: number;
    casual: number;
  }>;
  salaryInsights: {
    avgSalary: number;
    minSalary: number;
    maxSalary: number;
    totalPayroll: number;
  };
  productivityMetrics: {
    averageProductivity: number;
    topPerformers: number;
    improvementNeeded: number;
    trainingCompleted: number;
  };
}

const EmployeeAnalyticsModern: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('12');
  const [selectedChart, setSelectedChart] = useState<'area' | 'bar' | 'line'>('area');

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/dashboard/analytics');
      setAnalyticsData(response.data.analytics);
    } catch (error: any) {
      console.error('Error fetching analytics data:', error);
      setError(error.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  if (loading) {
    return (
      <Container maxWidth={false} sx={{ py: { xs: 2, sm: 3 } }}>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="40%" height={24} />
                  <Skeleton variant="rectangular" height={100} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth={false} sx={{ py: { xs: 2, sm: 3 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
      pb: { xs: 2, sm: 4 }
    }}>
      <Container maxWidth={false} sx={{ py: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={{ xs: 2, sm: 0 }}
          sx={{ mb: { xs: 3, sm: 4 } }}
        >
          <Box>
            <Typography 
              variant={isMobile ? "h4" : "h3"}
              fontWeight={700}
              sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Employee Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Comprehensive insights into workforce trends and performance
            </Typography>
          </Box>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }}>
            <ButtonGroup size={isSmallScreen ? "small" : "medium"} variant="outlined">
              <Button onClick={() => setSelectedChart('area')} variant={selectedChart === 'area' ? 'contained' : 'outlined'}>
                <AreaChart />
              </Button>
              <Button onClick={() => setSelectedChart('bar')} variant={selectedChart === 'bar' ? 'contained' : 'outlined'}>
                <BarChartIcon />
              </Button>
              <Button onClick={() => setSelectedChart('line')} variant={selectedChart === 'line' ? 'contained' : 'outlined'}>
                <TimelineIcon />
              </Button>
            </ButtonGroup>
            
            <Button
              variant="contained"
              size={isSmallScreen ? "small" : "medium"}
              startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                }
              }}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            
            <Button
              variant="outlined"
              size={isSmallScreen ? "small" : "medium"}
              startIcon={<DownloadIcon />}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Export
            </Button>
          </Stack>
        </Stack>

        {/* Key Metrics Cards */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid item xs={6} sm={3}>
            <Card 
              elevation={0}
              sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ 
                    bgcolor: theme.palette.primary.main,
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 }
                  }}>
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant={isSmallScreen ? "h5" : "h4"}
                      fontWeight={700}
                      color="primary"
                    >
                      {analyticsData?.departmentStats.reduce((sum, dept) => sum + dept.count, 0) || 310}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Total Employees
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card 
              elevation={0}
              sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ 
                    bgcolor: theme.palette.success.main,
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 }
                  }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant={isSmallScreen ? "h5" : "h4"}
                      fontWeight={700}
                      color="success.main"
                    >
                      +{analyticsData?.hiringTrends[analyticsData.hiringTrends.length - 1]?.hired || 14}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      New Hires
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card 
              elevation={0}
              sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.05)})`,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ 
                    bgcolor: theme.palette.warning.main,
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 }
                  }}>
                    <BusinessIcon />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant={isSmallScreen ? "h5" : "h4"}
                      fontWeight={700}
                      color="warning.main"
                    >
                      {analyticsData?.departmentStats.length || 5}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Departments
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card 
              elevation={0}
              sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ 
                    bgcolor: theme.palette.info.main,
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 }
                  }}>
                    <AssessmentIcon />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant={isSmallScreen ? "h5" : "h4"}
                      fontWeight={700}
                      color="info.main"
                    >
                      {analyticsData?.productivityMetrics.averageProductivity || 87.5}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Productivity
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Hiring Trends Chart */}
          <Grid item xs={12} lg={8}>
            <Card 
              elevation={0}
              sx={{ 
                height: { xs: 400, sm: 500 },
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant={isSmallScreen ? "h6" : "h5"} fontWeight={600}>
                    Hiring Trends
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Period</InputLabel>
                    <Select
                      value={selectedPeriod}
                      label="Period"
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                    >
                      <MenuItem value="6">6 Months</MenuItem>
                      <MenuItem value="12">12 Months</MenuItem>
                      <MenuItem value="24">24 Months</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
                
                <ResponsiveContainer width="100%" height="80%">
                  {selectedChart === 'area' ? (
                    <AreaChart data={analyticsData?.hiringTrends}>
                      <defs>
                        <linearGradient id="colorHired" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: 8,
                          boxShadow: theme.shadows[8]
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="hired" 
                        stroke={theme.palette.primary.main}
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorHired)" 
                      />
                    </AreaChart>
                  ) : selectedChart === 'bar' ? (
                    <BarChart data={analyticsData?.hiringTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: 8,
                          boxShadow: theme.shadows[8]
                        }}
                      />
                      <Bar dataKey="hired" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={analyticsData?.hiringTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: 8,
                          boxShadow: theme.shadows[8]
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="hired" 
                        stroke={theme.palette.primary.main}
                        strokeWidth={3}
                        dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Department Distribution */}
          <Grid item xs={12} lg={4}>
            <Card 
              elevation={0}
              sx={{ 
                height: { xs: 400, sm: 500 },
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
                <Typography variant={isSmallScreen ? "h6" : "h5"} fontWeight={600} sx={{ mb: 2 }}>
                  Department Distribution
                </Typography>
                
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={analyticsData?.departmentStats.map((dept, index) => ({
                        name: dept._id,
                        value: dept.count,
                        color: COLORS[index % COLORS.length]
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={isSmallScreen ? 80 : 100}
                      dataKey="value"
                    >
                      {analyticsData?.departmentStats.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: 8,
                        boxShadow: theme.shadows[8]
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Salary Insights */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={0}
              sx={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant={isSmallScreen ? "h6" : "h5"} fontWeight={600} sx={{ mb: 3 }}>
                  Salary Insights
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight={700} color="primary">
                        ₹{(analyticsData?.salaryInsights.avgSalary || 78500).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average Salary
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        ₹{((analyticsData?.salaryInsights.totalPayroll || 24335000) / 1000000).toFixed(1)}M
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Payroll
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Minimum</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ₹{(analyticsData?.salaryInsights.minSalary || 35000).toLocaleString()}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Maximum</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ₹{(analyticsData?.salaryInsights.maxSalary || 150000).toLocaleString()}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Performance Metrics */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={0}
              sx={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant={isSmallScreen ? "h6" : "h5"} fontWeight={600} sx={{ mb: 3 }}>
                  Performance Metrics
                </Typography>
                
                <Stack spacing={3}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2">Productivity Score</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {analyticsData?.productivityMetrics.averageProductivity || 87.5}%
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={analyticsData?.productivityMetrics.averageProductivity || 87.5}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                        }
                      }}
                    />
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="h5" fontWeight={700} color="success.main">
                          {analyticsData?.productivityMetrics.topPerformers || 15}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Top Performers
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="h5" fontWeight={700} color="warning.main">
                          {analyticsData?.productivityMetrics.improvementNeeded || 8}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Need Improvement
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="h5" fontWeight={700} color="info.main">
                          {analyticsData?.productivityMetrics.trainingCompleted || 78}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Training Complete
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default EmployeeAnalyticsModern;
