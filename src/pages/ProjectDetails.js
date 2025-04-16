import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Tabs, Tab, Divider,
  Button, Chip, Avatar, List, ListItem, ListItemAvatar,
  ListItemText, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, CircularProgress,
  Grid, Card, CardContent, CardActions, Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  PersonRemove as PersonRemoveIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getProjectById, addAdmin, removeAdmin } from '../services/projectService';
import { getProjectTasks, createTask, updateTaskStatus } from '../services/taskService';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

// Custom TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [taskAssignee, setTaskAssignee] = useState('');
  const [openAdminDialog, setOpenAdminDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const isCreator = project?.creator?.id === user?.id;
  const isAdmin = project?.admins?.some(admin => admin.email === user?.email) || isCreator;

  const taskFormik = useFormik({
    initialValues: {
      title: '',
      description: '',
      deadline: null,
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Görev adı gereklidir'),
      description: Yup.string(),
      deadline: Yup.date().nullable(),
    }),
    onSubmit: async (values) => {
      if (!taskAssignee) {
        toast.error('Lütfen görevi atayacağınız üyeyi seçin');
        return;
      }

      try {
        const taskData = {
          title: values.title,
          description: values.description,
          deadline: values.deadline,
          projectId: Number(projectId),
          assignedToId: Number(taskAssignee)
        };

        await createTask(taskData);
        toast.success('Görev başarıyla oluşturuldu');
        handleCloseTaskDialog();
        refreshProjectData();
      } catch (error) {
        console.error('Error creating task:', error);
        toast.error('Görev oluşturulurken bir hata oluştu');
      }
    }
  });

  useEffect(() => {
    fetchProjectData();
  }, [projectId, refreshKey]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const [projectData, tasksData] = await Promise.all([
        getProjectById(projectId),
        getProjectTasks(projectId)
      ]);

      setProject(projectData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast.error('Proje detayları yüklenirken bir hata oluştu');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const refreshProjectData = () => {
    setRefreshKey(old => old + 1);
  };

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenTaskDialog = () => {
    setOpenTaskDialog(true);
  };

  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false);
    taskFormik.resetForm();
    setTaskAssignee('');
  };

  const handleOpenAdminDialog = () => {
    setOpenAdminDialog(true);
  };

  const handleCloseAdminDialog = () => {
    setOpenAdminDialog(false);
    setSelectedMember('');
  };

  const handleAddAdmin = async () => {
    if (!selectedMember) return;

    try {
      await addAdmin(projectId, selectedMember);
      toast.success('Yönetici ataması başarıyla yapıldı');
      handleCloseAdminDialog();
      refreshProjectData();
    } catch (error) {
      console.error('Error adding admin:', error);
      toast.error('Yönetici atanırken bir hata oluştu');
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    try {
      await removeAdmin(projectId, adminId);
      toast.success('Yönetici yetkisi başarıyla kaldırıldı');
      refreshProjectData();
    } catch (error) {
      console.error('Error removing admin:', error);
      toast.error('Yönetici yetkisi kaldırılırken bir hata oluştu');
    }
  };

  const handleOpenStatusDialog = (task) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setSelectedTask(null);
    setNewStatus('');
  };

  const handleUpdateTaskStatus = async () => {
    if (!selectedTask || !newStatus) return;

    try {
      await updateTaskStatus(selectedTask.id, newStatus);
      toast.success('Görev durumu başarıyla güncellendi');
      handleCloseStatusDialog();
      refreshProjectData();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Görev durumu güncellenirken bir hata oluştu');
    }
  };

  const getNonAdminMembers = () => {
    if (!project) return [];
    const adminIds = project.admins.map(admin => admin.id);
    return project.members.filter(member => !adminIds.includes(member.id));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4">{project.name}</Typography>
          <Typography variant="subtitle1" color="textSecondary">{project.subject}</Typography>
          {project.deadline && (
            <Typography variant="body2">
              <strong>Son Tarih:</strong> {format(new Date(project.deadline), 'dd/MM/yyyy')}
            </Typography>
          )}
        </Box>

        <Box>
          <Button
            startIcon={<RefreshIcon />}
            onClick={refreshProjectData}
            variant="outlined"
          >
            Yenile
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', marginBottom: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleChangeTab}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Görevler" />
          <Tab label="Üyeler" />
          <Tab label="Yöneticiler" />
        </Tabs>

        {/* Görevler Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            {isAdmin && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenTaskDialog}
              >
                Yeni Görev
              </Button>
            )}
          </Box>

          {tasks.length === 0 ? (
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                Bu projede henüz görev bulunmuyor.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {tasks.map((task) => (
                <Grid item xs={12} md={6} lg={4} key={task.id}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {task.title}
                      </Typography>

                      <Box display="flex" alignItems="center" mb={1}>
                        <Chip
                          label={
                            task.status === 'PENDING' ? 'Beklemede' :
                              task.status === 'IN_PROGRESS' ? 'Devam Ediyor' :
                                task.status === 'COMPLETED' ? 'Tamamlandı' : 'İptal Edildi'
                          }
                          color={
                            task.status === 'PENDING' ? 'warning' :
                              task.status === 'IN_PROGRESS' ? 'info' :
                                task.status === 'COMPLETED' ? 'success' : 'error'
                          }
                          size="small"
                        />
                      </Box>

                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {task.description || 'Açıklama yok'}
                      </Typography>

                      <Divider sx={{ my: 1.5 }} />

                      <Box display="flex" alignItems="center" mb={1}>
                        <Avatar
                          src="/static/images/avatar/1.jpg"
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />
                        <Typography variant="body2">
                          <strong>Atanan:</strong> {task.assignedTo?.firstName} {task.assignedTo?.lastName}
                        </Typography>
                      </Box>

                      {task.deadline && (
                        <Typography variant="body2">
                          <strong>Son Tarih:</strong> {format(new Date(task.deadline), 'dd/MM/yyyy')}
                        </Typography>
                      )}
                    </CardContent>
                    {(isAdmin || user?.email === task.assignedTo?.email) && (
                      <CardActions>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenStatusDialog(task)}
                        >
                          Durumu Güncelle
                        </Button>
                      </CardActions>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Üyeler Tab */}
        <TabPanel value={tabValue} index={1}>
          <List>
            {project.members.map((member) => (
              <ListItem
                key={member.id}
                secondaryAction={
                  isCreator && member.id !== project.creator.id ? (
                    <IconButton edge="end" aria-label="remove" color="error">
                      <Tooltip title="Üyelikten çıkar">
                        <PersonRemoveIcon />
                      </Tooltip>
                    </IconButton>
                  ) : null
                }
              >
                <ListItemAvatar>
                  <Avatar>{member.firstName.charAt(0)}{member.lastName.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${member.firstName} ${member.lastName}`}
                  secondary={member.email}
                />
                {project.admins.some(admin => admin.id === member.id) && (
                  <Chip
                    label="Yönetici"
                    color="primary"
                    size="small"
                    icon={<AdminIcon />}
                    sx={{ mr: 2 }}
                  />
                )}
                {member.id === project.creator.id && (
                  <Chip
                    label="Kurucu"
                    color="secondary"
                    size="small"
                  />
                )}
              </ListItem>
            ))}
          </List>
        </TabPanel>

        {/* Yöneticiler Tab */}
        <TabPanel value={tabValue} index={2}>
          {isCreator && (
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenAdminDialog}
              >
                Yönetici Ekle
              </Button>
            </Box>
          )}

          <List>
            {project.admins.map((admin) => (
              <ListItem
                key={admin.id}
                secondaryAction={
                  isCreator && admin.id !== project.creator.id ? (
                    <IconButton
                      edge="end"
                      aria-label="remove admin"
                      color="error"
                      onClick={() => handleRemoveAdmin(admin.id)}
                    >
                      <Tooltip title="Yönetici yetkisini kaldır">
                        <DeleteIcon />
                      </Tooltip>
                    </IconButton>
                  ) : null
                }
              >
                <ListItemAvatar>
                  <Avatar>{admin.firstName.charAt(0)}{admin.lastName.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${admin.firstName} ${admin.lastName}`}
                  secondary={admin.email}
                />
                {admin.id === project.creator.id && (
                  <Chip
                    label="Kurucu"
                    color="secondary"
                    size="small"
                  />
                )}
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </Paper>

      {/* Yeni Görev Dialog */}
      <Dialog open={openTaskDialog} onClose={handleCloseTaskDialog} maxWidth="md" fullWidth>
        <form onSubmit={taskFormik.handleSubmit}>
          <DialogTitle>Yeni Görev Ekle</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="normal"
              id="title"
              name="title"
              label="Görev Başlığı"
              fullWidth
              variant="outlined"
              value={taskFormik.values.title}
              onChange={taskFormik.handleChange}
              onBlur={taskFormik.handleBlur}
              error={taskFormik.touched.title && Boolean(taskFormik.errors.title)}
              helperText={taskFormik.touched.title && taskFormik.errors.title}
            />

            <TextField
              margin="normal"
              id="description"
              name="description"
              label="Görev Açıklaması"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={taskFormik.values.description}
              onChange={taskFormik.handleChange}
            />

            <Box mt={2} mb={2}>
              <DatePicker
                label="Son Tarih"
                value={taskFormik.values.deadline}
                onChange={(value) => taskFormik.setFieldValue('deadline', value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                  },
                }}
              />
            </Box>

            <FormControl fullWidth margin="normal">
              <InputLabel id="assignee-label">Atanacak Üye</InputLabel>
              <Select
                labelId="assignee-label"
                id="assignee"
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                label="Atanacak Üye"
              >
                {project.members.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.firstName} {member.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseTaskDialog}>İptal</Button>
            <Button type="submit" variant="contained" color="primary">Ekle</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Yönetici Ekleme Dialog */}
      <Dialog open={openAdminDialog} onClose={handleCloseAdminDialog}>
        <DialogTitle>Yönetici Ekle</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="member-label">Üye Seçin</InputLabel>
            <Select
              labelId="member-label"
              id="member"
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              label="Üye Seçin"
            >
              {getNonAdminMembers().map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.firstName} {member.lastName} - {member.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdminDialog}>İptal</Button>
          <Button
            onClick={handleAddAdmin}
            variant="contained"
            color="primary"
            disabled={!selectedMember}
          >
            Yönetici Yap
          </Button>
        </DialogActions>
      </Dialog>

      {/* Görev Durumu Güncelleme Dialog */}
      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog}>
        <DialogTitle>Görev Durumunu Güncelle</DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box py={1}>
              <Typography variant="subtitle1">
                <strong>{selectedTask.title}</strong>
              </Typography>

              <FormControl fullWidth margin="normal">
                <InputLabel>Durum</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="Durum"
                >
                  <MenuItem value="PENDING">Beklemede</MenuItem>
                  <MenuItem value="IN_PROGRESS">Devam Ediyor</MenuItem>
                  <MenuItem value="COMPLETED">Tamamlandı</MenuItem>
                  <MenuItem value="CANCELED">İptal Edildi</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>İptal</Button>
          <Button
            onClick={handleUpdateTaskStatus}
            variant="contained"
            color="primary"
          >
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetails;
