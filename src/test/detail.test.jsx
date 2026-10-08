import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from '../App';
import authReducer from '../features/auth/states/authSlice';
import usersReducer from '../features/users/states/usersSlice';
import lostFoundReducer from '../features/lost-founds/states/lostFoundSlice';
import * as lostFoundApi from '../features/lost-founds/api/lostFoundApi';
import * as userApi from '../features/users/api/userApi';
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from '../helpers/toolsHelper';

vi.mock('../features/lost-founds/api/lostFoundApi', () => ({
  deleteLostFound: vi.fn(),
  getLostFoundById: vi.fn(),
  getLostFounds: vi.fn(),
  updateCover: vi.fn(),
  updateLostFound: vi.fn(),
}));

vi.mock('../features/users/api/userApi', () => ({
  getMe: vi.fn(),
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

const renderApp = (path = '/lost-founds/1') =>
  render(
    <Provider store={createStore()}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </Provider>,
  );

const report = {
  id: 1,
  title: 'Dompet hitam',
  description: 'Ditemukan dekat kantin',
  status: 'found',
  is_completed: 1,
  cover: '/wallet.png',
  created_at: '2026-01-01T10:00:00Z',
  user_id: 7,
  user: { id: 7, name: 'Ada', email: 'ada@example.com' },
};

describe('lost and found details', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'session-token');
    vi.clearAllMocks();
    userApi.getMe.mockResolvedValue({
      data: { user: { id: 7, name: 'Ada', email: 'ada@example.com' } },
    });
    lostFoundApi.getLostFoundById.mockResolvedValue({
      data: { lost_found: report },
    });
    lostFoundApi.getLostFounds.mockResolvedValue({
      data: { lost_founds: [] },
    });
    lostFoundApi.updateLostFound.mockResolvedValue({
      data: { lost_found: report },
    });
    lostFoundApi.updateCover.mockResolvedValue({
      data: { lost_found: { cover: '/updated.png' } },
    });
    lostFoundApi.deleteLostFound.mockResolvedValue({});
    showConfirmDialog.mockResolvedValue({ isConfirmed: false });
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:cover-preview'),
    });
  });

  it('shows a report with owner actions and handles editing', async () => {
    renderApp();

    expect(await screen.findByRole('heading', { name: 'Dompet hitam' }))
      .toBeInTheDocument();
    expect(screen.getByText('found')).toBeInTheDocument();
    expect(screen.getByText('Selesai')).toBeInTheDocument();
    expect(screen.getByAltText('Foto cover Dompet hitam')).toHaveAttribute(
      'src',
      '/wallet.png',
    );
    expect(screen.getByText('Ditemukan dekat kantin')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit laporan' }));
    expect(screen.getByRole('dialog', { name: 'Ubah Laporan' }))
      .toBeInTheDocument();
    expect(screen.getByLabelText('Judul')).toHaveValue('Dompet hitam');

    fireEvent.change(screen.getByLabelText('Judul'), {
      target: { value: 'Dompet ditemukan' },
    });
    fireEvent.change(screen.getByLabelText('Status Selesai'), {
      target: { value: '0' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));
    await waitFor(() => {
      expect(lostFoundApi.updateLostFound).toHaveBeenCalledWith(
        1,
        'Dompet ditemukan',
        'Ditemukan dekat kantin',
        'found',
        0,
      );
    });
    expect(showSuccessDialog).toHaveBeenCalledWith(
      'Sukses',
      'Laporan berhasil diperbarui',
    );
  });

  it('handles cover preview, validation, and upload', async () => {
    renderApp();
    await screen.findByRole('heading', { name: 'Dompet hitam' });

    fireEvent.click(
      screen.getByRole('button', { name: 'Ubah foto cover laporan' }),
    );
    expect(screen.getByRole('dialog', { name: 'Ubah Cover Laporan' }))
      .toBeInTheDocument();
    expect(screen.getByAltText('Pratinjau cover laporan')).toHaveAttribute(
      'src',
      '/wallet.png',
    );

    fireEvent.change(screen.getByLabelText('Pilih foto cover'), {
      target: { files: [new File(['cover'], 'cover.png')] },
    });
    expect(screen.getByAltText('Pratinjau cover laporan')).toHaveAttribute(
      'src',
      'blob:cover-preview',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Upload Cover' }));

    await waitFor(() => {
      expect(lostFoundApi.updateCover).toHaveBeenCalledWith(
        1,
        expect.any(File),
      );
    });
    expect(showSuccessDialog).toHaveBeenCalledWith(
      'Sukses',
      'Foto cover berhasil diperbarui',
    );
  });

  it('does not delete until confirmed and navigates home after deletion', async () => {
    renderApp();
    await screen.findByRole('heading', { name: 'Dompet hitam' });

    fireEvent.click(screen.getByRole('button', { name: 'Hapus laporan' }));
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(lostFoundApi.deleteLostFound).not.toHaveBeenCalled();

    showConfirmDialog.mockResolvedValueOnce({ isConfirmed: true });
    fireEvent.click(screen.getByRole('button', { name: 'Hapus laporan' }));
    expect(await screen.findByRole('heading', {
      name: 'Daftar Laporan Lost & Found',
    })).toBeInTheDocument();
    expect(lostFoundApi.deleteLostFound).toHaveBeenCalledWith('1');
    expect(showSuccessDialog).toHaveBeenCalledWith(
      'Sukses',
      'Laporan berhasil dihapus',
    );
  });

  it('shows a delete error', async () => {
    lostFoundApi.deleteLostFound.mockRejectedValueOnce(
      new Error('Delete failed'),
    );
    showConfirmDialog.mockResolvedValueOnce({ isConfirmed: true });
    renderApp();
    await screen.findByRole('heading', { name: 'Dompet hitam' });

    fireEvent.click(screen.getByRole('button', { name: 'Hapus laporan' }));

    await waitFor(() => {
      expect(showErrorDialog).toHaveBeenCalledWith('Gagal', 'Delete failed');
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Delete failed');
  });

  it('shows missing and failed report states without owner actions', async () => {
    lostFoundApi.getLostFoundById.mockResolvedValueOnce({
      data: {
        lost_found: {
          ...report,
          id: 4,
          cover: null,
          user: null,
          user_id: 99,
          is_completed: 0,
        },
      },
    });
    renderApp('/lost-founds/4');

    expect(await screen.findByText('Tidak ada foto cover'))
      .toBeInTheDocument();
    expect(screen.getByText('Belum Selesai')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit laporan' }))
      .not.toBeInTheDocument();

    lostFoundApi.getLostFoundById.mockResolvedValueOnce({
      data: { lost_found: null },
    });

    renderApp('/lost-founds/5');
    expect(await screen.findByText('Laporan tidak ditemukan.'))
      .toBeInTheDocument();

    lostFoundApi.getLostFoundById.mockRejectedValueOnce(
      new Error('Report unavailable'),
    );
    renderApp('/lost-founds/6');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Report unavailable',
    );
  });

  it('shows the no-cover placeholder in the cover editor', async () => {
    lostFoundApi.getLostFoundById.mockResolvedValueOnce({
      data: {
        lost_found: { ...report, cover: null },
      },
    });
    renderApp();
    await screen.findByRole('heading', { name: 'Dompet hitam' });
    fireEvent.click(
      screen.getByRole('button', { name: 'Ubah foto cover laporan' }),
    );

    expect(screen.getByText('Belum ada cover')).toBeInTheDocument();
  });

  it('shows validation and API errors in the edit modal', async () => {
    renderApp();
    await screen.findByRole('heading', { name: 'Dompet hitam' });
    fireEvent.click(screen.getByRole('button', { name: 'Edit laporan' }));

    fireEvent.change(screen.getByLabelText('Judul'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));
    expect(showErrorDialog).toHaveBeenCalledWith(
      'Error',
      'Judul dan deskripsi harus diisi',
    );

    lostFoundApi.updateLostFound.mockRejectedValueOnce(
      new Error('Update failed'),
    );
    fireEvent.change(screen.getByLabelText('Judul'), {
      target: { value: 'Revised title' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));
    await waitFor(() => {
      expect(showErrorDialog).toHaveBeenCalledWith('Gagal', 'Update failed');
    });
  });

  it('validates a cover upload and displays upload failures', async () => {
    renderApp();
    await screen.findByRole('heading', { name: 'Dompet hitam' });
    fireEvent.click(
      screen.getByRole('button', { name: 'Ubah foto cover laporan' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Upload Cover' }));
    expect(showErrorDialog).toHaveBeenCalledWith(
      'Error',
      'Pilih file cover terlebih dahulu',
    );

    lostFoundApi.updateCover.mockRejectedValueOnce(
      new Error('Upload failed'),
    );
    fireEvent.change(screen.getByLabelText('Pilih foto cover'), {
      target: { files: [new File(['cover'], 'cover.png')] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Upload Cover' }));
    await waitFor(() => {
      expect(showErrorDialog).toHaveBeenCalledWith('Gagal', 'Upload failed');
    });
  });
});
