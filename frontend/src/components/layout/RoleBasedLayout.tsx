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
          {
            text: 'Certifications',
            icon: <School />,
            path: '/certifications',
          },
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
            path: '/hr/employees',
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
            children: [
              { text: 'Process Payroll', icon: <MonetizationOn />, path: '/payroll' },
              { text: 'Payslips', icon: <Receipt />, path: '/payroll/payslips' },
            ],
          },
          {
            text: 'Certifications',
            icon: <School />,
            path: '/certifications',
          },
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
            text: 'My Profile',
            icon: <PersonIcon />,
            path: '/employee/profile',
          },
          {
            text: 'Attendance',
            icon: <Schedule />,
            path: '/employee/attendance',
          },
          {
            text: 'Apply Leave',
            icon: <EventNoteIcon />,
            path: '/employee/leave/apply',
          },
          {
            text: 'My Leaves',
            icon: <EventNoteIcon />,
            path: '/employee/leave/history',
          },
          {
            text: 'Certifications',
            icon: <School />,
            path: '/certifications',
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
