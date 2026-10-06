import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateMeAsync,
  updatePhotoAsync,
  updatePasswordAsync,
} from '../states/usersSlice';
import useInput from '../../../hooks/useInput';
import {
  showErrorDialog,
  showSuccessDialog,
} from '../../../helpers/toolsHelper';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const {
    profile,
    isChangeProfile,
    isChangeProfilePhoto,
    isChangeProfilePassword,
  } = useSelector((state) => state.users);

  const [name, onNameChange] = useInput(profile?.name || '');
  const [oldPassword, onOldPasswordChange, resetOldPassword] = useInput('');
  const [newPassword, onNewPasswordChange, resetNewPassword] = useInput('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name) return showErrorDialog('Error', 'Nama wajib diisi');

    const res = await dispatch(updateMeAsync(name));

    if (updateMeAsync.fulfilled.match(res)) {
      showSuccessDialog('Sukses', 'Profil berhasil diperbarui');
    } else {
      showErrorDialog('Gagal', res.payload);
    }
  };

  const handleUpdatePhoto = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      return showErrorDialog('Error', 'Pilih foto terlebih dahulu');
    }

    const res = await dispatch(updatePhotoAsync(selectedFile));

    if (updatePhotoAsync.fulfilled.match(res)) {
      showSuccessDialog('Sukses', 'Foto profil berhasil diperbarui');
      setSelectedFile(null);
    } else {
      showErrorDialog('Gagal', res.payload);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword) {
      return showErrorDialog(
        'Error',
        'Password lama dan baru wajib diisi'
      );
    }

    const res = await dispatch(
      updatePasswordAsync({ oldPassword, newPassword })
    );

    if (updatePasswordAsync.fulfilled.match(res)) {
      showSuccessDialog('Sukses', 'Password berhasil diperbarui');
      resetOldPassword();
      resetNewPassword();
    } else {
      showErrorDialog('Gagal', res.payload);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">
        Pengaturan Profil
      </h1>

      {/* Profile info */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Informasi Pribadi
        </h2>

        <form onSubmit={handleUpdateName} className="space-y-4">
          <div>
            <label
              htmlFor="profile-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nama
            </label>

            <input
              id="profile-name"
              name="name"
              type="text"
              value={name}
              onChange={onNameChange}
              className="w-full px-4 py-2 border rounded-lg"
              disabled={isChangeProfile}
            />
          </div>

          <div>
            <label
              htmlFor="profile-email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>

            <input
              id="profile-email"
              name="email"
              type="email"
              value={profile?.email || ''}
              disabled
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={isChangeProfile}
            aria-busy={isChangeProfile}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            {isChangeProfile ? 'Menyimpan...' : 'Simpan Nama'}
          </button>
        </form>
      </div>

      {/* Change Photo */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Ubah Foto Profil
        </h2>

        <form onSubmit={handleUpdatePhoto} className="space-y-4">
          <div className="flex items-center space-x-4">
            <img
              src={profile?.photo || 'https://via.placeholder.com/150'}
              alt="Foto profil pengguna"
              className="w-16 h-16 rounded-full object-cover border"
            />

            <div>
              <label
                htmlFor="profile-photo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pilih foto profil
              </label>

              <input
                id="profile-photo"
                name="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="text-sm text-gray-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangeProfilePhoto}
            aria-busy={isChangeProfilePhoto}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            {isChangeProfilePhoto ? 'Mengunggah...' : 'Upload Foto'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Ubah Password
        </h2>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label
              htmlFor="old-password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password Lama
            </label>

            <input
              id="old-password"
              name="oldPassword"
              type="password"
              value={oldPassword}
              onChange={onOldPasswordChange}
              className="w-full px-4 py-2 border rounded-lg"
              disabled={isChangeProfilePassword}
            />
          </div>

          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password Baru
            </label>

            <input
              id="new-password"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={onNewPasswordChange}
              className="w-full px-4 py-2 border rounded-lg"
              disabled={isChangeProfilePassword}
            />
          </div>

          <button
            type="submit"
            disabled={isChangeProfilePassword}
            aria-busy={isChangeProfilePassword}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            {isChangeProfilePassword ? 'Mengubah...' : 'Ubah Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;