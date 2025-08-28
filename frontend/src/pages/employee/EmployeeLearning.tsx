import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Star,
  TrendingUp,
  Assignment,
  CheckCircle,
} from '@mui/icons-material';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  status: 'Active' | 'Expired' | 'Pending';
  credentialId?: string;
}

interface Training {
  id: string;
  name: string;
  provider: string;
  duration: string;
  completionDate: string;
  score?: number;
  status: 'Completed' | 'In Progress' | 'Not Started';
}

const EmployeeLearning: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [certifications] = useState<Certification[]>([
    {
      id: '1',
      name: 'AWS Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2024-06-15',
      expiryDate: '2027-06-15',
      status: 'Active',
      credentialId: 'AWS-SAA-C03-2024',
    },
    {
      id: '2',
      name: 'React Developer Certification',
      issuer: 'Meta',
      date: '2024-03-20',
      status: 'Active',
      credentialId: 'META-REACT-2024',
    },
    {
      id: '3',
      name: 'Project Management Professional',
      issuer: 'PMI',
      date: '2023-12-10',
      expiryDate: '2026-12-10',
      status: 'Active',
      credentialId: 'PMP-2023-12345',
    },
  ]);

  const [trainings] = useState<Training[]>([
    {
      id: '1',
      name: 'Advanced JavaScript Concepts',
      provider: 'TechCorp Learning',
      duration: '40 hours',
      completionDate: '2024-07-20',
      score: 95,
      status: 'Completed',
    },
    {
      id: '2',
      name: 'Cloud Architecture Fundamentals',
      provider: 'CloudSkills',
      duration: '30 hours',
      completionDate: '2024-06-10',
      score: 88,
      status: 'Completed',
    },
    {
      id: '3',
      name: 'Leadership Skills Development',
      provider: 'Leadership Institute',
      duration: '25 hours',
      completionDate: '',
      status: 'In Progress',
    },
    {
      id: '4',
      name: 'Data Analytics with Python',
      provider: 'DataCamp',
      duration: '35 hours',
      completionDate: '',
      status: 'Not Started',
    },
  ]);

  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    date: '',
    expiryDate: '',
    credentialId: '',
  });

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewCertification({
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
      credentialId: '',
    });
  };

  const handleSubmitCertification = () => {
    // TODO: Implement API call to add certification
    console.log('Adding certification:', newCertification);
    handleCloseDialog();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'warning';
      case 'Expired':
      case 'Not Started':
        return 'error';
      case 'Pending':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTrainingProgress = (status: string) => {
    switch (status) {
      case 'Completed':
        return 100;
      case 'In Progress':
        return 60;
      case 'Not Started':
        return 0;
      default:
        return 0;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Learning & Growth
      </Typography>

      <Grid container spacing={3}>
        {/* Learning Stats */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Star sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {certifications.filter(c => c.status === 'Active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Certifications
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {trainings.filter(t => t.status === 'Completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed Trainings
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {trainings.filter(t => t.status === 'In Progress').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                92%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* My Certifications */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  My Certifications
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenDialog}
                >
                  Add Certification
                </Button>
              </Box>
              
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Certification</TableCell>
                      <TableCell>Issuer</TableCell>
                      <TableCell>Issue Date</TableCell>
                      <TableCell>Expiry Date</TableCell>
                      <TableCell>Credential ID</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {certifications.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {cert.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{cert.issuer}</TableCell>
                        <TableCell>
                          {new Date(cert.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : 'No Expiry'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {cert.credentialId || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={cert.status}
                            color={getStatusColor(cert.status) as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* My Training */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Training Programs
              </Typography>
              
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Training Program</TableCell>
                      <TableCell>Provider</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trainings.map((training) => (
                      <TableRow key={training.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {training.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{training.provider}</TableCell>
                        <TableCell>{training.duration}</TableCell>
                        <TableCell sx={{ width: 150 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={getTrainingProgress(training.status)}
                              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2" sx={{ minWidth: 35 }}>
                              {getTrainingProgress(training.status)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {training.score ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2" fontWeight="bold">
                                {training.score}%
                              </Typography>
                              <Rating
                                value={training.score / 20}
                                readOnly
                                size="small"
                                precision={0.1}
                              />
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={training.status}
                            color={getStatusColor(training.status) as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Skill Development */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Skill Development Progress
              </Typography>
              
              <Stack spacing={3}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">JavaScript</Typography>
                    <Typography variant="body2">95%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={95} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">React</Typography>
                    <Typography variant="body2">90%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={90} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">AWS Cloud</Typography>
                    <Typography variant="body2">85%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={85} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Project Management</Typography>
                    <Typography variant="body2">78%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={78} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Data Analytics</Typography>
                    <Typography variant="body2">60%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={60} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Career Path */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Career Development Path
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'success.light', 
                  borderRadius: 1,
                  border: '2px solid',
                  borderColor: 'success.main'
                }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="success.dark">
                    Current Position
                  </Typography>
                  <Typography variant="body2">
                    Software Engineer - Level 2
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'info.light', 
                  borderRadius: 1,
                  border: '2px dashed',
                  borderColor: 'info.main'
                }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="info.dark">
                    Next Target (6 months)
                  </Typography>
                  <Typography variant="body2">
                    Senior Software Engineer
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Required: AWS Certification + Leadership Training
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'warning.light', 
                  borderRadius: 1,
                  border: '2px dashed',
                  borderColor: 'warning.main'
                }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="warning.dark">
                    Long-term Goal (2 years)
                  </Typography>
                  <Typography variant="body2">
                    Tech Lead / Engineering Manager
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Required: Advanced Leadership + Architecture Skills
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Certification Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Certification</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Certification Name"
              value={newCertification.name}
              onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
            />

            <TextField
              fullWidth
              label="Issuing Organization"
              value={newCertification.issuer}
              onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
            />

            <TextField
              fullWidth
              label="Issue Date"
              type="date"
              value={newCertification.date}
              onChange={(e) => setNewCertification({ ...newCertification, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Expiry Date (Optional)"
              type="date"
              value={newCertification.expiryDate}
              onChange={(e) => setNewCertification({ ...newCertification, expiryDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Credential ID (Optional)"
              value={newCertification.credentialId}
              onChange={(e) => setNewCertification({ ...newCertification, credentialId: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitCertification} 
            variant="contained"
            disabled={!newCertification.name || !newCertification.issuer || !newCertification.date}
          >
            Add Certification
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeLearning;
