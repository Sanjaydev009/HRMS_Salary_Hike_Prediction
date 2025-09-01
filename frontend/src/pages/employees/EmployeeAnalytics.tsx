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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  useMediaQuery,
  Container,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
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

const EmployeeAnalytics: React.FC = () => {
  const theme = useTheme();
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('12');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/dashboard/analytics');
      
      if (response.data.success) {
        setAnalyticsData(response.data.analytics);
        console.log('Analytics data loaded:', response.data.analytics);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
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

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  if (loading && !refreshing) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>Employee Analytics</Typography>
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="40%" height={24} />
                  <Skeleton variant="rectangular" height={60} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Employee Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive insights into employee data and trends
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={selectedPeriod}
              label="Period"
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <MenuItem value="6">Last 6 Months</MenuItem>
              <MenuItem value="12">Last 12 Months</MenuItem>
              <MenuItem value="24">Last 2 Years</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Stack>
      </Stack>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {analyticsData?.departmentStats?.reduce((sum, dept) => sum + dept.count, 0) || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Employees
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', color: '#333' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.1)' }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {analyticsData?.departmentStats?.length || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Departments
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#333' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.1)' }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    ₹{((analyticsData?.salaryInsights?.avgSalary || 0) / 100000).toFixed(1)}L
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Avg. Salary
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)', color: '#333' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.1)' }}>
                  <StarIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {analyticsData?.productivityMetrics?.averageProductivity || 0}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Avg. Productivity
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Hiring Trends */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hiring Trends (Last 12 Months)
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData?.hiringTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="hired" 
                      stackId="1" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stackId="2" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Department Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData?.departmentStats?.map(dept => ({
                        name: dept._id,
                        value: dept.count
                      })) || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData?.departmentStats?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Leave Patterns */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Leave Utilization Patterns
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData?.leavePatterns || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="approved" stackId="a" fill="#8884d8" />
                    <Bar dataKey="pending" stackId="a" fill="#82ca9d" />
                    <Bar dataKey="sick" stackId="b" fill="#ffc658" />
                    <Bar dataKey="casual" stackId="b" fill="#ff7300" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Department Performance Metrics
              </Typography>
              <List>
                {analyticsData?.departmentStats?.slice(0, 5).map((dept, index) => (
                  <ListItem key={dept._id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: COLORS[index % COLORS.length] }}>
                        <BusinessIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={dept._id}
                      secondary={
                        <Stack spacing={1}>
                          <Typography variant="body2">
                            {dept.count} employees • ₹{(dept.avgSalary / 100000).toFixed(1)}L avg salary
                          </Typography>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Performance Score
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.random() * 100} 
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                        </Stack>
                      }
                    />
                    <Chip 
                      label={`+${dept.newHires} new`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </ListItem>
                )) || []}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Insights */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Performance & Training Insights
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Stack alignItems="center" spacing={1}>
                <Box position="relative" display="inline-flex">
                  <CircularProgress
                    variant="determinate"
                    value={analyticsData?.productivityMetrics?.averageProductivity || 0}
                    size={80}
                    thickness={4}
                  />
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    bottom={0}
                    right={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Typography variant="h6" component="div" color="text.secondary">
                      {analyticsData?.productivityMetrics?.averageProductivity || 0}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" textAlign="center">
                  Average Productivity
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Stack alignItems="center" spacing={1}>
                <Avatar sx={{ width: 60, height: 60, bgcolor: 'success.main' }}>
                  <StarIcon fontSize="large" />
                </Avatar>
                <Typography variant="h4" fontWeight={600}>
                  {analyticsData?.productivityMetrics?.topPerformers || 0}
                </Typography>
                <Typography variant="body2" textAlign="center">
                  Top Performers
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Stack alignItems="center" spacing={1}>
                <Avatar sx={{ width: 60, height: 60, bgcolor: 'warning.main' }}>
                  <TrendingUpIcon fontSize="large" />
                </Avatar>
                <Typography variant="h4" fontWeight={600}>
                  {analyticsData?.productivityMetrics?.improvementNeeded || 0}
                </Typography>
                <Typography variant="body2" textAlign="center">
                  Need Improvement
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Stack alignItems="center" spacing={1}>
                <Avatar sx={{ width: 60, height: 60, bgcolor: 'info.main' }}>
                  <SchoolIcon fontSize="large" />
                </Avatar>
                <Typography variant="h4" fontWeight={600}>
                  {analyticsData?.productivityMetrics?.trainingCompleted || 0}%
                </Typography>
                <Typography variant="body2" textAlign="center">
                  Training Completion
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeAnalytics;
