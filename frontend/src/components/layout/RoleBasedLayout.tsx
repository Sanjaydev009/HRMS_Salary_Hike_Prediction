import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Chip,
  useTheme,
  useMediaQuery,
  Collapse,
  Stack,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  Payment as PaymentIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  Person as PersonIcon,
  CalendarMonth,
  RequestPage,
  MonetizationOn,
  Receipt,
  Calculate,
  BarChart,
  AccountCircle,
  AdminPanelSettings,
  Assignment,
  Schedule,
  TrendingUp,
  Security,
  Storage,
  CloudSync,
  Speed,
  Group,
  Assessment,
  Timeline,
  Inventory,
  PersonAdd,
  HowToReg,
  PostAdd,
  DateRange,
  AttachMoney,
  PieChart,
  Diversity3,
  WorkHistory,
  AccountBalance,
  MoreTime,
  Savings,
  Star,
  School,
  ContactPhone,
  Campaign,
  Support,
  // Additional icons for enhanced navigation
  Business,
  BusinessCenter as BusinessIcon,
  Category,
  Code,
  ConfirmationNumber,
  Email,
  Extension,
  Help,
  ImportExport,
  IntegrationInstructions,
  Key,
  Link,
  LocationOn,
  MenuBook,
  MonitorHeart,
  NotificationsActive,
  Settings,
  SystemUpdate,
  ToggleOn,
  VpnKey,
  Warning,
  Webhook,
  WorkOutline,
  ExitToApp,
  Approval,
  BackupTable,
  Build,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { RootState } from '../../store/store';

const drawerWidth = 280;

interface NavigationItem {
  text: string;
  icon: React.ReactElement;
  path?: string;
  badge?: number;
  children?: NavigationItem[];
  onClick?: () => void;
}

interface RoleBasedLayoutProps {
  children: React.ReactNode;
}

const RoleBasedLayout: React.FC<RoleBasedLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['dashboard']);

  // Role-specific navigation items
  const getNavigationItems = (): NavigationItem[] => {
    const role = user?.role?.toLowerCase();
    
    switch (role) {
      case 'admin':
        return [
          {
            text: 'Admin Dashboard',
            icon: <DashboardIcon />,
            path: '/dashboard',
          },
          {
            text: 'System Management',
            icon: <SettingsIcon />,
            children: [
              { text: 'System Settings', icon: <Settings />, path: '/admin/settings' },
              { text: 'System Health', icon: <MonitorHeart />, path: '/admin/health' },
              { text: 'Database Management', icon: <Storage />, path: '/admin/database' },
              { text: 'System Logs', icon: <Assignment />, path: '/admin/logs' },
              { text: 'Security Audit', icon: <Security />, path: '/admin/security-audit' },
              { text: 'Backup & Recovery', icon: <BackupTable />, path: '/admin/backup' },
            ],
          },
          {
            text: 'User & Role Management',
            icon: <PeopleIcon />,
            children: [
              { text: 'All Users', icon: <Group />, path: '/admin/users' },
              { text: 'Role Management', icon: <AdminPanelSettings />, path: '/admin/roles' },
              { text: 'User Permissions', icon: <Security />, path: '/admin/permissions' },
              { text: 'Access Control', icon: <VpnKey />, path: '/admin/access-control' },
              { text: 'Password Policies', icon: <Key />, path: '/admin/password-policies' },
              { text: 'User Activity Logs', icon: <Timeline />, path: '/admin/user-logs' },
            ],
          },
          {
            text: 'Organization Setup',
            icon: <BusinessIcon />,
            children: [
              { text: 'Company Profile', icon: <Business />, path: '/admin/company' },
              { text: 'Department Setup', icon: <Diversity3 />, path: '/admin/departments' },
              { text: 'Designation Management', icon: <WorkOutline />, path: '/admin/designations' },
              { text: 'Location Management', icon: <LocationOn />, path: '/admin/locations' },
              { text: 'Cost Centers', icon: <AccountBalance />, path: '/admin/cost-centers' },
            ],
          },
          {
            text: 'Module Configuration',
            icon: <Extension />,
            children: [
              { text: 'Module Settings', icon: <Settings />, path: '/admin/modules' },
              { text: 'Feature Toggles', icon: <ToggleOn />, path: '/admin/features' },
              { text: 'Workflow Setup', icon: <Timeline />, path: '/admin/workflows' },
              { text: 'Approval Matrix', icon: <Approval />, path: '/admin/approvals' },
              { text: 'Email Templates', icon: <Email />, path: '/admin/email-templates' },
              { text: 'Notification Settings', icon: <NotificationsActive />, path: '/admin/notifications' },
            ],
          },
          {
            text: 'Financial Configuration',
            icon: <PaymentIcon />,
            children: [
              { text: 'Salary Components', icon: <MonetizationOn />, path: '/admin/salary-components' },
              { text: 'Tax Settings', icon: <Receipt />, path: '/admin/tax-settings' },
              { text: 'Currency Management', icon: <AttachMoney />, path: '/admin/currency' },
              { text: 'Expense Categories', icon: <Category />, path: '/admin/expense-categories' },
              { text: 'Payment Methods', icon: <PaymentIcon />, path: '/admin/payment-methods' },
            ],
          },
          {
            text: 'Reports & Analytics',
            icon: <AnalyticsIcon />,
            children: [
              { text: 'System Analytics', icon: <PieChart />, path: '/admin/analytics' },
              { text: 'Usage Reports', icon: <Assessment />, path: '/admin/usage-reports' },
              { text: 'Performance Metrics', icon: <Speed />, path: '/admin/performance' },
              { text: 'User Engagement', icon: <TrendingUp />, path: '/admin/engagement' },
              { text: 'System Alerts', icon: <Warning />, path: '/admin/alerts' },
            ],
          },
          {
            text: 'Integration & APIs',
            icon: <IntegrationInstructions />,
            children: [
              { text: 'API Management', icon: <Code />, path: '/admin/api' },
              { text: 'Third-party Integrations', icon: <Link />, path: '/admin/integrations' },
              { text: 'Data Import/Export', icon: <ImportExport />, path: '/admin/data-transfer' },
              { text: 'Webhooks', icon: <Webhook />, path: '/admin/webhooks' },
              { text: 'External Connections', icon: <CloudSync />, path: '/admin/connections' },
            ],
          },
          {
            text: 'Support & Maintenance',
            icon: <Support />,
            children: [
              { text: 'Support Tickets', icon: <ConfirmationNumber />, path: '/admin/tickets' },
              { text: 'System Maintenance', icon: <Build />, path: '/admin/maintenance' },
              { text: 'Update Management', icon: <SystemUpdate />, path: '/admin/updates' },
              { text: 'Help Documentation', icon: <Help />, path: '/admin/help' },
              { text: 'Training Materials', icon: <School />, path: '/admin/training' },
            ],
          },
        ];      case 'hr':
        return [
          {
            text: 'HR Dashboard',
            icon: <DashboardIcon />,
            path: '/dashboard',
          },
          {
            text: 'Employee Management',
            icon: <PeopleIcon />,
            children: [
              { text: 'All Employees', icon: <Group />, path: '/employees' },
              { text: 'Add New Employee', icon: <PersonAdd />, path: '/employees/new' },
              { text: 'Employee Profiles', icon: <PersonIcon />, path: '/hr/profiles' },
              { text: 'Onboarding Process', icon: <HowToReg />, path: '/hr/onboarding' },
              { text: 'Employee Documents', icon: <Assignment />, path: '/hr/documents' },
              { text: 'Exit Process', icon: <ExitToApp />, path: '/hr/exit-process' },
            ],
          },
          {
            text: 'Leave & Attendance',
            icon: <EventNoteIcon />,
            children: [
              { text: 'Leave Requests', icon: <RequestPage />, path: '/leaves' },
              { text: 'Attendance Overview', icon: <Schedule />, path: '/hr/attendance' },
              { text: 'Leave Calendar', icon: <CalendarMonth />, path: '/leaves/calendar' },
              { text: 'Leave Policies', icon: <PostAdd />, path: '/hr/leave-policies' },
              { text: 'Holiday Management', icon: <DateRange />, path: '/hr/holidays' },
              { text: 'Overtime Approvals', icon: <MoreTime />, path: '/hr/overtime' },
            ],
          },
          {
            text: 'Payroll & Compensation',
            icon: <PaymentIcon />,
            children: [
              { text: 'Payroll Processing', icon: <MonetizationOn />, path: '/payroll' },
              { text: 'Salary Management', icon: <Calculate />, path: '/payroll/calculator' },
              { text: 'Payslip Viewer', icon: <Receipt />, path: '/payroll/payslips' },
              { text: 'Bonus & Incentives', icon: <AttachMoney />, path: '/hr/bonuses' },
              { text: 'Tax Processing', icon: <Receipt />, path: '/hr/tax-processing' },
              { text: 'Benefits Administration', icon: <Savings />, path: '/hr/benefits' },
            ],
          },
          {
            text: 'Performance Management',
            icon: <TrendingUp />,
            children: [
              { text: 'Performance Reviews', icon: <Assessment />, path: '/hr/performance' },
              { text: 'Goal Management', icon: <Assignment />, path: '/hr/goals' },
              { text: 'Performance Reports', icon: <BarChart />, path: '/hr/performance-reports' },
              { text: 'Employee Feedback', icon: <Star />, path: '/hr/feedback' },
              { text: 'Career Development', icon: <TrendingUp />, path: '/hr/career-development' },
            ],
          },
          {
            text: 'Recruitment & Hiring',
            icon: <Diversity3 />,
            children: [
              { text: 'Job Postings', icon: <PostAdd />, path: '/hr/jobs' },
              { text: 'Job Applications', icon: <Assignment />, path: '/hr/applications' },
              { text: 'Interview Scheduling', icon: <Schedule />, path: '/hr/interviews' },
              { text: 'Candidate Database', icon: <Group />, path: '/hr/candidates' },
              { text: 'Offer Management', icon: <AttachMoney />, path: '/hr/offers' },
            ],
          },
          {
            text: 'Training & Development',
            icon: <School />,
            children: [
              { text: 'Training Programs', icon: <Inventory />, path: '/hr/training' },
              { text: 'Skills Assessment', icon: <Assessment />, path: '/hr/skills' },
              { text: 'Certification Tracking', icon: <Assignment />, path: '/hr/certifications' },
              { text: 'Learning Paths', icon: <Timeline />, path: '/hr/learning-paths' },
            ],
          },
          {
            text: 'HR Analytics & Reports',
            icon: <AnalyticsIcon />,
            children: [
              { text: 'HR Analytics', icon: <PieChart />, path: '/analytics' },
              { text: 'Employee Reports', icon: <Assessment />, path: '/hr/reports' },
              { text: 'Attendance Reports', icon: <Schedule />, path: '/hr/attendance-reports' },
              { text: 'Payroll Reports', icon: <Receipt />, path: '/hr/payroll-reports' },
              { text: 'Turnover Analysis', icon: <TrendingUp />, path: '/hr/turnover' },
            ],
          },
          {
            text: 'HR Policies & Compliance',
            icon: <Security />,
            children: [
              { text: 'Company Policies', icon: <Assignment />, path: '/hr/policies' },
              { text: 'Compliance Tracking', icon: <Security />, path: '/hr/compliance' },
              { text: 'Audit Management', icon: <Timeline />, path: '/hr/audit' },
              { text: 'Employee Handbook', icon: <MenuBook />, path: '/hr/handbook' },
            ],
          },
        ];

      case 'employee':
      default:
        return [
          {
            text: 'My Dashboard',
            icon: <DashboardIcon />,
            path: '/dashboard',
          },
          {
            text: 'My Profile',
            icon: <PersonIcon />,
            children: [
              { text: 'Personal Info', icon: <AccountCircle />, path: '/employee/profile' },
              { text: 'Emergency Contacts', icon: <Group />, path: '/employee/emergency-contacts' },
              { text: 'My Documents', icon: <Assignment />, path: '/employee/documents' },
              { text: 'Bank Details', icon: <AccountBalance />, path: '/employee/bank-details' },
            ],
          },
          {
            text: 'My Attendance',
            icon: <Schedule />,
            children: [
              { text: 'Check In/Out', icon: <WorkHistory />, path: '/employee/attendance' },
              { text: 'Attendance History', icon: <Schedule />, path: '/employee/my-attendance' },
              { text: 'Work Hours Summary', icon: <Timeline />, path: '/employee/work-hours' },
              { text: 'Overtime Requests', icon: <MoreTime />, path: '/employee/overtime' },
            ],
          },
          {
            text: 'My Leaves',
            icon: <EventNoteIcon />,
            children: [
              { text: 'Apply for Leave', icon: <RequestPage />, path: '/employee/leave/apply' },
              { text: 'My Leave History', icon: <EventNoteIcon />, path: '/employee/leaves' },
              { text: 'Leave Balance', icon: <CalendarMonth />, path: '/employee/leave-balance' },
              { text: 'Company Holidays', icon: <DateRange />, path: '/employee/holidays' },
            ],
          },
          {
            text: 'My Payroll',
            icon: <PaymentIcon />,
            children: [
              { text: 'Current Payslip', icon: <Receipt />, path: '/employee/payslips/current' },
              { text: 'All Payslips', icon: <Receipt />, path: '/employee/payslips' },
              { text: 'Salary History', icon: <MonetizationOn />, path: '/employee/salary-history' },
              { text: 'Tax Documents', icon: <Assignment />, path: '/employee/tax-documents' },
              { text: 'Investment Declarations', icon: <Savings />, path: '/employee/investments' },
            ],
          },
          {
            text: 'My Performance',
            icon: <TrendingUp />,
            children: [
              { text: 'My Goals', icon: <Assignment />, path: '/employee/goals' },
              { text: 'Performance Review', icon: <Assessment />, path: '/employee/performance' },
              { text: 'My Achievements', icon: <Star />, path: '/employee/achievements' },
              { text: 'Feedback Received', icon: <BarChart />, path: '/employee/feedback' },
            ],
          },
          {
            text: 'Learning & Growth',
            icon: <School />,
            children: [
              { text: 'My Training', icon: <Inventory />, path: '/employee/training' },
              { text: 'My Certifications', icon: <Assignment />, path: '/employee/certifications' },
              { text: 'Skill Development', icon: <Assessment />, path: '/employee/skills' },
              { text: 'Career Path', icon: <TrendingUp />, path: '/employee/career-path' },
            ],
          },
          {
            text: 'Team & Communication',
            icon: <Group />,
            children: [
              { text: 'My Team', icon: <Group />, path: '/employee/team' },
              { text: 'Company Directory', icon: <ContactPhone />, path: '/employee/directory' },
              { text: 'Announcements', icon: <Campaign />, path: '/employee/announcements' },
              { text: 'Request Support', icon: <Support />, path: '/employee/support' },
            ],
          },
        ];
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (menuText: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuText)
        ? prev.filter(item => item !== menuText)
        : [...prev, menuText]
    );
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleProfileMenuClose();
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '#ff4569';
      case 'hr':
        return '#2196f3';
      case 'manager':
        return '#ff9800';
      case 'employee':
      default:
        return '#4caf50';
    }
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = location.pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.text);

    return (
      <React.Fragment key={item.text}>
        <ListItem disablePadding sx={{ pl: level * 2 }}>
          <ListItemButton
            selected={isActive}
            onClick={() => {
              if (hasChildren) {
                handleMenuClick(item.text);
              } else if (item.path) {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              } else if (item.onClick) {
                item.onClick();
              }
            }}
            sx={{
              borderRadius: '12px',
              mx: 1,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: theme.palette.primary.main + '20',
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.primary.main + '30',
                },
              },
              '&:hover': {
                bgcolor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: isActive ? theme.palette.primary.main : 'inherit',
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
              }}
            />
            {item.badge && (
              <Badge
                badgeContent={item.badge}
                color="error"
                sx={{ mr: hasChildren ? 1 : 0 }}
              />
            )}
            {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderNavigationItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 40,
              height: 40,
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}
          >
            {user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
              {user?.profile?.firstName} {user?.profile?.lastName}
            </Typography>
            <Chip
              label={user?.role?.toUpperCase()}
              size="small"
              sx={{
                bgcolor: getRoleColor(user?.role || '') + '20',
                color: getRoleColor(user?.role || ''),
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          </Box>
        </Stack>
      </Box>
      <Divider />
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
        <List>
          {getNavigationItems().map(item => renderNavigationItem(item))}
        </List>
      </Box>
      
      <Divider />
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '12px',
            color: theme.palette.error.main,
            '&:hover': {
              bgcolor: theme.palette.error.main + '10',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            HRMS - {user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User'} Portal
          </Typography>
          
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 1 }}>
              <Avatar
                sx={{
                  bgcolor: getRoleColor(user?.role || ''),
                  width: 32,
                  height: 32,
                  fontSize: '0.875rem',
                }}
              >
                {user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.paper',
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawer}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.paper',
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => { navigate('/settings'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default RoleBasedLayout;
