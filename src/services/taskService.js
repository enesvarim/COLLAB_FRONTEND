import api from './api';

export const getUserTasks = async () => {
  try {
    const response = await api.get('/tasks/user');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Görevler yüklenirken bir hata oluştu.');
  }
};

export const getProjectTasks = async (projectId) => {
  try {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Proje görevleri yüklenirken bir hata oluştu.');
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Görev oluşturulurken bir hata oluştu.');
  }
};

export const updateTaskStatus = async (taskId, status) => {
  try {
    const response = await api.put(`/tasks/${taskId}/status?status=${status}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Görev durumu güncellenirken bir hata oluştu.');
  }
};

// Görev silme işlemi için ekstra fonksiyon
export const deleteTask = async (taskId) => {
  try {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Görev silinirken bir hata oluştu.');
  }
};

// Görevi güncelleme işlemi için ekstra fonksiyon
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Görev güncellenirken bir hata oluştu.');
  }
};

// Belirli bir görevi getirme işlevi
export const getTaskById = async (taskId) => {
  try {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Görev detayları yüklenirken bir hata oluştu.');
  }
};
