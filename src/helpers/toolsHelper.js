import Swal from 'sweetalert2';

export const showSuccessDialog = (title, text = '') => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonColor: '#3b82f6', // Tailwind blue-500
  });
};

export const showErrorDialog = (title, text = '') => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor: '#ef4444', // Tailwind red-500
  });
};

export const showConfirmDialog = (title, text = '') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280', // Tailwind gray-500
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel'
  });
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
