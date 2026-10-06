import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getLostFoundsAsync } from '../states/lostFoundSlice';
import AddModal from '../modals/AddModal';
import { formatDate } from '../../../helpers/toolsHelper';
import { FiPlus, FiSearch } from 'react-icons/fi';

const HomePage = () => {
  const dispatch = useDispatch();
  const { lostFounds, isLostFound, error } = useSelector(
    (state) => state.lostFounds
  );

  const [filterStatus, setFilterStatus] = useState('');
  const [filterCompleted, setFilterCompleted] = useState('');
  const [filterMe, setFilterMe] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    dispatch(
      getLostFoundsAsync({
        status: filterStatus,
        is_completed: filterCompleted,
        is_me: filterMe ? 1 : undefined,
      })
    );
  }, [dispatch, filterStatus, filterCompleted, filterMe]);

  const filteredData = lostFounds.filter((item) => {
    return (
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalCount = lostFounds.length;
  const lostCount = lostFounds.filter(
    (item) => item.status === 'lost'
  ).length;
  const foundCount = lostFounds.filter(
    (item) => item.status === 'found'
  ).length;
  const completedCount = lostFounds.filter(
    (item) => item.is_completed
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Daftar Laporan Lost & Found
        </h1>

        <button
          type="button"
          aria-label="Tambah laporan lost and found"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <FiPlus
            className="w-5 h-5"
            aria-hidden="true"
          />
          <span>Tambah Laporan</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-600">
            Total Laporan
          </p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {totalCount}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-red-600">
            Barang Hilang
          </p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {lostCount}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-green-700">
            Barang Ditemukan
          </p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            {foundCount}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-blue-700">
            Selesai
          </p>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {completedCount}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select
            name="filter-status"
            aria-label="Filter jenis laporan"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="">Semua Jenis</option>
            <option value="lost">Lost (Hilang)</option>
            <option value="found">Found (Ditemukan)</option>
          </select>

          <select
            name="filter-completed"
            aria-label="Filter status laporan"
            value={filterCompleted}
            onChange={(e) => setFilterCompleted(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="">Semua Status</option>
            <option value="1">Selesai</option>
            <option value="0">Belum Selesai</option>
          </select>

          <label
            htmlFor="filter-my-reports"
            className="flex items-center space-x-2 text-sm text-gray-600 border px-3 py-2 rounded-lg cursor-pointer bg-white"
          >
            <input
              id="filter-my-reports"
              name="filter-my-reports"
              type="checkbox"
              checked={!!filterMe}
              onChange={(e) =>
                setFilterMe(e.target.checked ? '1' : '')
              }
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Milik Saya</span>
          </label>
        </div>

        <div className="relative w-full md:w-64">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4"
            aria-hidden="true"
          />

          <input
            type="search"
            name="search"
            aria-label="Cari laporan lost and found"
            placeholder="Cari laporan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Reports Grid/List */}
      {isLostFound ? (
        <div
          className="text-center py-12 text-gray-600"
          role="status"
          aria-live="polite"
        >
          Memuat laporan...
        </div>
      ) : error ? (
        <div
          className="p-4 bg-red-100 text-red-700 rounded-lg"
          role="alert"
        >
          {error}
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-12 text-gray-600 bg-white rounded-xl border border-dashed">
          Tidak ada laporan yang sesuai.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
            >
              <div className="h-48 bg-gray-100 relative">
                {item.cover ? (
                  <img
                    src={item.cover}
                    alt={
                      item.title ||
                      'Foto laporan lost and found'
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-gray-600"
                    role="img"
                    aria-label="Tidak ada foto laporan"
                  >
                    Tidak Ada Foto
                  </div>
                )}

                <div className="absolute top-3 left-3 flex gap-2">
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase ${
                      item.status === 'lost'
                        ? 'bg-red-600 text-white'
                        : 'bg-green-700 text-white'
                    }`}
                  >
                    {item.status}
                  </span>

                  {item.is_completed ? (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-700 text-white">
                      Selesai
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="font-bold text-lg text-gray-800 line-clamp-1">
                    {item.title}
                  </h2>

                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    {formatDate(item.created_at)}
                  </span>

                  <Link
                    to={`/lost-founds/${item.id}`}
                    aria-label={`Lihat detail laporan ${item.title || ''}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Detail &rarr;
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;