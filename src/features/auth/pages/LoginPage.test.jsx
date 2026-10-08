import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authApi from '../api/authApi';
import authReducer from '../states/authSlice';
import LoginPage from './LoginPage';
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper';

vi.mock('../api/authApi', () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('../../../helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const renderLoginPage = () => {
  const store = configureStore({ reducer: { auth: authReducer } });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/auth/login']}>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/" element={<h1>Home page</h1>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  return store;
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the login form and validates required fields', () => {
    renderLoginPage();

    expect(screen.getByRole('heading', { name: 'Sign In to Your Account' }))
      .toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(showErrorDialog).toHaveBeenCalledWith(
      'Validation Error',
      'Email and password are required',
    );
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('shows a login error when the API rejects the credentials', async () => {
    authApi.login.mockRejectedValue(new Error('Invalid credentials'));
    renderLoginPage();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrong-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(showErrorDialog).toHaveBeenCalledWith(
        'Login Failed',
        'Invalid credentials',
      );
    });
    expect(screen.getByRole('button', { name: 'Sign In' }))
      .toBeEnabled();
  });

  it('disables the form while submitting and navigates after success', async () => {
    let resolveLogin;
    authApi.login.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      }),
    );
    renderLoginPage();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'correct-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(screen.getByRole('button', { name: 'Signing In...' }))
      .toBeDisabled();
    expect(screen.getByRole('button', { name: 'Signing In...' }))
      .toHaveAttribute('aria-busy', 'true');

    resolveLogin({ data: { token: 'login-token' } });

    expect(await screen.findByRole('heading', { name: 'Home page' }))
      .toBeInTheDocument();
    expect(showSuccessDialog).toHaveBeenCalledWith(
      'Login Success',
      'Welcome back!',
    );
    expect(localStorage.getItem('accessToken')).toBe('login-token');
    expect(authApi.login).toHaveBeenCalledWith(
      'user@example.com',
      'correct-password',
    );
  });
});
