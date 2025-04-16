import api from './api';

export const getPendingInvitations = async () => {
  try {
    const response = await api.get('/invitations');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Davetler yüklenirken bir hata oluştu.');
  }
};

export const respondToInvitation = async (invitationId, accept) => {
  try {
    const response = await api.post(`/invitations/${invitationId}/respond`, { accept });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Davet yanıtlanırken bir hata oluştu.');
  }
};
