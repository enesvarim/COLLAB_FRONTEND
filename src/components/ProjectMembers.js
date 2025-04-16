import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import axios from 'axios';
import { useAuthHeader } from 'react-auth-kit';

const ProjectMembers = ({ project, onUpdate }) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const authHeader = useAuthHeader();

  const isCreator = (memberId) => {
    return project.creator.id === memberId;
  };

  const isAdmin = (memberId) => {
    return project.admins.some(admin => admin.id === memberId);
  };

  const handleMakeAdmin = async (userId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `/api/projects/${project.id}/admins/${userId}`,
        {}, // Boş bir body gönderiyoruz
        { headers: { 'Authorization': authHeader() } } // JWT token'ı ekliyoruz
      );
      setSuccess('Kullanıcı başarıyla yönetici yapıldı');
      if (onUpdate) onUpdate(response.data); // Proje verilerini güncelle
    } catch (err) {
      setError(err.response?.data?.message || 'Yönetici atanırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (userId) => {
    setLoading(true);
    try {
      const response = await axios.delete(
        `/api/projects/${project.id}/admins/${userId}`,
        { headers: { 'Authorization': authHeader() } }
      );

      setSuccess('Yönetici yetkisi başarıyla kaldırıldı');
      if (onUpdate) onUpdate(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Yönetici yetkisi kaldırılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Proje Üyeleri
      </Typography>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <List>
        {project.members.map((member) => (
          <ListItem
            key={member.id}
            secondaryAction={
              <>
                {!isCreator(member.id) && isAdmin(project.creator.id) && (
                  isAdmin(member.id) ? (
                    <Tooltip title="Yönetici Yetkisini Kaldır">
                      <IconButton
                        edge="end"
                        color="warning"
                        disabled={loading}
                        onClick={() => handleRemoveAdmin(member.id)}
                      >
                        <PersonRemoveIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Yönetici Yap">
                      <IconButton
                        edge="end"
                        color="primary"
                        disabled={loading}
                        onClick={() => handleMakeAdmin(member.id)}
                      >
                        <AdminPanelSettingsIcon />
                      </IconButton>
                    </Tooltip>
                  )
                )}
              </>
            }
          >
            <ListItemAvatar>
              <Avatar>{member.name.charAt(0)}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={member.name}
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {member.email}
                  {isCreator(member.id) && (
                    <Chip size="small" color="secondary" label="Kurucu" />
                  )}
                  {isAdmin(member.id) && !isCreator(member.id) && (
                    <Chip size="small" color="primary" label="Yönetici" />
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ProjectMembers;
