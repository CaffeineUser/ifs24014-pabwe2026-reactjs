import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as userApi from '../api/userApi';
import reducer, {
  getMeAsync,
  getUsersAsync,
  updateMeAsync,
  updatePasswordAsync,
  updatePhotoAsync,
} from './usersSlice';

vi.mock('../api/userApi', () => ({
  getMe: vi.fn(),
  getUsers: vi.fn(),
  updateMe: vi.fn(),
  updatePassword: vi.fn(),
  updatePhoto: vi.fn(),
}));

const createTestStore = () => configureStore({ reducer });

describe('users slice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({
      users: [],
      user: null,
      profile: null,
      isProfile: false,
      isChangeProfile: false,
      isChangeProfilePhoto: false,
      isChangeProfilePassword: false,
      error: null,
    });
  });

  it('loads users and the current profile', async () => {
    const store = createTestStore();
    userApi.getUsers.mockResolvedValue({
      data: { users: [{ id: 1, name: 'Ada' }] },
    });
    await store.dispatch(getUsersAsync());
    expect(store.getState()).toMatchObject({
      isProfile: false,
      users: [{ id: 1, name: 'Ada' }],
    });

    const profile = { id: 1, name: 'Ada' };
    userApi.getMe.mockResolvedValue({ data: { user: profile } });
    await store.dispatch(getMeAsync());
    expect(store.getState()).toMatchObject({
      isProfile: false,
      profile,
      user: profile,
    });
  });

  it('updates profile details and profile photo', async () => {
    const store = createTestStore();
    const profile = { id: 1, name: 'Ada Lovelace' };
    userApi.updateMe.mockResolvedValue({ data: { user: profile } });
    await store.dispatch(updateMeAsync('Ada Lovelace'));
    expect(store.getState()).toMatchObject({
      isChangeProfile: false,
      profile,
      user: profile,
    });

    userApi.updatePhoto.mockResolvedValue({
      data: { user: { photo: '/ada.png' } },
    });
    await store.dispatch(updatePhotoAsync(new File([], 'ada.png')));
    expect(store.getState()).toMatchObject({
      isChangeProfilePhoto: false,
      profile: { photo: '/ada.png' },
    });
  });

  it('does not mutate profile photo state when no profile is loaded', async () => {
    const store = createTestStore();
    userApi.updatePhoto.mockResolvedValue({
      data: { user: { photo: '/ada.png' } },
    });

    await store.dispatch(updatePhotoAsync(new File([], 'ada.png')));

    expect(store.getState()).toMatchObject({
      profile: null,
      isChangeProfilePhoto: false,
    });
  });

  it('updates a password without replacing the profile', async () => {
    const store = createTestStore();
    userApi.updatePassword.mockResolvedValue({ data: { message: 'Updated' } });

    await store.dispatch(
      updatePasswordAsync({
        oldPassword: 'old-secret',
        newPassword: 'new-secret',
      }),
    );

    expect(store.getState()).toMatchObject({
      profile: null,
      isChangeProfilePassword: false,
    });
  });

  it.each([
    ['getUsers', getUsersAsync, undefined],
    ['getMe', getMeAsync, undefined],
    ['updateMe', updateMeAsync, 'Ada'],
    ['updatePhoto', updatePhotoAsync, new File([], 'photo.png')],
    [
      'updatePassword',
      updatePasswordAsync,
      { oldPassword: 'old', newPassword: 'new' },
    ],
  ])('stores API errors from %s', async (name, thunk, args) => {
    userApi[name].mockRejectedValue(new Error(`${name} failed`));
    const store = createTestStore();

    const action = await store.dispatch(thunk(args));

    expect(action.payload).toBe(`${name} failed`);
    expect(store.getState().error).toBe(`${name} failed`);
  });
});
