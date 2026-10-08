import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authApi from '../api/authApi';
import reducer, {
  loginAsync,
  logout,
  registerAsync,
  resetAuthState,
} from './authSlice';

vi.mock('../api/authApi', () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

const createTestStore = () => configureStore({ reducer });

describe('auth slice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('provides the initial state and resets auth state', () => {
    const initialState = reducer(undefined, { type: 'unknown' });
    expect(initialState).toEqual({
      isAuthLogin: false,
      isAuthRegister: false,
      isAuthLogout: false,
      error: null,
    });

    expect(
      reducer(
        { ...initialState, isAuthLogin: true, error: 'failed' },
        resetAuthState(),
      ),
    ).toEqual(initialState);
  });

  it('logs in, stores the token, and updates the login state', async () => {
    authApi.login.mockResolvedValue({
      data: { token: 'auth-token', user: { id: 1 } },
    });
    const store = createTestStore();

    const pending = store.dispatch(loginAsync.pending('request', {}));
    expect(reducer(undefined, pending)).toMatchObject({
      isAuthLogin: true,
      error: null,
    });

    const action = await store.dispatch(
      loginAsync({ email: 'ada@example.com', password: 'secret' }),
    );

    expect(loginAsync.fulfilled.match(action)).toBe(true);
    expect(localStorage.getItem('accessToken')).toBe('auth-token');
    expect(store.getState()).toMatchObject({
      isAuthLogin: false,
      isAuthLogout: false,
    });
  });

  it('handles login failures', async () => {
    authApi.login.mockRejectedValue(new Error('Invalid credentials'));
    const store = createTestStore();

    const action = await store.dispatch(
      loginAsync({ email: 'ada@example.com', password: 'wrong' }),
    );

    expect(loginAsync.rejected.match(action)).toBe(true);
    expect(action.payload).toBe('Invalid credentials');
    expect(store.getState()).toMatchObject({
      isAuthLogin: false,
      error: 'Invalid credentials',
    });
  });

  it('registers a user and handles registration failures', async () => {
    authApi.register.mockResolvedValue({
      data: { user: { id: 1, name: 'Ada' } },
    });
    const store = createTestStore();
    const success = await store.dispatch(
      registerAsync({
        name: 'Ada',
        email: 'ada@example.com',
        password: 'secret',
      }),
    );

    expect(registerAsync.fulfilled.match(success)).toBe(true);
    expect(store.getState().isAuthRegister).toBe(false);

    authApi.register.mockRejectedValue(new Error('Email already used'));
    const failure = await store.dispatch(
      registerAsync({
        name: 'Ada',
        email: 'ada@example.com',
        password: 'secret',
      }),
    );

    expect(failure.payload).toBe('Email already used');
    expect(store.getState()).toMatchObject({
      isAuthRegister: false,
      error: 'Email already used',
    });
  });

  it('clears the stored token and marks the session logged out', () => {
    localStorage.setItem('accessToken', 'auth-token');
    const loggedOut = reducer(undefined, logout());

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(loggedOut.isAuthLogout).toBe(true);
  });
});
