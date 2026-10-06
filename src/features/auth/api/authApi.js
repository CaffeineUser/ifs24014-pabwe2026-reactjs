import { apiHelper } from '../../../helpers/apiHelper';

export const login = (email, password) => {
  return apiHelper('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const register = (name, email, password) => {
  return apiHelper('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
};
