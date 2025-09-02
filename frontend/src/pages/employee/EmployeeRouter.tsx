import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import RoleBasedLayout from '../../components/layout/RoleBasedLayout';
import PlaceholderPage from '../../components/common/PlaceholderPage';

// Employee Pages
import EmployeeDashboard from '../dashboards/EmployeeDashboard'; // Use the comprehensive dashboard
import EmployeeProfile from './EmployeeProfile';
import EmployeeMyAttendance from './EmployeeAttendance';
import EmployeeLeaves from './EmployeeLeaves';
import EmployeePayroll from './EmployeePayroll';
import EmployeeLeaveApply from './EmployeeLeaveApply';
import EmployeeLeaveBalance from './EmployeeLeaveBalance';

const EmployeeRouter: React.FC = () => {
  return (
    <Routes>
      {/* Default route - redirect to dashboard */}
      <Route index element={
        <ProtectedRoute requiredRole="employee">
          <RoleBasedLayout>
            <EmployeeDashboard />
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      {/* Employee Dashboard */}
      <Route path="dashboard" element={
        <ProtectedRoute requiredRole="employee">
          <RoleBasedLayout>
            <EmployeeDashboard />
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      {/* Profile Management */}
      <Route path="profile" element={
        <ProtectedRoute requiredRole="employee">
          <RoleBasedLayout>
            <EmployeeProfile />
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      {/* Attendance Management */}
      <Route path="attendance" element={
        <ProtectedRoute requiredRole="employee">
          <RoleBasedLayout>
            <EmployeeMyAttendance />
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      {/* Leave Management */}
      <Route path="leave/apply" element={
        <ProtectedRoute requiredRole="employee">
          <RoleBasedLayout>
            <EmployeeLeaveApply />
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      <Route path="leave/history" element={
        <ProtectedRoute requiredRole="employee">
          <RoleBasedLayout>
            <EmployeeLeaves />
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      <Route path="leave/balance" element={
        <ProtectedRoute requiredRole="employee">
          <RoleBasedLayout>
            <EmployeeLeaveBalance />
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      {/* Payroll Management */}
      <Route path="payroll" element={
        <ProtectedRoute requiredRole="employee">
          <RoleBasedLayout>
            <EmployeePayroll />
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      {/* Certifications Management */}
      <Route path="certifications" element={
        <ProtectedRoute requiredRole="employee">
          <RoleBasedLayout>
            <PlaceholderPage 
              title="My Certifications" 
              description="Manage your professional certifications and skills for career development" 
            />
          </RoleBasedLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default EmployeeRouter;
