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
  Paper,
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

  // Simplified Role-specific navigation items - Only Essential Features
  const getNavigationItems = (): NavigationItem[] => {
    const role = user?.role?.toLowerCase();
    
    switch (role) {
      case 'admin':
        return [
          {
            text: 'Dashboard',
            icon: <DashboardIcon />,
            path: '/dashboard',
          },
          {
            text: 'Employee Management',
            icon: <PeopleIcon />,
            path: '/employees',
          },
          {
            text: 'Leave Management',
            icon: <EventNoteIcon />,
            path: '/leaves',
          },
          {
            text: 'Payroll Management',
            icon: <PaymentIcon />,
            path: '/payroll',
          },
          // {
          //   text: 'Certifications',
          //   icon: <School />,
          //   path: '/certifications',
          // },
          {
            text: 'Analytics & Reports',
            icon: <AnalyticsIcon />,
            path: '/analytics',
          },
          {
            text: 'System Settings',
            icon: <SettingsIcon />,
            path: '/settings',
          },
        ];

      case 'hr':
        return [
          {
            text: 'Dashboard',
            icon: <DashboardIcon />,
            path: '/dashboard',
          },
          {
            text: 'Employee Management',
            icon: <PeopleIcon />,
            path: '/employees',
          },
          {
            text: 'Leave Management',
            icon: <EventNoteIcon />,
            children: [
              { text: 'Leave Requests', icon: <RequestPage />, path: '/leaves' },
              { text: 'Leave Calendar', icon: <CalendarMonth />, path: '/leaves/calendar' },
            ],
          },
          {
            text: 'Payroll Management',
            icon: <PaymentIcon />,
            path: '/payroll',
          },
          // {
          //   text: 'Certifications',
          //   icon: <School />,
          //   path: '/certifications',
          // },
          {
            text: 'Analytics',
            icon: <AnalyticsIcon />,
            path: '/analytics',
          },
        ];

      case 'employee':
      default:
        return [
          {
            text: 'Dashboard',
            icon: <DashboardIcon />,
            path: '/dashboard',
          },
          {
            text: 'Today\'s Attendance',
            icon: <Schedule />,
            path: '/employee/today-attendance',
          },
          {
            text: 'My Profile',
            icon: <PersonIcon />,
            path: '/employee/profile',
          },
          {
            text: 'Certifications & Skills',
            icon: <School />,
            path: '/employee/my-certifications',
          },
          {
            text: 'Leave Balance',
            icon: <EventNoteIcon />,
            path: '/employee/my-leave-balance',
          },
          {
            text: 'Apply Leave',
            icon: <EventNoteIcon />,
            path: '/employee/leave/apply',
          },
          {
            text: 'My Leaves',
            icon: <EventNoteIcon />,
            path: '/employee/leaves',
          },
          {
            text: 'Quick Actions',
            icon: <TrendingUp />,
            path: '/employee/quick-actions',
          },
          {
            text: 'Payroll',
            icon: <PaymentIcon />,
            path: '/employee/payroll',
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
            <IconButton 
              color="inherit"
              sx={{
                '&:hover': {
                  bgcolor: 'action.hover',
                  transform: 'scale(1.05)',
                  transition: 'all 0.2s ease-in-out',
                }
              }}
            >
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <IconButton 
              onClick={handleProfileMenuOpen} 
              sx={{ 
                ml: 1,
                border: `2px solid transparent`,
                '&:hover': {
                  border: `2px solid ${getRoleColor(user?.role || '')}40`,
                  transform: 'scale(1.05)',
                  transition: 'all 0.2s ease-in-out',
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar
                  sx={{
                    bgcolor: getRoleColor(user?.role || ''),
                    width: 36,
                    height: 36,
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    border: `2px solid ${getRoleColor(user?.role || '')}20`,
                    boxShadow: `0 2px 8px ${getRoleColor(user?.role || '')}30`,
                  }}
                >
                  {user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                  {user?.profile?.lastName?.[0] || ''}
                </Avatar>
                
                {/* Professional user info beside avatar - only on larger screens */}
                <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left', ml: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2, color: 'text.primary' }}>
                    {user?.profile?.firstName} {user?.profile?.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>
                    {user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User'} • {user?.jobDetails?.department || 'General'}
                  </Typography>
                </Box>
                
                {/* Status indicator dot */}
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'success.main', // Always show as active for now
                    border: '2px solid white',
                    position: 'absolute',
                    top: 8,
                    right: user?.profile?.firstName && user?.profile?.lastName ? 90 : 8,
                    boxShadow: '0 0 0 2px rgba(255,255,255,0.8)',
                    display: { xs: 'block', md: 'none' }, // Only show on mobile when text is hidden
                  }}
                />
              </Stack>
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
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 280,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
              border: `1px solid ${theme.palette.divider}`,
              borderBottom: 'none',
              borderRight: 'none',
            },
          },
        }}
      >
        {/* Professional User Profile Header */}
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                bgcolor: getRoleColor(user?.role || ''),
                width: 56,
                height: 56,
                fontSize: '1.5rem',
                fontWeight: 'bold',
                border: `3px solid ${getRoleColor(user?.role || '')}20`,
                boxShadow: `0 4px 12px ${getRoleColor(user?.role || '')}30`,
              }}
            >
              {user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
              {user?.profile?.lastName?.[0] || ''}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {user?.profile?.firstName} {user?.profile?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {user?.jobDetails?.designation || 'Employee'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {user?.jobDetails?.department || 'General'}
              </Typography>
              <Chip
                label={user?.role?.toUpperCase()}
                size="small"
                sx={{
                  mt: 0.5,
                  bgcolor: getRoleColor(user?.role || '') + '20',
                  color: getRoleColor(user?.role || ''),
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 22,
                  border: `1px solid ${getRoleColor(user?.role || '')}40`,
                }}
              />
            </Box>
          </Stack>
          
          {/* Employee ID and Status */}
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Employee ID: {user?.employeeId || 'N/A'}
              </Typography>
              <Chip 
                label="Active"
                size="small"
                color="success"
                sx={{ fontSize: '0.7rem', height: 18 }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Last login: {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        {/* Professional Menu Items */}
        <Box sx={{ py: 1 }}>
          <MenuItem 
            onClick={() => { navigate('/employee/profile'); handleProfileMenuClose(); }}
            sx={{ 
              px: 3, 
              py: 1.5, 
              '&:hover': { 
                bgcolor: 'primary.50',
                '& .MuiListItemIcon-root': { color: 'primary.main' },
                '& .MuiTypography-root': { color: 'primary.main' }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                My Profile
              </Typography>
              <Typography variant="caption" color="text.secondary">
                View and edit personal information
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem 
            onClick={() => { navigate('/employee/my-certifications'); handleProfileMenuClose(); }}
            sx={{ 
              px: 3, 
              py: 1.5,
              '&:hover': { 
                bgcolor: 'secondary.50',
                '& .MuiListItemIcon-root': { color: 'secondary.main' },
                '& .MuiTypography-root': { color: 'secondary.main' }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <School fontSize="small" />
            </ListItemIcon>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Certifications
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Manage your skills and certificates
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem 
            onClick={() => { navigate('/employee/payroll'); handleProfileMenuClose(); }}
            sx={{ 
              px: 3, 
              py: 1.5,
              '&:hover': { 
                bgcolor: 'success.50',
                '& .MuiListItemIcon-root': { color: 'success.main' },
                '& .MuiTypography-root': { color: 'success.main' }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <PaymentIcon fontSize="small" />
            </ListItemIcon>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Payroll & Salary
              </Typography>
              <Typography variant="caption" color="text.secondary">
                View payslips and salary details
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem 
            onClick={() => { navigate('/employee/leaves'); handleProfileMenuClose(); }}
            sx={{ 
              px: 3, 
              py: 1.5,
              '&:hover': { 
                bgcolor: 'info.50',
                '& .MuiListItemIcon-root': { color: 'info.main' },
                '& .MuiTypography-root': { color: 'info.main' }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <EventNoteIcon fontSize="small" />
            </ListItemIcon>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Leave Management
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Apply and track leave requests
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem 
            onClick={() => { navigate('/employee/support'); handleProfileMenuClose(); }}
            sx={{ 
              px: 3, 
              py: 1.5,
              '&:hover': { 
                bgcolor: 'grey.100',
                '& .MuiListItemIcon-root': { color: 'grey.700' },
                '& .MuiTypography-root': { color: 'grey.700' }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Support fontSize="small" />
            </ListItemIcon>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Help & Support
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Get help and submit tickets
              </Typography>
            </Box>
          </MenuItem>
        </Box>

        <Divider sx={{ mx: 2 }} />
        
        {/* Professional Logout Section */}
        <Box sx={{ p: 2 }}>
          <MenuItem 
            onClick={handleLogout} 
            sx={{ 
              px: 2, 
              py: 1.5, 
              borderRadius: 2,
              backgroundColor: 'error.50',
              border: '1px solid',
              borderColor: 'error.200',
              '&:hover': { 
                bgcolor: 'error.100',
                borderColor: 'error.300',
                '& .MuiListItemIcon-root': { color: 'error.dark' },
                '& .MuiTypography-root': { color: 'error.dark' }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                Sign Out
              </Typography>
              <Typography variant="caption" color="error.main" sx={{ opacity: 0.8 }}>
                Securely logout from your account
              </Typography>
            </Box>
          </MenuItem>
        </Box>

        {/* Footer with App Info */}
        <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: 'grey.25' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              HRMS v2.0
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main', bgcolor: 'primary.50' }
                }}
                onClick={() => { navigate('/employee/support'); handleProfileMenuClose(); }}
              >
                <Help fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main', bgcolor: 'primary.50' }
                }}
              >
                <NotificationsIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      </Menu>
    </Box>
  );
};

export default RoleBasedLayout;
