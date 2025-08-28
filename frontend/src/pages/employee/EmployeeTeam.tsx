import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Stack,
} from '@mui/material';
import {
  Announcement,
  Group,
  Phone,
  Email,
  Support,
} from '@mui/icons-material';

const EmployeeTeam: React.FC = () => {
  const teamMembers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      designation: 'Senior Software Engineer',
      email: 'sarah.johnson@company.com',
      phone: '+1 234-567-8901',
      avatar: '',
    },
    {
      id: '2',
      name: 'Mike Chen',
      designation: 'Product Manager',
      email: 'mike.chen@company.com',
      phone: '+1 234-567-8902',
      avatar: '',
    },
    {
      id: '3',
      name: 'Emily Davis',
      designation: 'UI/UX Designer',
      email: 'emily.davis@company.com',
      phone: '+1 234-567-8903',
      avatar: '',
    },
    {
      id: '4',
      name: 'David Wilson',
      designation: 'DevOps Engineer',
      email: 'david.wilson@company.com',
      phone: '+1 234-567-8904',
      avatar: '',
    },
  ];

  const announcements = [
    {
      id: '1',
      title: 'Team Building Event Next Friday',
      content: 'Join us for a fun team building event at the local park. Lunch will be provided.',
      date: '2025-08-25',
      priority: 'high',
    },
    {
      id: '2',
      title: 'New Project Kickoff Meeting',
      content: 'All team members are required to attend the new project kickoff meeting.',
      date: '2025-08-24',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Office Renovation Update',
      content: 'The office renovation will begin next month. Remote work arrangements available.',
      date: '2025-08-20',
      priority: 'low',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Team & Communication
      </Typography>

      <Grid container spacing={3}>
        {/* My Team */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Team Members
              </Typography>
              
              <Grid container spacing={2}>
                {teamMembers.map((member) => (
                  <Grid item xs={12} sm={6} key={member.id}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 50, height: 50 }}>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {member.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {member.designation}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {member.email}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {member.phone}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Group sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Team Directory
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Browse complete company directory
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Support sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Request Support
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get help from IT or HR support
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Announcement sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Company News
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stay updated with latest announcements
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Recent Announcements */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Announcements
              </Typography>
              
              <List>
                {announcements.map((announcement, index) => (
                  <React.Fragment key={announcement.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemIcon>
                        <Announcement color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold">
                              {announcement.title}
                            </Typography>
                            <Chip 
                              label={announcement.priority.toUpperCase()} 
                              color={getPriorityColor(announcement.priority) as any}
                              size="small" 
                            />
                          </Stack>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                              {announcement.content}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {new Date(announcement.date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < announcements.length - 1 && <Box sx={{ height: 16 }} />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Team Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Team Statistics
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Team Members:</Typography>
                  <Typography variant="body1" fontWeight="bold">5</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Active Projects:</Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary.main">3</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Completed This Month:</Typography>
                  <Typography variant="body1" fontWeight="bold" color="success.main">8</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Team Performance:</Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary.main">95%</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Contacts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Contacts
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">HR Department:</Typography>
                  <Typography variant="body2" color="primary.main">hr@company.com</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">IT Support:</Typography>
                  <Typography variant="body2" color="primary.main">support@company.com</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Manager:</Typography>
                  <Typography variant="body2" color="primary.main">manager@company.com</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Emergency Line:</Typography>
                  <Typography variant="body2" color="error.main">+1 800-EMERGENCY</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeTeam;
