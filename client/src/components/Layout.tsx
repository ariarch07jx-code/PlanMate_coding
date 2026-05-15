import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: '仪表盘', icon: '📊' },
  { to: '/plans', label: '计划', icon: '📋' },
  { to: '/countdown', label: '倒计时', icon: '⏳' },
  { to: '/pomodoro', label: '番茄钟', icon: '🍅' },
  { to: '/expenses', label: '支出', icon: '💰' },
  { to: '/friends', label: '好友', icon: '👥' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-30">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-indigo-600">PlanMate</h1>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <NavLink
            to="/me"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-medium text-indigo-600">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            {user?.username}
          </NavLink>
          <button onClick={handleLogout} className="w-full mt-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-56 p-6">
        <Outlet />
      </main>
    </div>
  );
}
