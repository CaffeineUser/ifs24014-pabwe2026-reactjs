import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiHelper } from '../../../helpers/apiHelper';
import {
  getMe,
  getUsers,
  updateMe,
  updatePassword,
  updatePhoto,
} from './userApi';

vi.mock('../../../helpers/apiHelper', () => ({
  apiHelper: vi.fn(),
}));

describe('user API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets users and the current user', () => {
    getUsers();
    getMe();

    expect(apiHelper).toHaveBeenNthCalledWith(1, '/users');
    expect(apiHelper).toHaveBeenNthCalledWith(2, '/users/me');
  });

  it('updates the current user name', () => {
    updateMe('Ada');

    expect(apiHelper).toHaveBeenCalledWith('/users/me', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Ada' }),
    });
  });

  it('uploads a profile photo', () => {
    const file = new File(['photo'], 'photo.png');
    updatePhoto(file);

    expect(apiHelper).toHaveBeenCalledWith(
      '/users/me/photo',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );
    expect(apiHelper.mock.calls[0][1].body.get('photo')).toBe(file);
  });

  it('updates the password using the API field names', () => {
    updatePassword('old-secret', 'new-secret');

    expect(apiHelper).toHaveBeenCalledWith('/users/me/password', {
      method: 'PUT',
      body: JSON.stringify({
        old_password: 'old-secret',
        new_password: 'new-secret',
      }),
    });
  });
});
