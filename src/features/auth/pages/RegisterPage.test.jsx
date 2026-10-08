import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authApi from '../api/authApi';
import authReducer from '../states/authSlice';
import RegisterPage from './RegisterPage';
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper';

vi.mock('../api/authApi', () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('../../../helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const renderRegisterPage = () => {
  const store = configureStore({ reducer: { auth: authReducer } });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/auth/register']}>
        <Routes>
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/login" element={<h1>Sign in page</h1>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  return store;
};

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration fields and validates required values', () => {
    renderRegisterPage();

    expect(screen.getByRole('heading', { name: 'Create an Account' }))
      .toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(showErrorDialog).toHaveBeenCalledWith(
      'Validation Error',
      'All fields are required',
    );
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it('shows a registration error when the API rejects the details', async () => {
    authApi.register.mockRejectedValue(new Error('Email is already registered'));
    renderRegisterPage();

    fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
      target: { value: 'Ada' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'ada@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(showErrorDialog).toHaveBeenCalledWith(
        'Registration Failed',
        'Email is already registered',
      );
    });
  });

  it('disables the form while submitting and navigates after success', async () => {
    let resolveRegistration;
    authApi.register.mockReturnValue(
      new Promise((resolve) => {
        resolveRegistration = resolve;
      }),
    );
    renderRegisterPage();

    fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
      target: { value: 'Ada' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'ada@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(screen.getByRole('button', { name: 'Signing Up...' }))
      .toBeDisabled();

    resolveRegistration({ data: { id: 1 } });

    expect(await screen.findByRole('heading', { name: 'Sign in page' }))
      .toBeInTheDocument();
    expect(showSuccessDialog).toHaveBeenCalledWith(
      'Registration Success',
      'You can now sign in with your account',
    );
    expect(authApi.register).toHaveBeenCalledWith(
      'Ada',
      'ada@example.com',
      'secret',
    );
  });
});
