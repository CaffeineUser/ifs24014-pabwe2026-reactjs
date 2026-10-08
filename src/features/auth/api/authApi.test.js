import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiHelper } from '../../../helpers/apiHelper';
import { login, register } from './authApi';

vi.mock('../../../helpers/apiHelper', () => ({
  apiHelper: vi.fn(),
}));

describe('auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends login credentials', () => {
    login('user@example.com', 'secret');

    expect(apiHelper).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'secret',
      }),
    });
  });

  it('sends registration details', () => {
    register('Ada', 'ada@example.com', 'secret');

    expect(apiHelper).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Ada',
        email: 'ada@example.com',
        password: 'secret',
      }),
    });
  });
});
