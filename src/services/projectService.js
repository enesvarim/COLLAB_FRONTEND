import api from './api';

export const getUserProjects = async () => {
  try {
    const response = await api.get('/projects');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Projeler yüklenirken bir hata oluştu.');
  }
};

export const getProjectById = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Proje detayları yüklenirken bir hata oluştu.');
  }
};

export const createProject = async (projectData) => {
  try {
    const response = await api.post('/projects', projectData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Proje oluşturulurken bir hata oluştu.');
  }
};

export const addAdmin = async (projectId, userId) => {
  try {
    const response = await api.post(`/projects/${projectId}/admins/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Yönetici eklenirken bir hata oluştu.');
  }
};

export const removeAdmin = async (projectId, userId) => {
  try {
    const response = await api.delete(`/projects/${projectId}/admins/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Yönetici silinirken bir hata oluştu.');
  }
};
