import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateCoverAsync } from '../states/lostFoundSlice';
import {
  showErrorDialog,
  showSuccessDialog,
} from '../../../helpers/toolsHelper';

const ChangeCoverModal = ({
  isOpen,
  onClose,
  id,
  currentCover,
}) => {
  const dispatch = useDispatch();
  const { isLostFoundChangeCover } = useSelector(
    (state) => state.lostFounds
  );

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      return showErrorDialog(
        'Error',
        'Pilih file cover terlebih dahulu'
      );
    }

    const res = await dispatch(
      updateCoverAsync({
        id,
        coverFile: selectedFile,
      })
    );

    if (updateCoverAsync.fulfilled.match(res)) {
      showSuccessDialog(
        'Sukses',
        'Foto cover berhasil diperbarui'
      );
      onClose();
    } else {
      showErrorDialog('Gagal', res.payload);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      role="presentation"
    >
      <div
        className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-cover-title"
      >
        <h2
          id="change-cover-title"
          className="text-xl font-bold mb-4 text-gray-800"
        >
          Ubah Cover Laporan
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="flex flex-col items-center">
            <div
              className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border mb-3 flex items-center justify-center"
              aria-label="Pratinjau cover laporan"
            >
              {preview || currentCover ? (
                <img
                  src={preview || currentCover}
                  alt="Pratinjau cover laporan"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-sm">
                  Belum ada cover
                </span>
              )}
            </div>

            <label
              htmlFor="change-cover-file"
              className="block text-sm font-medium text-gray-700 mb-1 w-full"
            >
              Pilih foto cover
            </label>

            <input
              id="change-cover-file"
              name="cover"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm text-gray-500 w-full"
              disabled={isLostFoundChangeCover}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
              disabled={isLostFoundChangeCover}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isLostFoundChangeCover}
              aria-busy={isLostFoundChangeCover}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {isLostFoundChangeCover
                ? 'Mengunggah...'
                : 'Upload Cover'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeCoverModal;