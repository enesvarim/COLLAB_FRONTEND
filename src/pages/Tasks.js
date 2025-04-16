import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  Chip, IconButton, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControl, InputLabel,
  Select, MenuItem, TextField, CircularProgress
} from '@mui/material';
import {
  Check as CheckIcon,
  Replay as ReplayIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { getUserTasks, updateTaskStatus } from '../services/taskService';
import { getUserProjects } from '../services/projectService';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const statusColors = {
    PENDING: 'warning',
    IN_PROGRESS: 'info',
    COMPLETED: 'success',
    CANCELED: 'error'
  };

  const statusLabels = {
    PENDING: 'Beklemede',
    IN_PROGRESS: 'Devam Ediyor',
    COMPLETED: 'Tamamlandı',
    CANCELED: 'İptal Edildi',
    ALL: 'Tümü'
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const tasksData = await getUserTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Görevler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusChange = async () => {
    if (!currentTask || !newStatus) return;

    try {
      const updatedTask = await updateTaskStatus(currentTask.id, newStatus);
      setTasks(tasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      ));
      toast.success(`Görev durumu "${statusLabels[newStatus]}" olarak güncellendi`);
      handleCloseStatusDialog();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Görev durumu güncellenirken bir hata oluştu');
    }
  };

  const openStatusUpdateDialog = (task, defaultStatus) => {
    setCurrentTask(task);
    setNewStatus(defaultStatus || task.status);
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setCurrentTask(null);
    setNewStatus('');
  };

  const filteredTasks = statusFilter === 'ALL'
    ? tasks
    : tasks.filter(task => task.status === statusFilter);

  // Pagination logic
  const paginatedTasks = filteredTasks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Görevlerim</Typography>
      </Box>

      <Box mb={3} display="flex" gap={2}>
        <FormControl variant="outlined" style={{ minWidth: 200 }}>
          <InputLabel>Durum Filtresi</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Durum Filtresi"
          >
            <MenuItem value="ALL">Tüm Görevler</MenuItem>
            <MenuItem value="PENDING">Beklemede</MenuItem>
            <MenuItem value="IN_PROGRESS">Devam Edenler</MenuItem>
            <MenuItem value="COMPLETED">Tamamlananlar</MenuItem>
            <MenuItem value="CANCELED">İptal Edilenler</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredTasks.length === 0 ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            {statusFilter === 'ALL'
              ? 'Henüz bir göreviniz bulunmuyor.'
              : `"${statusLabels[statusFilter]}" durumunda görev bulunmuyor.`}
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Görev</strong></TableCell>
                  <TableCell><strong>Proje</strong></TableCell>
                  <TableCell><strong>Son Tarih</strong></TableCell>
                  <TableCell><strong>Durum</strong></TableCell>
                  <TableCell><strong>İşlemler</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTasks.map((task) => (
                  <TableRow hover key={task.id}>
                    <TableCell>
                      <Typography variant="body1">{task.title}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {task.description?.length > 50
                          ? `${task.description.substring(0, 50)}...`
                          : task.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{task.projectName}</TableCell>
                    <TableCell>
                      {task.deadline ? format(new Date(task.deadline), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabels[task.status]}
                        color={statusColors[task.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        {task.status === 'PENDING' && (
                          <IconButton
                            size="small"
                            color="info"
                            title="Başlat"
                            onClick={() => openStatusUpdateDialog(task, 'IN_PROGRESS')}
                          >
                            <PlayArrowIcon />
                          </IconButton>
                        )}

                        {task.status === 'IN_PROGRESS' && (
                          <IconButton
                            size="small"
                            color="success"
                            title="Tamamla"
                            onClick={() => openStatusUpdateDialog(task, 'COMPLETED')}
                          >
                            <CheckIcon />
                          </IconButton>
                        )}

                        {(task.status === 'PENDING' || task.status === 'IN_PROGRESS') && (
                          <IconButton
                            size="small"
                            color="error"
                            title="İptal Et"
                            onClick={() => openStatusUpdateDialog(task, 'CANCELED')}
                          >
                            <CancelIcon />
                          </IconButton>
                        )}

                        {(task.status === 'COMPLETED' || task.status === 'CANCELED') && (
                          <IconButton
                            size="small"
                            color="warning"
                            title="Yeniden Başlat"
                            onClick={() => openStatusUpdateDialog(task, 'IN_PROGRESS')}
                          >
                            <ReplayIcon />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredTasks.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Sayfa başına görev:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          />
        </Paper>
      )}

      {/* Task Status Update Dialog */}
      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog}>
        <DialogTitle>Görev Durumunu Güncelle</DialogTitle>
        <DialogContent>
          <Box py={1}>
            {currentTask && (
              <>
                <Typography variant="subtitle1">
                  <strong>{currentTask.title}</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {currentTask.projectName}
                </Typography>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Yeni Durum</InputLabel>
                  <Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    label="Yeni Durum"
                  >
                    <MenuItem value="PENDING">Beklemede</MenuItem>
                    <MenuItem value="IN_PROGRESS">Devam Ediyor</MenuItem>
                    <MenuItem value="COMPLETED">Tamamlandı</MenuItem>
                    <MenuItem value="CANCELED">İptal Edildi</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>İptal</Button>
          <Button onClick={handleStatusChange} variant="contained" color="primary">
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;
