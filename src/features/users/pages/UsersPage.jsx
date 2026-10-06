import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsersAsync } from '../states/usersSlice';

const UsersPage = () => {
  const dispatch = useDispatch();
  const { users, isProfile, error } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(getUsersAsync());
  }, [dispatch]);

  if (isProfile) {
    return <div className="p-4 text-center">Loading users...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Daftar Pengguna</h1>
      {error && <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
      
      {users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Tidak ada pengguna ditemukan.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <img
                src={user.photo || 'https://via.placeholder.com/150'}
                alt={user.name}
                className="w-14 h-14 rounded-full object-cover border"
              />
              <div>
                <h3 className="font-semibold text-gray-800">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersPage;
