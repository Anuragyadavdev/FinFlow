import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiMoon, FiSun, FiBell, FiUser } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import Button from '../ui/Button';

import { useUnreadNotifications } from '../../hooks/queries/useNotifications';

export default function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();

  //change
  const { data: unread = 0 } = useUnreadNotifications();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-black/20 backdrop-blur-xl">
      <div className="lg:hidden">
        <span className="text-lg font-bold text-gradient">FinFlow</span>
      </div>

      <div className="hidden lg:flex flex-1" />

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="rounded-xl p-2.5 text-gray-400 hover:text-white hover:bg-white/5 transition"
          title="Toggle theme"
        >
          {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

//change
        <button
          onClick={() => navigate('/notifications')}
          className="relative rounded-xl p-2.5 text-gray-400 hover:text-white hover:bg-white/5 transition"
          title="Notifications"
        >
        <FiBell size={18} />
        {unread > 0 && (
        <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-accent-red text-white text-[10px] font-bold flex items-center justify-center">
        {unread > 9 ? '9+' : unread}
        </span>
        )}
        </button>

        <div className="flex items-center gap-3 pl-3 ml-2 border-l border-white/10">
          <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-semibold text-white">
            {user?.fullName?.charAt(0)?.toUpperCase() || <FiUser />}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-tight">
              {user?.fullName || 'User'}
            </p>
            <p className="text-xs text-gray-500 leading-tight">
              {user?.email || ''}
            </p>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <FiLogOut size={16} />
        </Button>
      </div>
    </header>
  );
}