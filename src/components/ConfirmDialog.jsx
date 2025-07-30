'use client';
import Swal from 'sweetalert2';

export const showConfirmDialog = async ({
  title = 'Are you sure?',
  text = 'This action cannot be undone.',
  confirmButtonText = 'Yes',
  cancelButtonText = 'Cancel',
} = {}) => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#2563eb', 
    cancelButtonColor: '#ef4444',   
    confirmButtonText,
    cancelButtonText,
    buttonsStyling: false,
    customClass: {
      popup: 'modern-popup',
      title: 'modern-title',
      content: 'modern-content',
      confirmButton: 'modern-confirm-button',
      cancelButton: 'modern-cancel-button',
    },
    showClass: {
      popup: 'swal2-show-modern',
    },
    hideClass: {
      popup: 'swal2-hide-modern',
    },
  });

  return result.isConfirmed;
};
