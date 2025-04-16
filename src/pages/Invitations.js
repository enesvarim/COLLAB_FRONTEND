import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Card, CardContent, CardActions,
  Button, Grid, Chip, Divider, CircularProgress
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getPendingInvitations, respondToInvitation } from '../services/invitationService';
import { toast } from 'react-toastify';

const Invitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const data = await getPendingInvitations();
      setInvitations(data);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Davetiyeler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondInvitation = async (invitationId, accept) => {
    try {
      await respondToInvitation(invitationId, accept);
      // Respond işleminden sonra davetleri yenile
      toast.success(accept ? 'Davet kabul edildi' : 'Davet reddedildi');
      fetchInvitations();
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error('Davet yanıtlanırken bir hata oluştu');
    }
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
      <Box display="flex" alignItems="center" mb={4}>
        <EmailIcon fontSize="large" sx={{ mr: 2, color: 'primary.main' }} />
        <Typography variant="h4">Proje Davetleri</Typography>
      </Box>

      {invitations.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">Bekleyen davetiniz bulunmuyor.</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Yeni davetler aldığınızda burada görüntülenecektir.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {invitations.map((invitation) => (
            <Grid item xs={12} md={6} lg={4} key={invitation.id}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {invitation.projectName}
                  </Typography>

                  <Chip
                    label={invitation.status === 'PENDING' ? 'Bekliyor' : invitation.status}
                    color="primary"
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {invitation.projectSubject}
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="body2">
                    <strong>Davet eden:</strong> {invitation.inviterName}
                  </Typography>

                  <Typography variant="body2">
                    <strong>Davet tarihi:</strong> {format(new Date(invitation.createdAt), 'dd/MM/yyyy HH:mm')}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    startIcon={<CheckIcon />}
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={() => handleRespondInvitation(invitation.id, true)}
                  >
                    Kabul Et
                  </Button>
                  <Button
                    startIcon={<CloseIcon />}
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={() => handleRespondInvitation(invitation.id, false)}
                  >
                    Reddet
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Invitations;
