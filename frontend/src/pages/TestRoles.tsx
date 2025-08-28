import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  Chip,
  Stack 
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';

const TestRoles: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const switchRole = (role: string) => {
    const testUser = {
      id: '1',
      employeeId: `EMP-${role.toUpperCase()}-001`,
      email: `test.${role}@company.com`,
      role: role,
      profile: {
        firstName: `Test`,
        lastName: role.charAt(0).toUpperCase() + role.slice(1),
        phone: '123-456-7890',
        profilePicture: '',
      },
      jobDetails: {
        department: 'IT',
        designation: role === 'admin' ? 'System Administrator' : 
                     role === 'hr' ? 'HR Manager' : 'Software Engineer',
        joiningDate: new Date().toISOString(),
      }
    };

    // Manually update the auth state
    dispatch({ 
      type: 'auth/loginSuccess', 
      payload: { 
        user: testUser, 
        token: 'fake-jwt-token-for-testing' 
      } 
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Role-Based Sidebar Testing
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Use the buttons below to switch between different user roles and see how the sidebar changes.
        Each role has completely different navigation options based on their responsibilities.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current User
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip 
              label={user?.role?.toUpperCase() || 'Not Logged In'} 
              color="primary" 
              variant="filled"
            />
            <Typography variant="body2">
              {user?.profile?.firstName} {user?.profile?.lastName || 'No user logged in'}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                👑 Admin Role
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Complete system access with administrative controls, user management, 
                system configuration, and organizational setup.
              </Typography>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={() => switchRole('admin')}
                disabled={user?.role === 'admin'}
              >
                Switch to Admin
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="secondary">
                👥 HR Role
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Human Resource management including employee management, leave processing, 
                payroll, recruitment, and performance tracking.
              </Typography>
              <Button 
                variant="contained" 
                color="secondary"
                fullWidth 
                onClick={() => switchRole('hr')}
                disabled={user?.role === 'hr'}
              >
                Switch to HR
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
                👤 Employee Role
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Self-service portal for personal HR needs including profile management, 
                leave requests, attendance, payroll viewing, and personal development.
              </Typography>
              <Button 
                variant="contained" 
                color="success"
                fullWidth 
                onClick={() => switchRole('employee')}
                disabled={user?.role === 'employee'}
              >
                Switch to Employee
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Expected Sidebar Differences:
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Admin Sidebar
                </Typography>
                <Typography variant="body2" component="div">
                  • System Management<br/>
                  • User & Role Management<br/>
                  • Organization Setup<br/>
                  • Module Configuration<br/>
                  • Financial Configuration<br/>
                  • Reports & Analytics<br/>
                  • Integration & APIs<br/>
                  • Support & Maintenance
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" color="secondary" gutterBottom>
                  HR Sidebar
                </Typography>
                <Typography variant="body2" component="div">
                  • Employee Management<br/>
                  • Leave & Attendance<br/>
                  • Payroll & Compensation<br/>
                  • Performance Management<br/>
                  • Recruitment & Hiring<br/>
                  • Training & Development<br/>
                  • HR Analytics & Reports<br/>
                  • HR Policies & Compliance
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ color: 'success.main' }} gutterBottom>
                  Employee Sidebar
                </Typography>
                <Typography variant="body2" component="div">
                  • My Dashboard<br/>
                  • My Profile<br/>
                  • My Attendance<br/>
                  • My Leaves<br/>
                  • My Payroll<br/>
                  • My Performance<br/>
                  • Learning & Growth<br/>
                  • Team & Communication
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TestRoles;
