import { NavLink } from 'react-router-dom';
import { FiHome, FiUsers, FiUser } from 'react-icons/fi';

const SidebarComponent = () => {
  const navItems = [
    { to: '/', label: 'Laporan', icon: FiHome },
    { to: '/users', label: 'Pengguna', icon: FiUsers },
    { to: '/profile', label: 'Profil Saya', icon: FiUser },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-57px)] p-4 hidden md:block">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default SidebarComponent;
