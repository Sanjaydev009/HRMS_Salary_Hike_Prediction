import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload,
  Download,
  Visibility,
  Delete,
  Description,
  PictureAsPdf,
  Image,
  AttachFile,
} from '@mui/icons-material';
import api from '../../services/api';

interface Document {
  _id: string;
  name: string;
  type: string;
  url: string;
  uploadDate: string;
}

const EmployeeDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({
    type: 'other',
    name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile/documents');
      
      if (response.data.success) {
        setDocuments(response.data.data.documents || []);
      }
    } catch (error: any) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!uploadData.name.trim()) {
      newErrors.name = 'Document name is required';
    }
    if (!selectedFile) {
      newErrors.file = 'Please select a file to upload';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadData.name) {
        // Auto-fill name from filename
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setUploadData({
          ...uploadData,
          name: nameWithoutExt,
        });
      }
      if (errors.file) {
        setErrors({ ...errors, file: '' });
      }
    }
  };

  const uploadDocument = async () => {
    if (!validateForm()) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('document', selectedFile!);
      formData.append('type', uploadData.type);
      formData.append('name', uploadData.name);

      const response = await api.post('/profile/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setDocuments(response.data.data.documents || []);
        setUploadDialog(false);
        setSelectedFile(null);
        setUploadData({ type: 'other', name: '' });
        setErrors({});
      }
    } catch (error: any) {
      console.error('Error uploading document:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to upload document' });
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await api.delete(`/profile/documents/${documentId}`);
      
      if (response.data.success) {
        setDocuments(response.data.data.documents || []);
      }
    } catch (error: any) {
      console.error('Error deleting document:', error);
    }
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadData({
      ...uploadData,
      [field]: event.target.value,
    });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return <PictureAsPdf color="error" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return <Image color="info" />;
    return <Description color="action" />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'resume': return 'primary';
      case 'id-proof': return 'success';
      case 'address-proof': return 'warning';
      case 'education': return 'info';
      case 'contract': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'id-proof': return 'ID Proof';
      case 'address-proof': return 'Address Proof';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const handleOpenUploadDialog = () => {
    setUploadDialog(true);
    setSelectedFile(null);
    setUploadData({ type: 'other', name: '' });
    setErrors({});
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          My Documents
        </Typography>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={handleOpenUploadDialog}
        >
          Upload Document
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Documents
              </Typography>
              <Typography variant="h4" color="primary">
                {documents.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ID Proofs
              </Typography>
              <Typography variant="h4" color="success.main">
                {documents.filter(d => d.type === 'id-proof').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Education
              </Typography>
              <Typography variant="h4" color="info.main">
                {documents.filter(d => d.type === 'education').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Others
              </Typography>
              <Typography variant="h4" color="warning.main">
                {documents.filter(d => !['id-proof', 'education'].includes(d.type)).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Documents Table */}
      {documents.length > 0 ? (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Document</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Upload Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document._id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        {getFileIcon(document.name)}
                        <Typography variant="body2" fontWeight="medium">
                          {document.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getTypeLabel(document.type)}
                        color={getTypeColor(document.type) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(document.uploadDate).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="View">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${document.url}`, '_blank')}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => {
                              const link = window.document.createElement('a');
                              link.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${document.url}`;
                              link.download = document.name;
                              link.click();
                            }}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => deleteDocument(document._id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Documents Uploaded
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Upload your important documents for easy access and HR processing.
          </Typography>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={handleOpenUploadDialog}
            sx={{ mt: 2 }}
          >
            Upload Your First Document
          </Button>
        </Paper>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {errors.submit && (
              <Alert severity="error">{errors.submit}</Alert>
            )}
            
            <TextField
              select
              label="Document Type"
              value={uploadData.type}
              onChange={handleInputChange('type')}
              SelectProps={{ native: true }}
              fullWidth
            >
              <option value="resume">Resume</option>
              <option value="id-proof">ID Proof</option>
              <option value="address-proof">Address Proof</option>
              <option value="education">Education Certificate</option>
              <option value="contract">Contract</option>
              <option value="other">Other</option>
            </TextField>
            
            <TextField
              label="Document Name"
              value={uploadData.name}
              onChange={handleInputChange('name')}
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name || 'Enter a descriptive name for the document'}
            />
            
            <Box>
              <input
                accept="*/*"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AttachFile />}
                  fullWidth
                  sx={{ height: 56 }}
                  color={errors.file ? 'error' : 'primary'}
                >
                  {selectedFile ? selectedFile.name : 'Choose File'}
                </Button>
              </label>
              {errors.file && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {errors.file}
                </Typography>
              )}
            </Box>

            {selectedFile && (
              <Alert severity="info">
                File selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button 
            onClick={uploadDocument} 
            variant="contained" 
            disabled={uploading || !selectedFile || !uploadData.name}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDocuments;
