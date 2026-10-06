import { apiHelper } from '../../../helpers/apiHelper';

export const getLostFounds = (params = {}) => {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.is_completed !== undefined && params.is_completed !== '') query.append('is_completed', params.is_completed);
  if (params.is_me) query.append('is_me', params.is_me);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return apiHelper(`/lost-founds${queryString}`);
};

export const getLostFoundById = (id) => {
  return apiHelper(`/lost-founds/${id}`);
};

export const addLostFound = (title, description, status) => {
  return apiHelper('/lost-founds', {
    method: 'POST',
    body: JSON.stringify({ title, description, status }),
  });
};

export const updateLostFound = (id, title, description, status, is_completed) => {
  return apiHelper(`/lost-founds/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, description, status, is_completed }),
  });
};

export const updateCover = (id, coverFile) => {
  const formData = new FormData();
  formData.append('cover', coverFile);
  return apiHelper(`/lost-founds/${id}/cover`, {
    method: 'POST',
    body: formData,
  });
};

export const deleteLostFound = (id) => {
  return apiHelper(`/lost-founds/${id}`, {
    method: 'DELETE',
  });
};

export const getStatsDaily = () => {
  return apiHelper('/lost-founds/stats/daily');
};

export const getStatsMonthly = () => {
  return apiHelper('/lost-founds/stats/monthly');
};
