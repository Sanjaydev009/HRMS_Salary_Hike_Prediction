import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store/store';
import theme from './theme/theme';

// Layout Components
import RoleBasedLayout from './components/layout/RoleBasedLayout';
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
import TestRoles from './pages/TestRoles';

// Employee Pages
import EmployeeProfile from './pages/employee/EmployeeProfile';
import EmployeeAttendance from './pages/employee/EmployeeAttendance';
import EmployeeLeaves from './pages/employee/EmployeeLeaves';
import EmployeePayroll from './pages/employee/EmployeePayroll';
import EmployeeLearning from './pages/employee/EmployeeLearning';
import EmployeeTeam from './pages/employee/EmployeeTeam';
import EmployeeDocuments from './pages/employee/EmployeeDocuments';
import EmployeeEmergencyContacts from './pages/employee/EmployeeEmergencyContacts';
import EmployeeBankDetails from './pages/employee/EmployeeBankDetails';
import EmployeeMyAttendance from './pages/employee/EmployeeMyAttendance';
import EmployeeLeaveApply from './pages/employee/EmployeeLeaveApply';
import EmployeeLeaveBalance from './pages/employee/EmployeeLeaveBalance';
import EmployeeHolidays from './pages/employee/EmployeeHolidays';
import PlaceholderPage from './components/common/PlaceholderPage';

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
            
            {/* Root redirect to login if not authenticated */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Test Roles Route - No Auth Required */}
            <Route path="/test-roles" element={<TestRoles />} />
            
            {/* Protected Routes with Role-Based Layout */}
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <Dashboard />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <Dashboard />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            {/* Employee Management Routes */}
            <Route path="/employees" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeeList />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/employees/new" element={
              <ProtectedRoute>
                <RoleBasedLayout>
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
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/employees/edit/:id" element={
              <ProtectedRoute>
                <RoleBasedLayout>
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
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            {/* Leave Management Routes */}
            <Route path="/leaves" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <LeaveManagement />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/leaves/calendar" element={
              <ProtectedRoute>
                <RoleBasedLayout>
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
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            {/* Payroll Management Routes */}
            <Route path="/payroll" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <PayrollManagement />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/payroll/payslips" element={
              <ProtectedRoute>
                <RoleBasedLayout>
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
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/payroll/calculator" element={
              <ProtectedRoute>
                <RoleBasedLayout>
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
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            {/* Profile Route */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <Profile />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            {/* Settings Route */}
            <Route path="/settings" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <Settings />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            {/* Analytics Route */}
            <Route path="/analytics" element={
              <ProtectedRoute>
                <RoleBasedLayout>
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
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            {/* Employee Routes */}
            <Route path="/employee/profile" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeeProfile />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/attendance" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeeAttendance />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/my-attendance" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeeMyAttendance />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/leaves" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeeLeaves />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/leave/apply" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeeLeaveApply />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/leave-balance" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeeLeaveBalance />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/holidays" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeeHolidays />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/payroll" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeePayroll />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/training" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeeLearning />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/certifications" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeeLearning />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/team" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeeTeam />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/announcements" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeeTeam />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            {/* Additional Employee Routes with Placeholders */}
            <Route path="/employee/contact" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <PlaceholderPage 
                    title="Contact Details" 
                    description="Update your contact information and emergency contacts." 
                  />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/emergency-contacts" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeeEmergencyContacts />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/documents" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeeDocuments />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/bank-details" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeeBankDetails />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/timesheets" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <PlaceholderPage 
                    title="My Timesheets" 
                    description="View and submit your daily timesheets and work logs." 
                  />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/overtime" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <PlaceholderPage 
                    title="Overtime Requests" 
                    description="Submit and track your overtime work requests." 
                  />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/leave-calendar" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <PlaceholderPage 
                    title="Leave Calendar" 
                    description="View team leave calendar and plan your time off." 
                  />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/payslips" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeePayroll />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/tax-documents" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <PlaceholderPage 
                    title="Tax Documents" 
                    description="Download your tax documents and salary certificates." 
                  />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/benefits" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <PlaceholderPage 
                    title="My Benefits" 
                    description="View your employee benefits and insurance information." 
                  />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/goals" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <PlaceholderPage 
                    title="My Goals" 
                    description="Set and track your personal and professional goals." 
                  />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/performance" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <PlaceholderPage 
                    title="Performance Reviews" 
                    description="View your performance reviews and feedback." 
                  />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/achievements" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <PlaceholderPage 
                    title="My Achievements" 
                    description="Track your accomplishments and recognition received." 
                  />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/feedback" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <PlaceholderPage 
                    title="Feedback Received" 
                    description="View feedback from managers, peers, and subordinates." 
                  />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/skills" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeeLearning />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/career-path" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeeLearning />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/directory" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeeTeam />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/support" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <PlaceholderPage 
                    title="Request Support" 
                    description="Get help from IT support, HR, or submit a help desk ticket." 
                  />
                </RoleBasedLayout>
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
