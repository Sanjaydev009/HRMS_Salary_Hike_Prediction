import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Stack,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Tab,
  Tabs,
  Fab,
} from '@mui/material';
import {
  Support,
  ArrowBack,
  Help,
  ContactSupport,
  BugReport,
  Feedback,
  Chat as LiveChat,
  Phone,
  Email,
  Description,
  Assignment,
  CheckCircle,
  Pending,
  Cancel,
  ExpandMore,
  Send,
  AttachFile as Attach,
  Search,
  FilterList,
  Refresh,
  Add,
  QuestionAnswer,
  School,
  VideoCall,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'hr' | 'payroll' | 'leave' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  responses: TicketResponse[];
}

interface TicketResponse {
  id: string;
  message: string;
  sender: 'user' | 'support';
  senderName: string;
  timestamp: string;
  attachments?: string[];
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  views: number;
}

interface ContactInfo {
  type: 'phone' | 'email' | 'chat';
  label: string;
  value: string;
  available: boolean;
  hours?: string;
}

const EmployeeSupport: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [newTicketDialog, setNewTicketDialog] = useState(false);
  const [ticketDetailDialog, setTicketDetailDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  
  // Form states
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'general' as const,
    priority: 'medium' as const,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  // Real-time data refresh
  useEffect(() => {
    fetchSupportData();
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchSupportData();
      setLastUpdate(new Date());
      console.log('Support data refreshed at:', new Date().toLocaleTimeString());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchSupportData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock support tickets
      const mockTickets: SupportTicket[] = [
        {
          id: 'TKT001',
          title: 'Unable to access payroll dashboard',
          description: 'I am getting a 404 error when trying to access my payroll information. This started happening since yesterday.',
          category: 'payroll',
          priority: 'high',
          status: 'in-progress',
          createdAt: '2025-09-08T10:30:00Z',
          updatedAt: '2025-09-08T14:20:00Z',
          assignedTo: 'Support Team',
          responses: [
            {
              id: 'R001',
              message: 'Thank you for reporting this issue. We are looking into the payroll dashboard access problem.',
              sender: 'support',
              senderName: 'Sarah (Support)',
              timestamp: '2025-09-08T11:00:00Z',
            },
            {
              id: 'R002',
              message: 'The issue has been escalated to our technical team. We expect a resolution within 4 hours.',
              sender: 'support',
              senderName: 'Mike (Tech Support)',
              timestamp: '2025-09-08T14:20:00Z',
            },
          ],
        },
        {
          id: 'TKT002',
          title: 'Leave application not reflecting in system',
          description: 'I submitted a leave application 3 days ago but it still shows as pending in my dashboard.',
          category: 'leave',
          priority: 'medium',
          status: 'resolved',
          createdAt: '2025-09-06T09:15:00Z',
          updatedAt: '2025-09-07T16:45:00Z',
          assignedTo: 'HR Team',
          responses: [
            {
              id: 'R003',
              message: 'We have checked your leave application. It was approved by your manager and the status has been updated.',
              sender: 'support',
              senderName: 'Emily (HR)',
              timestamp: '2025-09-07T16:45:00Z',
            },
          ],
        },
        {
          id: 'TKT003',
          title: 'Request for salary certificate',
          description: 'I need a salary certificate for loan application purposes. Please provide the document.',
          category: 'hr',
          priority: 'low',
          status: 'open',
          createdAt: '2025-09-09T08:00:00Z',
          updatedAt: '2025-09-09T08:00:00Z',
          responses: [],
        },
      ];
      
      // Mock FAQs
      const mockFAQs: FAQ[] = [
        {
          id: 'FAQ001',
          question: 'How do I apply for leave?',
          answer: 'You can apply for leave through the Employee Dashboard > Apply Leave section. Fill in the required details and submit for approval.',
          category: 'Leave Management',
          helpful: 45,
          views: 120,
        },
        {
          id: 'FAQ002',
          question: 'How to download payslip?',
          answer: 'Navigate to Payroll section in your dashboard, find the month you need, and click the Download button next to the payslip.',
          category: 'Payroll',
          helpful: 38,
          views: 95,
        },
        {
          id: 'FAQ003',
          question: 'How to update personal information?',
          answer: 'Go to My Profile section, click Edit Profile, make your changes, and save. Some changes may require HR approval.',
          category: 'Profile Management',
          helpful: 52,
          views: 87,
        },
        {
          id: 'FAQ004',
          question: 'What are the company holidays for 2025?',
          answer: 'You can view all company holidays in the Holidays section. The calendar shows national, religious, and company-specific holidays.',
          category: 'General',
          helpful: 31,
          views: 156,
        },
        {
          id: 'FAQ005',
          question: 'How to add certifications?',
          answer: 'Visit the Certifications section, click Add New Certification, fill in the details, and upload the certificate document.',
          category: 'Certifications',
          helpful: 29,
          views: 73,
        },
      ];
      
      // Mock contact information
      const mockContacts: ContactInfo[] = [
        {
          type: 'phone',
          label: 'IT Support Helpdesk',
          value: '+1-800-HELP-123',
          available: true,
          hours: '9:00 AM - 6:00 PM (Mon-Fri)',
        },
        {
          type: 'email',
          label: 'HR Support',
          value: 'hr-support@company.com',
          available: true,
          hours: '24/7 Response',
        },
        {
          type: 'email',
          label: 'Technical Support',
          value: 'tech-support@company.com',
          available: true,
          hours: '24/7 Response',
        },
        {
          type: 'chat',
          label: 'Live Chat Support',
          value: 'Available Now',
          available: true,
          hours: '9:00 AM - 9:00 PM (Mon-Sat)',
        },
      ];
      
      setTickets(mockTickets);
      setFaqs(mockFAQs);
      setContacts(mockContacts);
    } catch (error) {
      console.error('Error fetching support data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#2196f3';
      case 'in-progress': return '#ff9800';
      case 'resolved': return '#4caf50';
      case 'closed': return '#757575';
      default: return '#757575';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'high': return '#f44336';
      case 'urgent': return '#d32f2f';
      default: return '#757575';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <BugReport />;
      case 'hr': return <ContactSupport />;
      case 'payroll': return <Assignment />;
      case 'leave': return <Description />;
      default: return <Help />;
    }
  };

  const handleSubmitTicket = async () => {
    try {
      // Simulate API call
      const newTicketData: SupportTicket = {
        id: `TKT${String(tickets.length + 1).padStart(3, '0')}`,
        title: newTicket.title,
        description: newTicket.description,
        category: newTicket.category,
        priority: newTicket.priority,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: [],
      };
      
      setTickets(prev => [newTicketData, ...prev]);
      setNewTicketDialog(false);
      setNewTicket({ title: '', description: '', category: 'general', priority: 'medium' });
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const handleSendResponse = () => {
    if (!selectedTicket || !responseMessage.trim()) return;
    
    const newResponse: TicketResponse = {
      id: `R${Date.now()}`,
      message: responseMessage,
      sender: 'user',
      senderName: user?.profile?.firstName + ' ' + user?.profile?.lastName || 'You',
      timestamp: new Date().toISOString(),
    };
    
    const updatedTicket = {
      ...selectedTicket,
      responses: [...selectedTicket.responses, newResponse],
      updatedAt: new Date().toISOString(),
    };
    
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
    setResponseMessage('');
  };

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ticketStats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #009688 0%, #4db6ac 100%)', color: 'white' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom>
              Support & Help Center
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Get help, submit tickets, and find answers to common questions
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#4caf50',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                    '100%': { opacity: 1 },
                  },
                }}
              />
              <Typography variant="caption">
                Live Support Available
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <Assignment />
                </Avatar>
                <Box>
                  <Typography variant="h5">{ticketStats.total}</Typography>
                  <Typography variant="caption">Total Tickets</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <Pending />
                </Avatar>
                <Box>
                  <Typography variant="h5">{ticketStats.open + ticketStats.inProgress}</Typography>
                  <Typography variant="caption">Active Tickets</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h5">{ticketStats.resolved}</Typography>
                  <Typography variant="caption">Resolved</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'info.light' }}>
                  <QuestionAnswer />
                </Avatar>
                <Box>
                  <Typography variant="h5">{faqs.length}</Typography>
                  <Typography variant="caption">FAQ Articles</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="My Tickets" icon={<Assignment />} />
          <Tab label="FAQ & Knowledge Base" icon={<Help />} />
          <Tab label="Contact Support" icon={<ContactSupport />} />
          <Tab label="Quick Help" icon={<School />} />
        </Tabs>

        {/* Tab Panels */}
        <Box sx={{ p: 3 }}>
          {/* My Tickets Tab */}
          {tabValue === 0 && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                  My Support Tickets ({tickets.length})
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={() => setNewTicketDialog(true)}
                  >
                    New Ticket
                  </Button>
                </Stack>
              </Stack>

              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : tickets.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                  <Support sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No Support Tickets Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Need help? Create your first support ticket
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={() => setNewTicketDialog(true)}
                  >
                    Create Ticket
                  </Button>
                </Paper>
              ) : (
                <List>
                  {tickets.map((ticket) => (
                    <React.Fragment key={ticket.id}>
                      <ListItem 
                        alignItems="flex-start"
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          borderRadius: 1,
                        }}
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setTicketDetailDialog(true);
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            badgeContent={ticket.responses.length}
                            color="primary"
                            overlap="circular"
                          >
                            <Avatar sx={{ bgcolor: getStatusColor(ticket.status) }}>
                              {getCategoryIcon(ticket.category)}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        
                        <ListItemText
                          primary={
                            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                              <Typography variant="h6" component="span">
                                {ticket.title}
                              </Typography>
                              <Chip 
                                label={ticket.status} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: getStatusColor(ticket.status) + '20',
                                  color: getStatusColor(ticket.status) 
                                }}
                              />
                              <Chip 
                                label={ticket.priority} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: getPriorityColor(ticket.priority) + '20',
                                  color: getPriorityColor(ticket.priority) 
                                }}
                              />
                            </Stack>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.primary" gutterBottom>
                                {ticket.description.substring(0, 100)}...
                              </Typography>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="caption" color="text.secondary">
                                  #{ticket.id} • {new Date(ticket.createdAt).toLocaleDateString()}
                                </Typography>
                                {ticket.assignedTo && (
                                  <Typography variant="caption" color="primary">
                                    Assigned to: {ticket.assignedTo}
                                  </Typography>
                                )}
                              </Stack>
                            </Box>
                          }
                        />
                        
                        <ListItemSecondaryAction>
                          <Stack alignItems="end" spacing={1}>
                            <Typography variant="caption" color="text.secondary">
                              Updated: {new Date(ticket.updatedAt).toLocaleDateString()}
                            </Typography>
                          </Stack>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}

          {/* FAQ Tab */}
          {tabValue === 1 && (
            <Box>
              <Stack direction="row" spacing={2} mb={3}>
                <TextField
                  fullWidth
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <Button variant="outlined" startIcon={<FilterList />}>
                  Filter
                </Button>
              </Stack>

              <Typography variant="h6" gutterBottom>
                Frequently Asked Questions ({filteredFAQs.length})
              </Typography>

              {filteredFAQs.map((faq) => (
                <Accordion key={faq.id} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Stack direction="row" alignItems="center" spacing={2} width="100%">
                      <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                        {faq.question}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip label={faq.category} size="small" variant="outlined" />
                        <Typography variant="caption" color="text.secondary">
                          {faq.views} views
                        </Typography>
                      </Stack>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" gutterBottom>
                      {faq.answer}
                    </Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                      <Typography variant="caption" color="text.secondary">
                        {faq.helpful} people found this helpful
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" startIcon={<CheckCircle />}>
                          Helpful
                        </Button>
                        <Button size="small" startIcon={<Feedback />}>
                          Feedback
                        </Button>
                      </Stack>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}

          {/* Contact Support Tab */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              {contacts.map((contact) => (
                <Grid item xs={12} md={6} key={contact.label}>
                  <Card elevation={2}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: contact.type === 'phone' ? 'primary.light' : contact.type === 'email' ? 'success.light' : 'info.light' }}>
                          {contact.type === 'phone' ? <Phone /> : 
                           contact.type === 'email' ? <Email /> : 
                           <LiveChat />}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6">{contact.label}</Typography>
                          <Typography variant="body2" color="primary">
                            {contact.value}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {contact.hours}
                          </Typography>
                        </Box>
                        <Stack spacing={1}>
                          {contact.available && (
                            <Chip label="Available" size="small" color="success" />
                          )}
                          <Button 
                            variant="contained" 
                            size="small"
                            startIcon={
                              contact.type === 'phone' ? <Phone /> : 
                              contact.type === 'email' ? <Email /> : 
                              <LiveChat />
                            }
                          >
                            Contact
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              
              {/* Live Chat Widget */}
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.50' }}>
                  <Typography variant="h6" gutterBottom>
                    Need Immediate Help?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Start a live chat with our support team for instant assistance
                  </Typography>
                  <Stack direction="row" justifyContent="center" spacing={2}>
                    <Button variant="contained" startIcon={<LiveChat />} size="large">
                      Start Live Chat
                    </Button>
                    <Button variant="outlined" startIcon={<VideoCall />} size="large">
                      Schedule Video Call
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Quick Help Tab */}
          {tabValue === 3 && (
            <Grid container spacing={3}>
              {[
                {
                  title: 'Getting Started Guide',
                  description: 'New to the system? Learn the basics',
                  icon: <School />,
                  color: 'primary',
                },
                {
                  title: 'Video Tutorials',
                  description: 'Watch step-by-step video guides',
                  icon: <VideoCall />,
                  color: 'secondary',
                },
                {
                  title: 'User Manual',
                  description: 'Comprehensive documentation',
                  icon: <Description />,
                  color: 'info',
                },
                {
                  title: 'System Status',
                  description: 'Check current system health',
                  icon: <CheckCircle />,
                  color: 'success',
                },
                {
                  title: 'Feature Requests',
                  description: 'Suggest new features',
                  icon: <Feedback />,
                  color: 'warning',
                },
                {
                  title: 'Report Bug',
                  description: 'Report technical issues',
                  icon: <BugReport />,
                  color: 'error',
                },
              ].map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.title}>
                  <Card 
                    elevation={2}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': { transform: 'translateY(-4px)', elevation: 4 }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: `${item.color}.light`, 
                          width: 60, 
                          height: 60, 
                          mx: 'auto',
                          mb: 2 
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <Typography variant="h6" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Back Navigation */}
      <Box sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/employee/quick-actions')}
          startIcon={<ArrowBack />}
        >
          Back to Quick Actions
        </Button>
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setNewTicketDialog(true)}
      >
        <Add />
      </Fab>

      {/* New Ticket Dialog */}
      <Dialog open={newTicketDialog} onClose={() => setNewTicketDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Support Ticket</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ticket Title"
                value={newTicket.title}
                onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of your issue"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Category"
                value={newTicket.category}
                onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value as any }))}
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="technical">Technical Issue</MenuItem>
                <MenuItem value="hr">HR Related</MenuItem>
                <MenuItem value="payroll">Payroll</MenuItem>
                <MenuItem value="leave">Leave Management</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Priority"
                value={newTicket.priority}
                onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={newTicket.description}
                onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide detailed description of your issue, including steps to reproduce if technical"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewTicketDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitTicket}
            disabled={!newTicket.title || !newTicket.description}
            startIcon={<Send />}
          >
            Submit Ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ticket Detail Dialog */}
      <Dialog open={ticketDetailDialog} onClose={() => setTicketDetailDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: selectedTicket ? getStatusColor(selectedTicket.status) : 'primary.main', color: 'white' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              {selectedTicket && getCategoryIcon(selectedTicket.category)}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedTicket?.title}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Ticket #{selectedTicket?.id} • Created {selectedTicket && new Date(selectedTicket.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedTicket && (
            <Box>
              {/* Ticket Info */}
              <Box sx={{ p: 3, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="body1" gutterBottom>
                      {selectedTicket.description}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack spacing={1}>
                      <Chip 
                        label={`Status: ${selectedTicket.status}`}
                        sx={{ 
                          backgroundColor: getStatusColor(selectedTicket.status) + '20',
                          color: getStatusColor(selectedTicket.status) 
                        }}
                      />
                      <Chip 
                        label={`Priority: ${selectedTicket.priority}`}
                        sx={{ 
                          backgroundColor: getPriorityColor(selectedTicket.priority) + '20',
                          color: getPriorityColor(selectedTicket.priority) 
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Last updated: {new Date(selectedTicket.updatedAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>

              {/* Responses */}
              <Box sx={{ p: 3, maxHeight: 400, overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  Conversation ({selectedTicket.responses.length})
                </Typography>
                <Stack spacing={2}>
                  {selectedTicket.responses.map((response) => (
                    <Paper 
                      key={response.id}
                      elevation={1} 
                      sx={{ 
                        p: 2,
                        ml: response.sender === 'user' ? 4 : 0,
                        mr: response.sender === 'support' ? 4 : 0,
                        bgcolor: response.sender === 'user' ? 'primary.50' : 'grey.50'
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle2">
                          {response.senderName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(response.timestamp).toLocaleString()}
                        </Typography>
                      </Stack>
                      <Typography variant="body2">
                        {response.message}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Box>

              {/* Response Input */}
              <Box sx={{ p: 3, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Type your response..."
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                  />
                  <Stack spacing={1}>
                    <IconButton>
                      <Attach />
                    </IconButton>
                    <Button 
                      variant="contained" 
                      onClick={handleSendResponse}
                      disabled={!responseMessage.trim()}
                      startIcon={<Send />}
                    >
                      Send
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTicketDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeSupport;
