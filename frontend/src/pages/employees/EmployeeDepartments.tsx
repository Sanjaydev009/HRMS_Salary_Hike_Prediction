import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Skeleton,
  CircularProgress,
  LinearProgress,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Work as WorkIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import api from '../../services/api';

interface Department {
  _id: string;
  name: string;
  description: string;
  manager: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  employees: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    position: string;
    email: string;
  }>;
  budget: number;
  location: string;
  createdAt: string;
  stats: {
    totalEmployees: number;
    avgSalary: number;
    newHires: number;
    openPositions: number;
  };
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
}

const EmployeeDepartments: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager: '',
    budget: '',
    location: '',
  });

  // Fetch departments data
  const fetchDepartments = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/employees/departments');
      
      if (response.data.success) {
        // Transform the data to match our interface
        const departmentsData = response.data.departments.map((dept: any) => ({
          ...dept,
          stats: {
            totalEmployees: dept.employees?.length || 0,
            avgSalary: dept.avgSalary || 0,
            newHires: dept.newHires || 0,
            openPositions: dept.openPositions || 0,
          }
        }));
        setDepartments(departmentsData);
        console.log('Departments loaded:', departmentsData);
      } else {
        setError('Failed to load departments');
      }
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      setError(error.response?.data?.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch employees for manager selection
  const fetchEmployees = useCallback(async () => {
    try {
      const response = await api.get('/employees');
      if (response.data.success) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, [fetchDepartments, fetchEmployees]);

  const handleCreateDepartment = async () => {
    try {
      setSubmitting(true);
      const response = await api.post('/employees/departments', {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
      });

      if (response.data.success) {
        await fetchDepartments();
        setCreateDialogOpen(false);
        resetForm();
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDepartment = async () => {
    if (!selectedDepartment) return;

    try {
      setSubmitting(true);
      const response = await api.put(`/employees/departments/${selectedDepartment._id}`, {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
      });

      if (response.data.success) {
        await fetchDepartments();
        setEditDialogOpen(false);
        resetForm();
        setSelectedDepartment(null);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this department?')) {
      return;
    }

    try {
      const response = await api.delete(`/employees/departments/${departmentId}`);
      if (response.data.success) {
        await fetchDepartments();
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete department');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      manager: '',
      budget: '',
      location: '',
    });
  };

  const openEditDialog = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      description: department.description,
      manager: department.manager?._id || '',
      budget: department.budget?.toString() || '',
      location: department.location || '',
    });
    setEditDialogOpen(true);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, department: Department) => {
    setMenuAnchor(event.currentTarget);
    setSelectedDepartment(department);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedDepartment(null);
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>Department Management</Typography>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="40%" height={24} />
                  <Skeleton variant="rectangular" height={80} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const canManageDepartments = user?.role === 'admin' || user?.role === 'hr';

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Department Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage organizational departments and structure
          </Typography>
        </Box>
        
        {canManageDepartments && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            size="large"
          >
            Add Department
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {departments.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Departments
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', color: '#333' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.1)' }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {departments.reduce((sum, dept) => sum + dept.stats.totalEmployees, 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Employees
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#333' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.1)' }}>
                  <AccountBalanceIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    ₹{((departments.reduce((sum, dept) => sum + (dept.budget || 0), 0)) / 1000000).toFixed(1)}M
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Budget
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)', color: '#333' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.1)' }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {departments.filter(dept => dept.manager).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    With Managers
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Departments Grid */}
      <Grid container spacing={3}>
        {departments.map((department) => (
          <Grid item xs={12} sm={6} md={4} key={department._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <BusinessIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {department.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {department.location || 'No location'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {canManageDepartments && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, department)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {department.description || 'No description available'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Department Stats */}
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Employees
                    </Typography>
                    <Chip 
                      label={department.stats.totalEmployees}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Budget
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ₹{((department.budget || 0) / 100000).toFixed(1)}L
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Avg. Salary
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ₹{((department.stats.avgSalary || 0) / 100000).toFixed(1)}L
                    </Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Manager Info */}
                {department.manager ? (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'success.main' }}>
                      <PersonIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {department.manager.firstName} {department.manager.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Department Manager
                      </Typography>
                    </Box>
                  </Stack>
                ) : (
                  <Alert severity="warning" variant="outlined" sx={{ py: 0.5 }}>
                    <Typography variant="caption">
                      No manager assigned
                    </Typography>
                  </Alert>
                )}

                {/* Employee List Preview */}
                {department.employees && department.employees.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                      Team Members ({department.employees.length})
                    </Typography>
                    <Stack spacing={1} sx={{ maxHeight: 120, overflowY: 'auto' }}>
                      {department.employees.slice(0, 3).map((emp) => (
                        <Stack key={emp._id} direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ width: 20, height: 20, fontSize: 12 }}>
                            {emp.firstName[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="caption" fontWeight={500}>
                              {emp.firstName} {emp.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {emp.position}
                            </Typography>
                          </Box>
                        </Stack>
                      ))}
                      {department.employees.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                          +{department.employees.length - 3} more...
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedDepartment) openEditDialog(selectedDepartment);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Department
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedDepartment) handleDeleteDepartment(selectedDepartment._id);
          handleMenuClose();
        }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete Department
        </MenuItem>
      </Menu>

      {/* Create Department Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            Add New Department
            <IconButton onClick={() => setCreateDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Department Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />

            <Autocomplete
              options={employees}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.position})`}
              value={employees.find(emp => emp._id === formData.manager) || null}
              onChange={(_, newValue) => setFormData({ ...formData, manager: newValue?._id || '' })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Department Manager"
                  placeholder="Select a manager"
                />
              )}
            />

            <TextField
              label="Budget (₹)"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              fullWidth
              type="number"
            />

            <TextField
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateDepartment}
            disabled={submitting || !formData.name}
            startIcon={submitting ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {submitting ? 'Creating...' : 'Create Department'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            Edit Department
            <IconButton onClick={() => setEditDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Department Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />

            <Autocomplete
              options={employees}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.position})`}
              value={employees.find(emp => emp._id === formData.manager) || null}
              onChange={(_, newValue) => setFormData({ ...formData, manager: newValue?._id || '' })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Department Manager"
                  placeholder="Select a manager"
                />
              )}
            />

            <TextField
              label="Budget (₹)"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              fullWidth
              type="number"
            />

            <TextField
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateDepartment}
            disabled={submitting || !formData.name}
            startIcon={submitting ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {submitting ? 'Updating...' : 'Update Department'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDepartments;
