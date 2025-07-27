import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store/store';
import theme from './theme/theme';

// Layout Components
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

// Page Components
import Dashboard from './pages/dashboards/RoleBasedDashboard';
import EmployeeList from './pages/employees/EmployeeListModern';
import EmployeeForm from './components/employees/EmployeeForm';
import LeaveManagement from './pages/leaves/LeaveManagement';
import PayrollManagement from './pages/payroll/PayrollManagement';
import Profile from './pages/profile/Profile';
import Settings from './pages/settings/Settings';
import Login from './pages/auth/Login';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
            
            {/* Protected Routes with Dashboard Layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Navigate to="/dashboard" replace />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Employee Management Routes */}
            <Route path="/employees" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EmployeeList />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/employees/new" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                    <EmployeeForm
                      open={true}
                      onClose={() => window.history.back()}
                      onSave={(employee) => {
                        console.log('Employee saved:', employee);
                        window.history.back();
                      }}
                      employee={null}
                      mode="add"
                      currentUserRole="hr"
                    />
                  </Box>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/employees/edit/:id" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                    <EmployeeForm
                      open={true}
                      onClose={() => window.history.back()}
                      onSave={(employee) => {
                        console.log('Employee updated:', employee);
                        window.history.back();
                      }}
                      employee={null}
                      mode="edit"
                      currentUserRole="hr"
                    />
                  </Box>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Leave Management Routes */}
            <Route path="/leaves" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <LeaveManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/leaves/calendar" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minHeight: '60vh',
                    flexDirection: 'column',
                    gap: 2
                  }}>
                    <Box sx={{ fontSize: '3rem' }}>📅</Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <h2 style={{ margin: 0, color: theme.palette.text.primary }}>Leave Calendar</h2>
                      <p style={{ color: theme.palette.text.secondary, margin: '8px 0 0 0' }}>
                        Interactive calendar view for leave management
                      </p>
                    </Box>
                  </Box>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Payroll Management Routes */}
            <Route path="/payroll" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PayrollManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/payroll/payslips" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minHeight: '60vh',
                    flexDirection: 'column',
                    gap: 2
                  }}>
                    <Box sx={{ fontSize: '3rem' }}>🧾</Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <h2 style={{ margin: 0, color: theme.palette.text.primary }}>Payslip Viewer</h2>
                      <p style={{ color: theme.palette.text.secondary, margin: '8px 0 0 0' }}>
                        View and download employee payslips
                      </p>
                    </Box>
                  </Box>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/payroll/calculator" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minHeight: '60vh',
                    flexDirection: 'column',
                    gap: 2
                  }}>
                    <Box sx={{ fontSize: '3rem' }}>🧮</Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <h2 style={{ margin: 0, color: theme.palette.text.primary }}>Salary Calculator</h2>
                      <p style={{ color: theme.palette.text.secondary, margin: '8px 0 0 0' }}>
                        Calculate salaries and tax deductions
                      </p>
                    </Box>
                  </Box>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Profile Route */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Settings Route */}
            <Route path="/settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Analytics Route */}
            <Route path="/analytics" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minHeight: '60vh',
                    flexDirection: 'column',
                    gap: 2
                  }}>
                    <Box sx={{ fontSize: '3rem' }}>📊</Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <h2 style={{ margin: 0, color: theme.palette.text.primary }}>Analytics Dashboard</h2>
                      <p style={{ color: theme.palette.text.secondary, margin: '8px 0 0 0' }}>
                        Advanced analytics and reporting features
                      </p>
                    </Box>
                  </Box>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
