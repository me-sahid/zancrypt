import { useAuthStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TopNav = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      logout();
      toast.success('Securely logged out');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="h-20 border-b border-border bg-surface-secondary/50 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary-accent transition-colors" />
          <input
            type="text"
            placeholder="Search resources, files, or nodes..."
            className="w-full h-10 pl-10 pr-4 bg-surface-elevated/50 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-accent focus:border-primary-accent transition-all"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-6">
        <div className="hidden md:flex items-center px-3 py-1.5 rounded-full bg-status-success/5 border border-status-success/20">
          <Globe className="w-4 h-4 text-status-success mr-2" />
          <span className="text-xs font-medium text-status-success">System Healthy</span>
          <div className="ml-2 w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
        </div>

        <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors hover:bg-surface-elevated rounded-lg">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-status-danger rounded-full border-2 border-surface-secondary" />
        </button>

        <div className="h-8 w-[1px] bg-border" />

        <div className="flex items-center space-x-3 group relative">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 p-1 rounded-lg hover:bg-surface-elevated transition-all border border-transparent hover:border-border"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-accent to-security flex items-center justify-center text-white font-bold text-xs">
              {getInitials(user?.fullName || user?.displayName)}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-text-primary leading-tight">{user?.fullName || user?.displayName || 'Anonymous'}</p>
              <p className="text-[10px] text-text-secondary capitalize">{user?.role || 'User'} · {user?.region || 'Global'}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
