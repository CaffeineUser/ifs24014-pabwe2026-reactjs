import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../../auth/states/authSlice';
import { FiLogOut, FiUser } from 'react-icons/fi';

const NavbarComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile } = useSelector((state) => state.users);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  return (
    <nav
      className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30"
      aria-label="Navigasi utama"
    >
      <Link
        to="/"
        className="flex items-center space-x-2"
        aria-label="Delcom Lost & Found - Beranda"
      >
        <div
          className="bg-blue-600 text-white font-bold px-3 py-1 rounded-lg text-lg"
          aria-hidden="true"
        >
          L&F
        </div>

        <span className="font-bold text-gray-800 text-xl hidden sm:inline">
          Delcom Lost & Found
        </span>
      </Link>

      <div className="flex items-center space-x-4">
        {profile && (
          <Link
            to="/profile"
            className="flex items-center space-x-2 hover:opacity-80"
            aria-label={`Buka profil ${profile.name}`}
          >
            <img
              src={
                profile.photo ||
                'https://via.placeholder.com/150'
              }
              alt={`Foto profil ${profile.name}`}
              className="w-8 h-8 rounded-full object-cover border"
            />

            <span className="text-sm font-medium text-gray-700 hidden md:inline">
              {profile.name}
            </span>
          </Link>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50"
        >
          <FiLogOut
            className="w-4 h-4"
            aria-hidden="true"
          />

          <span className="hidden sm:inline">
            Logout
          </span>
        </button>
      </div>
    </nav>
  );
};

export default NavbarComponent;