# Role-Based Dashboard System

## Overview

The HRMS now features a comprehensive role-based dashboard system that provides different interfaces and data access based on user roles. Each role has a customized dashboard with appropriate permissions and data visibility.

## Role-Based Dashboards

### 1. Employee Dashboard (`/dashboard` - employee role)

**Access Level:** Personal data only, real-time updates
**Features:**

- Personal leave statistics (total, pending, approved, remaining)
- Current salary information and next payday
- Leave balance breakdown (casual, sick, annual)
- Personal activity history
- Quick actions: Apply leave, update profile, view payslips

**API Endpoint:** `GET /api/dashboard/employee-stats`
**Permissions:**

- ❌ Cannot view all employees
- ❌ Cannot manage leaves
- ❌ Cannot process payroll
- ❌ Cannot manage users
- 🔒 Restricted access (personal data only)

### 2. HR Dashboard (`/dashboard` - hr role)

**Access Level:** Organization-wide HR management
**Features:**

- Organization statistics (employees, departments, hires)
- Leave management across all departments
- Payroll overview and processing status
- HR metrics (satisfaction, tenure, turnover)
- Department distribution analytics
- Company-wide activity monitoring
- Quick actions: Employee management, leave processing, payroll, reports

**API Endpoint:** `GET /api/dashboard/hr-stats`
**Permissions:**

- ✅ Can view all employees
- ✅ Can manage leaves (all)
- ✅ Can process payroll
- ❌ Cannot manage users (admin only)
- 🏢 Organization scope access

### 3. Admin Dashboard (`/dashboard` - admin role)

**Access Level:** Complete system administration
**Features:**

- System statistics (users, uptime, storage, API requests)
- User management by role distribution
- System health monitoring (CPU, memory, disk usage)
- Security and backup status
- System activity logs
- Quick actions: User management, security center, database, backup

**API Endpoint:** `GET /api/dashboard/admin-stats`
**Permissions:**

- ✅ Can view all employees
- ✅ Can manage leaves (all)
- ✅ Can process payroll
- ✅ Can manage users
- 🔧 System administration access

## Technical Implementation

### Frontend Components

- `RoleBasedDashboard.tsx` - Main router component
- `EmployeeDashboard.tsx` - Employee-specific interface
- `HRDashboard.tsx` - HR-specific interface
- `AdminDashboard.tsx` - Admin-specific interface

### Backend Routes

- `GET /api/dashboard/employee-stats` - Employee dashboard data
- `GET /api/dashboard/hr-stats` - HR dashboard data
- `GET /api/dashboard/admin-stats` - Admin dashboard data
- `GET /api/dashboard/stats` - General stats (role-filtered)
- `GET /api/dashboard/activities` - Activities (role-filtered)
- `GET /api/dashboard/summary` - Quick summary (all roles)

### Authentication & Authorization

- JWT-based authentication required for all endpoints
- Role-specific endpoint access control
- Data filtering based on user role and permissions
- Real-time token validation and user verification

## Test Results

✅ **Employee Dashboard:** Working - Personal data only, restricted access
✅ **HR Dashboard:** Working - Organization-wide HR management
✅ **Admin Dashboard:** Working - System administration (requires admin user)

## Usage

### Login Credentials for Testing

- **Employee:** `john.doe@company.com` / `password123`
- **HR:** `hr@company.com` / `password123`
- **Admin:** `admin@company.com` / `password123`

### Navigation

1. Login with appropriate credentials
2. Navigate to `/dashboard`
3. The system automatically routes to the role-specific dashboard
4. Real-time data updates every 30 seconds
5. Role-appropriate quick actions available

## Security Features

- Role-based access control (RBAC)
- JWT token authentication
- Data filtering based on user permissions
- Unauthorized access prevention
- Real-time session validation

## Customization

Each dashboard can be customized by:

1. Modifying the respective component files
2. Adding new API endpoints for additional data
3. Updating permission structures
4. Implementing role-specific features

## Future Enhancements

- Dashboard customization by users
- Additional role types (e.g., Finance, Legal)
- Advanced analytics and reporting
- Real-time notifications
- Mobile-responsive optimizations
