import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addLostFoundAsync, getLostFoundsAsync } from '../states/lostFoundSlice';
import useInput from '../../../hooks/useInput';
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper';

const AddModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { isLostFoundAdd } = useSelector((state) => state.lostFounds);

  const [title, onTitleChange, resetTitle] = useInput('');
  const [description, onDescriptionChange, resetDescription] = useInput('');
  const [status, setStatus] = useState('lost');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      return showErrorDialog('Error', 'Judul dan deskripsi harus diisi');
    }

    const res = await dispatch(addLostFoundAsync({ title, description, status }));
    if (addLostFoundAsync.fulfilled.match(res)) {
      showSuccessDialog('Sukses', 'Laporan berhasil ditambahkan');
      resetTitle();
      resetDescription();
      setStatus('lost');
      dispatch(getLostFoundsAsync({}));
      onClose();
    } else {
      showErrorDialog('Gagal', res.payload);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Tambah Laporan Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
            <input
              type="text"
              value={title}
              onChange={onTitleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Contoh: Dompet Hitam Hilang"
              disabled={isLostFoundAdd}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Laporan</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={isLostFoundAdd}
            >
              <option value="lost">Lost (Kehilangan)</option>
              <option value="found">Found (Penemuan)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              value={description}
              onChange={onDescriptionChange}
              rows="4"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Jelaskan rincian barang, lokasi, dan waktu..."
              disabled={isLostFoundAdd}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
              disabled={isLostFoundAdd}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLostFoundAdd}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {isLostFoundAdd ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModal;
