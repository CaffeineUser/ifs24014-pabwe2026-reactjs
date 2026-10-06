import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';
import { getAccessToken } from '../../../helpers/apiHelper';
import { getMeAsync } from '../../users/states/usersSlice';
import NavbarComponent from '../components/NavbarComponent';
import SidebarComponent from '../components/SidebarComponent';

const LostFoundLayout = () => {
  const dispatch = useDispatch();
  const token = getAccessToken();
  const { profile } = useSelector((state) => state.users);

  useEffect(() => {
    if (token && !profile) {
      dispatch(getMeAsync());
    }
  }, [dispatch, token, profile]);

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavbarComponent />

      <div className="flex flex-1">
        <SidebarComponent />

        <main
          className="flex-1 p-6"
          id="main-content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LostFoundLayout;