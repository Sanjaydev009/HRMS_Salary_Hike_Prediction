import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Stack,
  Divider,
  Paper,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tab,
  Tabs,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  Visibility as VisibilityIcon,
  AttachFile as AttachFileIcon,
  BarChart as BarChartIcon,
  Analytics as AnalyticsIcon,
  Verified as VerifiedIcon,
  Star as StarIcon,
  Recommend as RecommendIcon
} from '@mui/icons-material';

interface Certification {
  _id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  category: string;
  skillLevel: string;
  verified?: boolean;
  skills?: string[];
  salaryImpact?: number;
  certificate?: {
    filename: string;
    originalName: string;
    mimetype: string;
  };
  status: string;
  impactScore: number;
  createdAt: string;
}

interface SalaryPrediction {
  currentSalary: number;
  predictedSalary: number;
  salaryIncrease: number;
  increasePercentage: number;
  totalCertifications: number;
  categoryBreakdown: Record<string, {
    count: number;
    impact: number;
    certifications: Array<{
      name: string;
      skillLevel: string;
      impact: number;
    }>;
  }>;
  recommendations: Array<{
    type: string;
    message: string;
    impact: string;
  }>;
}

const CertificationManager: React.FC = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expirationDate: '',
    credentialId: '',
    credentialUrl: '',
    category: 'Technical',
    skillLevel: 'Intermediate'
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Helper function for color generation
  const getRandomColor = () => {
    const colors = ['#1976d2', '#dc004e', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  const [salaryPrediction, setSalaryPrediction] = useState<SalaryPrediction | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);

  // Categories and skill levels
  const categories = [
    'Technical', 'Management', 'Leadership', 'Industry Specific', 'Language', 'Other'
  ];
  
  const skillLevels = [
    'Beginner', 'Intermediate', 'Advanced', 'Expert'
  ];

  const categoryColors: Record<string, string> = {
    'Technical': '#2196F3',
    'Management': '#FF9800',
    'Leadership': '#9C27B0',
    'Industry Specific': '#4CAF50',
    'Language': '#FF5722',
    'Other': '#607D8B'
  };

  useEffect(() => {
    fetchCertifications();
    fetchSalaryPrediction();
  }, []);

  const fetchCertifications = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/certifications/my', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setCertifications(result.data.certifications || []);
      } else {
        throw new Error('Failed to fetch certifications');
      }
    } catch (error) {
      setError('Failed to load certifications');
      console.error('Error fetching certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryPrediction = async () => {
    setPredictionLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/certifications/salary-prediction', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setSalaryPrediction(result.data);
      }
    } catch (error) {
      console.error('Error fetching salary prediction:', error);
    } finally {
      setPredictionLoading(false);
    }
  };

  const handleAddCertification = async () => {
    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('issuingOrganization', formData.issuingOrganization);
      formDataObj.append('issueDate', formData.issueDate);
      if (formData.expirationDate) {
        formDataObj.append('expiryDate', formData.expirationDate);
      }
      formDataObj.append('credentialId', formData.credentialId);
      formDataObj.append('verificationUrl', formData.credentialUrl);
      formDataObj.append('category', formData.category);
      formDataObj.append('skillLevel', formData.skillLevel);
      
      if (selectedFile) {
        formDataObj.append('certificateFile', selectedFile);
      }

      const response = await fetch('http://localhost:5001/api/certifications/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataObj
      });

      if (response.ok) {
        setAddDialogOpen(false);
        resetForm();
        fetchCertifications();
        fetchSalaryPrediction();
      } else {
        throw new Error('Failed to add certification');
      }
    } catch (error) {
      console.error('Error adding certification:', error);
      setError('Failed to add certification');
    }
  };

  const handleEditCertification = async () => {
    if (!selectedCertification) return;

    try {
      const updateData = {
        name: formData.name,
        issuingOrganization: formData.issuingOrganization,
        issueDate: formData.issueDate,
        expirationDate: formData.expirationDate || undefined,
        credentialId: formData.credentialId,
        credentialUrl: formData.credentialUrl,
        category: formData.category,
        skillLevel: formData.skillLevel
      };

      const response = await fetch(`http://localhost:5001/api/certifications/${selectedCertification._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setEditDialogOpen(false);
        resetForm();
        fetchCertifications();
        fetchSalaryPrediction();
      } else {
        throw new Error('Failed to update certification');
      }
    } catch (error) {
      console.error('Error updating certification:', error);
      setError('Failed to update certification');
    }
  };

  const handleDeleteCertification = async (certificationId: string) => {
    if (!window.confirm('Are you sure you want to delete this certification?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/certifications/${certificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchCertifications();
        fetchSalaryPrediction();
      } else {
        throw new Error('Failed to delete certification');
      }
    } catch (error) {
      console.error('Error deleting certification:', error);
      setError('Failed to delete certification');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      issuingOrganization: '',
      issueDate: '',
      expirationDate: '',
      credentialId: '',
      credentialUrl: '',
      category: 'Technical',
      skillLevel: 'Intermediate'
    });
    setSelectedFile(null);
    setSelectedCertification(null);
  };

  const openEditDialog = (certification: Certification) => {
    setSelectedCertification(certification);
    setFormData({
      name: certification.name,
      issuingOrganization: certification.issuingOrganization,
      issueDate: certification.issueDate.split('T')[0], // Convert to YYYY-MM-DD format
      expirationDate: certification.expirationDate ? certification.expirationDate.split('T')[0] : '',
      credentialId: certification.credentialId || '',
      credentialUrl: certification.credentialUrl || '',
      category: certification.category,
      skillLevel: certification.skillLevel
    });
    setEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Expired': return 'error';
      case 'Pending Verification': return 'warning';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WorkspacePremiumIcon fontSize="large" color="primary" />
          Certification Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your professional certifications and see their impact on salary predictions
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab icon={<SchoolIcon />} label="My Certifications" />
          <Tab icon={<TrendingUpIcon />} label="Salary Impact" />
          <Tab icon={<AssessmentIcon />} label="Analytics" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Box>
          {/* Action Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Total Certifications: {certifications.length}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
            >
              Add Certification
            </Button>
          </Box>

          {/* Certifications Grid */}
          <Grid container spacing={3}>
            {certifications.map((cert) => (
              <Grid item xs={12} md={6} lg={4} key={cert._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                        {cert.name}
                      </Typography>
                      <Chip 
                        label={cert.status} 
                        color={getStatusColor(cert.status) as any}
                        size="small" 
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {cert.issuingOrganization}
                    </Typography>
                    
                    <Box sx={{ my: 2 }}>
                      <Chip 
                        label={cert.category} 
                        size="small" 
                        sx={{ 
                          backgroundColor: categoryColors[cert.category], 
                          color: 'white',
                          mr: 1,
                          mb: 1
                        }} 
                      />
                      <Chip 
                        label={cert.skillLevel} 
                        size="small" 
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    </Box>

                    <Typography variant="body2" gutterBottom>
                      <strong>Issue Date:</strong> {formatDate(cert.issueDate)}
                    </Typography>
                    
                    {cert.expirationDate && (
                      <Typography variant="body2" gutterBottom>
                        <strong>Expires:</strong> {formatDate(cert.expirationDate)}
                      </Typography>
                    )}

                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon color="success" sx={{ fontSize: '1rem' }} />
                      <Typography variant="body2" color="success.main">
                        Impact Score: {cert.impactScore || 0}/100
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="primary">
                      Salary Impact: +{(cert.salaryImpact || 0).toFixed(1)}%
                    </Typography>
                  </CardContent>
                  
                  <Divider />
                  
                  <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => openEditDialog(cert)} size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    {cert.certificate && (
                      <Tooltip title="View Certificate">
                        <IconButton size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton 
                        onClick={() => handleDeleteCertification(cert._id)} 
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {certifications.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Certifications Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start building your professional portfolio by adding your first certification
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddDialogOpen(true)}
              >
                Add Your First Certification
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          {predictionLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : salaryPrediction ? (
            <Grid container spacing={3}>
              {/* Current vs Predicted Salary */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon color="primary" />
                      Salary Prediction
                    </Typography>
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Current Salary
                      </Typography>
                      <Typography variant="h4" sx={{ mb: 2 }}>
                        {formatCurrency(salaryPrediction.currentSalary)}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        Predicted Salary
                      </Typography>
                      <Typography variant="h4" color="success.main" sx={{ mb: 2 }}>
                        {formatCurrency(salaryPrediction.predictedSalary)}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" color="success.main">
                          +{formatCurrency(salaryPrediction.salaryIncrease)}
                        </Typography>
                        <Chip 
                          label={`+${salaryPrediction.increasePercentage}%`} 
                          color="success" 
                          size="small"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Impact Breakdown */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BarChartIcon color="primary" />
                      Impact by Category
                    </Typography>
                    
                    <List dense>
                      {Object.entries(salaryPrediction.categoryBreakdown).map(([category, data]) => (
                        <ListItem key={category}>
                          <ListItemText
                            primary={category}
                            secondary={`${data.count} certifications`}
                          />
                          <ListItemSecondaryAction>
                            <Typography variant="body2" color="success.main">
                              +{data.impact.toFixed(1)}%
                            </Typography>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Recommendations */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AssessmentIcon color="primary" />
                      Recommendations for Salary Growth
                    </Typography>
                    
                    {salaryPrediction.recommendations.length > 0 ? (
                      <Stack spacing={2} sx={{ mt: 2 }}>
                        {salaryPrediction.recommendations.map((rec, index) => (
                          <Alert 
                            key={index} 
                            severity={rec.impact === 'High' ? 'warning' : 'info'}
                            variant="outlined"
                          >
                            {rec.message}
                          </Alert>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Great! You have a strong certification portfolio. Keep adding relevant certifications to maintain your competitive edge.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Add certifications to see salary predictions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your certification portfolio will be analyzed to predict potential salary increases
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AnalyticsIcon />
            Certification Analytics
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Overview Cards */}
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <WorkspacePremiumIcon color="primary" />
                      <Typography variant="h6">{certifications.length}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Certifications
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <VerifiedIcon color="success" />
                      <Typography variant="h6">
                        {certifications.filter(cert => cert.verified).length}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Verified Certifications
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingUpIcon color="warning" />
                      <Typography variant="h6">
                        {certifications.filter(cert => {
                          const oneYearAgo = new Date();
                          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                          return new Date(cert.issueDate) >= oneYearAgo;
                        }).length}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Recent (Last Year)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <StarIcon color="error" />
                      <Typography variant="h6">
                        {[...new Set(certifications.flatMap(cert => cert.skills || []))].length}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Unique Skills
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Category Distribution Chart */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Certifications by Category
                    </Typography>
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {(() => {
                        const categories = certifications.reduce((acc: Record<string, number>, cert) => {
                          acc[cert.category] = (acc[cert.category] || 0) + 1;
                          return acc;
                        }, {});
                        
                        const categoryData = Object.entries(categories).map(([name, value]) => ({
                          name,
                          value: value as number,
                          color: getRandomColor()
                        }));

                        return categoryData.length > 0 ? (
                          <Box sx={{ width: '100%' }}>
                            {categoryData.map((item, index) => (
                              <Box key={item.name} sx={{ mb: 2 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                  <Typography variant="body2">{item.name}</Typography>
                                  <Typography variant="body2" fontWeight="bold">
                                    {item.value} ({Math.round((item.value / certifications.length) * 100)}%)
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={(item.value / certifications.length) * 100}
                                  sx={{ 
                                    height: 8, 
                                    borderRadius: 4,
                                    backgroundColor: '#f0f0f0',
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: item.color
                                    }
                                  }}
                                />
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No certification data available
                          </Typography>
                        );
                      })()}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Salary Impact Analysis */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Salary Impact Analysis
                    </Typography>
                    <Box sx={{ p: 2 }}>
                      {(() => {
                        const totalImpact = certifications.reduce((sum, cert) => sum + (cert.salaryImpact || 0), 0);
                        const avgImpact = certifications.length > 0 ? totalImpact / certifications.length : 0;
                        
                        return (
                          <>
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" gutterBottom>
                                Total Impact: <strong>{totalImpact.toFixed(1)}%</strong>
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.min(totalImpact, 30) / 30 * 100}
                                sx={{ height: 10, borderRadius: 5, backgroundColor: '#f0f0f0' }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                Maximum possible impact: 30%
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" gutterBottom>
                                Average per Certification: <strong>{avgImpact.toFixed(1)}%</strong>
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.min(avgImpact, 10) / 10 * 100}
                                color="secondary"
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>

                            {/* Top Impact Certifications */}
                            <Typography variant="subtitle2" gutterBottom>
                              Top Impact Certifications:
                            </Typography>
                            {certifications
                              .sort((a, b) => (b.salaryImpact || 0) - (a.salaryImpact || 0))
                              .slice(0, 3)
                              .map((cert, index) => (
                                <Box key={cert._id} sx={{ mb: 1 }}>
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" sx={{ maxWidth: '70%' }}>
                                      {index + 1}. {cert.name}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold" color="primary">
                                      +{(cert.salaryImpact || 0).toFixed(1)}%
                                    </Typography>
                                  </Box>
                                </Box>
                              ))}
                          </>
                        );
                      })()}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Skills Timeline */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Certification Timeline
                    </Typography>
                    <Box sx={{ height: 200, overflow: 'auto' }}>
                      {certifications
                        .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
                        .map((cert, index) => (
                          <Box key={cert._id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="start">
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" fontWeight="bold">
                                  {cert.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {cert.issuingOrganization} • {cert.category}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Issued: {new Date(cert.issueDate).toLocaleDateString()}
                                  {cert.expiryDate && ` • Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Chip 
                                  size="small"
                                  label={cert.verified ? 'Verified' : 'Unverified'} 
                                  color={cert.verified ? 'success' : 'default'}
                                  sx={{ mb: 1 }}
                                />
                                <Typography variant="body2" fontWeight="bold">
                                  +{(cert.salaryImpact || 0).toFixed(1)}%
                                </Typography>
                              </Box>
                            </Box>
                            {cert.skills && cert.skills.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                {cert.skills.map((skill, skillIndex) => (
                                  <Chip 
                                    key={skillIndex}
                                    label={skill} 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ mr: 1, mb: 1 }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Recommendations */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <RecommendIcon />
                      Recommendations for Salary Growth
                    </Typography>
                    <Grid container spacing={2}>
                      {(() => {
                        const recommendations = [];
                        const verifiedCount = certifications.filter(cert => cert.verified).length;
                        const recentCount = certifications.filter(cert => {
                          const oneYearAgo = new Date();
                          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                          return new Date(cert.issueDate) >= oneYearAgo;
                        }).length;
                        const techCount = certifications.filter(cert => cert.category === 'Technical').length;
                        const mgmtCount = certifications.filter(cert => cert.category === 'Management').length;

                        if (verifiedCount < 2) {
                          recommendations.push({
                            icon: '✅',
                            title: 'Get Certifications Verified',
                            description: 'Verified certifications have higher salary impact. Upload certificates for verification.',
                            impact: '+2-5% salary increase per verification'
                          });
                        }

                        if (techCount < 3) {
                          recommendations.push({
                            icon: '💻',
                            title: 'Add Technical Certifications',
                            description: 'Technical skills are highly valued. Consider cloud, programming, or data certifications.',
                            impact: '+3-8% salary increase per certification'
                          });
                        }

                        if (mgmtCount === 0) {
                          recommendations.push({
                            icon: '👔',
                            title: 'Leadership Certifications',
                            description: 'Management certifications open doors to higher roles and better compensation.',
                            impact: '+5-12% salary increase potential'
                          });
                        }

                        if (recentCount === 0) {
                          recommendations.push({
                            icon: '📚',
                            title: 'Continuous Learning',
                            description: 'Recent certifications show commitment to growth and staying current.',
                            impact: '+2-4% bonus for recent learning'
                          });
                        }

                        if (certifications.length < 5) {
                          recommendations.push({
                            icon: '🎯',
                            title: 'Build Certification Portfolio',
                            description: 'Aim for 5+ certifications across different skill areas for maximum impact.',
                            impact: '+15-25% total salary potential'
                          });
                        }

                        return recommendations.slice(0, 4).map((rec, index) => (
                          <Grid item xs={12} md={6} key={index}>
                            <Alert severity="info" sx={{ height: '100%' }}>
                              <Box>
                                <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
                                  {rec.icon} {rec.title}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  {rec.description}
                                </Typography>
                                <Typography variant="caption" color="primary" fontWeight="bold">
                                  💰 {rec.impact}
                                </Typography>
                              </Box>
                            </Alert>
                          </Grid>
                        ));
                      })()}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      )}

      {/* Add Certification Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Certification</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Certification Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Issuing Organization"
                value={formData.issuingOrganization}
                onChange={(e) => setFormData(prev => ({ ...prev, issuingOrganization: e.target.value }))}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Skill Level</InputLabel>
                <Select
                  value={formData.skillLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, skillLevel: e.target.value }))}
                  label="Skill Level"
                >
                  {skillLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Issue Date"
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Expiration Date (Optional)"
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Credential ID (Optional)"
                value={formData.credentialId}
                onChange={(e) => setFormData(prev => ({ ...prev, credentialId: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Verification URL (Optional)"
                value={formData.credentialUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, credentialUrl: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <input
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  id="certificate-file"
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="certificate-file">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AttachFileIcon />}
                    fullWidth
                  >
                    {selectedFile ? selectedFile.name : 'Upload Certificate (PDF or Image)'}
                  </Button>
                </label>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddCertification} variant="contained">
            Add Certification
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Certification Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Certification</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Certification Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Issuing Organization"
                value={formData.issuingOrganization}
                onChange={(e) => setFormData(prev => ({ ...prev, issuingOrganization: e.target.value }))}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Skill Level</InputLabel>
                <Select
                  value={formData.skillLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, skillLevel: e.target.value }))}
                  label="Skill Level"
                >
                  {skillLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Issue Date"
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Expiration Date (Optional)"
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Credential ID (Optional)"
                value={formData.credentialId}
                onChange={(e) => setFormData(prev => ({ ...prev, credentialId: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Verification URL (Optional)"
                value={formData.credentialUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, credentialUrl: e.target.value }))}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditCertification} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CertificationManager;
