import { apiHelper } from '../../../helpers/apiHelper';

export const getUsers = () => {
  return apiHelper('/users');
};

export const getMe = () => {
  return apiHelper('/users/me');
};

export const updateMe = (name) => {
  return apiHelper('/users/me', {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });
};

export const updatePhoto = (photoFile) => {
  const formData = new FormData();
  formData.append('photo', photoFile);
  return apiHelper('/users/me/photo', {
    method: 'POST',
    body: formData,
  });
};

export const updatePassword = (oldPassword, newPassword) => {
  return apiHelper('/users/me/password', {
    method: 'PUT',
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
    }),
  });
};
