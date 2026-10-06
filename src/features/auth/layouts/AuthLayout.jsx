import { Outlet, Navigate } from 'react-router-dom';
import { getAccessToken } from '../../../helpers/apiHelper';

const AuthLayout = () => {
  const token = getAccessToken();

  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <header className="bg-blue-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Lost & Found</h1>
          <p className="text-blue-100 mt-2">
            Find what you lost, return what you found.
          </p>
        </header>

        <section className="p-8" aria-label="Authentication">
          <Outlet />
        </section>
      </div>
    </main>
  );
};

export default AuthLayout;