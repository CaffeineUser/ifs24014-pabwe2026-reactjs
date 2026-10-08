import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from '../App';
import authReducer from '../features/auth/states/authSlice';
import usersReducer from '../features/users/states/usersSlice';
import lostFoundReducer from '../features/lost-founds/states/lostFoundSlice';
import * as authApi from '../features/auth/api/authApi';
import * as lostFoundApi from '../features/lost-founds/api/lostFoundApi';
import * as userApi from '../features/users/api/userApi';
import { showErrorDialog, showSuccessDialog } from '../helpers/toolsHelper';

vi.mock('../features/auth/api/authApi', () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('../features/lost-founds/api/lostFoundApi', () => ({
  addLostFound: vi.fn(),
  deleteLostFound: vi.fn(),
  getLostFoundById: vi.fn(),
  getLostFounds: vi.fn(),
  updateCover: vi.fn(),
  updateLostFound: vi.fn(),
}));

vi.mock('../features/users/api/userApi', () => ({
  getMe: vi.fn(),
  getUsers: vi.fn(),
  updateMe: vi.fn(),
  updatePassword: vi.fn(),
  updatePhoto: vi.fn(),
}));

vi.mock('../helpers/toolsHelper', () => ({
  formatDate: vi.fn(() => '1 Januari 2026 pukul 10.00'),
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const reports = [
  {
    id: 1,
    title: 'Dompet hitam',
    description: 'Hilang di perpustakaan',
    status: 'lost',
    is_completed: 1,
    created_at: '2026-01-01T10:00:00Z',
    user_id: 7,
  },
  {
    id: 2,
    title: 'Kunci biru',
    description: 'Ditemukan di taman',
    status: 'found',
    is_completed: 0,
    cover: '/key.png',
    created_at: '2026-01-02T10:00:00Z',
    user_id: 8,
  },
];

const createStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      users: usersReducer,
      lostFounds: lostFoundReducer,
    },
  });

const renderApp = (path) =>
  render(
    <Provider store={createStore()}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </Provider>,
  );

describe('application routes and authentication', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    authApi.login.mockResolvedValue({ data: { token: 'session-token' } });
    authApi.register.mockResolvedValue({ data: { user: { id: 7 } } });
    userApi.getMe.mockResolvedValue({
      data: { user: { id: 7, name: 'Ada', email: 'ada@example.com' } },
    });
    userApi.getUsers.mockResolvedValue({ data: { users: [] } });
    lostFoundApi.getLostFounds.mockResolvedValue({
      data: { lost_founds: reports },
    });
    lostFoundApi.addLostFound.mockResolvedValue({ data: { id: 3 } });
  });

  it('renders the auth layout and redirects protected routes to sign in', async () => {
    renderApp('/unknown-route');

    expect(
      await screen.findByRole('heading', { name: 'Sign In to Your Account' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Find what you lost, return what you found.'))
      .toBeInTheDocument();
  });

  it('redirects an authenticated visitor away from the auth pages', async () => {
    localStorage.setItem('accessToken', 'session-token');
    renderApp('/auth/login');

    expect(
      await screen.findByRole('heading', {
        name: 'Daftar Laporan Lost & Found',
      }),
    ).toBeInTheDocument();
  });

  it('validates login fields and handles login failure', async () => {
    renderApp('/auth/login');

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(showErrorDialog).toHaveBeenCalledWith(
      'Validation Error',
      'Email and password are required',
    );

    authApi.login.mockRejectedValueOnce(new Error('Invalid credentials'));
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'ada@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(showErrorDialog).toHaveBeenCalledWith(
        'Login Failed',
        'Invalid credentials',
      );
    });
  });

  it('logs in and loads the protected home page', async () => {
    renderApp('/auth/login');
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'ada@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(
      await screen.findByRole('heading', {
        name: 'Daftar Laporan Lost & Found',
      }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Dompet hitam')).toBeInTheDocument();
    expect(screen.getByText('Kunci biru')).toBeInTheDocument();
    expect(screen.getByLabelText('Delcom Lost & Found - Beranda'))
      .toBeInTheDocument();
    expect(await screen.findByText('Ada')).toBeInTheDocument();
    expect(authApi.login).toHaveBeenCalledWith('ada@example.com', 'secret');
    expect(lostFoundApi.getLostFounds).toHaveBeenCalled();
  });

  it('validates registration and navigates to login after success', async () => {
    renderApp('/auth/register');

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    expect(showErrorDialog).toHaveBeenCalledWith(
      'Validation Error',
      'All fields are required',
    );

    fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
      target: { value: 'Ada' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'ada@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), {
      target: { value: 'secret' },
    });

    authApi.register.mockRejectedValueOnce(new Error('Registration failed'));
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    await waitFor(() => {
      expect(showErrorDialog).toHaveBeenCalledWith(
        'Registration Failed',
        'Registration failed',
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(
      await screen.findByRole('heading', { name: 'Sign In to Your Account' }),
    ).toBeInTheDocument();
    expect(showSuccessDialog).toHaveBeenCalledWith(
      'Registration Success',
      'You can now sign in with your account',
    );
  });
});

describe('lost and found home page', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'session-token');
    vi.clearAllMocks();
    userApi.getMe.mockResolvedValue({
      data: { user: { id: 7, name: 'Ada', email: 'ada@example.com' } },
    });
    lostFoundApi.getLostFounds.mockResolvedValue({
      data: { lost_founds: reports },
    });
    lostFoundApi.addLostFound.mockResolvedValue({ data: { id: 3 } });
  });

  it('filters reports, searches, and opens the add report modal', async () => {
    renderApp('/');
    expect(await screen.findByText('Dompet hitam')).toBeInTheDocument();
    expect(screen.getByText('2', { selector: 'p' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Filter jenis laporan'), {
      target: { value: 'found' },
    });
    fireEvent.change(screen.getByLabelText('Filter status laporan'), {
      target: { value: '0' },
    });
    fireEvent.click(screen.getByLabelText('Milik Saya'));
    await waitFor(() => {
      expect(lostFoundApi.getLostFounds).toHaveBeenLastCalledWith({
        status: 'found',
        is_completed: '0',
        is_me: 1,
      });
    });

    fireEvent.change(screen.getByLabelText('Cari laporan lost and found'), {
      target: { value: 'biru' },
    });
    expect(screen.getByText('Kunci biru')).toBeInTheDocument();
    expect(screen.queryByText('Dompet hitam')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Cari laporan lost and found'), {
      target: { value: 'not found' },
    });
    expect(screen.getByText('Tidak ada laporan yang sesuai.'))
      .toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Tambah laporan lost and found' }),
    );
    expect(
      screen.getByRole('dialog', { name: 'Tambah Laporan Baru' }),
    ).toBeInTheDocument();
  });

  it('submits a new report and closes the modal', async () => {
    renderApp('/');
    await screen.findByText('Dompet hitam');
    fireEvent.click(
      screen.getByRole('button', { name: 'Tambah laporan lost and found' }),
    );
    fireEvent.change(screen.getByLabelText('Judul'), {
      target: { value: '  Kartu mahasiswa  ' },
    });
    fireEvent.change(screen.getByLabelText('Jenis Laporan'), {
      target: { value: 'found' },
    });
    fireEvent.change(screen.getByLabelText('Deskripsi'), {
      target: { value: '  Ditemukan di kelas  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    await waitFor(() => {
      expect(lostFoundApi.addLostFound).toHaveBeenCalledWith(
        '  Kartu mahasiswa  ',
        '  Ditemukan di kelas  ',
        'found',
      );
    });
    expect(showSuccessDialog).toHaveBeenCalledWith(
      'Sukses',
      'Laporan berhasil ditambahkan',
    );
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('shows list loading errors and validates an empty new report', async () => {
    lostFoundApi.getLostFounds.mockRejectedValueOnce(
      new Error('Reports unavailable'),
    );
    renderApp('/');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Reports unavailable',
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Tambah laporan lost and found' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(showErrorDialog).toHaveBeenCalledWith(
      'Error',
      'Judul dan deskripsi harus diisi',
    );
  });

  it('shows an API error when creating a report fails', async () => {
    lostFoundApi.addLostFound.mockRejectedValueOnce(
      new Error('Create failed'),
    );
    renderApp('/');
    await screen.findByText('Dompet hitam');
    fireEvent.click(
      screen.getByRole('button', { name: 'Tambah laporan lost and found' }),
    );
    fireEvent.change(screen.getByLabelText('Judul'), {
      target: { value: 'Kartu mahasiswa' },
    });
    fireEvent.change(screen.getByLabelText('Deskripsi'), {
      target: { value: 'Ditemukan di kelas' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    await waitFor(() => {
      expect(showErrorDialog).toHaveBeenCalledWith('Gagal', 'Create failed');
    });
  });
});
