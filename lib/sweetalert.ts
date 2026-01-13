import Swal from "sweetalert2";

export const showSuccess = (title: string, text?: string) => {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor: "#1e3a5f",
    timer: 2000,
    timerProgressBar: true,
  });
};

export const showError = (title: string, text?: string) => {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "#1e3a5f",
  });
};

export const showConfirmDelete = async (itemName: string = "item") => {
  const result = await Swal.fire({
    title: "Apakah Anda yakin?",
    text: `Data ${itemName} akan dihapus permanen!`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
    reverseButtons: true,
  });
  return result.isConfirmed;
};

export const showLoading = (title: string = "Memproses...") => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const closeLoading = () => {
  Swal.close();
};
