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
import ModernEmployeeManagement from './pages/employees/ModernEmployeeManagement';
import LeaveManagement from './pages/leaves/LeaveManagement';
import PayrollManagement from './pages/payroll/PayrollManagement';
import Profile from './pages/profile/ProfileSimple';
import Settings from './pages/settings/Settings';
import Login from './pages/auth/Login';
import CertificationManager from './components/certifications/CertificationManager';

// Employee Management Components
import EmployeeManagementLayout from './pages/employees/EmployeeManagementLayout';
import EmployeeDirectoryModern from './pages/employees/EmployeeDirectoryModern';
import EmployeeDepartmentsModern from './pages/employees/EmployeeDepartmentsModern';
import EmployeeAnalyticsModern from './pages/employees/EmployeeAnalyticsModern';
import EmployeeAttendanceModern from './pages/employees/EmployeeAttendanceModern';
import IntegratedEmployeeManagement from './components/employees/IntegratedEmployeeManagement';

// Employee Pages
import EmployeeProfile from './pages/employee/EmployeeProfile';
import EmployeeMyAttendance from './pages/employee/EmployeeAttendance';
import EmployeeLeaves from './pages/employee/EmployeeLeaves';
import EmployeePayroll from './pages/employee/EmployeePayroll';
import EmployeeLeaveApply from './pages/employee/EmployeeLeaveApply';
import EmployeeLeaveBalance from './pages/employee/EmployeeLeaveBalance';
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
            
            {/* Employee Management Routes with Integrated Layout */}
            <Route path="/employees" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <IntegratedEmployeeManagement />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/employees/*" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EmployeeManagementLayout />
                </RoleBasedLayout>
              </ProtectedRoute>
            }>
              {/* Employee Management Sub-routes */}
              <Route index element={<ModernEmployeeManagement />} />
              <Route path="new" element={<ModernEmployeeManagement />} />
              <Route path="edit/:id" element={<ModernEmployeeManagement />} />
              <Route path="directory" element={<EmployeeDirectoryModern />} />
              <Route path="departments" element={<EmployeeDepartmentsModern />} />
              <Route path="analytics" element={<EmployeeAnalyticsModern />} />
              <Route path="attendance" element={<EmployeeAttendanceModern />} />
              <Route path="org-chart" element={
                <PlaceholderPage 
                  title="Organization Chart" 
                  description="Visual representation of organizational hierarchy and reporting structure" 
                />
              } />
              <Route path="training" element={
                <PlaceholderPage 
                  title="Training & Development" 
                  description="Manage employee training programs and development initiatives" 
                />
              } />
              <Route path="performance" element={
                <PlaceholderPage 
                  title="Performance Reviews" 
                  description="Employee performance management and review system" 
                />
              } />
              <Route path="permissions" element={
                <PlaceholderPage 
                  title="Roles & Permissions" 
                  description="Manage user roles and access permissions (Admin only)" 
                />
              } />
            </Route>
            
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
            
            {/* Certification Management Route */}
            <Route path="/certifications" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <CertificationManager />
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
                      <h2 style={{ margin: 0, color: theme.palette.text.primary }}>HR Analytics Dashboard</h2>
                      <p style={{ color: theme.palette.text.secondary, margin: '8px 0 0 0' }}>
                        Advanced HR analytics and reporting features
                      </p>
                    </Box>
                  </Box>
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            {/* HR Management Routes */}
            <Route path="/hr/*" element={
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
                    <Box sx={{ fontSize: '3rem' }}>👥</Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <h2 style={{ margin: 0, color: theme.palette.text.primary }}>HR Management</h2>
                      <p style={{ color: theme.palette.text.secondary, margin: '8px 0 0 0' }}>
                        HR-specific management features coming soon
                      </p>
                    </Box>
                  </Box>
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            {/* Admin Management Routes */}
            <Route path="/admin/*" element={
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
                    <Box sx={{ fontSize: '3rem' }}>⚙️</Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <h2 style={{ margin: 0, color: theme.palette.text.primary }}>Admin Panel</h2>
                      <p style={{ color: theme.palette.text.secondary, margin: '8px 0 0 0' }}>
                        Administrative management features
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
                  <EmployeeMyAttendance />
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
                  <PlaceholderPage 
                    title="Company Holidays" 
                    description="View company holidays and public holidays calendar" 
                  />
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
                  <PlaceholderPage 
                    title="Training & Learning" 
                    description="Access your training programs and learning resources" 
                  />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/certifications" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <PlaceholderPage 
                    title="Certifications" 
                    description="Manage your professional certifications" 
                  />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/team" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <PlaceholderPage 
                    title="My Team" 
                    description="View team members and collaboration tools" 
                  />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/announcements" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <PlaceholderPage 
                    title="Announcements" 
                    description="View company announcements and news" 
                  />
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
                  <PlaceholderPage 
                    title="Emergency Contacts" 
                    description="Manage your emergency contact information" 
                  />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/documents" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <PlaceholderPage 
                    title="My Documents" 
                    description="Access and manage your personal documents" 
                  />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/bank-details" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <PlaceholderPage 
                    title="Bank Details" 
                    description="Manage your banking information for payroll" 
                  />
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
                  <PlaceholderPage 
                    title="My Skills" 
                    description="Manage your skills and competencies" 
                  />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/career-path" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <PlaceholderPage 
                    title="Career Development" 
                    description="Explore your career growth opportunities" 
                  />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee/directory" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <PlaceholderPage 
                    title="Employee Directory" 
                    description="Search and connect with colleagues" 
                  />
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
