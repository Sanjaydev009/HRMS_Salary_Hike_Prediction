import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Toolbar,
  AppBar,
  IconButton,
  useTheme,
  alpha,
  Breadcrumbs,
  Link,
  Chip,
  Badge,
  useMediaQuery,
  Container,
  Paper,
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  Analytics as AnalyticsIcon,
  AccessTime as AccessTimeIcon,
  AccountTree as OrgChartIcon,
  School as TrainingIcon,
  Security as PermissionsIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Work as DepartmentIcon,
  Timeline as TimelineIcon,
  AdminPanelSettings as AdminIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const drawerWidth = 280;
const mobileDrawerWidth = 240;

interface NavigationItem {
  id: string;
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
  description: string;
  roles: string[];
}

const EmployeeManagementLayout: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const navigationItems: NavigationItem[] = [
    {
      id: 'overview',
      title: 'Employee Overview',
      path: '/employees',
      icon: <PeopleIcon />,
      description: 'View and manage all employees',
      roles: ['hr', 'admin']
    },
    {
      id: 'add-employee',
      title: 'Add Employee',
      path: '/employees/new',
      icon: <PersonAddIcon />,
      description: 'Add new employee to the system',
      roles: ['hr', 'admin']
    },
    {
      id: 'employee-directory',
      title: 'Employee Directory',
      path: '/employees/directory',
      icon: <AssignmentIcon />,
      description: 'Search and browse employee directory',
      roles: ['hr', 'admin', 'employee']
    },
    {
      id: 'departments',
      title: 'Departments',
      path: '/employees/departments',
      icon: <BusinessIcon />,
      description: 'Manage departments and teams',
      roles: ['hr', 'admin']
    },
    {
      id: 'organization-chart',
      title: 'Organization Chart',
      path: '/employees/org-chart',
      icon: <OrgChartIcon />,
      description: 'View organizational hierarchy',
      roles: ['hr', 'admin', 'employee']
    },
    {
      id: 'employee-analytics',
      title: 'Employee Analytics',
      path: '/employees/analytics',
      icon: <AnalyticsIcon />,
      description: 'Employee performance and analytics',
      roles: ['hr', 'admin']
    },
    {
      id: 'attendance-overview',
      title: 'Attendance Overview',
      path: '/employees/attendance',
      icon: <AccessTimeIcon />,
      description: 'View team attendance patterns',
      roles: ['hr', 'admin']
    },
    {
      id: 'training-management',
      title: 'Training & Development',
      path: '/employees/training',
      icon: <TrainingIcon />,
      description: 'Manage employee training programs',
      roles: ['hr', 'admin']
    },
    {
      id: 'performance-reviews',
      title: 'Performance Reviews',
      path: '/employees/performance',
      icon: <TimelineIcon />,
      description: 'Employee performance management',
      roles: ['hr', 'admin']
    },
    {
      id: 'permissions',
      title: 'Roles & Permissions',
      path: '/employees/permissions',
      icon: <PermissionsIcon />,
      description: 'Manage user roles and permissions',
      roles: ['admin']
    }
  ];

  // Filter navigation items based on user role
  const filteredNavigation = navigationItems.filter(item => 
    item.roles.includes(user?.role || 'employee')
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { label: 'Home', path: '/' }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const navItem = navigationItems.find(item => item.path === currentPath);
      breadcrumbs.push({
        label: navItem?.title || segment.charAt(0).toUpperCase() + segment.slice(1),
        path: currentPath
      });
    });

    return breadcrumbs;
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 2, sm: 3 }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <AdminIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
          <Typography 
            variant={isSmallScreen ? "subtitle1" : "h6"} 
            noWrap 
            component="div" 
            fontWeight={600}
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            Employee Management
          </Typography>
        </Box>
      </Toolbar>

      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Chip 
          label={`Logged in as ${user?.role?.toUpperCase()}`}
          color="primary" 
          variant="outlined"
          size={isSmallScreen ? "small" : "medium"}
          sx={{ 
            mb: { xs: 1, sm: 2 },
            fontSize: { xs: '0.7rem', sm: '0.75rem' }
          }}
        />
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <List sx={{ px: { xs: 1, sm: 1 } }}>
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    mx: { xs: 0.5, sm: 1 },
                    borderRadius: 2,
                    mb: 0.5,
                    minHeight: { xs: 44, sm: 48 },
                    backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                    border: isActive ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}` : '1px solid transparent'
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: isActive ? theme.palette.primary.main : 'inherit',
                      minWidth: { xs: 36, sm: 40 }
                    }}
                  >
                    {item.badge ? (
                      <Badge badgeContent={item.badge} color="error">
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography 
                        variant="body2" 
                        fontWeight={isActive ? 600 : 400}
                        color={isActive ? 'primary' : 'inherit'}
                        sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                      >
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      !isSmallScreen && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: '0.7rem' }}
                        >
                          {item.description}
                        </Typography>
                      )
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { 
            xs: '100%',
            md: `calc(100% - ${drawerWidth}px)` 
          },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Breadcrumbs */}
          <Box sx={{ flexGrow: 1 }}>
            <Breadcrumbs
              aria-label="breadcrumb"
              separator={<NavigateNextIcon fontSize="small" />}
              sx={{
                '& .MuiBreadcrumbs-separator': {
                  mx: { xs: 0.5, sm: 1 }
                }
              }}
            >
              {generateBreadcrumbs().map((crumb, index) => (
                <Link
                  key={index}
                  color={index === generateBreadcrumbs().length - 1 ? 'text.primary' : 'inherit'}
                  href={crumb.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(crumb.path);
                  }}
                  sx={{ 
                    textDecoration: 'none',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  {index === 0 && <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />}
                  {crumb.label}
                </Link>
              ))}
            </Breadcrumbs>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: mobileDrawerWidth,
              border: 'none',
              boxShadow: theme.shadows[8]
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: theme.shadows[2]
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { 
            xs: '100%',
            md: `calc(100% - ${drawerWidth}px)` 
          },
          minHeight: '100vh',
          backgroundColor: theme.palette.grey[50]
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
        
        <Container 
          maxWidth={false} 
          sx={{ 
            py: { xs: 2, sm: 3 },
            px: { xs: 1, sm: 2, md: 3 },
            height: 'calc(100vh - 64px)',
            overflow: 'auto'
          }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 1, sm: 2, md: 3 },
              borderRadius: 2,
              height: '100%',
              backgroundColor: 'background.paper'
            }}
          >
            <Outlet />
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default EmployeeManagementLayout;
