import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateLostFoundAsync } from '../states/lostFoundSlice';
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper';

const ChangeModal = ({ isOpen, onClose, data }) => {
  const dispatch = useDispatch();
  const { isLostFoundChange } = useSelector((state) => state.lostFounds);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('lost');
  const [isCompleted, setIsCompleted] = useState(0);

  useEffect(() => {
    if (data) {
      setTitle(data.title || '');
      setDescription(data.description || '');
      setStatus(data.status || 'lost');
      setIsCompleted(data.is_completed ? 1 : 0);
    }
  }, [data]);

  if (!isOpen || !data) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      return showErrorDialog('Error', 'Judul dan deskripsi harus diisi');
    }

    const res = await dispatch(
      updateLostFoundAsync({
        id: data.id,
        title,
        description,
        status,
        is_completed: isCompleted,
      })
    );

    if (updateLostFoundAsync.fulfilled.match(res)) {
      showSuccessDialog('Sukses', 'Laporan berhasil diperbarui');
      onClose();
    } else {
      showErrorDialog('Gagal', res.payload);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Ubah Laporan</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={isLostFoundChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Laporan</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={isLostFoundChange}
            >
              <option value="lost">Lost (Kehilangan)</option>
              <option value="found">Found (Penemuan)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Selesai</label>
            <select
              value={isCompleted}
              onChange={(e) => setIsCompleted(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={isLostFoundChange}
            >
              <option value={0}>Belum Selesai</option>
              <option value={1}>Selesai</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={isLostFoundChange}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
              disabled={isLostFoundChange}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLostFoundChange}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {isLostFoundChange ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeModal;
