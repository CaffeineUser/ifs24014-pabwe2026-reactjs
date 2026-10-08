import { beforeEach, describe, expect, it, vi } from 'vitest';
import Swal from 'sweetalert2';
import {
  formatDate,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from './toolsHelper';

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

describe('dialog helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Swal.fire.mockResolvedValue({ isConfirmed: true });
  });

  it('shows a success dialog and returns the SweetAlert result', async () => {
    const result = await showSuccessDialog('Berhasil', 'Data tersimpan');

    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'success',
      title: 'Berhasil',
      text: 'Data tersimpan',
      confirmButtonColor: '#3b82f6',
    });
    expect(result).toEqual({ isConfirmed: true });
  });

  it('uses empty text by default for a success dialog', () => {
    showSuccessDialog('Berhasil');

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Berhasil', text: '' }),
    );
  });

  it('shows an error dialog', () => {
    showErrorDialog('Gagal', 'Terjadi kesalahan');

    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Gagal',
      text: 'Terjadi kesalahan',
      confirmButtonColor: '#ef4444',
    });
  });

  it('shows a confirmation dialog with cancel controls', () => {
    showConfirmDialog('Hapus data', 'Tindakan ini tidak dapat dibatalkan');

    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'warning',
      title: 'Hapus data',
      text: 'Tindakan ini tidak dapat dibatalkan',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    });
  });

  it('uses empty text by default for a confirmation dialog', () => {
    showConfirmDialog('Lanjutkan?');

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Lanjutkan?', text: '' }),
    );
  });
});

describe('formatDate', () => {
  it('returns an empty string when no date is provided', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate(null)).toBe('');
  });

  it('formats a date using the Indonesian locale', () => {
    const formattedDate = formatDate('2024-01-15T12:05:00.000Z');

    expect(formattedDate).toContain('15');
    expect(formattedDate).toContain('Januari');
    expect(formattedDate).toContain('2024');
  });
});
