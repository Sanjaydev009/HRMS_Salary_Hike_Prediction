# HRMS Login Credentials

## Test User Accounts

### 🔴 Admin User

- **Email:** sanju.admin@gmail.com
- **Password:** admin123
- **Role:** Administrator
- **Access:** Full system access, user management, system configuration

### 👥 HR Manager

- **Email:** hr.manager@gmail.com
- **Password:** hrmanager123
- **Role:** HR Manager
- **Access:** Employee management, payroll, organization-wide analytics

### Employee

- **Email:** employee.dev@gmail.com
- **Password:** employee123
- **Role:** Employee
- **Access:** Personal dashboard, profile management, leave requests, attendance tracking

---

## Application URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

## Enhanced Employee Features

The employee dashboard now includes:

- ✅ Personal profile management with photo uploads
- ✅ Real-time attendance tracking (check-in/out)
- ✅ Certification management for career development
- ✅ Leave balance and application system
- ✅ Salary information and payslip access
- ✅ Quick action buttons for common tasks

## API Endpoints Added

- `GET /api/dashboard/employee` - Enhanced employee dashboard data
- `POST /api/profile/upload-photo` - Profile photo upload
- `GET /api/certifications` - Get employee certifications
- `POST /api/certifications` - Add new certification
- `POST /api/attendance/check-in` - Check-in functionality
- `POST /api/attendance/check-out` - Check-out functionality
- `GET /api/attendance/today` - Today's attendance status

---

**Note:** All test accounts are fully functional and include proper role-based access control.
