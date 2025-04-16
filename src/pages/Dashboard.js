import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Button, Card, CardContent, CardActions, 
  Grid, CircularProgress, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getUserProjects, createProject } from '../services/projectService';
import { getUserTasks } from '../services/taskService';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, tasksData] = await Promise.all([
          getUserProjects(),
          getUserTasks()
        ]);
        setProjects(projectsData);
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: '',
      subject: '',
      deadline: null,
      memberEmails: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Proje adı gerekli'),
      subject: Yup.string().required('Proje konusu gerekli'),
      deadline: Yup.date().nullable(),
      memberEmails: Yup.string()
    }),
    onSubmit: async (values) => {
      try {
        // Parse emails string into an array
        const memberEmails = values.memberEmails 
          ? values.memberEmails.split(',').map(email => email.trim()).filter(Boolean) 
          : [];
        
        const projectData = {
          ...values,
          memberEmails
        };
        
        const newProject = await createProject(projectData);
        setProjects(prev => [...prev, newProject]);
        toast.success('Proje başarıyla oluşturuldu');
        handleClose();
      } catch (error) {
        toast.error('Proje oluşturulurken bir hata oluştu');
        console.error(error);
      }
    }
  });

  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    formik.resetForm();
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Dashboard</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Yeni Proje
        </Button>
      </Box>

      <Box mb={5}>
        <Typography variant="h5" mb={2}>Projelerim</Typography>
        {projects.length === 0 ? (
          <Card>
            <CardContent>
              <Typography>Henüz bir projeniz bulunmuyor.</Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {project.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {project.subject}
                    </Typography>
                    {project.deadline && (
                      <Typography variant="body2">
                        Son Tarih: {format(new Date(project.deadline), 'dd/MM/yyyy')}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate(`/projects/${project.id}`)}>
                      Görüntüle
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Box>
        <Typography variant="h5" mb={2}>Görevlerim</Typography>
        {tasks.length === 0 ? (
          <Card>
            <CardContent>
              <Typography>Henüz bir göreviniz bulunmuyor.</Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {tasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {task.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {task.description}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Proje: {task.projectName}
                    </Typography>
                    <Typography variant="body2" color={
                      task.status === 'COMPLETED' ? 'success.main' : 
                      task.status === 'IN_PROGRESS' ? 'info.main' : 
                      task.status === 'CANCELED' ? 'error.main' : 'warning.main'
                    }>
                      Durum: {
                        task.status === 'COMPLETED' ? 'Tamamlandı' : 
                        task.status === 'IN_PROGRESS' ? 'Devam Ediyor' : 
                        task.status === 'CANCELED' ? 'İptal Edildi' : 'Beklemede'
                      }
                    </Typography>
                    {task.deadline && (
                      <Typography variant="body2">
                        Son Tarih: {format(new Date(task.deadline), 'dd/MM/yyyy')}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Yeni Proje Dialog */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>Yeni Proje Oluştur</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin="normal"
              id="name"
              name="name"
              label="Proje Adı"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth
              margin="normal"
              id="subject"
              name="subject"
              label="Proje Konusu"
              value={formik.values.subject}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.subject && Boolean(formik.errors.subject)}
              helperText={formik.touched.subject && formik.errors.subject}
            />
            <Box mt={2}>
              <DatePicker
                label="Son Tarih"
                value={formik.values.deadline}
                onChange={(value) => formik.setFieldValue('deadline', value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: formik.touched.deadline && Boolean(formik.errors.deadline),
                    helperText: formik.touched.deadline && formik.errors.deadline
                  }
                }}
              />
            </Box>
            <TextField
              fullWidth
              margin="normal"
              id="memberEmails"
              name="memberEmails"
              label="Üye E-postaları (virgülle ayırın)"
              value={formik.values.memberEmails}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.memberEmails && Boolean(formik.errors.memberEmails)}
              helperText={formik.touched.memberEmails && formik.errors.memberEmails || "Örnek: user1@example.com, user2@example.com"}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>İptal</Button>
            <Button type="submit" variant="contained" color="primary">Oluştur</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
