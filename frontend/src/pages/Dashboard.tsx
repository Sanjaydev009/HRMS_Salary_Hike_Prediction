import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  People,
  EventNote,
  Payment,
  TrendingUp,
} from '@mui/icons-material';

interface DashboardStats {
  totalEmployees: number;
  pendingLeaves: number;
  monthlyPayroll: number;
  performanceScore: number;
}

interface RecentActivity {
  id: string;
  message: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard statistics from API
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
      }

      const data = await response.json();
      setStats(data.stats);
      
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
      
      // Fallback: Show empty state instead of hardcoded data
      setStats({
        totalEmployees: 0,
        pendingLeaves: 0,
        monthlyPayroll: 0,
        performanceScore: 0,
      });
    }
  };

  // Fetch recent activities from API
  const fetchRecentActivities = async () => {
    try {
      const response = await fetch('/api/dashboard/activities', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recent activities: ${response.statusText}`);
      }

      const data = await response.json();
      setRecentActivities(data.activities || []);
      
    } catch (err) {
      console.error('Error fetching recent activities:', err);
      
      // Fallback: Show empty state instead of hardcoded data
      setRecentActivities([]);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchDashboardStats(),
        fetchRecentActivities(),
      ]);
      
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statisticsData = stats ? [
    { title: 'Total Employees', value: stats.totalEmployees.toString(), icon: <People />, color: '#1976d2' },
    { title: 'Pending Leaves', value: stats.pendingLeaves.toString(), icon: <EventNote />, color: '#ed6c02' },
    { title: 'Monthly Payroll', value: formatCurrency(stats.monthlyPayroll), icon: <Payment />, color: '#2e7d32' },
    { title: 'Performance Score', value: `${stats.performanceScore.toFixed(1)}/5`, icon: <TrendingUp />, color: '#9c27b0' },
  ] : [];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Welcome to your HRMS dashboard. Here's an overview of your organization.
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {loading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="rectangular" width={40} height={40} sx={{ mr: 2 }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={40} />
                      <Skeleton variant="text" width="80%" height={20} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          statisticsData.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: stat.color,
                        color: 'white',
                        mr: 2,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="h4" component="div">
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            {loading ? (
              <Box>
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} variant="text" height={24} sx={{ mb: 1 }} />
                ))}
              </Box>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <Typography key={activity.id} variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • {activity.message}
                </Typography>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent activities available.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Add New Employee
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Process Payroll
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Generate Reports
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • View Analytics
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
