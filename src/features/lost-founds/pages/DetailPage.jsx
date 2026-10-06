import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getLostFoundByIdAsync,
  deleteLostFoundAsync,
} from '../states/lostFoundSlice';
import ChangeModal from '../modals/ChangeModal';
import ChangeCoverModal from '../modals/ChangeCoverModal';
import {
  formatDate,
  showConfirmDialog,
  showSuccessDialog,
  showErrorDialog,
} from '../../../helpers/toolsHelper';
import {
  FiEdit3,
  FiTrash2,
  FiImage,
  FiArrowLeft,
} from 'react-icons/fi';

const DetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { lostFound, isLostFound, error } = useSelector(
    (state) => state.lostFounds
  );
  const { profile } = useSelector((state) => state.users);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCoverOpen, setIsCoverOpen] = useState(false);

  useEffect(() => {
    dispatch(getLostFoundByIdAsync(id));
  }, [dispatch, id]);

  const handleDelete = async () => {
    const confirm = await showConfirmDialog(
      'Hapus Laporan',
      'Apakah Anda yakin ingin menghapus laporan ini?'
    );

    if (confirm.isConfirmed) {
      const res = await dispatch(deleteLostFoundAsync(id));

      if (deleteLostFoundAsync.fulfilled.match(res)) {
        showSuccessDialog('Sukses', 'Laporan berhasil dihapus');
        navigate('/');
      } else {
        showErrorDialog('Gagal', res.payload);
      }
    }
  };

  if (isLostFound) {
    return (
      <div
        className="p-6 text-center"
        role="status"
        aria-live="polite"
      >
        Memuat detail laporan...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-6 text-red-600"
        role="alert"
      >
        {error}
      </div>
    );
  }

  if (!lostFound) {
    return (
      <div className="p-6 text-gray-500">
        Laporan tidak ditemukan.
      </div>
    );
  }

  const isOwner =
    profile?.id === lostFound.user_id ||
    profile?.id === lostFound.user?.id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
      >
        <FiArrowLeft
          className="w-4 h-4"
          aria-hidden="true"
        />
        <span>Kembali ke Daftar</span>
      </Link>

      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cover Image */}
        <div className="h-72 bg-gray-100 relative">
          {lostFound.cover ? (
            <img
              src={lostFound.cover}
              alt={`Foto cover ${lostFound.title || 'laporan lost and found'}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-gray-400"
              role="img"
              aria-label="Tidak ada foto cover"
            >
              Tidak ada foto cover
            </div>
          )}

          <div className="absolute top-4 left-4 flex gap-2">
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                lostFound.status === 'lost'
                  ? 'bg-red-500 text-white'
                  : 'bg-green-500 text-white'
              }`}
            >
              {lostFound.status}
            </span>

            <span
              className={`px-3 py-1 text-xs font-bold rounded-full text-white ${
                lostFound.is_completed
                  ? 'bg-blue-600'
                  : 'bg-amber-500'
              }`}
            >
              {lostFound.is_completed
                ? 'Selesai'
                : 'Belum Selesai'}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {lostFound.title}
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Diposting pada {formatDate(lostFound.created_at)}
              </p>
            </div>

            {/* Actions for owner */}
            {isOwner && (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  aria-label="Ubah foto cover laporan"
                  onClick={() => setIsCoverOpen(true)}
                  className="flex items-center space-x-1 border px-3 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FiImage
                    className="w-4 h-4"
                    aria-hidden="true"
                  />
                  <span>Cover</span>
                </button>

                <button
                  type="button"
                  aria-label="Edit laporan"
                  onClick={() => setIsEditOpen(true)}
                  className="flex items-center space-x-1 border px-3 py-1.5 rounded-lg text-sm text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <FiEdit3
                    className="w-4 h-4"
                    aria-hidden="true"
                  />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  aria-label="Hapus laporan"
                  onClick={handleDelete}
                  className="flex items-center space-x-1 border px-3 py-1.5 rounded-lg text-sm text-red-600 border-red-200 hover:bg-red-50"
                >
                  <FiTrash2
                    className="w-4 h-4"
                    aria-hidden="true"
                  />
                  <span>Hapus</span>
                </button>
              </div>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-gray-800 mb-2">
              Deskripsi Lengkap
            </h2>

            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {lostFound.description}
            </p>
          </div>

          {lostFound.user && (
            <div className="bg-gray-50 p-4 rounded-xl flex items-center space-x-4">
              <img
                src={
                  lostFound.user.photo ||
                  'https://via.placeholder.com/150'
                }
                alt={`Foto profil ${lostFound.user.name || 'pelapor'}`}
                className="w-12 h-12 rounded-full object-cover border"
              />

              <div>
                <p className="text-xs text-gray-500">
                  Pelapor
                </p>

                <h2 className="font-semibold text-gray-800">
                  {lostFound.user.name}
                </h2>

                <p className="text-xs text-gray-500">
                  {lostFound.user.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </article>

      <ChangeModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        data={lostFound}
      />

      <ChangeCoverModal
        isOpen={isCoverOpen}
        onClose={() => setIsCoverOpen(false)}
        id={lostFound.id}
        currentCover={lostFound.cover}
      />
    </div>
  );
};

export default DetailPage;