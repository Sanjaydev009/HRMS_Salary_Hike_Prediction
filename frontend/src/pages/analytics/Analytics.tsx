import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  People,
  WorkOff,
  AttachMoney,
  Star,
  Analytics as AnalyticsIcon,
  Refresh,
  Download,
  TrendingDown,
  Schedule,
  Business,
  Assessment,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Scatter,
  ScatterChart,
} from 'recharts';
import { format, subMonths } from 'date-fns';

interface AnalyticsData {
  overview: {
    totalEmployees: number;
    activeEmployees: number;
    pendingLeaves: number;
    approvedLeavesThisMonth: number;
    recentLeaves: number;
    recentJoinings: number;
  };
  payroll: {
    totalRecords: number;
    totalPayout: number;
    paidRecords: number;
  };
  departmentStats: Array<{
    _id: string;
    count: number;
  }>;
  leaveTrends: Array<{
    _id: { year: number; month: number };
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  }>;
}

interface LeaveAnalytics {
  monthlyLeaveStats: Array<{
    _id: number;
    leaveTypes: Array<{
      type: string;
      count: number;
      totalDays: number;
    }>;
    totalLeaves: number;
    totalDaysUsed: number;
  }>;
  leaveTypeDistribution: Array<{
    _id: string;
    count: number;
    totalDays: number;
    averageDays: number;
  }>;
  departmentLeaveStats: Array<{
    _id: string;
    totalLeaves: number;
    totalDays: number;
    avgDaysPerLeave: number;
  }>;
  statusDistribution: Array<{
    _id: string;
    count: number;
  }>;
}

interface PerformanceAnalytics {
  performanceDistribution: Array<{
    _id: string;
    count: number;
    avgRating: number;
  }>;
  departmentPerformance: Array<{
    _id: string;
    avgRating: number;
    employeeCount: number;
    highPerformers: number;
  }>;
  topPerformers: Array<{
    employeeId: string;
    profile: { firstName: string; lastName: string };
    jobDetails: { department: string; designation: string };
    rating: number;
  }>;
  performanceTrends: Array<{
    _id: number;
    avgRating: number;
    employeeCount: number;
  }>;
}

const Analytics: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [leaveAnalytics, setLeaveAnalytics] = useState<LeaveAnalytics | null>(null);
  const [performanceAnalytics, setPerformanceAnalytics] = useState<PerformanceAnalytics | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Color palette for charts
  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
    '#00ff00',
    '#ff00ff',
  ];

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch analytics data in parallel
      const [dashboardRes, leaveRes, performanceRes] = await Promise.all([
        fetch('http://localhost:5001/api/analytics/dashboard', { headers }).catch(() => null),
        fetch(`http://localhost:5001/api/analytics/leave-trends?year=${selectedYear}${selectedDepartment ? `&department=${selectedDepartment}` : ''}`, { headers }).catch(() => null),
        fetch(`http://localhost:5001/api/analytics/performance-insights?year=${selectedYear}${selectedDepartment ? `&department=${selectedDepartment}` : ''}`, { headers }).catch(() => null),
      ]);

      // Only set data if response is successful
      if (dashboardRes && dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        if (dashboardData.success) {
          setAnalyticsData(dashboardData.data);
        }
      }

      if (leaveRes && leaveRes.ok) {
        const leaveData = await leaveRes.json();
        if (leaveData.success) {
          setLeaveAnalytics(leaveData.data);
        }
      }

      if (performanceRes && performanceRes.ok) {
        const performanceData = await performanceRes.json();
        if (performanceData.success) {
          setPerformanceAnalytics(performanceData.data);
        }
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedYear, selectedDepartment]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedYear, selectedDepartment]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    trend?: { value: number; isPositive: boolean };
  }> = ({ title, value, subtitle, icon, color, trend }) => (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha(color, 0.1),
              color: color,
            }}
          >
            {icon}
          </Box>
          {trend && (
            <Chip
              icon={trend.isPositive ? <TrendingUp /> : <TrendingDown />}
              label={`${trend.isPositive ? '+' : ''}${trend.value}%`}
              size="small"
              color={trend.isPositive ? 'success' : 'error'}
              variant="outlined"
            />
          )}
        </Box>
        <Typography variant="h4" fontWeight="bold" color={color} gutterBottom>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (loading && !analyticsData) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading real-time analytics data...
        </Typography>
      </Box>
    );
  }

  // Show message if no data is available
  if (!loading && !analyticsData) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Employee Analytics Dashboard
        </Typography>
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            No analytics data available
          </Typography>
          <Typography variant="body1">
            Analytics data will appear here once you have:
          </Typography>
          <ul>
            <li>Employee records in the system</li>
            <li>Leave applications and approvals</li>
            <li>Payroll processing data</li>
            <li>Performance evaluations</li>
          </ul>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Start by adding employees and processing some HR activities to see comprehensive analytics.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Employee Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time insights and comprehensive analytics for workforce management
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Last updated: {format(lastUpdated, 'HH:mm:ss')}
          </Typography>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<Download />}
            sx={{ textTransform: 'none' }}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={selectedDepartment}
              label="Department"
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <MenuItem value="">All Departments</MenuItem>
              {analyticsData?.departmentStats.map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept._id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Alert severity="info" sx={{ ml: 'auto' }}>
            <Typography variant="caption">
              Data refreshes automatically every 5 minutes
            </Typography>
          </Alert>
        </Stack>
      </Paper>

      {/* Key Metrics */}
      {analyticsData && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Employees"
              value={analyticsData.overview.totalEmployees}
              subtitle={`${analyticsData.overview.activeEmployees} active`}
              icon={<People />}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Leaves"
              value={analyticsData.overview.pendingLeaves}
              subtitle={`${analyticsData.overview.approvedLeavesThisMonth} approved this month`}
              icon={<Schedule />}
              color={theme.palette.warning.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Monthly Payroll"
              value={`₹${(analyticsData.payroll.totalPayout / 100000).toFixed(1)}L`}
              subtitle={`${analyticsData.payroll.paidRecords}/${analyticsData.payroll.totalRecords} processed`}
              icon={<AttachMoney />}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Departments"
              value={analyticsData.departmentStats.length}
              subtitle={`${analyticsData.overview.recentJoinings} new joinings`}
              icon={<Business />}
              color={theme.palette.info.main}
            />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Department Distribution */}
        {analyticsData && analyticsData.departmentStats.length > 0 ? (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Department Distribution"
                subheader="Employee count by department"
                action={
                  <Chip
                    icon={<People />}
                    label={`${analyticsData.overview.totalEmployees} Total`}
                    color="primary"
                    variant="outlined"
                  />
                }
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.departmentStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ _id, percent }) => `${_id} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.departmentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Department Distribution"
                subheader="Employee count by department"
              />
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                  <Business sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Department Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Add employees to different departments to see distribution analytics
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Leave Trends */}
        {analyticsData && analyticsData.leaveTrends.length > 0 ? (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Leave Trends"
                subheader="Monthly leave patterns over the last 6 months"
                action={
                  <Chip
                    icon={<TrendingUp />}
                    label="6 Months"
                    color="secondary"
                    variant="outlined"
                  />
                }
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.leaveTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="_id.month" 
                      tickFormatter={(month) => format(new Date(2000, month - 1), 'MMM')}
                    />
                    <YAxis />
                    <RechartsTooltip 
                      labelFormatter={(month) => format(new Date(2000, month - 1), 'MMMM')}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="approved" 
                      stroke={theme.palette.success.main} 
                      strokeWidth={2}
                      name="Approved"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pending" 
                      stroke={theme.palette.warning.main}
                      strokeWidth={2}
                      name="Pending"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rejected" 
                      stroke={theme.palette.error.main}
                      strokeWidth={2}
                      name="Rejected"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Leave Trends"
                subheader="Monthly leave patterns"
              />
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                  <Schedule sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Leave Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Leave trends will appear once employees start applying for leaves
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Leave Type Distribution */}
        {leaveAnalytics && leaveAnalytics.leaveTypeDistribution.length > 0 ? (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Leave Type Analysis"
                subheader={`Leave distribution for ${selectedYear}`}
                action={
                  <Chip
                    icon={<Assessment />}
                    label={selectedYear}
                    color="primary"
                    variant="outlined"
                  />
                }
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={leaveAnalytics.leaveTypeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="count" fill={theme.palette.primary.main} name="Applications" />
                    <Bar dataKey="totalDays" fill={theme.palette.secondary.main} name="Total Days" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Leave Type Analysis"
                subheader={`Leave distribution for ${selectedYear}`}
              />
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                  <Assessment sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Leave Type Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Leave type analysis will show once employees apply for different types of leaves
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Department Leave Statistics */}
        {leaveAnalytics && leaveAnalytics.departmentLeaveStats.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Department Leave Usage"
                subheader="Leave patterns across departments"
                action={
                  <Chip
                    icon={<WorkOff />}
                    label="By Department"
                    color="warning"
                    variant="outlined"
                  />
                }
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={leaveAnalytics.departmentLeaveStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" angle={-45} textAnchor="end" height={80} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="totalLeaves" fill={theme.palette.info.main} name="Total Leaves" />
                    <Line yAxisId="right" type="monotone" dataKey="avgDaysPerLeave" stroke={theme.palette.error.main} strokeWidth={2} name="Avg Days/Leave" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Performance Distribution */}
        {performanceAnalytics && performanceAnalytics.performanceDistribution.length > 0 ? (
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader
                title="Performance Distribution"
                subheader={`Employee performance ratings for ${selectedYear}`}
                action={
                  <Chip
                    icon={<Star />}
                    label="Performance"
                    color="success"
                    variant="outlined"
                  />
                }
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={performanceAnalytics.performanceDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke={theme.palette.success.main}
                      fill={alpha(theme.palette.success.main, 0.3)}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader
                title="Performance Distribution"
                subheader={`Employee performance ratings for ${selectedYear}`}
              />
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                  <Star sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Performance Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Performance analytics will appear once employee performance evaluations are completed
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Top Performers */}
        {performanceAnalytics && performanceAnalytics.topPerformers.length > 0 ? (
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader
                title="Top Performers"
                subheader="Highest rated employees"
                action={
                  <Chip
                    icon={<Star />}
                    label={`Top ${performanceAnalytics.topPerformers.length}`}
                    color="success"
                    variant="outlined"
                  />
                }
              />
              <CardContent>
                <Stack spacing={1} sx={{ maxHeight: 350, overflow: 'auto' }}>
                  {performanceAnalytics.topPerformers.slice(0, 10).map((performer, index) => (
                    <Box
                      key={performer.employeeId}
                      sx={{
                        p: 2,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        borderRadius: 1,
                        backgroundColor: index < 3 ? alpha(theme.palette.success.main, 0.05) : 'transparent',
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {performer.profile.firstName} {performer.profile.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {performer.jobDetails.designation} • {performer.jobDetails.department}
                          </Typography>
                        </Box>
                        <Chip
                          label={performer.rating.toFixed(1)}
                          color={performer.rating >= 4.5 ? 'success' : performer.rating >= 4.0 ? 'primary' : 'default'}
                          size="small"
                          icon={<Star />}
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader
                title="Top Performers"
                subheader="Highest rated employees"
              />
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                  <Star sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Performance Rankings
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Top performers will be listed once performance evaluations are completed
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Department Performance Comparison */}
        {performanceAnalytics && performanceAnalytics.departmentPerformance.length > 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Department Performance Comparison"
                subheader="Average performance rating and high performer percentage by department"
                action={
                  <Chip
                    icon={<Assessment />}
                    label="Comparative Analysis"
                    color="info"
                    variant="outlined"
                  />
                }
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={performanceAnalytics.departmentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" angle={-45} textAnchor="end" height={80} />
                    <YAxis yAxisId="left" domain={[0, 5]} />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Bar 
                      yAxisId="right" 
                      dataKey="employeeCount" 
                      fill={alpha(theme.palette.primary.main, 0.3)} 
                      name="Employee Count"
                    />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="avgRating" 
                      stroke={theme.palette.success.main} 
                      strokeWidth={3}
                      name="Average Rating"
                    />
                    <Scatter 
                      yAxisId="left" 
                      dataKey="highPerformers" 
                      fill={theme.palette.warning.main}
                      name="High Performers"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Department Performance Comparison"
                subheader="Performance analytics by department"
              />
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                  <Assessment sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Department Performance Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Department performance comparison will show once employees in different departments have performance evaluations
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Add custom CSS for animations */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default Analytics;
