import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from '../App';
import authReducer from '../features/auth/states/authSlice';
import usersReducer from '../features/users/states/usersSlice';
import lostFoundReducer from '../features/lost-founds/states/lostFoundSlice';
import * as userApi from '../features/users/api/userApi';
import { showErrorDialog, showSuccessDialog } from '../helpers/toolsHelper';

vi.mock('../features/users/api/userApi', () => ({
  getMe: vi.fn(),
  getUsers: vi.fn(),
  updateMe: vi.fn(),
  updatePassword: vi.fn(),
  updatePhoto: vi.fn(),
}));

vi.mock('../features/lost-founds/api/lostFoundApi', () => ({
  getLostFounds: vi.fn(),
}));

vi.mock('../helpers/toolsHelper', () => ({
  formatDate: vi.fn(() => '1 Januari 2026'),
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

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

describe('users page', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'session-token');
    vi.clearAllMocks();
    userApi.getMe.mockResolvedValue({
      data: {
        user: { id: 7, name: 'Ada', email: 'ada@example.com' },
      },
    });
    userApi.getUsers.mockResolvedValue({
      data: {
        users: [
          { id: 7, name: 'Ada', email: 'ada@example.com' },
          { id: 8, name: 'Grace', email: 'grace@example.com', photo: '/grace.png' },
        ],
      },
    });
  });

  it('loads and displays users, including the fallback photo', async () => {
    renderApp('/users');

    expect(await screen.findByRole('heading', { name: 'Daftar Pengguna' }))
      .toBeInTheDocument();
    expect(screen.getAllByText('Ada').length).toBeGreaterThan(0);
    expect(screen.getByText('grace@example.com')).toBeInTheDocument();
    expect(screen.getByAltText('Ada')).toHaveAttribute(
      'src',
      'https://via.placeholder.com/150',
    );
    expect(screen.getByAltText('Grace')).toHaveAttribute('src', '/grace.png');
  });

  it('shows the empty and error states', async () => {
    userApi.getUsers.mockRejectedValueOnce(new Error('Unable to load users'));
    renderApp('/users');

    expect(await screen.findByText('Unable to load users')).toBeInTheDocument();
    expect(screen.getByText('Tidak ada pengguna ditemukan.'))
      .toBeInTheDocument();
  });
});

describe('profile page', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'session-token');
    vi.clearAllMocks();
    userApi.getMe.mockResolvedValue({
      data: {
        user: {
          id: 7,
          name: 'Ada',
          email: 'ada@example.com',
          photo: '/ada.png',
        },
      },
    });
    userApi.updateMe.mockResolvedValue({
      data: { user: { id: 7, name: 'Ada Lovelace', email: 'ada@example.com' } },
    });
    userApi.updatePhoto.mockResolvedValue({
      data: { user: { photo: '/new-photo.png' } },
    });
    userApi.updatePassword.mockResolvedValue({ data: { message: 'Updated' } });
  });

  it('validates and updates profile name and photo', async () => {
    renderApp('/profile');
    expect(await screen.findByRole('heading', { name: 'Pengaturan Profil' }))
      .toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nama'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Nama' }));
    expect(showErrorDialog).toHaveBeenCalledWith('Error', 'Nama wajib diisi');

    fireEvent.change(screen.getByLabelText('Nama'), {
      target: { value: 'Ada Lovelace' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Nama' }));
    await waitFor(() => {
      expect(userApi.updateMe).toHaveBeenCalledWith('Ada Lovelace');
    });
    expect(showSuccessDialog).toHaveBeenCalledWith(
      'Sukses',
      'Profil berhasil diperbarui',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Upload Foto' }));
    expect(showErrorDialog).toHaveBeenCalledWith(
      'Error',
      'Pilih foto terlebih dahulu',
    );

    const photo = new File(['photo'], 'profile.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText('Pilih foto profil'), {
      target: { files: [photo] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Upload Foto' }));
    await waitFor(() => {
      expect(userApi.updatePhoto).toHaveBeenCalledWith(photo);
    });
    expect(showSuccessDialog).toHaveBeenCalledWith(
      'Sukses',
      'Foto profil berhasil diperbarui',
    );
  });

  it('validates and updates password, then supports logout navigation', async () => {
    renderApp('/profile');
    await screen.findByRole('heading', { name: 'Pengaturan Profil' });

    fireEvent.click(screen.getByRole('button', { name: 'Ubah Password' }));
    expect(showErrorDialog).toHaveBeenCalledWith(
      'Error',
      'Password lama dan baru wajib diisi',
    );

    fireEvent.change(screen.getByLabelText('Password Lama'), {
      target: { value: 'old-secret' },
    });
    fireEvent.change(screen.getByLabelText('Password Baru'), {
      target: { value: 'new-secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Ubah Password' }));
    await waitFor(() => {
      expect(userApi.updatePassword).toHaveBeenCalledWith(
        'old-secret',
        'new-secret',
      );
    });
    expect(showSuccessDialog).toHaveBeenCalledWith(
      'Sukses',
      'Password berhasil diperbarui',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
    expect(
      await screen.findByRole('heading', { name: 'Sign In to Your Account' }),
    ).toBeInTheDocument();
  });

  it('shows API failures from profile update actions', async () => {
    userApi.updateMe.mockRejectedValueOnce(new Error('Name failed'));
    userApi.updatePhoto.mockRejectedValueOnce(new Error('Photo failed'));
    userApi.updatePassword.mockRejectedValueOnce(new Error('Password failed'));
    renderApp('/profile');
    await screen.findByRole('heading', { name: 'Pengaturan Profil' });

    fireEvent.change(screen.getByLabelText('Nama'), {
      target: { value: 'Ada' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Nama' }));
    await waitFor(() => {
      expect(showErrorDialog).toHaveBeenCalledWith('Gagal', 'Name failed');
    });

    fireEvent.change(screen.getByLabelText('Pilih foto profil'), {
      target: { files: [new File(['x'], 'photo.png')] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Upload Foto' }));
    await waitFor(() => {
      expect(showErrorDialog).toHaveBeenCalledWith('Gagal', 'Photo failed');
    });

    fireEvent.change(screen.getByLabelText('Password Lama'), {
      target: { value: 'old' },
    });
    fireEvent.change(screen.getByLabelText('Password Baru'), {
      target: { value: 'new' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Ubah Password' }));
    await waitFor(() => {
      expect(showErrorDialog).toHaveBeenCalledWith(
        'Gagal',
        'Password failed',
      );
    });
  });
});
