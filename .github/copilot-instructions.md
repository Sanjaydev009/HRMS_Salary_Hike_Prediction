<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# HRMS - Human Resource Management System

A comprehensive full-stack HRMS built with MERN stack + ML capabilities for intelligent HR management and salary predictions.

## Architecture Overview

**3-Tier Service Architecture:**
- **Backend**: Node.js/Express API (`backend/`) - Port 5001 (not 5000!)
- **Frontend**: React/TypeScript + Vite (`frontend/`) - Port 5173
- **ML Service**: FastAPI Python (`ml-module/`) - Port 8000

**Key Integration Points:**
- Vite proxy: `/api` → `http://localhost:5001`, `/ml` → `http://localhost:8000`
- MongoDB: `mongodb://localhost:27017/hrms`
- JWT authentication with role-based access control (employee/hr/admin)

## Critical Development Workflows

**Start Development Environment:**
```bash
# Root level - starts all services
npm run dev

# Individual services
npm run backend   # Backend only
npm run frontend  # Frontend only  
npm run ml       # ML service only
```

**Port Configuration (IMPORTANT):**
- Backend: `PORT=5001` (in `.env`) - NOT 5000!
- Frontend: `5173` (Vite default)
- CORS origins: `[http://localhost:3000, http://localhost:5173, http://localhost:5174]`

## Role-Based Architecture Patterns

**Authentication Flow:**
1. JWT token in `Authorization: Bearer <token>` header
2. `auth` middleware validates token + user status
3. `authorize('role1', 'role2')` middleware for role checks
4. Frontend `ProtectedRoute` component handles route-based access

**Critical Role Hierarchy:** `employee < hr < admin`
- Employees: Self-data only
- HR: Organization-wide management (not user management)  
- Admin: Full system access including user role management

**Route Protection Pattern:**
```tsx
<Route path="/employees" element={
  <ProtectedRoute allowedRoles={['hr', 'admin']}>
    <RoleBasedLayout><Component /></RoleBasedLayout>
  </ProtectedRoute>
} />
```

## Database Schema Conventions

**User Model Structure:**
- `employeeId`: Unique string identifier
- `role`: enum ['employee', 'hr', 'manager', 'admin']
- `status`: enum ['active', 'inactive', 'terminated', 'suspended']
- `isFirstLogin`: Boolean for password reset workflow
- `profile`: Nested object with personal info
- `jobDetails`: Nested object with work info

**API Response Format:**
```js
{
  success: boolean,
  message: string,
  data: object | array,
  error?: string (dev only)
}
```

## Frontend State Management

**Redux Toolkit Structure:**
- `store/slices/authSlice.ts`: Authentication + user state
- `contexts/AuthContext.tsx`: React context wrapper
- `services/api.ts`: Axios instance with interceptors

**Material-UI Conventions:**
- Use MUI components consistently
- Custom theme in `theme/theme.ts`
- Responsive design with `sx` prop patterns
- Professional color palette and consistent spacing

## ML Service Integration

**Salary Hike Prediction System:**
- Endpoint: `POST /predict` 
- Input: Current employee data + performance metrics
- Output: Hike percentage recommendations, not absolute salary
- Key factors: experience, performance, certifications, attendance

**ML Request Pattern:**
```js
const mlResponse = await fetch('/ml/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ employee_data: data })
});
```

## Security & Error Handling Patterns

**Backend Security Stack:**
- Helmet, CORS, compression middleware
- Rate limiting: 1000 requests/15min (dev), 100 (prod)
- Auth rate limiting: 500 requests/15min (dev), 50 (prod)
- Password: bcrypt with rounds=12

**Error Handling:**
- Development: Full error messages
- Production: Generic error responses
- Console logging for all errors
- HTTP status codes: 200 (success), 400 (validation), 401 (auth), 403 (forbidden), 500 (server)

## Component Architecture Patterns

**Layout System:**
- `RoleBasedLayout`: Main layout wrapper
- `ProtectedRoute`: Authentication + authorization
- Role-specific dashboards: `EmployeeDashboard`, `HRDashboard`, `AdminDashboard`

**Calendar Implementation:**
- Custom calendar using Material-UI (not react-big-calendar)
- Components: `ProfessionalLeaveCalendar.tsx`, `LeaveCalendarPage.tsx`
- Backend routes: `/api/calendar/*` with sample data

## Development Debugging

**Common Issues:**
1. **Port conflicts**: Backend uses 5001, not 5000
2. **CORS errors**: Check origin whitelist in `server.js`
3. **Auth failures**: Verify JWT_SECRET in `.env`
4. **Calendar imports**: Uses custom implementation, not external libraries

**Testing Credentials:**
- Employee: `employee.dev@gmail.com` / `employee123`
- HR: `hr.admin@gmail.com` / `hr123`
- Admin: `admin.dev@gmail.com` / `admin123`

**Environment Variables:**
- Backend `.env`: `PORT=5001`, `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL=http://localhost:5173`
- Frontend uses Vite proxy, no `.env` needed for API URLs

## Integration Points

**Email System:** 
- Service: `services/emailService.js`
- SMTP: Gmail with app passwords
- Templates: Professional HTML emails

**File Uploads:**
- Path: `backend/uploads/`
- Max size: 5MB
- Supported: Images, PDFs for certifications

**Real-time Features:**
- Dashboard updates every 30 seconds
- Live statistics and analytics
- Real-time role-based data filtering
